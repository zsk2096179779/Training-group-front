<template>
  <div class="detail-container">
    <!-- 头部导航 -->
    <el-header style="background: #f5f7fa; border-bottom: 1px solid #e4e7ed; display: flex; align-items: center; padding: 0 20px;">
      <el-button-group>
        <el-button type="primary" :icon="ArrowLeft" @click="goBack">返回</el-button>
      </el-button-group>
      <span style="font-size: 18px; font-weight: bold;">
        策略详情 - {{ detailData?.strategy?.name || '加载中...' }}
      </span>
    </el-header>

    <!-- 主要内容区 -->
    <el-main style="background: #f5f7fa; padding: 20px; overflow: auto;">
      <!-- 核心数据卡片 -->
      <el-card v-if="detailData" shadow="hover" class="main-card">
        <!-- 核心收益数据 -->
        <div class="summary-data">
          <div class="data-item">
            <div class="label">累计收益率</div>
            <div class="value" :class="detailData.totalReturn >= 0 ? 'positive' : 'negative'">
              {{ formatNumber(detailData.totalReturn) }}%
            </div>
          </div>
          <div class="data-item">
            <div class="label">年化收益率</div>
            <div class="value" :class="detailData.annualReturn >= 0 ? 'positive' : 'negative'">
              {{ formatNumber(detailData.annualReturn) }}%
            </div>
          </div>
          <div class="data-item">
            <div class="label">最大回撤</div>
            <div class="value" :class="detailData.maxDrawdown >= 0 ? 'positive' : 'negative'">
              {{ formatNumber(detailData.maxDrawdown) }}%
            </div>
          </div>
        </div>

        <!-- 辅助收益数据 -->
        <div class="supplementary-data">
          <div class="data-mini">
            <div class="label">近30天</div>
            <div class="value" :class="detailData.recent30dReturn >= 0 ? 'positive' : 'negative'">
              {{ formatNumber(detailData.recent30dReturn) }}%
            </div>
          </div>
          <div class="data-mini">
            <div class="label">近6月</div>
            <div class="value" :class="detailData.recent6mReturn >= 0 ? 'positive' : 'negative'">
              {{ formatNumber(detailData.recent6mReturn) }}%
            </div>
          </div>
          <div class="data-mini">
            <div class="label">较基准</div>
            <div class="value" :class="detailData.excessReturn >= 0 ? 'positive' : 'negative'">
              {{ formatNumber(detailData.excessReturn) }}%
            </div>
          </div>
        </div>
      </el-card>

      <!-- 收益走势与核心指标区域 -->
      <div class="chart-section">
        <!-- 收益走势图 -->
        <el-card shadow="hover" class="profit-chart-card">
          <div class="section-title">收益走势对比</div>
          
          <div v-if="chartData.dataPoints" id="profitChart" style="height: 300px;"></div>
          <div v-else class="chart-placeholder">
            <el-icon class="loading-icon" :size="40"><Loading /></el-icon>
            <p>加载收益图表数据中...</p>
          </div>
          
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
          </div>
          <el-table :data="holdings" border style="width: 100%">
            <el-table-column prop="stock.code" label="股票代码" width="120" />
            <el-table-column prop="stock.name" label="股票名称" width="150" />
            <el-table-column prop="weight" label="持仓占比" width="100">
              <template #default="scope">
                {{ scope.row.weight }}%
              </template>
            </el-table-column>
            <el-table-column prop="marketValue" label="持仓市值" width="150" />
            <el-table-column prop="cost" label="持仓成本" width="150" />
            <el-table-column prop="profitPercentage" label="浮动盈亏" width="120">
              <template #default="scope">
                <span :class="scope.row.profitPercentage >= 0 ? 'positive' : 'negative'">
                  {{ formatProfit(scope.row.profitPercentage) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="holdingDays" label="持仓天数" width="100" />
          </el-table>
        </el-card>

        <!-- 今日成交 -->
        <el-card shadow="hover" class="data-card">
          <div class="section-header">
            <span class="section-title">成交历史</span>
          </div>
          <el-table :data="transactions" border style="width: 100%">
            <!-- 交易时间列 - 宽度增加到150px -->
            <el-table-column 
              prop="time" 
              label="交易时间" 
              width="150"
              class-name="el-table-column--time">
            </el-table-column>
            
            <el-table-column 
              prop="code" 
              label="股票代码" 
              width="120"
              class-name="el-table-column--code">
            </el-table-column>
            
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

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()

// 数据状态
const loading = ref(true)
const error = ref(false)
const detailData = ref({})
const chart = ref(null)
const chartData = ref({})

// 表格数据
const holdings = ref([])
const transactions = ref([])

// 计算属性
const coreMetrics = computed(() => {
  if (!detailData.value) return [];
  
  return [
    { label: '夏普比率', value: detailData.value.sharpeRatio?.toFixed(2) || '-' },
    { label: '波动率', value: `${detailData.value.volatility?.toFixed(2)}%` || '-' },
    { label: '贝塔系数', value: detailData.value.beta?.toFixed(2) || '-' },
    { label: '信息比率', value: detailData.value.informationRatio?.toFixed(2) || '-' },
    { label: '胜率(次数)', value: detailData.value.winRateCount?.toString() || '-' },
    { label: '胜率(%)', value: `${detailData.value.winRatePercentage?.toFixed(1)}%` || '-' }
  ];
});


// 导航方法
const goBack = () => {
  router.push('/strategy-management')
}

// 格式化数字
const formatNumber = (value, forceNegative = false) => {
  const num = parseFloat(value || 0);
  
  if (isNaN(num)) return "-";
  
  // 判断是否需要添加负号
  if (num<0) {
    return `${num.toFixed(1)}`;
  }
  else{
      // 直接显示数值（无需乘以100）
      return `+${num.toFixed(1)}`;
  }
};
const formatProfit = (value) => {
  const num = parseFloat(value);
  if (isNaN(num)) return '-';
  
  if (num >= 0) {
    return `+${num.toFixed(1)}%`;
  } else {
    return `${num.toFixed(1)}%`;
  }
};

// 处理交易历史数据格式
const processTradeHistory = (data) => {
  return data.map(item => {
    // 将日期时间字符串转换为完整的年月日时分秒格式
    const date = new Date(item.tradeTime);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return {
      time: `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`, // 完整日期时间
      code: item.stockCode,
      name: item.stockName,
      type: item.operationType === 'BUY' ? '买入' : '卖出',
      price: `¥${item.price.toFixed(2)}`,
      quantity: item.quantity.toLocaleString(),
      amount: `¥${item.amount.toFixed(2)}`,
      fee: `¥${item.fee.toFixed(2)}`
    };
  });
};

// 加载策略详情数据
const loadData = async () => {
  loading.value = true
  error.value = null
  
  try {
    // 从URL查询参数获取strategyId
    const strategyId = route.query.strategyId
    if (!strategyId) {
      throw new Error('策略ID未提供')
    }
    const [detailResponse, chartResponse, holdingsResponse, tradeHistoryResponse] = await Promise.all([
      // 请求1：策略详情
      axios.post('/api/strategy-management/Detail', {
        id: strategyId,
        name: 'fu4geliu'
      }, {
        headers: { 'Content-Type': 'application/json' }
      }),
      // 请求2：收益图表数据
      axios.post('/api/strategy-management/Chart', {
        id: strategyId,
        name: 'fu4geliu'
      }, {
        headers: { 'Content-Type': 'application/json' }
      }),
      // 请求3：持仓数据
      axios.post('/api/strategy-management/Holding', {
        id: strategyId,
        name: 'fu4geliu'
      }, {
        headers: { 'Content-Type': 'application/json' }
      }),
      // 请求4：交易历史数据
      axios.post('/api/strategy-management/TradeHistory', {
        id: strategyId,
        name: 'fu4geliu'
      }, {
        headers: { 'Content-Type': 'application/json' }
      })
    ]);
    
    detailData.value = detailResponse.data
    chartData.value = chartResponse.data
    holdings.value = holdingsResponse.data
    
    // 处理交易历史数据
    transactions.value = processTradeHistory(tradeHistoryResponse.data);
    
    console.log('策略详情数据:', detailData.value)
    console.log('Chart详情数据', chartData.value)
    console.log('Holdings详情数据', holdings.value)
    console.log('Trades详情数据', transactions.value)
    
    nextTick(() => {
      renderChart()
    })
  } catch (err) {
    console.error('加载策略详情失败:', err)
    error.value = '数据加载失败: ' + (err.response?.data?.message || err.message)
    ElMessage.error(error.value)
  } finally {
    loading.value = false
  }
}

// 渲染图表
const renderChart = () => {
  const chartEl = document.getElementById('profitChart')
  if (!chartEl) return
  
  // 清理现有图表实例
  if (chart.value) {
    chart.value.dispose()
  }
  
  // 创建新图表实例
  chart.value = echarts.init(chartEl)
  const dates = chartData.value.dataPoints.map(point => point.date)
  const strategyReturns = chartData.value.dataPoints.map(point => point.strategyReturn)
  const benchmarkReturns = chartData.value.dataPoints.map(point => point.benchmarkReturn)
  const option = {
    tooltip: { 
      trigger: 'axis',
      formatter: function(params) {
        const strategyData = params[0]
        const benchmarkData = params[1]
        return `
          <div>日期：${strategyData.axisValue}</div>
          <div style="color:${strategyData.color};">
            <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${strategyData.color};margin-right:5px;"></span>
            策略：${strategyData.value}%
          </div>
          <div style="color:${benchmarkData.color};">
            <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${benchmarkData.color};margin-right:5px;"></span>
            基准：${benchmarkData.value}%
          </div>
          <div style="color:#999; margin-top:5px;">
            超额收益：${(strategyData.value - benchmarkData.value).toFixed(1)}%
          </div>
        `
      }
    },
    legend: { 
      data: ['策略', '基准'],
      bottom: 10,
      textStyle: {
        color: '#606266'
      }
    },
    grid: { top: '15%', right: '3%', bottom: '15%', left: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: {
        interval: 0, // 显示所有标签
        rotate: 30, // 标签旋转30度，防止重叠
        formatter: function(value) {
          // 简写月份名称（如果有需要）
          return value.replace('月', '')
        }
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: { 
        formatter: '{value}%',
        color: '#606266'
      },
      splitLine: { 
        show: true,
        lineStyle: {
          color: '#ebeef5'
        }
      },
      axisLine: {
        lineStyle: {
          color: '#909399'
        }
      }
    },
    series: [
      {
        name: '策略',
        type: 'line',
        data: strategyReturns,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: { 
          color: '#5470C6' 
        },
        lineStyle: { 
          width: 3,
          color: '#5470C6'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{
                offset: 0, color: 'rgba(84, 112, 198, 0.5)' 
            }, {
                offset: 1, color: 'rgba(84, 112, 198, 0.1)' 
            }]
          }
        }
      },
      {
        name: '基准',
        type: 'line',
        data: benchmarkReturns,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: { 
          color: '#91CC75' 
        },
        lineStyle: { 
          width: 3, 
          type: 'dashed',
          color: '#91CC75'
        }
      }
    ],
    dataZoom: [{
      type: 'inside',
      start: 0,
      end: 100
    }]
  }
  
  // 设置图表选项
  chart.value.setOption(option)
  
  // 添加窗口大小变化监听
  window.addEventListener('resize', () => {
    chart.value?.resize()
  })
}

// 初始化
onMounted(() => {
  loadData()
})
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