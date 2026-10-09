from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.services.auth import create_token, current_user, verify_password

router = APIRouter(prefix="/api/auth", tags=["Auth"])


class LoginIn(BaseModel):
    email: str
    password: str


def _public(u: User):
    return {"id": u.id, "name": u.name, "email": u.email, "role": u.role}


@router.post("/login")
def login(payload: LoginIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower().strip()).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Wrong email or password.")
    return {"access_token": create_token(user), "user": _public(user)}


@router.get("/me")
def me(user: User = Depends(current_user)):
    return _public(user)