#!/usr/bin/env python3
"""
Glamora ETL Script
Transfers and transforms data from the main transactional DB
to the reporting/analytics DB.

Schedule with cron: 0 * * * * /usr/bin/python3 /opt/glamora/etl/etl.py >> /var/log/glamora_etl.log 2>&1
"""
import os
import sys
import logging
from datetime import datetime, date, timedelta

import psycopg2
from psycopg2.extras import RealDictCursor

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [ETL] %(levelname)s: %(message)s"
)
log = logging.getLogger("glamora.etl")

MAIN_DB_URL = os.getenv("DATABASE_URL", "postgresql://glamora_user:glamora_pass@localhost:5432/glamora_db")
REPORTING_DB_URL = os.getenv("REPORTING_DATABASE_URL", "postgresql://glamora_user:glamora_pass@localhost:5432/glamora_reporting")


def get_conn(url):
    return psycopg2.connect(url)


def setup_reporting_schema(conn):
    """Create reporting tables if they don't exist."""
    with conn.cursor() as cur:
        cur.execute("""
        CREATE TABLE IF NOT EXISTS daily_sales (
            sale_date      DATE PRIMARY KEY,
            total_orders   INTEGER DEFAULT 0,
            total_revenue  NUMERIC(12,2) DEFAULT 0,
            avg_order_value NUMERIC(10,2) DEFAULT 0,
            new_customers  INTEGER DEFAULT 0,
            items_sold     INTEGER DEFAULT 0,
            etl_updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS product_performance (
            product_id     INTEGER PRIMARY KEY,
            product_name   VARCHAR(255),
            category_name  VARCHAR(100),
            brand          VARCHAR(100),
            units_sold     INTEGER DEFAULT 0,
            total_revenue  NUMERIC(12,2) DEFAULT 0,
            avg_rating     NUMERIC(3,2) DEFAULT 0,
            stock_remaining INTEGER DEFAULT 0,
            etl_updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS category_performance (
            category_id    INTEGER PRIMARY KEY,
            category_name  VARCHAR(100),
            total_products INTEGER DEFAULT 0,
            units_sold     INTEGER DEFAULT 0,
            total_revenue  NUMERIC(12,2) DEFAULT 0,
            avg_order_value NUMERIC(10,2) DEFAULT 0,
            etl_updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS customer_segments (
            segment_name   VARCHAR(50) PRIMARY KEY,
            customer_count INTEGER DEFAULT 0,
            total_revenue  NUMERIC(12,2) DEFAULT 0,
            avg_ltv        NUMERIC(10,2) DEFAULT 0,
            etl_updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS monthly_summary (
            year_month     VARCHAR(7) PRIMARY KEY,  -- YYYY-MM
            total_orders   INTEGER DEFAULT 0,
            total_revenue  NUMERIC(12,2) DEFAULT 0,
            new_customers  INTEGER DEFAULT 0,
            returning_rate NUMERIC(5,2) DEFAULT 0,
            etl_updated_at TIMESTAMP DEFAULT NOW()
        );
        """)
        conn.commit()
    log.info("Reporting schema ready")


def etl_daily_sales(src, dst):
    """Aggregate daily sales from orders."""
    log.info("Running daily_sales ETL...")
    with src.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("""
            SELECT
                DATE(o.created_at) AS sale_date,
                COUNT(o.id)            AS total_orders,
                SUM(o.total_amount)    AS total_revenue,
                AVG(o.total_amount)    AS avg_order_value,
                SUM(oi.quantity)       AS items_sold
            FROM orders o
            JOIN order_items oi ON oi.order_id = o.id
            WHERE o.status != 'cancelled'
            GROUP BY DATE(o.created_at)
            ORDER BY sale_date
        """)
        rows = cur.fetchall()

        # New customers per day
        cur.execute("""
            SELECT DATE(created_at) AS reg_date, COUNT(*) AS new_customers
            FROM users WHERE is_admin = FALSE
            GROUP BY DATE(created_at)
        """)
        new_cust = {r["reg_date"]: r["new_customers"] for r in cur.fetchall()}

    with dst.cursor() as cur:
        for row in rows:
            cur.execute("""
                INSERT INTO daily_sales
                    (sale_date, total_orders, total_revenue, avg_order_value,
                     items_sold, new_customers, etl_updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, NOW())
                ON CONFLICT (sale_date) DO UPDATE SET
                    total_orders   = EXCLUDED.total_orders,
                    total_revenue  = EXCLUDED.total_revenue,
                    avg_order_value = EXCLUDED.avg_order_value,
                    items_sold     = EXCLUDED.items_sold,
                    new_customers  = EXCLUDED.new_customers,
                    etl_updated_at = NOW()
            """, (
                row["sale_date"], row["total_orders"], row["total_revenue"],
                row["avg_order_value"], row["items_sold"],
                new_cust.get(row["sale_date"], 0)
            ))
        dst.commit()
    log.info(f"  → {len(rows)} daily_sales records upserted")


def etl_product_performance(src, dst):
    log.info("Running product_performance ETL...")
    with src.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("""
            SELECT
                p.id            AS product_id,
                p.name          AS product_name,
                c.name          AS category_name,
                p.brand,
                COALESCE(SUM(oi.quantity), 0)   AS units_sold,
                COALESCE(SUM(oi.subtotal), 0)   AS total_revenue,
                p.rating_avg    AS avg_rating,
                p.stock         AS stock_remaining
            FROM products p
            LEFT JOIN categories c ON c.id = p.category_id
            LEFT JOIN order_items oi ON oi.product_id = p.id
            LEFT JOIN orders o ON o.id = oi.order_id AND o.status != 'cancelled'
            WHERE p.is_active = TRUE
            GROUP BY p.id, p.name, c.name, p.brand, p.rating_avg, p.stock
        """)
        rows = cur.fetchall()

    with dst.cursor() as cur:
        for row in rows:
            cur.execute("""
                INSERT INTO product_performance
                    (product_id, product_name, category_name, brand,
                     units_sold, total_revenue, avg_rating, stock_remaining, etl_updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW())
                ON CONFLICT (product_id) DO UPDATE SET
                    product_name   = EXCLUDED.product_name,
                    category_name  = EXCLUDED.category_name,
                    brand          = EXCLUDED.brand,
                    units_sold     = EXCLUDED.units_sold,
                    total_revenue  = EXCLUDED.total_revenue,
                    avg_rating     = EXCLUDED.avg_rating,
                    stock_remaining = EXCLUDED.stock_remaining,
                    etl_updated_at = NOW()
            """, (
                row["product_id"], row["product_name"], row["category_name"], row["brand"],
                row["units_sold"], row["total_revenue"], row["avg_rating"], row["stock_remaining"]
            ))
        dst.commit()
    log.info(f"  → {len(rows)} product_performance records upserted")


def etl_category_performance(src, dst):
    log.info("Running category_performance ETL...")
    with src.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("""
            SELECT
                c.id, c.name,
                COUNT(DISTINCT p.id)   AS total_products,
                COALESCE(SUM(oi.quantity), 0) AS units_sold,
                COALESCE(SUM(oi.subtotal), 0) AS total_revenue
            FROM categories c
            LEFT JOIN products p ON p.category_id = c.id
            LEFT JOIN order_items oi ON oi.product_id = p.id
            LEFT JOIN orders o ON o.id = oi.order_id AND o.status != 'cancelled'
            GROUP BY c.id, c.name
        """)
        rows = cur.fetchall()

    with dst.cursor() as cur:
        for row in rows:
            cur.execute("""
                INSERT INTO category_performance
                    (category_id, category_name, total_products, units_sold, total_revenue, etl_updated_at)
                VALUES (%s, %s, %s, %s, %s, NOW())
                ON CONFLICT (category_id) DO UPDATE SET
                    category_name  = EXCLUDED.category_name,
                    total_products = EXCLUDED.total_products,
                    units_sold     = EXCLUDED.units_sold,
                    total_revenue  = EXCLUDED.total_revenue,
                    etl_updated_at = NOW()
            """, (row["id"], row["name"], row["total_products"], row["units_sold"], row["total_revenue"]))
        dst.commit()
    log.info(f"  → {len(rows)} category_performance records upserted")


def etl_customer_segments(src, dst):
    log.info("Running customer_segments ETL...")
    with src.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("""
            SELECT
                u.id,
                COALESCE(SUM(o.total_amount), 0) AS ltv,
                COUNT(o.id) AS order_count
            FROM users u
            LEFT JOIN orders o ON o.user_id = u.id AND o.status != 'cancelled'
            WHERE u.is_admin = FALSE
            GROUP BY u.id
        """)
        users = cur.fetchall()

    segments = {"VIP (>5000)": [], "Regular (1000-5000)": [], "Occasional (<1000)": [], "New (No Orders)": []}
    for u in users:
        ltv = float(u["ltv"])
        if u["order_count"] == 0:
            segments["New (No Orders)"].append(ltv)
        elif ltv >= 5000:
            segments["VIP (>5000)"].append(ltv)
        elif ltv >= 1000:
            segments["Regular (1000-5000)"].append(ltv)
        else:
            segments["Occasional (<1000)"].append(ltv)

    with dst.cursor() as cur:
        for seg, ltvs in segments.items():
            n = len(ltvs)
            total = sum(ltvs)
            avg = total / n if n else 0
            cur.execute("""
                INSERT INTO customer_segments
                    (segment_name, customer_count, total_revenue, avg_ltv, etl_updated_at)
                VALUES (%s, %s, %s, %s, NOW())
                ON CONFLICT (segment_name) DO UPDATE SET
                    customer_count = EXCLUDED.customer_count,
                    total_revenue  = EXCLUDED.total_revenue,
                    avg_ltv        = EXCLUDED.avg_ltv,
                    etl_updated_at = NOW()
            """, (seg, n, total, avg))
        dst.commit()
    log.info(f"  → Customer segments computed")


def etl_monthly_summary(src, dst):
    log.info("Running monthly_summary ETL...")
    with src.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("""
            SELECT
                TO_CHAR(o.created_at, 'YYYY-MM') AS year_month,
                COUNT(o.id)                        AS total_orders,
                SUM(o.total_amount)                AS total_revenue
            FROM orders o
            WHERE o.status != 'cancelled'
            GROUP BY TO_CHAR(o.created_at, 'YYYY-MM')
            ORDER BY year_month
        """)
        rows = cur.fetchall()

        cur.execute("""
            SELECT TO_CHAR(created_at, 'YYYY-MM') AS ym, COUNT(*) as cnt
            FROM users WHERE is_admin = FALSE
            GROUP BY TO_CHAR(created_at, 'YYYY-MM')
        """)
        new_cust = {r["ym"]: r["cnt"] for r in cur.fetchall()}

    with dst.cursor() as cur:
        for row in rows:
            cur.execute("""
                INSERT INTO monthly_summary
                    (year_month, total_orders, total_revenue, new_customers, etl_updated_at)
                VALUES (%s, %s, %s, %s, NOW())
                ON CONFLICT (year_month) DO UPDATE SET
                    total_orders  = EXCLUDED.total_orders,
                    total_revenue = EXCLUDED.total_revenue,
                    new_customers = EXCLUDED.new_customers,
                    etl_updated_at = NOW()
            """, (row["year_month"], row["total_orders"], row["total_revenue"],
                  new_cust.get(row["year_month"], 0)))
        dst.commit()
    log.info(f"  → {len(rows)} monthly_summary records upserted")


def main():
    log.info("=" * 60)
    log.info("Glamora ETL starting")
    start = datetime.now()

    try:
        src = get_conn(MAIN_DB_URL)
        dst = get_conn(REPORTING_DB_URL)

        setup_reporting_schema(dst)
        etl_daily_sales(src, dst)
        etl_product_performance(src, dst)
        etl_category_performance(src, dst)
        etl_customer_segments(src, dst)
        etl_monthly_summary(src, dst)

        elapsed = (datetime.now() - start).total_seconds()
        log.info(f"ETL completed in {elapsed:.2f}s")

    except Exception as e:
        log.error(f"ETL failed: {e}", exc_info=True)
        sys.exit(1)
    finally:
        try:
            src.close()
            dst.close()
        except:
            pass


if __name__ == "__main__":
    main()
