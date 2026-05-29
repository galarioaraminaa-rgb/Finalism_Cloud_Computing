from fastapi import APIRouter, Depends
from sqlalchemy import text
from app.db.database import get_reporting_db, get_db
from app.core.security import get_current_admin
from sqlalchemy.orm import Session
from app.models.base import Order, OrderItem, Product, User
from sqlalchemy import func
from datetime import datetime, timedelta

router = APIRouter()


@router.get("/summary")
def get_summary(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    """Quick live summary from main DB"""
    total_revenue = db.query(func.sum(Order.total_amount)).scalar() or 0
    total_orders  = db.query(func.count(Order.id)).scalar() or 0
    total_users   = db.query(func.count(User.id)).scalar() or 0
    total_products = db.query(func.count(Product.id)).filter(Product.is_active == True).scalar() or 0
    pending_orders = db.query(func.count(Order.id)).filter(Order.status == "pending").scalar() or 0

    return {
        "total_revenue": float(total_revenue),
        "total_orders": total_orders,
        "total_users": total_users,
        "total_products": total_products,
        "pending_orders": pending_orders,
    }


@router.get("/sales-by-day")
def sales_by_day(days: int = 30, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    since = datetime.utcnow() - timedelta(days=days)
    rows = db.execute(text("""
        SELECT DATE(created_at) as day,
               COUNT(*) as orders,
               SUM(total_amount) as revenue
        FROM orders
        WHERE created_at >= :since
        GROUP BY DATE(created_at)
        ORDER BY day
    """), {"since": since}).fetchall()
    return [{"day": str(r[0]), "orders": r[1], "revenue": float(r[2] or 0)} for r in rows]


@router.get("/top-products")
def top_products(limit: int = 10, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    rows = db.execute(text("""
        SELECT p.id, p.name, p.brand, p.image_url,
               SUM(oi.quantity) as units_sold,
               SUM(oi.subtotal) as revenue
        FROM order_items oi
        JOIN products p ON p.id = oi.product_id
        JOIN orders o ON o.id = oi.order_id
        WHERE o.status != 'cancelled'
        GROUP BY p.id, p.name, p.brand, p.image_url
        ORDER BY revenue DESC
        LIMIT :limit
    """), {"limit": limit}).fetchall()
    return [
        {"id": r[0], "name": r[1], "brand": r[2], "image_url": r[3],
         "units_sold": r[4], "revenue": float(r[5] or 0)}
        for r in rows
    ]


@router.get("/sales-by-category")
def sales_by_category(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    rows = db.execute(text("""
        SELECT c.name, SUM(oi.subtotal) as revenue, SUM(oi.quantity) as units
        FROM order_items oi
        JOIN products p ON p.id = oi.product_id
        JOIN categories c ON c.id = p.category_id
        JOIN orders o ON o.id = oi.order_id
        WHERE o.status != 'cancelled'
        GROUP BY c.name
        ORDER BY revenue DESC
    """)).fetchall()
    return [{"category": r[0], "revenue": float(r[1] or 0), "units": r[2]} for r in rows]


@router.get("/customer-stats")
def customer_stats(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    rows = db.execute(text("""
        SELECT u.id, u.username, u.email,
               COUNT(o.id) as order_count,
               SUM(o.total_amount) as lifetime_value
        FROM users u
        LEFT JOIN orders o ON o.user_id = u.id AND o.status != 'cancelled'
        GROUP BY u.id, u.username, u.email
        ORDER BY lifetime_value DESC NULLS LAST
        LIMIT 20
    """)).fetchall()
    return [
        {"id": r[0], "username": r[1], "email": r[2],
         "order_count": r[3], "lifetime_value": float(r[4] or 0)}
        for r in rows
    ]


@router.get("/reporting/sales-overview")
def reporting_sales(db: Session = Depends(get_reporting_db), admin=Depends(get_current_admin)):
    """Read from reporting DB (populated by ETL)"""
    try:
        rows = db.execute(text("SELECT * FROM daily_sales ORDER BY sale_date DESC LIMIT 90")).fetchall()
        return [{"date": str(r[0]), "orders": r[1], "revenue": float(r[2] or 0), "avg_order": float(r[3] or 0)} for r in rows]
    except Exception:
        return []


@router.get("/reporting/product-performance")
def reporting_products(db: Session = Depends(get_reporting_db), admin=Depends(get_current_admin)):
    try:
        rows = db.execute(text("SELECT * FROM product_performance ORDER BY total_revenue DESC LIMIT 20")).fetchall()
        return [
            {"product_id": r[0], "product_name": r[1], "category": r[2],
             "brand": r[3], "units_sold": r[4], "total_revenue": float(r[5] or 0),
             "avg_rating": float(r[6] or 0)}
            for r in rows
        ]
    except Exception:
        return []
