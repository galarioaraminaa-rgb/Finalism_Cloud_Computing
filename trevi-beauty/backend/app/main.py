from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import logging

from app.core.config import settings
from app.db.database import engine
from app.models import base
from app.api.v1.endpoints import (
    auth, products, categories, orders, users, cart, reviews, analytics
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Glamora API...")
    base.Base.metadata.create_all(bind=engine)
    yield
    logger.info("Shutting down Glamora API...")


app = FastAPI(
    title="Glamora Beauty API",
    description="E-Commerce API for Makeup & Beauty Products",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,       prefix="/api/v1/auth",       tags=["Authentication"])
app.include_router(users.router,      prefix="/api/v1/users",      tags=["Users"])
app.include_router(categories.router, prefix="/api/v1/categories", tags=["Categories"])
app.include_router(products.router,   prefix="/api/v1/products",   tags=["Products"])
app.include_router(cart.router,       prefix="/api/v1/cart",       tags=["Cart"])
app.include_router(orders.router,     prefix="/api/v1/orders",     tags=["Orders"])
app.include_router(reviews.router,    prefix="/api/v1/reviews",    tags=["Reviews"])
app.include_router(analytics.router,  prefix="/api/v1/analytics",  tags=["Analytics"])


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "Glamora Beauty API"}
