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

#models.Base.metadata.create_all(bind = engine)
app = FastAPI()

    
@app.get("/")
def home():
    return{"helloworld!"}

app.include_router(post.router)
app.include_router(user.router)
app.include_router(auth.router)  
app.include_router(vote.router)   
