from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    DATABASE_URL: str
    REDIS_URL: str
    S3_ENDPOINT: str = "http://minio:9000"
    S3_ACCESS_KEY: str
    S3_SECRET_KEY: str
    S3_BUCKET: str = "loadlens-models"
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    SECRET_KEY: str
    ALGORITHM: str = "RS256"
    RATE_LIMIT_AUDIT: int = 10
    RATE_LIMIT_SIMULATE: int = 60

    class Config:
        env_file = ".env"


settings = Settings()
