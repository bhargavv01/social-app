from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CreatePost(BaseModel):
    title : str
    content : str
    published : bool = True

class UpdatePost(BaseModel):
    title : Optional[str] = None
    content : Optional[str] = None
    published : Optional[bool] = None

class User(BaseModel):
    email : str
    id : int
    class Config:
        orm_mode = True
        
class Post(BaseModel):
    id : int
    owner_id : int
    title : str
    content : str
    published : bool
    created_at : datetime
    owner : User

    class Config:
        orm_mode = True 
        
class PostOut(BaseModel):
    Post : Post
    votes : int

    class Config:
        orm_mode = True

class CreateUser(BaseModel):
    email : str
    password : str

class Vote(BaseModel):
    post_id : int
    dir : bool

class UserLogin(BaseModel):
    email : str
    password : str

class Token(BaseModel):
    access_token : str
    token_type : str

class TokenData(BaseModel):
    id : Optional[str] = None
