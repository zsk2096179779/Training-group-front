<template>
  <div class="style-factor-management">
    <h2 style="margin-bottom: 20px;">风格投资因子管理</h2>
    <!-- 风格投资因子列表 -->
    <el-card style="margin-bottom: 32px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <span style="font-size: 18px; font-weight: bold;">已创建风格投资因子</span>
      </div>
      <el-table :data="styleFactorList" style="width: 100%" v-loading="listLoading">
        <el-table-column prop="name" label="名称" width="180" />
        <el-table-column prop="weights" label="成分因子及权重">
          <template #default="scope">
            <span v-for="(item, idx) in parseWeights(scope.row.weights)" :key="idx">
              {{ getFactorNameById(item.baseFactorId) }}({{ item.weight }}%)<span v-if="idx < parseWeights(scope.row.weights).length - 1">，</span>
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column v-if="isAdminUser" label="操作" width="100">
          <template #default="scope">
            <el-button type="danger" size="small" @click="deleteStyleFactor(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 管理员才显示新建和两步式流程 -->
    <template v-if="isAdminUser">
      <el-steps :active="step" finish-status="success" align-center style="margin-bottom: 24px;">
        <el-step title="选择基础因子" />
        <el-step title="设置权重并创建" />
      </el-steps>

      <div v-if="step === 0" class="step1">
        <el-row>
          <el-col :span="10">
            <h4>可选基础因子</h4>
            <el-select v-model="selectedType" placeholder="选择类型" style="width: 120px; margin-bottom: 10px;">
              <el-option label="全部" value="" />
              <el-option label="普通" value="普通" />
              <el-option label="衍生" value="衍生" />
            </el-select>
            <el-table :data="filteredFactorList" height="400" @selection-change="handleSelectionChange" style="width: 100%">
              <el-table-column type="selection" width="55" />
              <el-table-column prop="name" label="因子名称" />
            </el-table>
          </el-col>
          <el-col :span="2" class="center-col">
            <el-button type="primary" @click="addSelectedFactors" :disabled="selectedFactors.length === 0">添加 &gt;&gt;</el-button>
            <el-button @click="removeSelectedFactors" :disabled="chosenFactors.length === 0" style="margin-top: 10px">&lt;&lt; 移除</el-button>
          </el-col>
          <el-col :span="10">
            <h4>已选因子</h4>
            <el-table :data="chosenFactors" height="400" style="width: 100%">
              <el-table-column prop="name" label="因子名称" />
            </el-table>
          </el-col>
        </el-row>
        <div style="margin-top: 20px; text-align: right">
          <el-button type="primary" @click="nextStep" :disabled="chosenFactors.length === 0">下一步</el-button>
        </div>
      </div>

      <div v-else-if="step === 1" class="step2">
        <div style="margin-bottom: 8px; color: #888;">
          说明：衍生因子的权重总和为100%，默认是等权重，可自行修改
        </div>
        <el-button size="small" @click="autoDistributeWeights" type="primary" plain style="margin-bottom: 8px;">均分权重</el-button>
        <el-table :data="form.weights" style="width: 100%">
          <el-table-column label="编号" width="60">
            <template #default="scope">{{ scope.$index + 1 }}</template>
          </el-table-column>
          <el-table-column prop="name" label="衍生因子名称" />
          <el-table-column label="权重(%)">
            <template #default="scope">
              <el-input-number
                v-model="scope.row.weight"
                :min="0"
                :max="100"
                :step="1"
                size="small"
                style="width: 90px;"
              />
            </template>
          </el-table-column>
        </el-table>
        <el-alert v-if="weightSum !== 100" type="warning" :closable="false" show-icon style="margin-top: 8px;">
          权重总和需为100%，当前为{{ weightSum }}%
        </el-alert>
        <div style="margin-top: 16px; text-align: right">
          <el-button @click="prevStep">上一步</el-button>
          <el-button type="primary" @click="submit" :disabled="!canSubmit">创建风格因子</el-button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import {computed, onMounted, ref} from 'vue'
import {ElMessage} from 'element-plus'
import {factorApi} from '../../api/factor'
import {isAdmin} from '../../utils/auth'

const step = ref(0)
const factorList = ref([]) // 所有基础因子
const selectedFactors = ref([]) // table多选
const chosenFactors = ref([]) // 已选因子

const form = ref({
  name: '',
  weights: [] // [{name, id, weight}]
})

const styleFactorList = ref([]) // 风格投资因子列表
const listLoading = ref(false)

const selectedType = ref('')
const filteredFactorList = computed(() => {
  if (!selectedType.value) return factorList.value
  return factorList.value.filter(f => f.type === selectedType.value)
})

const weightSum = computed(() => form.value.weights.reduce((sum, f) => sum + Number(f.weight || 0), 0))
const canSubmit = computed(() => form.value.name && form.value.weights.length > 0 && weightSum.value === 100)

const isAdminUser = computed(() => isAdmin())

// mock: 本地存储风格投资因子
function loadStyleFactorList() {
  listLoading.value = true
  setTimeout(() => {
    styleFactorList.value = JSON.parse(localStorage.getItem('styleFactorList') || '[]')
    listLoading.value = false
  }, 300)
}
function saveStyleFactorList(list) {
  localStorage.setItem('styleFactorList', JSON.stringify(list))
}
function addStyleFactor(factor) {
  const list = JSON.parse(localStorage.getItem('styleFactorList') || '[]')
  list.unshift({ ...factor, createTime: new Date().toLocaleString() })
  saveStyleFactorList(list)
  loadStyleFactorList()
}
function deleteStyleFactor(row) {
  ElMessage.success('删除成功')
  const list = styleFactorList.value.filter(f => f.name !== row.name)
  saveStyleFactorList(list)
  loadStyleFactorList()
}

onMounted(async () => {
  // 动态加载所有因子
  try {
    const res = await factorApi.getAllFactors()
    factorList.value = res.data || res
  } catch (e) {
    factorList.value = []
    ElMessage.error('加载基础因子失败')
  }
  loadStyleFactorList()
})

function handleSelectionChange(val) {
  selectedFactors.value = val
}
function addSelectedFactors() {
  // 去重添加
  selectedFactors.value.forEach(f => {
    if (!chosenFactors.value.find(cf => cf.id === f.id)) {
      chosenFactors.value.push(f)
    }
  })
  selectedFactors.value = []
}
function removeSelectedFactors() {
  // 移除所有已选
  chosenFactors.value = []
}
function nextStep() {
  // 进入权重分配
  form.value.weights = chosenFactors.value.map(f => ({ ...f, weight: 0 }))
  step.value = 1
}
function prevStep() {
  step.value = 0
}
function submit() {
  // 创建风格投资因子，weights字段为JSON字符串，id字段改为baseFactorId
  const payload = {
    name: form.value.name,
    weights: JSON.stringify(
      form.value.weights.map(w => ({ baseFactorId: w.id, weight: w.weight }))
    )
  }
  addStyleFactor(payload)
  ElMessage.success('风格投资因子创建成功！')
  // 重置
  step.value = 0
  chosenFactors.value = []
  form.value = { name: '', weights: [] }
}
function autoDistributeWeights() {
  const n = form.value.weights.length
  if (n === 0) return
  const avg = Math.floor(100 / n)
  let remain = 100 - avg * n
  form.value.weights.forEach((w, i) => {
    w.weight = avg + (i < remain ? 1 : 0)
  })
}
function parseWeights(weights) {
  if (typeof weights === 'string') {
    try {
      return JSON.parse(weights)
    } catch {
      return []
    }
  }
  return weights || []
}
function getFactorNameById(id) {
  const factor = factorList.value.find(f => String(f.id) === String(id))
  return factor ? factor.name : id
}
</script>

<style scoped>
.style-factor-management {
  padding: 32px;
}
.center-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style> 