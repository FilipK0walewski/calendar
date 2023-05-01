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
            <table className="hidden lg:table w-full table-auto text-sm">
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
                    {finishedJobs.map((job, i) => (
                        <tr key={i}>
                            <td className="border border-slate-600 px-1">{job.name}</td>
                            <td className="border border-slate-600 px-1">{job.contractor_place}</td>
                            <td className="border border-slate-600 px-1">{job.date_from.split('-').reverse().join('.')}</td>
                            <td className="border border-slate-600 px-1">{job.date_from.split('-').reverse().join('.')}</td>
                            <td className="border border-slate-600 px-1"><ul>
                                {job.services.map((service, j) => (
                                    // Spawanie - 10 os. x 30h x 20 zł = 6000 zł
                                    <li key={j}>{service.name} - {service.real_personel} os. * {service.real_time}h * {service.price} zł = {service.real_personel * service.real_time * service.price} zł</li>
                                ))}
                                {job.transport_cost ? <li>transport: {job.transport_cost} PLN</li> : null}
                                {job.accommodation_cost ? <li>zakwaterowanie: {job.accommodation_cost} PLN</li> : null}
                                <li className="font-bold text-cyan-400">suma: {job.all_costs} PLN</li>
                            </ul></td>
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
                                    <li key={j}>{service.name}({service.real_time}h): {service.real_time * service.price} PLN</li>
                                ))}
                            </ul>
                        </li>
                        <li className="font-bold text-cyan-400">suma kosztów: {job.all_costs} PLN</li>
                    </ul>
                    <hr />
                </>))}
            </div>
        </>
    )
}