<template>
  <el-container class="monitor-container">
    <!-- 头部区域 -->
    <el-header class="monitor-header">
      <div class="header-left">
        <div class="status-indicator" :class="systemStatus"></div>
        <span class="text-lg font-bold">策略监控中心</span>
      </div>
      
      <div class="header-controls">
        <el-select v-model="selectedStrategy" placeholder="选择策略" size="medium">
          <el-option
            v-for="strategy in strategies"
            :key="strategy.id"
            :label="strategy.name"
            :value="strategy.id">
          </el-option>
        </el-select>
        
        <el-button type="primary" size="medium" @click="refreshData" icon="el-icon-refresh">
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
            <el-tag size="mini" :type="systemStatus === 'running' ? 'success' : 'danger'">
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
                    <el-tag size="mini" :type="getWarningType(warning.level)">
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

<script>
import * as echarts from 'echarts';

export default {
  name: 'StrategyMonitor',
  data() {
    return {
      selectedStrategy: 'strategy1',
      strategies: [
        { id: 'strategy1', name: '量化多因子策略' },
        { id: 'strategy2', name: '趋势跟踪策略' },
        { id: 'strategy3', name: '均值回归策略' },
        { id: 'strategy4', name: '套利策略' },
      ],
      systemStatus: 'running', // running, stopped, error
      uptime: 14, // 天数
      netValue: '1.2358',
      yesterdayNetValue: '1.2289',
      todayProfit: 12450.78,
      yearToDate: 875632.45,
      todayProfitPercentage: '1.01',
      yearToDatePercentage: '15.24',
      averageDeviation: '3.45',
      maxDeviation: '8.72',
      industryAvgDeviation: '5.21',
      updateTime: this.getCurrentTime(),
      warnings: [
        { 
          title: 'A股波动性增大', 
          time: '14:30:21', 
          description: '沪深300指数波动率超过阈值', 
          level: 'high' 
        },
        { 
          title: '仓位接近上限', 
          time: '14:25:47', 
          description: '策略A仓位达到配置上限95%', 
          level: 'medium' 
        },
        { 
          title: '外汇市场异常波动', 
          time: '14:20:15', 
          description: '美元/日元汇率出现异常波动', 
          level: 'high' 
        },
        { 
          title: '技术指标背离', 
          time: '14:15:33', 
          description: '策略B在金融板块出现RSI顶背离', 
          level: 'medium' 
        },
        { 
          title: '交易量异常减少', 
          time: '14:10:57', 
          description: '策略C在能源板块的交易量异常减少', 
          level: 'low' 
        },
        { 
          title: '期货合约到期提醒', 
          time: '10:30:15', 
          description: 'IF2209合约即将到期，请及时处理', 
          level: 'medium' 
        }
      ],
      charts: {
        heatmap: null,
        profit: null,
        risk: null
      },
      scrollInterval: null
    };
  },
  computed: {
    systemStatusText() {
      switch(this.systemStatus) {
        case 'running': return '正常运行中';
        case 'stopped': return '已停止';
        case 'error': return '出错';
        default: return '未知状态';
      }
    },
    profitTrend() {
      return {
        up: this.todayProfit >= 0,
        down: this.todayProfit < 0
      };
    }
  },
  mounted() {
    this.initCharts();
    this.startDataUpdate();
    
    // 滚动预警信息
    this.scrollInterval = setInterval(() => {
      const warningList = document.querySelector('.warning-list');
      if (warningList) {
        const firstItem = warningList.firstElementChild;
        if (firstItem) {
          warningList.appendChild(firstItem.cloneNode(true));
          warningList.removeChild(firstItem);
        }
      }
    }, 8000);
  },
  beforeDestroy() {
    // 清除定时器
    if (this.scrollInterval) clearInterval(this.scrollInterval);
    
    // 销毁图表实例
    Object.values(this.charts).forEach(chart => {
      if (chart) chart.dispose();
    });
  },
  methods: {
    getCurrentTime() {
      const now = new Date();
      return now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    },
    formatCurrency(value) {
      return '¥' + value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    },
    refreshData() {
      // 模拟数据刷新
      this.netValue = (parseFloat(this.netValue) + (Math.random() * 0.02 - 0.01)).toFixed(4);
      this.yesterdayNetValue = (parseFloat(this.netValue) - (Math.random() * 0.01 + 0.005)).toFixed(4);
      this.todayProfit = Math.round((parseFloat(this.netValue) - parseFloat(this.yesterdayNetValue)) * 10000);
      this.todayProfitPercentage = ((this.todayProfit / parseFloat(this.yesterdayNetValue)) * 100).toFixed(2);
      
      // 更新预警信息
      const levels = ['high', 'medium', 'low'];
      const newWarning = {
        title: '策略监控提醒',
        time: this.getCurrentTime().split(' ')[1].substring(0, 5),
        description: '系统检测到策略参数异常波动，请关注',
        level: levels[Math.floor(Math.random() * levels.length)]
      };
      this.warnings.unshift(newWarning);
      
      // 保持预警数量不超过10条
      if (this.warnings.length > 10) {
        this.warnings.pop();
      }
      
      // 更新图表
      this.updateCharts();
      
      // 更新时间戳
      this.updateTime = this.getCurrentTime();
    },
    initCharts() {
      // 初始化热力图
      this.charts.heatmap = echarts.init(this.$refs.heatmapChart);
      this.updateHeatmapChart();
      
      // 初始化收益曲线图
      this.charts.profit = echarts.init(this.$refs.profitChart);
      this.updateProfitChart();
      
      // 初始化风险指标图
      this.charts.risk = echarts.init(this.$refs.riskChart);
      this.updateRiskChart();
      
      // 窗口大小变化时重绘图表
      window.addEventListener('resize', () => {
        Object.values(this.charts).forEach(chart => {
          chart && chart.resize();
        });
      });
    },
    updateHeatmapChart() {
      // 行业数据
      const industries = ['金融', '科技', '消费', '医药', '能源', '工业', '材料', '公共事业'];
      const strategies = ['当前策略', '基准组合', '行业平均'];
      
      // 生成模拟数据
      const data = [];
      for (let i = 0; i < strategies.length; i++) {
        for (let j = 0; j < industries.length; j++) {
          let deviation = Math.random() * 15;
          // 当前策略与基准和行业平均的差异
          if (i === 0) {
            if (j === 0) deviation = Math.random() * 5; // 当前策略与自身的差异为小值
            else if (j === 1) deviation = Math.random() * 10 - 5; // 与基准的差异
            else deviation = Math.random() * 8 - 4; // 与行业平均的差异
          } else if (i === 1) {
            deviation = Math.random() * 10 - 5; // 基准与行业平均的差异
          }
          
          data.push([j, i, Math.round(deviation * 10) / 10]);
        }
      }
      
      const option = {
        tooltip: {
          position: 'top',
          formatter: function(params) {
            return `${strategies[params.value[1]]}在${industries[params.value[0]]}的<br>偏离度: ${params.value[2]}%`;
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
          data: strategies,
          splitArea: {
            show: true
          }
        },
        visualMap: {
          min: -5,
          max: 10,
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
      
      this.charts.heatmap.setOption(option);
    },
    updateProfitChart() {
      // 生成模拟的日期数据
      const dates = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dates.push(d.getMonth() + 1 + '/' + d.getDate());
      }
      
      // 生成模拟的净值数据
      const netValues = [];
      let baseValue = 1.0;
      for (let i = 0; i < 30; i++) {
        const change = (Math.random() * 0.04) - 0.015; // -1.5% 到 2.5% 的随机变动
        baseValue *= (1 + change);
        netValues.push(parseFloat(baseValue.toFixed(4)));
      }
      
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
          min: function(value) {
            return Math.floor(Math.max(0.9, value.min * 0.95));
          },
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
          data: netValues,
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
      
      this.charts.profit.setOption(option);
    },
    updateRiskChart() {
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
      
      this.charts.risk.setOption(option);
    },
    updateCharts() {
      this.updateHeatmapChart();
      this.updateProfitChart();
      this.updateRiskChart();
    },
    getWarningIcon(level) {
      switch(level) {
        case 'high': return 'el-icon-warning-outline';
        case 'medium': return 'el-icon-info';
        case 'low': return 'el-icon-message';
        default: return 'el-icon-info';
      }
    },
    getWarningType(level) {
      switch(level) {
        case 'high': return 'danger';
        case 'medium': return 'warning';
        case 'low': return 'info';
        default: return 'info';
      }
    },
    getWarningLevelText(level) {
      switch(level) {
        case 'high': return '高';
        case 'medium': return '中';
        case 'low': return '低';
        default: return '未知';
      }
    },
    startDataUpdate() {
      // 每隔1秒更新一次时间
      setInterval(() => {
        this.updateTime = this.getCurrentTime();
      }, 1000);
      
      // 每隔5秒模拟数据波动
      setInterval(() => {
        this.refreshData();
      }, 5000);
    }
  }
};
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