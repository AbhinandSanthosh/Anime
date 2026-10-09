from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.user import User
from app.services.auth import require_roles
import secrets

from fastapi import File, Request, UploadFile

from app.config import UPLOAD_DIR

from pathlib import Path

router = APIRouter(prefix="/api/seller", tags=["Seller"])
seller_only = require_roles("seller")
MAX_IMAGE_BYTES = 3 * 1024 * 1024  # 3 MB


def _image_ext(data: bytes) -> str | None:
    """Detect the real image type from the file's first bytes."""
    if data.startswith(b"\xff\xd8\xff"):
        return "jpg"
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        return "png"
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "webp"
    return None


@router.post("/upload")
async def upload_image(
    request: Request,
    file: UploadFile = File(...),
    user: User = Depends(seller_only),
):
    data = await file.read(MAX_IMAGE_BYTES + 1)

    if len(data) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="Image must be under 3 MB.")

    ext = _image_ext(data)
    if not ext:
        raise HTTPException(status_code=400, detail="Only JPG, PNG or WEBP images are allowed.")

    # Random name, extension from the real content, never from the user's filename
    name = f"{secrets.token_hex(12)}.{ext}"
    (UPLOAD_DIR / name).write_bytes(data)

    return {"url": f"{request.base_url}uploads/{name}"}


class ProductIn(BaseModel):
    name: str = Field(min_length=2)
    category: str = Field(min_length=2)
    description: str | None = None
    price: float = Field(gt=0)
    original_price: float | None = Field(default=None, gt=0)
    stock: int = Field(ge=0)
    image: str | None = None
    is_new: bool = False


class ProductPatch(BaseModel):
    name: str | None = Field(default=None, min_length=2)
    category: str | None = Field(default=None, min_length=2)
    description: str | None = None
    price: float | None = Field(default=None, gt=0)
    original_price: float | None = Field(default=None, gt=0)
    stock: int | None = Field(default=None, ge=0)
    image: str | None = None
    is_new: bool | None = None


def _product_out(p: Product):
    return {
        "id": p.id, "name": p.name, "category": p.category,
        "description": p.description, "price": p.price,
        "original_price": p.original_price, "stock": p.stock or 0,
        "image": p.image, "is_new": bool(p.is_new),
    }

@router.get("/products")
def my_products(user: User = Depends(seller_only), db: Session = Depends(get_db)):
    rows = db.query(Product).filter(Product.seller_id == user.id).order_by(Product.id.desc()).all()
    return [_product_out(p) for p in rows]


@router.post("/products", status_code=201)
def create_product(payload: ProductIn, user: User = Depends(seller_only), db: Session = Depends(get_db)):
    p = Product(**payload.model_dump(), seller_id=user.id)  # seller_id always from the token
    db.add(p)
    db.commit()
    db.refresh(p)
    return _product_out(p)


@router.patch("/products/{product_id}")
def update_product(product_id: int, payload: ProductPatch,
                   user: User = Depends(seller_only), db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == product_id, Product.seller_id == user.id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found.")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(p, k, v)
    db.commit()
    db.refresh(p)
    return _product_out(p)


@router.delete("/products/{product_id}", status_code=204)
def delete_product(product_id: int, user: User = Depends(seller_only), db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == product_id, Product.seller_id == user.id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found.")

    # Products that were ordered must stay, because old orders (and your
    # "Orders to ship" list) are linked to them
    ordered = db.query(OrderItem.id).filter(OrderItem.product_id == p.id).first()
    if ordered:
        raise HTTPException(
            status_code=409,
            detail="This product has orders, so it can't be deleted. Set its stock to 0 to stop selling it.",
        )

    image = p.image
    db.delete(p)
    db.commit()

    # Remove the uploaded image file too (only files we saved ourselves)
    if image and "/uploads/" in image:
        filename = Path(image.rsplit("/uploads/", 1)[1]).name
        (UPLOAD_DIR / filename).unlink(missing_ok=True)

def _my_items(db: Session, user: User, order_id: int | None = None):
    q = (
        db.query(OrderItem, Order)
        .join(Order, Order.id == OrderItem.order_id)
        .join(Product, Product.id == OrderItem.product_id)
        .filter(Product.seller_id == user.id, Order.payment_status == "paid",
                Order.status.in_(["confirmed", "shipped", "delivered"]))
    )
    if order_id:
        q = q.filter(Order.id == order_id)
    return q.order_by(Order.id.desc()).all()


@router.get("/orders")
def my_orders(user: User = Depends(seller_only), db: Session = Depends(get_db)):
    grouped: dict[int, dict] = {}
    for item, order in _my_items(db, user):
        g = grouped.setdefault(order.id, {
            "id": order.id, "created_at": str(getattr(order, "created_at", "")),
            "customer_name": order.customer_name, "phone": order.phone,
            "address": order.address, "city": order.city,
            "state": order.state, "pincode": order.pincode,
            "items": [],
        })
        g["items"].append({
            "name": item.name, "quantity": item.quantity, "price": item.price,
            "shipped": bool(item.shipped), "tracking_number": item.tracking_number,
        })
    return list(grouped.values())


class ShipIn(BaseModel):
    tracking_number: str = Field(min_length=3)


@router.post("/orders/{order_id}/ship")
def ship(order_id: int, payload: ShipIn, user: User = Depends(seller_only), db: Session = Depends(get_db)):
    mine = _my_items(db, user, order_id)
    if not mine:
        raise HTTPException(status_code=404, detail="Order not found.")
    for item, _ in mine:
        item.shipped = True
        item.tracking_number = payload.tracking_number.strip()

    order = mine[0][1]
    db.flush()
    # When every item in the order has shipped, the whole order counts as shipped
    if order.status == "confirmed" and all(i.shipped for i in order.items):
        order.status = "shipped"
    db.commit()
    return {"ok": True}