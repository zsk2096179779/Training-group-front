import request from './request.js'

// 登录接口
export function login(data) {
  return request({
    url: '/api/auth/login/',
    method: 'post',
    data
  })
}

// 注册接口
export function register(data) {
  return request({
    url: '/api/auth/register/',
    method: 'post',
    data
  })
}

// 获取当前用户信息
export function getUserInfo() {
  return request({
    url: '/api/auth/user',
    method: 'get'
  })
}

// 登出接口
export function logout() {
  return request({
    url: '/api/auth/logout/',
    method: 'post'
  })
} 