import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "HOSTELSPHERE"
    PROJECT_TAGLINE: str = "One Hostel. One Platform."
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "hostelsphere-super-secure-jwt-secret-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days for seamless demo
    
    # SQLite default, easily swappable to PostgreSQL
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./hostelsphere.db")
    
    # Host and port
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", 8000))
    
    # Frontend URL for QR generation
    NEXT_PUBLIC_APP_URL: str = os.getenv("NEXT_PUBLIC_APP_URL", "http://localhost:3000")
    UNIVERSITY_PAYMENT_URL: str = os.getenv("UNIVERSITY_PAYMENT_URL", "https://payments.hostelsphere.university.edu")

    # Allowed CORS Origins - allows any local network device (phone on Wi-Fi)
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]

    model_config = SettingsConfigDict(case_sensitive=True)

settings = Settings()
