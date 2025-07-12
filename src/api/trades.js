// src/api/trades.js
import client from '@/api/client'


/** 提交订单 */
export function submitOrders(payload) {
    return client.post('/trading/orders', payload).then(r => r.data);
}

/** 1. 组合调仓 */
export function doRebalance(payload) {
    return client.post('/trading/rebalance', payload).then(r => r.data)
}
/** 4. 交易单分页列表 */
export function listOrders(params) {
    return client.get('/trading/orders',{params}).then(r => r.data)
}
/** 5. 一键执行/驳回 */
export function executeOrder(orderId) {
    return client.post('/trading/orders/execute', { orderId }).then(r => r.data)
}
export function rejectOrder(orderId) {
    return client.post('/trading/orders/reject', { orderId }).then(r => r.data)
}
/** 6. 交割单分页 */
export function listDeliveryNotes(page,size) {
    return client.get('/trading/delivery-notes', {params:{page,szie}}).then(r => r.data)
}

/** 1. 获取失败订单列表 （差错列表） */
export function fetchErrorOrders({ page = 1, limit = 100 } ) {
    return client
        .get('/trading/orders/errors', { type: 'error', page, limit })
        .then(r => r.data.items)
}

/** 2. 获取可替换的基金列表 （备用标的） */
export function fetchFunds({ page = 1, limit = 100 } = {}) {
    return client
        .get('/fund-research/list', { page, limit, nameFilter: '' })
        .then(r => r.data.items)
}

/** 3. 替换失败订单 */
export function replaceErrorOrder(orderId, newFundId) {
    return client
        .post('/trading/error/replace', { orderId, newFundId })
        .then(r => r.data)
}

/** 4. 重试下单（即重新执行那条订单） */
export function retryOrder(orderId) {
    return client
        .post('/trading/orders/execute', { orderId })
        .then(r => r.data)
}

/** 获取账户列表（带搜索、偏离度） */
export function fetchAccountList(search = '') {
    return client
        .get('/trading/account-rebalance/accounts', { params:{search} })
        .then(r => r.data)  // 期望返回 [{ accountId, accountName, deviation }, ...]
}

/** 获取单个账户的调仓详情（含 funds: [{ id, name, currentRatio, targetRatio }]） */
export function fetchAccountDetail(accountId) {
    return client
        .get('/trading/account-rebalance/detail', { accountId })
        .then(r => r.data)
}

/** 提交账户调仓 */
export function submitAccountRebalance(payload) {
    // payload = { accountId, funds: [{ id, targetRatio }] }
    return client
        .post('/trading/account-rebalance', payload)
        .then(r => r.data)
}

export function cancelOrder(orderId) {
    return client.delete(`/trading/orders/${orderId}`).then(r => r.data);
}
export function fixError(payload) {
    return client.post('/trading/errors/fix', payload).then(r => r.data);
}



export const sendRebalancingOrder = doRebalance