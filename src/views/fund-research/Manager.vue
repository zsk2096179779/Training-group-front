<template>
  <div class="fund-list-container">
    <!-- 经理维度筛选 -->
    <el-form :model="filters" inline class="filter-bar">
      <el-form-item label="基金经理">
        <el-input v-model="filters.managerName"
                  placeholder="输入基金经理姓名"
                  clearable
                  style="width:200px"/>
      </el-form-item>
      <el-form-item label="标签">
        <el-select v-model="filters.labels"
                   multiple collapse-tags
                   placeholder="请选择标签"
                   clearable
                   style="width:240px">
          <el-option v-for="lab in allLabels"
                     :key="lab.id"
                     :label="lab.name"
                     :value="lab.id"/>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="loadFunds">查询</el-button>
        <el-button @click="reset">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table ref="table"
              v-loading="loading"
              :data="funds"
              border stripe
              @selection-change="onSelect"
              style="width:100%;margin-top:16px">
      <el-table-column type="selection" width="50"/>
      <el-table-column prop="code"        label="代码" width="100"/>
      <el-table-column prop="name"        label="名称"/>
      <el-table-column prop="managerName" label="经理" width="120"/>
      <el-table-column label="标签"
                       :formatter="row=>row.labels.map(l=>l.name).join('，')"/>
      <el-table-column prop="nav"         label="最新净值" width="120"/>
      <el-table-column prop="risk"        label="风险"       width="100"/>
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-link @click="goProfile(row.code)">画像</el-link>
        </template>
      </el-table-column>
    </el-table>

    <div class="actions">
      <el-pagination background
                     layout="prev, pager, next"
                     :current-page="pagination.page"
                     :page-size="pagination.pageSize"
                     :total="pagination.total"
                     @current-change="onPage"/>
      <el-button type="success"
                 :disabled="selected.length===0"
                 @click="openDialog">保存为组合</el-button>
    </div>

    <save-combo-dialog
        v-model:visible= "showDialog"
        @confirm="doSave" />
  </div>
</template>

<script>
import { fetchLabels, fetchFunds} from '@/api/funds'
import SaveComboDialog from "@/components/SaveComboDialog.vue";
import {createCombo} from "@/api/portfolios";

export default {
  name: 'ManagerView',
  components: {SaveComboDialog },
  data() {
    return {
      filters: { managerName:'', labels:[] },
      allLabels: [], funds: [], pagination:{page:1,pageSize:20,total:0},
      loading:false, selected:[], showDialog:false
    }
  },
  async created() {
    this.allLabels = await fetchLabels()
    await this.loadFunds()
  },
  methods: {
    openDialog() { this.showDialog = true },
    async loadFunds() {
      this.loading = true
      try {
        const { items, total } = await fetchFunds({
          ...this.filters,
          page: this.pagination.page,
          pageSize: this.pagination.pageSize
        })
        this.funds = items
        this.pagination.total = total
      } finally {
        this.loading = false
      }
    },
    reset() {
      this.filters = { managerName:'', labels:[] }
      this.loadFunds()
    },
    onSelect(rows) { this.selected = rows },
    onPage(page) {
      this.pagination.page = page
      this.loadFunds()
    },
    async doSave(name) {
      const payload ={
        name,
        funds: this.selected.map(f=>({fundCode: f.code})),
        source:'research',
        type: 'FOF',                 // 举例
        riskLevel: 'R3',
        strategy: '……',
        isUserCreated:true
      }
      try {
        await createCombo(payload)
        this.$message.success('已保存到“我的组合”')
        this.showDialog = false
        this.$refs.table.clearSelection()
        this.selected = []
      } catch (e) {
        this.$message.error('保存失败：' + (e.response?.data?.msg || e.message))
      }
    },
    goProfile(code) {
      this.$router.push({ name:'FundProfile', params:{ code } })
    }
  }
}
</script>

<style scoped>
.fund-list-container { padding:16px; background:#f5f7fa }
.filter-bar { display:flex; gap:12px; align-items:center }
.actions    { margin-top:16px; display:flex; justify-content:space-between }
</style>
