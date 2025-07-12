<!-- src/views/trade-management/Settlement.vue -->
<template>
  <div class="settlement-page">
    <!-- 顶部：面包屑 + 标题 + 筛选 -->
    <div class="page-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>交易管理</el-breadcrumb-item>
        <el-breadcrumb-item>交割单管理</el-breadcrumb-item>
      </el-breadcrumb>
      <h2 class="title">交割单管理</h2>

      <el-date-picker
          v-model="filter.dateRange"
          type="daterange"
          size="small"
          range-separator="—"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="fetchSlips"
      />

      <el-input
          v-model="filter.account"
          size="small"
          placeholder="账户名称"
          clearable
          @keyup.enter="fetchSlips"
      />

      <el-button type="primary" size="small" @click="fetchSlips">查询</el-button>
    </div>

    <!-- 交割单表格 -->
    <el-table
        :data="records"
        stripe
        border
        style="width:100%"
        :loading="loading"
        empty-text="暂无交割单"
        row-key="slipId"
    >
      <!-- 可扩展行：明细 -->
      <el-table-column type="expand">
        <template #default="{ row }">
          <el-table
              :data="row.details"
              stripe
              border
              size="small"
              style="width:100%"
          >
            <el-table-column prop="fund" label="基金"    width="200" />
            <el-table-column prop="quantity" label="数量"  width="100" />
            <el-table-column prop="amount"   label="金额"  width="120" />
          </el-table>
        </template>
      </el-table-column>

      <!-- 基本字段 -->
      <el-table-column prop="slipId"  label="交割单号" width="160" />
      <el-table-column prop="account" label="账户"     width="140" />
      <el-table-column prop="date"    label="日期"     width="140" />
      <el-table-column prop="status"  label="状态"     width="100">
        <template #default="{ row }">
          <el-tag
              :type="{
              PENDING: 'info',
              DONE:    'success',
              FAILED:  'danger'
            }[row.status] || 'default'"
              size="small"
          >
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
          background
          layout="prev, pager, next, jumper"
          size="small"
          :total="total"
          :page-size="filter.pageSize"
          :current-page="filter.page"
          @current-change="onPageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { listDeliveryNotes } from '@/api/trades'

const filter = ref({
  dateRange: [],    // [startDate, endDate]
  account: '',      // 账户名称
  page: 1,          // 当前页
  pageSize: 10      // 每页条数
})

const records = ref([])  // 当前页数据
const total   = ref(0)   // 总条数
const loading = ref(false)

async function fetchSlips() {
  loading.value = true
  try {
    const params = {
      page:  filter.value.page,
      size:  filter.value.pageSize
    }

    console.log("Fetching delivery notes with params:", params);
    const { items, total: t } = await listDeliveryNotes(params)
    records.value = items
    total.value   = t
  } catch (err) {
    ElMessage.error('加载交割单失败：' + (err.message || err))
  } finally {
    loading.value = false
  }
}

function onPageChange(page) {
  filter.value.page = page
  fetchSlips()
}

onMounted(fetchSlips)
</script>

<style scoped>
.settlement-page {
  padding: 20px;
  background: #f5f7fa;
}
.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.page-header .title {
  margin: 0 12px;
  font-size: 20px;
  flex: none;
}
.pagination-wrapper {
  margin-top: 16px;
  text-align: right;
}
</style>
