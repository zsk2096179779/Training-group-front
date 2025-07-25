<template>
  <div class="orders-page">
    <!-- 顶部面包屑 & 标题 -->
    <div class="page-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>交易管理</el-breadcrumb-item>
        <el-breadcrumb-item>交易单管理</el-breadcrumb-item>
      </el-breadcrumb>
      <h2 class="title">交易单管理</h2>
    </div>

    <!-- Tab 切换 -->
    <el-tabs v-model="tab" type="card" class="orders-tabs" @tab-click="onTabClick">
      <el-tab-pane label="建仓"    name="open" />
      <el-tab-pane label="调仓"    name="rebal" />
      <el-tab-pane label="差错重投" name="error" />
    </el-tabs>

    <!-- 批量操作 -->
    <div class="action-bar">
      <el-button type="primary" @click="batchSend" :disabled="loading || !orders.length">
        一键下单
      </el-button>
      <el-button type="warning" @click="batchReject" :disabled="loading || !orders.length">
        一键驳回
      </el-button>
    </div>

    <!-- 数据表格 -->
    <el-card class="orders-card">
      <el-table
          :data="orders"
          stripe
          border
          style="width: 100%"
          :loading="loading"
      >
        <el-table-column prop="orderId"   label="订单号" width="160" />
        <el-table-column prop="account"   label="账户"   width="140" />
        <el-table-column prop="fund"      label="基金"   width="200" />
        <el-table-column prop="quantity"  label="数量"   width="100" />
        <el-table-column prop="status"    label="状态"   width="120" />
        <el-table-column label="操作"     width="200">
          <template #default="{ row }">
            <el-button
                type="success"
                size="small"
                @click="onSubmitOrder(row.orderId)"
                :disabled="row.status !== 'PENDING'"
            >下单</el-button>
            <el-button
                type="danger"
                size="small"
                @click="onReject(row.orderId)"
                :disabled="row.status !== 'PENDING'"
            >驳回</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
            :current-page="page"
            :page-size="pageSize"
            :total="total"
            layout="prev, pager, next, jumper"
            @current-change="onPageChange"
            @size-change="onSizeChange"
            background
            small
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import {onMounted, ref} from 'vue'
import {executeOrder, rejectOrder, submitOrders} from '@/api/trades'
import {ElMessage} from 'element-plus'

// Tab 类型：open / rebal / error
const tab = ref('open')

// 表格数据 & 分页
const orders   = ref([])
const total    = ref(0)
const page     = ref(1)
const pageSize = ref(10)
const loading  = ref(false)

const mockOrders = [
  { orderId: '001', account: '账户A', fund: '基金A', quantity: 100, status: 'PENDING' },
  { orderId: '002', account: '账户B', fund: '基金B', quantity: 200, status: 'PENDING' },
  { orderId: '003', account: '账户C', fund: '基金C', quantity: 300, status: 'COMPLETED' },
  { orderId: '004', account: '账户D', fund: '基金D', quantity: 400, status: 'REJECTED' },
  { orderId: '005', account: '账户E', fund: '基金E', quantity: 500, status: 'PENDING' },
]
// 拉列表
async function fetchOrders() {
  loading.value = true
  try {
    // // 后端 listOrders 接口：{ items: [...], total }
    // const { items, total: t } = await listOrders({
    //   page:  page.value,
    //   size: pageSize.value
    // })
    // orders.value = items
    // total.value  = t
    const startIndex = (page.value - 1) * pageSize.value
    const endIndex = startIndex + pageSize.value
    orders.value = mockOrders.slice(startIndex, endIndex)
    total.value  = mockOrders.length
  } catch (err) {
    ElMessage.error('加载交易单失败：' + (err.message || err))
  } finally {
    loading.value = false
  }
}

// Tab 切换时，重置页码并拉数据
function onTabClick() {
  page.value = 1
  fetchOrders()
}

// 分页回调
function onPageChange(p) {
  page.value = p
  fetchOrders()
}
function onSizeChange(size) {
  pageSize.value = size
  page.value     = 1
  fetchOrders()
}

// 单条 下单/驳回
async function onSubmitOrder(orderId) {
  const orderData = { /* 提交的订单数据 */ };
  try {
    // 调用submitOrders方法，传递需要提交的订单数据
    // await submitOrders(orderData);
    ElMessage.success('订单提交成功');
    await fetchOrders(); // 提交成功后刷新订单列表
  } catch (err) {
    ElMessage.error('订单提交失败：' + (err.message || err));
  }
}
async function onReject(id) {
  try {
    // await rejectOrder(id)
    ElMessage.success('驳回成功')
    fetchOrders()
  } catch (err) {
    ElMessage.error('驳回失败：' + (err.message || err))
  }
}

// 批量
async function batchSend() {
  if (!orders.value.length) return
  loading.value = true
  try {
    // await Promise.all( orders.value.map(o => executeOrder(o.orderId)) )
    await Promise.all( orders.value.map(o => console.log('执行下单:', o.orderId)) )
    ElMessage.success('批量下单完成')
    await fetchOrders()
  } catch (err) {
    ElMessage.error('批量下单失败：' + (err.message || err))
  } finally {
    loading.value = false
  }
}
async function batchReject() {
  if (!orders.value.length) return
  loading.value = true
  try {
    // await Promise.all( orders.value.map(o => rejectOrder(o.orderId)) )
    await Promise.all( orders.value.map(o => console.log('执行驳回:', o.orderId)) )
    ElMessage.success('批量驳回完成')
    await fetchOrders()
  } catch (err) {
    ElMessage.error('批量驳回失败：' + (err.message || err))
  } finally {
    loading.value = false
  }
}

// 初始加载
onMounted(fetchOrders)
</script>

<style scoped>
.orders-page {
  padding: 20px;
  background: #f5f7fa;
}
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.page-header .title {
  margin: 0;
  font-size: 20px;
  font-weight: bold;
  color: #303133;
}
.orders-tabs {
  margin-bottom: 16px;
}
.action-bar {
  margin-bottom: 16px;
}
.orders-card {
  padding: 16px;
  background: #ffffff;
}
.pagination {
  margin-top: 16px;
  text-align: right;
}
</style>
