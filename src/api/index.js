// src/api/index.js
import request from '@/utils/request'
import * as qs from "qs";


// 获取所有产品组合
export function getCombos() {
    return request({
        url: '/combos',
        method: 'get'
    })
}

// 获取组合详情
export function getFundId(id) {
    return request({
        url: `/combos/${id}`,
        method: 'get'
    })
}

export function getFunds(ids) {
    return request({
            url: '/combos/funds',
            method: 'get',
            params: {ids: ids},
            paramsSerializer: params => qs.stringify(params, {arrayFormat: 'repeat'})
        }
    )
}




// 创建组合
export function createCombo(data) {
    return request({
        url: '/combos/create', // 修改为后端真实路径
        method: 'post',
        data
    })
}

// 获取所有基金列表
export function getAllFunds() {
    return request({
        url: '/combos/funds/all',
        method: 'get'
    })
}