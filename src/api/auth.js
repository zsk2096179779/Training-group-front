// src/api/auth.js
import client from './client'
import axios from 'axios'

/**
 * 注册
 * @param {Object} payload - { username, email, password }
 * @returns {Promise<AxiosResponse<any>>}
 */
export function register(payload) {
    return client.post('/auth/register', payload)
}

/**
 * 登录
 * @param {Object} payload - { username, password }
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export function login(payload) {
    return client
        .post('/auth/login', payload)
        .then(res => res.data)
}

/**
 * 获取当前用户信息
 * @returns {Promise<UserInfo>}
 */
export function getUserInfo() {
    return client
        .get('/auth/user')
        .then(res => res.data)
}

/**
 * 登出
 * @returns {Promise<AxiosResponse<any>>}
 */
export function logout() {
    return client.post('/auth/logout')
}

