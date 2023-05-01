import { useEffect, useState } from "react"
import instance from "../services/Common"

export const Profile = () => {
    const [profile, setProfile] = useState()
    const [passwords, setPasswords] = useState({
        old: "",
        new: "",
        confirm: ""
    })
    const [inputs, setInputs] = useState({
        username: "",
        password: "",
        admin: false,
        coordinator: false
    });

    const handlePasswordChange = (e) => {
        e.preventDefault()
        instance.post('/users/set-password', passwords).then(() => {
            setPasswords({old: "", new: "", confirm: ""})
        })
    }

    const handleChange = (event) => {
        const name = event.target.name;
        let value = event.target.value;
        if (name === 'admin' || name == 'coordinator')
            value = !inputs[name]
        setInputs(values => ({ ...values, [name]: value }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        await instance.post('/users', inputs)
    }

    const getProfile = () => {
        instance.get('/users').then(res => {
            setProfile(res.data)
        })
    }

    useEffect(() => {
        getProfile()
    }, [])

    return (
        <>
            {!profile ? null :
                <div className="space-y-2">
                    <div>
                        <p>nazwa użytkownika: {profile.username}</p>
                        <p>status: {profile.is_admin === true && profile.is_coordinator === false ? 'ADMIN' : profile.is_coordinator === true ? 'KOORDYNATOR' : '???'}</p>
                    </div>
                    <hr />
                    <p>zmiana hasła</p>
                    <form onSubmit={handlePasswordChange} className="flex flex-col space-y-1">
                        <input required placeholder="stare hasło" type="password" className="w-full md:w-96" value={passwords.old} onChange={(e) => setPasswords({ ...passwords, old: e.target.value })} />
                        <input required placeholder="nowe hasło" type="password" className="w-full md:w-96" value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} />
                        <input required placeholder="potwierdź nowe hasło" type="password" className="w-full md:w-96" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} />
                        <button className="w-max bg-emerald-500 p-1 rounded-sm">zapisz</button>
                    </form>
                    <hr />
                    {profile.is_admin ? <>
                        <p>dodawanie użytkownika</p>
                        <form className="flex flex-col space-y-1" onSubmit={handleSubmit}>
                            <input placeholder="nazwa użytkownika" name="username" className="w-full md:w-96" type="text" value={inputs.username || ""} onChange={handleChange} />
                            <input placeholder="hasło" name="password" className="w-full md:w-96" type="password" onChange={handleChange} />
                            <label>
                                <input name="admin" type="checkbox" value={inputs.admin || false} onChange={handleChange} />
                                admin
                            </label>
                            <label>
                                <input name="coordinator" type="checkbox" value={inputs.coordinator || false} onChange={handleChange} />
                                koordynator
                            </label>
                            <button className="w-max p-1 bg-emerald-500 rounded-sm">dodaj uzytkownika</button>
                        </form>
                    </> : null}
                </div>
            }
        </>
    )
}