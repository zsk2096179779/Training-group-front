import axios from 'axios'
import.meta.env.VITE_API_BASE_URL // 使用 Vite 的环境变量

//
// 创建 axios 实例
const service = axios.create({
    baseURL: 'http://localhost:8080' || '/api', // 后端地址
    timeout: 5000,
    //错误码500依旧显示数据，显示详情拿不到基金表！！！
/*    validateStatus: function (status) {
        return status >= 200 && status < 600;  // 允许所有状态码进入 then，不抛异常
    }*/
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
        // if (error.response && error.response.data){
        //     return Promise.resolve(error.response.data); // 即使HTTP错误也返回业务数据
        // }
        return Promise.reject(error)
    }
)
export default service