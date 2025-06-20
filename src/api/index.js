// src/api/product.js
import request from '@/utils/request'

// 获取所有产品组合
export function getCombos() {
    return request({
        url: '/combos',
        method: 'get'
    })
}

// 获取组合详情
export function getComboDetail(id) {
    return request({
        url: `/combos/${id}`,
        method: 'get'
    })
}

// 创建组合
export function createCombo(data) {
    return request({
        url: '/create',
        method: 'post',
        data
    })
}