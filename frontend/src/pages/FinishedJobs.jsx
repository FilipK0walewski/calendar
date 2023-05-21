import instance from "../services/Common"
import { useEffect, useState } from "react"
import { useSelector } from 'react-redux'

export const FinishedJobs = () => {

    const admin = useSelector((state) => state.common.admin)
    const [finishedJobs, setFinishedJobs] = useState([])

    const getFinishedJobs = () => {
        instance.get('/jobs/finished').then(res => {
            setFinishedJobs(res.data)
        })
    }

    const handleConfirm = (id) => {
        instance.get(`/jobs/confirm/${id}`).then(() => {
            getFinishedJobs()
        })
    }

    useEffect(() => {
        getFinishedJobs()
    }, [])

    return (
        <>
            <p className="mb-2">Lista zakończonych zleceń</p>
            <table className="hidden lg:table w-full table-auto text-sm">
                <thead>
                    <tr>
                        <th className="border border-slate-400">nazwa</th>
                        <th className="border border-slate-400">kontrahent</th>
                        <th className="border border-slate-400">rozpoczęcie</th>
                        <th className="border border-slate-400">koniec</th>
                        <th className="border border-slate-400">koszty</th>
                        <th className="border border-slate-400">zatwierdzono</th>
                    </tr>
                </thead>
                <tbody>
                    {finishedJobs.map((job, i) => (
                        <tr key={i}>
                            <td className="border border-slate-600 px-1">{job.name}</td>
                            <td className="border border-slate-600 px-1">{job.contractor_place}</td>
                            <td className="border border-slate-600 px-1">{job.date_from.split('-').reverse().join('.')}</td>
                            <td className="border border-slate-600 px-1">{job.date_from.split('-').reverse().join('.')}</td>
                            <td className="border border-slate-600 px-1"><ul>
                                {job.services.map((service, j) => (
                                    <li key={j}>
                                        {service.price_per_hour === true ? <>
                                            {service.name} - {service.real_personel} os. * {service.real_time}h * {service.price} zł = {service.real_personel * service.real_time * service.price} zł
                                        </> : <>
                                            {service.name} - {service.real_time}sztuk * {service.price} zł = {service.real_time * service.price} zł
                                        </>}
                                    </li>
                                ))}
                                {job.transport_cost ? <li>transport: {job.transport_cost} zł</li> : null}
                                {job.accommodation_cost ? <li>zakwaterowanie: {job.accommodation_cost} zł</li> : null}
                                <li className="font-bold text-cyan-400">suma: {job.all_costs} zł</li>
                            </ul></td>
                            <td className="border border-slate-600 px-1 space-x-2">
                                <span>{job.confirmed === true ? 'TAK' : 'NIE'}</span>
                                {admin === true && job.confirmed !== true ? <button onClick={() => handleConfirm(job.id)} className="bg-emerald-500 p-1 rounded-sm">Zatwierdź</button> : null}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="lg:hidden space-y-4 text-sm">
                {finishedJobs.map((job, i) => (<>
                    <ul key={i}>
                        <li>nazwa: {job.name}</li>
                        <li>kontrahent: {job.contractor_place}</li>
                        <li>od {job.date_from} do {job.date_to}</li>
                        <li className="py-1">
                            <span className="underline">koszty:</span>
                            <ul className="list-disc list-inside">
                                {job.services.map((service, j) => (
                                    <li key={j}>
                                        {service.price_per_hour === true ? <>
                                            {service.name} - {service.real_personel} os. * {service.real_time}h * {service.price} zł = {service.real_personel * service.real_time * service.price} zł
                                        </> : <>
                                            {service.name} - {service.real_time}sztuk * {service.price} zł = {service.real_time * service.price} zł
                                        </>}
                                    </li>
                                ))}
                                {job.transport_cost ? <li>transport: {job.transport_cost} zł</li> : null}
                                {job.accommodation_cost ? <li>zakwaterowanie: {job.accommodation_cost} zł</li> : null}
                            </ul>
                        </li>
                        <li className="font-bold text-cyan-400">suma kosztów: {job.all_costs} zł</li>
                        <li className="space-x-2">
                            <span>{job.confirmed === true ? 'Zlecenie zatwierdzone.' : 'Zlecenie nie zostało zatwierdzone.'}</span>
                            {admin === true && job.confirmed !== true ? <button onClick={() => handleConfirm(job.id)} className="bg-emerald-500 p-1 rounded-sm">Zatwierdź</button> : null}
                        </li>
                    </ul>
                    <hr />
                </>))}
            </div>
        </>
    )
}