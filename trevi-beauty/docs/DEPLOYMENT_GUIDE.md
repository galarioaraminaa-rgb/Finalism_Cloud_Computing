# Glamora Beauty E-Commerce — VPS Deployment Guide

## System Overview

```
Internet → Nginx (port 80/443)
               ├── / → React Frontend (static files)
               ├── /api/ → FastAPI Backend (port 8000)
               └── /docs → FastAPI Swagger UI

FastAPI → PostgreSQL (glamora_db)       ← Main transactional DB
       → PostgreSQL (glamora_reporting) ← Reporting/analytics DB

Cron → etl.py (runs hourly)            ← ETL: main DB → reporting DB
```

---

## Prerequisites

- Ubuntu 22.04 VPS (1 vCPU, 2GB RAM minimum)
- Root or sudo access
- A domain name (optional but recommended)
- Ports 22, 80, 443 open in firewall

---

## STEP 1 — Update & Install System Packages

```bash
sudo apt update && sudo apt upgrade -y

sudo apt install -y \
    nginx \
    postgresql postgresql-contrib \
    python3 python3-pip python3-venv \
    nodejs npm \
    git curl unzip \
    certbot python3-certbot-nginx
```

Install Node.js 20 (required for Vite build):
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version   # should be v20.x
```

---

## STEP 2 — Configure PostgreSQL

```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql

sudo -u postgres psql << 'SQL'
CREATE USER glamora_user WITH PASSWORD 'glamora_pass';
CREATE DATABASE glamora_db OWNER glamora_user;
CREATE DATABASE glamora_reporting OWNER glamora_user;
GRANT ALL PRIVILEGES ON DATABASE glamora_db TO glamora_user;
GRANT ALL PRIVILEGES ON DATABASE glamora_reporting TO glamora_user;
\q
SQL
```

Verify connection:
```bash
psql -U glamora_user -h localhost -d glamora_db -c "\l"
```

---

## STEP 3 — Upload Project Files

### Option A: Using SCP (from your local machine)
```bash
# From your local machine, zip and upload
zip -r glamora.zip glamora/
scp glamora.zip ubuntu@YOUR_VPS_IP:/var/www/

# On the VPS
sudo mkdir -p /var/www/glamora
sudo chown -R $USER:$USER /var/www/glamora
cd /var/www/glamora
unzip /var/www/glamora.zip
```

### Option B: Using Git
```bash
sudo mkdir -p /var/www/glamora
sudo chown -R $USER:$USER /var/www/glamora
cd /var/www/glamora
git clone https://github.com/YOUR_USERNAME/glamora.git .
```

Your final directory layout should be:
```
/var/www/glamora/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── core/  (config.py, security.py)
│   │   ├── db/    (database.py)
│   │   ├── models/ (base.py)
│   │   ├── schemas/ (schemas.py)
│   │   └── api/v1/endpoints/ (auth.py, products.py, ...)
│   ├── seed.py
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
└── etl/
    └── etl.py
```

---

## STEP 4 — Backend Setup

```bash
cd /var/www/glamora

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Create environment file
cp backend/.env.example backend/.env
nano backend/.env
```

Edit `.env` with your values:
```env
SECRET_KEY=your-very-long-random-secret-key-here-minimum-32-chars
DATABASE_URL=postgresql://glamora_user:glamora_pass@localhost:5432/glamora_db
REPORTING_DATABASE_URL=postgresql://glamora_user:glamora_pass@localhost:5432/glamora_reporting
ALLOWED_ORIGINS=["http://YOUR_VPS_IP","https://YOUR_DOMAIN.com"]
```

Generate a secure secret key:
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

Test backend starts correctly:
```bash
cd /var/www/glamora/backend
source ../venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000
# Should show: INFO: Application startup complete.
# Press Ctrl+C to stop
```

---

## STEP 5 — Seed the Database

```bash
cd /var/www/glamora/backend
source ../venv/bin/activate
python3 seed.py
```

Expected output:
```
✅ Database seeded successfully!
   Admin: admin@glamora.com / admin123
   User:  user@glamora.com  / user123
```

---

## STEP 6 — Frontend Build

```bash
cd /var/www/glamora/frontend

# Install npm packages
npm install

# Build for production
npm run build
```

This creates `/var/www/glamora/frontend/dist/` — the static files Nginx will serve.

**Important**: Before building, update the API base URL in `src/utils/api.js` if not using a proxy:
```javascript
// src/utils/api.js — for production (if not using nginx proxy)
const api = axios.create({
  baseURL: '/api/v1',  // This works with the nginx proxy config
  timeout: 15000,
})
```

---

## STEP 7 — Configure Nginx

```bash
sudo cp /var/www/glamora/docs/glamora-nginx.conf /etc/nginx/sites-available/glamora

# Edit the config to replace YOUR_VPS_IP and YOUR_DOMAIN.com
sudo nano /etc/nginx/sites-available/glamora

# Enable the site
sudo ln -s /etc/nginx/sites-available/glamora /etc/nginx/sites-enabled/

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
sudo systemctl enable nginx
```

---

## STEP 8 — Create Systemd Service (Backend Auto-start)

```bash
sudo cp /var/www/glamora/docs/glamora-api.service /etc/systemd/system/

# Edit the service file if your username is not 'ubuntu'
sudo nano /etc/systemd/system/glamora-api.service

# Enable and start the service
sudo systemctl daemon-reload
sudo systemctl enable glamora-api
sudo systemctl start glamora-api

# Check status
sudo systemctl status glamora-api
```

View logs:
```bash
sudo journalctl -u glamora-api -f
```

---

## STEP 9 — Set Up ETL Cron Job

```bash
# Make ETL script executable
chmod +x /var/www/glamora/etl/etl.py

# Open crontab
crontab -e
```

Add this line to run ETL every hour:
```cron
0 * * * * /var/www/glamora/venv/bin/python3 /var/www/glamora/etl/etl.py >> /var/log/glamora_etl.log 2>&1
```

Run ETL manually to populate reporting DB right away:
```bash
DATABASE_URL="postgresql://glamora_user:glamora_pass@localhost:5432/glamora_db" \
REPORTING_DATABASE_URL="postgresql://glamora_user:glamora_pass@localhost:5432/glamora_reporting" \
/var/www/glamora/venv/bin/python3 /var/www/glamora/etl/etl.py
```

Check ETL logs:
```bash
tail -f /var/log/glamora_etl.log
```

---

## STEP 10 — SSL Certificate (HTTPS) — Optional but Recommended

If you have a domain pointed to your VPS:
```bash
sudo certbot --nginx -d YOUR_DOMAIN.com -d www.YOUR_DOMAIN.com
# Follow prompts, certbot will auto-update nginx config

# Auto-renewal test
sudo certbot renew --dry-run
```

---

## STEP 11 — Firewall Setup

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

---

## Verification Checklist

After deployment, verify these URLs work:

| URL | Expected Result |
|-----|----------------|
| `http://YOUR_VPS_IP/` | Glamora homepage loads |
| `http://YOUR_VPS_IP/shop` | Product listing page |
| `http://YOUR_VPS_IP/login` | Login page with demo credentials |
| `http://YOUR_VPS_IP/api/v1/products` | JSON list of products |
| `http://YOUR_VPS_IP/health` | `{"status": "ok"}` |
| `http://YOUR_VPS_IP/docs` | FastAPI Swagger UI |
| `http://YOUR_VPS_IP/admin` | Admin dashboard (login as admin first) |

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@glamora.com | admin123 |
| Customer | user@glamora.com | user123 |

---

## Architecture Summary

| Component | Technology | Port | Location |
|-----------|-----------|------|----------|
| Frontend | React + Vite + Tailwind | served by Nginx | `/var/www/glamora/frontend/dist` |
| Backend API | FastAPI + SQLAlchemy | 8000 (internal) | `/var/www/glamora/backend` |
| Main Database | PostgreSQL | 5432 (internal) | `glamora_db` |
| Reporting DB | PostgreSQL | 5432 (internal) | `glamora_reporting` |
| ETL Script | Python + psycopg2 | cron (hourly) | `/var/www/glamora/etl/etl.py` |
| Reverse Proxy | Nginx | 80/443 | `/etc/nginx/sites-available/glamora` |

---

## Common Issues & Fixes

**502 Bad Gateway**
```bash
sudo systemctl status glamora-api    # Check if backend is running
sudo journalctl -u glamora-api -n 50 # View recent logs
```

**Database connection error**
```bash
sudo -u postgres psql -c "\l"        # List databases
psql -U glamora_user -h localhost -d glamora_db  # Test connection
```

**Frontend shows blank page**
```bash
ls /var/www/glamora/frontend/dist    # Confirm build exists
sudo nginx -t                        # Check nginx config
sudo systemctl reload nginx
```

**ETL not running**
```bash
crontab -l                           # Verify cron entry
cat /var/log/glamora_etl.log        # Check ETL log
```

---

## ETL Schedule

The ETL runs hourly and populates these reporting tables:

| Table | Description |
|-------|-------------|
| `daily_sales` | Revenue, orders, and new customers per day |
| `product_performance` | Units sold, revenue, and rating per product |
| `category_performance` | Revenue and units sold per category |
| `customer_segments` | VIP, Regular, Occasional, and New segments |
| `monthly_summary` | Monthly totals and returning customer rate |

These are viewable in the Admin Dashboard under the **Reporting** tab.

---

## API Endpoints Quick Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login (returns JWT) |
| GET | `/api/v1/products` | List products (paginated) |
| GET | `/api/v1/products/{slug}` | Single product |
| GET | `/api/v1/categories` | All categories |
| GET | `/api/v1/cart` | User's cart |
| POST | `/api/v1/cart/items` | Add to cart |
| POST | `/api/v1/orders` | Place order |
| GET | `/api/v1/orders` | User's orders |
| GET | `/api/v1/analytics/summary` | Admin: live stats |
| GET | `/api/v1/analytics/sales-by-day` | Admin: daily sales |
| GET | `/api/v1/analytics/top-products` | Admin: top products |
| GET | `/api/v1/analytics/reporting/sales-overview` | Admin: ETL data |
