import request from './request'

export function getDataSourceConfigs() {
  return request({ url: '/api/datasource/list', method: 'get' })
}
export function createDataSourceConfig(data) {
  return request({ url: '/api/datasource/create', method: 'post', data })
}
export function updateDataSourceConfig(data) {
  return request({ url: '/api/datasource/update', method: 'post', data })
}
export function deleteDataSourceConfig(id) {
  return request({ url: `/api/datasource/delete/${id}`, method: 'post' })
}
export function importDataSource(id) {
  return request({ url: `/api/datasource/import/${id}`, method: 'post' })
} 