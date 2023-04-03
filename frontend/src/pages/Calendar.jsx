import { useEffect, useState } from "react"

export const Calendar = () => {
    const dayNames = ['poniedzialek', 'wtorek', 'sroda', 'czwartek', 'piatek', 'sobota', 'niedziela']
    const monthNames = ['styczen', 'luty', 'marzec', 'kwiecien', 'maj', 'czerwiec', 'lipiec', 'sierpien', 'wrzesien', 'pazdziernik', 'listopad', 'Igrudzien']
    const [month, setMonth] = useState()
    const [year, setYear] = useState()
    const [days, setDays] = useState([])

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

    useEffect(() => {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        setYear(currentYear)
        setMonth(currentMonth)
        const selected = getDaysInMonth(currentYear, currentMonth)
        setDays(selected)
    }, [])

    return (
        <>
            <div className="space-y-4 h-full overflow-y-auto">
                <input type="month" onChange={handleDateFromChange} />
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
                                <div className="w-full space-y-2">
                                    {week.map((d, j) => (
                                        <>
                                            {d === null ? null :
                                                <div className="bg-slate-600 px-2 py-4 roundex-xs hover:bg-green-500 hover:cursor-pointer">
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