// src/api/strategy.js
import client from '@/api/client'

// 拉取策略列表（带分页、搜索、状态过滤）
export function fetchStrategies({ page = 1, limit = 10, name = '', status = 'all' } = {}) {
    return client
        .post('/strategy-management', {
            page,
            limit,
            nameFilter: name,
            statusFilter: status
        })
        .then(resp => resp.data)    // 拿到后端包装在 data.data 里的列表
}

// 启动策略
export function startStrategy(strategyId) {
    return client
        .post('/strategy-management/start', { strategyId })
        .then(resp => resp.data)         // 只要整个 resp.data 里的 success / message
}

// 停止策略
export function stopStrategy(strategyId) {
    return client
        .post('/strategy-management/stop', { strategyId })
        .then(resp => resp.data)
}

// 删除策略
export function deleteStrategy(strategyId) {
    return client
        .post('/strategy-management/delete', { strategyId })
        .then(resp => resp.data)
}
