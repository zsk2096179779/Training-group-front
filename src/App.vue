<template>
  <!-- 主应用容器 -->
  <div id="app">
    <!-- 路由出口 -->
    <router-view v-slot="{ Component }">
      <!-- 添加过渡动画 -->
      <transition name="fade" mode="out-in">
        <!-- 动态组件 -->
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script>
export default {
  name: 'App',
  // 可以在这里添加全局数据或方法
  data() {
    return {
      // 全局数据示例
      appName: '产品管理系统'
    }
  },
  mounted() {
    console.log('App 已挂载') // 调试用
  }
}
</script>

<style>
/* 全局样式 */
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 路由过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  #app {
    padding: 10px;
  }
}
</style>