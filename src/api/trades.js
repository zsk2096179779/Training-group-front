import axios from 'axios'
export function listTrades() {
    return axios.get('/api/trades')
}
