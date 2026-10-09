import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.schemas.order import OrderCreate, OrderResponse

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/orders",
    tags=["Orders"],
)

FREE_SHIPPING_MIN = 999  # matches the "free shipping over ₹999" banner
SHIPPING_FEE = 49        # charged below the free-shipping minimum


@router.post("/", response_model=OrderResponse, status_code=201)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    # Merge duplicate product ids into a single quantity
    wanted: dict[int, int] = {}
    for item in payload.items:
        wanted[item.product_id] = wanted.get(item.product_id, 0) + item.quantity

    products = db.query(Product).filter(Product.id.in_(wanted.keys())).all()
    by_id = {product.id: product for product in products}

    # 1. Every product must exist
    missing = [pid for pid in wanted if pid not in by_id]
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Products not found: {missing}",
        )

    # 2. Every product must have enough stock
    for pid, quantity in wanted.items():
        product = by_id[pid]
        available = product.stock or 0

        if available <= 0:
            raise HTTPException(
                status_code=409,
                detail=f"'{product.name}' is out of stock.",
            )

        if quantity > available:
            raise HTTPException(
                status_code=409,
                detail=f"Only {available} of '{product.name}' left.",
            )

    # 3. Build the order using database prices, not browser prices
    order_items = []
    subtotal = 0.0

    for pid, quantity in wanted.items():
        product = by_id[pid]
        subtotal += product.price * quantity

        order_items.append(
            OrderItem(
                product_id=product.id,
                name=product.name,
                price=product.price,
                image=product.image,
                quantity=quantity,
            )
        )

        product.stock = (product.stock or 0) - quantity

    shipping_fee = 0.0 if subtotal >= FREE_SHIPPING_MIN else float(SHIPPING_FEE)

    order = Order(
        customer_name=payload.customer_name.strip(),
        phone=payload.phone,
        email=payload.email,
        address=payload.address.strip(),
        city=payload.city.strip(),
        state=payload.state.strip(),
        pincode=payload.pincode,
        subtotal=subtotal,
        shipping_fee=shipping_fee,
        total=subtotal + shipping_fee,
        status="pending",
        payment_status="unpaid",
        items=order_items,
    )

    # Order and stock changes are saved together or not at all
    try:
        db.add(order)
        db.commit()
        db.refresh(order)
    except SQLAlchemyError:
        db.rollback()
        logger.exception("Order commit failed")
        raise HTTPException(status_code=500, detail="Could not place the order.")

    return order