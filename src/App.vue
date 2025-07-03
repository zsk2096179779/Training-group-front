<template>
  <div id="app" class="app">
    <!-- 仅在登录/注册页之外，并且已登录时展示 Header 和 Sidebar -->
    <HeaderBar v-if="showNavbar" />
    <Sidebar v-if="showNavbar" />

    <!-- 主内容区，登录/注册页时去掉内边距 -->
    <main class="main-content" :class="{ 'no-navbar': !showNavbar }">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { isAuthenticated } from '@/utils/auth'
import HeaderBar from './components/Header.vue'
import Sidebar  from './components/Sidebar.vue'

const route = useRoute()

const showNavbar = computed(() => {
  // 登录／注册页不显示布局
  if (route.name === 'Login' || route.name === 'Register') {
    return false
  }
  // 其他页面，需已登录才显示
  return isAuthenticated()
})
</script>

<style>
/* 全局重置 & 基础样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
  Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background-color: #f5f7fa;
  color: #2c3e50;
}

/* 根容器铺满全屏并垂直布局 */
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 主内容区，带／不带内边距 */
.main-content {
  flex: 1;
  padding: 1rem;
}
.main-content.no-navbar {
  padding: 0;
}
</style>
