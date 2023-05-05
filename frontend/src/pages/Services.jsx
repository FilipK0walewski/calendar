import { useEffect, useState } from "react"
import instance from "../services/Common"

export const Services = () => {
    const [adding, setAdding] = useState()
    const [selected, setSelected] = useState(null)

    const [name, setName] = useState()
    const [price, setPrice] = useState()
    const [services, setServices] = useState()

    const getServices = () => {
        instance.get('/services').then(res => {
            setServices(res.data.reduce((a, s) => ({ ...a, [s.id]: s }), {}))
        })
    }

    const handleServiceAdd = (e) => {
        e.preventDefault()
        instance.post('/services', { name, price }).then(() => {
            getServices()
            setAdding(false)
        })
    }

    const handleServiceEdit = (e) => {
        e.preventDefault()
        instance.put(`/services/${selected}`, { name, price }).then(() => {
            getServices()
            setSelected(null)
        })
    }

    const handleServiceDelete = () => {
        const res = window.confirm(`usunąć ${services[selected].name}?`)
        if (!res) return
        instance.delete(`/services/${selected}`).then(() => {
            getServices()
        })
    }

    useEffect(() => {
        setName(null)
        setPrice(null)
    }, [adding])

    useEffect(() => {
        if (selected === null) return
        setName(services[selected].name)
        setPrice(services[selected].price)
    }, [selected])

    useEffect(() => {
        getServices()
    }, [])

    return (
        <>
            {adding === true || selected !== null ? <div>
                <div onClick={() => { setAdding(false); setSelected(null) }} className="absolute w-full h-full bg-slate-700 opacity-50 top-0 left-0"></div>
                <div className="bg-slate-800 p-4 rounded-sm absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full md:min-w-[500px] md:w-max md:h-min">
                    <div className="w-full h-full flex flex-col items-center justify-center space-y-2 overflow-auto">
                        {adding ? <>
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
                                <button className="p-1 rounded-sm bg-emerald-500 w-full">Dodaj</button>
                                <button className="p-1 rounded-sm bg-slate-500 w-full" onClick={() => setAdding(false)}>Anuluj</button>
                            </form>
                        </> : selected !== null ? <>
                            <p>edycja</p>
                            <form className="space-y-2" onSubmit={handleServiceEdit}>
                                <div className="flex flex-col">
                                    <label className="text-xs">nazwa</label>
                                    <input type="text" required value={name || ""} onChange={e => setName(e.target.value)} />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-xs">cena/h</label>
                                    <input type="number" min="0" required value={price || ""} onChange={e => setPrice(e.target.value)} />
                                </div>
                                <button className="p-1 rounded-sm bg-emerald-500 w-full">Zapisz</button>
                                <button className="p-1 rounded-sm bg-rose-500 w-full" onClick={() => handleServiceDelete()}>Usuń</button>
                                <button className="p-1 rounded-sm bg-slate-500 w-full" onClick={() => setSelected(null)}>Anuluj</button>
                            </form>
                        </> : <p>coś nie tak</p>}
                    </div>
                </div>
            </div> : null}
            {!services ? <p>ladowanie...</p> : <>
                <div className="w-full flex justify-between py-1">
                    <p className="text-lg">{Object.keys(services).length === 0 ? 'brak serwisow' : 'serwisy'}</p>
                    <button className="bg-emerald-500 p-1 rounded-sm" onClick={() => setAdding(true)}>Dodaj</button>
                </div>
                <ul className="list-disc list-inside">
                    {Object.keys(services).map(i => (
                        <li key={i} value={i} className="underline cursor-pointer hover:text-rose-500 w-max" onClick={() => setSelected(i)}>{services[i].name} - {services[i].price} zł</li>
                    ))}
                </ul>
            </>
            }
        </>
    )
}