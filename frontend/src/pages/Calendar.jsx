import { useEffect, useState } from "react"
import { useSelector } from 'react-redux'

import instance from "../services/Common"

export const Calendar = () => {
    const admin = useSelector((state) => state.common.admin)

    const [services, setServices] = useState()

    const dayNames = ['poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota', 'niedziela']
    const monthNames = ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień']
    const [month, setMonth] = useState()
    const [year, setYear] = useState()
    const [days, setDays] = useState([])

    const [modal, setModal] = useState(false)

    const [job, setJob] = useState({})
    const [service, setService] = useState({})
    

    const handleModal = () => {
        setModal(!modal)
    }

    const getDaysInMonth = (year, month) => {
        const days = []
        const date = new Date(year, month, 1);

        let week = []
        while (date.getMonth() === month) {
            week.push(new Date(date))
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
            setServices(res.data)
        })
    }

    useEffect(() => {
        setCurrentDate()
        getServices()
    }, [])

    return (
        <>
            {!modal ? null :
                <>
                    <div className="absolute w-full h-full bg-slate-400 opacity-50 top-0 left-0"></div>
                    <div className="absolute top-1/2 left-1/2 w-96 min-h-96 -translate-x-1/2 -translate-y-1/2 bg-slate-800 rounded-sm p-2 flex flex-col space-y-2">
                        {/* od do */}
                        <div className="flex flex-col">
                            <label htmlFor="job-date-from" className="text-xs">start zlecenia</label>
                            <input type="date" id="job-date-from" />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="job-date-to" className="text-xs">koniec zlecenia</label>
                            <input type="date" id="job-date-to" />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="job-desc" className="text-xs">kontrahent/miescje</label>
                            <textarea id="job-desc" rows="5" className="rounded-sm p-1 text-black"></textarea>
                        </div>
                        <hr />
                        <p>usługi w zleceniu:</p>
                        {/* rodzaj zlecenia */}
                        <div className="flex flex-col">
                            <label className="text-xs">rodzaj usługi</label>
                            <select className="text-black p-1 rounded-sm">
                                {services.map(s => (
                                    <option className="text-black" value="s.id">{s.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="service-date-from" className="text-xs">start usługi</label>
                            <input type="date" id="service-date-from" />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="service-date-to" className="text-xs">koniec usługi</label>
                            <input type="date" id="service-date-to" />
                        </div>

                        <div className="flex flex-col">
                            <label htmlFor="person-number">libcza osób</label>
                            <input id="person-number" type="number" min="1" />
                        </div>
                        <button className="bg-blue-500 p-1 rounded-sm">dodaj usługę</button>
                        <hr />
                        <button className="bg-green-500 p-1 rounded-sm">dodaj zlecenie</button>
                    </div>
                </>
            }
            <div className="space-y-4 h-full overflow-y-auto">
                <div className="w-full flex justify-between py-1">
                    <input type="month" onChange={handleDateFromChange} />
                    {admin ?
                        <button className="p-1 bg-green-500 rounded-sm" onClick={handleModal}>dodaj zlecenie</button>
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
                                                    <td key={`d-${i}-${j}`} className="border border-slate-300 h-16 hover:bg-green-600 hover:cursor-pointer">{d.toLocaleString('us-US', { day: 'numeric' })}</td>
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
                                                <div key={`dm-${i}-${j}`} className="bg-slate-600 px-2 py-4 roundex-xs hover:bg-green-500 hover:cursor-pointer">
                                                    <p>{d.toLocaleString('us-US', { day: 'numeric' })} {monthNames[month]}</p>
                                                    <p>tydzien {i + 1}, {dayNames[j]}</p>
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