import store from "../store/store"
import axios from "axios";
import { addNotification } from "../store/common";

const addLog = (text, n) => {
    store.dispatch(addNotification({ text, type: n }))
}

const token = localStorage.getItem('token')
const instance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://pierdolnik.online/api',
})

if (token) instance.defaults.headers.common['token'] = token
instance.interceptors.response.use((res) => {
    if (res.data && res.data.message) addLog(res.data.message, 0)
    return res
}, (err) => {
    console.log(err)
    if (!err) {
        addLog('error', 1)
    }
    else if (err.response && err.response.data && err.response.data.detail && err.response.data.detail.message) {
        addLog(err.response.data.detail.message, 1)
    }
    else if (err.message) {
        addLog(err.message, 1)
    }
    else {
        addLog('something no yes', 1)
    }
    return Promise.reject(err)
})

export default instance