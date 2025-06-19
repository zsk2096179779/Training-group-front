import axios from 'axios'

const service = axios.create({
  baseURL: '/', // 可根据需要调整
  timeout: 10000
})

service.interceptors.response.use(
  response => response.data,
  error => Promise.reject(error)
)

export default service 