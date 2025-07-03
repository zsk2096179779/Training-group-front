import axios from 'axios'
export function listFactors(params) {
    return axios.get('/api/factors', { params })
}
