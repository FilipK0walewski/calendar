import { useEffect, useState } from "react"
import instance from "../services/Common"

export const Profile = () => {
    const [profile, setProfile] = useState()
    const [inputs, setInputs] = useState({
        username: "",
        password: "",
        admin: false,
        coordinator: false
    });

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
                <div>
                    <p>uzytkownik: {profile.username}</p>
                    <p>administrator: {profile.is_admin ? 'TAK' : 'NIE'}</p>
                    <p>koordynator: {profile.is_coordinator ? 'TAK' : 'NIE'}</p>

                    {profile.is_admin ?
                        <form className="flex flex-col space-y-1" onSubmit={handleSubmit}>
                            <input placeholder="nazwa użytkownika" name="username" className="w-96" type="text" value={inputs.username || ""} onChange={handleChange} />
                            <input placeholder="hasło" name="password" className="w-96" type="password" onChange={handleChange} />
                            <label>
                                <input name="admin" type="checkbox" value={inputs.admin || false} onChange={handleChange} />
                                admin
                            </label>
                            <label>
                                <input name="coordinator" type="checkbox" value={inputs.coordinator || false} onChange={handleChange} />
                                koordynator
                            </label>
                            <button className="w-max p-1 bg-green-500">dodaj uzytkownika</button>
                        </form>
                        : null}
                </div>
            }
        </>
    )
}