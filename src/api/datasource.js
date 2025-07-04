import client from './client'

export function getDataSourceConfigs() {
  return client({ url: '/api/datasource/list', method: 'get' })
}
export function createDataSourceConfig(data) {
  return client({ url: '/api/datasource/create', method: 'post', data })
}
export function updateDataSourceConfig(data) {
  return client({ url: '/api/datasource/update', method: 'post', data })
}
export function deleteDataSourceConfig(id) {
  return client({ url: `/api/datasource/delete/${id}`, method: 'post' })
}
export function importDataSource(id) {
  return client.post(`/api/datasource/import/${id}`);
}

export function runPythonScript(data) {
  return client.post('/api/datasource/run-script', data);
} 