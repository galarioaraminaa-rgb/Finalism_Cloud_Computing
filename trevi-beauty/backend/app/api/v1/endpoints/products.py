from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.database import get_db
from app.models.base import Product, Category
from app.schemas.schemas import ProductCreate, ProductOut, ProductUpdate
from app.core.security import get_current_admin, get_current_active_user

router = APIRouter()


@router.get("", response_model=dict)
def list_products(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    category_id: Optional[int] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    featured: Optional[bool] = None,
    brand: Optional[str] = None,
    sort: str = "created_at",
    order: str = "desc",
    db: Session = Depends(get_db)
):
    q = db.query(Product).filter(Product.is_active == True)

    if category_id:
        q = q.filter(Product.category_id == category_id)
    if search:
        q = q.filter(Product.name.ilike(f"%{search}%"))
    if min_price is not None:
        q = q.filter(Product.price >= min_price)
    if max_price is not None:
        q = q.filter(Product.price <= max_price)
    if featured is not None:
        q = q.filter(Product.is_featured == featured)
    if brand:
        q = q.filter(Product.brand.ilike(f"%{brand}%"))

    total = q.count()

    sort_col = getattr(Product, sort, Product.created_at)
    if order == "asc":
        q = q.order_by(sort_col.asc())
    else:
        q = q.order_by(sort_col.desc())

    products = q.offset((page - 1) * limit).limit(limit).all()
    return {
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit,
        "products": [ProductOut.from_orm(p) for p in products]
    }


@router.get("/featured", response_model=List[ProductOut])
def featured_products(limit: int = 8, db: Session = Depends(get_db)):
    return db.query(Product).filter(
        Product.is_active == True, Product.is_featured == True
    ).order_by(Product.rating_avg.desc()).limit(limit).all()


@router.get("/{slug}", response_model=ProductOut)
def get_product(slug: str, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.slug == slug).first()
    if not product:
        raise HTTPException(404, "Product not found")
    return product


@router.post("", response_model=ProductOut, status_code=201)
def create_product(
    data: ProductCreate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    if not db.query(Category).filter(Category.id == data.category_id).first():
        raise HTTPException(404, "Category not found")
    product = Product(**data.dict())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.put("/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int,
    data: ProductUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(404, "Product not found")
    for k, v in data.dict(exclude_none=True).items():
        setattr(product, k, v)
    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(404, "Product not found")
    product.is_active = False
    db.commit()
    return {"message": "Product deactivated"}
