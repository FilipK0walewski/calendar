import { useEffect, useState } from "react"
import { useSelector } from 'react-redux'

import instance from "../services/Common"

export const Calendar = () => {
    const admin = useSelector((state) => state.common.admin)

    const [availableServices, setAvailableServices] = useState([])
    const [savedJobs, setSavedJobs] = useState([])

    const dayNames = ['poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota', 'niedziela']
    const monthNames = ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień']
    const [month, setMonth] = useState()
    const [year, setYear] = useState()
    const [days, setDays] = useState([])

    const [modal, setModal] = useState(false)

    const [job, setJob] = useState({ services: [], dateFrom: '', dateTo: '', desc: '' })
    const [service, setService] = useState({ serviceType: '', dateFrom: '', dateTo: '', persons: '' })

    const [selectedDay, setSelectedDay] = useState()

    const getDaysInMonth = (year, month) => {
        const days = []
        const date = new Date(year, month, 1);

        let week = []
        while (date.getMonth() === month) {
            const cDate = new Date(date)

            const yyyy = cDate.getFullYear().toString().padStart(4, '0');
            const mm = (cDate.getMonth() + 1).toString().padStart(2, '0');
            const dd = cDate.getDate().toString().padStart(2, '0');
            const yyyyMmDd = `${yyyy}-${mm}-${dd}`;
            console.log(yyyyMmDd)
            week.push(yyyyMmDd)

            const day = date.getDay()
            if (day === 0) {
                for (let i = week.length; i < 7; i++) week.unshift(null)
                days.push(week)
                week = []
            }
            date.setDate(date.getDate() + 1);
        }
        if (week.length !== 0) {
            days.push(week)
        }
        return days;
    }

    const handleDateFromChange = (e) => {
        let [year, month] = e.target.value.split('-')
        year = parseInt(year)
        month = parseInt(month) - 1
        setMonth(month)
        setYear(year)

        const selected = getDaysInMonth(year, month)
        setDays(selected)
    }

    const setCurrentDate = () => {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        setYear(currentYear)
        setMonth(currentMonth)
        const selected = getDaysInMonth(currentYear, currentMonth)
        setDays(selected)
    }

    const getServices = () => {
        instance.get('/services').then(res => {
            setAvailableServices(res.data)
        })
    }

    const getSavedJobs = () => {
        instance.get('/jobs').then(res => {
            console.log(res.data)
            setSavedJobs(res.data)
        })
    }

    const handleServiceAdd = () => {
        setJob({ ...job, 'services': [...job.services, service] })
        setService({ serviceType: '', dateFrom: '', to: '', persons: '' })
    }

    const handleJobAdd = () => {
        console.log(job)
        instance.post('/jobs', job).then(res => {
            console.log(res.data)
            setModal(false)
            getSavedJobs()
        })
    }

    useEffect(() => {
        setCurrentDate()
        getServices()
        getSavedJobs()
    }, [])

    return (
        <>
            {!(modal || selectedDay) ? null :
                <>
                    <div className="absolute w-full h-full bg-slate-400 opacity-50 top-0 left-0" onClick={() => { setModal(false); setSelectedDay(null) }}></div>
                    <div className="absolute top-1/2 left-1/2 w-96 min-h-96 -translate-x-1/2 -translate-y-1/2 bg-slate-800 rounded-sm p-2 flex flex-col space-y-2">
                        {modal ?

                            <>
                                <div className="flex flex-col">
                                    <label htmlFor="job-date-from" className="text-xs">start zlecenia</label>
                                    <input type="date" id="job-date-from" value={job.dateFrom} onChange={e => setJob({ ...job, dateFrom: e.target.value })} />
                                </div>
                                <div className="flex flex-col">
                                    <label htmlFor="job-date-to" className="text-xs">koniec zlecenia</label>
                                    <input type="date" id="job-date-to" value={job.dateTo} onChange={e => setJob({ ...job, dateTo: e.target.value })} />
                                </div>
                                <div className="flex flex-col">
                                    <label htmlFor="job-name" className="text-xs">nazwa zlecenia</label>
                                    <input type="text" id="job-name" value={job.name} onChange={e => setJob({ ...job, name: e.target.value })} />
                                </div>
                                <div className="flex flex-col">
                                    <label htmlFor="job-desc" className="text-xs">kontrahent/miescje</label>
                                    <textarea id="job-desc" rows="5" className="rounded-sm p-1 text-black" value={job.desc} onChange={e => setJob({ ...job, desc: e.target.value })} ></textarea>
                                </div>
                                <hr />

                                {/* SERVICE */}
                                <p>usługi w zleceniu ({job.services.length}):</p>
                                <ul>
                                    {job.services.map(s => (
                                        <li>{availableServices[s.type]}({s.persons}), {s.dateFrom} - {s.dateTo}</li>
                                    ))}
                                </ul>

                                {/* rodzaj zlecenia */}
                                <div className="flex flex-col">
                                    <label className="text-xs">rodzaj usługi</label>
                                    <select className="text-black p-1 rounded-sm" name="type" value={service.serviceType} onChange={(e) => setService({ ...service, serviceType: e.target.value })}>
                                        <option value="">wybierz</option>
                                        {availableServices.map(s => (
                                            <option className="text-black" value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex flex-col">
                                    <label htmlFor="service-date-from" className="text-xs">start usługi</label>
                                    <input type="date" id="service-date-from" name="from" value={service.dateFrom} onChange={(e) => setService({ ...service, dateFrom: e.target.value })} />
                                </div>
                                <div className="flex flex-col">
                                    <label htmlFor="service-date-to" className="text-xs">koniec usługi</label>
                                    <input type="date" id="service-date-to" value={service.dateTo} onChange={(e) => setService({ ...service, dateTo: e.target.value })} />
                                </div>

                                <div className="flex flex-col">
                                    <label htmlFor="person-number">libcza osób</label>
                                    <input id="person-number" type="number" min="1" value={service.persons} onChange={(e) => setService({ ...service, persons: e.target.value })} />
                                </div>

                                {/* BUTTONS */}
                                <button className="bg-blue-500 p-1 rounded-sm" onClick={handleServiceAdd}>dodaj usługę</button>
                                <hr />
                                <button className="bg-green-500 p-1 rounded-sm" onClick={handleJobAdd}>dodaj zlecenie</button>
                            </>
                            :
                            <>
                                <p>wybrany dzień: {selectedDay}</p>
                                {!savedJobs[selectedDay] ? <p>brak zleceń na ten dzień</p> :
                                    <>
                                        <p>liczba zleceń na ten dzień: {savedJobs[selectedDay].length}</p>
                                        <hr />
                                        <div className="space-y-4">
                                            {savedJobs[selectedDay].map(d => (
                                                <div>
                                                    <p>nazwa zlecenia: {d.job_name}</p>
                                                    <p>kontrahent/miescje: {d.job_desc}</p>
                                                    <p>rodzaj usługi: {d.service_type}</p>
                                                    <p>liczba osób: {d.number_of_persons}</p>
                                                    <p>data rozpoczęcia usługi: {d.service_start}</p>
                                                    <p>data zakończenia usługi: {d.service_end}</p>
                                                    <p>data rozpoczęcia zlecenia: {d.job_start}</p>
                                                    <p>data zakończenia zlecenia: {d.job_end}</p>
                                                    <hr />
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                }
                            </>
                        }
                    </div>
                </>
            }
            <div className="space-y-4 h-full overflow-y-auto">
                <div className="w-full flex justify-between py-1">
                    <input type="month" onChange={handleDateFromChange} />
                    {admin ?
                        <button className="p-1 bg-green-500 rounded-sm" onClick={() => setModal(i => !i)}>dodaj zlecenie</button>
                        : null}
                </div>
                {days.length === 0 ? null :
                    <>
                        <p>{monthNames[month]} {year}</p>
                        <table className="hidden xl:table table-fixed w-full border-collapse border border-slate-400">
                            <thead>
                                <tr>
                                    {dayNames.map((d, i) => (
                                        <th key={`h2-${i}`} className="border border-slate-300">{d}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {days.map((week, i) => (
                                    <tr key={`w-${i}`}>
                                        {week.map((d, j) => (
                                            <>
                                                {d === null ?
                                                    <td key={`dn-${i}-${j}`} className="h-auto border border-slate-300 bg-slate-700">-</td>
                                                    :
                                                    <td onClick={() => setSelectedDay(d)} key={`d-${i}-${j}`} className="border border-slate-300 h-16 hover:bg-green-600 hover:cursor-pointer p-1 ">
                                                        {d}
                                                        <div >
                                                            {!savedJobs[d] ? null :
                                                                <>
                                                                    <ul className="list-disc list-inside">
                                                                        {savedJobs[d].map(k => (
                                                                            <li className="text-xs">{k.job_name}({k.job_id}) - {k.service_type}</li>
                                                                        ))}
                                                                    </ul>
                                                                </>
                                                            }
                                                        </div>
                                                    </td>
                                                }
                                            </>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="flex flex-col w-full space-y-2 xl:hidden">
                            {days.map((week, i) => (
                                <div key={`dm-${i}`} className="w-full space-y-2">
                                    {week.map((d, j) => (
                                        <>
                                            {d === null ? null :
                                                <div key={`dm-${i}-${j}`} className="bg-slate-600 px-2 py-4 roundex-xs hover:bg-green-500 hover:cursor-pointer" onClick={() => setSelectedDay(d)}>
                                                    <p>{d} {!savedJobs[d] ? null : ' ==> ' + Object.keys(savedJobs[d]).length}</p>
                                                    <p>tydzien {i + 1}, {dayNames[j]}</p>
                                                    <div >
                                                        {!savedJobs[d] ? null :
                                                            <>
                                                                <p>liczba usług: {Object.keys(savedJobs[d]).length}</p>
                                                                <ul className="list-disc list-inside">
                                                                    {savedJobs[d].map(k => (
                                                                        <li className="text-xs">{k.job_name}({k.job_id}) - {k.service_type}</li>
                                                                    ))}
                                                                </ul>
                                                            </>
                                                        }
                                                    </div>
                                                </div>
                                            }
                                        </>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </>

                }
            </div>
        </>
    )
}