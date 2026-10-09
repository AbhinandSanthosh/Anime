from sqlalchemy import inspect, text

from app.database import Base, engine
from app.models.user import User  # noqa: F401
from app.models.product import Product  # noqa: F401
from app.models.order import Order, OrderItem  # noqa: F401

Base.metadata.create_all(bind=engine)  # creates the users table if missing

NEW_COLUMNS = {
    "products": {"seller_id": "INTEGER REFERENCES users(id)"},
    "orders": {"tracking_number": "VARCHAR(100)"},
    "order_items": {
        "shipped": "BOOLEAN NOT NULL DEFAULT 0",
        "tracking_number": "VARCHAR(100)",
    },
}

for table, columns in NEW_COLUMNS.items():
    existing = {c["name"] for c in inspect(engine).get_columns(table)}
    for name, col_type in columns.items():
        if name in existing:
            print(f"{table}.{name}: already exists")
            continue
        with engine.begin() as conn:
            conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {name} {col_type}"))
        print(f"{table}.{name}: added")

print("Done.")