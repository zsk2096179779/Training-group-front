<template>
  <div class="factor-tree-page">
    <!-- 顶部操作栏 -->
    <header class="factor-tree-header">
      <h1>因子树管理</h1>
      <div class="header-actions">
        <el-upload
          :show-file-list="false"
          accept=".xlsx,.xls,.csv"
          :http-request="handleFileUpload"
        >
          <el-button type="primary">导入Excel/CSV</el-button>
        </el-upload>
        <el-dropdown @command="handleExport" trigger="click">
          <el-button type="primary">
            导出因子树
            <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="json">导出为 JSON</el-dropdown-item>
              <el-dropdown-item command="excel">导出为 Excel</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button v-if="isAdminUser" type="primary" @click="addTreeType">新增场景</el-button>
        <el-button v-if="isAdminUser && currentTreeType" @click="showRenameDialog = true">重命名</el-button>
        <el-button v-if="isAdminUser && currentTreeType" type="danger" @click="handleDeleteTree">删除</el-button>
        <el-button @click="fetchTree">刷新</el-button>
      </div>
    </header>

    <main class="factor-tree-main">
      <!-- 左侧：树结构区 -->
      <section class="tree-section">
        <el-card shadow="hover" v-loading="treeLoading">
          <!-- 业务场景选择在上方 -->
          <el-select
            v-model="currentTreeType"
            placeholder="选择业务场景"
            @change="fetchTree"
            style="width: 100%; margin-bottom: 12px;"
            clearable
          >
            <el-option
              v-for="item in sceneOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <!-- 树名称选择在下方，未选业务场景时禁用 -->
          <el-select
            v-model="selectedTreeName"
            placeholder="请选择树名称"
            style="width: 100%; margin-bottom: 12px;"
            :disabled="!currentTreeType || groupList.length === 0"
            clearable
          >
            <el-option
              v-for="item in groupList"
              :key="item.treeName"
              :label="item.treeName"
              :value="item.treeName"
            />
          </el-select>
          <div v-if="currentTreeGroup && currentTreeGroup.treeName" style="font-weight:bold; font-size:16px; margin-bottom:8px;">
            当前树名称：{{ currentTreeGroup.treeName }}
          </div>
          <!-- 节点关键词搜索 -->
          <el-input
            v-model="filterText"
            placeholder="搜索树节点"
            @input="onFilterInput"
            clearable
            style="margin-bottom: 12px;"
          />
          <!-- 树结构 -->
          <el-tree
            ref="factorTree"
            :data="treeData"
            :props="defaultProps"
            node-key="id"
            highlight-current
            :filter-node-method="filterNode"
            @node-click="handleNodeClick"
            empty-text="暂无树节点，请先选择业务场景并查询"
            style="min-height: 300px;"
            :draggable="isAdminUser"
            @node-drop="handleNodeDrop"
          >
            <template #default="{ node, data }">
              <span class="tree-node-label" @contextmenu.prevent="e => openContextMenu(e, data)">
                {{ data.name }}
              </span>
            </template>
          </el-tree>
        </el-card>
      </section>

      <!-- 右侧：因子表格区 -->
      <section class="factor-section">
        <el-card shadow="hover">
          <h3 style="margin-bottom: 12px;">当前节点下因子</h3>
          <el-table :data="currentNodeFactors" v-loading="factorLoading" style="width: 100%;">
            <el-table-column prop="name" label="因子名称"/>
            <el-table-column prop="code" label="因子代码"/>
            <el-table-column prop="type" label="类型"/>
            <template #empty>
              <div style="padding: 32px 0; color: #999;">暂无因子数据</div>
            </template>
          </el-table>
        </el-card>
      </section>
    </main>

    <!-- 右键菜单 -->
    <ul
      v-if="isAdminUser && contextMenu.visible"
      class="context-menu"
      :style="{ left: contextMenu.left + 'px', top: contextMenu.top + 'px' }"
    >
      <li @click="addNode">新增节点</li>
      <li @click="renameNode">重命名</li>
      <li @click="deleteNode">删除节点</li>
      <li @click="addFactorToNode">添加因子至节点</li>
    </ul>

    <!-- 新增场景弹窗 -->
    <el-dialog v-model="showAddSceneDialog" title="新增场景" width="300px">
      <el-input v-model="newSceneName" placeholder="请输入场景名称" />
      <template #footer>
        <el-button @click="showAddSceneDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmAddScene">确定</el-button>
      </template>
    </el-dialog>

    <!-- 重命名树弹窗 -->
    <el-dialog v-model="showRenameDialog" title="重命名树" width="300px">
      <el-input v-model="renameValue" placeholder="请输入新名称" />
      <template #footer>
        <el-button @click="showRenameDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmRenameTree">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import { getFactorTree, getFactorsByNodeId, updateNodeOrder } from '@/api/factor'
import { isAdmin } from '@/utils/auth' // 导入 isAdmin
import request from '@/api/request' // 导入request实例
import { saveAs } from 'file-saver'

// 业务场景历史/建议（可扩展为接口获取）
const sceneOptions = ref([
  { value: 'XJ', label: '选基因子树' },
  { value: 'QY', label: '量化投研因子树' },
  { value: 'TS', label: '特色数据输出' },
  { value: '分类', label: '分类' }
])
const currentTreeType = ref('')
const filterText = ref('')
const treeData = ref([])
const treeLoading = ref(false)
const defaultProps = { children: 'children', label: 'name' }
const factorTree = ref(null)
const currentNode = ref(null)
const currentNodeFactors = ref([])
const factorLoading = ref(false)
const contextMenu = ref({ visible: false, left: 0, top: 0, node: null });

// 新增场景弹窗相关
const showAddSceneDialog = ref(false)
const newSceneName = ref('')

// 重命名树相关
const showRenameDialog = ref(false)
const renameValue = ref('')

// 计算属性，判断当前用户是否是管理员
const isAdminUser = computed(() => isAdmin())

// 自动补全建议
const querySearch = (queryString, cb) => {
  const results = sceneOptions.value.filter(item =>
    item.value.includes(queryString) || item.label.includes(queryString)
  )
  cb(results)
}

// 树节点过滤
const filterNode = (value, data) => {
  if (!value) return true
  return data.name && data.name.includes(value)
}
const onFilterInput = val => {
  factorTree.value && factorTree.value.filter(val)
}

// 扁平列表转树结构
function flatListToTree(list) {
  const idMap = {};
  const tree = [];
  list.forEach(item => {
    // 忽略原始 children 字段，强制为 []
    const { children, ...rest } = item;
    idMap[item.id] = { ...rest, children: [] };
  });
  list.forEach(item => {
    if (item.parentId !== null && item.parentId !== undefined && idMap[item.parentId]) {
      idMap[item.parentId].children.push(idMap[item.id]);
    } else {
      tree.push(idMap[item.id]);
    }
  });
  return tree;
}

// 查询树结构（调用 listWithTreeName，展示第一个 treeName 的树）
const groupList = ref([]); // 保存所有树分组
defaultProps.children = 'children';
defaultProps.label = 'name';
const selectedTreeName = ref(''); // 当前选中的树名称
const currentTreeGroup = computed(() =>
  groupList.value.find(g => g.treeName === selectedTreeName.value)
);

watch([selectedTreeName, groupList], ([newName, newGroupList]) => {
  if (newGroupList.length === 0) {
    treeData.value = [];
    return;
  }
  if (newName) {
    const group = newGroupList.find(g => g.treeName === newName);
    if (group && Array.isArray(group.nodes)) {
      treeData.value = flatListToTree(group.nodes);
    } else {
      treeData.value = [];
    }
  } else {
    const allNodes = newGroupList.flatMap(g => Array.isArray(g.nodes) ? g.nodes : []);
    treeData.value = flatListToTree(allNodes);
  }
});

const fetchTree = async () => {
  console.log('fetchTree called')
  treeLoading.value = true
  try {
    const res = await getFactorTree(currentTreeType.value)
    console.log('res.data', res.data)
    groupList.value = Array.isArray(res.data) ? res.data : [];
    selectedTreeName.value = ''; // 立即清空，自动展示所有树
    // 下面的逻辑由watch自动处理
    currentNode.value = null
    currentNodeFactors.value = []
  } catch (e) {
    treeData.value = []
    groupList.value = []
    selectedTreeName.value = ''
    ElMessage.error('获取因子树失败，请查看控制台获取更多信息')
  } finally {
    treeLoading.value = false
  }
}

// 节点点击
const handleNodeClick = async (data) => {
  currentNode.value = data
  factorLoading.value = true
  try {
    const res = await getFactorsByNodeId(data.id)
    // 兼容后端返回格式
    currentNodeFactors.value = res.data?.data || res.data || []
  } catch (e) {
    currentNodeFactors.value = []
    ElMessage.error('获取因子失败')
  } finally {
    factorLoading.value = false
  }
}

// 右键菜单相关
const openContextMenu = (event, nodeData) => {
  if (!isAdminUser.value) return; // 再次确认管理员权限
  contextMenu.value.node = nodeData;
  contextMenu.value.visible = true;
  contextMenu.value.left = event.clientX;
  contextMenu.value.top = event.clientY;

  // 添加全局点击事件以关闭菜单
  document.addEventListener('click', closeContextMenu, { once: true });
};

const closeContextMenu = () => {
  contextMenu.value.visible = false;
};

const addNode = () => ElMessage.info('TODO: 新增节点');
const renameNode = () => ElMessage.info('TODO: 重命名节点');
const deleteNode = () => ElMessage.info('TODO: 删除节点');
const addFactorToNode = () => ElMessage.info('TODO: 添加因子');

// 新增场景按钮点击事件
const addTreeType = () => {
  showAddSceneDialog.value = true
  newSceneName.value = ''
}

// 确认新增场景
const confirmAddScene = () => {
  if (!newSceneName.value.trim()) {
    ElMessage.warning('请输入场景名称')
    return
  }
  if (sceneOptions.value.some(item => item.label === newSceneName.value.trim())) {
    ElMessage.warning('该场景已存在')
    return
  }
  const newValue = newSceneName.value.trim()
  sceneOptions.value.push({ label: newValue, value: newValue })
  currentTreeType.value = newValue
  showAddSceneDialog.value = false
  fetchTree()
}

const handleNodeDrop = async (draggingNode, dropNode, dropType) => {
  let newParentId, newSortOrder;
  if (dropType === 'inner') {
    newParentId = dropNode.data.id;
    newSortOrder = (dropNode.childNodes?.length || 0) + 1;
  } else {
    newParentId = dropNode.data.parent_id;
    newSortOrder = dropType === 'before' ? dropNode.data.sort_order : dropNode.data.sort_order + 1;
  }
  const newTreeName = dropNode.data.treeName; // 目标树名
  try {
    await updateNodeOrder({
      id: draggingNode.data.id,
      newParentId,
      newSortOrder,
      newTreeName // 新增，支持跨树拖拽
    });
    ElMessage.success('拖拽排序已保存');
    fetchTree();
  } catch (e) {
    ElMessage.error('拖拽保存失败');
  }
}

const handleExport = async (command) => {
  const treeType = currentTreeType.value
  if (!treeType) {
    ElMessage.warning('请先选择业务场景')
    return
  }

  if (command === 'excel') {
    try {
      console.log(`[Debug] 请求导出Excel for treeType: ${treeType}`)
      // 后端直接生成Excel，我们请求blob数据
      const blob = await request.get('/api/factor-tree/export', {
        params: { treeType },
        responseType: 'blob',
      });
      
      console.log('[Debug] 收到的Blob:', blob);

      if (!blob || blob.size === 0) {
        ElMessage.warning('收到的文件为空，请检查后端服务');
        return;
      }
      
      saveAs(blob, `factor_tree_${treeType}.xlsx`);
      ElMessage.success('Excel导出成功');

    } catch (e) {
      console.error('Excel导出失败:', e)
      ElMessage.error('Excel导出失败，请检查后端接口和日志')
    }
  } else if (command === 'json') {
    ElMessage.warning('JSON导出当前不可用，请联系后端开发人员提供专门的JSON导出接口。');
  }
}

// 导入文件处理
const handleFileUpload = async (option) => {
  const formData = new FormData()
  formData.append('file', option.file)
  try {
    await request.post('/api/factor-tree/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    ElMessage.success('导入成功')
    fetchTree()
  } catch (e) {
    ElMessage.error('导入失败，请检查文件格式或联系管理员')
  }
}

const confirmRenameTree = async () => {
  if (!renameValue.value.trim()) {
    ElMessage.warning('请输入新名称')
    return
  }
  try {
    const formData = new FormData();
    formData.append('treeType', currentTreeType.value);
    formData.append('treeName', currentTreeGroup.value?.treeName || '');
    formData.append('newTreeName', renameValue.value.trim());
    await request.post('/api/factor-tree/rename', formData);
    ElMessage.success('重命名成功')
    showRenameDialog.value = false
    // 刷新树类型和树结构
    await fetchTreeTypes()
    currentTreeType.value = ''
    treeData.value = []
  } catch (e) {
    ElMessage.error('重命名失败')
  }
}

const handleDeleteTree = () => {
  ElMessageBox.confirm('确定要删除该树及其所有节点吗？', '警告', {
    type: 'warning'
  }).then(async () => {
    try {
      const formData = new FormData();
      formData.append('treeType', currentTreeType.value);
      formData.append('treeName', currentTreeGroup.value?.treeName || '');
      await request.post('/api/factor-tree/delete', formData);
      ElMessage.success('删除成功')
      await fetchTreeTypes()
      currentTreeType.value = ''
      treeData.value = []
    } catch (e) {
      ElMessage.error('删除失败')
    }
  })
}

// 刷新树类型列表
const fetchTreeTypes = async () => {
  // 如果后端有接口，建议用接口获取树类型列表
  // 这里假设用 sceneOptions.value = await request.get(...)
  // 否则可手动维护
}

onMounted(fetchTree)
</script>

<style scoped>
.factor-tree-page {
  padding: 32px;
  background: #f7f9fb;
  min-height: 100vh;
}
.factor-tree-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}
.header-actions {
  display: flex;
  gap: 12px;
}
.factor-tree-main {
  display: flex;
  gap: 24px;
}
.tree-section {
  width: 350px;
  min-width: 300px;
}
.factor-section {
  flex: 1;
  min-width: 400px;
}
.tree-node-label {
  font-size: 15px;
  color: #333;
}

.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #ccc;
  box-shadow: 2px 2px 5px rgba(0,0,0,0.1);
  border-radius: 4px;
  list-style: none;
  margin: 0;
  padding: 8px 0;
  z-index: 1000;
}
.context-menu li {
  padding: 8px 16px;
  cursor: pointer;
}
.context-menu li:hover {
  background-color: #f5f5f5;
}
</style> 