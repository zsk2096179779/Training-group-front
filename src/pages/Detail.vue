<template>
  <div class="detail-container">
    <!-- 头部导航 -->
    <el-header style="background: #f5f7fa; border-bottom: 1px solid #e4e7ed; display: flex; align-items: center; padding: 0 20px;">
      <el-button-group>
        <el-button type="primary" :icon="ArrowLeft" @click="goBack">返回</el-button>
      </el-button-group>
      <span style="font-size: 18px; font-weight: bold;">策略详情 - 因子的综合选股模型</span>
    </el-header>

    <!-- 主要内容区 -->
    <el-main style="background: #f5f7fa; padding: 20px; overflow: auto;">
      <!-- 核心数据卡片 -->
      <el-card shadow="hover" class="main-card">
        <!-- 核心收益数据 -->
        <div class="summary-data">
          <div class="data-item">
            <div class="label">累计收益率</div>
            <div class="value positive">+42.8%</div>
          </div>
          <div class="data-item">
            <div class="label">年化收益率</div>
            <div class="value positive">+18.4%</div>
          </div>
          <div class="data-item">
            <div class="label">最大回撤</div>
            <div class="value negative">-15.2%</div>
          </div>
        </div>

        <!-- 辅助收益数据 -->
        <div class="supplementary-data">
          <div class="data-mini">
            <div class="label">近30天</div>
            <div class="value positive">+1.2%</div>
          </div>
          <div class="data-mini">
            <div class="label">近6月</div>
            <div class="value negative">-2.1%</div>
          </div>
          <div class="data-mini">
            <div class="label">较基准</div>
            <div class="value negative">-4.3%</div>
          </div>
        </div>
      </el-card>

      <!-- 收益走势与核心指标区域 -->
      <div class="chart-section">
        <!-- 收益走势图 -->
        <el-card shadow="hover" style="flex: 7; margin-right: 20px;">
          <div class="section-title">收益走势对比</div>
          <el-select v-model="selectedStock" placeholder="选择股票" class="stock-select">
            <el-option v-for="item in stockOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <div id="profitChart" style="height: 300px;"></div>
          <div class="legend">
            <div class="legend-item">
              <div class="color-box strategy"></div>
              <span>策略</span>
            </div>
            <div class="legend-item">
              <div class="color-box benchmark"></div>
              <span>基准</span>
            </div>
          </div>
        </el-card>

        <!-- 核心指标 -->
        <el-card shadow="hover" style="flex: 3;">
          <div class="section-title">核心指标</div>
          <div class="kpi-list">
            <div v-for="(item, index) in coreMetrics" :key="index" class="kpi-item">
              <div class="kpi-label">{{ item.label }}</div>
              <div class="kpi-value">{{ item.value }}</div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 持仓与成交数据区域 -->
      <div class="data-section">
        <!-- 当前持仓 -->
        <el-card shadow="hover" class="data-card">
          <div class="section-header">
            <span class="section-title">当前持仓</span>
            <span class="section-subtitle">权重分布</span>
          </div>
          <el-table :data="holdings" border style="width: 100%">
            <el-table-column prop="code" label="股票代码" width="120" />
            <el-table-column prop="name" label="股票名称" width="150" />
            <el-table-column prop="weight" label="持仓占比" width="100">
              <template #default="scope">
                {{ scope.row.weight }}%
              </template>
            </el-table-column>
            <el-table-column prop="marketValue" label="持仓市值" width="150" />
            <el-table-column prop="cost" label="持仓成本" width="150" />
            <el-table-column prop="profit" label="浮动盈亏" width="120">
              <template #default="scope">
                <span :class="scope.row.profit.includes('+') ? 'positive' : 'negative'">
                  {{ scope.row.profit }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="days" label="持仓天数" width="100" />
          </el-table>
        </el-card>

        <!-- 今日成交 -->
        <el-card shadow="hover" class="data-card">
          <div class="section-header">
            <span class="section-title">今日成交</span>
            <el-button type="text">历史调仓</el-button>
          </div>
          <el-table :data="transactions" border style="width: 100%">
            <el-table-column prop="time" label="交易时间" width="120" />
            <el-table-column prop="code" label="股票代码" width="120" />
            <el-table-column prop="name" label="股票名称" width="150" />
            <el-table-column prop="type" label="操作类型" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.type === '买入' ? 'success' : 'danger'" size="small">
                  {{ scope.row.type }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="price" label="成交价格" width="120" />
            <el-table-column prop="quantity" label="成交数量" width="120" />
            <el-table-column prop="amount" label="成交金额" width="150" />
            <el-table-column prop="fee" label="手续费" width="120" />
          </el-table>
        </el-card>
      </div>
    </el-main>
  </div>
</template>

<script>
import { ArrowLeft } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'

export default {
  setup() {
    const router = useRouter()
    
    // 返回策略列表
    const goBack = () => {
      router.push('/strategy-management')
    }

    return {
      goBack,
      ArrowLeft
    }
  },
  data() {
    return {
      selectedStock: 'all',
      stockOptions: [
        { value: 'all', label: '全部股票' },
        { value: '600519', label: '贵州茅台' },
        { value: '000858', label: '五粮液' },
        { value: '601318', label: '中国平安' }
      ],
      coreMetrics: [
        { label: '夏普比率', value: '1.42' },
        { label: '波动率', value: '12.8%' },
        { label: '贝塔系数', value: '0.86' },
        { label: '信息比率', value: '0.95' },
        { label: '胜率', value: '147' },
        { label: '胜率(%)', value: '62.3%' }
      ],
      holdings: [
        { code: '600519', name: '贵州茅台', weight: 8.4, marketValue: '¥128,546', cost: '¥128,231', profit: '+6.9%', days: 24 },
        { code: '000858', name: '五粮液', weight: 6.2, marketValue: '¥94,872', cost: '¥91,024', profit: '+4.2%', days: 18 },
        { code: '601318', name: '中国平安', weight: 5.8, marketValue: '¥88,742', cost: '¥92,456', profit: '-4.0%', days: 32 },
        { code: '000333', name: '美的集团', weight: 4.9, marketValue: '¥74,981', cost: '¥71,235', profit: '+5.3%', days: 29 },
        { code: '601888', name: '中国中免', weight: 4.6, marketValue: '¥70,345', cost: '¥75,462', profit: '-6.8%', days: 15 }
      ],
      transactions: [
        { time: '09:31:24', code: '002415', name: '海康威视', type: '买入', price: '¥34.82', quantity: '1,200', amount: '¥41,784.00', fee: '¥41.78' },
        { time: '09:45:12', code: '600887', name: '伊利股份', type: '买入', price: '¥27.35', quantity: '1,800', amount: '¥49,230.00', fee: '¥49.23' },
        { time: '18:12:45', code: '601857', name: '中国石油', type: '卖出', price: '¥5.38', quantity: '18,000', amount: '¥53,800.00', fee: '¥53.80' }
      ]
    }
  },
  mounted() {
    this.renderChart()
  },
  methods: {
    renderChart() {
      const chart = echarts.init(document.getElementById('profitChart'))
      const option = {
        tooltip: { trigger: 'axis' },
        legend: { data: ['策略', '基准'], bottom: 10 },
        grid: { top: '15%', right: '3%', bottom: '15%', left: '3%', containLabel: true },
        xAxis: {
          type: 'category',
          data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月']
        },
        yAxis: {
          type: 'value',
          axisLabel: { formatter: '{value}%' },
          splitLine: { show: true, lineStyle: { type: 'dashed' } }
        },
        series: [
          {
            name: '策略',
            type: 'line',
            data: [2.3, 5.2, 8.1, 12.4, 15.7, 22.1, 26.5, 32.3, 38.2, 42.8],
            smooth: true,
            symbol: 'emptyCircle',
            symbolSize: 8,
            itemStyle: { color: '#5470C6' },
            lineStyle: { width: 3 }
          },
          {
            name: '基准',
            type: 'line',
            data: [1.8, 4.5, 7.2, 10.8, 14.5, 18.2, 22.6, 28.5, 35.1, 39.7],
            smooth: true,
            symbol: 'emptyCircle',
            symbolSize: 8,
            itemStyle: { color: '#91CC75' },
            lineStyle: { width: 3, type: 'dashed' }
          }
        ]
      }
      chart.setOption(option)
    }
  }
}
</script>

<style scoped>
.detail-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-card {
  margin-bottom: 20px;
}

.summary-data {
  display: flex;
  justify-content: space-around;
  padding: 20px 0;
  border-bottom: 1px solid #ebeef5;
}

.data-item {
  text-align: center;
}

.data-item .label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.data-item .value {
  font-size: 28px;
  font-weight: bold;
}

.supplementary-data {
  display: flex;
  justify-content: space-around;
  padding: 15px 0;
}

.data-mini {
  text-align: center;
  flex: 1;
}

.data-mini .label {
  font-size: 12px;
  color: #909399;
}

.data-mini .value {
  font-size: 16px;
  font-weight: 500;
}

.positive {
  color: #f56c6c;
}

.negative {
  color: #67c23a;
}

.chart-section {
  display: flex;
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #303133;
}

.stock-select {
  position: absolute;
  right: 20px;
  top: 20px;
  width: 150px;
  z-index: 10;
}

.legend {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  margin: 0 15px;
}

.color-box {
  width: 16px;
  height: 4px;
  margin-right: 8px;
  border-radius: 2px;
}

.color-box.strategy {
  background: #5470C6;
}

.color-box.benchmark {
  background: #91CC75;
}

.kpi-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.kpi-item {
  background: #f9fafc;
  padding: 12px;
  border-radius: 4px;
}

.kpi-label {
  font-size: 13px;
  color: #909399;
}

.kpi-value {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
  margin-top: 5px;
}

.data-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.data-card {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-subtitle {
  font-size: 14px;
  color: #909399;
}
</style>