from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.models.base import Category
from app.schemas.schemas import CategoryCreate, CategoryOut
from app.core.security import get_current_admin

router = APIRouter()


@router.get("", response_model=List[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return db.query(Category).filter(Category.is_active == True).all()


@router.post("", response_model=CategoryOut, status_code=201)
def create_category(
    data: CategoryCreate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    if db.query(Category).filter(Category.slug == data.slug).first():
        raise HTTPException(400, "Slug already exists")
    cat = Category(**data.dict())
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat
