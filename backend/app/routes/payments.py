import logging
import secrets

import requests
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.order import Order
from app.models.product import Product
from app.schemas.order import OrderResponse
from app.schemas.payment import PaymentCreate, PaymentCreateResponse

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/payments",
    tags=["Payments"],
)

CASHFREE_BASE_URL = (
    "https://sandbox.cashfree.com/pg"
    if settings.CASHFREE_ENV != "production"
    else "https://api.cashfree.com/pg"
)
CASHFREE_API_VERSION = "2023-08-01"


def _cf_headers():
    return {
        "Content-Type": "application/json",
        "x-api-version": CASHFREE_API_VERSION,
        "x-client-id": settings.CASHFREE_APP_ID,
        "x-client-secret": settings.CASHFREE_SECRET_KEY,
    }


def _cancel_and_restock(order: Order, db: Session) -> None:
    """Mark an unpaid order cancelled and put its stock back."""
    if order.status == "cancelled":
        return

    for item in order.items:
        product = db.get(Product, item.product_id)
        if product:
            product.stock = (product.stock or 0) + item.quantity

    order.status = "cancelled"
    db.commit()


def _get_order(order_id: int, db: Session) -> Order:
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")
    return order


@router.post("/create", response_model=PaymentCreateResponse)
def create_payment(payload: PaymentCreate, db: Session = Depends(get_db)):
    order = _get_order(payload.order_id, db)

    if order.payment_status == "paid":
        raise HTTPException(status_code=409, detail="This order is already paid.")

    if order.status == "cancelled":
        raise HTTPException(status_code=409, detail="This order was cancelled.")

    # Reuse the same Cashfree order if we already started a payment for it
    if order.cf_order_id and order.cf_payment_session_id:
        return PaymentCreateResponse(
            order_id=order.id,
            app_id=settings.CASHFREE_APP_ID,
            payment_session_id=order.cf_payment_session_id,
            cf_order_id=order.cf_order_id,
            amount=order.total,
            currency="INR",
            env=settings.CASHFREE_ENV,
        )

    if not settings.CASHFREE_APP_ID or not settings.CASHFREE_SECRET_KEY:
        _cancel_and_restock(order, db)
        raise HTTPException(status_code=503, detail="Payments are not configured.")

    # Cashfree's order_id must be unique, and our local order id alone could
    # collide if a payment is retried, so add a short random suffix
    cf_order_id = f"animora_{order.id}_{secrets.token_hex(4)}"

    body = {
        "order_id": cf_order_id,
        "order_amount": round(order.total, 2),
        "order_currency": "INR",
        "customer_details": {
            "customer_id": f"guest_{order.id}",
            "customer_name": order.customer_name,
            "customer_email": order.email or "guest@animora.example",
            "customer_phone": order.phone,
        },
    }

    try:
        response = requests.post(
            f"{CASHFREE_BASE_URL}/orders",
            headers=_cf_headers(),
            json=body,
            timeout=15,
        )
    except requests.RequestException:
        logger.exception("Cashfree request failed")
        _cancel_and_restock(order, db)
        raise HTTPException(status_code=502, detail="Could not reach the payment provider.")

    if response.status_code not in (200, 201):
        logger.error("Cashfree order error %s: %s", response.status_code, response.text)
        _cancel_and_restock(order, db)
        raise HTTPException(status_code=502, detail="Could not start the payment.")

    data = response.json()

    order.cf_order_id = cf_order_id
    order.cf_payment_session_id = data["payment_session_id"]
    db.commit()

    return PaymentCreateResponse(
        order_id=order.id,
        app_id=settings.CASHFREE_APP_ID,
        payment_session_id=order.cf_payment_session_id,
        cf_order_id=cf_order_id,
        amount=order.total,
        currency="INR",
        env=settings.CASHFREE_ENV,
    )


@router.get("/status/{order_id}", response_model=OrderResponse)
def check_payment_status(order_id: int, db: Session = Depends(get_db)):
    """Called by the frontend after the Cashfree popup closes.

    The popup result is never trusted on its own — this always asks
    Cashfree directly for the order's real status before marking anything paid.
    """
    order = _get_order(order_id, db)

    # Already settled: nothing to check with Cashfree again
    if order.payment_status == "paid" or order.status == "cancelled":
        return order

    if not order.cf_order_id:
        raise HTTPException(status_code=400, detail="No payment was started for this order.")

    try:
        response = requests.get(
            f"{CASHFREE_BASE_URL}/orders/{order.cf_order_id}",
            headers=_cf_headers(),
            timeout=15,
        )
    except requests.RequestException:
        logger.exception("Cashfree status check failed")
        raise HTTPException(status_code=502, detail="Could not reach the payment provider.")

    if response.status_code != 200:
        logger.error("Cashfree status error %s: %s", response.status_code, response.text)
        raise HTTPException(status_code=502, detail="Could not check the payment status.")

    cf_status = response.json().get("order_status")

    if cf_status == "PAID":
        order.payment_status = "paid"
        order.status = "confirmed"
        db.commit()
        db.refresh(order)
    elif cf_status in ("EXPIRED", "TERMINATED", "TERMINATION_REQUESTED"):
        _cancel_and_restock(order, db)
    # else: still ACTIVE / PENDING — leave the order as pending and let the
    # frontend show a "still waiting" message

    return order


@router.post("/cancel/{order_id}")
def cancel_payment(order_id: int, db: Session = Depends(get_db)):
    order = _get_order(order_id, db)

    if order.payment_status == "paid":
        raise HTTPException(status_code=409, detail="This order is already paid.")

    _cancel_and_restock(order, db)

    return {"status": "cancelled"}