from datetime import date, timedelta

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from pydantic import BaseModel

from libs.psql import db

router = APIRouter(
    tags=["jobs"],
    responses={404: {"description": "Not found"}},
)


@router.get('/')
async def get_jobs():
    days, date_format = {}, '%Y-%m-%d'
    jobs = await db.fetch_all('select * from jobs')
    for job in jobs:
        job_data = dict(job._mapping)
        for d in range((job['date_to'] - job['date_from']).days + 1):
            current_date = job['date_from'] + timedelta(days=d)
            if current_date not in days:
                est_personel = await db.fetch_one('select sum(estimated_personel) from services where day = :day', {'day': current_date})
                print(dict(est_personel._mapping))
                days[current_date] = {'personel_sum': est_personel._mapping['sum'], 'jobs': []}
            days[current_date]['jobs'].append(job_data)
    return days


@router.get('/finished')
async def get_finished_jobs():
    data = []
    jobs = await db.fetch_all('select id, name, contractor_place, date_from, date_to, transport_cost, accommodation_cost, confirmed from jobs where finished = true order by id')
    for job in jobs:
        job = dict(job._mapping)
        services = await db.fetch_all('select a.name, a.price, real_time, real_personel, b.price_per_hour from services a join types_of_services b on a.service_type_id = b.id where job_id = :id', {'id': job['id']})
        
        services_cost_sum = 0
        for service in services:
            if service._mapping['price_per_hour'] == True:
                services_cost_sum += service._mapping['price'] * service._mapping['real_time'] * service._mapping['real_personel']
                continue
            services_cost_sum += service._mapping['price'] * service._mapping['real_time']

        job['all_costs'] = services_cost_sum + job['accommodation_cost'] + job['transport_cost']
        job['services'] = services
        data.append(job)
    return data


@router.get('/confirm/{job_id}')
async def confirm_job(job_id: int):
    await db.execute('update jobs set confirmed = true where id = :id', {'id': job_id})
    return {'message': f'Zlecenie nr {job_id} zatwierdzone.'}


@router.get('/{job_id}')
async def get_job(job_id: int):
    job = await db.fetch_one('select * from jobs where id = :id', {'id': job_id})
    services = await db.fetch_all('select a.*, b.name as service_name from services a join types_of_services b on a.service_type_id = b.id and job_id = :job_id order by a.day, a.id', {'job_id': job_id})
    job = dict(job._mapping)
    job['services'] = services
    return job


@router.delete('/{job_id}')
async def delete_job(job_id: int):
    await db.execute('delete from services where job_id = :id', {'id': job_id})
    await db.execute('delete from jobs where id = :id', {'id': job_id})
    return {'message': f'Zlecenie {job_id} usniete'}


class Service(BaseModel):
    day: date
    serviceType: int 
    estTime: int
    estPersons: int


class Job(BaseModel):
    name: str
    desc: str
    dateFrom: date
    dateTo: date
    services: list[Service]


@router.post('/')
async def add_job(job: Job):
    job_values = {'name': job.name, 'desc': job.desc, 'from': job.dateFrom, 'to': job.dateTo}
    new_job = await db.fetch_one('insert into jobs(name, contractor_place, date_from, date_to) values (:name, :desc, :from, :to) returning id', job_values)

    job_id = new_job._mapping['id']
    for s in job.services:
        sd = await db.fetch_one('select price, name from types_of_services where id = :id', {'id': s.serviceType})
        name = sd._mapping['name']
        price = sd._mapping['price']
        service_values = {'jid': job_id, 'sid': s.serviceType, 'day': s.day, 'est_time': s.estTime, 'est_persons': s.estPersons, 'name': name, 'price': price}
        await db.execute('insert into services (job_id, service_type_id, day, estimated_time, estimated_personel, name, price) values(:jid, :sid, :day, :est_time, :est_persons, :name, :price)', service_values)

    return {'message': 'Zlecenie dodane!'}


class JobId(BaseModel):
    number: int


@router.post('/accept')
async def accept_job(job_id: JobId):
    res = await db.fetch_one('select accepted, finished from jobs where id = :id', {'id': job_id.number})
    if res._mapping['accepted'] is True and res._mapping['finished'] is True:
        raise HTTPException(status_code=403, detail='Zlecenie zostalo zaakceptowane i zakonczone.')
    elif res._mapping['finished'] is True:
        raise HTTPException(status_code=403, detail='Zlecenie zakonczone.')
    elif res._mapping['accepted'] is True:
        raise HTTPException(status_code=403, detail='Zlecenie jest juz zaakecptowane.')

    await db.execute('update jobs set accepted = true where id = :id', {'id': job_id.number})
    return {'message': 'Zaakceptowano zlecenie.'}


class JobFinishData(BaseModel):
    job_id: int
    transport: int
    accommodation: int


@router.post('/finish')
async def accept_job(data: JobFinishData):
    res = await db.fetch_one('select accepted, finished from jobs where id = :id', {'id': data.job_id})
    if res._mapping['accepted'] is True and res._mapping['finished'] is True:
        raise HTTPException(status_code=403, detail='Zlecenie zostalo juz zaakceptowane i zakonczone.')
    elif res._mapping['finished'] is True:
        raise HTTPException(status_code=403, detail='Zlecenie juz zakonczone.')
    elif res._mapping['accepted'] is False:
        raise HTTPException(status_code=403, detail='Zlecenie nie zostalo jeszcze zaakceptowane.')

    res = await db.fetch_one('select 1 from services where job_id = :id and real_time is null and real_personel is null', {'id': data.job_id})
    if res is not None:
        raise HTTPException(status_code=403, detail='Nie mozna zakonczyc.')

    values = {'transport': data.transport, 'accommodation': data.accommodation, 'id': data.job_id}
    await db.execute('update jobs set finished = true, transport_cost = :transport, accommodation_cost = :accommodation where id = :id', values)

    return {'message': 'Zlecenie poprawnie zakonczone.'}


class Day(BaseModel):
    job_id: int
    service_id: int
    time: int
    persons: int


@router.post('/save-day')
async def save_day(day: Day):
    res = await db.fetch_one('select day from services where id = :sid and job_id = :jid', {'sid': day.service_id, 'jid': day.job_id})
    if res is None:
        raise HTTPException(status_code=404, detail=f'Brak servisu od id {day.service_id} dla zlecenia {day.job_id}.')

    current_date = date.today()
    if res._mapping['day'] > current_date:
        raise HTTPException(status_code=403, detail=f'Mozna uzupelnic od dnia {current_date}.')

    await db.execute('update services set real_time = :time, real_personel = :personel where id = :sid', {'time': day.time, 'personel': day.persons, 'sid': day.service_id})
    return {'message': 'Dzien zapisany'}


@router.get('/ready-to-finish/{job_id}')
async def check_if_job_is_ready_to_finish(job_id: int):
    res = await db.fetch_one('select accepted, finished from jobs where id = :id', {'id': job_id}) 
    if not (res._mapping['accepted'] is True and res._mapping['finished'] is False):
        raise HTTPException(status_code=403, detail='Zlecenie nie moze zostac jeszcze zakonczone')

    res = await db.fetch_one('select 1 from services where job_id = :id and real_time is null and real_personel is null', {'id': job_id})
    if res is not None:
        raise HTTPException(status_code=403, detail='Zlecenie nie moze zostac jeszcze zakonczone, najpierw uwupelnij dane serwisow.')
    
    return {'message': 'Zlecenie gotowe do zakonczenia, uzupelnij dodatkowe dane.'}
