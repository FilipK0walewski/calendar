import { Outlet } from "react-router-dom";
import { useEffect } from "react";

import { useNavigate } from "react-router-dom"

import instance from "../services/Common";

import { useSelector, useDispatch } from 'react-redux'
import { removeNotification } from '../store/common'

export const Common = () => {
    const dispatch = useDispatch()
    const notifications = useSelector((state) => state.common.notifications)
    const loggedIn = useSelector((state) => state.common.loggedIn)
    const navigate = useNavigate()

    useEffect(() => {
        if (!loggedIn) navigate('/login')
    }, [])

    useEffect(() => {
        if (notifications.length === 0) return
        setTimeout(() => {
            dispatch(removeNotification())
        }, 5000)
    }, [notifications])

    return (
        <>
            <main>
                <Outlet />
            </main>
            <div className='absolute right-0 bottom-0 m-1 space-y-1'>
                {notifications.slice(0).reverse().map((i, index) => (
                    <div key={index} className={`select-none text-sm w-64 p-2 rounded-sm ${i.type === 0 ? 'bg-indigo-500' : 'bg-rose-500'}`}>
                        <span>{i.text}</span>
                    </div>
                ))}
            </div>
        </>
    )
}