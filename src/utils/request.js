import axios from 'axios'
import.meta.env.VITE_API_BASE_URL // 使用 Vite 的环境变量

// 创建 axios 实例
const service = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api', // 修改这里
    timeout: 5000
})

// 请求拦截器
service.interceptors.request.use(
    config => {
        // 可以在这里统一设置token等
        return config
    },
    error => {
        return Promise.reject(error)
    }
)

// 响应拦截器
service.interceptors.response.use(
    response => {
        return response.data
    },
    error => {
        return Promise.reject(error)
    }
)

export default service