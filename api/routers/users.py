import base64
import os
import uuid

from fastapi import APIRouter, Depends, Header, HTTPException, Request, UploadFile

from libs.common import check_password, get_hashed_password, generate_jwt_token, verify_token
from libs.psql import db
from models.users import UserIn, UserLogin, UserOut

router = APIRouter(
    tags=["users"],
    responses={404: {"description": "Not found"}},
)


@router.get('/')
async def get_user(user_id: int = Depends(verify_token)):
    return await db.fetch_one('select username, is_admin, is_coordinator from users where id = :uid', {'uid': user_id})


@router.get('/username')
async def get_username(user_id: int = Depends(verify_token)):
    return await db.fetch_one('select username from users where id = :uid', {'uid': user_id})


@router.post('/')
async def create_user(user: UserIn):
    if len(user.username) == 0:
        raise HTTPException(status_code=400, detail="Niepoprawna nazwa użytkownika.")

    if len(user.password) == 0:
        raise HTTPException(status_code=400, detail="Niepoprawne hasło.")

    a = await db.fetch_one('select 1 from users where username = :u', {'u': user.username})
    if a is not None:
        raise HTTPException(status_code=400, detail=f"Użytkownik '{user.username}' już istnieje.")
    
    hashed_password = get_hashed_password(user.password)
    values = {'u': user.username, 'p': hashed_password, 'a': user.admin, 'c': user.coordinator}
    await db.fetch_one('insert into users(username, password, is_admin, is_coordinator) values(:u, :p, :a, :c)', values)
    return {'message': f'Użytkownik {user.username} dodany.'}


@router.post('/login')
async def login(user: UserLogin):
    data = await db.fetch_one('select id, password from users where username = :u', {'u': user.username})
    if data is None:
        raise HTTPException(status_code=403, detail='Invalid username or password.')
    if check_password(user.password, data._mapping['password']) is False:
        raise HTTPException(status_code=403, detail='Invalid username or password.')
    token = generate_jwt_token(data._mapping['id'])
    return {'token': token, 'username': user.username}
