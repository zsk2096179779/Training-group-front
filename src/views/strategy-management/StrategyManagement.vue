<template>
  <el-container style="height: 100vh;">
    <el-header class="header">
      <span class="header-title">策略管理</span>
    </el-header>

    <el-main class="main">
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">策略列表</h3>
          <div class="card-filters">
            <el-input
                v-model="searchQuery"
                placeholder="搜索策略名称"
                clearable
                class="filter-input"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-select v-model="statusFilter" placeholder="全部状态" class="filter-select">
              <el-option label="全部状态" value="all" />
              <el-option label="运行中" value="active" />
              <el-option label="已停止" value="stop" />
              <el-option label="警告" value="warn" />
            </el-select>
          </div>
        </div>

        <el-table
            :data="pagedStrategies"
            v-loading="loading"
            stripe
            border
            class="strategy-table"
        >
          <el-table-column prop="name" label="策略名称" min-width="180" />
          <el-table-column prop="type" label="策略类型" min-width="120" />
          <el-table-column label="状态" min-width="100">
            <template #default="{ row }">
              <el-tag
                  :type="statusTypeMap[row.status]"
                  :effect="row.status === 'active' ? 'light' : 'plain'"
                  class="status-tag"
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
                  class="btn-stop"
                  @click="onStop(row)"
              >停止</el-button>
              <el-button
                  v-else
                  type="text"
                  size="small"
                  class="btn-start"
                  @click="onStart(row)"
              >启动</el-button>
              <el-button
                  type="text"
                  size="small"
                  class="btn-delete"
                  @click="showDeleteConfirm(row)"
              >删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-wrap">
          <div class="pagination-info">
            共 {{ filteredStrategies.length }} 条记录，每页显示 {{ pageSize }} 条
          </div>
          <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 30, 40]"
              :total="totalItems"
              @current-change="loadStrategies"
              @size-change="loadStrategies"
              layout="prev, pager, next"
              background
              small
          />
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
          <el-button type="primary" @click="confirmDelete" class="btn-delete-confirm">
            确定删除
          </el-button>
        </div>
      </template>
    </el-dialog>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

import {
  fetchStrategies,
  startStrategy as apiStart,
  stopStrategy as apiStop,
  deleteStrategy as apiDelete
} from '@/api/strategy'

// 路由
const router = useRouter()

// 状态
const loading = ref(false)
const strategies = ref([])     // 原始数据
const totalItems = ref(0)       // 分页总数

// 过滤 & 分页
const searchQuery = ref('')
const statusFilter = ref('all')
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

// 客户端二次过滤
const filteredStrategies = computed(() =>
    strategies.value.filter(s => {
      const nameMatch = searchQuery.value
          ? s.name.toLowerCase().includes(searchQuery.value.toLowerCase())
          : true
      const statusMatch =
          statusFilter.value === 'all' ? true : s.status === statusFilter.value
      return nameMatch && statusMatch
    })
)

// 本地分页
const pagedStrategies = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredStrategies.value.slice(start, start + pageSize.value)
})

// 加载列表
async function loadStrategies() {
  loading.value = true
  try {
    const resp = await fetchStrategies({
      page: currentPage.value,
      limit: pageSize.value,
      nameFilter: searchQuery.value,
      statusFilter: statusFilter.value
    })
    // 后端返回 { success, records: [...], total: N }
    const list = Array.isArray(resp.records) ? resp.records : []
    totalItems.value = resp.total || 0

    strategies.value = list.map(s => ({
      id: s.id,
      name: s.name,
      type: getTypeName(s.type),
      status: s.status.toLowerCase(),
      createdAt: formatDateTime(s.createTime),
      gain: s.gain
    }))
  } catch (err) {
    console.error('加载策略失败:', err)
    ElMessage.error(
        '加载策略失败：' + (err.response?.data?.message || err.message)
    )
  } finally {
    loading.value = false
  }
}

// 跳转详情
function viewDetail(row) {
  router.push({
    path: '/strategy-management/detail',
    query: { strategyId: row.id }
  })
}

// 启动／停止
async function onStart(row) {
  loading.value = true
  try {
    const res = await apiStart({ strategyId: row.id })
    if (res.success) {
      ElMessage.success('策略已启动')
      await loadStrategies()
    } else {
      ElMessage.error('启动失败：' + res.message)
    }
  } catch (err) {
    console.error(err)
    ElMessage.error('启动出错：' + err.message)
  } finally {
    loading.value = false
  }
}

async function onStop(row) {
  loading.value = true
  try {
    const res = await apiStop({ strategyId: row.id })
    if (res.success) {
      ElMessage.success('策略已停止')
      await loadStrategies()
    } else {
      ElMessage.error('停止失败：' + res.message)
    }
  } catch (err) {
    console.error(err)
    ElMessage.error('停止出错：' + err.message)
  } finally {
    loading.value = false
  }
}

// 删除对话框
const deleteDialogVisible = ref(false)
const deleting = ref(null)
const deletingStrategyName = computed(() => deleting.value?.name || '')

function showDeleteConfirm(row) {
  deleting.value = row
  deleteDialogVisible.value = true
}

async function confirmDelete() {
  if (!deleting.value) return
  loading.value = true
  try {
    const res = await apiDelete({ strategyId: deleting.value.id })
    if (res.success) {
      ElMessage.success('删除成功')
      await loadStrategies()
    } else {
      ElMessage.error('删除失败：' + res.message)
    }
  } catch (err) {
    console.error(err)
    ElMessage.error('删除出错：' + err.message)
  } finally {
    loading.value = false
    deleteDialogVisible.value = false
  }
}

function handleDialogClose(done) {
  ElMessageBox.confirm('确认取消删除？')
      .then(done)
      .catch(() => {})
}

// 工具
function formatDateTime(dt) {
  const opts = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }
  return new Date(dt).toLocaleString('zh-CN', opts).replace(/\//g, '-')
}
function getTypeName(code) {
  const map = {
    '1': '大类资产配置',
    '2': 'FOF组合',
    '3': '基金指数组合',
    '4': '择时策略'
  }
  return map[code] || code
}

onMounted(loadStrategies)
</script>

<style scoped>
.header {
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  padding: 0 20px;
  height: 60px;
}
.header-title {
  font-size: 18px;
  font-weight: bold;
}
.main {
  background: #f5f7fa;
  padding: 20px;
  overflow: auto;
}
.card {
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
}
.card-title {
  font-size: 16px;
  font-weight: 500;
  margin: 0;
}
.card-filters {
  display: flex;
}
.filter-input {
  margin-right: 15px;
  width: 240px;
}
.filter-select {
  width: 120px;
}
.strategy-table {
  width: 100%;
}
.status-tag {
  display: flex;
  align-items: center;
}
.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
}
.status-dot-success { background-color: #67c23a; }
.status-dot-info { background-color: #909399; }
.status-dot-warning { background-color: #e6a23c; }

.btn-stop { color: #f56c6c; }
.btn-start { color: #67c23a; }
.btn-delete { color: #f56c6c; }

.pagination-wrap {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
}
.pagination-info {
  font-size: 12px;
  color: #909399;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
.btn-delete-confirm {
  background-color: #f56c6c;
  border: none;
}
</style>
