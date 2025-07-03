import axios from 'axios'
export function listPortfolios() {
    return axios.get('/api/portfolios')
}
