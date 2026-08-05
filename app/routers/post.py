import time
import psycopg2
from psycopg2.extras import RealDictCursor  
from fastapi import APIRouter, HTTPException, Depends, Response
from fastapi import status
from typing import Optional
from sqlalchemy.orm import Session
from .. import models, schemas, utils, oauth2 
from ..database import engine, SessionLocal, get_db
from sqlalchemy import func


router = APIRouter()

@router.post("/posts", response_model=schemas.Post) 
def create_post(post : schemas.CreatePost, db: Session = Depends(get_db), status_code=status.HTTP_201_CREATED, current_user: models.User = Depends(oauth2.get_current_user)):

    new_post = models.Post(owner_id=current_user.id, **post.dict())
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    return new_post

@router.get("/posts"  , response_model=list[schemas.PostOut], status_code=status.HTTP_200_OK)
def get_all(db: Session = Depends(get_db)):
    posts = db.query(models.Post, func.count(models.Vote.post_id).label("votes")).join(models.Vote, models.Vote.post_id == models.Post.id, isouter=True).group_by(models.Post.id).all()
    return posts

@router.get("/posts/{id}", response_model = schemas.PostOut )
def get_post(id : int, db: Session = Depends(get_db)):
    post = db.query(models.Post, func.count(models.Vote.post_id).label("votes")).join(models.Vote, models.Vote.post_id == models.Post.id, isouter=True).group_by(models.Post.id).filter(models.Post.id == id).first()

    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail=f"post with id: {id} was not found")

    return post

@router.delete("/posts/{id}")
def delete_post(id : int, db: Session = Depends(get_db), current_user: models.User = Depends(oauth2.get_current_user)):
    post = db.query(models.Post).filter(models.Post.id == id)
    if post.first() == None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail= "not found")
    owner_id = str(post.first().owner_id)
    print(type(current_user.id))
    if owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail= "not authorized to perform requested action")
    post.delete(synchronize_session=False)
    db.commit()
    return Response(status_code =  status.HTTP_204_NO_CONTENT)
