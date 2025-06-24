import axios from 'axios'
import { getToken, clearAuth } from '@/utils/auth'
import { ElMessage } from 'element-plus'
import router from '@/router'

const service = axios.create({
  baseURL: '', // 使用相对路径，让Vite代理生效
  timeout: 10000
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 添加JWT令牌到请求头
    const token = getToken()
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => response.data,
  error => {
    console.error('API请求错误:', error)
    
    // 处理401未授权错误
    if (error.response && error.response.status === 401) {
      // 如果当前不在登录页面，401错误通常意味着令牌过期，需要重新登录
      const currentRoute = router.currentRoute.value;
      if (currentRoute.name !== 'Login' && currentRoute.name !== 'LoginPage') {
        ElMessage.error('登录已过期，请重新登录')
        clearAuth()
        router.push('/login')
      }
    }
    
    // 处理403禁止访问错误
    if (error.response && error.response.status === 403) {
      ElMessage.error('没有权限访问该资源')
    }
    
    if (error.response && error.response.data) {
      ElMessage.error(error.response.data)
    }
    
    return Promise.reject(error)
  }
)

export default service 