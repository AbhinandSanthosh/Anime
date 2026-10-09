import getpass

from app.database import Base, engine, SessionLocal
from app.models.user import User
from app.models.product import Product  # noqa: F401
from app.models.order import Order, OrderItem  # noqa: F401
from app.services.auth import hash_password

Base.metadata.create_all(bind=engine)

email = input("Admin email: ").lower().strip()
password = getpass.getpass("Admin password (8+ characters): ")

if len(password) < 8:
    raise SystemExit("Password too short.")

db = SessionLocal()
if db.query(User).filter(User.email == email).first():
    raise SystemExit("That email already exists.")

db.add(User(name="Admin", email=email, password_hash=hash_password(password), role="admin"))
db.commit()
print("Admin created. Sign in at /admin with that email and password.")