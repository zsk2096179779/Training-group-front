<template>
  <div class="common-layout">
    <el-container class="h-screen">
      <!-- 左侧导航栏 -->
      <el-aside width="200px" class="bg-white border-r border-gray-200 flex flex-col">
        <!-- 系统标题 -->
        <div class="p-4 border-b border-gray-200 flex items-center h-[64px]">
          <el-icon class="text-blue-500 text-xl"><Monitor /></el-icon>
          <span class="ml-2 font-bold text-lg">策略管理子系统</span>
        </div>
        
        <!-- 导航菜单 -->
        <div class="flex-1 py-4 overflow-y-auto">
          <router-link to="/strategy-management" custom v-slot="{ navigate, isActive }">
            <div 
              class="nav-item" 
              :class="{ active: isActive }"
              @click="navigate"
            >
              <el-icon><Menu /></el-icon>
              <span>策略管理</span>
            </div>
          </router-link>
          
          <router-link to="/strategy-creation" custom v-slot="{ navigate, isActive }">
            <div 
              class="nav-item" 
              :class="{ active: isActive }"
              @click="navigate"
            >
              <el-icon><Plus /></el-icon>
              <span>策略创建</span>
            </div>
          </router-link>
          
          <router-link to="/strategy-monitoring" custom v-slot="{ navigate, isActive }">
            <div 
              class="nav-item" 
              :class="{ active: isActive }"
              @click="navigate"
            >
              <el-icon><DataLine /></el-icon>
              <span>策略监控</span>
            </div>
          </router-link>
          
          <router-link to="/rebalance-setting" custom v-slot="{ navigate, isActive }">
            <div 
              class="nav-item" 
              :class="{ active: isActive }"
              @click="navigate"
            >
              <el-icon><Setting /></el-icon>
              <span>再平衡设置</span>
            </div>
          </router-link>
        </div>
        
        <!-- 用户信息 -->
        <div class="p-4 border-t border-gray-200 flex items-center text-sm">
          <el-avatar :size="32" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
          <span class="ml-2">管理员</span>
        </div>
      </el-aside>
        
      <!-- 路由视图区域 -->
      <el-container>
        <router-view></router-view>
      </el-container>
    </el-container>
    
    <!-- 创建策略对话框（保留在原组件中） -->
    <el-dialog v-model="showCreateDialog" title="创建新策略" width="500px">
      <!-- 内容不变... -->
    </el-dialog>
  </div>
</template>

<script setup>

</script>
  
<style scoped>
  .nav-item {
    display: flex;
    align-items: center;
    padding: 0.75rem 1.5rem;
    color: #4B5563;
    cursor: pointer;
  }
  
  .nav-item:hover {
    background-color: #f5f5f5;
    color: #1890ff;
  }

  
  .nav-item.active {
    background-color: #e6f7ff;
    color: #1890ff;
    border-left: 4px solid #1890ff;
  }
  
  .nav-item .el-icon {
    margin-right: 0.5rem;
    font-size: 1.125rem;
  }
  
  .el-table {
    --el-table-border-color: #ebeef5;
  }
  
  .el-table .el-table__cell {
    padding: 12px 0;
  }
</style>