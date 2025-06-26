import request from './request'

// 因子相关接口
export const factorApi = {
  // 获取所有因子
  getAllFactors() {
    return request.get('/api/factors');
  },

  // 根据ID获取因子
  getFactorById(id) {
    return request.get(`/api/factors/${id}`);
  },

  // 创建因子
  createFactor(data) {
    return request.post('/api/factors', data);
  },

  // 更新因子
  updateFactor(data) {
    return request.put('/api/factors', data);
  },

  // 删除因子
  deleteFactor(id) {
    return request.delete(`/api/factors/${id}`);
  },

  // 预览公式
  previewFormula(data) {
    return request.post('/api/factors/previewFormula', data);
  }
};

export function getFactorTree(treeType) {
  return request({
    url: '/api/factor-tree/listWithTreeName',
    method: 'get',
    params: { treeType }
  })
}

// 根据节点ID获取该节点下因子
export function getFactorsByNodeId(nodeId) {
  return request({
    url: '/api/factors/listByNodeRecursive',
    method: 'get',
    params: { nodeId }
  })
}

// 拖拽排序：更新节点的父节点和顺序
export function updateNodeOrder(data) {
  return request.post('/api/factor-tree/updateOrder', data);
}

// 获取因子树业务场景列表
export function getFactorTreeScenes() {
  return request({
    url: '/api/factor-tree/scenes',
    method: 'get'
  });
}

// 注意：后端接口返回格式为 { code, msg, data }，前端应使用 res.data.data