import axios from 'axios';

// 创建axios实例
const request = axios.create({
  baseURL: '/api',
  timeout: 5000,
  headers: {
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  }
});

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 添加时间戳防止缓存
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: new Date().getTime()
      };
    }
    console.log('Request:', config.url, config.method, config.data);
    // 可以在这里添加token等认证信息
    return config;
  },
  error => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  response => {
    console.log('Response URL:', response.config.url)
    console.log('Response Status:', response.status)
    console.log('Response Headers:', response.headers)
    console.log('Response Data:', JSON.stringify(response.data, null, 2))
    
    const res = response.data
    // 兼容 code 为 0 或 200 都认为是成功
    if (res.code === 0 || res.code === 200) {
      return res.data
    } else {
      return Promise.reject(new Error(res.msg || res.message || '请求失败'))
    }
  },
  error => {
    console.error('Response Error:', error.response || error)
    return Promise.reject(error)
  }
)

// 因子相关接口
export const factorApi = {
  // 获取所有因子
  getAllFactors() {
    return request.get('/factors');
  },

  // 根据ID获取因子
  getFactorById(id) {
    return request.get(`/factors/${id}`);
  },

  // 创建因子
  createFactor(data) {
    return request.post('/factors', data);
  },

  // 更新因子
  updateFactor(data) {
    return request.put('/factors', data);
  },

  // 删除因子
  deleteFactor(id) {
    return request.delete(`/factors/${id}`);
  }
};

export function getFactorTree() {
    return axios.get('/api/factors/tree');
}