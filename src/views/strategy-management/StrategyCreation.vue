<template>
  <div class="strategy-create-container">
    <el-header class="header">
      <h1 class="header-title">策略创建系统</h1>
    </el-header>

    <div class="strategy-types">
      <el-card 
        class="strategy-card" 
        :class="{'active': selectedStrategy === 'asset'}" 
        @click="selectStrategy('asset')"
      >
        <div class="card-header">
          <div class="icon asset">
            <el-icon><Money /></el-icon>
          </div>
          <div class="title">大类资产配置</div>
          <div class="steps-count">4 步创建</div>
        </div>
      </el-card>

      <el-card 
        class="strategy-card" 
        :class="{'active': selectedStrategy === 'fof'}" 
        @click="selectStrategy('fof')"
      >
        <div class="card-header">
          <div class="icon fof">
            <el-icon><DocumentCopy /></el-icon>
          </div>
          <div class="title">FOF 组合管理</div>
          <div class="steps-count">4 步创建</div>
        </div>
      </el-card>

      <el-card 
        class="strategy-card" 
        :class="{'active': selectedStrategy === 'fund'}" 
        @click="selectStrategy('fund')"
      >
        <div class="card-header">
          <div class="icon fund">
            <el-icon><DataAnalysis /></el-icon>
          </div>
          <div class="title">基金指数组合</div>
          <div class="steps-count">4 步创建</div>
        </div>
      </el-card>

      <el-card 
        class="strategy-card" 
        :class="{'active': selectedStrategy === 'timing'}" 
        @click="selectStrategy('timing')"
      >
        <div class="card-header">
          <div class="icon timing">
            <el-icon><AlarmClock /></el-icon>
          </div>
          <div class="title">择时组合</div>
          <div class="steps-count">3 步创建</div>
        </div>
      </el-card>
    </div>

    <el-card class="creation-panel">
      <template v-if="selectedStrategy">
        <div class="creation-header">
          <h2 class="creation-title">{{ currentStrategyTitle }}</h2>
        </div>
        
        <div class="steps-nav">
          <div 
            v-for="(step, index) in currentSteps" 
            :key="index" 
            class="step" 
            :class="{'active': currentStep === index + 1}"
            @click="changeStep(index + 1)"
          >
            步骤 {{ index + 1 }}: {{ step.title }}
          </div>
        </div>
        
        <div class="step-content">
          <!-- 大类资产配置策略步骤 -->
          <template v-if="selectedStrategy === 'asset'">
            <div v-if="currentStep === 1" class="strategy-form-item">
              <div class="form-title">
                <el-icon><Setting /></el-icon> 选择资产类别
              </div>
              <p>选择您希望包含在投资组合中的资产类别</p>
              <el-checkbox-group v-model="formAsset.assetClasses" class="checkbox-group">
                <el-checkbox label="股票">股票</el-checkbox>
                <el-checkbox label="债券">债券</el-checkbox>
                <el-checkbox label="商品">商品</el-checkbox>
                <el-checkbox label="房地产">房地产</el-checkbox>
                <el-checkbox label="现金">现金</el-checkbox>
              </el-checkbox-group>
            </div>
            
            <div v-if="currentStep === 2" class="strategy-form-item">
              <div class="form-title">
                <el-icon><Coin /></el-icon> 设置风险偏好
              </div>
              <p>请根据您的风险承受能力选择风险偏好级别</p>
              <el-radio-group v-model="formAsset.riskLevel" class="radio-group">
                <el-radio :label="1">保守型</el-radio>
                <el-radio :label="2">稳健型</el-radio>
                <el-radio :label="3">平衡型</el-radio>
                <el-radio :label="4">进取型</el-radio>
                <el-radio :label="5">激进型</el-radio>
              </el-radio-group>
            </div>
            
            <div v-if="currentStep === 3" class="strategy-form-item">
              <div class="form-title">
                <el-icon><SetUp /></el-icon> 调整资产配置比例
              </div>
              <p>基于您的选择和风险偏好，推荐以下配置比例，您可以进行微调</p>
              <div class="asset-distribution">
                <div v-for="(asset, index) in formAsset.assets" :key="index" class="asset-item">
                  <div class="asset-name">{{ asset.name }}</div>
                  <div class="asset-percent">{{ asset.percent }}%</div>
                  <el-input-number 
                    v-model="asset.percent" 
                    :min="0" 
                    :max="100"
                    controls-position="right"
                    class="asset-percent-input"
                  />
                </div>
              </div>
            </div>
            
            <div v-if="currentStep === 4" class="strategy-form-item">
              <div class="form-title">
                <el-icon><DocumentChecked /></el-icon> 策略回顾与确认
              </div>
              <p>请检查您的策略配置：</p>
              <el-descriptions :column="1" border class="summary">
                <el-descriptions-item label="策略类型">大类资产配置</el-descriptions-item>
                <el-descriptions-item label="风险级别">{{ getRiskLabel(formAsset.riskLevel) }}</el-descriptions-item>
                <el-descriptions-item label="资产配置比例">
                  <div v-for="(asset, index) in formAsset.assets" :key="index" class="asset-summary">
                    {{ asset.name }}: {{ asset.percent }}%
                  </div>
                </el-descriptions-item>
              </el-descriptions>
              <el-checkbox v-model="formAsset.confirmed" class="confirmation-checkbox">
                我已确认以上配置信息
              </el-checkbox>
            </div>
          </template>
          
          <!-- FOF组合创建步骤 -->
          <template v-else-if="selectedStrategy === 'fof'">
            <div v-if="currentStep === 1" class="strategy-form-item">
              <div class="form-title">
                <el-icon><Document /></el-icon> 选择FOF组合类型
              </div>
              <p>请选择适合您需求的FOF组合类型</p>
              <el-radio-group v-model="formFOF.fofType" class="radio-group">
                <el-radio label="balanced">平衡型FOF组合</el-radio>
                <el-radio label="steady">稳健型FOF组合</el-radio>
                <el-radio label="growth">增长型FOF组合</el-radio>
                <el-radio label="fixedIncome">固定收益型FOF组合</el-radio>
                <el-radio label="global">全球配置FOF组合</el-radio>
              </el-radio-group>
            </div>
            
            <div v-if="currentStep === 2" class="strategy-form-item">
              <div class="form-title">
                <el-icon><SetUp /></el-icon> 设置FOF组合参数
              </div>
              <el-form label-width="120px">
                <el-form-item label="基金数量">
                  <el-input-number v-model="formFOF.fundCount" :min="4" :max="20" />
                </el-form-item>
                <el-form-item label="最大回撤控制">
                  <el-slider v-model="formFOF.maxDrawdown" :min="1" :max="30" show-input />
                </el-form-item>
                <el-form-item label="风险控制级别">
                  <el-rate v-model="formFOF.riskControl" show-text :texts="['低', '较低', '中', '较高', '高']" />
                </el-form-item>
              </el-form>
            </div>
            
            <div v-if="currentStep === 3" class="strategy-form-item">
              <div class="form-title">
                <el-icon><FolderChecked /></el-icon> 选择基金类别
              </div>
              <p>选择您希望包含在FOF组合中的基金类别</p>
              <el-checkbox-group v-model="formFOF.fundCategories" class="checkbox-group">
                <el-checkbox label="股票型">股票型基金</el-checkbox>
                <el-checkbox label="债券型">债券型基金</el-checkbox>
                <el-checkbox label="混合型">混合型基金</el-checkbox>
                <el-checkbox label="指数型">指数型基金</el-checkbox>
                <el-checkbox label="QDII">QDII基金</el-checkbox>
              </el-checkbox-group>
            </div>
            
            <div v-if="currentStep === 4" class="strategy-form-item">
              <div class="form-title">
                <el-icon><DocumentChecked /></el-icon> 策略回顾与确认
              </div>
              <p>请检查您的FOF组合策略配置:</p>
              <el-descriptions :column="1" border class="summary">
                <el-descriptions-item label="策略类型">FOF组合管理</el-descriptions-item>
                <el-descriptions-item label="FOF组合类型">{{ getFOFTypeLabel(formFOF.fofType) }}</el-descriptions-item>
                <el-descriptions-item label="基金数量">{{ formFOF.fundCount }}只</el-descriptions-item>
                <el-descriptions-item label="最大回撤控制">{{ formFOF.maxDrawdown }}%</el-descriptions-item>
                <el-descriptions-item label="基金类别">
                  {{ formFOF.fundCategories.join(', ') }}
                </el-descriptions-item>
              </el-descriptions>
              <el-checkbox v-model="formFOF.confirmed" class="confirmation-checkbox">
                我已确认以上配置信息
              </el-checkbox>
            </div>
          </template>
          
          <!-- 基金指数组合创建步骤 -->
          <template v-else-if="selectedStrategy === 'fund'">
            <div v-if="currentStep === 1" class="strategy-form-item">
              <div class="form-title">
                <el-icon><PieChart /></el-icon> 选择目标指数
              </div>
              <p>请选择您希望跟踪的市场指数</p>
              <el-select v-model="formFund.targetIndex" placeholder="请选择指数" class="full-width-select">
                <el-option label="沪深300指数" value="hs300" />
                <el-option label="中证500指数" value="zz500" />
                <el-option label="上证50指数" value="sz50" />
                <el-option label="创业板指数" value="cyb" />
                <el-option label="纳斯达克100指数" value="nasdaq100" />
                <el-option label="恒生指数" value="hsi" />
              </el-select>
            </div>
            
            <div v-if="currentStep === 2" class="strategy-form-item">
              <div class="form-title">
                <el-icon><Folder /></el-icon> 选择指数基金
              </div>
              <p>系统根据您选择的目标指数推荐以下基金</p>
              <el-table :data="recommendedFunds" border class="funds-table">
                <el-table-column type="selection" width="55" />
                <el-table-column prop="code" label="基金代码" width="120" />
                <el-table-column prop="name" label="基金名称" width="200" />
                <el-table-column prop="company" label="基金公司" />
                <el-table-column prop="fee" label="费率" width="100" />
              </el-table>
            </div>
            
            <div v-if="currentStep === 3" class="strategy-form-item">
              <div class="form-title">
                <el-icon><Money /></el-icon> 设置资金分配
              </div>
              <p>请设置投资金额以及分配比例</p>
              <el-form label-width="100px">
                <el-form-item label="总投资额">
                  <el-input-number 
                    v-model="formFund.totalAmount" 
                    :min="1000" 
                    :step="1000" 
                    controls-position="right" 
                    class="full-width-input" 
                  />
                </el-form-item>
                <el-form-item label="分配比例">
                  <el-radio-group v-model="formFund.allocation">
                    <el-radio label="equal">等权重分配</el-radio>
                    <el-radio label="optimized">优化权重分配</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-form>
            </div>
            
            <div v-if="currentStep === 4" class="strategy-form-item">
              <div class="form-title">
                <el-icon><DocumentChecked /></el-icon> 策略回顾与确认
              </div>
              <p>请检查您的基金指数组合配置：</p>
              <el-descriptions :column="1" border class="summary">
                <el-descriptions-item label="策略类型">基金指数组合</el-descriptions-item>
                <el-descriptions-item label="目标指数">{{ getIndexLabel(formFund.targetIndex) }}</el-descriptions-item>
                <el-descriptions-item label="总投资额">¥{{ formFund.totalAmount.toLocaleString() }}</el-descriptions-item>
                <el-descriptions-item label="分配方式">
                  {{ formFund.allocation === 'equal' ? '等权重分配' : '优化权重分配' }}
                </el-descriptions-item>
                <el-descriptions-item label="选择基金">
                  <div v-for="(fund, index) in recommendedFunds" :key="index" class="fund-summary">
                    {{ fund.name }} ({{ fund.code }})
                  </div>
                </el-descriptions-item>
              </el-descriptions>
              <el-checkbox v-model="formFund.confirmed" class="confirmation-checkbox">
                我已确认以上配置信息
              </el-checkbox>
            </div>
          </template>
          
          <!-- 择时组合创建步骤 -->
          <template v-else-if="selectedStrategy === 'timing'">
            <div v-if="currentStep === 1" class="strategy-form-item">
              <div class="form-title">
                <el-icon><Clock /></el-icon> 选择择时指标
              </div>
              <p>请选择您用于择时判断的技术指标</p>
              <el-checkbox-group v-model="formTiming.indicators" class="checkbox-group">
                <el-checkbox label="MACD">MACD指标</el-checkbox>
                <el-checkbox label="RSI">相对强弱指数(RSI)</el-checkbox>
                <el-checkbox label="BOLL">布林线(BOLL)</el-checkbox>
                <el-checkbox label="MA">移动平均线(MA)</el-checkbox>
                <el-checkbox label="KDJ">随机指标(KDJ)</el-checkbox>
              </el-checkbox-group>
            </div>
            
            <div v-if="currentStep === 2" class="strategy-form-item">
              <div class="form-title">
                <el-icon><SetUp /></el-icon> 设置交易规则
              </div>
              <el-form label-width="140px">
                <el-form-item label="买入阈值">
                  <el-input-number v-model="formTiming.buyThreshold" :min="0" :max="100" />
                </el-form-item>
                <el-form-item label="卖出阈值">
                  <el-input-number v-model="formTiming.sellThreshold" :min="0" :max="100" />
                </el-form-item>
                <el-form-item label="最大持仓比例">
                  <el-slider v-model="formTiming.maxPosition" :min="10" :max="100" show-input />
                </el-form-item>
                <el-form-item label="交易频率">
                  <el-radio-group v-model="formTiming.tradeFrequency">
                    <el-radio label="daily">日交易</el-radio>
                    <el-radio label="weekly">周交易</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-form>
            </div>
            
            <div v-if="currentStep === 3" class="strategy-form-item">
              <div class="form-title">
                <el-icon><DocumentChecked /></el-icon> 策略回顾与确认
              </div>
              <p>请检查您的择时策略配置：</p>
              <el-descriptions :column="1" border class="summary">
                <el-descriptions-item label="策略类型">择时组合</el-descriptions-item>
                <el-descriptions-item label="择时指标">
                  {{ formTiming.indicators.join(', ') }}
                </el-descriptions-item>
                <el-descriptions-item label="买入阈值">{{ formTiming.buyThreshold }}%</el-descriptions-item>
                <el-descriptions-item label="卖出阈值">{{ formTiming.sellThreshold }}%</el-descriptions-item>
                <el-descriptions-item label="最大持仓比例">{{ formTiming.maxPosition }}%</el-descriptions-item>
                <el-descriptions-item label="交易频率">
                  {{ formTiming.tradeFrequency === 'daily' ? '每日交易' : '每周交易' }}
                </el-descriptions-item>
              </el-descriptions>
              <el-checkbox v-model="formTiming.confirmed" class="confirmation-checkbox">
                我已确认以上配置信息
              </el-checkbox>
            </div>
          </template>
        </div>
        
        <div class="step-controls">
          <el-button v-if="currentStep > 1" class="back-btn" @click="prevStep">
            上一步
          </el-button>
          <div v-else></div>
          
          <el-button 
            v-if="currentStep < currentSteps.length" 
            type="primary" 
            @click="nextStep"
          >
            下一步
          </el-button>
          <el-button 
            v-else 
            type="success" 
            @click="finishCreation"
          >
            完成创建
          </el-button>
        </div>
      </template>
      
      <template v-else>
        <div class="empty-state">
          <el-empty description="请选择要创建的策略类型" />
          <p>点击上方策略卡片开始创建您的投资策略</p>
        </div>
      </template>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { 
  Money, DocumentCopy, DataAnalysis, AlarmClock,
  Setting, Coin, SetUp, DocumentChecked,
  Document, FolderChecked, PieChart, Folder,
  Clock
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox,ElLoading} from 'element-plus';
import {createStrategy} from "@/api/strategy";

const router = useRouter();


// 策略选择状态
const selectedStrategy = ref('');
const currentStep = ref(1);

// 策略标题映射
const strategyTitles = {
  'asset': '大类资产配置策略',
  'fof': 'FOF组合策略',
  'fund': '基金指数组合策略',
  'timing': '择时组合策略'
};

// 策略步骤配置
const strategySteps = {
  'asset': [
    { title: '选择资产类别' },
    { title: '设置风险偏好' },
    { title: '配置比例调整' },
    { title: '完成策略创建' }
  ],
  'fof': [
    { title: '选择FOF类型' },
    { title: '设置参数' },
    { title: '选择基金类别' },
    { title: '完成策略创建' }
  ],
  'fund': [
    { title: '选择目标指数' },
    { title: '选择指数基金' },
    { title: '设置资金分配' },
    { title: '完成策略创建' }
  ],
  'timing': [
    { title: '选择择时指标' },
    { title: '设置交易规则' },
    { title: '完成策略创建' }
  ]
};

// 当前策略的步骤
const currentSteps = computed(() => {
  return selectedStrategy.value ? strategySteps[selectedStrategy.value] : [];
});

// 当前策略标题
const currentStrategyTitle = computed(() => {
  return selectedStrategy.value ? strategyTitles[selectedStrategy.value] : '';
});

// 策略类型选择
const selectStrategy = (type) => {
  selectedStrategy.value = type;
  currentStep.value = 1;
};

// 步骤导航
const nextStep = () => {
  if (currentStep.value < currentSteps.value.length) {
    currentStep.value++;
  }
};

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

const changeStep = (step) => {
  if (step > 0 && step <= currentSteps.value.length) {
    currentStep.value = step;
  }
};

// 完成创建
const finishCreation = async () => {
  // 根据当前策略类型检查确认状态
  let confirmed = false;
  
  switch (selectedStrategy.value) {
    case 'asset':
      confirmed = formAsset.confirmed;
      break;
    case 'fof':
      confirmed = formFOF.confirmed;
      break;
    case 'fund':
      confirmed = formFund.confirmed;
      break;
    case 'timing':
      confirmed = formTiming.confirmed;
      break;
  }
  
  if (!confirmed) {
    ElMessage.warning('请先确认策略配置信息');
    return;
  }
  try {
    const username = localStorage.getItem('username')

    // 显示输入策略名称的对话框
    const { value: strategyName } = await ElMessageBox.prompt('请输入策略名称', '策略命名', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /^[\u4e00-\u9fa5a-zA-Z0-9]{2,20}$/,
      inputErrorMessage: '策略名称需为2-20个字符(中英文/数字)'
    });

    // 根据不同策略类型准备不同的数据
    const requestData = {
      id: 0,
      name: strategyName,
      username :username,
    };

    // 添加特定策略的数据
    switch (selectedStrategy.value) {
      case 'asset':
        requestData.assets = formAsset.assets;
        requestData.riskLevel = formAsset.riskLevel;
        requestData.id=1;
        break;
      case 'fof':
        requestData.fofType = formFOF.fofType;
        requestData.fundCount = formFOF.fundCount;
        requestData.maxDrawdown = formFOF.maxDrawdown;
        requestData.fundCategories = formFOF.fundCategories;
        requestData.id=2;
        break;
      case 'fund':
        requestData.targetIndex = formFund.targetIndex;
        requestData.totalAmount = formFund.totalAmount;
        requestData.allocation = formFund.allocation;
        requestData.selectedFunds = recommendedFunds.value; // 或者用户实际选择的基金
        requestData.id=3;
        break;
      case 'timing':
        requestData.indicators = formTiming.indicators;
        requestData.buyThreshold = formTiming.buyThreshold;
        requestData.sellThreshold = formTiming.sellThreshold;
        requestData.maxPosition = formTiming.maxPosition;
        requestData.tradeFrequency = formTiming.tradeFrequency;
        requestData.id=4;
        break;
    }
    console.log(requestData);
    // 发送请求到后端
    const loading = ElLoading.service({ fullscreen: true, text: '正在创建策略...' });
    try {
      const response = await createStrategy(requestData);
      console.log('Response:',response);
      console.log('responsedata',response.data);
      
      if (response || response.data.success) {
        ElMessage.success(`策略 "${strategyName}" 创建成功！`);
        resetForms();
        selectedStrategy.value = '';
        currentStep.value = 1;
      } else {
        ElMessage.error(`创建失败: ${response.data.message || '未知错误'}`);
      }
    } finally {
      loading.close();
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('创建策略失败:', error);
      ElMessage.error('创建失败: ' + (error.response?.data?.message || error.message || '未知错误'));
    }
  }
};

// 重置所有表单的函数
const resetForms = () => {
  // 重置资产配置表单
  formAsset.assetClasses = ['股票', '债券'];
  formAsset.riskLevel = 3;
  formAsset.assets = [
    { name: '股票', percent: 50 },
    { name: '债券', percent: 30 },
    { name: '商品', percent: 10 },
    { name: '房地产', percent: 10 }
  ];
  formAsset.confirmed = false;
  
  // 重置FOF表单
  formFOF.fofType = 'balanced';
  formFOF.fundCount = 8;
  formFOF.maxDrawdown = 15;
  formFOF.riskControl = 3;
  formFOF.fundCategories = ['股票型', '债券型'];
  formFOF.confirmed = false;
  
  // 重置基金指数表单
  formFund.targetIndex = 'hs300';
  formFund.totalAmount = 50000;
  formFund.allocation = 'equal';
  formFund.confirmed = false;
  
  // 重置择时策略表单
  formTiming.indicators = ['MACD', 'RSI'];
  formTiming.buyThreshold = 30;
  formTiming.sellThreshold = 70;
  formTiming.maxPosition = 80;
  formTiming.tradeFrequency = 'daily';
  formTiming.confirmed = false;
};

// 表单数据
const formAsset = reactive({
  assetClasses: ['股票', '债券'],
  riskLevel: 3,
  assets: [
    { name: '股票', percent: 50 },
    { name: '债券', percent: 30 },
    { name: '商品', percent: 10 },
    { name: '房地产', percent: 10 }
  ],
  confirmed: false
});

const formFOF = reactive({
  fofType: 'balanced',
  fundCount: 8,
  maxDrawdown: 15,
  riskControl: 3,
  fundCategories: ['股票型', '债券型'],
  confirmed: false
});

const formFund = reactive({
  targetIndex: 'hs300',
  totalAmount: 50000,
  allocation: 'equal',
  confirmed: false
});

const recommendedFunds = ref([
  { code: '510300', name: '华泰柏瑞沪深300ETF', company: '华泰柏瑞基金', fee: '0.6%' },
  { code: '000961', name: '天弘沪深300指数A', company: '天弘基金', fee: '0.8%' },
  { code: '110020', name: '易方达沪深300ETF联接A', company: '易方达基金', fee: '0.6%' }
]);

const formTiming = reactive({
  indicators: ['MACD', 'RSI'],
  buyThreshold: 30,
  sellThreshold: 70,
  maxPosition: 80,
  tradeFrequency: 'daily',
  confirmed: false
});

// 辅助方法
const getRiskLabel = (level) => {
  const levels = {
    1: '保守型',
    2: '稳健型',
    3: '平衡型',
    4: '进取型',
    5: '激进型'
  };
  return levels[level] || '未设置';
};

const getFOFTypeLabel = (type) => {
  const types = {
    'balanced': '平衡型FOF组合',
    'steady': '稳健型FOF组合',
    'growth': '增长型FOF组合',
    'fixedIncome': '固定收益型FOF组合',
    'global': '全球配置FOF组合'
  };
  return types[type] || '未设置';
};

const getIndexLabel = (index) => {
  const indexes = {
    'hs300': '沪深300指数',
    'zz500': '中证500指数',
    'sz50': '上证50指数',
    'cyb': '创业板指数',
    'nasdaq100': '纳斯达克100指数',
    'hsi': '恒生指数'
  };
  return indexes[index] || '未设置';
};
</script>

<style scoped>
.strategy-create-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f7fa;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.header-title {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
}

.actions {
  display: flex;
  gap: 10px;
}

.strategy-types {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.strategy-card {
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  height: 110px;
}

.strategy-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.strategy-card.active {
  border: 2px solid #409eff;
}

.card-header {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #eaeaea;
}

.icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.icon.asset {
  background-color: #f0f9eb;
  color: #67c23a;
}

.icon.fof {
  background-color: #e6f7ff;
  color: #1890ff;
}

.icon.fund {
  background-color: #f9f0ff;
  color: #722ed1;
}

.icon.timing {
  background-color: #fff2e8;
  color: #fa8c16;
}

.title {
  font-size: 16px;
  font-weight: 600;
  flex-grow: 1;
}

.steps-count {
  font-size: 12px;
  color: #909399;
  background: #f5f7fa;
  padding: 4px 8px;
  border-radius: 12px;
}

.card-content {
  padding: 15px;
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}

.creation-panel {
  flex: 2;
  border-radius: 8px;
  overflow: auto;
}

.creation-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eaeaea;
}

.creation-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.steps-nav {
  display: flex;
  padding: 0 20px;
  border-bottom: 1px solid #eaeaea;
}

.step {
  flex: 1;
  text-align: center;
  padding: 12px 0;
  color: #606266;
  cursor: pointer;
  position: relative;
}

.step.active {
  color: #409eff;
  font-weight: 500;
}

.step.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: #409eff;
}

.step-content {
  padding: 20px;
  height: calc(100% - 160px);
  overflow-y: auto;
}

.strategy-form-item {
  margin-bottom: 20px;
}

.form-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
}

.form-title .el-icon {
  margin-right: 8px;
  font-size: 18px;
}

.checkbox-group {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.radio-group {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.asset-distribution {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 15px;
  margin-top: 20px;
}

.asset-item {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 12px;
  background: #f9f9f9;
  text-align: center;
}

.asset-name {
  font-weight: 500;
}

.asset-percent {
  font-size: 18px;
  font-weight: bold;
  margin: 8px 0;
  color: #409eff;
}

.summary {
  margin-top: 15px;
}

.asset-summary,
.fund-summary {
  padding: 4px 0;
}

.confirmation-checkbox {
  margin-top: 20px;
  display: block;
}

.full-width-select {
  width: 100%;
  margin-top: 12px;
}

.full-width-input {
  width: 100%;
}

.funds-table {
  margin-top: 12px;
}

.step-controls {
  display: flex;
  justify-content: space-between;
  padding: 15px 20px;
  border-top: 1px solid #eaeaea;
}

.back-btn {
  margin-right: auto;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #909399;
}

.empty-state p {
  margin-top: 15px;
}
</style>