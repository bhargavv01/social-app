import time
import psycopg2
from psycopg2.extras import RealDictCursor  
from fastapi import APIRouter, HTTPException, Depends, Response
from fastapi import status
from typing import Optional
from sqlalchemy.orm import Session
from .. import models, schemas, utils
from ..database import engine, SessionLocal, get_db


router = APIRouter()

@router.get("/users/{id}", response_model=schemas.User)
def get_user(id : int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail= "not found")
    return user

@router.post("/users", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
def create_user(user: schemas.CreateUser, db: Session = Depends(get_db)):
    # Hash the password before storing it
    hashed_password = utils.hash(user.password)
    user_data = user.dict()
    user_data["password"] = hashed_password
    new_user = models.User(**user_data)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user