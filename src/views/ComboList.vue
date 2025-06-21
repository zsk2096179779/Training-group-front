<template>
  <div class="fund-container">
    <!-- 顶部标题栏 -->
    <el-row type="flex" align="middle" class="header-container">
      <el-col :span="12">
        <div class="system-title">
          <i class="el-icon-s-management"></i>
          <span>产品组合管理子系统</span>
        </div>
      </el-col>
      <el-col :span="12" class="header-toolbar">
        <!-- 搜索栏和创建按钮 -->
        <el-input
            v-model="searchText"
            placeholder="输入组合名称或策略搜索"
            clearable
            class="search-input"
            @keyup.enter="handleSearch"
        >

        </el-input>

        <el-button
            type="primary"
            icon="el-icon-plus"
            class="create-btn"
            @click="showCreateDialog"
        >
          <span>创建组合</span>
        </el-button>
      </el-col>
    </el-row>

    <!-- 组合列表表格 -->
    <div class="table-wrapper">
      <el-table
          :data="filteredFunds"
          border
          stripe
          style="width: 100%"
      >
        <el-table-column prop="name" label="组合名称" width="220" />
        <el-table-column prop="type" label="类型" width="180">
          <template #default="{row}">
            <el-tag :type="row.type === 'FOF' ? 'success' : 'warning'">
              {{ row.type }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="riskLevel" label="风险等级" width="180">
          <template #default="{row}">
            <!-- 动态绑定并调试输出 -->
            {{ console.log('当前riskLevel:', row.riskLevel) }}
            <el-rate
                :model-value="convertRiskLevel(row.riskLevel)"
                disabled
                :max="5"
                :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
                void-color="#EFF2F7"
                disabled-void-color="#EFF2F7"
            />
          </template>
        </el-table-column>


        <el-table-column prop="strategy" label="投资策略" width="180"/>
        <el-table-column prop="annualizedReturn" label="年化收益(%)" width="180">
          <template #default="{row}">
            <span :class="{'text-success': row.annualizedReturn > 0}">
              {{ row.annualizedReturn }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center">
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
    </div>

    <!-- 详情弹窗 -->
    <el-dialog
        v-model="detailVisible"
        :title="currentFund.name + ' - 详情'"
        width="60%"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="组合ID">{{ currentFund.id }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="currentFund.status === 'ACTIVE' ? 'success' : 'danger'">
            {{ currentFund.status }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentFund.createdTime }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ currentFund.updatedTime }}</el-descriptions-item>
        <el-descriptions-item label="最大回撤(%)">{{ currentFund.maxDrawdown }}</el-descriptions-item>
        <el-descriptions-item label="最低投资(元)">{{ currentFund.minimumInvestment }}</el-descriptions-item>
      </el-descriptions>

      <h4 style="margin-top: 20px">关联基金</h4>
      <el-table :data="currentFund.funds" border style="width: 100%">
        <el-table-column prop="fundCode" label="基金代码" width="120" />
        <el-table-column prop="fundName" label="基金名称" />
        <el-table-column prop="category" label="基金类型" width="120" />
      </el-table>

      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import {getCombos, getFundId, getFunds} from "@/api/index.js";
import axios from "axios";
import {ElMessage} from "element-plus";

export default {
  setup() {

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



    const showDetail = async (row) => {
      try {
        currentFund.value = { ...row, funds: [] }

        const fundIds = await getFundId(row.id)

        const res = await getFunds(fundIds.data)

        currentFund.value.funds = res.data || res

        detailVisible.value = true
      } catch (error) {
        console.error('数据加载失败:', error)
        ElMessage.error('基金数据加载失败')
      }
    }





    // 搜索功能
    const searchText = ref('')
    const handleSearch = () => {
      // 搜索逻辑已通过computed属性实现
    }
    const convertRiskLevel = (riskLevel) => {
      return parseInt(riskLevel.replace('R', ''))
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
      createdTime: '',
      updatedTime: '',
      funds: []
    })



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
      convertRiskLevel,
      combosList
    }
  }
}
</script>

<style scoped>
.fund-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 40px);
  width: 100%;
  box-sizing: border-box;
}

.header-container {
  margin-bottom: 20px;
  padding: 10px 0;
  border-bottom: 1px solid #e6e6e6;
}

.system-title {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
}

.system-title i {
  margin-right: 10px;
  font-size: 22px;
  color: #409eff;
}

.header-toolbar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.search-input {
  width: 300px;
  margin-right: 15px;
}

.create-btn {
  span {
    position: relative;
    left: -6px; /* 微调偏移 */
  }

}



/* 表格容器样式 */
.table-wrapper {
  width: 100%;
  overflow-x: auto;
  margin-top: 20px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

/* 表格样式优化 */
.el-table {
  width: 100% !important;
}

/* 详情弹窗样式优化 */
.el-dialog {
  border-radius: 8px;
}

.el-descriptions {
  margin-top: 20px;
}

.text-success {
  color: #67c23a;
}

.text-danger {
  color: #f56c6c;
}
</style>