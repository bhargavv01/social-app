from pathlib import Path
from typing import Optional
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    database_url: Optional[str] = None
    database_hostname: Optional[str] = "localhost"
    database_port: Optional[int] = 5432
    database_password: Optional[str] = "postgres"
    database_name: Optional[str] = "fastapi_db"
    database_username: Optional[str] = "postgres"
    secret_key: str = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    model_config = {
        "env_file": str(BASE_DIR / ".env"),
        "env_file_encoding": "utf-8",
        "case_sensitive": False,
    }

settings = Settings()