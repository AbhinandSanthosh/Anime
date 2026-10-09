import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine

# Import every model BEFORE create_all so its table gets created
from app.models.user import User  # noqa: F401
from app.models.product import Product  # noqa: F401
from app.models.order import Order, OrderItem  # noqa: F401

from app.routes.products import router as product_router
from app.routes.orders import router as order_router
from app.routes.payments import router as payment_router
from app.routes.auth import router as auth_router
from app.routes.admin import router as admin_router
from app.routes.seller import router as seller_router
from app.services.expiry import expiry_loop
from fastapi.staticfiles import StaticFiles
from app.config import UPLOAD_DIR


Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(expiry_loop())
    yield
    task.cancel()


app = FastAPI(
    title="Animora API",
    description="Anime Merchandise Store API",
    version="1.0.0",
    lifespan=lifespan,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(product_router)
app.include_router(order_router)
app.include_router(payment_router)
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(seller_router)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

@app.get("/")
def root():
    return {"message": "Animora API is running"}