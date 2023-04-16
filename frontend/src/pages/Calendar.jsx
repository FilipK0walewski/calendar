import { useEffect, useState } from "react"
import { useDispatch, useSelector } from 'react-redux'

import { addNotification } from '../store/common'
import instance from "../services/Common"

export const Calendar = () => {
    const dayNames = ['poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota', 'niedziela']
    const monthNames = ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień']

    const dispatch = useDispatch()
    const admin = useSelector((state) => state.common.admin)

    const [availableServices, setAvailableServices] = useState([])
    const [savedJobs, setSavedJobs] = useState([])

    const [month, setMonth] = useState()
    const [year, setYear] = useState()
    const [days, setDays] = useState([])

    const [modal, setModal] = useState(false)
    const [jobEdit, setJobEdit] = useState(false)
    const [step, setStep] = useState(1)

    const [job, setJob] = useState({ dateFrom: '', dateTo: '', name: '', desc: '' })
    const [jobServices, setJobServices] = useState({})

    const [selectedDay, setSelectedDay] = useState()
    const [selectedJob, setSelectedJob] = useState()
    const [selectedJobDetail, setSelectedJobDetail] = useState()

    const getDateString = (date) => {
        const yyyy = date.getFullYear().toString().padStart(4, '0');
        const mm = (date.getMonth() + 1).toString().padStart(2, '0');
        const dd = date.getDate().toString().padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    const getDaysInMonth = (year, month) => {
        const days = []
        const date = new Date(year, month, 1);

        let week = []
        while (date.getMonth() === month) {
            const cDate = new Date(date)
            const strDate = getDateString(cDate)
            week.push(strDate)

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
            setSavedJobs(res.data)
        })
    }

    const getSelectedJobDetail = () => {
        instance.get(`/jobs/${selectedJob}`).then(res => {
            setSelectedJobDetail(res.data)
        })
    }

    const acceptJob = () => {
        instance.post(`/jobs/accept`, { number: selectedJob }).then(() => {
            getSelectedJobDetail()
        })
    }

    const [readyToFinish, setReadyToFinish] = useState()
    const isJobReadyToFinish = () => {
        instance.get(`/jobs/ready-to-finish/${selectedJob}`).then(res => {
            setReadyToFinish(true)
        })
    }

    const [finishData, setFinishData] = useState()
    const handleFinishData = (e) => {
        setFinishData({ ...finishData, [e.target.name]: e.target.value })
    }

    const finishJob = async () => {
        const res = await instance.post(`/jobs/finish`, { job_id: selectedJob, transport: finishData.transport, accommodation: finishData.accommodation })
        if (res.status !== 200) return
        getSelectedJobDetail()
    }

    const handleJobAdd = () => {
        const tmpJob = job, serviceDays = []
        for (let day in jobServices) {
            const tmp = { day }
            for (let k in jobServices[day]) {
                if (jobServices[day][k] === null || jobServices[day][k].length === 0) {
                    dispatch(addNotification({ text: 'Popraw dane.', type: 0 }))
                    return
                }
                tmp[k] = jobServices[day][k]
            }
            serviceDays.push(tmp)
        }
        tmpJob['services'] = serviceDays
        instance.post('/jobs', tmpJob).then(res => {
            getSavedJobs()
            closeAll()
        })
    }

    const handleJobDelete = () => {
        const confirmed = window.confirm(`UWAGA!\nZlecenie ${selectedJob} zostanie usuniete jezeli potwierdzisz`)
        if (confirmed !== true) return
        instance.delete(`/jobs/${selectedJob}`).then(() => {
            getSavedJobs()
            closeAll()
        })
    }

    const nextStep = () => {
        let good = true
        for (let key in job) {
            if (!job[key] || job[key].length === 0) {
                good = false
                break
            }
        }
        if (good !== true) {
            dispatch(addNotification({ text: 'Uzupelnij dane.', type: 0 }))
            return
        }
        setStep(i => i + 1)
    }

    const handleJobServiceChange = (d, e) => {
        setJobServices({ ...jobServices, [d]: { ...jobServices[d], [e.target.name]: e.target.value } });
    }

    const updateServiceDay = (id) => {
        const tmp = { job_id: selectedJob, service_id: id, time: jobServicesAccepted[id].realTime, persons: jobServicesAccepted[id].realPersons }
        instance.post('/jobs/save-day', tmp).then(res => {
            getSelectedJobDetail()
        })
    }

    const [serviceDays, setServiceDays] = useState([])
    useEffect(() => {
        const tmpDays = [], tmpJobServices = {}
        let currentDate = new Date(job.dateFrom);
        while (currentDate <= new Date(job.dateTo)) {
            let tmp = getDateString(currentDate)
            tmpDays.push(tmp)
            tmpJobServices[tmp] = { serviceType: null, estTime: 1, estPersons: 1 }
            currentDate.setDate(currentDate.getDate() + 1)
        }
        setServiceDays(tmpDays)
        setJobServices(tmpJobServices)
    }, [step])

    const [jobServicesAccepted, setJobServicesAccepted] = useState({})
    const handleJobServicesAccepted = (id, e) => {
        console.log(id, e.target.value)
        setJobServicesAccepted({ ...jobServicesAccepted, [id]: { ...jobServicesAccepted[id], [e.target.name]: e.target.value } });
    }

    const closeAll = () => {
        setModal(null)
        setJobEdit(false)
        setStep(1)
        setJob({})
        setReadyToFinish(false)
    }

    useEffect(() => {
        setFinishData({})
    }, [readyToFinish])

    useEffect(() => {
        if (!selectedJobDetail) return
        const tmp = {}
        selectedJobDetail.services.forEach(s => tmp[s.id] = { realTime: s.estimated_time, realPersons: s.estimated_personel })
        setJobServicesAccepted(tmp)
    }, [selectedJobDetail])

    useEffect(() => {
        setReadyToFinish(false)
        setSelectedJobDetail(null)
        if (!selectedJob) return
        getSelectedJobDetail()
    }, [selectedJob])

    useEffect(() => {
        setCurrentDate()
        getServices()
        getSavedJobs()
    }, [])

    return (
        <>
            {!(modal || selectedDay) ? null : <>
                <div className="absolute w-full h-full bg-slate-400 opacity-50 top-0 left-0" onClick={() => { setModal(false); setJobEdit(false); setSelectedDay(null) }}></div>
                <div className="absolute top-1/2 left-1/2 min-w-1/2 min-h-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-800 rounded-sm p-2 space-y-2 w-full md:w-96 min-w-max">
                    {modal ? <>
                        {/* ADMIN ONLY */}
                        {/* JOB CREATION 2 STEPS */}
                        {jobEdit ? <>
                            {step === 1 ? <>
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
                                <div className="w-full flex justify-end">
                                    <button className="bg-green-500 p-1 rounded-sm" onClick={nextStep}>dalej</button>
                                </div>
                            </> : step === 2 ? <>
                                <p>nazwa: {job.name}</p>
                                <p>kontrahent/miejsce: {job.desc}</p>
                                {serviceDays.map(d => (
                                    <div className="flex flex-col w-full lg:flex-row lg:items-end lg:space-x-2 bg-slate-700 p-1">
                                        <p className="text-sm">{d}</p>
                                        <div className="flex flex-col">
                                            <label className="text-xs" htmlFor="service-type">rodzaj uslugi</label>
                                            <select id="service-type" className="flex" name="serviceType" value={jobServices[d].serviceType} onChange={(e) => handleJobServiceChange(d, e)} >
                                                <option value="">wybierz</option>
                                                {availableServices.map(s => (
                                                    <option value={s.id}>{s.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="flex flex-col">
                                            <label className="text-xs" htmlFor="est-time">przwidywany czas</label>
                                            <input id="est-time" type="number" min="1" name="estTime" value={jobServices[d].estTime} onChange={(e) => handleJobServiceChange(d, e)} />
                                        </div>

                                        <div className="flex flex-col">
                                            <label className="text-xs" htmlFor="est-time">przwidywana liczba osob</label>
                                            <input id="est-time" type="number" min="1" name="estPersons" value={jobServices[d].estPersons} onChange={(e) => handleJobServiceChange(d, e)} />
                                        </div>
                                        <hr />
                                    </div>
                                ))}
                                <div className="flex justify-between">
                                    <button className="p-1 rounded-sm bg-blue-500" onClick={() => setStep(i => i - 1)}>wstecz</button>
                                    <button className="p-1 rounded-sm bg-green-500" onClick={() => handleJobAdd()}>dodaj</button>
                                </div>
                            </> : null}
                        </> : selectedDay ? <>
                            {selectedDay in savedJobs ? <>
                                <p>zlecenia na dzien {selectedDay}:</p>
                                <ul className="list-disc list-inside">
                                    {savedJobs[selectedDay].map(j => (
                                        <li className="cursor-pointer hover:underline" onClick={() => { setSelectedDay(null); setSelectedJob(j.id) }}>
                                            {j.name}({j.id}) - {j.finished ? 'zakonczone' : j.accepted ? 'zaakceptowane' : 'niezaakceptowane'}
                                        </li>
                                    ))}
                                </ul>
                            </> : <p>brak zlencen w dniu {selectedDay}</p>}
                        </> : selectedJob ?
                            <div className="flex flex-col space-y-1 items-start min-w-96">
                                {!selectedJobDetail ? <p>ladowanie</p> : <>
                                    <div className="w-full flex justify-between items-center">
                                        <p className="underline">szczegoly zlecenia {selectedJob}</p>
                                        <button className="p-1 bg-rose-500 rounded-sm" onClick={handleJobDelete}>usun zlecenie</button>
                                    </div>
                                    <p>nazwa: {selectedJobDetail.name}</p>
                                    <p>kontrahent/miejsce: {selectedJobDetail.contractor_place}</p>
                                    <hr className="pb-4" />

                                    {selectedJobDetail.accepted === false ? <div>
                                        <p className="text-sm">zlecenie nie zostalo jeszcze zaakceptowane</p>
                                        <hr />
                                        <p className="text-sm">uslugi:</p>
                                        <ul className="list-disc list-inside py-1">
                                            {selectedJobDetail.services.map(s => (
                                                <li className="text-xs" key={s.id}>{s.day}({s.id}) - przewidywana liczna godzin: {s.estimated_time} - przewidywana liczna osob: {s.estimated_personel} </li>
                                            ))}
                                        </ul>
                                        <div className="w-full flex justify-end">
                                            <button className="p-1 rounded-sm bg-green-500" onClick={acceptJob}>zaakceptuj zlecenie</button>
                                        </div>
                                    </div> : selectedJobDetail.accepted === true && selectedJobDetail.finished === false ? <div className="w-full">
                                        <p className="text-xs">zlecenie zaakceptowane, niezakonczone</p>
                                        <hr />
                                        <div className="space-y-1 w-full">
                                            {selectedJobDetail.services.map(s => (
                                                <>
                                                    <div className="lg:space-x-4 flex flex-col lg:flex-row p-1 bg-slate-700 w-full" key={s.day}>
                                                        <p className="text-sm">{s.day}({s.id})</p>
                                                        <div className="flex flex-col lg:flex-row lg:space-x-4">
                                                            <p className="text-sm">przewidywana liczna godzin: {s.estimated_time}</p>
                                                            {!s.real_time && jobServicesAccepted[s.id] ?
                                                                <div className="flex flex-col">
                                                                    <label className="text-xs">faktyczna liczba godzin</label>
                                                                    <input type="number" min="1" name="realTime" value={jobServicesAccepted[s.id].realTime} onChange={(e) => handleJobServicesAccepted(s.id, e)} />
                                                                </div>
                                                                : <p className="text-sm">faktyczna liczba godzin: {s.real_time}</p>}
                                                        </div>
                                                        <div className="flex flex-col lg:flex-row lg:space-x-4">
                                                            <p className="text-sm">przewidywana liczna osob: {s.estimated_personel}</p>
                                                            {!s.real_personel && jobServicesAccepted[s.id] ?
                                                                <div className="flex flex-col">
                                                                    <label className="text-xs">faktyczna liczba osob</label>
                                                                    <input type="number" min="1" name="realPersons" value={jobServicesAccepted[s.id].realPersons} onChange={(e) => handleJobServicesAccepted(s.id, e)} />
                                                                </div>
                                                                : <p className="text-sm">faktyczna libcza osob: {s.real_personel}</p>}
                                                        </div>
                                                        {s.real_personel && s.real_time ? null : <button className="p-1 rounded-sm bg-blue-500" onClick={() => updateServiceDay(s.id)}>zapisz dzien</button>}
                                                    </div>
                                                    <hr />
                                                </>
                                            ))}
                                        </div>
                                        {readyToFinish === true ?
                                            <div className="flex flex-col w-full pt-2 space-y-1">
                                                <div className="flex flex-col">
                                                    <label className="text-xs">koszty transportu</label>
                                                    <input type="number" min="0" name="transport" value={finishData.transport || ''} onChange={handleFinishData} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <label className="text-xs">koszty zakwaterowania</label>
                                                    <input type="number" min="0" name="accommodation" value={finishData.accommodation || ''} onChange={handleFinishData} />
                                                </div>
                                                <button className="p-1 rounded-sm bg-green-500" onClick={finishJob}>zakoncz zlecenie</button>
                                            </div> :
                                            <div className="w-full flex justify-end pt-2">
                                                <button className="p-1 rounded-sm bg-green-500" onClick={isJobReadyToFinish}>wprowadz dane koncowe</button>
                                            </div>
                                        }
                                    </div> : selectedJobDetail.accepted === true && selectedJobDetail.finished === true ?
                                        <div>
                                            <p className="text-sm">zlecenie zakonczone</p>
                                            <hr />
                                            <p className="text-sm">dane:</p>
                                            <ul className="list-disc list-inside">
                                                <li className="text-xs">start zlecenia: {selectedJobDetail.date_from}</li>
                                                <li className="text-xs">zakonczenie zlecenia: {selectedJobDetail.date_to}</li>
                                                <li className="text-xs">koszt transportu: {selectedJobDetail.transport_cost} PLN</li>
                                                <li className="text-xs">koszt zakwaterowania: {selectedJobDetail.accommodation_cost} PLN</li>
                                            </ul>
                                            <p className="text-sm mt-2">uslugi:</p>
                                            <ul className="list-disc list-inside">
                                                {selectedJobDetail.services.map(s => (
                                                    <li className="text-xs" key={s.id}>{s.day}({s.id}) - {s.service_name} - liczba osob: {s.real_personel} - liczba godzin: {s.real_time}</li>
                                                ))}
                                            </ul>

                                        </div> : null
                                    }
                                </>
                                }
                            </div> : null
                        }
                    </> : null
                    }
                </div>
            </>
            }
            <div className="space-y-4 h-full overflow-y-auto">
                <div className="w-full flex justify-between py-1">
                    <input type="month" onChange={handleDateFromChange} />
                    {admin ? <button className="p-1 bg-green-500 rounded-sm" onClick={() => { setModal(i => !i); setJobEdit(true) }}>dodaj zlecenie</button> : null}
                </div>
                {days.length === 0 ? null : <>
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
                                                <td onClick={() => { setModal(true); setSelectedDay(d) }} key={`d-${i}-${j}`} className="border border-slate-300 h-16 hover:bg-green-600 hover:cursor-pointer p-1 ">
                                                    {d}
                                                    <div>
                                                        {!savedJobs[d] ? null :
                                                            <>
                                                                <ul className="list-disc list-inside">
                                                                    {savedJobs[d].map(k => (
                                                                        <li className="text-xs">{k.name}({k.id})</li>
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
                            <div key={i} className="w-full space-y-2">
                                {week.map((d, j) => (<>
                                    {d === null ? null :
                                        <div key={j} className="bg-slate-600 px-2 py-4 roundex-xs hover:bg-green-500 hover:cursor-pointer" onClick={() => { setModal(true); setSelectedDay(d) }}>
                                            <p className="text-xs font-bold">{d} - tydzien {i + 1} - {dayNames[j]}</p>
                                            {!savedJobs[d] ? null : <>
                                                <p className="text-sm">zlecenia:</p>
                                                <ul className="list-disc list-inside">
                                                    {savedJobs[d].map(k => (
                                                        <li className="text-xs" key={k.id}>{k.name}({k.id})</li>
                                                    ))}
                                                </ul>
                                            </>
                                            }
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