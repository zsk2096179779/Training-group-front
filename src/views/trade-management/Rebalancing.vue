<!-- src/views/trade-management/Rebalancing.vue -->
<template>
  <div class="rebalancing-page">
    <!-- 顶部：面包屑 + 标题 + 策略/日期筛选 -->
    <div class="page-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>策略管理</el-breadcrumb-item>
        <el-breadcrumb-item>交易管理</el-breadcrumb-item>
        <el-breadcrumb-item>组合调仓</el-breadcrumb-item>
      </el-breadcrumb>
      <h2 class="title">组合调仓</h2>

      <el-select
          v-model="filter.strategyId"
          placeholder="选择策略"
          size="small"
          @change="fetchData"
      >
        <el-option
            v-for="s in strategies"
            :key="s.id"
            :label="s.name"
            :value="s.id"
        />
      </el-select>

      <el-date-picker
          v-model="filter.dateRange"
          type="daterange"
          size="small"
          range-separator="—"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="fetchData"
      />

      <el-button type="primary" size="small" @click="fetchData">
        查询
      </el-button>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-card class="stat-card">
        <div class="label">待发送指令</div>
        <div class="value">{{ stats.pending }}</div>
      </el-card>
      <el-card class="stat-card">
        <div class="label">已完成</div>
        <div class="value">{{ stats.done }}</div>
      </el-card>
      <el-card class="stat-card">
        <div class="label">失败</div>
        <div class="value">{{ stats.failed }}</div>
      </el-card>
    </div>

    <!-- 主表格 -->
    <el-table
        :data="records"
        stripe
        border
        :loading="loading"
        style="width: 100%;"
        empty-text="暂无调仓记录"
    >
      <el-table-column prop="accountName" label="账户名称" width="160" />
      <el-table-column prop="fundName" label="基金名称" width="200" />

      <el-table-column label="原始比例" width="100">
        <template #default="{ row }">{{ row.oldRatio }}%</template>
      </el-table-column>

      <el-table-column label="新比例" width="110">
        <template #default="{ row }">
          <el-input-number
              v-model="row.newRatio"
              :min="0"
              :max="100"
              size="small"
          />%
        </template>
      </el-table-column>

      <el-table-column prop="status" label="状态" width="120">
        <template #default="{ row }">
          <el-tag
              :type="{
              PENDING: 'info',
              DONE: 'success',
              FAILED: 'danger'
            }[row.status] || 'default'"
              size="small"
          >
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button
              type="primary"
              size="small"
              :disabled="row.status !== 'PENDING'"
              @click="onSend(row)"
          >
            下发
          </el-button>
          <el-button size="small" @click="onViewDetail(row)">
            详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
          background
          layout="prev, pager, next, jumper"
          :total="total"
          :page-size="filter.pageSize"
          :current-page="filter.page"
          @current-change="onPageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {fetchStrategies} from "@/api/strategy";
import {listOrders,sendRebalancingOrder} from "@/api/trades";
// 筛选 & 分页
const filter = ref({
  strategyId: null,
  dateRange: [],
  page: 1,
  pageSize: 10
})

// 下拉列表 & 数据
const strategies = ref([])
const records    = ref([])
const total      = ref(0)
const loading    = ref(false)

// 统计
const stats = computed(() => {
  const p = records.value.filter(r => r.status === 'PENDING').length
  const d = records.value.filter(r => r.status === 'DONE').length
  const f = records.value.filter(r => r.status === 'FAILED').length
  return { pending: p, done: d, failed: f }
})

// 拉列表
async function fetchData() {
  if (!filter.value.strategyId) return
  loading.value = true
  try {
    const params = {
      page: filter.value.page,
      size: filter.value.pageSize
    }
    const { items, total: t } = await listOrders(params)
    records.value = items.map(item => ({
      ...item,
      newRatio: item.oldRatio  // 默认新比例等于原始
    }))
    total.value = t
  } catch (err) {
    ElMessage.error('加载失败：' + (err.message || err))
  } finally {
    loading.value = false
  }
}

// 下发指令
async function onSend(row) {
  try {
    await sendRebalancingOrder({ id: row.id, newRatio: row.newRatio })
    ElMessage.success('指令已下发')
    await fetchData()
  } catch (err) {
    ElMessage.error('下发失败：' + (err.message || err))
  }
}

// 分页回调
function onPageChange(page) {
  filter.value.page = page
  fetchData()
}

// 查看详情（可路由或弹窗）
function onViewDetail(row) {
  // router.push(`/trade-management/rebalancing/${row.id}`)
  ElMessage.info(`查看 ${row.accountName} - ${row.fundName} 详情`)
}

// 页面初始化
onMounted(async () => {
  strategies.value = await fetchStrategies()
  if (strategies.value.length) {
    filter.value.strategyId = strategies.value[0].id
    await fetchData()
  }
})
</script>

<style scoped>
.rebalancing-page {
  padding: 20px;
  background: #f5f7fa;
}
.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.page-header h2 {
  margin: 0 24px;
  font-size: 20px;
  flex: none;
}
.stats-cards {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}
.stat-card {
  flex: 1;
  text-align: center;
  border-left: 4px solid #409EFF;
  background: #ffffff;
  padding: 12px;
  border-radius: 4px;
}
.stat-card .label {
  color: #909399;
  font-size: 14px;
}
.stat-card .value {
  font-size: 24px;
  font-weight: bold;
  margin-top: 4px;
}
.pagination-wrapper {
  margin-top: 16px;
  text-align: right;
}
</style>
