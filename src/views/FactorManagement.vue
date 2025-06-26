<template>
  <div class="factor-management">
    <div class="page-header">
      <h2>因子管理系统</h2>
      <div class="header-actions">
        <el-button v-if="isAdminUser" type="primary" @click="addFactor" icon="el-icon-plus">添加因子</el-button>
      </div>
    </div>
    <!-- Tab切换区 -->
    <el-tabs v-model="currentTab" style="margin-bottom: 16px;">
      <el-tab-pane label="因子列表" name="list"></el-tab-pane>
      <el-tab-pane label="创建衍生因子" name="derivative"></el-tab-pane>
    </el-tabs>
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
            <template v-if="isAdminUser">
              <el-button size="small" @click="editFactor(scope.row)">编辑</el-button>
              <el-button size="small" type="danger" @click="deleteFactor(scope.row)">删除</el-button>
            </template>
            <span v-else>无操作权限</span>
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
        <el-form-item label="因子代码" prop="code" required>
          <el-input v-model="derivativeForm.code" placeholder="请输入因子代码" />
        </el-form-item>
        <el-form-item label="种类" prop="category" required>
          <el-select v-model="derivativeForm.category" placeholder="请选择因子种类">
            <el-option label="估值" value="估值"/>
            <el-option label="技术" value="技术"/>
            <el-option label="复合" value="复合"/>
            <el-option label="情绪" value="情绪"/>
            <!-- 可根据实际业务补充更多类别 -->
          </el-select>
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
            <el-button icon="el-icon-delete" @click="derivativeForm.baseFactors.splice(idx,1)" circle type="danger" size="small" v-if="derivativeForm.baseFactors.length > 1" />
          </div>
          <el-button
            type="primary"
            plain
            @click="derivativeForm.baseFactors.push({id:'',weight:0})"
            icon="el-icon-plus"
            size="small"
            style="margin-top: 8px; margin-left: 0; border-radius: 6px;"
          >添加基础因子</el-button>
          <el-alert
            v-if="weightSum > 1"
            title="所有基础因子的权重之和不能超过1"
            type="error"
            show-icon
            style="margin-top: 8px; margin-bottom: 0;"
          />
        </el-form-item>
        <el-form-item label="公式" prop="formula">
          <el-input v-model="derivativeForm.formula" placeholder="如：0.5*A+0.5*B" />
          <div style="margin-top: 4px;">
            <el-tag
              v-for="item in derivativeForm.baseFactors"
              :key="item.id"
              type="info"
              style="margin-right: 4px;"
            >{{ getFactorName(item.id) }}</el-tag>
          </div>
          <div style="margin-top: 4px; color: #888; font-size: 13px;">
            <span v-for="(item, idx) in derivativeForm.baseFactors" :key="'var'+idx" style="margin-right: 12px;">
              {{ String.fromCharCode(65+idx) }} = {{ getFactorName(item.id) }}
            </span>
          </div>
          <el-button type="primary" size="mini" style="margin-top: 8px;" @click="previewFormula">预览公式</el-button>
          <div v-if="formulaPreviewResult" style="margin-top: 8px; color: #409EFF;">
            预览结果：{{ formulaPreviewResult }}
          </div>
          <div v-if="formulaPreviewError" style="margin-top: 8px; color: #F56C6C;">
            公式错误：{{ formulaPreviewError }}
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitDerivativeFactor" :disabled="weightSum > 1">创建因子</el-button>
          <el-button @click="resetDerivativeForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 编辑/添加因子弹窗 -->
    <el-dialog v-model="showDialog" :title="dialogTitle" width="600px">
      <el-form :model="editForm" label-width="100px" class="factor-form-dialog">
        <el-divider content-position="left">基础信息</el-divider>
        <el-form-item label="类型" required>
          <el-select v-model="editForm.type" placeholder="请选择类型" style="width: 200px;">
            <el-option label="普通" value="普通"/>
            <el-option label="衍生" value="衍生"/>
          </el-select>
        </el-form-item>
        <el-form-item label="因子名称" required>
          <el-input v-model="editForm.name" placeholder="请输入因子名称" />
        </el-form-item>
        <el-form-item label="因子代码">
          <el-input v-model="editForm.code" placeholder="请输入因子代码" />
        </el-form-item>
        <el-form-item label="类别">
          <el-input v-model="editForm.category" placeholder="请输入类别" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input type="textarea" v-model="editForm.description" placeholder="请输入描述" />
        </el-form-item>
        <template v-if="editForm.type === '衍生'">
          <el-divider content-position="left">基础因子</el-divider>
          <el-form-item label-width="0">
            <div class="base-factor-list-modern">
              <div
                v-for="(item, idx) in editForm.baseFactors"
                :key="idx"
                class="base-factor-row"
              >
                <el-select v-model="item.id" placeholder="选择因子" style="width: 140px;" filterable size="small">
                  <el-option v-for="f in availableFactors" :key="f.id" :label="f.name" :value="f.id" />
                </el-select>
                <el-input-number v-model="item.weight" :min="0" :max="1" :step="0.01" :precision="2" style="width: 80px; margin: 0 8px;" size="small" />
                <el-button icon="el-icon-delete" @click="removeBaseFactor(idx)" circle type="danger" size="small" class="delete-btn-modern" />
              </div>
              <el-button
                type="primary"
                plain
                @click="addBaseFactor"
                icon="el-icon-plus"
                size="small"
                style="margin-top: 8px; margin-left: 0; border-radius: 6px;"
              >
                添加基础因子
              </el-button>
            </div>
          </el-form-item>
        </template>
      </el-form>
      <template #footer>
        <div style="text-align: right;">
          <el-button @click="showDialog = false">取消</el-button>
          <el-button v-if="isAdminUser" type="primary" @click="saveFactor">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { factorApi } from '../api/factor'
import { ElMessage, ElMessageBox } from 'element-plus'
import { isAdmin } from '@/utils/auth'

export default {
  name: 'FactorManagement',
  data() {
    return {
      currentTab: 'list',
      tabs: [
        { id: 'list', name: '因子列表' },
        { id: 'derivative', name: '创建衍生因子' }
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
        code: '',
        category: '',
        description: '',
        baseFactors: [ { id: '', weight: 0 } ],
        formula: ''
      },
      derivativeRules: {
        name: [{ required: true, message: '请输入因子名称', trigger: 'blur' }],
        code: [{ required: true, message: '请输入因子代码', trigger: 'blur' }],
        category: [{ required: true, message: '请选择因子种类', trigger: 'change' }]
      },
      availableFactors: [],
      formulaPreviewResult: '',
      formulaPreviewError: '',
    }
  },
  computed: {
    isAdminUser() {
      return isAdmin()
    },
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
    },
    weightSum() {
      return this.derivativeForm.baseFactors.reduce((sum, f) => sum + Number(f.weight || 0), 0)
    }
  },
  methods: {
    async loadFactors() {
      this.loading = true
      try {
        console.log('[Debug] 开始加载因子数据...');
        const response = await factorApi.getAllFactors();
        console.log('[Debug] API响应数据:', response);
        
        // 处理ApiResponse格式的数据
        let factorList = [];
        if (response && response.code === 200) {
          // 成功响应
          if (Array.isArray(response.data)) {
            factorList = response.data;
          } else {
            console.warn('[Debug] response.data不是数组:', response.data);
            factorList = [];
          }
        } else if (Array.isArray(response)) {
          // 直接返回数组的情况
          factorList = response;
        } else if (response && Array.isArray(response.data)) {
          // 其他可能的格式
          factorList = response.data;
        } else {
          console.warn('[Debug] 意外的数据格式:', response);
          factorList = [];
        }
        
        this.factors = factorList;
        this.availableFactors = this.factors;
        console.log('[Debug] 成功加载因子数量:', this.factors.length);
      } catch (error) {
        console.error('[Debug] 加载因子失败:', error);
        this.factors = [];
        this.availableFactors = [];
        
        // 根据错误类型显示不同的错误信息
        if (error.response) {
          // 服务器响应了错误状态码
          const status = error.response.status;
          const responseData = error.response.data;
          console.log('[Debug] 后端响应数据:', responseData);
          
          let errorMessage = '';
          if (responseData && responseData.message) {
            errorMessage = responseData.message;
          } else if (responseData && responseData.msg) {
            errorMessage = responseData.msg;
          } else if (responseData && responseData.error) {
            errorMessage = responseData.error;
          } else if (typeof responseData === 'string') {
            errorMessage = responseData;
          } else {
            errorMessage = error.response.statusText || '未知错误';
          }
          
          ElMessage.error(`加载失败 (${status}): ${errorMessage}`);
        } else if (error.request) {
          // 请求已发出但没有收到响应
          ElMessage.error('无法连接到服务器，请检查后端服务是否运行');
        } else {
          // 其他错误
          ElMessage.error('加载因子数据失败: ' + (error.message || '未知错误'));
        }
      } finally {
        this.loading = false;
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
      this.derivativeForm = { name: '', code: '', category: '', description: '', baseFactors: [ { id: '', weight: 0 } ], formula: '' }
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
          // 修正：将id转换为baseFactorId
          const baseFactors = this.derivativeForm.baseFactors.map(item => ({
            baseFactorId: item.id,
            weight: item.weight
          }));
          await factorApi.createFactor({
            name: this.derivativeForm.name,
            code: this.derivativeForm.code,
            category: this.derivativeForm.category,
            description: this.derivativeForm.description,
            baseFactors,
            formula: this.derivativeForm.formula,
            type: '衍生'
          });
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
    getFactorName(id) {
      const f = this.availableFactors.find(f => f.id === id);
      return f ? f.name : id;
    },
    async previewFormula() {
      this.formulaPreviewResult = '';
      this.formulaPreviewError = '';
      if (!this.derivativeForm.formula) {
        this.formulaPreviewError = '请输入公式';
        return;
      }
      try {
        // 修正：将id转换为baseFactorId
        const baseFactors = this.derivativeForm.baseFactors.map(item => ({
          baseFactorId: item.id,
          weight: item.weight
        }));
        const res = await factorApi.previewFormula({
          formula: this.derivativeForm.formula,
          baseFactors
        });
        if (res.data && res.data.result) {
          this.formulaPreviewResult = res.data.result;
        } else {
          this.formulaPreviewError = res.data?.msg || '公式预览失败';
        }
      } catch (e) {
        this.formulaPreviewError = e?.message || '公式预览失败';
      }
    },
  },
  watch: {
    'derivativeForm.baseFactors': {
      handler(newVal) {
        const vars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const formula = newVal
          .map((item, idx) => `${Number(item.weight) || 0}*${vars[idx]}`)
          .join('+');
        this.derivativeForm.formula = formula;
      },
      deep: true
    }
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
.factor-form-dialog .el-form-item {
  margin-bottom: 18px;
}
.base-factor-list-modern {
  background: #f7f8fa;
  border-radius: 8px;
  padding: 16px 16px 8px 16px;
  display: flex;
  flex-direction: column;
  gap: 0;
}
.base-factor-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  background: transparent;
}
.delete-btn-modern {
  margin-left: 8px;
}
</style>
