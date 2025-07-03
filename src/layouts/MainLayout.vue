<!-- src/layouts/MainLayout.vue -->
<template>
  <div class="layout">
    <!-- 1. 侧边栏拿到 menuConfig 才能正常渲染 -->
    <Sidebar :menu="menuConfig"/>
    <div class="main">
      <Header />
      <div class="content">
        <router-view/>
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar      from '../components/Sidebar.vue'
import Header       from '../components/Header.vue'
import menuConfig   from '../config/menu.js'     // 一定要导入

export default {
  components: { Sidebar, Header },
  data() {
    return {
      menuConfig      // 暴露给 template
    }
  }
}
</script>

<style scoped>
.layout {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  display: flex;
  height: 100vh;
  background: none;         /* 确保不沿用 Auth.vue 的背景 */
  overflow: hidden;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  background: #f0f2f5;      /* 主体区背景色 */
}
</style>
