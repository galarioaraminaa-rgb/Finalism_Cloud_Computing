from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
import enum


class OrderStatus(str, enum.Enum):
    pending   = "pending"
    confirmed = "confirmed"
    shipped   = "shipped"
    delivered = "delivered"
    cancelled = "cancelled"


# ── Auth ──────────────────────────────────────────────────────────────────────
class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict


class UserCreate(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    password: str
    phone: Optional[str] = None
    address: Optional[str] = None


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None


class UserOut(BaseModel):
    id: int
    email: str
    username: str
    full_name: Optional[str]
    phone: Optional[str]
    address: Optional[str]
    is_active: bool
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ── Category ──────────────────────────────────────────────────────────────────
class CategoryCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    image_url: Optional[str] = None


class CategoryOut(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str]
    image_url: Optional[str]
    is_active: bool

    class Config:
        from_attributes = True


# ── Product ───────────────────────────────────────────────────────────────────
class ProductCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    price: Decimal
    compare_price: Optional[Decimal] = None
    sku: Optional[str] = None
    stock: int = 0
    category_id: int
    brand: Optional[str] = None
    image_url: Optional[str] = None
    images: Optional[str] = None
    tags: Optional[str] = None
    is_featured: bool = False


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = None
    compare_price: Optional[Decimal] = None
    stock: Optional[int] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None


class ProductOut(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str]
    price: Decimal
    compare_price: Optional[Decimal]
    sku: Optional[str]
    stock: int
    category_id: int
    brand: Optional[str]
    image_url: Optional[str]
    images: Optional[str]
    tags: Optional[str]
    is_active: bool
    is_featured: bool
    rating_avg: float
    rating_count: int
    category: Optional[CategoryOut]
    created_at: datetime

    class Config:
        from_attributes = True


# ── Cart ──────────────────────────────────────────────────────────────────────
class CartItemAdd(BaseModel):
    product_id: int
    quantity: int = 1


class CartItemOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    product: ProductOut

    class Config:
        from_attributes = True


class CartOut(BaseModel):
    id: int
    items: List[CartItemOut]
    total: Decimal = Decimal("0")

    class Config:
        from_attributes = True


# ── Order ─────────────────────────────────────────────────────────────────────
class OrderItemOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: Decimal
    subtotal: Decimal
    product: Optional[ProductOut]

    class Config:
        from_attributes = True


class OrderCreate(BaseModel):
    shipping_address: str
    payment_method: str = "cod"
    notes: Optional[str] = None


class OrderOut(BaseModel):
    id: int
    order_number: str
    status: OrderStatus
    subtotal: Decimal
    shipping_cost: Decimal
    total_amount: Decimal
    shipping_address: str
    payment_method: str
    payment_status: str
    notes: Optional[str]
    items: List[OrderItemOut]
    created_at: datetime

    class Config:
        from_attributes = True


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


# ── Review ────────────────────────────────────────────────────────────────────
class ReviewCreate(BaseModel):
    product_id: int
    rating: int
    title: Optional[str] = None
    body: Optional[str] = None

    @validator("rating")
    def rating_range(cls, v):
        if not 1 <= v <= 5:
            raise ValueError("Rating must be between 1 and 5")
        return v


class ReviewOut(BaseModel):
    id: int
    product_id: int
    rating: int
    title: Optional[str]
    body: Optional[str]
    is_verified: bool
    user: Optional[UserOut]
    created_at: datetime

    class Config:
        from_attributes = True
