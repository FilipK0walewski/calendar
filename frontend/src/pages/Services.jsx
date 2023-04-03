import { useEffect, useState } from "react"
import instance from "../services/Common"

export const Services = () => {

    const [name, setName] = useState()
    const [services, setServices] = useState()

    const getServices = () => {
        instance.get('/services').then(res => {
            setServices(res.data)
        })
    }

    const handleServiceAdd = async (e) => {
        e.preventDefault()
        setName(null)
        await instance.post('/services', { name })
        getServices()
    }

    const handleServiceDelete = async (e) => {
        console.log(e.target.value)
        const res = window.confirm('usunąć?')
        if (!res) return
        await instance.delete(`/services/${e.target.value}`)
        getServices()
    }

    useEffect(() => {
        getServices()
    }, [])

    return (
        <>
            <div className="flex items-center justify-between py-2">
                <p className="text-lg">serwisy</p>
                <form className="space-x-2 flex" onSubmit={handleServiceAdd}>
                    <input className="rounded-sm px-2" type="text" value={name || ''} onChange={e => setName(e.target.value)} />
                    <button className="p-1 bg-green-500 rounded-sm">dodaj</button>
                </form>
            </div>
            {!services ? null :
                <ul className="list-disc list-inside">
                    {services.map(i => (
                        <li key={`s-${i.id}`} value={i.id} className="underline cursor-pointer" onClick={handleServiceDelete}>{i.name}</li>
                    ))}
                </ul>
            }
        </>
    )
}