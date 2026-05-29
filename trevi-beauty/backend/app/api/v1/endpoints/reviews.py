from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from sqlalchemy import func

from app.db.database import get_db
from app.models.base import Review, Product
from app.schemas.schemas import ReviewCreate, ReviewOut
from app.core.security import get_current_active_user

router = APIRouter()


@router.get("/product/{product_id}", response_model=List[ReviewOut])
def get_product_reviews(product_id: int, db: Session = Depends(get_db)):
    return db.query(Review).filter(Review.product_id == product_id).order_by(Review.created_at.desc()).all()


@router.post("", response_model=ReviewOut, status_code=201)
def create_review(
    data: ReviewCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user)
):
    existing = db.query(Review).filter(
        Review.user_id == current_user.id,
        Review.product_id == data.product_id
    ).first()
    if existing:
        raise HTTPException(400, "Already reviewed this product")

    review = Review(user_id=current_user.id, **data.dict())
    db.add(review)
    db.flush()

    # Update product rating
    product = db.query(Product).filter(Product.id == data.product_id).first()
    if product:
        stats = db.query(
            func.avg(Review.rating), func.count(Review.id)
        ).filter(Review.product_id == data.product_id).first()
        product.rating_avg = float(stats[0] or 0)
        product.rating_count = stats[1]

    db.commit()
    db.refresh(review)
    return review
