import axios from 'axios'
export function listUsers() {
    return axios.get('/api/admin/users')
}
