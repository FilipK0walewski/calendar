import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import instance from "../services/Common"

import { useSelector, useDispatch } from 'react-redux'
import { logIn } from '../store/common'

export const Login = () => {
    const dispatch = useDispatch()
    const loggedIn = useSelector((state) => state.common.loggedIn)

    const navigate = useNavigate()

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    const handleLogIn = (e) => {
        e.preventDefault()
        instance.post('/users/login', { username, password }).then(res => {
            console.log(res.data)
            dispatch(logIn(res.data))
            navigate('/')
        })
    }

    const svg = {
        color: "black",
        transform: 'scale(300%)'
    };

    useEffect(() => {
        if (loggedIn) navigate('/')
    })

    return (
        <>
            <div className="w-full h-screen bg-slate-300 flex flex-col justify-center items-center space-y-12">
                <svg style={svg} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M6 22q-.825 0-1.413-.588T4 20V10q0-.825.588-1.413T6 8h1V6q0-2.075 1.463-3.538T12 1q2.075 0 3.538 1.463T17 6v2h1q.825 0 1.413.588T20 10v10q0 .825-.588 1.413T18 22H6Zm6-5q.825 0 1.413-.588T14 15q0-.825-.588-1.413T12 13q-.825 0-1.413.588T10 15q0 .825.588 1.413T12 17ZM9 8h6V6q0-1.25-.875-2.125T12 3q-1.25 0-2.125.875T9 6v2Z" /></svg>
                <form onSubmit={handleLogIn} className="flex flex-col space-y-4">
                    <input placeholder="login" onChange={e => setUsername(e.target.value)} type="text" className="p-2" />
                    <input placeholder="password" onChange={e => setPassword(e.target.value)} type="password" className="p-2" />
                    <button className="bg-green-500 p-2">log in</button>
                </form>
            </div>
        </>
    )
}