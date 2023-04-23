import { useEffect, useState } from "react"
import { useDispatch, useSelector } from 'react-redux'

import { addNotification } from '../store/common'
import instance from "../services/Common"

export const Calendar = () => {
    const dayNames = ['poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota', 'niedziela']
    const monthNames = ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień']

    const dispatch = useDispatch()
    const admin = useSelector((state) => state.common.admin)
    const coordinator = useSelector((state) => state.common.coordinator)

    const [availableServices, setAvailableServices] = useState([])
    const [savedJobs, setSavedJobs] = useState([])

    const [date, setDate] = useState({ month: null, year: null })
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

    const setDaysInMonth = () => {
        const days = []
        const monthDate = new Date(date.year, date.month, 1);

        let week = []
        while (monthDate.getMonth() === date.month) {
            const cDate = new Date(monthDate)
            const strDate = getDateString(cDate)
            week.push(strDate)

            const day = monthDate.getDay()
            if (day === 0) {
                for (let i = week.length; i < 7; i++) week.unshift(null)
                days.push(week)
                week = []
            }
            monthDate.setDate(monthDate.getDate() + 1);
        }
        if (week.length !== 0) {
            days.push(week)
        }
        setDays(days)
    }

    const setCurrentDate = () => {
        const date = new Date();
        const month = date.getMonth();
        const year = date.getFullYear();
        setDate({ month, year })
    }

    const nextMonth = () => {
        let month = date.month + 1, year = date.year
        if (month === 12) {
            month = 0
            year += 1
        }
        setDate({ month, year })
    }

    const previousMonth = () => {
        let month = date.month - 1, year = date.year
        if (month === -1) {
            month = 11
            year -= 1
        }
        setDate({ month, year })
    }

    const getServices = () => {
        instance.get('/services').then(res => {
            const tmp = {}
            for (let i of res.data) {
                tmp[i.id] = i.name
            }
            setAvailableServices(tmp)
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
        instance.get(`/jobs/ready-to-finish/${selectedJob}`).then(() => {
            setReadyToFinish(true)
        })
    }


    const [doTransport, setDoTransport] = useState(false)
    const [doAccommodation, setDoAccommodation] = useState(false)
    const [finishData, setFinishData] = useState({ accommodation: "0", transport: "0" })
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
            if (jobServices[day].length === 0) {
                dispatch(addNotification({ text: `Brak uslug w dzien ${day}.`, type: 0 }))
                return
            }
            for (let s of jobServices[day]) {
                const tmp = { ...s, day }
                serviceDays.push(tmp)
            }
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

    const updateServiceDay = (id) => {
        const tmp = { job_id: selectedJob, service_id: id, time: jobServicesAccepted[id].realTime, persons: jobServicesAccepted[id].realPersons }
        instance.post('/jobs/save-day', tmp).then(res => {
            getSelectedJobDetail()
        })
    }

    const [newServiceDays, setNewServiceDays] = useState({})
    const [serviceDays, setServiceDays] = useState([])
    useEffect(() => {
        const tmpDays = [], tmpJobServices = {}, tmpNewServiceDays = {}
        let currentDate = new Date(job.dateFrom);
        while (currentDate <= new Date(job.dateTo)) {
            let tmp = getDateString(currentDate)
            tmpDays.push(tmp)
            tmpJobServices[tmp] = []
            tmpNewServiceDays[tmp] = { serviceType: "", estTime: 1, estPersons: 1 }
            currentDate.setDate(currentDate.getDate() + 1)
        }
        setServiceDays(tmpDays)
        setJobServices(tmpJobServices)
        setNewServiceDays(tmpNewServiceDays)
    }, [step])

    const handleNewServicesDaysChange = (d, e) => {
        console.log(d, e.target.name, e.target.value)
        setNewServiceDays({ ...newServiceDays, [d]: { ...newServiceDays[d], [e.target.name]: e.target.value } });
    }

    const handleNewServiceAdd = (d) => {
        if (!newServiceDays[d].serviceType) {
            dispatch(addNotification({ text: 'Wybierz rodzaj uslugi.', type: 0 }))
            return
        }
        setJobServices({ ...jobServices, [d]: [...jobServices[d], newServiceDays[d]] })
        setNewServiceDays({ ...newServiceDays, [d]: { serviceType: "", estTime: 1, estPersons: 1 } });
    }

    const handleNewServiceDelete = (d, index) => {
        const res = window.confirm(`Usunac serwis ${index + 1} z dnia ${d}`)
        if (!res) return
        setJobServices(prevObject => {
            const newList = [...prevObject[d]];
            newList.splice(index, 1);
            return { ...prevObject, [d]: newList };
        });
    }

    const [jobServicesAccepted, setJobServicesAccepted] = useState({})
    const handleJobServicesAccepted = (id, e) => {
        console.log(id, e.target.value)
        setJobServicesAccepted({ ...jobServicesAccepted, [id]: { ...jobServicesAccepted[id], [e.target.name]: e.target.value } });
    }

    const closeAll = () => {
        setModal(null)
        setJobEdit(false)
        setSelectedDay(null)
        setStep(1)
        setJob({})
        setReadyToFinish(false)
    }

    useEffect(() => {
        setDaysInMonth()
        getSavedJobs()
    }, [date])

    useEffect(() => {
        setFinishData({ accommodation: "0", transport: "0" })
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
    }, [])

    return (
        <>
            {!(modal || selectedDay) ? null : <>
                <div className="absolute w-full h-full bg-slate-400 opacity-50 top-0 left-0" onClick={closeAll}></div>
                <div className="absolute bg-slate-800 rounded-sm p-4 space-y-2 top-12 left-0 md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full h-[calc(100%-3rem)] md:h-max md:max-h-[80%] md:min-w-[500px] md:w-max flex flex-col items-ceter overflow-y-auto">
                    {modal ? <>
                        {/* ADMIN ONLY */}
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
                                <div className="w-full flex justify-between">
                                    <button className="bg-rose-500 p-1 rounded-sm" onClick={closeAll}>anuluj</button>
                                    <button className="bg-emerald-500 p-1 rounded-sm" onClick={nextStep}>dalej</button>
                                </div>
                            </> : step === 2 ? <>
                                <p>nazwa: {job.name}</p>
                                <p>kontrahent/miejsce: {job.desc}</p>
                                {serviceDays.map(d => (
                                    <div className="flex flex-col w-full bg-slate-700 p-1 space-y-1">
                                        <p className="text-sm text-rose-500">{d}</p>
                                        {jobServices[d] && jobServices[d].length === 0 ? <p className="text-xs">brak uslug na ten dzien, dodaj</p> : <>
                                            <ul className="list-disc list-inside">
                                                {jobServices[d].map((li, lIndex) => (
                                                    <li key={lIndex} className="text-xs cursor-pointer hover:text-rose-500" onClick={() => handleNewServiceDelete(d, lIndex)}>
                                                        {availableServices[li.serviceType]} - {li.estTime}h - {li.estPersons} osob
                                                    </li>
                                                ))}
                                            </ul>
                                        </>}

                                        <div className="flex flex-col lg:flex-row lg:items-end lg:space-x-2">
                                            <div className="flex flex-col">
                                                <label className="text-xs" htmlFor="service-type">rodzaj uslugi</label>
                                                <select id="service-type" className="flex" name="serviceType" value={newServiceDays[d].serviceType} onChange={(e) => handleNewServicesDaysChange(d, e)} >
                                                    <option value="">wybierz</option>
                                                    {Object.keys(availableServices).map(s => (
                                                        <option value={s}>{availableServices[s]}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="flex flex-col">
                                                <label className="text-xs" htmlFor="est-time">przwidywany czas</label>
                                                <input id="est-time" type="number" min="1" name="estTime" value={newServiceDays[d].estTime} onChange={(e) => handleNewServicesDaysChange(d, e)} />
                                            </div>

                                            <div className="flex flex-col">
                                                <label className="text-xs" htmlFor="est-time">przwidywana liczba osob</label>
                                                <input id="est-time" type="number" min="1" name="estPersons" value={newServiceDays[d].estPersons} onChange={(e) => handleNewServicesDaysChange(d, e)} />
                                            </div>
                                            <button className="p-1 bg-orange-500 rounded-sm text-sm" onClick={() => handleNewServiceAdd(d)}>dodaj usluge do dnia</button>
                                        </div>
                                        <hr />
                                    </div>
                                ))}
                                <div className="flex justify-between">
                                    <button className="p-1 rounded-sm bg-cyan-500" onClick={() => setStep(i => i - 1)}>wstecz</button>
                                    <button className="p-1 rounded-sm bg-emerald-500" onClick={handleJobAdd}>dodaj</button>
                                </div>
                            </> : null}
                        </> : selectedDay ? <>
                            {selectedDay in savedJobs ? <>
                                <div className="flex w-full justify-between items-center">
                                    <p>zlecenia na dzien {selectedDay}:</p>
                                    <button className="p-1 rounded-sm bg-rose-500" onClick={closeAll}>zamknij</button>
                                </div>
                                <ul className="list-disc list-inside">
                                    {savedJobs[selectedDay].map(j => (
                                        <li className="cursor-pointer hover:underline" onClick={() => { setSelectedDay(null); setSelectedJob(j.id) }}>
                                            {j.name}({j.id}) - {j.finished ? 'zakończone' : j.accepted ? 'zaakceptowane' : 'niezaakceptowane'}
                                        </li>
                                    ))}
                                </ul>
                            </> : <div className="w-full flex items-center justify-between"><p>brak zlencen w dniu {selectedDay}</p><button className="p-1 rounded-sm bg-rose-500" onClick={closeAll}>zamknij</button></div>}
                        </> : selectedJob ?
                            <div className="flex flex-col space-y-1 items-start min-w-96">
                                {!selectedJobDetail ? <p>ladowanie</p> : <>
                                    <div className="w-full flex justify-between items-center">
                                        <p className="underline">szczegoly zlecenia {selectedJob}</p>
                                        {!admin ? null : <button className="p-1 bg-rose-500 rounded-sm" onClick={handleJobDelete}>usun zlecenie</button>}
                                    </div>
                                    <p>nazwa: {selectedJobDetail.name}</p>
                                    <p>kontrahent/miejsce: {selectedJobDetail.contractor_place}</p>
                                    <hr className="pb-4" />

                                    {selectedJobDetail.accepted === false ? <div className="w-full">
                                        <p className="text-sm">zlecenie nie zostalo jeszcze zaakceptowane</p>
                                        <hr />
                                        <p className="text-sm">lista uslug:</p>
                                        <ul className="list-disc list-inside py-1">
                                            {selectedJobDetail.services.map(s => (
                                                <li className="text-xs" key={s.id}>{s.day}({s.id}) - {availableServices[s.service_type_id]} - {s.estimated_time}h - {s.estimated_personel} osob</li>
                                            ))}
                                        </ul>
                                        <div className="w-full flex justify-end">
                                            {coordinator ? <button className="p-1 rounded-sm bg-emerald-500" onClick={acceptJob}>zaakceptuj zlecenie</button> : null}
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
                                                            {!s.real_time && jobServicesAccepted[s.id] ? <>
                                                                {coordinator ? <div className="flex flex-col">
                                                                    <label className="text-xs">faktyczna liczba godzin</label>
                                                                    <input type="number" min="1" name="realTime" value={jobServicesAccepted[s.id].realTime} onChange={(e) => handleJobServicesAccepted(s.id, e)} />
                                                                </div> : null}
                                                            </> : <p className="text-sm">faktyczna liczba godzin: {s.real_time}</p>}
                                                        </div>
                                                        <div className="flex flex-col lg:flex-row lg:space-x-4">
                                                            <p className="text-sm">przewidywana liczna osob: {s.estimated_personel}</p>
                                                            {!s.real_personel && jobServicesAccepted[s.id] ? <>
                                                                {coordinator ? <div className="flex flex-col">
                                                                    <label className="text-xs">faktyczna liczba osob</label>
                                                                    <input type="number" min="1" name="realPersons" value={jobServicesAccepted[s.id].realPersons} onChange={(e) => handleJobServicesAccepted(s.id, e)} />
                                                                </div> : null}
                                                            </> : <p className="text-sm">faktyczna libcza osob: {s.real_personel}</p>}
                                                        </div>
                                                        {(s.real_personel && s.real_time) || !coordinator ? null : <button className="p-1 rounded-sm bg-cyan-500" onClick={() => updateServiceDay(s.id)}>zapisz</button>}
                                                    </div>
                                                    <hr />
                                                </>
                                            ))}
                                        </div>
                                        {readyToFinish === true ?
                                            <div className="flex flex-col w-full pt-2 space-y-1">
                                                <div className="space-x-1">
                                                    <input id="do-transport" type="checkbox" onChange={() => setDoTransport(i => !i)} />
                                                    <label htmlFor="do-transport" className="underline">wprowadz koszty transportu</label>
                                                </div>
                                                {doTransport === true ? <div className="flex flex-col">
                                                    <label className="text-xs">koszty transportu</label>
                                                    <input type="number" min="0" name="transport" value={finishData.transport} onChange={handleFinishData} />
                                                </div> : null}
                                                <div className="space-x-1">
                                                    <input id="do-accommodation" type="checkbox" onChange={() => setDoAccommodation(i => !i)} />
                                                    <label htmlFor="do-accommodation" className="underline">wprowadz koszty zakwaterowania</label>
                                                </div>
                                                {doAccommodation === true ? <div className="flex flex-col">
                                                    <label className="text-xs">koszty zakwaterowania</label>
                                                    <input type="number" min="0" name="accommodation" value={finishData.accommodation} onChange={handleFinishData} />
                                                </div> : null}
                                                <button className="p-1 rounded-sm bg-emerald-500" onClick={finishJob}>zakoncz zlecenie</button>
                                                <button className="p-1 rounded-sm bg-rose-500" onClick={() => setReadyToFinish(false)}>anuluj</button>
                                            </div> :
                                            <div className="w-full flex justify-between pt-2">
                                                <button className="p-1 rounded-sm bg-rose-500" onClick={closeAll}>zamknij</button>
                                                {coordinator ? <button className="p-1 rounded-sm bg-emerald-500" onClick={isJobReadyToFinish}>wprowadz dane koncowe</button> : null}
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
                                                    <li className="text-xs" key={s.id}>{s.day}({s.id}) - {s.service_name} - {s.real_time}h - {s.real_personel} osob</li>
                                                ))}
                                            </ul>
                                            <button className="mt-4 rounded-sm p-1 text-sm bg-rose-500" onClick={closeAll}>zamknij</button>
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
                {admin ? <button className="p-1 bg-emerald-500 rounded-sm my-1" onClick={() => { setModal(i => !i); setJobEdit(true) }}>dodaj zlecenie</button> : null}
                {days.length === 0 ? null : <>
                    <div className="w-full flex justify-between mt-4">
                        <button className="underline" onClick={previousMonth}>poprzedni</button>
                        <p className="text-center text-2xl">{date.month ? monthNames[date.month] : '-'} {date.year}</p>
                        <button className="underline" onClick={nextMonth}>następny</button>
                    </div>
                    <table className="hidden xl:table table-fixed w-full border-collapse border border-cyan-600">
                        <thead>
                            <tr className="bg-cyan-500">
                                {dayNames.map((d, i) => (
                                    <th key={`h2-${i}`} className="py-2">{d}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {days.map((week, i) => (
                                <tr key={`w-${i}`}>
                                    {week.map((d, j) => (
                                        <>
                                            {d === null ?
                                                <td key={`dn-${i}-${j}`} className="h-20 border border-slate-400 bg-slate-700"></td>
                                                :
                                                <td onClick={() => { setModal(true); setSelectedDay(d) }} key={`d-${i}-${j}`} className="h-32 border border-slate-400 hover:bg-slate-600 hover:cursor-pointer px-1 py-2">
                                                    <div className="w-full h-full flex flex-col items-center space-y-4">
                                                        <div className="w-8 h-8 bg-cyan-500 flex items-center justify-center rounded-full">
                                                            {d.split('-')[2]}
                                                        </div>
                                                        {!savedJobs[d] ? null : <ul className="w-full space-y-1">
                                                            {savedJobs[d].map(k => (
                                                                <li className={`text-xs p-1 rounded text-center ${k.finished === true ? 'bg-emerald-500' :k.accepted !== true ? 'bg-rose-500' : 'bg-amber-500'}`}>{k.name}({k.id})</li>
                                                            ))}
                                                        </ul>
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
                                        <div key={j} className="bg-slate-600 px-2 py-4 roundex-xs hover:bg-slate-800 hover:cursor-pointer space-y-2" onClick={() => { setModal(true); setSelectedDay(d) }}>
                                            <p className="text-xs font-bold">{d} - tydzien {i + 1} - {dayNames[j]}</p>
                                            {!savedJobs[d] ? null : <>
                                                <div className="flex flex-wrap space-x-2">
                                                    {savedJobs[d].map(k => (
                                                        <div className={`p-2 text-xs h-max rounded-sm ${k.accepted !== true ? 'bg-rose-500' : 'bg-emerald-500'}`} key={k.id}>
                                                            {k.name}({k.id})
                                                        </div>
                                                    ))}
                                                </div>
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