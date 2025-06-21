<script>
import { ref, onMounted } from 'vue'
import { getFunds } from "@/api/index.js";
import { ElMessage, ElTable, ElTableColumn } from "element-plus";

export default {
  components: { ElTable, ElTableColumn },
  setup() {
    const fundData = ref([]) // 使用ref管理响应式数据
    const isLoading = ref(false)
    const errorMsg = ref('')

    const fetchFundData = async (ids = [1, 2, 3]) => {
      isLoading.value = true
      errorMsg.value = ''
      try {
        const response = await getFunds(ids)
        fundData.value = response.data || response // 兼容不同API返回格式
        ElMessage.success('数据加载成功')
      } catch (error) {
        console.error('数据加载失败:', error)
        errorMsg.value = error.message || '请求失败'
        ElMessage.error('基金数据加载失败: ' + error.message)
      } finally {
        isLoading.value = false
      }
    }

    // 添加手动触发测试的函数
    const manualTest = () => {
      fetchFundData({
        "code": 0,
        "data": [14, 16],
        "msg": "success"
      }) // 可修改为动态输入的ID
    }

    onMounted(() => {
      fetchFundData() // 默认加载测试数据
    })

    return {
      fundData,
      isLoading,
      errorMsg,
      manualTest
    }
  }
}
</script>

<template>
  fetch('http://localhost:8080/combos/funds', {
  method: 'POST',
  headers: {
  'Content-Type': 'application/json'
  },
  body: JSON.stringify({ ids: [5,7,1] })
  }).then(res => res.json()).then(data => console.log(data))

</template>

<style scoped>
.test-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.error {
  color: red;
  margin: 10px 0;
}

.test-button {
  margin-top: 20px;
  padding: 10px 15px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.test-button:hover {
  background-color: #66b1ff;
}
</style>