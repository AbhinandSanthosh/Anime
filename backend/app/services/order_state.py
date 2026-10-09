import logging
from sqlalchemy.orm import Session

from app.models.order import Order
from app.models.product import Product

logger = logging.getLogger(__name__)


def mark_paid(db: Session, order: Order) -> bool:
    """Idempotent. Returns True only the first time it changes something."""
    db.refresh(order, with_for_update=True)

    if order.payment_status == "paid":
        return False

    if order.status == "cancelled":
        # Paid after we cancelled and restocked: don't ship blindly
        logger.critical("Payment received for cancelled order #%s", order.id)
        order.status = "needs_review"
    else:
        order.status = "confirmed"

    order.payment_status = "paid"
    db.commit()
    return True


def cancel_and_restock(db: Session, order: Order) -> bool:
    """Idempotent. Never cancels a paid order."""
    db.refresh(order, with_for_update=True)

    if order.payment_status == "paid" or order.status == "cancelled":
        return False

    for item in order.items:
        product = (
            db.query(Product)
            .filter(Product.id == item.product_id)
            .with_for_update()
            .first()
        )
        if product:
            product.stock = (product.stock or 0) + item.quantity

    order.status = "cancelled"
    order.payment_status = "failed"
    db.commit()
    return True