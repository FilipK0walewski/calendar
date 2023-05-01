from fastapi import APIRouter, Depends, Header, HTTPException, Request
from pydantic import BaseModel

from libs.psql import db

router = APIRouter(
    tags=["services"],
    responses={404: {"description": "Not found"}},
)


@router.get('/')
async def get_services():
    return await db.fetch_all('select * from types_of_services')


class Service(BaseModel):
    name: str
    price: float


@router.post('/')
async def add_service(service: Service):
    await db.execute('insert into types_of_services(name, price) values (:name, :price)', {'name': service.name, 'price': service.price})
    return {'message': 'Usługa dodana.'}


@router.put('/{service_id}')
async def edit_service(service_id: int, service: Service):
    res = await db.fetch_one('select 1 from types_of_services where id != :id and name = :name', {'id': service_id, 'name': service.name})
    if res is not None:
        raise HTTPException(status_code=400, detail={'message': 'Usługa o tej nazwie już istnieje.'})
    await db.execute('update types_of_services set name = :name, price = :price where id = :id', {'id': service_id, 'name': service.name, 'price': service.price})
    return {'message': 'Usługa zaktualizowana.'}


@router.delete('/{service_id}')
async def delete_service(service_id: int):
    res = await db.fetch_one('delete from types_of_services where id = :id returning name', {'id': service_id})
    return res