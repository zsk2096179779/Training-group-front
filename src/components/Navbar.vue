<template>
  <nav class="navbar">
    <div class="navbar-brand">
      <router-link to="/datasource" class="logo">Training Group</router-link>
    </div>
    <el-menu class="navbar-menu" mode="horizontal" :router="true" background-color="transparent" text-color="#fff" active-text-color="#64ffda" style="border-bottom: none;">
      <el-menu-item v-if="isAdminUser" index="/datasource">数据源配置</el-menu-item>
      <el-menu-item index="/factors">因子管理</el-menu-item>
      <el-menu-item index="/factor-tree">因子树管理</el-menu-item>
      <el-menu-item index="/style-factor-management">风格投资因子管理</el-menu-item>
    </el-menu>
    <div class="navbar-user" v-if="userInfo">
      <el-dropdown @command="handleCommand">
        <span class="user-info">
          <el-avatar :size="32" :src="userInfo.avatar">
            {{ userInfo.username?.charAt(0).toUpperCase() }}
          </el-avatar>
          <span class="username">{{ userInfo.username }}</span>
          <el-icon><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">个人信息</el-dropdown-item>
            <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import { getUserInfo, clearAuth, isAdmin } from '@/utils/auth'

const router = useRouter()
const userInfo = ref(null)

// 计算属性，判断当前用户是否是管理员
const isAdminUser = computed(() => isAdmin())

onMounted(() => {
  // 获取用户信息
  userInfo.value = getUserInfo()
})

const handleCommand = async (command) => {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      // 只做本地清理，不请求后端
      clearAuth()
      ElMessage.success('已退出登录')
      router.push('/login')
    } catch {
      // 用户取消
    }
  } else if (command === 'profile') {
    ElMessage.info('个人信息功能开发中...')
  }
}
</script>

<style scoped>
.navbar {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.navbar-brand {
  font-size: 1.5rem;
  font-weight: bold;
}

.logo {
  color: white;
  text-decoration: none;
  transition: color 0.3s ease;
}

.logo:hover {
  color: #64ffda;
}

.navbar-menu {
  display: flex;
  gap: 2rem;
  background: transparent;
  border-bottom: none;
}

.el-menu--horizontal > .el-menu-item {
  color: white;
  font-size: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.3s ease;
  background: transparent;
}

.el-menu--horizontal > .el-menu-item.is-active {
  background-color: rgba(255,255,255,0.2);
  color: #64ffda;
}

.el-menu--horizontal > .el-menu-item:hover {
  background-color: rgba(255,255,255,0.1);
  color: #64ffda;
}

.navbar-user {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.user-info:hover {
  background-color: rgba(255,255,255,0.1);
}

.username {
  font-size: 14px;
  font-weight: 500;
}
</style> 