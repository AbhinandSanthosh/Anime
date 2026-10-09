from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(ge=1, le=20)


class OrderCreate(BaseModel):
    customer_name: str = Field(min_length=2, max_length=120)
    phone: str = Field(pattern=r"^[6-9]\d{9}$")  # 10-digit Indian mobile
    email: Optional[str] = Field(default=None, max_length=255)

    address: str = Field(min_length=5, max_length=500)
    city: str = Field(min_length=2, max_length=100)
    state: str = Field(min_length=2, max_length=100)
    pincode: str = Field(pattern=r"^\d{6}$")

    # Only ids and quantities. Prices always come from the database.
    items: list[OrderItemCreate] = Field(min_length=1)


class OrderItemResponse(BaseModel):
    product_id: int
    name: str
    price: float
    quantity: int
    image: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class OrderResponse(BaseModel):
    id: int

    customer_name: str
    phone: str
    email: Optional[str] = None

    address: str
    city: str
    state: str
    pincode: str

    subtotal: float
    shipping_fee: float
    total: float

    status: str
    payment_status: str
    created_at: datetime

    items: list[OrderItemResponse]

    model_config = ConfigDict(from_attributes=True)