import bcrypt
import datetime
import jwt
import os

from fastapi import Header, HTTPException

key = os.environ.get('JWT_KEY', 'dsaiufsiudyfiuhdsakjdhsahdaksdh')


def check_password(plain_text_password, hashed_password):
    return bcrypt.checkpw(plain_text_password.encode(), hashed_password)


def get_hashed_password(plain_text_password):
    return bcrypt.hashpw(plain_text_password.encode(), bcrypt.gensalt())


def generate_jwt_token(user_id):
    return jwt.encode({'user_id': user_id}, key, algorithm="HS256")


def generate_game_token(guuid, user_id, username, img_url, sound_url):
    payload = {'game_uuid': guuid, 'user_id': user_id, 'username': username, 'img_url': img_url, 'sound_url': sound_url}
    return jwt.encode(payload, key, algorithm="HS256")


async def get_user_id(token: str | None = Header(default=None)):
    user_id = None
    try:
        payload = jwt.decode(token, key, ['HS256'])
        user_id = payload['user_id']
    except jwt.exceptions.DecodeError:
        pass
    return user_id


async def verify_token(token: str = Header()):
    try:
        payload = jwt.decode(token, key, ['HS256'])
    except jwt.exceptions.DecodeError:
        raise HTTPException(status_code=403, detail='Invalid token.')
    return payload['user_id']
