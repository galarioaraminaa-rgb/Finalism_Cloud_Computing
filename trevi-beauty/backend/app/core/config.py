from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Glamora Beauty API"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "glamora-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # Main Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://glamora_user:glamora_pass@localhost:5432/glamora_db"
    )

    # Reporting Database
    REPORTING_DATABASE_URL: str = os.getenv(
        "REPORTING_DATABASE_URL",
        "postgresql://glamora_user:glamora_pass@localhost:5432/glamora_reporting"
    )

    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080",
        "http://localhost",
        "http://YOUR_VPS_IP",        # replace with your VPS IP
        "https://YOUR_DOMAIN.com",   # replace with your domain
    ]

    # Upload
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE: int = 5 * 1024 * 1024  # 5MB

    class Config:
        env_file = ".env"


settings = Settings()
