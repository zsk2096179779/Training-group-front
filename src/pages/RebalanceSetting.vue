<template>
  <div class="config-container">
    <!-- 头部区域 -->
    <el-header class="config-header">
      <div class="header-left">
        <div class="status-indicator running"></div>
        <span class="header-title">配置管理子系统</span>
      </div>
      <div class="header-controls">
        <el-button type="primary" @click="saveConfig" icon="Check">
          应用设置
        </el-button>
      </div>
    </el-header>
    
    <!-- 主内容区域 -->
    <el-main class="config-content">
      <!-- 策略选择区域 -->
      <section class="config-section">
        <h2 class="section-title">
          <el-icon><DataAnalysis /></el-icon>
          策略选择
        </h2>
        
        <div class="form-group">
          <label class="form-label">策略类型</label>
          <el-select 
            v-model="selectedStrategy" 
            class="form-control"
            @change="handleStrategyChange"
          >
            <el-option 
              v-for="strategy in strategies" 
              :key="strategy.id"
              :value="strategy.id"
              :label="strategy.name"
            />
          </el-select>
        </div>
        
        <div class="strategy-info-cards">
          <div class="info-card">
            <div class="icon">
              <el-icon><Histogram /></el-icon>
            </div>
            <div class="content">
              <div class="label">当前收益</div>
              <div class="value">{{ profits }}</div>
            </div>
          </div>
          
          <div class="info-card">
            <div class="icon">
              <el-icon><Timer /></el-icon>
            </div>
            <div class="content">
              <div class="label">运行时间</div>
              <div class="value">{{ runtime }}</div>
            </div>
          </div>
          
          <div class="info-card">
            <div class="icon">
              <el-icon><View /></el-icon>
            </div>
            <div class="content">
              <div class="label">风险评估</div>
              <div class="value">{{ riskLevel }}</div>
            </div>
          </div>
        </div>
      </section>
      
      <!-- 再平衡设置区域 -->
      <section class="config-section">
        <h2 class="section-title">
          <el-icon><SetUp /></el-icon>
          再平衡设置
        </h2>
        
        <div class="rebalance-options">
          <div 
            class="rebalance-card"
            :class="{ active: rebalance.activeRebalancing }"
            @click="rebalance.activeRebalancing = true"
          >
            <div class="rebalance-title">
              <el-icon><Promotion /></el-icon>
              主动调仓
            </div>
            <div class="rebalance-desc">
              系统根据市场变化主动调整持仓比例，优化投资组合。适用于高频交易策略。
            </div>
          </div>
          
          <div 
            class="rebalance-card"
            :class="{ active: !rebalance.activeRebalancing }"
            @click="rebalance.activeRebalancing = false"
          >
            <div class="rebalance-title">
              <el-icon><Refresh /></el-icon>
              被动调仓
            </div>
            <div class="rebalance-desc">
              系统仅在达到预设阈值时调整持仓，保持目标比例。适用于长期投资策略。
            </div>
          </div>
        </div>
        
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">再平衡触发条件</label>
            <el-radio-group 
              v-model="rebalanceConditionType" 
              class="form-control"
            >
              <el-radio :label="'threshold'">阈值触发</el-radio>
              <el-radio :label="'periodic'">定期触发</el-radio>
              <el-radio :label="'both'">阈值+定期</el-radio>
            </el-radio-group>
          </div>
          
          <div class="form-group">
            <label class="form-label">再平衡频率</label>
            <el-select v-model="rebalance.frequency" class="form-control">
              <el-option label="每日" value="daily"></el-option>
              <el-option label="每周" value="weekly"></el-option>
              <el-option label="每月" value="monthly"></el-option>
              <el-option label="每季度" value="quarterly"></el-option>
            </el-select>
          </div>
          
          <div class="form-group">
            <label class="form-label">调仓执行时间</label>
            <el-time-picker 
              v-model="rebalance.executionTime" 
              placeholder="选择时间"
              format="HH:mm"
              value-format="HH:mm"
              class="form-control"
            ></el-time-picker>
          </div>
          
          <div class="form-group">
            <label class="form-label">最大调仓比例: {{ rebalance.maxAdjustmentRate }}%</label>
            <el-slider 
              v-model="rebalance.maxAdjustmentRate" 
              :min="0" 
              :max="100" 
              :step="5"
              show-input
            ></el-slider>
          </div>
        </div>
        
        <div v-if="rebalanceConditionType !== 'periodic'">
          <h3 class="sub-section-title">偏离度阈值设置</h3>
          <div class="threshold-inputs">
            <div class="form-group">
              <label class="form-label">股票偏离阈值</label>
              <el-input 
                v-model="rebalance.stockDeviation" 
                placeholder="输入百分比"
                type="number"
                min="0"
                max="100"
              >
                <template #append>%</template>
              </el-input>
            </div>
            
            <div class="form-group">
              <label class="form-label">债券偏离阈值</label>
              <el-input 
                v-model="rebalance.bondDeviation" 
                placeholder="输入百分比"
                type="number"
                min="0"
                max="100"
              >
                <template #append>%</template>
              </el-input>
            </div>
            
            <div class="form-group">
              <label class="form-label">商品偏离阈值</label>
              <el-input 
                v-model="rebalance.commodityDeviation" 
                placeholder="输入百分比"
                type="number"
                min="0"
                max="100"
              >
                <template #append>%</template>
              </el-input>
            </div>
            
            <div class="form-group">
              <label class="form-label">现金偏离阈值</label>
              <el-input 
                v-model="rebalance.cashDeviation" 
                placeholder="输入百分比"
                type="number"
                min="0"
                max="100"
              >
                <template #append>%</template>
              </el-input>
            </div>
          </div>
        </div>
      </section>
      
      <!-- 策略回测与模拟区域 -->
      <section class="config-section">
        <h2 class="section-title">
          <el-icon><TrendCharts /></el-icon>
          策略回测与模拟
        </h2>
        
        <div class="combined-section">
          <!-- 回测设置 -->
          <div class="backtest-section">
            <h3 class="sub-section-title">
              <el-icon><Histogram /></el-icon> 回测设置
            </h3>
            
            <div class="form-group">
              <label class="form-label">回测时间范围</label>
              <el-date-picker
                v-model="backtestDateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                class="form-control"
              ></el-date-picker>
            </div>
            
            <div class="form-group">
              <label class="form-label">初始资金</label>
              <el-input v-model="initialCapital" placeholder="输入金额">
                <template #prepend>¥</template>
              </el-input>
            </div>
            
            <div class="form-group">
              <label class="form-label">交易费用</label>
              <el-input v-model="transactionFee" placeholder="输入百分比">
                <template #append>%</template>
              </el-input>
            </div>
            
            <div class="form-group">
              <label class="form-label">滑点设置</label>
              <el-input v-model="slippage" placeholder="输入百分比">
                <template #append>%</template>
              </el-input>
            </div>
            
            <div class="backtest-controls">
              <el-button type="primary" @click="runBacktest" icon="VideoPlay">
                执行回测
              </el-button>
              <el-button @click="resetBacktest" icon="Refresh">
                重置参数
              </el-button>
            </div>
          </div>
        </div>
        <!-- 回测结果 -->
        <div class="backtest-results">
          <h3 class="sub-section-title">
            <el-icon><DataAnalysis /></el-icon> 回测结果
          </h3>
          
          <div class="results-container">
            <div class="result-card">
              <div class="result-title">累计收益</div>
              <div class="result-value positive">+{{ backtestResults.cumulativeReturn }}%</div>
            </div>
            
            <div class="result-card">
              <div class="result-title">最大回撤</div>
              <div class="result-value negative">-{{ backtestResults.maxDrawdown }}%</div>
            </div>
            
            <div class="result-card">
              <div class="result-title">夏普比率</div>
              <div class="result-value">{{ backtestResults.sharpeRatio }}</div>
            </div>
            
            <div class="result-card">
              <div class="result-title">交易次数</div>
              <div class="result-value">{{ backtestResults.trades }}</div>
            </div>
          </div>
        </div>
      </section>
    </el-main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import { 
  Check, DataAnalysis, SetUp, TrendCharts, Histogram, 
  Cpu, Promotion, Refresh, Timer, View, VideoPlay, 
  RefreshRight, SwitchButton, Download, DataLine 
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 策略选择
const strategyId1 = ref(1)
const strategies = ref([])
const selectedStrategy = ref('')
const loading = ref(false)
const error = ref(null)

// 策略相关数据
const profits = ref('加载中...')
const runtime = ref('加载中...')
const riskLevel = ref('中')

// 再平衡设置
const rebalance = ref({
  activeRebalancing: true, // 主动/被动调仓
  triggerByThreshold: true, // 阈值触发标志
  triggerByPeriodic: false, // 定期触发标志
  frequency: 'monthly',    // 频率
  executionTime: '09:30',   // 执行时间
  maxAdjustmentRate: 20,    // 最大调仓比例
  // 资产偏离阈值
  stockDeviation: 5,
  bondDeviation: 3,
  commodityDeviation: 7,
  cashDeviation: 2
})
const backtestResults = ref({
  cumulativeReturn: 0.0,
  maxDrawdown: 0.0,
  sharpeRatio: 0.0,
  trades: 0
})
// 回测设置
const backtestDateRange = ref([new Date(2022, 0, 1), new Date(2023, 11, 31)])
const initialCapital = ref('1000000')
const transactionFee = ref('0.15')
const slippage = ref('0.1')

const rebalanceConditionType = computed({
  get() {
    if (rebalance.value.triggerByThreshold && rebalance.value.triggerByPeriodic) return 'both'
    if (rebalance.value.triggerByThreshold) return 'threshold'
    if (rebalance.value.triggerByPeriodic) return 'periodic'
    return 'threshold' // 默认
  },
  set(value) {
    rebalance.value.triggerByThreshold = (value === 'threshold' || value === 'both')
    rebalance.value.triggerByPeriodic = (value === 'periodic' || value === 'both')
  }
})

// 方法定义
const runBacktest = () => {
  ElMessage({
    message: '回测执行中，请稍候...',
    type: 'info',
    duration: 2000
  })
  
  setTimeout(() => {
    // 模拟回测结果
    backtestResults.value = {
      cumulativeReturn: 28.6,
      maxDrawdown: 12.4,
      sharpeRatio: 1.85,
      trades: 248
    }
    
    ElMessage({
      message: '回测完成！',
      type: 'success'
    })
  }, 3000)
}

// 修复：将 watch 中的 loadStrategyDetails 改为 handleStrategyChange
watch(selectedStrategy, (newStrategyId) => {
  if (newStrategyId) {
    handleStrategyChange(newStrategyId)
  }
})

// 加载策略列表
async function loadStrategyList() {
  loading.value = true
  error.value = null
  try {
    const response = await axios.post('/api/strategy-management', {
      id : 1,
      name: 'fu4geliu'
    }, {
      headers: { 'Content-Type': 'application/json' }
    })
    
    strategies.value = response.data.map(item => ({
      id: item.id,
      name: item.name
    }))
    
    // 如果有策略数据，自动选择第一个并加载详情
    if (strategies.value.length > 0) {
      selectedStrategy.value = strategies.value[0].id
    }
  } catch (err) {
    console.error('加载策略列表失败:', err)
    error.value = '无法加载策略列表: ' + (err.response?.data?.message || err.message)
    ElMessage.error(error.value)
  } finally {
    loading.value = false
  }
}

// 加载选定策略的详情
const handleStrategyChange = async (strategyId) => {
  if (!strategyId) return
  strategyId1.value = strategyId
  try {
    loading.value = true
    
    // 同时调用策略详情和再平衡设置两个API
    const [strategyResponse, rebalanceResponse] = await Promise.all([
      axios.post('/api/strategy-monitoring/Metrics', {
        id: strategyId,
        name: 'fu4geliu'
      }, {
        headers: { 'Content-Type': 'application/json' }
      }),
      axios.post('/api/strategy-rebalance/Detail', {
        id: strategyId,
        name: 'fu4geliu'
      }, {
        headers: { 'Content-Type': 'application/json' }
      })
    ])
    
    // 处理策略详情响应
    const strategyData = strategyResponse.data
    profits.value = (strategyData.yearToDatePercentage > 0 ? '+' : '') + 
                    strategyData.yearToDatePercentage.toFixed(1) + '%'
    runtime.value = strategyData.uptimeDays + '天'
    // 直接使用后端返回的风险等级，不做转换
    riskLevel.value = strategyData.riskLevel || '中'
    
    // 处理再平衡设置响应
    const rebalanceData = rebalanceResponse.data
    rebalance.value = {
      activeRebalancing: rebalanceData.activeRebalancing,
      triggerByThreshold: rebalanceData.triggerByThreshold,
      triggerByPeriodic: rebalanceData.triggerByPeriodic,
      frequency: rebalanceData.frequency || 'monthly',
      executionTime: rebalanceData.executionTime?.length === 5 ? 
          rebalanceData.executionTime : 
          rebalanceData.executionTime?.substring(0, 5) || '09:30',
      maxAdjustmentRate: rebalanceData.maxAdjustmentRate || 20,
      stockDeviation: rebalanceData.stockDeviation || 5,
      bondDeviation: rebalanceData.bondDeviation || 3,
      commodityDeviation: rebalanceData.commodityDeviation || 7,
      cashDeviation: rebalanceData.cashDeviation || 2
    }
    
  } catch (err) {
    console.error('加载策略详情失败:', err)
    ElMessage.error('加载策略配置失败: ' + (err.response?.data?.message || err.message))
  } finally {
    loading.value = false
  }
}

const saveConfig = async () => {
  try {
    // 构造请求数据
    const requestData = {
      id: 1,
      activeRebalancing: rebalance.value.activeRebalancing,
      triggerByThreshold: rebalance.value.triggerByThreshold,
      triggerByPeriodic: rebalance.value.triggerByPeriodic,
      frequency: rebalance.value.frequency,
      executionTime: rebalance.value.executionTime,
      maxAdjustmentRate: rebalance.value.maxAdjustmentRate,
      stockDeviation: rebalance.value.stockDeviation,
      bondDeviation: rebalance.value.bondDeviation,
      commodityDeviation: rebalance.value.commodityDeviation,
      cashDeviation: rebalance.value.cashDeviation,
      strategyId:strategyId1.value
    };
    
    // 发送POST请求到后端
    const response = await axios.post('/api/strategy-rebalance/Update', requestData, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    // 检查响应数据
    if (response.data === 1) {
      ElMessage({
        message: '配置已保存成功！',
        type: 'success'
      });
    } else {
      throw new Error('保存配置失败');
    }
  } catch (error) {
    console.error('保存配置时发生错误:', error);
    ElMessage({
      message: '保存配置失败，请重试',
      type: 'error'
    });
  }
};

// 在组件挂载时加载策略列表
onMounted(() => {
  loadStrategyList()
})
</script>


<style scoped>
.config-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f7fa;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.config-header {
  background: #ffffff;
  padding: 0 24px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #ebeef5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
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
  background: #67c23a;
  position: relative;
}

.status-indicator.running {
  box-shadow: 0 0 8px rgba(103, 194, 58, 0.6);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.95); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.8; }
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.config-content {
  flex: 1;
  padding: 20px;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.config-section {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 24px;
  transition: all 0.3s ease;
}

.config-section:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #303133;
}

.sub-section-title {
  font-size: 14px;
  font-weight: 600;
  margin: 20px 0 15px;
  padding-bottom: 10px;
  border-bottom: 1px dashed #ebeef5;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #409eff;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 15px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #606266;
  font-size: 14px;
}

.strategy-info-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.info-card {
  display: flex;
  background: #f9fafc;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  align-items: center;
  gap: 15px;
}

.info-card .icon {
  width: 50px;
  height: 50px;
  background: #ecf5ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.info-card .icon i {
  font-size: 24px;
  color: #409eff;
}

.info-card .content {
  display: flex;
  flex-direction: column;
}

.info-card .label {
  font-size: 12px;
  color: #909399;
}

.info-card .value {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.rebalance-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin: 20px 0;
}

@media (max-width: 768px) {
  .rebalance-options {
    grid-template-columns: 1fr;
  }
}

.rebalance-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #ebeef5;
  cursor: pointer;
  transition: all 0.3s ease;
}

.rebalance-card:hover {
  border-color: #409eff;
}

.rebalance-card.active {
  border-color: #409eff;
  background: #ecf5ff;
}

.rebalance-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #303133;
}

.rebalance-desc {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

.threshold-inputs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.combined-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

@media (max-width: 992px) {
  .combined-section {
    grid-template-columns: 1fr;
  }
}

.backtest-section, .simulation-section {
  background: #f9fafc;
  border-radius: 8px;
  padding: 20px;
}

.backtest-controls {
  display: flex;
  gap: 16px;
  margin-top: 20px;
}

.simulation-controls {
  display: flex;
  gap: 16px;
  margin-top: 20px;
  margin-bottom: 15px;
}

.speed-indicator {
  text-align: center;
  margin-top: 8px;
  color: #606266;
  font-size: 14px;
}

.simulation-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #ecf5ff;
  border-radius: 4px;
  font-size: 14px;
  color: #409eff;
  font-weight: 500;
}

.backtest-results {
  margin-top: 25px;
}

.results-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.result-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border-left: 4px solid #409eff;
}

.result-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.result-value {
  font-size: 24px;
  font-weight: 600;
}

.result-subtext {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.positive {
  color: #67c23a;
}

.negative {
  color: #f56c6c;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.el-button {
  border-radius: 4px;
}

.el-button--primary {
  background: linear-gradient(135deg, #409eff 0%, #337ecc 100%);
  border: none;
}

.el-button--primary:hover {
  opacity: 0.9;
}
</style>