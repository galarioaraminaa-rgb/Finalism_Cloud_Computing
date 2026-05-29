# Trevi Beauty Makeup E-Commerce Platform

A full-stack e-commerce application for makeup and beauty products, built with FastAPI, React, and PostgreSQL. Features a live transactional database, a separate reporting/analytics database, and an automated ETL pipeline.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | FastAPI, SQLAlchemy, Pydantic |
| Auth | JWT (python-jose + passlib) |
| Main Database | PostgreSQL (`glamora_db`) |
| Reporting DB | PostgreSQL (`glamora_reporting`) |
| ETL | Python + psycopg2, cron (hourly) |
| Web Server | Nginx (reverse proxy) |
| Process Manager | systemd |

---

## Features

### Customer-Facing
- Browse products by category, search, and filters
- Product detail pages with reviews and related items
- Shopping cart with live quantity management
- Checkout with address and payment method selection
- Order history and account management
- Responsive, mobile-friendly design

### Admin Dashboard (`/admin`)
- **Overview**: Live KPIs — revenue, orders, users, products
- **Sales**: Daily revenue chart, tabular sales data
- **Products**: Full product management — create, activate/deactivate, paginate
- **Orders**: View all orders, update order status
- **Customers**: Top customers by lifetime value
- **Reporting**: Analytics from the ETL reporting database

### ETL Pipeline
- Runs hourly via Linux cron
- Transfers data from `glamora_db` → `glamora_reporting`
- Populates: `daily_sales`, `product_performance`, `category_performance`, `customer_segments`, `monthly_summary`

---

## Project Structure

```
glamora/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app, CORS, routers
│   │   ├── core/
│   │   │   ├── config.py        # Settings (pydantic-settings)
│   │   │   └── security.py      # JWT, password hashing
│   │   ├── db/
│   │   │   └── database.py      # SQLAlchemy engines (main + reporting)
│   │   ├── models/
│   │   │   └── base.py          # ORM models: User, Product, Order, etc.
│   │   ├── schemas/
│   │   │   └── schemas.py       # Pydantic request/response schemas
│   │   └── api/v1/endpoints/
│   │       ├── auth.py          # /auth/login, /auth/register
│   │       ├── products.py      # /products CRUD
│   │       ├── categories.py    # /categories
│   │       ├── cart.py          # /cart CRUD
│   │       ├── orders.py        # /orders, status updates
│   │       ├── users.py         # /users/me
│   │       ├── reviews.py       # /reviews
│   │       └── analytics.py     # /analytics/* (live + reporting DB)
│   ├── seed.py                  # Database seeder (21 beauty products)
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Router + layout
│   │   ├── context/
│   │   │   ├── AuthContext.jsx  # Auth state + JWT storage
│   │   │   └── CartContext.jsx  # Cart state
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── ProductCard.jsx
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── ShopPage.jsx     # Filter/search/pagination
│   │   │   ├── ProductPage.jsx  # Product detail + reviews
│   │   │   ├── CartPage.jsx
│   │   │   ├── CheckoutPage.jsx
│   │   │   ├── OrdersPage.jsx
│   │   │   ├── AccountPage.jsx
│   │   │   ├── AuthPages.jsx    # Login + Register
│   │   │   └── AdminDashboard.jsx  # Full admin panel
│   │   └── utils/
│   │       └── api.js           # Axios instance
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── etl/
│   └── etl.py                   # ETL: main DB → reporting DB
└── docs/
    ├── DEPLOYMENT_GUIDE.md      # Full VPS deployment steps
    ├── glamora-nginx.conf       # Nginx site config
    └── glamora-api.service      # systemd service file
```

---

## Local Development

### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your local DB credentials

uvicorn app.main:app --reload --port 8000
```

Seed the database:
```bash
python3 seed.py
```

API docs available at: `http://localhost:8000/docs`

### Frontend
```bash
cd frontend
npm install
npm run dev
```

App available at: `http://localhost:3000`

The Vite dev server proxies `/api/*` to `http://localhost:8000`.

---

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@glamora.com | admin123 |
| **Customer** | user@glamora.com | user123 |

---

## ETL Manual Run

```bash
export DATABASE_URL="postgresql://glamora_user:glamora_pass@localhost:5432/glamora_db"
export REPORTING_DATABASE_URL="postgresql://glamora_user:glamora_pass@localhost:5432/glamora_reporting"
python3 etl/etl.py
```

---

## Database Models

- **User** — customers and admins
- **Category** — product categories (8 beauty categories)
- **Product** — beauty products with pricing, stock, ratings
- **Cart / CartItem** — per-user shopping cart
- **Order / OrderItem** — placed orders with line items
- **Review** — product reviews with ratings

---

## Seeded Data

The `seed.py` script creates:
- 1 admin user
- 1 test customer
- 8 beauty categories (Lipstick, Foundation, Eyeshadow, Skincare, Blush/Bronzer, Mascara, Fragrance, Brushes)
- 21 beauty products with realistic prices, brands, and stock levels

---

## Deployment

See `docs/DEPLOYMENT_GUIDE.md` for complete step-by-step instructions to deploy on an Ubuntu 22.04 VPS.
