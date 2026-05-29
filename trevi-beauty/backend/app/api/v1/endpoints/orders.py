from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid
from decimal import Decimal

from app.db.database import get_db
from app.models.base import Order, OrderItem, Cart, Product
from app.schemas.schemas import OrderCreate, OrderOut, OrderStatusUpdate
from app.core.security import get_current_active_user, get_current_admin

router = APIRouter()


def gen_order_number():
    return f"GLM-{uuid.uuid4().hex[:8].upper()}"


@router.post("", response_model=OrderOut, status_code=201)
def create_order(
    data: OrderCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user)
):
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not cart or not cart.items:
        raise HTTPException(400, "Cart is empty")

    subtotal = Decimal("0")
    order_items = []

    for item in cart.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product or not product.is_active:
            raise HTTPException(400, f"Product {item.product_id} unavailable")
        if product.stock < item.quantity:
            raise HTTPException(400, f"Insufficient stock for {product.name}")

        line = Decimal(str(product.price)) * item.quantity
        subtotal += line
        order_items.append(OrderItem(
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=product.price,
            subtotal=line,
        ))
        product.stock -= item.quantity

    shipping = Decimal("99") if subtotal < Decimal("1500") else Decimal("0")
    total = subtotal + shipping

    order = Order(
        order_number=gen_order_number(),
        user_id=current_user.id,
        subtotal=subtotal,
        shipping_cost=shipping,
        total_amount=total,
        shipping_address=data.shipping_address,
        payment_method=data.payment_method,
        notes=data.notes,
    )
    db.add(order)
    db.flush()

    for oi in order_items:
        oi.order_id = order.id
        db.add(oi)

    # Clear cart
    for item in cart.items:
        db.delete(item)

    db.commit()
    db.refresh(order)
    return order


@router.get("", response_model=List[OrderOut])
def my_orders(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user)
):
    return db.query(Order).filter(
        Order.user_id == current_user.id
    ).order_by(Order.created_at.desc()).all()


@router.get("/all", response_model=List[OrderOut])
def all_orders(
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    return db.query(Order).order_by(Order.created_at.desc()).limit(100).all()


@router.get("/{order_id}", response_model=OrderOut)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(404, "Order not found")
    if not current_user.is_admin and order.user_id != current_user.id:
        raise HTTPException(403, "Forbidden")
    return order


@router.patch("/{order_id}/status", response_model=OrderOut)
def update_order_status(
    order_id: int,
    data: OrderStatusUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(404, "Order not found")
    order.status = data.status
    db.commit()
    db.refresh(order)
    return order
