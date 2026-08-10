from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

if settings.database_url:
    # Render / Heroku database URLs often start with postgres://, fix for SQLAlchemy 1.4+
    sql_url = settings.database_url.replace("postgres://", "postgresql://", 1)
else:
    sql_url = f"postgresql://{settings.database_username}:{settings.database_password}@{settings.database_hostname}:{settings.database_port}/{settings.database_name}"

engine = create_engine(sql_url)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
