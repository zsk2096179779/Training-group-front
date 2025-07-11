<template>
  <div class="error-page">
    <!-- 面包屑 + 标题 -->
    <div class="page-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>交易管理</el-breadcrumb-item>
        <el-breadcrumb-item>差错处理</el-breadcrumb-item>
      </el-breadcrumb>
      <h2 class="title">差错处理</h2>
    </div>

    <!-- 失败订单表格 -->
    <el-card class="error-card">
      <el-table
          :data="errors"
          stripe
          border
          style="width:100%"
          :loading="loading"
      >
        <el-table-column prop="orderId" label="订单号"   width="140" />
        <el-table-column prop="account" label="账户"     width="140" />
        <el-table-column prop="fund"    label="原基金"   width="200" />
        <el-table-column prop="reason"  label="失败原因"       />
        <el-table-column prop="time"    label="失败时间" width="160" />
        <el-table-column label="操作" width="220">
          <template #default="{ row }">
            <el-button
                size="small"
                @click="openReplaceDialog(row.orderId)"
            >替换标的</el-button>
            <el-button
                type="primary"
                size="small"
                @click="onRetry(row.orderId)"
            >重试下单</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 替换标的弹窗 -->
    <el-dialog
        title="替换标的"
        v-model="dialog.visible"
        width="400px"
    >
      <el-form :model="dialog.form" label-width="80px">
        <el-form-item label="新基金">
          <el-select
              v-model="dialog.form.newFundId"
              placeholder="请选择基金"
              filterable
              :loading="dialog.loadingFunds"
          >
            <el-option
                v-for="f in funds"
                :key="f.id"
                :label="f.name"
                :value="f.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">取消</el-button>
        <el-button
            type="primary"
            :loading="dialog.submitting"
            @click="onConfirmReplace"
        >确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 假数据：错误订单
const mockErrors = [
  { orderId: 'ORD001', account: '账户A', fund: '基金A', reason: '网络问题', time: '2025-07-12 14:30' },
  { orderId: 'ORD002', account: '账户B', fund: '基金B', reason: '价格异常', time: '2025-07-12 15:00' },
  { orderId: 'ORD003', account: '账户C', fund: '基金C', reason: '交易失败', time: '2025-07-12 16:00' },
]

// 假数据：基金列表
const mockFunds = [
  { id: 1, name: '基金A' },
  { id: 2, name: '基金B' },
  { id: 3, name: '基金C' }
]

// 表格数据 & 加载状态
const errors = ref([])
const funds = ref([])
const loading = ref(false)

// 弹窗状态 & 数据
const dialog = ref({
  visible: false,
  orderId: null,
  form: { newFundId: null },
  loadingFunds: false,
  submitting: false
})

// 加载错误订单（假数据）
async function loadErrors() {
  loading.value = true
  try {
    // 模拟加载失败订单
    errors.value = mockErrors
  } catch (err) {
    ElMessage.error('加载失败订单失败：' + (err.message || err))
  } finally {
    loading.value = false
  }
}

// 打开“替换标的”对话框
async function openReplaceDialog(orderId) {
  dialog.value.orderId = orderId
  dialog.value.form.newFundId = null
  dialog.value.visible = true

  // 模拟加载可替换基金列表
  dialog.value.loadingFunds = true
  try {
    funds.value = mockFunds
  } catch (err) {
    ElMessage.error('加载基金列表失败：' + (err.message || err))
  } finally {
    dialog.value.loadingFunds = false
  }
}

// 确认替换
async function onConfirmReplace() {
  if (!dialog.value.form.newFundId) {
    return ElMessage.warning('请先选择一个新基金')
  }
  dialog.value.submitting = true
  try {
    // 模拟替换标的操作
    console.log('替换标的：', dialog.value.orderId, dialog.value.form.newFundId)
    ElMessage.success('替换成功')
    dialog.value.visible = false
    await loadErrors()
  } catch (err) {
    ElMessage.error('替换失败：' + (err.message || err))
  } finally {
    dialog.value.submitting = false
  }
}

// 重试下单
async function onRetry(orderId) {
  try {
    // 模拟重试下单操作
    console.log('重试下单：', orderId)
    ElMessage.success('重试下单成功')
    loadErrors()
  } catch (err) {
    ElMessage.error('重试失败：' + (err.message || err))
  }
}

// 初始加载
onMounted(loadErrors)
</script>

<style scoped>
.error-page {
  padding: 20px;
  background: #f5f7fa;
}
.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}
.page-header h2.title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}
.error-card {
  background: #fff;
  padding: 16px;
  border-radius: 8px;
}
.el-dialog__header {
  background: #f0f6ff;
}
.el-dialog__footer {
  text-align: right;
}
</style>

<!--<template>-->
<!--  <div class="error-page">-->
<!--    &lt;!&ndash; 面包屑 & 标题 &ndash;&gt;-->
<!--    <div class="page-header">-->
<!--      <el-breadcrumb separator="/">-->
<!--        <el-breadcrumb-item>交易管理</el-breadcrumb-item>-->
<!--        <el-breadcrumb-item>差错处理</el-breadcrumb-item>-->
<!--      </el-breadcrumb>-->
<!--      <h2 class="title">差错处理</h2>-->
<!--    </div>-->

<!--    &lt;!&ndash; 失败订单表格 &ndash;&gt;-->
<!--    <el-card class="error-card">-->
<!--      <el-table-->
<!--          :data="errors"-->
<!--          stripe-->
<!--          border-->
<!--          style="width:100%"-->
<!--          :loading="loading"-->
<!--      >-->
<!--        <el-table-column prop="orderId" label="订单号"   width="140" />-->
<!--        <el-table-column prop="account" label="账户"     width="140" />-->
<!--        <el-table-column prop="fund"    label="原基金"   width="200" />-->
<!--        <el-table-column prop="reason"  label="失败原因"       />-->
<!--        <el-table-column prop="time"    label="失败时间" width="160" />-->
<!--        <el-table-column label="操作" width="220">-->
<!--          <template #default="{ row }">-->
<!--            <el-button-->
<!--                size="small"-->
<!--                @click="openReplaceDialog(row.orderId)"-->
<!--            >替换标的</el-button>-->
<!--            <el-button-->
<!--                type="primary"-->
<!--                size="small"-->
<!--                @click="onRetry(row.orderId)"-->
<!--            >重试下单</el-button>-->
<!--          </template>-->
<!--        </el-table-column>-->
<!--      </el-table>-->
<!--    </el-card>-->

<!--    &lt;!&ndash; 替换标的弹窗 &ndash;&gt;-->
<!--    <el-dialog-->
<!--        title="替换标的"-->
<!--        v-model="dialog.visible"-->
<!--        width="400px"-->
<!--    >-->
<!--      <el-form :model="dialog.form" label-width="80px">-->
<!--        <el-form-item label="新基金">-->
<!--          <el-select-->
<!--              v-model="dialog.form.newFundId"-->
<!--              placeholder="请选择基金"-->
<!--              filterable-->
<!--              :loading="dialog.loadingFunds"-->
<!--          >-->
<!--            <el-option-->
<!--                v-for="f in funds"-->
<!--                :key="f.id"-->
<!--                :label="f.name"-->
<!--                :value="f.id"-->
<!--            />-->
<!--          </el-select>-->
<!--        </el-form-item>-->
<!--      </el-form>-->
<!--      <template #footer>-->
<!--        <el-button @click="dialog.visible = false">取消</el-button>-->
<!--        <el-button-->
<!--            type="primary"-->
<!--            :loading="dialog.submitting"-->
<!--            @click="onConfirmReplace"-->
<!--        >确定</el-button>-->
<!--      </template>-->
<!--    </el-dialog>-->
<!--  </div>-->
<!--</template>-->

<!--<script setup>-->
<!--import { ref, onMounted } from 'vue'-->
<!--import {-->
<!--  fetchErrorOrders,-->
<!--  fetchFunds,-->
<!--  replaceErrorOrder,-->
<!--  retryOrder-->
<!--} from '@/api/trades'-->
<!--import { ElMessage } from 'element-plus'-->

<!--const errors    = ref([])-->
<!--const funds     = ref([])-->
<!--const loading   = ref(false)-->
<!--const dialog    = ref({-->
<!--  visible: false,-->
<!--  orderId: null,-->
<!--  form: { newFundId: null },-->
<!--  loadingFunds: false,-->
<!--  submitting: false-->
<!--})-->

<!--// 加载差错订单-->
<!--async function loadErrors() {-->
<!--  loading.value = true-->
<!--  try {-->
<!--    errors.value = await fetchErrorOrders()-->
<!--  } catch (err) {-->
<!--    ElMessage.error('加载失败订单失败：' + (err.message||err))-->
<!--  } finally {-->
<!--    loading.value = false-->
<!--  }-->
<!--}-->

<!--// 打开“替换标的”对话框-->
<!--async function openReplaceDialog(orderId) {-->
<!--  dialog.value.orderId = orderId-->
<!--  dialog.value.form.newFundId = null-->
<!--  dialog.value.visible = true-->

<!--  // 加载可替换的基金列表-->
<!--  dialog.value.loadingFunds = true-->
<!--  try {-->
<!--    funds.value = await fetchFunds()-->
<!--  } catch (err) {-->
<!--    ElMessage.error('加载基金列表失败：' + (err.message||err))-->
<!--  } finally {-->
<!--    dialog.value.loadingFunds = false-->
<!--  }-->
<!--}-->

<!--// 确认替换-->
<!--async function onConfirmReplace() {-->
<!--  if (!dialog.value.form.newFundId) {-->
<!--    return ElMessage.warning('请先选择一个新基金')-->
<!--  }-->
<!--  dialog.value.submitting = true-->
<!--  try {-->
<!--    await replaceErrorOrder(-->
<!--        dialog.value.orderId,-->
<!--        dialog.value.form.newFundId-->
<!--    )-->
<!--    ElMessage.success('替换成功')-->
<!--    dialog.value.visible = false-->
<!--    await loadErrors()-->
<!--  } catch (err) {-->
<!--    ElMessage.error('替换失败：' + (err.message||err))-->
<!--  } finally {-->
<!--    dialog.value.submitting = false-->
<!--  }-->
<!--}-->

<!--// 重试下单-->
<!--async function onRetry(orderId) {-->
<!--  try {-->
<!--    await retryOrder(orderId)-->
<!--    ElMessage.success('重试下单成功')-->
<!--    loadErrors()-->
<!--  } catch (err) {-->
<!--    ElMessage.error('重试失败：' + (err.message||err))-->
<!--  }-->
<!--}-->

<!--// 初始挂载-->
<!--onMounted(() => {-->
<!--  loadErrors()-->
<!--})-->
<!--</script>-->

<!--<style scoped>-->
<!--.error-page {-->
<!--  padding: 20px;-->
<!--  background: #f5f7fa;-->
<!--}-->
<!--.page-header {-->
<!--  display: flex;-->
<!--  align-items: center;-->
<!--  justify-content: space-between;-->
<!--  margin-bottom: 16px;-->
<!--}-->
<!--.page-header h2.title {-->
<!--  margin: 0;-->
<!--  font-size: 20px;-->
<!--  font-weight: 600;-->
<!--  color: #303133;-->
<!--}-->
<!--.error-card {-->
<!--  background: #fff;-->
<!--  padding: 16px;-->
<!--  border-radius: 8px;-->
<!--}-->
<!--.el-dialog__header {-->
<!--  background: #f0f6ff;-->
<!--}-->
<!--.el-dialog__footer {-->
<!--  text-align: right;-->
<!--}-->
<!--</style>-->
