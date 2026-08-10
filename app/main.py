from fastapi import HTTPException, Depends, Response
from fastapi import status
from typing import Optional
import psycopg2
from psycopg2.extras import RealDictCursor
from fastapi import FastAPI
from fastapi.params import Body
from pydantic import BaseModel
import time
from . import models, schemas, utils
from .database import engine, SessionLocal, get_db
from sqlalchemy.orm import Session
from .routers import post, user, auth, vote
from fastapi.middleware.cors import CORSMiddleware
from .middleware import RateLimiterMiddleware

models.Base.metadata.create_all(bind=engine)
app = FastAPI(title="Social App API", version="1.0.0")

# Add Rate Limiter Middleware (120 requests / minute)
app.add_middleware(RateLimiterMiddleware, max_requests=120, window_seconds=60)

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

    
@app.get("/")
def home():
    return {"message": "helloworld!"}

app.include_router(post.router)
app.include_router(user.router)
app.include_router(auth.router)  
app.include_router(vote.router)   
