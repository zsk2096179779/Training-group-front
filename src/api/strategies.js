import axios from 'axios'
export function listStrategies() {
    return axios.get('/api/strategies')
}
