import { useEffect, useState } from "react"
import instance from "../services/Common"

export const Services = () => {
    const [adding, setAdding] = useState()
    const [name, setName] = useState()
    const [price, setPrice] = useState()
    const [services, setServices] = useState()

    const getServices = () => {
        instance.get('/services').then(res => {
            setServices(res.data)
        })
    }

    const handleServiceAdd = (e) => {
        e.preventDefault()
        console.log(name, price)
        instance.post('/services', { name, price }).then(() => {
            getServices()
            setPrice(null)
            setName(null)
        })
    }

    const handleServiceDelete = (e) => {
        const res = window.confirm('usunąć?')
        if (!res) return
        instance.delete(`/services/${e.target.value}`).then(() => {
            getServices()
        })
    }

    useEffect(() => {
        getServices()
    }, [])

    return (
        <>
            {adding ? <div>
                <div onClick={() => setAdding(false)} className="absolute w-full h-full bg-slate-700 opacity-50 top-0 left-0"></div>
                <div className="bg-slate-800 p-4 rounded-sm absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full md:min-w-[500px] md:w-max md:h-min">
                    <div className="w-full h-full flex flex-col items-center justify-center space-y-2 overflow-auto">
                        <p>dodaj nowy serwis!</p>
                        <form className="space-y-2" onSubmit={handleServiceAdd}>
                            <div className="flex flex-col">
                                <label className="text-xs">nazwa</label>
                                <input type="text" required value={name || ""} onChange={e => setName(e.target.value)} />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-xs">cena/h</label>
                                <input type="number" min="0" required value={price || ""} onChange={e => setPrice(e.target.value)} />
                            </div>
                            <button className="p-1 rounded-sm bg-green-500 w-full">dodaj</button>
                            <button className="p-1 rounded-sm bg-rose-500 w-full" onClick={() => setAdding(false)}>anuluj</button>
                        </form>
                    </div>
                </div>
            </div> : null}

            {!services ? <p>ladowanie...</p> : <>
                <div className="w-full flex justify-between py-1">
                    <p className="text-lg">{services.length === 0 ? 'brak serwisow' : 'serwisy'}</p>
                    <button className="bg-green-500 p-1 rounded-sm" onClick={() => setAdding(true)}>dodaj</button>
                </div>
                <ul className="list-disc list-inside">
                    {services.map(i => (
                        <li key={i.id} value={i.id} className="underline cursor-pointer hover:text-rose-500 w-max" onClick={handleServiceDelete}>{i.name} - {i.price}PLN</li>
                    ))}
                </ul>
            </>
            }
        </>
    )
}