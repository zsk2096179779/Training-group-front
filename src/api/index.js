import request from '@/utils/request'

export function getProductList() {
    return request.get('/products')
}

export function createOrder(data) {
    return request.post('/orders', data)
}