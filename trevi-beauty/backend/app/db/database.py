from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Main transactional DB
engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True, pool_size=10, max_overflow=20)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Reporting DB
reporting_engine = create_engine(settings.REPORTING_DATABASE_URL, pool_pre_ping=True)
ReportingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=reporting_engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_reporting_db():
    db = ReportingSessionLocal()
    try:
        yield db
    finally:
        db.close()
