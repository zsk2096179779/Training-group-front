// src/api/auth.js
import client from './client'

export function register(payload) {
    return client.post('/auth/register', payload)
}

export function login(payload) {
    return client.post('/auth/login', payload)
}

// 这一句要改到 client 上：
export function setAuthToken(token) {
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`
}
