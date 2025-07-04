<template>
  <div class="combo-create-container">
    <el-card>
      <template #header>
        <span>创建自建组合</span>
      </template>

      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="组合名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>

        <el-form-item label="类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择类型">
            <el-option label="FOF" value="FOF" />
            <el-option label="CUSTOM" value="CUSTOM" />
          </el-select>
        </el-form-item>

        <el-form-item label="风险等级" prop="riskLevel">
          <el-select v-model="form.riskLevel" placeholder="请选择风险等级">
            <el-option v-for="n in 5" :key="n" :label="'R' + n" :value="'R' + n" />
          </el-select>
        </el-form-item>

        <el-form-item label="策略" prop="strategy">
          <el-input v-model="form.strategy" />
        </el-form-item>

        <el-form-item label="年化收益(%)" prop="annualizedReturn">
          <el-input-number v-model="form.annualizedReturn" :step="0.01" />
        </el-form-item>

        <el-form-item label="最大回撤(%)" prop="maxDrawdown">
          <el-input-number v-model="form.maxDrawdown" :step="0.01" />
        </el-form-item>

        <el-form-item label="最低投资(元)" prop="minimumInvestment">
          <el-input-number v-model="form.minimumInvestment" />
        </el-form-item>

        <el-form-item label="关联基金" prop="funds">
          <el-select
              v-model="form.funds"
              multiple
              filterable
              placeholder="请选择基金"
          >
            <el-option
                v-for="fund in fundList"
                :key="fund.fundCode"
                :label="`${fund.fundName}（${fund.fundCode}）`"
                :value="fund.fundCode"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitForm">提交</el-button>
          <el-button @click="$router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAllFunds, createCombo } from '@/api/index.js'
import { ElMessage } from 'element-plus'

const router = useRouter()
const formRef = ref(null)

const form = ref({
  name: '',
  type: 'CUSTOM',
  riskLevel: 'R3',
  strategy: '',
  annualizedReturn: 0,
  maxDrawdown: 0,
  minimumInvestment: 1000,
  funds: [],
  isUserCreated: '1'
})

const rules = {
  name: [{ required: true, message: '请输入组合名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  riskLevel: [{ required: true, message: '请选择风险等级', trigger: 'change' }],
  strategy: [{ required: true, message: '请选择策略', trigger: 'change' }],
  funds: [{ type: 'array', required: true, message: '请选择关联基金', trigger: 'change' }]
}

const fundList = ref([])

const loadFunds = async () => {
  try {
    const res = await getAllFunds()
    fundList.value = res.data || res
  } catch (e) {
    console.error('加载基金失败', e)
    ElMessage.error('基金列表加载失败')
  }
}

const submitForm = () => {
  formRef.value.validate(async valid => {
    if (!valid) return

    const payload = {
      ...form.value,
      funds: form.value.funds.map(code => ({ fundCode: code }))
    }

    console.log('即将提交的payload:', payload)  // <-- 这里输出

    try {
      await createCombo(payload)
      ElMessage.success('创建成功')
      router.push('/') // 返回首页或列表页
    } catch (e) {
      console.error('提交失败', e)
      ElMessage.error('提交失败')
    }
  })
}

onMounted(() => {
  loadFunds()
})
</script>

<style scoped>
.combo-create-container {
  padding: 20px;
  max-width: 800px;
  margin: auto;
}
</style>
