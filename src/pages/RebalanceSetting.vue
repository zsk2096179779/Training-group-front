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
          <el-select v-model="selectedStrategy" class="form-control">
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
              <div class="value">+18.6%</div>
            </div>
          </div>
          
          <div class="info-card">
            <div class="icon">
              <el-icon><Timer /></el-icon>
            </div>
            <div class="content">
              <div class="label">运行时间</div>
              <div class="value">32天</div>
            </div>
          </div>
          
          <div class="info-card">
            <div class="icon">
              <el-icon><View /></el-icon>
            </div>
            <div class="content">
              <div class="label">风险评估</div>
              <div class="value">中</div>
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
            :class="{ active: rebalanceType === 'active' }"
            @click="rebalanceType = 'active'"
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
            :class="{ active: rebalanceType === 'passive' }"
            @click="rebalanceType = 'passive'"
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
            <el-radio-group v-model="rebalanceCondition" class="form-control">
              <el-radio label="threshold">阈值触发</el-radio>
              <el-radio label="periodic">定期触发</el-radio>
              <el-radio label="both">阈值+定期</el-radio>
            </el-radio-group>
          </div>
          
          <div class="form-group">
            <label class="form-label">再平衡频率</label>
            <el-select v-model="rebalanceFrequency" class="form-control">
              <el-option label="每日" value="daily"></el-option>
              <el-option label="每周" value="weekly"></el-option>
              <el-option label="每月" value="monthly"></el-option>
              <el-option label="每季度" value="quarterly"></el-option>
            </el-select>
          </div>
          
          <div class="form-group">
            <label class="form-label">调仓执行时间</label>
            <el-time-picker 
              v-model="rebalanceTime" 
              placeholder="选择时间"
              class="form-control"
            ></el-time-picker>
          </div>
          
          <div class="form-group">
            <label class="form-label">最大调仓比例: {{ maxAdjustment }}%</label>
            <el-slider 
              v-model="maxAdjustment" 
              :min="0" 
              :max="100" 
              :step="5"
              show-input
            ></el-slider>
          </div>
        </div>
        
        <div v-if="rebalanceCondition !== 'periodic'">
          <h3 class="sub-section-title">偏离度阈值设置</h3>
          <div class="threshold-inputs">
            <div class="form-group">
              <label class="form-label">股票偏离阈值</label>
              <el-input v-model="thresholds.stock" placeholder="输入百分比">
                <template #append>%</template>
              </el-input>
            </div>
            
            <div class="form-group">
              <label class="form-label">债券偏离阈值</label>
              <el-input v-model="thresholds.bond" placeholder="输入百分比">
                <template #append>%</template>
              </el-input>
            </div>
            
            <div class="form-group">
              <label class="form-label">商品偏离阈值</label>
              <el-input v-model="thresholds.commodity" placeholder="输入百分比">
                <template #append>%</template>
              </el-input>
            </div>
            
            <div class="form-group">
              <label class="form-label">现金偏离阈值</label>
              <el-input v-model="thresholds.cash" placeholder="输入百分比">
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
          
          <!-- 模拟设置 -->
          <div class="simulation-section">
            <h3 class="sub-section-title">
              <el-icon><Cpu /></el-icon> 策略模拟
            </h3>
            
            <div class="form-group">
              <label class="form-label">模拟起始时间</label>
              <el-date-picker
                v-model="simulationStartDate"
                type="date"
                placeholder="选择日期"
                class="form-control"
              ></el-date-picker>
            </div>
            
            <div class="form-group">
              <label class="form-label">模拟资金</label>
              <el-input v-model="simulationCapital" placeholder="输入金额">
                <template #prepend>¥</template>
              </el-input>
            </div>
            
            <div class="form-group">
              <label class="form-label">模拟速度</label>
              <el-slider 
                v-model="simulationSpeed" 
                :min="1" 
                :max="5" 
                :step="1"
                show-stops
              ></el-slider>
              <div class="speed-indicator">
                <span>速度: {{ simulationSpeedText }}</span>
              </div>
            </div>
            
            <div class="simulation-controls">
              <el-button 
                type="primary" 
                @click="startSimulation" 
                :disabled="isSimulating"
                icon="VideoPlay"
              >
                开始模拟
              </el-button>
              <el-button 
                @click="pauseSimulation" 
                :disabled="!isSimulating"
                icon="RefreshRight"
              >
                暂停
              </el-button>
              <el-button 
                @click="stopSimulation" 
                :disabled="!isSimulating"
                icon="SwitchButton"
              >
                停止
              </el-button>
            </div>
            
            <div class="simulation-status" v-if="isSimulating">
              <div class="status-indicator"></div>
              <span>模拟运行中 - 速度: {{ simulationSpeedText }}</span>
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
              <div class="result-value positive">+28.6%</div>
              <div class="result-subtext">年化收益: 15.2%</div>
            </div>
            
            <div class="result-card">
              <div class="result-title">最大回撤</div>
              <div class="result-value negative">-12.4%</div>
              <div class="result-subtext">发生在2023-03-15</div>
            </div>
            
            <div class="result-card">
              <div class="result-title">夏普比率</div>
              <div class="result-value">1.85</div>
              <div class="result-subtext">高于行业平均1.2</div>
            </div>
            
            <div class="result-card">
              <div class="result-title">交易次数</div>
              <div class="result-value">248</div>
              <div class="result-subtext">平均持仓时间: 7.2天</div>
            </div>
          </div>
        </div>
      </section>
      
      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button @click="resetAll" icon="Refresh">
          重置所有设置
        </el-button>
        <el-button type="primary" @click="saveConfig" icon="Download">
          保存配置
        </el-button>
      </div>
    </el-main>
  </div>
</template>

<script>
import { Check, DataAnalysis, SetUp, TrendCharts, Histogram, 
        Cpu, Promotion, Refresh, Timer, View, VideoPlay, 
        RefreshRight, SwitchButton, Download, DataLine } from '@element-plus/icons-vue'

export default {
  components: {
    Check,
    DataAnalysis,
    SetUp,
    TrendCharts,
    Histogram,
    Cpu,
    Promotion,
    Refresh,
    Timer,
    View,
    VideoPlay,
    RefreshRight,
    SwitchButton,
    Download
  },
  data() {
    return {
      // 策略选择
      strategies: [
        { id: 'strategy1', name: '量化多因子' },
        { id: 'strategy2', name: '趋势跟踪' },
        { id: 'strategy3', name: '均值回归' },
        { id: 'strategy4', name: '套利策略' },
        { id: 'strategy5', name: '动量策略' },
        { id: 'strategy6', name: '价值投资' },
      ],
      selectedStrategy: 'strategy1',
      
      // 再平衡设置
      rebalanceType: 'active',
      rebalanceCondition: 'threshold',
      rebalanceFrequency: 'monthly',
      rebalanceTime: '14:30',
      maxAdjustment: 20,
      thresholds: {
        stock: 5,
        bond: 3,
        commodity: 7,
        cash: 2
      },
      
      // 回测设置
      backtestDateRange: [new Date(2022, 0, 1), new Date(2023, 11, 31)],
      initialCapital: '1000000',
      transactionFee: '0.15',
      slippage: '0.1',
      
      // 模拟设置
      simulationStartDate: new Date(),
      simulationCapital: '500000',
      simulationSpeed: 3,
      isSimulating: false
    };
  },
  computed: {
    simulationSpeedText() {
      const speeds = ['极慢', '慢速', '中速', '快速', '极快'];
      return speeds[this.simulationSpeed - 1];
    }
  },
  methods: {
    runBacktest() {
      this.$message({
        message: '回测执行中，请稍候...',
        type: 'info',
        duration: 2000
      });
      
      // 模拟回测执行
      setTimeout(() => {
        this.$message({
          message: '回测完成！',
          type: 'success'
        });
      }, 3000);
    },
    resetBacktest() {
      this.backtestDateRange = [new Date(2022, 0, 1), new Date(2023, 11, 31)];
      this.initialCapital = '1000000';
      this.transactionFee = '0.15';
      this.slippage = '0.1';
      this.$message.info('回测参数已重置');
    },
    startSimulation() {
      this.isSimulating = true;
      this.$message.success('策略模拟已开始');
    },
    pauseSimulation() {
      this.$message.warning('策略模拟已暂停');
    },
    stopSimulation() {
      this.isSimulating = false;
      this.$message.info('策略模拟已停止');
    },
    saveConfig() {
      this.$message({
        message: '配置已保存成功！',
        type: 'success'
      });
    },
    resetAll() {
      this.selectedStrategy = 'strategy1';
      this.rebalanceType = 'active';
      this.rebalanceCondition = 'threshold';
      this.rebalanceFrequency = 'monthly';
      this.rebalanceTime = '14:30';
      this.maxAdjustment = 20;
      this.thresholds = {
        stock: 5,
        bond: 3,
        commodity: 7,
        cash: 2
      };
      this.resetBacktest();
      this.simulationStartDate = new Date();
      this.simulationCapital = '500000';
      this.simulationSpeed = 3;
      this.isSimulating = false;
      
      this.$message.info('所有设置已重置');
    }
  }
};
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