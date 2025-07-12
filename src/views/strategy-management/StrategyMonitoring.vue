<template>
  <el-container class="monitor-container">
    <!-- 头部区域 -->
    <el-header class="monitor-header">
      <div class="header-left">
        <div class="status-indicator" :class="systemStatus"></div>
        <span class="text-lg font-bold">策略监控中心</span>
      </div>

      <div class="header-controls">
        <el-select
            v-model="selectedStrategy"
            placeholder="选择策略"
            size="small"
            @change="handleStrategySelect"
            style="width:180px;"
        >
          <el-option
              v-for="s in strategies"
              :key="s.id"
              :label="s.name"
              :value="s.id"
          />
        </el-select>
        <el-button
            type="primary"
            size="small"
            @click="refreshData"
        >
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
      </div>
    </el-header>

    <!-- 主内容区域 -->
    <el-main class="monitor-content">
      <!-- 关键指标卡片区域 -->
      <div class="metrics-grid">
        <el-card class="metric-card">
          <div class="metric-title">
            <span>运行状态</span>
            <el-tag size="small" :type="systemStatus === 'running' ? 'success' : 'danger'">
              {{ systemStatusText }}
            </el-tag>
          </div>
          <div class="status-card">
            <div class="status-indicator-large" :class="systemStatus"></div>
            <div class="metric-value">{{ systemStatusText }}</div>
            <div class="metric-subtext">已持续运行 {{ uptime }} 天</div>
          </div>
        </el-card>

        <el-card class="metric-card">
          <div class="metric-title">
            <span>实时净值</span>
            <i class="el-icon-data-line"></i>
          </div>
          <div class="metric-value-large">{{ netValue }}</div>
          <div class="metric-subtext">
            较昨日 {{ todayProfit >= 0 ? '+' : '' }}{{ todayProfitPercentage }}%
            <span class="profit-trend" :class="todayProfit >= 0 ? 'up' : 'down'">
              {{ todayProfit >= 0 ? '↑' : '↓' }}
            </span>
          </div>
        </el-card>

        <el-card class="metric-card">
          <div class="metric-title">
            <span>今日盈亏</span>
            <i class="el-icon-money"></i>
          </div>
          <div class="metric-value-large" :class="todayProfit >= 0 ? 'profit' : 'loss'">
            {{ formatCurrency(todayProfit) }}
          </div>
          <div class="metric-subtext">年初至今: {{ formatCurrency(yearToDate) }} ({{ yearToDatePercentage }}%)</div>
        </el-card>

        <el-card class="metric-card">
          <div class="metric-title">
            <span>持仓偏离度</span>
            <i class="el-icon-warning-outline"></i>
          </div>
          <div class="metric-value-large">{{ averageDeviation }}%</div>
          <div class="metric-subtext">
            最大偏离: {{ maxDeviation }}% | 行业平均: {{ industryAvgDeviation }}%
          </div>
        </el-card>
      </div>

      <!-- 图表和预警区域 -->
      <div class="content-grid">
        <!-- 预警通知中心 -->
        <el-card class="warning-card">
          <div class="card-title">
            <i class="el-icon-bell"></i>
            预警通知中心
          </div>
          <div class="warning-container">
            <ul class="warning-list">
              <li v-for="(warning, index) in warnings" :key="index"
                  class="warning-item" :class="'warning-level-' + warning.level">
                <div class="warning-icon">
                  <i :class="getWarningIcon(warning.level)"></i>
                </div>
                <div class="warning-content">
                  <div class="warning-title">
                    {{ warning.title }}
                    <el-tag size="small" :type="getWarningType(warning.level)">
                      {{ getWarningLevelText(warning.level) }}
                    </el-tag>
                  </div>
                  <div class="warning-time">{{ warning.time }} | {{ warning.description }}</div>
                </div>
              </li>
            </ul>
          </div>
          <div class="timestamp">最后更新: {{ updateTime }}</div>
        </el-card>

        <!-- 持仓偏离度热力图 -->
        <el-card class="chart-card">
          <div class="card-title">
            <i class="el-icon-s-data"></i>
            持仓偏离度热力图
          </div>
          <div class="chart-container" ref="heatmapChart"></div>
          <div class="heatmap-legend">
            <div class="legend-item">
              <div class="legend-color" style="background: #ffffff"></div>
              <span>无偏离</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background: #e6f7ff"></div>
              <span>轻微偏离</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background: #91d5ff"></div>
              <span>一般偏离</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background: #4096ff"></div>
              <span>较大偏离</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background: #0958d9"></div>
              <span>严重偏离</span>
            </div>
          </div>
        </el-card>

        <!-- 策略收益曲线 -->
        <el-card class="chart-card">
          <div class="card-title">
            <i class="el-icon-trend-charts"></i>
            策略收益曲线
          </div>
          <div class="chart-container" ref="profitChart"></div>
        </el-card>

        <!-- 风险指标 -->
        <el-card class="chart-card">
          <div class="card-title">
            <i class="el-icon-s-risk"></i>
            风险指标
          </div>
          <div class="chart-container" ref="riskChart"></div>
        </el-card>
      </div>
    </el-main>
  </el-container>
</template>


<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'
import { ElNotification, ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import {Refresh} from "@element-plus/icons-vue";
import {fetchStrategies} from "@/api/strategy";
import {
  fetchWarnings, fetchProfitCurve, fetchHeatmap, fetchMetrics
} from "@/api/monitoring";

const route = useRoute()
const router = useRouter()

// 响应式数据
const loading = ref(true)
const error = ref(null)
const selectedStrategy = ref(null)
const strategies = ref([])

const systemStatus = ref('')
const uptime = ref(0)
const netValue = ref('')
const yesterdayNetValue = ref('')
const todayProfit = ref(0)
const yearToDate = ref(0)
const todayProfitPercentage = ref('')
const yearToDatePercentage = ref('')
const averageDeviation = ref(0)
const maxDeviation = ref(0)
const industryAvgDeviation = ref(0)
const updateTime = ref('')

const warnings = ref([])

// 图表引用
const heatmapChart = ref(null)
const profitChart = ref(null)
const riskChart = ref(null)

// 图表实例
const heatmapInstance = ref(null)
const profitInstance = ref(null)
const riskInstance = ref(null)

// 定时器引用
const scrollInterval = ref(null)
const timeUpdateInterval = ref(null)
const dataUpdateInterval = ref(null)

// 计算属性
const systemStatusText = computed(() => {
  switch (systemStatus.value) {
    case 'RUNNING': return '正常运行中'
    case 'STOPPED': return '已停止'
    case 'ERROR': return '出错'
    default: return '未知状态'
  }
})

const formattedTodayProfit = computed(() => {
  return formatCurrency(todayProfit.value)
})

const formattedYearToDate = computed(() => {
  return formatCurrency(yearToDate.value)
})

// 方法
function getCurrentTime() {
  const now = new Date()
  return now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

function formatCurrency(value) {
  return '¥' + parseFloat(value).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')
}

async function loadStrategyList() {
  // loading.value = true;
  // try {
  //   // 拉取策略数据
  //   const response = await fetchStrategies({
  //     page: 1,
  //     limit: 100,
  //     name: '',
  //     status: 'all'
  //   });
  //
  //   // 检查数据是否有效
  //   const records = response.data?.data?.records || [];  // 默认空数组
  //
  //   console.log('Fetched strategies:', records); // 输出查看数据结构
  //
  //   // 如果没有数据
  //   if (records.length === 0) {
  //     ElMessage.warning('没有可用的策略数据');
  //   }
  //
  //   // 处理数据
  //   strategies.value = records.map(item => ({ id: item.id, name: item.name }));
  //
  //   // 如果路由中有策略ID，优先选择
  //   const routeStrategyId = route.query.strategyId;
  //   if (routeStrategyId) {
  //     if (strategies.value.some(s => s.id === routeStrategyId)) {
  //       selectedStrategy.value = routeStrategyId;
  //       await loadMonitorData();
  //       return;
  //     } else {
  //       ElMessage.warning(`策略ID ${routeStrategyId} 无效，将选择第一个策略`);
  //     }
  //   }

  loading.value = true;
  try {
    const records = [
      { id: 1, name: '策略 1' },
      { id: 2, name: '策略 2' },
      { id: 3, name: '策略 3' }
    ];

    strategies.value = records.map(item => ({ id: item.id, name: item.name }));

    // 默认选中第一个策略
    if (strategies.value.length > 0) {
      selectedStrategy.value = strategies.value[0].id;
      await loadMonitorData();
    } else {
      error.value = '没有可用的策略数据';
    }
    // 没有有效的路由参数时，选择第一个策略
    if (strategies.value.length > 0) {
      selectedStrategy.value = strategies.value[0].id;
      updateRouteParam();
      await loadMonitorData();
    } else {
      error.value = '没有可用的策略数据';
    }

  } catch (err) {
    console.error('加载策略列表失败:', err);
    error.value = '无法加载策略列表: ' + (err.response?.data?.message || err.message);
    ElMessage.error(error.value);
  } finally {
    loading.value = false;
  }
}



function updateRouteParam() {
  router.push({
    query: { ...route.query, strategyId: selectedStrategy.value }
  });
}

function handleStrategySelect(strategyId) {
  selectedStrategy.value = strategyId;
  updateRouteParam();
  loadMonitorData();
}

function getStrategyStatus(strategyId) {
  // 简化实现，实际中可能需要从API获取状态
  const statusOptions = ['running', 'stopped', 'error'];
  return statusOptions[Math.floor(Math.random() * statusOptions.length)];
}

// async function loadMonitorData() {
//   if (!selectedStrategy.value) {
//     ElMessage.warning('请先选择策略');
//     return;
//   }
//
//   loading.value = true;
//   error.value = null;
//
//   try {
//     // 并行请求所有监控数据
//     const [metricsResponse,warningsResponse,profitResponse,heatmapResponse] = await Promise.all([
//       fetchMetrics(selectedStrategy.value),
//       fetchWarnings(selectedStrategy.value),
//       fetchProfitCurve(selectedStrategy.value),
//       fetchHeatmap(selectedStrategy.value)
//     ])
//
//     // 监控指标
//     const metrics = metricsResponse.data;
//     systemStatus.value = metrics.systemStatus;
//     uptime.value = metrics.uptimeDays;
//     netValue.value = metrics.netValue.toFixed(4);
//     yesterdayNetValue.value = metrics.yesterdayNetValue?.toFixed(4) || '1.0000';
//     todayProfit.value = metrics.todayProfit;
//     yearToDate.value = metrics.yearToDateProfit;
//     todayProfitPercentage.value = metrics.todayProfitPercentage.toFixed(2);
//     yearToDatePercentage.value = metrics.yearToDatePercentage.toFixed(2);
//     averageDeviation.value = metrics.averageDeviation.toFixed(2);
//     maxDeviation.value = metrics.maxDeviation.toFixed(2);
//     industryAvgDeviation.value = metrics.industryAvgDeviation.toFixed(2);
//     // 预警通知
//     warnings.value = warningsResponse.data.map(event => ({
//       title: event.title,
//       time: new Date(event.eventTime).toLocaleTimeString('zh-CN', { hour12: false }),
//       description: event.description,
//       level: event.riskLevel.toLowerCase(),
//       resolved: event.resolved
//     }));
//
//     // 图数据
//     initHeatmapChart(heatmapResponse.data);
//     initProfitChart(profitResponse.data);
//     initRiskChart();
//     // 更新时间戳
//     updateTime.value = getCurrentTime();
//
//   } catch (err) {
//     console.error('加载监控数据失败:', err);
//     error.value = '加载监控数据失败: ' + (err.response?.data?.message || err.message);
//     ElMessage.error(error.value);
//   } finally {
//     loading.value = false;
//   }
// }
async function loadMonitorData() {
  if (!selectedStrategy.value) {
    ElMessage.warning('请先选择策略');
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    // 假数据：模拟监控数据
    systemStatus.value = 'RUNNING';
    uptime.value = 120;
    netValue.value = '1.23';
    todayProfit.value = 0.45;
    yearToDate.value = 10.5;
    todayProfitPercentage.value = 5.6;
    yearToDatePercentage.value = 12.3;
    averageDeviation.value = 3.4;
    maxDeviation.value = 8.1;
    industryAvgDeviation.value = 5.6;

    warnings.value = [
      {
        title: '风险事件 1',
        time: '2025-07-12 14:32:12',
        description: '策略收益波动过大',
        level: 'high',
      },
      {
        title: '风险事件 2',
        time: '2025-07-12 15:00:00',
        description: '市场风险警告',
        level: 'medium',
      }
    ];

    // 图表数据：这里我们可以使用模拟的数据
    initHeatmapChart([
      { industry: '行业 1', comparisonDimension: '维度 1', deviationValue: 4.5 },
      { industry: '行业 1', comparisonDimension: '维度 2', deviationValue: 2.3 },
      { industry: '行业 2', comparisonDimension: '维度 1', deviationValue: 3.1 }
    ]);

    initProfitChart([
      { pointDate: '2025-07-01', netValue: 1.0 },
      { pointDate: '2025-07-02', netValue: 1.2 },
      { pointDate: '2025-07-03', netValue: 1.1 }
    ]);

    initRiskChart();

    updateTime.value = getCurrentTime();

  } catch (err) {
    console.error('加载监控数据失败:', err);
    error.value = '加载监控数据失败: ' + err.message;
    ElMessage.error(error.value);
  } finally {
    loading.value = false;
  }
}


function refreshData() {
  if (!selectedStrategy.value) {
    ElMessage.warning('请先选择策略');
    return;
  }

  loadMonitorData();
}

// 图表方法
async function initCharts() {
  // 等待DOM更新完成
  await nextTick();

  // 销毁现有图表实例
  if (heatmapInstance.value) heatmapInstance.value.dispose();
  if (profitInstance.value) profitInstance.value.dispose();
  if (riskInstance.value) riskInstance.value.dispose();

  // 初始化图表容器
  heatmapInstance.value = heatmapChart.value ? echarts.init(heatmapChart.value) : null;
  profitInstance.value = profitChart.value ? echarts.init(profitChart.value) : null;
  riskInstance.value = riskChart.value ? echarts.init(riskChart.value) : null;

  // 窗口大小变化时重绘图表
  window.addEventListener('resize', handleResize);
}

function handleResize() {
  if (heatmapInstance.value) heatmapInstance.value.resize();
  if (profitInstance.value) profitInstance.value.resize();
  if (riskInstance.value) riskInstance.value.resize();
}

// function initHeatmapChart(heatmapData) {
//   if (!heatmapData || !heatmapInstance.value) return;
//
//   // 提取唯一的行业和比较维度
//   const industries = [...new Set(heatmapData.map(item => item.industry))];
//   const dimensions = [...new Set(heatmapData.map(item => item.comparisonDimension))];
//
//   // 准备热力图数据
//   const data = [];
//   for (let i = 0; i < industries.length; i++) {
//     for (let j = 0; j < dimensions.length; j++) {
//       const item = heatmapData.find(
//           d => d.industry === industries[i] &&
//               d.comparisonDimension === dimensions[j]
//       );
//       if (item) {
//         data.push([i, j, parseFloat(item.deviationValue)]);
//       }
//     }
//   }
//
//   const option = {
//     tooltip: {
//       position: 'top',
//       formatter: function(params) {
//         return `${dimensions[params.value[1]]}在${industries[params.value[0]]}的<br>偏离度: ${params.value[2]}%`;
//       }
//     },
//     grid: {
//       top: '10%',
//       left: '10%',
//       right: '10%',
//       bottom: '15%'
//     },
//     xAxis: {
//       type: 'category',
//       data: industries,
//       splitArea: {
//         show: true
//       },
//       axisLabel: {
//         interval: 0,
//         rotate: 30
//       }
//     },
//     yAxis: {
//       type: 'category',
//       data: dimensions,
//       splitArea: {
//         show: true
//       }
//     },
//     visualMap: {
//       min: Math.min(...heatmapData.map(item => item.deviationValue)) - 1,
//       max: Math.max(...heatmapData.map(item => item.deviationValue)) + 1,
//       calculable: true,
//       orient: 'horizontal',
//       left: 'center',
//       bottom: '5%',
//       inRange: {
//         color: ['#ffffff', '#e6f7ff', '#91d5ff', '#4096ff', '#0958d9']
//       }
//     },
//     series: [{
//       name: '偏离程度',
//       type: 'heatmap',
//       data: data,
//       label: {
//         show: true,
//         formatter: '{c}%',
//         color: '#333'
//       },
//       emphasis: {
//         itemStyle: {
//           shadowBlur: 10,
//           shadowColor: 'rgba(0, 0, 0, 0.5)'
//         }
//       }
//     }]
//   };
//
//   heatmapInstance.value.setOption(option);
// }
function initHeatmapChart(heatmapData) {
  if (!heatmapData || !heatmapInstance.value) return;

  const industries = [...new Set(heatmapData.map(item => item.industry))];
  const dimensions = [...new Set(heatmapData.map(item => item.comparisonDimension))];

  const data = [];
  for (let i = 0; i < industries.length; i++) {
    for (let j = 0; j < dimensions.length; j++) {
      const item = heatmapData.find(
          d => d.industry === industries[i] && d.comparisonDimension === dimensions[j]
      );
      if (item) {
        data.push([i, j, item.deviationValue]);
      }
    }
  }

  const option = {
    tooltip: {
      position: 'top',
      formatter: function(params) {
        return `${dimensions[params.value[1]]}在${industries[params.value[0]]}的<br>偏离度: ${params.value[2]}%`;
      }
    },
    grid: {
      top: '10%',
      left: '10%',
      right: '10%',
      bottom: '15%'
    },
    xAxis: {
      type: 'category',
      data: industries,
      splitArea: {
        show: true
      },
      axisLabel: {
        interval: 0,
        rotate: 30
      }
    },
    yAxis: {
      type: 'category',
      data: dimensions,
      splitArea: {
        show: true
      }
    },
    visualMap: {
      min: Math.min(...heatmapData.map(item => item.deviationValue)) - 1,
      max: Math.max(...heatmapData.map(item => item.deviationValue)) + 1,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '5%',
      inRange: {
        color: ['#ffffff', '#e6f7ff', '#91d5ff', '#4096ff', '#0958d9']
      }
    },
    series: [{
      name: '偏离程度',
      type: 'heatmap',
      data: data,
      label: {
        show: true,
        formatter: '{c}%',
        color: '#333'
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  };

  heatmapInstance.value.setOption(option);
}

function initProfitChart(profitData) {
  if (!profitData || !profitInstance.value) return;

  const dates = profitData.map(item => {
    const date = new Date(item.pointDate);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });

  const values = profitData.map(item => parseFloat(item.netValue));
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br>净值: {c}'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
      axisLine: {
        lineStyle: {
          color: '#909399'
        }
      }
    },
    yAxis: {
      type: 'value',
      min: values.length > 0 ? Math.min(...values) * 0.95 : 0,
      axisLine: {
        show: true,
        lineStyle: {
          color: '#909399'
        }
      },
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      }
    },
    series: [{
      name: '净值',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      data: values,
      lineStyle: {
        width: 3,
        color: '#1e9fff'
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(30, 159, 255, 0.4)' },
          { offset: 1, color: 'rgba(30, 159, 255, 0.05)' }
        ])
      },
      markPoint: {
        data: [
          { type: 'max', name: '最大值' },
          { type: 'min', name: '最小值' }
        ]
      }
    }]
  };

  profitInstance.value.setOption(option);
}

function initRiskChart() {
  if (!riskInstance.value) return;

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c}% ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      data: ['市场风险', '信用风险', '流动性风险', '操作风险', '模型风险'],
      textStyle: {
        color: '#606266'
      }
    },
    series: [
      {
        name: '风险分布',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '16',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 35, name: '市场风险', itemStyle: { color: '#36cfc9' } },
          { value: 25, name: '信用风险', itemStyle: { color: '#69c0ff' } },
          { value: 18, name: '流动性风险', itemStyle: { color: '#1e9fff' } },
          { value: 12, name: '操作风险', itemStyle: { color: '#597ef7' } },
          { value: 10, name: '模型风险', itemStyle: { color: '#0958d9' } }
        ]
      }
    ]
  };

  riskInstance.value.setOption(option);
}


// function initProfitChart(profitData) {
//   if (!profitData || !profitInstance.value) return;
//
//   // 准备图表数据 - 使用新的字段名
//   const dates = profitData.map(item => {
//     const date = new Date(item.pointDate);
//     return `${date.getMonth() + 1}/${date.getDate()}`;
//   });
//
//   // 使用netValue字段
//   const values = profitData.map(item => parseFloat(item.netValue));
//   const option = {
//     tooltip: {
//       trigger: 'axis',
//       formatter: '{b}<br>净值: {c}'
//     },
//     grid: {
//       left: '3%',
//       right: '4%',
//       bottom: '10%',
//       top: '10%',
//       containLabel: true
//     },
//     xAxis: {
//       type: 'category',
//       boundaryGap: false,
//       data: dates,
//       axisLine: {
//         lineStyle: {
//           color: '#909399'
//         }
//       }
//     },
//     yAxis: {
//       type: 'value',
//       min: values.length > 0 ? Math.min(...values) * 0.95 : 0,
//       axisLine: {
//         show: true,
//         lineStyle: {
//           color: '#909399'
//         }
//       },
//       splitLine: {
//         lineStyle: {
//           type: 'dashed'
//         }
//       }
//     },
//     series: [{
//       name: '净值',
//       type: 'line',
//       smooth: true,
//       symbol: 'circle',
//       symbolSize: 8,
//       data: values,
//       lineStyle: {
//         width: 3,
//         color: '#1e9fff'
//       },
//       areaStyle: {
//         color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
//           { offset: 0, color: 'rgba(30, 159, 255, 0.4)' },
//           { offset: 1, color: 'rgba(30, 159, 255, 0.05)' }
//         ])
//       },
//       markPoint: {
//         data: [
//           { type: 'max', name: '最大值' },
//           { type: 'min', name: '最小值' }
//         ]
//       }
//     }]
//   };
//
//   profitInstance.value.setOption(option);
// }
// function initRiskChart() {
//   if (!riskInstance.value) return;
//
//   const option = {
//     tooltip: {
//       trigger: 'item',
//       formatter: '{a} <br/>{b}: {c}% ({d}%)'
//     },
//     legend: {
//       orient: 'vertical',
//       right: 10,
//       top: 'center',
//       data: ['市场风险', '信用风险', '流动性风险', '操作风险', '模型风险'],
//       textStyle: {
//         color: '#606266'
//       }
//     },
//     series: [
//       {
//         name: '风险分布',
//         type: 'pie',
//         radius: ['40%', '70%'],
//         center: ['40%', '50%'],
//         avoidLabelOverlap: false,
//         itemStyle: {
//           borderRadius: 8,
//           borderColor: '#fff',
//           borderWidth: 2
//         },
//         label: {
//           show: false,
//           position: 'center'
//         },
//         emphasis: {
//           label: {
//             show: true,
//             fontSize: '16',
//             fontWeight: 'bold'
//           }
//         },
//         labelLine: {
//           show: false
//         },
//         data: [
//           { value: 35, name: '市场风险', itemStyle: { color: '#36cfc9' } },
//           { value: 25, name: '信用风险', itemStyle: { color: '#69c0ff' } },
//           { value: 18, name: '流动性风险', itemStyle: { color: '#1e9fff' } },
//           { value: 12, name: '操作风险', itemStyle: { color: '#597ef7' } },
//           { value: 10, name: '模型风险', itemStyle: { color: '#0958d9' } }
//         ]
//       }
//     ]
//   };
//
//   riskInstance.value.setOption(option);
// }
function getWarningIcon(level) {
  switch(level) {
    case 'high': return 'el-icon-warning-outline'
    case 'medium': return 'el-icon-info'
    case 'low': return 'el-icon-message'
    default: return 'el-icon-info'
  }
}

function getWarningType(level) {
  switch(level) {
    case 'high': return 'danger'
    case 'medium': return 'warning'
    case 'low': return 'info'
    default: return 'info'
  }
}

function getWarningLevelText(level) {
  switch(level) {
    case 'high': return '高'
    case 'medium': return '中'
    case 'low': return '低'
    default: return '未知'
  }
}

// 生命周期钩子
onMounted(() => {
  // 监听路由变化
  watch(() => route.query.strategyId, (newStrategyId) => {
    if (newStrategyId && strategies.value.some(s => s.id == newStrategyId)) {
      selectedStrategy.value = newStrategyId;
      loadMonitorData();
    }
  });

  // 初始化图表
  initCharts();

  // 加载策略列表
  loadStrategyList();

  // 启动定时更新时间
  timeUpdateInterval.value = setInterval(() => {
    updateTime.value = getCurrentTime();
  }, 1000);

  // 滚动预警信息
  scrollInterval.value = setInterval(() => {
    const warningList = document.querySelector('.warning-list');
    if (warningList) {
      const firstItem = warningList.firstElementChild;
      if (firstItem) {
        warningList.appendChild(firstItem.cloneNode(true));
        warningList.removeChild(firstItem);
      }
    }
  }, 8000);
});

onBeforeUnmount(() => {
  // 清除所有定时器
  if (scrollInterval.value) clearInterval(scrollInterval.value);
  if (timeUpdateInterval.value) clearInterval(timeUpdateInterval.value);
  if (dataUpdateInterval.value) clearInterval(dataUpdateInterval.value);

  // 销毁图表实例
  if (heatmapInstance.value) heatmapInstance.value.dispose();
  if (profitInstance.value) profitInstance.value.dispose();
  if (riskInstance.value) riskInstance.value.dispose();

  // 移除事件监听
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.monitor-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f0f5ff 0%, #e6f7ff 100%);
}

.monitor-header {
  background-color: #ffffff;
  padding: 0 24px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #909399;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.status-indicator.running {
  background-color: #1e9fff;
  animation: pulse 1.5s infinite;
}

.status-indicator.stopped {
  background-color: #909399;
}

.status-indicator.error {
  background-color: #f56c6c;
  animation: blink 1s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.95); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.8; }
}

@keyframes blink {
  0% { opacity: 0.4; }
  50% { opacity: 1; }
  100% { opacity: 0.4; }
}

.text-lg {
  font-size: 18px;
}

.font-bold {
  font-weight: 600;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.el-select {
  width: 180px;
}

.monitor-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.metric-card {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 20px;
  transition: all 0.3s;
  border-left: 4px solid #1e9fff;
}

.metric-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.metric-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metric-value {
  font-size: 24px;
  font-weight: 600;
  color: #1e2a3a;
}

.metric-value-large {
  font-size: 32px;
  font-weight: 700;
  color: #1e2a3a;
  margin: 12px 0;
}

.metric-subtext {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.profit {
  color: #52c41a;
}

.loss {
  color: #f5222d;
}

.profit-trend {
  margin-left: 8px;
}

.profit-trend.up {
  color: #52c41a;
}

.profit-trend.down {
  color: #f5222d;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-auto-rows: minmax(300px, auto);
  gap: 20px;
}

.chart-card, .warning-card {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 20px;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e2a3a;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  align-items: center;
  gap: 8px;
}

.chart-container {
  flex: 1;
  min-height: 250px;
}

.warning-container {
  background-color: #fdf6ec;
  border-radius: 6px;
  padding: 12px;
  height: 220px;
  overflow: hidden;
  position: relative;
  border: 1px solid #faecd8;
}

.warning-list {
  list-style: none;
  padding: 0;
  margin: 0;
  position: absolute;
  width: calc(100% - 24px);
}

.warning-item {
  padding: 12px 16px;
  background-color: #ffffff;
  margin-bottom: 10px;
  border-radius: 6px;
  display: flex;
  align-items: flex-start;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  border-left: 4px solid transparent;
}

.warning-item:hover {
  transform: translateX(5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.warning-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #fef6e9;
  color: #e6a23c;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
}

.warning-level-high .warning-icon {
  background-color: #fef0f0;
  color: #f56c6c;
}

.warning-level-medium .warning-icon {
  background-color: #fef6e9;
  color: #e6a23c;
}

.warning-level-low .warning-icon {
  background-color: #f0f9eb;
  color: #67c23a;
}

.warning-content {
  flex: 1;
}

.warning-title {
  font-weight: 600;
  font-size: 14px;
  color: #1e2a3a;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.warning-time {
  font-size: 12px;
  color: #909399;
}

.timestamp {
  text-align: right;
  color: #909399;
  font-size: 12px;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px dashed #ebeef5;
}

/* 警告级别样式 */
.warning-level-high {
  border-left-color: #f56c6c;
}

.warning-level-medium {
  border-left-color: #e6a23c;
}

.warning-level-low {
  border-left-color: #67c23a;
}

</style>
