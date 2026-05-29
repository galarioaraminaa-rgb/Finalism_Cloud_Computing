from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Text,
    DateTime, ForeignKey, Enum, Numeric
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base
import enum


class OrderStatus(str, enum.Enum):
    pending   = "pending"
    confirmed = "confirmed"
    shipped   = "shipped"
    delivered = "delivered"
    cancelled = "cancelled"


# ── User ──────────────────────────────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"

    id         = Column(Integer, primary_key=True, index=True)
    email      = Column(String(255), unique=True, index=True, nullable=False)
    username   = Column(String(100), unique=True, index=True, nullable=False)
    full_name  = Column(String(255))
    hashed_password = Column(String(255), nullable=False)
    is_active  = Column(Boolean, default=True)
    is_admin   = Column(Boolean, default=False)
    phone      = Column(String(20))
    address    = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    orders  = relationship("Order",  back_populates="user")
    reviews = relationship("Review", back_populates="user")
    cart    = relationship("Cart",   back_populates="user", uselist=False)


# ── Category ──────────────────────────────────────────────────────────────────
class Category(Base):
    __tablename__ = "categories"

    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String(100), unique=True, nullable=False)
    slug        = Column(String(100), unique=True, nullable=False)
    description = Column(Text)
    image_url   = Column(String(500))
    is_active   = Column(Boolean, default=True)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())

    products = relationship("Product", back_populates="category")


# ── Product ───────────────────────────────────────────────────────────────────
class Product(Base):
    __tablename__ = "products"

    id           = Column(Integer, primary_key=True, index=True)
    name         = Column(String(255), nullable=False, index=True)
    slug         = Column(String(255), unique=True, nullable=False)
    description  = Column(Text)
    price        = Column(Numeric(10, 2), nullable=False)
    compare_price = Column(Numeric(10, 2))
    sku          = Column(String(100), unique=True)
    stock        = Column(Integer, default=0)
    category_id  = Column(Integer, ForeignKey("categories.id"))
    brand        = Column(String(100))
    image_url    = Column(String(500))
    images       = Column(Text)  # JSON array of image URLs
    tags         = Column(Text)  # JSON array
    is_active    = Column(Boolean, default=True)
    is_featured  = Column(Boolean, default=False)
    rating_avg   = Column(Float, default=0.0)
    rating_count = Column(Integer, default=0)
    created_at   = Column(DateTime(timezone=True), server_default=func.now())
    updated_at   = Column(DateTime(timezone=True), onupdate=func.now())

    category   = relationship("Category",  back_populates="products")
    reviews    = relationship("Review",    back_populates="product")
    order_items = relationship("OrderItem", back_populates="product")
    cart_items  = relationship("CartItem",  back_populates="product")


# ── Cart ──────────────────────────────────────────────────────────────────────
class Cart(Base):
    __tablename__ = "carts"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), unique=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user  = relationship("User",     back_populates="cart")
    items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan")


class CartItem(Base):
    __tablename__ = "cart_items"

    id         = Column(Integer, primary_key=True, index=True)
    cart_id    = Column(Integer, ForeignKey("carts.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity   = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    cart    = relationship("Cart",    back_populates="items")
    product = relationship("Product", back_populates="cart_items")


# ── Order ─────────────────────────────────────────────────────────────────────
class Order(Base):
    __tablename__ = "orders"

    id               = Column(Integer, primary_key=True, index=True)
    order_number     = Column(String(50), unique=True, nullable=False)
    user_id          = Column(Integer, ForeignKey("users.id"))
    status           = Column(Enum(OrderStatus), default=OrderStatus.pending)
    subtotal         = Column(Numeric(10, 2), nullable=False)
    shipping_cost    = Column(Numeric(10, 2), default=0)
    discount_amount  = Column(Numeric(10, 2), default=0)
    total_amount     = Column(Numeric(10, 2), nullable=False)
    shipping_address = Column(Text)
    payment_method   = Column(String(50), default="cod")
    payment_status   = Column(String(50), default="pending")
    notes            = Column(Text)
    created_at       = Column(DateTime(timezone=True), server_default=func.now())
    updated_at       = Column(DateTime(timezone=True), onupdate=func.now())

    user  = relationship("User",      back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id         = Column(Integer, primary_key=True, index=True)
    order_id   = Column(Integer, ForeignKey("orders.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity   = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    subtotal   = Column(Numeric(10, 2), nullable=False)

    order   = relationship("Order",   back_populates="items")
    product = relationship("Product", back_populates="order_items")


# ── Review ────────────────────────────────────────────────────────────────────
class Review(Base):
    __tablename__ = "reviews"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    rating     = Column(Integer, nullable=False)  # 1-5
    title      = Column(String(255))
    body       = Column(Text)
    is_verified = Column(Boolean, default=False)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())

    user    = relationship("User",    back_populates="reviews")
    product = relationship("Product", back_populates="reviews")
