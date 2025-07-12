<!-- src/views/trade-management/AccountRebalancing.vue -->
<template>
  <div class="account-rebal-page">
    <!-- 面包屑 + 标题 + 搜索 -->
    <div class="page-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>交易管理</el-breadcrumb-item>
        <el-breadcrumb-item>账户调仓</el-breadcrumb-item>
      </el-breadcrumb>
      <h2 class="title">账户调仓</h2>

      <el-input
          v-model="filter.search"
          placeholder="搜索账户"
          prefix-icon="el-icon-search"
          clearable
          @clear="loadAccounts"
          @keyup.enter="loadAccounts"
          class="search-input"
      />
    </div>

    <!-- 账户列表 -->
    <el-card class="list-card">
      <el-table
          :data="accounts"
          stripe
          border
          style="width: 100%"
          :loading="loading"
      >
        <el-table-column prop="accountName" label="账户" width="200"/>
        <el-table-column prop="deviation" label="偏离度" width="120">
          <template #default="{ row }">{{ row.deviation }}%</template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button
                size="small"
                type="primary"
                @click="openDialog(row.accountId, row.accountName)"
            >调仓</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 调仓弹窗 -->
    <el-dialog
        v-model="dialog.visible"
        width="500px"
        :title="`账户调仓 — ${dialog.account.accountName}`"
    >
      <el-form :model="dialog.account.funds" label-width="100px">
        <el-form-item
            v-for="(fund, idx) in dialog.account.funds"
            :key="fund.id"
            :label="fund.name"
        >
          <el-input-number
              v-model="dialog.account.funds[idx].targetRatio"
              :min="0"
              :max="100"
              size="small"
          />%
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialog.visible = false">取消</el-button>
        <el-button
            type="primary"
            :loading="dialog.submitting"
            @click="onSubmit"
        >确认调仓</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  fetchAccountList,
  fetchAccountDetail,
  submitAccountRebalance
} from '@/api/trades'
import { ElMessage } from 'element-plus'

// 搜索过滤
const filter = ref({ search: '' })

// 列表 & 加载状态
const accounts = ref([])
const loading  = ref(false)

// 弹窗状态 & 数据
const dialog = ref({
  visible: false,
  account: {
    accountId: null,
    accountName: '',
    funds: []  // [{ id, name, currentRatio, targetRatio }]
  },
  submitting: false
})

// 加载账户列表
async function loadAccounts() {
  loading.value = true
  try {
    accounts.value = await fetchAccountList(filter.value.search)
  } catch (err) {
    ElMessage.error('加载账户列表失败：' + (err.message || err))
  } finally {
    loading.value = false
  }
}

// 打开调仓弹窗
async function openDialog(accountId, accountName) {
  dialog.value.visible = true
  dialog.value.account = {
    accountId,
    accountName,
    funds: []
  }

  try {
    const detail = await fetchAccountDetail(accountId)
    // detail.funds = [{ id, name, currentRatio, targetRatio }]
    dialog.value.account.funds = detail.funds
  } catch (err) {
    ElMessage.error('加载账户详情失败：' + (err.message || err))
    dialog.value.visible = false
  }
}

// 提交调仓
async function onSubmit() {
  dialog.value.submitting = true
  try {
    await submitAccountRebalance({
      accountId: dialog.value.account.accountId,
      funds: dialog.value.account.funds.map(f => ({
        id: f.id,
        targetRatio: f.targetRatio
      }))
    })
    ElMessage.success('调仓指令已提交')
    dialog.value.visible = false
    loadAccounts()
  } catch (err) {
    ElMessage.error('提交失败：' + (err.message || err))
  } finally {
    dialog.value.submitting = false
  }
}

// 初始加载
onMounted(loadAccounts)
</script>

<style scoped>
.account-rebal-page {
  padding: 20px;
  background: #f5f7fa;
}
.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}
.page-header .title {
  flex: 1;
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}
.search-input {
  width: 240px;
}
.list-card {
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
