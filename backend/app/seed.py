
import sys

from sqlalchemy import inspect, text

from app.database import Base, SessionLocal, engine
from app.models.product import Product
from app.models.order import Order, OrderItem  # noqa: F401  (registers the tables)
from app.models.user import User  # noqa: F401  (registers the users table)
RESET_STOCK = "--reset-stock" in sys.argv

PRODUCTS = [
    dict(name="Gojo Satoru Oversized T-Shirt",
         description="Premium oversized anime streetwear inspired by Gojo Satoru.",
         category="Apparel", price=1299, original_price=1599,
         image="gojo-tshirt.png", rating=4.8, reviews=124,
         is_new=True, is_featured=True, stock=25),
    dict(name="Itachi Uchiha Oversized T-Shirt",
         description="Premium oversized anime streetwear inspired by Itachi.",
         category="Apparel", price=1299, original_price=1599,
         image="itachi-tshirt.png", rating=4.7, reviews=98,
         is_new=True, is_featured=False, stock=20),
    dict(name="Luffy Straw Hat",
         description="Replica straw hat for true Straw Hat Pirates fans.",
         category="Accessories", price=899, original_price=None,
         image="luffy-hat.png", rating=4.6, reviews=54,
         is_new=False, is_featured=True, stock=15),
    dict(name="Naruto Uzumaki Figure",
         description="Collectible Naruto action figure.",
         category="Figures", price=2499, original_price=2999,
         image="naruto-figure.png", rating=4.9, reviews=210,
         is_new=False, is_featured=True, stock=8),
    dict(name="Goku Super Saiyan Figure",
         description="Collectible Goku figure in Super Saiyan form.",
         category="Figures", price=2799, original_price=3299,
         image="goku-figure.png", rating=4.8, reviews=176,
         is_new=False, is_featured=False, stock=5),
    dict(name="Anime Backpack",
         description="Durable everyday backpack with anime-inspired design.",
         category="Accessories", price=1799, original_price=2199,
         image="anime-backpack.png", rating=4.5, reviews=67,
         is_new=False, is_featured=False, stock=12),
    dict(name="Demon Slayer Wall Art",
         description="Demon Slayer wall art print.",
         category="Wall Art", price=999, original_price=1299,
         image="demon-slayer-wall-art.png", rating=4.6, reviews=41,
         is_new=True, is_featured=False, stock=30),
    dict(name="One Piece Poster Set",
         description="Set of One Piece posters for your room.",
         category="Wall Art", price=699, original_price=None,
         image="one-piece-posters.png", rating=4.7, reviews=89,
         is_new=False, is_featured=False, stock=40),
]

PAYMENT_COLUMNS = {
    "cf_order_id": "VARCHAR(64)",
    "cf_payment_session_id": "VARCHAR(255)",
    "cf_payment_id": "VARCHAR(64)",
}
# Columns from the earlier Razorpay setup. Harmless to leave in the table;
# only dropped if you want a clean schema (SQLite ALTER can't drop columns
# easily, so this just stops referencing them going forward).
LEGACY_COLUMNS = ("razorpay_order_id", "razorpay_payment_id")


def ensure_payment_setup():
    """Create the orders tables if missing and add the Cashfree columns.

    create_all() never adds columns to a table that already exists, so an
    orders table made before the payment feature needs the ALTER below.
    """
    Base.metadata.create_all(bind=engine)

    existing = {col["name"] for col in inspect(engine).get_columns("orders")}

    for column, col_type in PAYMENT_COLUMNS.items():
        if column in existing:
            print(f"orders.{column}: already exists")
            continue

        with engine.begin() as connection:
            connection.execute(
                text(f"ALTER TABLE orders ADD COLUMN {column} {col_type}")
            )
        print(f"orders.{column}: added")

    leftover = [c for c in LEGACY_COLUMNS if c in existing]
    if leftover:
        print(f"Note: old Razorpay columns still in the table (unused, harmless): {leftover}")


def seed_products():
    db = SessionLocal()
    try:
        added = 0

        for data in PRODUCTS:
            data = {**data, "image": f"/products/{data['image']}"}
            exists = db.query(Product).filter(Product.name == data["name"]).first()

            if exists:
                exists.image = data["image"]
                if RESET_STOCK:
                    exists.stock = data["stock"]
                continue

            db.add(Product(**data))
            added += 1

        db.commit()
        print(f"Products: added {added}." + (" Stock reset." if RESET_STOCK else ""))
    finally:
        db.close()


def main():
    ensure_payment_setup()
    seed_products()


if __name__ == "__main__":
    main()