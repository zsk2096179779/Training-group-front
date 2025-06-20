<template>
  <div class="fund-container">
    <!-- 搜索栏和创建按钮 -->
    <div class="header-toolbar">
      <el-input
          v-model="searchText"
          placeholder="输入组合名称或策略搜索"
          clearable
          style="width: 300px"
          @keyup.enter="handleSearch"
      >
        <template #append>
          <el-button icon="el-icon-search" @click="handleSearch" />
        </template>
      </el-input>

      <el-button
          type="primary"
          icon="el-icon-plus"
          class="create-btn"
          @click="showCreateDialog"
      >
        创建组合
      </el-button>
    </div>

    <!-- 组合列表表格 -->
    <el-table
        :data="filteredFunds"
        border
        stripe
        style="width: 100%"
    >
      <el-table-column prop="name" label="组合名称" width="150" />
      <el-table-column prop="type" label="类型" width="100">
        <template #default="{row}">
          <el-tag :type="row.type === 'FOF' ? 'success' : 'warning'">
            {{ row.type }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="riskLevel" label="风险等级" width="100">
        <template #default="{row}">
          <el-rate
              v-model="row.riskLevel"
              disabled
              :max="5"
              :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
          />
        </template>
      </el-table-column>
      <el-table-column prop="strategy" label="投资策略" />
      <el-table-column prop="annualizedReturn" label="年化收益(%)" width="120" align="right">
        <template #default="{row}">
          <span :class="{'text-success': row.annualizedReturn > 0}">
            {{ row.annualizedReturn }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" align="center">
        <template #default="{row}">
          <el-button
              type="text"
              size="small"
              @click="showDetail(row)"
          >
            查看详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 详情弹窗 -->
    <el-dialog
        v-model="detailVisible"
        :title="currentFund.name + ' - 详情'"
        width="50%"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="组合ID">{{ currentFund.id }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="currentFund.status === 'ACTIVE' ? 'success' : 'danger'">
            {{ currentFund.status }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentFund.createTime }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ currentFund.updateTime }}</el-descriptions-item>
        <el-descriptions-item label="最大回撤(%)">{{ currentFund.maxDrawdown }}</el-descriptions-item>
        <el-descriptions-item label="最低投资(元)">{{ currentFund.minimumInvestment }}</el-descriptions-item>
      </el-descriptions>

      <h4 style="margin-top: 20px">关联基金</h4>
      <el-table :data="currentFund.funds" border>
        <el-table-column prop="code" label="基金代码" width="120" />
        <el-table-column prop="name" label="基金名称" />
        <el-table-column prop="type" label="基金类型" width="120" />
      </el-table>

      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { getCombos } from "@/api/index.js";

export default {
  setup() {
    // 搜索功能
    const searchText = ref('')
    const handleSearch = () => {
      // 搜索逻辑已通过computed属性实现
    }

    // 创建组合按钮（未实现功能）
    const showCreateDialog = () => {
      console.log('创建组合按钮点击')
    }

    // 详情弹窗控制
    const detailVisible = ref(false)
    const currentFund = ref({
      id: '',
      name: '',
      type: '',
      riskLevel: 3,
      strategy: '',
      status: '',
      annualizedReturn: 0,
      maxDrawdown: 0,
      minimumInvestment: 0,
      createTime: '',
      updateTime: '',
      funds: []
    })

    const showDetail = (row) => {
      currentFund.value = { ...row }
      detailVisible.value = true
    }

    const combosList = ref([])

    // 数据加载函数
    const loadCombos = async () => {
      try {
        const response = await getCombos();
        combosList.value = response.data;
      } catch (error) {
        console.error('获取数据失败:', error);
      }
    }

    // 搜索过滤
    const filteredFunds = computed(() => {
      if (!searchText.value) return combosList.value
      return combosList.value.filter(combo =>
          combo.name.includes(searchText.value) ||
          combo.strategy.includes(searchText.value) ||
          combo.type.includes(searchText.value)
      )
    })

    // 在onMounted中加载数据
    onMounted(() => {
      loadCombos()
    })

    return {
      searchText,
      handleSearch,
      showCreateDialog,
      filteredFunds,
      detailVisible,
      currentFund,
      showDetail,
      combosList // 暴露combosList以便模板使用
    }
  }
}
</script>
<style scoped>
.fund-container {
  padding: 20px;
  background: #f5f7fa;
}

.header-toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.create-btn {
  margin-left: auto;
}

.text-success {
  color: #67c23a;
}

.text-danger {
  color: #f56c6c;
}
</style>