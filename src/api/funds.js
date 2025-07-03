// src/api/funds.js
import client from './client'

// 拿标签
export function fetchLabels() {
    return client.get('/funds/labels')
        .then(r => r.data.data)    // 你的后端包装是 { code, data, msg }
}

// 拿分页基金
export function fetchFunds({ code,companyName, managerName, labels, page, pageSize }) {
    const params = { page, size: pageSize }
    if (code)    params.code = code
    if (companyName)  params.companyName = companyName
    if (managerName)  params.managerName = managerName
    if (labels?.length) params.labels = labels.join(',')
    return client.get('/funds', { params })
        .then(r => r.data.data)
}

export function savePortfolio(payload) {
    return client.post('/funds/portfolios', payload)
}

export function fetchFundProfile(code){
    return client
        .get(`/funds/${code}/profile`)
        .then(r => r.data.data)
}
