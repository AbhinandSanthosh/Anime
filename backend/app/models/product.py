from sqlalchemy import Column, Integer, String, Float, Boolean, Text, ForeignKey

from app.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)

    category = Column(String(100), nullable=False, index=True)

    price = Column(Float, nullable=False)
    original_price = Column(Float, nullable=True)

    image = Column(String(500), nullable=True)

    rating = Column(Float, default=0)
    reviews = Column(Integer, default=0)

    is_new = Column(Boolean, default=False)
    is_featured = Column(Boolean, default=False)

    stock = Column(Integer, default=0)

    # NULL = your own product, otherwise the seller who owns it
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    collection = Column(String(100), nullable=True, index=True)
    