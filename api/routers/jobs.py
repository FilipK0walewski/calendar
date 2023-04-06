from datetime import date, datetime, timedelta
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
    jobs = await db.fetch_all('select a.*, b.date_from service_from, b.date_to service_to, b.number_of_persons, c.name service_name from jobs a join services b on a.id = b.job_id join types_of_services c on b.service_type_id = c.id')
    for job in jobs:
        job_data = dict(job._mapping)
        for d in range((job['service_to'] - job['service_from']).days + 1):
            current_date = job['service_from'] + timedelta(days=d)
            if current_date not in days:
                days[current_date] = []
            
            days[current_date].append({
                'job_id': job_data['id'],
                'job_name': job_data['name'],
                'job_desc': job_data['contractor_place'],
                'service_type': job_data['service_name'],
                'number_of_persons': job_data['number_of_persons'],
                'service_start': job_data['service_from'],
                'service_end': job_data['service_to'],
                'job_start': job_data['date_from'],
                'job_end': job_data['date_to']
            })

    return days


class Service(BaseModel):
    serviceType: int 
    dateFrom: date
    dateTo: date
    persons: int


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
    print(new_job)

    new_job_id = new_job._mapping['id']
    for s in job.services:
        service_values = {'job': new_job_id, 's_id': s.serviceType,'from': s.dateFrom, 'to': s.dateTo, 'nop': s.persons}
        await db.execute('insert into services(job_id, service_type_id, date_from, date_to, number_of_persons) values(:job, :s_id, :from, :to, :nop)', service_values)

    return {'message': 'Zlecenie dodane!'}
