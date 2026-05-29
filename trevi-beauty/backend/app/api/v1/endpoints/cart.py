### cart.py ###
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from decimal import Decimal

from app.db.database import get_db
from app.models.base import Cart, CartItem, Product
from app.schemas.schemas import CartItemAdd, CartOut
from app.core.security import get_current_active_user

router = APIRouter()


def get_or_create_cart(user_id, db):
    cart = db.query(Cart).filter(Cart.user_id == user_id).first()
    if not cart:
        cart = Cart(user_id=user_id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return cart


@router.get("", response_model=CartOut)
def get_cart(db: Session = Depends(get_db), current_user=Depends(get_current_active_user)):
    cart = get_or_create_cart(current_user.id, db)
    total = sum(
        Decimal(str(item.product.price)) * item.quantity
        for item in cart.items if item.product
    )
    return CartOut(id=cart.id, items=cart.items, total=total)


@router.post("/items")
def add_to_cart(
    data: CartItemAdd,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user)
):
    product = db.query(Product).filter(Product.id == data.product_id, Product.is_active == True).first()
    if not product:
        raise HTTPException(404, "Product not found")
    if product.stock < data.quantity:
        raise HTTPException(400, "Insufficient stock")

    cart = get_or_create_cart(current_user.id, db)
    existing = next((i for i in cart.items if i.product_id == data.product_id), None)

    if existing:
        existing.quantity = min(existing.quantity + data.quantity, product.stock)
    else:
        cart_item = CartItem(cart_id=cart.id, product_id=data.product_id, quantity=data.quantity)
        db.add(cart_item)

    db.commit()
    return {"message": "Added to cart"}


@router.put("/items/{item_id}")
def update_cart_item(
    item_id: int,
    quantity: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user)
):
    item = db.query(CartItem).join(Cart).filter(
        CartItem.id == item_id, Cart.user_id == current_user.id
    ).first()
    if not item:
        raise HTTPException(404, "Item not found")
    if quantity <= 0:
        db.delete(item)
    else:
        item.quantity = quantity
    db.commit()
    return {"message": "Updated"}


@router.delete("/items/{item_id}")
def remove_cart_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user)
):
    item = db.query(CartItem).join(Cart).filter(
        CartItem.id == item_id, Cart.user_id == current_user.id
    ).first()
    if not item:
        raise HTTPException(404, "Item not found")
    db.delete(item)
    db.commit()
    return {"message": "Removed"}


@router.delete("")
def clear_cart(db: Session = Depends(get_db), current_user=Depends(get_current_active_user)):
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if cart:
        for item in cart.items:
            db.delete(item)
        db.commit()
    return {"message": "Cart cleared"}
