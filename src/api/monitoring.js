// src/api/monitoring.js
import client from '@/api/client'

// 拉取实时监控指标
export function fetchMetrics(strategyId) {
    return client
        .post('/strategy-monitoring/Metrics', { id: strategyId })
        .then(r => r.data)
}

// 拉取预警通知
export function fetchWarnings(strategyId) {
    return client
        .post('/strategy-monitoring/Warnings', { id: strategyId })
        .then(r => r.data)
}

// 拉取收益曲线
export function fetchProfitCurve(strategyId) {
    return client
        .post('/strategy-monitoring/ProfitCurve', { id: strategyId })
        .then(r => r.data)
}

// 拉取热力图
export function fetchHeatmap(strategyId) {
    return client
        .post('/strategy-monitoring/Heatmap', { id: strategyId })
        .then(r => r.data)
}

