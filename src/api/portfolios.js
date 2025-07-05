// src/api/portfolios.js
import client from '@/api/client'
import * as qs from "qs";


// 获取所有产品组合
export function getCombos() {
    return client.get('/combos')
        .then(res=>res.data.data)
}

// 获取组合详情
export function getFundId(id) {
    return client
        .get(`/combos/${id}`)
        .then(resp => resp.data.data)
}

export function getFunds(ids) {
    return client
        .get('/combos/funds', {
            params: { ids },
            paramsSerializer: params => qs.stringify(params, { arrayFormat: 'repeat' })
        })
        .then(resp => resp.data.data)
}




// 创建组合
export function createCombo(data) {
    return client
        .post('/combos/create', data)
        .then(resp => resp.data)
}

// 获取所有基金列表
export function getAllFunds() {
    return client
        .get('/funds')
        .then(resp => resp.data.data.items)
}