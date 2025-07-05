// src/api/client.js
import axios from 'axios'
import {getToken} from "@/utils/auth";

const client = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
    timeout: 5000,
    headers: { 'Content-Type': 'application/json' }
})

client.interceptors.request.use(config => {
    // 1) 注入最新的 JWT（假设你把它存在 localStorage）
    const token = getToken()
    if (token) {
       config.headers.Authorization = `Bearer ${token}`
    }
    console.log(`[→ Request] ${config.method.toUpperCase()} ${config.baseURL}${config.url}`)
    console.log('Headers:', config.headers)
    console.log('Params/Data:', config.params || config.data)
    return config
})

client.interceptors.response.use(
    resp => {
        console.log('[← Response]', resp.status, resp.config.url)
        console.log('  Data:', resp.data)
        return resp
    },
    err => {
        if (err.response) {
            console.error('[← ErrorResponse]', err.response.status, err.response.config.url)
            console.error('  Data:', err.response.data)
        } else {
            console.error('[← Network/Other Error]', err.message)
        }
        return Promise.reject(err)
    }
)

export default client
