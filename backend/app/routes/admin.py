import secrets
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile
from pydantic import BaseModel, Field
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.config import UPLOAD_DIR
from app.database import get_db
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.user import User
from app.routes.seller import MAX_IMAGE_BYTES, _image_ext
from app.schemas.order import OrderResponse
from app.services.auth import hash_password, require_roles

router = APIRouter(
    prefix="/api/admin",
    tags=["Admin"],
    dependencies=[Depends(require_roles("admin"))],
)

# Cancelling a paid order needs a refund, so it is not allowed here
NEXT = {"confirmed": {"shipped"}, "shipped": {"delivered"}}


# ===================== ORDERS =====================

class StatusIn(BaseModel):
    status: str
    tracking_number: str | None = None


@router.get("/orders", response_model=list[OrderResponse])
def list_orders(status: str | None = None, db: Session = Depends(get_db)):
    q = db.query(Order).order_by(Order.id.desc())
    if status:
        q = q.filter(Order.status == status)
    return q.limit(200).all()


@router.patch("/orders/{order_id}", response_model=OrderResponse)
def update_order(order_id: int, payload: StatusIn, db: Session = Depends(get_db)):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")
    if payload.status not in NEXT.get(order.status, set()):
        raise HTTPException(status_code=409, detail=f"Cannot go from {order.status} to {payload.status}.")
    if order.payment_status != "paid":
        raise HTTPException(status_code=409, detail="Order is not paid.")
    if payload.status == "shipped":
        if not payload.tracking_number:
            raise HTTPException(status_code=422, detail="Tracking number required.")
        order.tracking_number = payload.tracking_number.strip()
    order.status = payload.status
    db.commit()
    db.refresh(order)
    return order


# ===================== SELLERS =====================

class SellerIn(BaseModel):
    name: str
    email: str
    password: str


@router.get("/sellers")
def list_sellers(db: Session = Depends(get_db)):
    rows = db.query(User).filter(User.role == "seller").order_by(User.id.desc()).all()
    return [{"id": u.id, "name": u.name, "email": u.email, "is_active": u.is_active} for u in rows]


@router.post("/sellers", status_code=201)
def create_seller(payload: SellerIn, db: Session = Depends(get_db)):
    email = payload.email.lower().strip()
    if len(payload.password) < 8:
        raise HTTPException(status_code=422, detail="Password must be at least 8 characters.")
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=409, detail="Email already used.")
    u = User(name=payload.name.strip(), email=email,
             password_hash=hash_password(payload.password), role="seller")
    db.add(u)
    db.commit()
    return {"id": u.id, "name": u.name, "email": u.email}


# ===================== PRODUCTS =====================

class AdminProductIn(BaseModel):
    name: str = Field(min_length=2)
    category: str = Field(min_length=2)
    description: str | None = None
    price: float = Field(gt=0)
    original_price: float | None = Field(default=None, gt=0)
    stock: int = Field(ge=0)
    image: str | None = None
    is_new: bool = False
    is_featured: bool = False
    collection: str | None = None


class AdminProductPatch(BaseModel):
    name: str | None = Field(default=None, min_length=2)
    category: str | None = Field(default=None, min_length=2)
    description: str | None = None
    price: float | None = Field(default=None, gt=0)
    original_price: float | None = Field(default=None, gt=0)
    stock: int | None = Field(default=None, ge=0)
    image: str | None = None
    is_new: bool | None = None
    is_featured: bool | None = None
    collection: str | None = None

def _product_out(p: Product):
    return {
        "id": p.id, "name": p.name, "category": p.category,
        "description": p.description, "price": p.price,
        "original_price": p.original_price, "stock": p.stock or 0,
        "image": p.image, "is_new": bool(p.is_new),
        "is_featured": bool(p.is_featured), "seller_id": p.seller_id,
        "collection": p.collection,
    }


def _canon_category(db: Session, name: str) -> str:
    """Reuse an existing category's spelling so 'apparel' and 'Apparel' don't split."""
    name = name.strip()
    row = db.query(Product.category).filter(func.lower(Product.category) == name.lower()).first()
    return row[0] if row else name


@router.get("/products")
def admin_products(db: Session = Depends(get_db)):
    return [_product_out(p) for p in db.query(Product).order_by(Product.id.desc()).all()]


@router.post("/products", status_code=201)
def admin_create_product(payload: AdminProductIn, db: Session = Depends(get_db)):
    data = payload.model_dump()
    data["category"] = _canon_category(db, data["category"])
    p = Product(**data)  # seller_id stays empty: this is your own product
    db.add(p)
    db.commit()
    db.refresh(p)
    return _product_out(p)


@router.patch("/products/{product_id}")
def admin_update_product(product_id: int, payload: AdminProductPatch, db: Session = Depends(get_db)):
    p = db.get(Product, product_id)
    if not p:
        raise HTTPException(status_code=404, detail="Product not found.")
    data = payload.model_dump(exclude_unset=True)
    if data.get("category"):
        data["category"] = _canon_category(db, data["category"])
    for k, v in data.items():
        setattr(p, k, v)
    db.commit()
    db.refresh(p)
    return _product_out(p)


@router.delete("/products/{product_id}", status_code=204)
def admin_delete_product(product_id: int, db: Session = Depends(get_db)):
    p = db.get(Product, product_id)
    if not p:
        raise HTTPException(status_code=404, detail="Product not found.")
    if db.query(OrderItem.id).filter(OrderItem.product_id == p.id).first():
        raise HTTPException(
            status_code=409,
            detail="This product has orders, so it can't be deleted. Set its stock to 0 instead.",
        )
    image = p.image
    db.delete(p)
    db.commit()
    if image and "/uploads/" in image:
        (UPLOAD_DIR / Path(image.rsplit("/uploads/", 1)[1]).name).unlink(missing_ok=True)


@router.post("/upload")
async def admin_upload(request: Request, file: UploadFile = File(...)):
    data = await file.read(MAX_IMAGE_BYTES + 1)
    if len(data) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="Image must be under 3 MB.")
    ext = _image_ext(data)
    if not ext:
        raise HTTPException(status_code=400, detail="Only JPG, PNG or WEBP images are allowed.")
    name = f"{secrets.token_hex(12)}.{ext}"
    (UPLOAD_DIR / name).write_bytes(data)
    return {"url": f"{request.base_url}uploads/{name}"}