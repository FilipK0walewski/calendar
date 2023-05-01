import base64
import jwt
import os
import uuid

from fastapi import APIRouter, Depends, Header, HTTPException, Request, UploadFile

from libs.common import check_password, get_hashed_password, generate_jwt_token, verify_token
from libs.psql import db
from models.users import Passwords, UserIn, UserLogin, UserOut

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
        raise HTTPException(status_code=403, detail='Niepoprawna nazwa użytkownika lub hasło.')
    if check_password(user.password, data._mapping['password']) is False:
        raise HTTPException(status_code=403, detail='Niepoprawna nazwa użytkownika lub hasło.')
    token = generate_jwt_token(data._mapping['id'])
    return {'token': token, 'username': user.username}


@router.post('/set-password')
async def set_password(data: Passwords, user_id: int = Depends(verify_token)):
    res = await db.fetch_one('select password from users where id = :id', {'id': user_id})
    print(res)
    if res is None:
        raise HTTPException(status_code=401, detail='Brak dostępu')
    if check_password(data.old, res._mapping['password']) is False:
        raise HTTPException(status_code=403, detail='Niepoprawne hasło.')    
    if data.new != data.confirm:
        raise HTTPException(status_code=400, detail='Hasła nie są takie same.')
    if data.old == data.new:
        raise HTTPException(status_code=400, detail='Nowe i stare hasła są takie same.')

    hashed_password = get_hashed_password(data.new)
    await db.execute('update users set password = :password where id = :id', {'id': user_id, 'password': hashed_password})
    return {'message': 'Hasło zmienione'}
