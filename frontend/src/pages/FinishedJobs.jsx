// Tutaj można dodać "Zakończone zlecenia"
// I wtedy masz podsumowanie zlecenia
// ilość godzin dla każdej usługi
// x stawka
// to mają być dane do wystawienia faktury
// + ten transport i nocleg
// każda usługa jako osobna pozycja ale zsumowane z całego zlecenia

import instance from "../services/Common"
import { useEffect, useState } from "react"

export const FinishedJobs = () => {

    const [finishedJobs, setFinishedJobs] = useState([])

    const getFinishedJobs = () => {
        instance.get('/jobs/finished').then(res => {
            console.log(res.data)
            setFinishedJobs(res.data)
        })
    }

    useEffect(() => {
        getFinishedJobs()
    }, [])

    return (
        <>
            <p className="mb-2">Lista zakończonych zleceń</p>
            <table className="hidden lg:table w-full table-fixed text-sm">
                <thead>
                    <tr>
                        <th className="border border-slate-400">nazwa</th>
                        <th className="border border-slate-400">kontrahent</th>
                        <th className="border border-slate-400">rozpoczęcie</th>
                        <th className="border border-slate-400">koniec</th>
                        <th className="border border-slate-400">koszty</th>
                    </tr>
                </thead>
                <tbody>
                    {finishedJobs.map(job => (
                        <tr key={job.id}>
                            <td className="border border-slate-600 p-2">{job.name}</td>
                            <td className="border border-slate-600 p-2">{job.contractor_place}</td>
                            <td className="border border-slate-600 p-2">{job.date_from}</td>
                            <td className="border border-slate-600 p-2">{job.date_to}</td>
                            <td className="border border-slate-600 p-2"><ul>
                                {job.services.map((service, index) => (
                                    <li key={index}>{service.name}({service.real_time}h): {service.real_time * service.price} PLN</li>
                                ))}
                                {job.transport_cost ? <li>transport: {job.transport_cost} PLN</li> : null}
                                {job.accommodation_cost ? <li>zakwaterowanie: {job.accommodation_cost} PLN</li> : null}
                                <li>suma: {job.all_costs} PLN</li>
                            </ul></td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="lg:hidden space-y-4 text-sm">
                {finishedJobs.map(job => (<>
                    <ul key={job.id}>
                        <li>nazwa: {job.name}</li>
                        <li>kontrahent: {job.contractor_place}</li>
                        <li>od {job.date_from} do {job.date_to}</li>
                        <li className="py-1">
                            <span className="underline">koszty:</span>
                            <ul className="list-disc list-inside">
                                {job.services.map((service, index) => (
                                    <li key={job.id + index}>{service.name}({service.real_time}h): {service.real_time * service.price} PLN</li>
                                ))}
                            </ul>
                        </li>
                        <li>suma kosztów: {job.all_costs} PLN</li>
                    </ul>
                    <hr />
                </>))}
            </div>
        </>
    )
}