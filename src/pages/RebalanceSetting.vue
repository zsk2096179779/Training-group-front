<template>
  <el-container class="config-container">
    <!-- 头部区域 -->
    <el-header class="config-header">
      <div class="header-left">
        <div class="status-indicator running"></div>
        <span class="header-title">配置管理</span>
      </div>
      <div class="header-controls">
        <el-button type="primary" @click="saveConfig">应用设置</el-button>
      </div>
    </el-header>
    
    <!-- 主内容区域 -->
    <el-main class="config-content">
      <!-- 策略选择区域 -->
      <section class="config-section">
        <h2 class="section-title">
          <i class="el-icon-s-marketing"></i>
          策略选择
        </h2>
        <div class="strategy-selector">
          <div 
            v-for="strategy in strategies" 
            :key="strategy.id"
            class="strategy-card"
            :class="{ active: selectedStrategy === strategy.id }"
            @click="selectedStrategy = strategy.id"
          >
            <div class="strategy-icon">
              <i :class="strategy.icon"></i>
            </div>
            <div class="strategy-name">{{ strategy.name }}</div>
          </div>
        </div>
      </section>
      
      <!-- 再平衡设置区域 -->
      <section class="config-section">
        <h2 class="section-title">
          <i class="el-icon-s-operation"></i>
          再平衡设置
        </h2>
        
        <div class="rebalance-options">
          <div 
            class="rebalance-card"
            :class="{ active: rebalanceType === 'active' }"
            @click="rebalanceType = 'active'"
          >
            <div class="rebalance-title">
              <i class="el-icon-s-promotion"></i>
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
              <i class="el-icon-s-release"></i>
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
            <label class="form-label">最大调仓比例</label>
            <el-slider 
              v-model="maxAdjustment" 
              :min="0" 
              :max="100" 
              :step="5"
              show-input
              input-size="small"
            ></el-slider>
          </div>
        </div>
        
        <div v-if="rebalanceCondition !== 'periodic'">
          <h3 class="form-label">偏离度阈值设置</h3>
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
      
      <!-- 策略回测区域 -->
      <section class="config-section">
        <h2 class="section-title">
          <i class="el-icon-s-data"></i>
          策略回测
        </h2>
        
        <div class="backtest-container">
          <div class="form-grid">
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
          </div>
          
          <div class="backtest-controls">
            <el-button type="primary" @click="runBacktest">执行回测</el-button>
            <el-button @click="resetBacktest">重置参数</el-button>
          </div>
          
          <div class="backtest-chart" ref="backtestChart"></div>
          
          <div class="backtest-results">
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
      
      <!-- 策略模拟区域 -->
      <section class="config-section">
        <h2 class="section-title">
          <i class="el-icon-cpu"></i>
          策略模拟
        </h2>
        
        <div class="form-grid">
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
          </div>
        </div>
        
        <div class="simulation-controls">
          <el-button type="primary" @click="startSimulation">开始模拟</el-button>
          <el-button @click="pauseSimulation" :disabled="!isSimulating">暂停</el-button>
          <el-button @click="stopSimulation" :disabled="!isSimulating">停止</el-button>
          
          <div class="simulation-status" v-if="isSimulating">
            <div class="status-indicator"></div>
            <span>模拟运行中 - 速度: {{ simulationSpeedText }}</span>
          </div>
        </div>
      </section>
      
      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button @click="resetAll">重置所有设置</el-button>
        <el-button type="primary" @click="saveConfig">保存配置</el-button>
      </div>
    </el-main>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      // 策略选择
      strategies: [
        { id: 'strategy1', name: '量化多因子', icon: 'el-icon-s-marketing' },
        { id: 'strategy2', name: '趋势跟踪', icon: 'el-icon-s-opportunity' },
        { id: 'strategy3', name: '均值回归', icon: 'el-icon-s-fold' },
        { id: 'strategy4', name: '套利策略', icon: 'el-icon-s-finance' }
      ],
      selectedStrategy: 'strategy1',
      
      // 再平衡设置
      rebalanceType: 'active',
      rebalanceCondition: 'threshold',
      rebalanceFrequency: 'monthly',
      rebalanceTime: new Date(2023, 0, 1, 14, 30),
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
    },
    startSimulation() {
      this.isSimulating = true;
      this.$message({
        message: '策略模拟已开始',
        type: 'success'
      });
    },
    pauseSimulation() {
      this.$message({
        message: '策略模拟已暂停',
        type: 'warning'
      });
    },
    stopSimulation() {
      this.isSimulating = false;
      this.$message({
        message: '策略模拟已停止',
        type: 'info'
      });
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
      this.rebalanceTime = new Date(2023, 0, 1, 14, 30);
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
      
      this.$message({
        message: '所有设置已重置',
        type: 'info'
      });
    }
  }
};
</script>

<style scoped>
.config-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.config-header {
  background: var(--card-bg);
  padding: 0 24px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-color);
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
  background: var(--primary-blue);
  box-shadow: 0 0 8px rgba(30, 159, 255, 0.6);
}

.status-indicator.running {
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
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 16px;
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
  background: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title i {
  color: var(--primary-blue);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-dark);
}

.form-control {
  width: 100%;
}

.backtest-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.backtest-controls {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.backtest-chart {
  height: 300px;
  background: var(--card-bg);
  border-radius: 8px;
  padding: 16px;
}

.backtest-results {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.result-card {
  background: var(--card-bg);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border-left: 4px solid var(--primary-blue);
}

.result-title {
  font-size: 14px;
  color: var(--text-light);
  margin-bottom: 8px;
}

.result-value {
  font-size: 24px;
  font-weight: 600;
}

.result-subtext {
  font-size: 12px;
  color: var(--text-light);
  margin-top: 4px;
}

.positive {
  color: #52c41a;
}

.negative {
  color: #ff4d4f;
}

.simulation-controls {
  display: flex;
  gap: 16px;
  margin-top: 20px;
}

.simulation-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--light-blue);
  border-radius: 4px;
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--primary-blue);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 0.7; }
  50% { opacity: 1; }
  100% { opacity: 0.7; }
}

.strategy-selector {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.strategy-card {
  background: var(--card-bg);
  border-radius: 8px;
  padding: 16px;
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
}

.strategy-card:hover {
  border-color: var(--primary-blue);
  box-shadow: 0 4px 12px rgba(30, 159, 255, 0.15);
}

.strategy-card.active {
  border-color: var(--primary-blue);
  background: var(--light-blue);
}

.strategy-icon {
  font-size: 24px;
  color: var(--primary-blue);
  margin-bottom: 8px;
}

.strategy-name {
  font-weight: 500;
}

.rebalance-options {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.rebalance-card {
  flex: 1;
  background: var(--card-bg);
  border-radius: 8px;
  padding: 20px;
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.3s;
}

.rebalance-card:hover {
  border-color: var(--primary-blue);
}

.rebalance-card.active {
  border-color: var(--primary-blue);
  background: var(--light-blue);
}

.rebalance-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.rebalance-desc {
  font-size: 14px;
  color: var(--text-light);
  line-height: 1.5;
}

.threshold-inputs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.el-button--primary {
  background: linear-gradient(135deg, var(--primary-blue) 0%, var(--dark-blue) 100%);
  border: none;
}

.el-button--primary:hover {
  opacity: 0.9;
}
</style>