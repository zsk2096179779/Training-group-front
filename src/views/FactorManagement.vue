<template>
  <div class="factor-management">
    <div class="page-header">
      <h2>因子管理系统</h2>
      <div class="header-actions">
        <el-button type="primary" @click="addFactor" icon="el-icon-plus">添加因子</el-button>
      </div>
    </div>
    <el-card class="main-card" v-if="currentTab === 'list'">
      <el-form :inline="true" class="filter-form">
        <el-form-item>
          <el-input v-model="searchQuery" placeholder="搜索因子..." prefix-icon="el-icon-search" @input="handleSearch"/>
        </el-form-item>
        <el-form-item>
          <el-select v-model="selectedCategory" placeholder="所有类别" clearable filterable>
            <el-option v-for="cat in categories" :key="cat" :label="cat" :value="cat"/>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="selectedType" placeholder="所有类型" clearable filterable>
            <el-option label="普通" value="普通"/>
            <el-option label="衍生" value="衍生"/>
          </el-select>
        </el-form-item>
      </el-form>
      <el-table :data="filteredFactors" border stripe style="width: 100%; margin-top: 16px;" height="500">
        <el-table-column prop="id" label="因子ID" width="80"/>
        <el-table-column prop="name" label="因子名称" width="120"/>
        <el-table-column prop="code" label="因子代码" width="120"/>
        <el-table-column prop="category" label="类别" width="120"/>
        <el-table-column prop="type" label="类型" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.type === '衍生'" type="success">衍生</el-tag>
            <el-tag v-else-if="scope.row.type === '普通'" type="info">普通</el-tag>
            <el-tag v-else type="warning">未设置</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述"/>
        <el-table-column label="创建时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.create_time || scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="更新时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.update_time || scope.row.updateTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160">
          <template #default="scope">
            <el-button size="small" @click="editFactor(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteFactor(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 创建衍生因子Tab内容 -->
    <el-card class="derivative-factor-card" v-if="currentTab === 'derivative'">
      <h3>创建衍生因子</h3>
      <el-form :model="derivativeForm" :rules="derivativeRules" ref="derivativeFormRef" label-width="100px">
        <el-form-item label="因子名称" prop="name">
          <el-input v-model="derivativeForm.name" placeholder="请输入因子名称" />
        </el-form-item>
        <el-form-item label="因子描述" prop="description">
          <el-input type="textarea" v-model="derivativeForm.description" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="基础因子" required>
          <div v-for="(item, idx) in derivativeForm.baseFactors" :key="idx" style="display:flex;align-items:center;margin-bottom:8px;">
            <el-select v-model="item.id" placeholder="选择因子" style="width: 180px;" filterable>
              <el-option v-for="f in availableFactors" :key="f.id" :label="f.name" :value="f.id" />
            </el-select>
            <el-input-number v-model="item.weight" :min="0" :max="1" :step="0.01" style="margin:0 8px;" :precision="2" />
            <el-button icon="el-icon-delete" @click="removeBaseFactor(idx)" circle />
          </div>
          <el-button type="text" @click="addBaseFactor" icon="el-icon-plus">添加因子</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitDerivativeFactor">创建因子</el-button>
          <el-button @click="resetDerivativeForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 编辑/添加因子弹窗 -->
    <el-dialog v-model="showDialog" :title="dialogTitle" width="600px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="类型" required>
          <el-select v-model="editForm.type" placeholder="请选择类型">
            <el-option label="普通" value="普通"/>
            <el-option label="衍生" value="衍生"/>
          </el-select>
        </el-form-item>
        <el-form-item label="因子名称"><el-input v-model="editForm.name" /></el-form-item>
        <el-form-item label="因子代码"><el-input v-model="editForm.code" /></el-form-item>
        <el-form-item label="类别"><el-input v-model="editForm.category" /></el-form-item>
        <el-form-item label="描述"><el-input type="textarea" v-model="editForm.description" /></el-form-item>
        <template v-if="editForm.type === '衍生'">
          <el-form-item label="基础因子" required>
            <div class="base-factor-list">
              <el-card
                v-for="(item, idx) in editForm.baseFactors"
                :key="idx"
                class="base-factor-card"
                shadow="hover"
              >
                <div class="base-factor-content">
                  <el-select v-model="item.id" placeholder="选择因子" style="width: 160px;" filterable>
                    <el-option v-for="f in availableFactors" :key="f.id" :label="f.name" :value="f.id" />
                  </el-select>
                  <el-input-number v-model="item.weight" :min="0" :max="1" :step="0.01" :precision="2" style="margin-left: 12px;" />
                  <el-button icon="el-icon-delete" @click="removeBaseFactor(idx)" circle type="danger" style="margin-left: 12px;" />
                </div>
              </el-card>
              <el-button type="primary" @click="addBaseFactor" icon="el-icon-plus" class="add-base-factor-btn">添加基础因子</el-button>
            </div>
          </el-form-item>
        </template>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="saveFactor">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { factorApi } from '../api/factor'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'FactorManagement',
  data() {
    return {
      currentTab: 'list',
      tabs: [
        { id: 'list', name: '因子列表' },
        { id: 'derivative', name: '创建衍生因子' },
        { id: 'style', name: '风格投资因子' }
      ],
      searchQuery: '',
      selectedCategory: '',
      selectedType: '',
      categories: ['技术因子', '基本面因子', '情绪因子', '风格因子'],
      factors: [],
      loading: false,
      showDialog: false,
      dialogTitle: '添加因子',
      editForm: {
        id: null, type: '普通', name: '', code: '', category: '', description: '', baseFactors: []
      },
      // 衍生因子表单
      derivativeForm: {
        name: '',
        description: '',
        baseFactors: [ { id: '', weight: 1 } ]
      },
      derivativeRules: {
        name: [{ required: true, message: '请输入因子名称', trigger: 'blur' }],
      },
      availableFactors: []
    }
  },
  computed: {
    filteredFactors() {
      let result = this.factors
      if (this.searchQuery) {
        result = result.filter(f => f.name.includes(this.searchQuery) || f.code.includes(this.searchQuery))
      }
      if (this.selectedCategory) {
        result = result.filter(f => f.category === this.selectedCategory)
      }
      if (this.selectedType) {
        result = result.filter(f => f.type === this.selectedType)
      }
      return result
    }
  },
  methods: {
    async loadFactors() {
      this.loading = true
      try {
        const data = await factorApi.getAllFactors()
        this.factors = data.data || data
        this.availableFactors = this.factors
      } catch (error) {
        ElMessage.error(`获取因子数据失败: ${error.message || '未知错误'}`)
      } finally {
        this.loading = false
      }
    },
    addFactor() {
      this.dialogTitle = '添加因子'
      this.editForm = { id: null, type: '普通', name: '', code: '', category: '', description: '', baseFactors: [] }
      this.showDialog = true
    },
    editFactor(row) {
      this.dialogTitle = '编辑因子'
      this.editForm = { ...row, baseFactors: row.baseFactors || [] }
      this.showDialog = true
    },
    addBaseFactor() {
      this.editForm.baseFactors.push({ id: '', weight: 1 })
    },
    removeBaseFactor(idx) {
      this.editForm.baseFactors.splice(idx, 1)
    },
    async saveFactor() {
      if (this.editForm.type === '衍生') {
        const totalWeight = this.editForm.baseFactors.reduce((sum, f) => sum + Number(f.weight || 0), 0)
        if (totalWeight > 1) {
          this.$message.error('所有基础因子的权重之和不能超过1')
          return
        }
      }
      if (this.editForm.type === '普通') {
        await factorApi.createFactor({
          name: this.editForm.name,
          code: this.editForm.code,
          category: this.editForm.category,
          description: this.editForm.description,
          type: '普通'
        })
      } else {
        await factorApi.createDerivativeFactor({
          name: this.editForm.name,
          code: this.editForm.code,
          category: this.editForm.category,
          description: this.editForm.description,
          baseFactors: this.editForm.baseFactors,
          type: '衍生'
        })
      }
      this.showDialog = false
      this.loadFactors()
      this.$message.success('保存成功')
    },
    async deleteFactor(row) {
      try {
        await ElMessageBox.confirm('确定要删除该因子吗？', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' })
        await factorApi.deleteFactor(row.id)
        this.loadFactors()
        ElMessage.success('删除成功')
      } catch (e) {
        if (e !== 'cancel') ElMessage.error('删除失败')
      }
    },
    // 衍生因子相关
    resetDerivativeForm() {
      this.derivativeForm = { name: '', description: '', baseFactors: [ { id: '', weight: 1 } ] }
    },
    async submitDerivativeFactor() {
      this.$refs.derivativeFormRef.validate(async (valid) => {
        if (!valid) return
        if (
          this.derivativeForm.baseFactors.length === 0 ||
          this.derivativeForm.baseFactors.some(f => !f.id || f.weight === null)
        ) {
          ElMessage.error('请完整填写基础因子和权重')
          return
        }
        try {
          await factorApi.createDerivativeFactor({
            name: this.derivativeForm.name,
            description: this.derivativeForm.description,
            baseFactors: this.derivativeForm.baseFactors,
            type: '衍生'
          })
          ElMessage.success('创建成功')
          this.resetDerivativeForm()
          this.loadFactors()
        } catch (e) {
          ElMessage.error('创建失败')
        }
      })
    },
    handleSearch() {},
    formatDate(val) {
      if (!val) return '';
      const d = typeof val === 'string' ? new Date(val.replace(/-/g, '/')) : new Date(val);
      if (isNaN(d.getTime())) return val;
      return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0') + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') + ':' + String(d.getSeconds()).padStart(2, '0');
    },
  },
  mounted() {
    this.loadFactors()
  }
}
</script>

<style scoped>
.factor-management {
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
.main-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.filter-form {
  margin-bottom: 0;
}
.derivative-factor-card {
  margin-top: 24px;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.base-factor-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-start;
}
.base-factor-card {
  width: 350px;
  min-height: 60px;
  position: relative;
  display: flex;
  align-items: center;
  padding: 12px 16px;
}
.base-factor-content {
  display: flex;
  align-items: center;
  width: 100%;
}
.add-base-factor-btn {
  height: 40px;
  margin-top: 8px;
}
</style>
