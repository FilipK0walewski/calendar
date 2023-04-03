import base64
import os

from fastapi import HTTPException, FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from libs.psql import db
from routers import users

app = FastAPI()

@app.on_event("startup")
async def startup():
    await db.connect()


@app.on_event("shutdown")
async def shutdown():
    await db.disconnect()


app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(users.router, prefix='/api/users')
