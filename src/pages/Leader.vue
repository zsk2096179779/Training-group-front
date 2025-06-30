<template>
  <div class="common-layout">
    <el-container class="container">
      <!-- 左侧导航栏 -->
      <el-aside width="250px" class="sidebar">
        <!-- 系统标题 -->
        <div class="system-title-container">
          <el-icon class="system-icon"><Monitor /></el-icon>
          <span class="system-title">策略管理子系统</span>
        </div>
        
        <!-- 导航菜单 -->
        <div class="nav-container">
          <div 
            class="nav-item"
            :class="{ active: activePath === '/strategy-management' }"
            @click="navigateTo('/strategy-management')"
          >
            <el-icon><Menu /></el-icon>
            <span>策略管理</span>
          </div>
          
          <div 
            class="nav-item"
            :class="{ active: activePath === '/strategy-creation' }"
            @click="navigateTo('/strategy-creation')"
          >
            <el-icon><Plus /></el-icon>
            <span>策略创建</span>
          </div>
          
          <div 
            class="nav-item"
            :class="{ active: activePath === '/strategy-monitoring' }"
            @click="navigateTo('/strategy-monitoring')"
          >
            <el-icon><DataLine /></el-icon>
            <span>策略监控</span>
          </div>
          
          <div 
            class="nav-item"
            :class="{ active: activePath === '/rebalance-setting' }"
            @click="navigateTo('/rebalance-setting')"
          >
            <el-icon><Setting /></el-icon>
            <span>再平衡设置</span>
          </div>
        </div>
        
        <!-- 用户信息 -->
        <div class="user-container" @click="handleUserClick">
          <el-avatar :size="32" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
          <span class="user-name">{{ username }}</span>
        </div>
        
        <!-- 分隔线 -->
        <div class="divider">———————————————</div>
      </el-aside>
      
      <!-- 右侧内容区 -->
      <el-main class="main-content">
        <div class="page-content">
          <!-- 根据当前路由显示对应的内容 -->
          <router-view />
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Monitor,
  Menu,
  Plus,
  DataLine,
  Setting
} from '@element-plus/icons-vue'

const username = ref('游客')
const activePath = ref('/strategy-management')
const router = useRouter()

// 从URL参数获取用户名
const getUsernameFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('username') || null
}

// 初始化用户名
onMounted(() => {
  const urlUsername = getUsernameFromUrl()
  if(urlUsername) {
    username.value = decodeURIComponent(urlUsername)
  }
  
  // 设置初始路由
  activePath.value = router.currentRoute.value.path || '/strategy-management'
})

// 导航到指定路径
const navigateTo = (path) => {
  activePath.value = path
  router.push(path)
}

// 用户点击事件
const handleUserClick = () => {
  console.log("用户详情")
}
</script>

<style scoped>
.common-layout {
  height: 100vh;
}

.container {
  height: 100%;
  display: flex;
}

.sidebar {
  background-color: white;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.system-title-container {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  height: 50px;
  background-color: #dbeafe; /* 相当于bg-blue-50 */
  border-left: 4px solid #3b82f6; /* 相当于border-l-4 border-blue-500 */
}

.system-icon {
  color: #3b82f6;
  font-size: 1.3em;
}

.system-title {
  margin-left: 8px;
  font-weight: 700;
  font-size: 1.1rem;
  padding-left: 8px;
}

.nav-container {
  flex-grow: 1;
  padding: 16px 0;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-item:hover {
  background-color: #f3f4f6;
}

.nav-item.active {
  background-color: #dbeafe;
  color: #3b82f6;
  border-left: 4px solid #3b82f6;
}

.nav-item .el-icon {
  margin-right: 10px;
  font-size: 1.2em;
}

.user-container {
  padding: 16px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.3s;
}

.user-container:hover {
  background-color: #f9fafb;
}

.user-name {
  margin-left: 10px;
  font-weight: 500;
}

.divider {
  height: 10px;
  width: 100%;
  text-align: center;
  color: #d1d5db;
  font-size: 0.8em;
}

.main-content {
  padding: 0;
  height: 100%;
  background-color: #f3f4f6;
}

.page-content {
  height: 100%;
  padding: 20px;
  overflow-y: auto;
}
</style>