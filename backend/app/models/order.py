from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)

    # Customer (guest checkout, no account yet)
    customer_name = Column(String(120), nullable=False)
    phone = Column(String(15), nullable=False)
    email = Column(String(255), nullable=True)

    # Shipping address
    address = Column(Text, nullable=False)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    pincode = Column(String(10), nullable=False)

    # Totals are calculated on the server, never taken from the browser
    subtotal = Column(Float, nullable=False)
    shipping_fee = Column(Float, nullable=False, default=0)
    total = Column(Float, nullable=False)

    status = Column(String(30), nullable=False, default="pending")
    payment_status = Column(String(30), nullable=False, default="unpaid")

    # Cashfree references, set by the payments routes
    cf_order_id = Column(String(64), nullable=True, index=True)  # Cashfree's own order_id, not our id
    cf_payment_session_id = Column(String(255), nullable=True)
    cf_payment_id = Column(String(64), nullable=True)
    tracking_number = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    items = relationship(
        "OrderItem",
        back_populates="order",
        cascade="all, delete-orphan",
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)

    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)

    # Snapshot of the product at purchase time, so later edits
    # to the product do not change old orders
    name = Column(String(255), nullable=False)
    price = Column(Float, nullable=False)
    image = Column(String(500), nullable=True)
    quantity = Column(Integer, nullable=False)
    shipped = Column(Boolean, nullable=False, default=False)
    tracking_number = Column(String(100), nullable=True)
    order = relationship("Order", back_populates="items")