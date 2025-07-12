//src/api/rebalance.js
import client from '@/api/client';

// 拉再平衡详情
export function fetchRebalanceDetail(strategyId) {
    return client
        .post('/strategy-rebalance/Detail', { id: strategyId })
        .then(resp => resp.data)  // resp.data = { activeRebalancing, triggerByThreshold, … }
}

// 保存再平衡配置
export function updateRebalanceConfig(payload) {
    return client
        .post('/strategy-rebalance/Update', payload)
        .then(resp => resp.data)  // 约定后端返回 1=成功，其他=失败
}

// 触发回测
export function apirunBacktest(payload) {
    return client
        .post('/strategy-rebalance/HuiCe', payload)
        .then(resp => resp.data)  // resp.data = { cumulativeReturn, maxDrawdown, … }
}