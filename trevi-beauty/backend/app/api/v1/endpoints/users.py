from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.models.base import User, Category, Review, Product
from app.schemas.schemas import UserOut, UserUpdate, CategoryCreate, CategoryOut, ReviewCreate, ReviewOut
from app.core.security import get_current_active_user, get_current_admin

# ── Users ─────────────────────────────────────────────────────────────────────
router = APIRouter()


@router.get("/me", response_model=UserOut)
def get_me(current_user=Depends(get_current_active_user)):
    return current_user


@router.put("/me", response_model=UserOut)
def update_me(
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user)
):
    for k, v in data.dict(exclude_none=True).items():
        setattr(current_user, k, v)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("", response_model=List[UserOut])
def list_users(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    return db.query(User).order_by(User.created_at.desc()).all()
