from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductResponse


router = APIRouter(
    prefix="/api/products",
    tags=["Products"]
)


# GET ALL PRODUCTS
@router.get("/", response_model=list[ProductResponse])
def get_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    sort: Optional[str] = "Featured",
    db: Session = Depends(get_db)
):
    query = db.query(Product)

    # CATEGORY FILTER
    if category and category.lower() != "all":
        query = query.filter(
            Product.category.ilike(category)
        )

    # SEARCH
    if search:
        search_query = f"%{search}%"

        query = query.filter(
            Product.name.ilike(search_query)
            |
            Product.category.ilike(search_query)
        )

    # SORT
    if sort == "Price: Low to High":
        query = query.order_by(Product.price.asc())

    elif sort == "Price: High to Low":
        query = query.order_by(Product.price.desc())

    elif sort == "Newest":
        query = query.order_by(Product.id.desc())

    elif sort == "Featured":
        query = query.order_by(
            Product.is_featured.desc()
        )

    return query.all()


# GET SINGLE PRODUCT
@router.get("/{product_id}", response_model=ProductResponse)
def get_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    return product


# CREATE PRODUCT
@router.post(
    "/",
    response_model=ProductResponse,
    status_code=201
)
def create_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db)
):
    product = Product(
        **product_data.model_dump()
    )

    db.add(product)
    db.commit()
    db.refresh(product)

    return product


# DELETE PRODUCT
@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    db.delete(product)
    db.commit()

    return {
        "message": "Product deleted successfully"
    }