// src/api/auth.js
import client from './client'

/**
 * 注册
 * @param {Object} payload - { username, email, password }
 * @returns {Promise}
 */
export function register(payload) {
    return client.post('/auth/register', payload)
}

/**
 * 登录
 * @param {Object} payload - { email, password }
 * @returns {Promise<AxiosResponse<{ token, user }>>}
 */
export function login(payload) {
    return client.post('/auth/login', payload)
}

/**
 * 获取当前用户信息
 * @returns {Promise<AxiosResponse<UserInfo>>}
 */
export function getUserInfo() {
    return client.get('/auth/user')
}

/**
 * 登出
 * @returns {Promise}
 */
export function logout() {
    return client.post('/auth/logout')
}

/**
 * 手动设置 JWT 到请求头
 * （如果你在 login 拿到 token 之后需要立即生效）
 * @param {string} token
 */
export function setAuthToken(token) {
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`
}
