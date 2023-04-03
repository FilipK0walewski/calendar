import { Common } from './layouts/Common'
import { DefaultLayout } from './layouts/DefaultLayout'
import { Calendar } from './pages/Calendar'
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { Profile } from './pages/Profile'
import { Services } from './pages/Services'

import { Navigate, Route, Routes } from 'react-router-dom'

import { useDispatch } from 'react-redux'
import { setUserData } from './store/common'

import { useEffect } from 'react'
import instance from './services/Common'

export default function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    if (!instance.defaults.headers.common['token']) return
    instance.get('/users').then(res => {
      dispatch(setUserData(res.data))
    })
  }, [])

  return (
    <>
      <Routes>
        <Route element={<Common />}>
          <Route element={<DefaultLayout />} >
            <Route path='/' element={<Home />} />
            <Route path='/profile' element={<Profile />} />
            <Route path='/calendar' element={<Calendar />} />
            <Route path='/types-of-services' element={<Services />} />
          </Route>
          <Route path='/login' element={<Login />} />
          <Route path='*' element={<Navigate to={'/'} />} />
        </Route>
      </Routes>
    </>
  )
}
