import os
from pathlib import Path

from dotenv import load_dotenv

# backend/.env  (app/config.py -> app -> backend)
load_dotenv(Path(__file__).resolve().parent.parent / ".env")


class Settings:
    CASHFREE_APP_ID: str = os.getenv("CASHFREE_APP_ID", "")
    CASHFREE_SECRET_KEY: str = os.getenv("CASHFREE_SECRET_KEY", "")
    # "sandbox" while testing; switch to "production" only with live keys
    CASHFREE_ENV: str = os.getenv("CASHFREE_ENV", "sandbox")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "")


settings = Settings()

if not settings.JWT_SECRET:
    raise RuntimeError("JWT_SECRET is missing. Add it to backend/.env")

# Uploaded product images are saved here and served at /uploads
UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)