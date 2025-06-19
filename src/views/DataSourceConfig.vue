<template>
  <div class="data-source-config">
    <div class="page-header">
      <h2>数据源配置管理</h2>
      <el-button type="primary" @click="addConfig" icon="el-icon-plus">新增数据源</el-button>
    </div>
    <el-card>
      <el-table :data="configs" border stripe>
        <el-table-column prop="name" label="名称" width="120"/>
        <el-table-column prop="type" label="类型" width="100"/>
        <el-table-column prop="host" label="主机" width="120"/>
        <el-table-column prop="port" label="端口" width="80"/>
        <el-table-column prop="database" label="数据库" width="120"/>
        <el-table-column prop="tableName" label="表名" width="120"/>
        <el-table-column prop="fieldMapping" label="字段映射"/>
        <el-table-column label="操作" width="220">
          <template #default="scope">
            <el-button size="small" @click="editConfig(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteConfig(scope.row)">删除</el-button>
            <el-button size="small" type="success" @click="importData(scope.row)">导入</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="showDialog" :title="dialogTitle" width="600px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="名称"><el-input v-model="editForm.name" /></el-form-item>
        <el-form-item label="类型">
          <el-select v-model="editForm.type" filterable>
            <el-option label="MySQL" value="mysql"/>
          </el-select>
        </el-form-item>
        <el-form-item label="主机"><el-input v-model="editForm.host" /></el-form-item>
        <el-form-item label="端口"><el-input v-model="editForm.port" /></el-form-item>
        <el-form-item label="数据库"><el-input v-model="editForm.database" /></el-form-item>
        <el-form-item label="用户名"><el-input v-model="editForm.username" /></el-form-item>
        <el-form-item label="密码"><el-input v-model="editForm.password" type="password" /></el-form-item>
        <el-form-item label="表名"><el-input v-model="editForm.tableName" /></el-form-item>
        <el-form-item label="字段映射">
          <el-input v-model="editForm.fieldMapping" placeholder="如：本地字段1:外部字段A,本地字段2:外部字段B"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="saveConfig">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getDataSourceConfigs, createDataSourceConfig, updateDataSourceConfig, deleteDataSourceConfig, importDataSource } from '@/api/datasource'

const configs = ref([])
const showDialog = ref(false)
const dialogTitle = ref('新增数据源')
const editForm = ref({
  id: null, name: '', type: '', host: '', port: '', database: '', username: '', password: '', tableName: '', fieldMapping: ''
})

const loadConfigs = async () => {
  const res = await getDataSourceConfigs()
  configs.value = res.data
}

const addConfig = () => {
  dialogTitle.value = '新增数据源'
  editForm.value = { id: null, name: '', type: '', host: '', port: '', database: '', username: '', password: '', tableName: '', fieldMapping: '' }
  showDialog.value = true
}
const editConfig = (row) => {
  dialogTitle.value = '编辑数据源'
  editForm.value = { ...row }
  showDialog.value = true
}
const saveConfig = async () => {
  if (editForm.value.id) {
    await updateDataSourceConfig(editForm.value)
  } else {
    await createDataSourceConfig(editForm.value)
  }
  showDialog.value = false
  loadConfigs()
  ElMessage.success('保存成功')
}
const deleteConfig = async (row) => {
  await ElMessageBox.confirm('确定要删除该数据源吗？', '提示', { type: 'warning' })
  await deleteDataSourceConfig(row.id)
  loadConfigs()
  ElMessage.success('删除成功')
}
const importData = async (row) => {
  await importDataSource(row.id)
  ElMessage.success('导入成功')
}

onMounted(loadConfigs)
</script>

<style scoped>
.data-source-config {
  background: #f4f6fa;
  min-height: 100vh;
  padding: 32px;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
</style> 