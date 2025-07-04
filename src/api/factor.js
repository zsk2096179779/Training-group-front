import client from './client'

// 因子相关接口
export const factorApi = {
  // 获取所有因子
  getAllFactors() {
    return client.get('/factors')
        .then(res => res.data.data);
  },

  // 根据ID获取因子
  getFactorById(id) {
    return client.get(`/factors/${id}`)
        .then(res => res.data.data);
  },

  // 创建因子
  createFactor(data) {
    return client.post('/factors', data)
        .then(res => res.data.data);
  },

  // 更新因子
  updateFactor(data) {
    return client.put('/factors', data)
        .then(res => res.data.data);
  },

  // 删除因子
  deleteFactor(id) {
    return client.delete(`/factors/${id}`)
        .then(res => res.data.data);
  },

  // 预览公式
  previewFormula(data) {
    return client.post('/factors/previewFormula', data)
        .then(res => res.data.data);
  }
};

export function getFactorTree(treeType) {
  return client({
    url: '/factor-tree/listWithTreeName',
    method: 'get',
    params: { treeType }
  })
      .then(res => res.data.data)
}

// 根据节点ID获取该节点下因子
export function getFactorsByNodeId(nodeId) {
  return client({
    url: '/factors/listByNodeRecursive',
    method: 'get',
    params: { nodeId }
  })
      .then(res => res.data.data)
}

// 拖拽排序：更新节点的父节点和顺序
export function updateNodeOrder(data) {
  return client.post('/factor-tree/updateOrder', data)
      .then(res => res.data.data);
}

// 获取因子树业务场景列表
export function getFactorTreeScenes() {
  return client({
    url: '/factor-tree/scenes',
    method: 'get'
  })
      .then(res => res.data.data);
}

// 注意：后端接口返回格式为 { code, msg, data }，前端应使用 res.data.data