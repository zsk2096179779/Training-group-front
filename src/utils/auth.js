import client from "../api/client";

const TOKEN_KEY = 'accessToken'
const USER_KEY = 'userInfo'

// 获取令牌
export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

// 设置令牌
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
  client.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

// 移除令牌
export function removeToken() {
  localStorage.removeItem(TOKEN_KEY)
}

// 获取用户信息
export function getUserInfoStorage() {
  return JSON.parse(localStorage.getItem(USER_KEY) || 'null')
}

// 设置用户信息
export function setUserInfo(userInfo) {
  localStorage.setItem(USER_KEY, JSON.stringify(userInfo))
}

// 移除用户信息
export function removeUserInfo() {
  localStorage.removeItem(USER_KEY)
}

// 清除所有认证信息
export function clearAuth() {
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(TOKEN_KEY)
  delete client.defaults.headers.common['Authorization']
}

// 检查是否已登录
export function isAuthenticated() {
  return !!getToken()
}

// 检查是否是管理员
export function isAdmin() {
  const userInfo = getUserInfoStorage()
  // 检查 userInfo 是否存在，并且 role 字段是否为 'ROLE_ADMIN'
  return userInfo && userInfo.role === 'ROLE_ADMIN'
} 