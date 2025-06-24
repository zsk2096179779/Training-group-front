<template>
  <div class="data-source-config-page">
    <header class="page-header">
      <div>
        <h1 class="page-title">数据源配置管理</h1>
        <p class="page-description">在此处管理所有外部数据源的连接配置，并通过配置或脚本方式接入数据。</p>
      </div>
      <el-button type="primary" @click="addConfig" :icon="Plus" size="large">新增数据源</el-button>
    </header>

    <el-card class="box-card" shadow="never">
      <el-table :data="configs" v-loading="loading" style="width: 100%" row-key="id" class="data-source-table">
        <template #empty>
          <div class="table-empty-state">
            <el-empty description="暂无数据源配置">
              <el-button type="primary" @click="addConfig">立即创建第一条配置</el-button>
            </el-empty>
          </div>
        </template>
        
        <el-table-column prop="name" label="配置名称" width="220" />
        <el-table-column prop="type" label="数据库类型" width="130" align="center">
          <template #default="{ row }">
            <el-tag :type="row.type === 'mysql' ? '' : 'success'" effect="light" round>{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="configJson" label="连接详情 (JSON)">
          <template #default="{ row }">
            <pre class="json-display">{{ formatJson(row.configJson) }}</pre>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template #default="{ row }">
            <el-tooltip content="编辑配置" placement="top">
              <el-button link type="primary" :icon="Edit" @click="editConfig(row)" />
            </el-tooltip>
            <el-tooltip content="通过配置导入" placement="top">
              <el-button link type="success" :icon="DataImport" @click="importData(row)" />
            </el-tooltip>
            <el-tooltip content="通过Python脚本导入" placement="top">
              <el-button link type="warning" :icon="DataLine" @click="openScriptDialog(row)" />
            </el-tooltip>
            <el-tooltip content="删除配置" placement="top">
              <el-button link type="danger" :icon="Delete" @click="deleteConfig(row)" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑弹窗 (样式微调) -->
    <el-dialog v-model="showDialog" :title="dialogTitle" width="45%" top="8vh">
      <el-form :model="editForm" label-width="100px" label-position="left">
        <el-form-item label="配置名称">
          <el-input v-model="editForm.name" placeholder="例如：生产环境用户数据库" />
        </el-form-item>
        <el-form-item label="数据库类型">
          <el-select v-model="editForm.type" placeholder="请选择数据库类型" filterable style="width: 100%;">
            <el-option label="MySQL" value="mysql"/>
            <el-option label="PostgreSQL" value="postgres" disabled/>
            <el-option label="Oracle" value="oracle" disabled/>
          </el-select>
        </el-form-item>
        <el-form-item label="连接配置">
           <el-input v-model="editForm.configJson" type="textarea" :rows="8" placeholder='请输入JSON格式的连接信息，例如：&#10;{&#10;  "host": "127.0.0.1",&#10;  "port": 3306,&#10;  "username": "root",&#10;  "password": "your_password",&#10;  "database": "my_db",&#10;  "tableName": "my_table",&#10;  "fieldMapping": { "local_field": "remote_field" }&#10;}'/>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取 消</el-button>
        <el-button type="primary" @click="saveConfig">确 定</el-button>
      </template>
    </el-dialog>

    <!-- 脚本导入弹窗 -->
    <el-dialog v-model="showScriptDialog" :title="`Python脚本导入: ${currentConfigName}`" width="60%" top="5vh">
      <el-alert
        title="后端工作流程提示"
        type="info"
        description="您提交的脚本将在后端服务器上执行。后端会通过命令行参数（如 --host, --user）将此数据源的连接信息安全地传递给您的脚本。"
        :closable="false"
        style="margin-bottom: 20px;"
      />
      <el-form label-position="top">
        <el-form-item label="Python 脚本内容">
          <el-input v-model="scriptContent" type="textarea" :rows="16" placeholder="请在此处编写或粘贴您的 Python 脚本..."/>
        </el-form-item>
        <el-form-item label="执行日志">
          <div class="log-container">
            <pre>{{ scriptLog }}</pre>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showScriptDialog = false">关 闭</el-button>
        <el-button type="primary" @click="runScript" :loading="scriptRunning">
          {{ scriptRunning ? '正在执行...' : '执行脚本' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, DataLine, Finished as DataImport } from '@element-plus/icons-vue'
import { getDataSourceConfigs, createDataSourceConfig, updateDataSourceConfig, deleteDataSourceConfig, importDataSource, runPythonScript } from '@/api/datasource'

const configs = ref([])
const loading = ref(true)
const showDialog = ref(false)
const isEdit = ref(false)
const editForm = ref({})

const scriptDialog = ref(false)
const showScriptDialog = ref(false)
const scriptContent = ref('')
const scriptLog = ref('尚未执行...')
const scriptRunning = ref(false)
const currentConfigId = ref(null)
const currentConfigName = ref('')

const dialogTitle = computed(() => isEdit.value ? '编辑数据源' : '新增数据源')

const initialFormState = {
  id: null,
  name: '',
  type: 'mysql',
  configJson: ''
}

const loadConfigs = async () => {
  loading.value = true
  try {
    const res = await getDataSourceConfigs()
    configs.value = res.data || []
  } finally {
    loading.value = false
  }
}

const addConfig = () => {
  isEdit.value = false
  editForm.value = { ...initialFormState }
  showDialog.value = true
}

const editConfig = (row) => {
  isEdit.value = true
  editForm.value = { ...row }
  showDialog.value = true
}

const saveConfig = async () => {
  try {
    if (isEdit.value) {
      await updateDataSourceConfig(editForm.value)
    } else {
      await createDataSourceConfig(editForm.value)
    }
    showDialog.value = false
    loadConfigs()
    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

const deleteConfig = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除数据源 "${row.name}" 吗？`, '危险操作', { type: 'warning' })
    await deleteDataSourceConfig(row.id)
    loadConfigs()
    ElMessage.success('删除成功')
  } catch(e) { /* Cancelled */ }
}

const importData = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要从 "${row.name}" 通过配置导入数据吗？`, '确认操作', { type: 'info' })
    await importDataSource(row.id)
    ElMessage.success('导入任务已启动')
  } catch(e) { /* Cancelled */ }
}

const openScriptDialog = (row) => {
  currentConfigId.value = row.id;
  currentConfigName.value = row.name;
  scriptContent.value = '# 在此粘贴您的Python脚本';
  scriptLog.value = `准备为数据源 "${row.name}" 执行脚本.`;
  showScriptDialog.value = true
}

const runScript = async () => {
  scriptRunning.value = true
  scriptLog.value = '正在执行脚本...'
  try {
    const res = await runPythonScript({
      id: currentConfigId.value,
      script: scriptContent.value
    })
    scriptLog.value = res.data.log || '执行完成，但未返回日志。'
    ElMessage.success('脚本执行成功！')
  } catch (error) {
    scriptLog.value = `执行失败：\n${error.response?.data?.message || error.message}`
    ElMessage.error('脚本执行失败！')
  } finally {
    scriptRunning.value = false
  }
}

const formatJson = (jsonString) => {
  if (!jsonString) return '{}'
  try {
    return JSON.stringify(JSON.parse(jsonString), null, 2);
  } catch (e) {
    return jsonString; // In case of invalid JSON
  }
}

onMounted(loadConfigs)
</script>

<style scoped>
.data-source-config-page {
  padding: 2rem;
  background-color: #f7f9fc;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.page-description {
  font-size: 0.9rem;
  color: #909399;
  margin-top: 0.5rem;
}

.box-card {
  border: none;
  border-radius: 8px;
}

.data-source-table :deep(.el-table__header-wrapper th) {
  background-color: #fafafa !important;
  font-weight: 600;
  color: #606266;
}

.data-source-table :deep(.el-button.is-link) {
  font-size: 1.2rem;
  margin: 0 0.5rem;
}

.table-empty-state {
  padding: 2rem 0;
}

.json-display {
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 0.8rem;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  font-size: 0.85rem;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 200px;
  overflow-y: auto;
}

.log-container {
  background-color: #1e1e1e;
  color: #d4d4d4;
  padding: 15px;
  border-radius: 6px;
  min-height: 250px;
  max-height: 50vh;
  overflow-y: auto;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  font-size: 14px;
  line-height: 1.6;
}

.log-container pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style> 