<template>
  <el-container style="height: 100vh;">
    <el-header style="background: #f5f7fa; border-bottom: 1px solid #e4e7ed; display: flex; align-items: center; padding: 0 20px;">
      <span style="font-size: 18px; font-weight: bold;">策略管理</span>
    </el-header>
    
    <el-main style="background: #f5f7fa; padding: 20px; overflow: auto;">
      <div style="background: #fff; border-radius: 4px; box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1); margin-bottom: 20px;">
        <div style="padding: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="font-size: 16px; font-weight: 500; margin: 0;">策略列表</h3>
            <div style="display: flex;">
              <el-input 
                v-model="searchQuery"
                placeholder="搜索策略名称" 
                clearable
                style="margin-right: 15px; width: 240px;"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
              <el-select v-model="statusFilter" placeholder="全部状态" style="width: 120px;">
                <el-option label="全部状态" value="all" />
                <el-option label="运行中" value="active" />
                <el-option label="已停止" value="stop" />
                <el-option label="警告" value="warn" />
              </el-select>
            </div>
          </div>
          
          <el-table :data="pagedStrategies" v-loading="loading" style="width: 100%">
            <el-table-column prop="name" label="策略名称" min-width="180" />
            <el-table-column prop="type" label="策略类型" min-width="120" />
            <el-table-column label="状态" min-width="100">
              <template #default="{ row }">
                <el-tag 
                  :type="statusTypeMap[row.status]"
                  :effect="row.status === 'active' ? 'light' : 'plain'"
                  style="display: flex; align-items: center;"
                >
                  <span :class="['status-dot', statusDotClassMap[row.status]]"></span>
                  {{ statusLabelMap[row.status] }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="创建时间" min-width="180" />
            <el-table-column label="最新收益" min-width="120">
              <template #default="{ row }">
                <span :style="{ color: row.gain >= 0 ? '#67c23a' : '#f56c6c' }">
                  {{ row.gain >= 0 ? '+' : '' }}{{ row.gain }}%
                </span>
              </template>
            </el-table-column>
            <el-table-column label="操作" min-width="150">
              <template #default="{ row }">
                <el-button type="text" size="small" @click="viewDetail(row)">详情</el-button>
                <el-button 
                  v-if="row.status === 'active'" 
                  type="text" 
                  size="small"
                  style="color: #f56c6c;"
                  @click="stopStrategy(row)"
                >
                  停止
                </el-button>
                <el-button 
                  v-else 
                  type="text" 
                  size="small"
                  style="color: #67c23a;"
                  @click="startStrategy(row)"
                >
                  启动
                </el-button>
                <el-button type="text" size="small" style="color:#f56c6c;" @click="showDeleteConfirm(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px;">
            <div style="font-size: 12px; color: #909399;">
              共 {{ filteredStrategies.length }} 条记录，每页显示 {{ pageSize }} 条
            </div>
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 30, 40]"
              :total="filteredStrategies.length"
              layout="prev, pager, next"
              background
              small
            />
          </div>
        </div>
      </div>
    </el-main>
    <el-dialog
      v-model="deleteDialogVisible"
      title="删除策略"
      width="30%"
      :before-close="handleDialogClose"
    >
      <span>确定要删除策略 <strong>{{ deletingStrategyName }}</strong> 吗？此操作不可恢复。</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmDelete" style="background-color: #f56c6c; border:none;">
            确定删除
          </el-button>
        </div>
      </template>
    </el-dialog>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import axios from 'axios'
import { ElMessage,ElMessageBox } from 'element-plus'

// 加载状态
const loading = ref(false)

// 搜索过滤条件
const searchQuery = ref('')
const statusFilter = ref('all')

// 分页参数
const currentPage = ref(1)
const pageSize = ref(10)

// 状态映射
const statusLabelMap = {
  active: '运行中',
  stop: '已停止',
  warn: '警告'
}

const statusTypeMap = {
  active: 'success',
  stop: 'info',
  warn: 'warning'
}

const statusDotClassMap = {
  active: 'status-dot-success',
  stop: 'status-dot-info',
  warn: 'status-dot-warning'
}

// 策略数据
const strategies = ref([])

// 计算属性 - 过滤后的策略
const filteredStrategies = computed(() => {
  return strategies.value.filter(strategy => {
    const nameMatch = searchQuery.value 
      ? strategy.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      : true
      
    const statusMatch = statusFilter.value === 'all' 
      ? true 
      : strategy.status === statusFilter.value
      
    return nameMatch && statusMatch
  })
})

// 计算属性 - 分页数据
const pagedStrategies = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredStrategies.value.slice(start, end)
})

// 获取策略数据
const fetchStrategies = async () => {
  try {
    loading.value = true
    const response = await axios.post('/api/strategy-management', {
      id: 1,
      name: 'fu4geliu'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    strategies.value = response.data.map(strategy => ({
      id: strategy.id,
      name: strategy.name,
      type: getTypeName(strategy.type),
      status: strategy.status.toLowerCase(),
      createdAt: formatDateTime(strategy.createTime),
      gain: strategy.gain
    }))
  } catch (error) {
    console.error('获取策略失败:', error)
    ElMessage.error('获取策略数据失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

// 格式化日期时间
const formatDateTime = (dateTime) => {
  const options = { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit', 
    minute: '2-digit'
  }
  return new Date(dateTime).toLocaleString('zh-CN', options).replace(/\//g, '-')
}

// 将类型编码转为可读名称
const getTypeName = (typeCode) => {
  const typeMap = {
    '1': '大类资产配置',
    '2': 'FOF组合',
    '3': '基金指数组合',
    '4': '择时策略'
  }
  return typeMap[typeCode] || `类型${typeCode}`
}

// 策略操作函数
const viewDetail = (strategy) => {
  console.log('查看策略详情:', strategy)
  ElMessage.info(`查看策略: ${strategy.name}`)
}

// 停止策略
const stopStrategy = async (strategy) => {
  try {
    loading.value = true
    // 发送停止请求到后端（通过/api代理）
    const response = await axios.post('/api/strategy-management/stop', 
      { strategyId: strategy.id }, 
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    
    if (response.data.success) {
      // 请求成功后更新前端状态
      strategy.status = 'stop'
      ElMessage.success('策略已停止')
    } else {
      ElMessage.error(`停止策略失败: ${response.data.message || '未知错误'}`)
    }
  } catch (error) {
    console.error('停止策略失败:', error)
    ElMessage.error('停止策略失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

// 启动策略
const startStrategy = async (strategy) => {
  try {
    loading.value = true
    // 发送启动请求到后端（通过/api代理）
    const response = await axios.post('/api/strategy-management/start', 
      { strategyId: strategy.id }, 
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    
    if (response.data.success) {
      // 请求成功后更新前端状态
      strategy.status = 'active'
      ElMessage.success('策略已启动')
    } else {
      ElMessage.error(`启动策略失败: ${response.data.message || '未知错误'}`)
    }
  } catch (error) {
    console.error('启动策略失败:', error)
    ElMessage.error('启动策略失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

const deleteDialogVisible = ref(false)
const deletingStrategy = ref(null) // 待删除的策略
const deletingStrategyName = computed(() => deletingStrategy.value?.name || '')
// 删除策略
const showDeleteConfirm = (strategy) => {
  deletingStrategy.value = strategy
  deleteDialogVisible.value = true
}

// 实际执行删除
const confirmDelete = async () => {
  if (!deletingStrategy.value) return
  
  try {
    loading.value = true
    const response = await axios.post('/api/strategy-management/delete', 
      { strategyId: deletingStrategy.value.id }, 
      { headers: { 'Content-Type': 'application/json' } }
    )
    
    if (response.data.success) {
      // 从列表中移除已删除的策略
      const index = strategies.value.findIndex(s => s.id === deletingStrategy.value.id)
      if (index !== -1) strategies.value.splice(index, 1)
      ElMessage.success('策略已删除')
    } else {
      ElMessage.error(`删除策略失败: ${response.data.message || '未知错误'}`)
    }
  } catch (error) {
    console.error('删除策略失败:', error)
    ElMessage.error('删除策略失败: ' + error.message)
  } finally {
    loading.value = false
    deleteDialogVisible.value = false
    deletingStrategy.value = null
  }
}

// 关闭对话框时的提示
const handleDialogClose = (done) => {
  ElMessageBox.confirm('确认取消删除策略吗？')
    .then(() => done())
    .catch(() => {/* 取消关闭操作 */})
}

// 组件挂载时获取数据
onMounted(() => {
  fetchStrategies()
})
</script>

<style scoped>
.el-header {
  height: 60px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
}

.status-dot-success {
  background-color: #67c23a;
}

.status-dot-info {
  background-color: #909399;
}

.status-dot-warning {
  background-color: #e6a23c;
}
</style>