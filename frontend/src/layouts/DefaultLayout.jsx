import { Link, Outlet, useNavigate } from "react-router-dom";

import { useSelector, useDispatch } from 'react-redux'
import { logOut } from '../store/common'

export const DefaultLayout = () => {
    const dispatch = useDispatch()
    const loggedIn = useSelector((state) => state.common.loggedIn)
    const username = useSelector((state) => state.common.username)
    const navigate = useNavigate()

    const handleLogOut = () => {
        dispatch(logOut())
        navigate('/login')
    }

    return (
        <>
            <main className="absolute top-0 left-0 w-full h-full pt-12">
                <div className='container px-4 bg-slate-500 w-full h-full mx-auto'>
                    <Outlet />
                </div>
            </main>
            <header className="w-full h-12 bg-slate-400 absolute">
                <div className='container mx-auto w-full h-full flex items-center justify-between'>
                    <Link to='/'>
                        <img src="/cal.svg" alt="kalendarz" />
                    </Link>
                    {loggedIn ?
                        <div className="flex space-x-4 items-center px-1">
                            <Link className='underline text-slate-900' to='/profile'>{username}</Link>
                            <button className='bg-inherit underline text-slate-900' onClick={handleLogOut}>log out</button>
                        </div>
                        :
                        <Link className='underline text-slate-900' to='/login'>login</Link>
                    }
                </div>
            </header>
        </>
    )
}