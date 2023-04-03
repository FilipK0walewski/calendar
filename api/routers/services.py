from fastapi import APIRouter, Depends, Header, HTTPException, Request
from pydantic import BaseModel

from libs.psql import db

router = APIRouter(
    tags=["services"],
    responses={404: {"description": "Not found"}},
)


@router.get('/')
async def get_services():
    return await db.fetch_all('select id, name from types_of_services')


class Service(BaseModel):
    name: str


@router.post('/')
async def add_service(service: Service):
    await db.execute('insert into types_of_services(name) values (:name)', {'name': service.name})
    return service


@router.delete('/{service_id}')
async def delete_service(service_id: int):
    res = await db.fetch_one('delete from types_of_services where id = :id returning name', {'id': service_id})
    return res