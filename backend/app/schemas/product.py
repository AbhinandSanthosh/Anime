from pydantic import BaseModel, ConfigDict
from typing import Optional


class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None

    category: str

    price: float
    original_price: Optional[float] = None

    image: Optional[str] = None

    rating: float = 0
    reviews: int = 0

    is_new: bool = False
    is_featured: bool = False

    stock: int = 0


class ProductCreate(ProductBase):
    pass


class ProductResponse(ProductBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
    collection: str | None = None