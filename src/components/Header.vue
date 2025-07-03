<!-- src/components/Header.vue -->
<template>
  <header class="header">
    <div class="left">
      <button class="burger" @click="$emit('toggle-sidebar')">☰</button>
      <span class="logo">智投顾系统</span>
    </div>
    <div class="right">
      <div class="breadcrumb">/ {{ $route.path.slice(1).replace('-', ' ') }}</div>
      <button class="icon-btn">🔔</button>
      <div class="user-menu">
        <img src="/vite.svg" class="avatar" />
        <span @click="logout">登出</span>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  methods: {
    logout() {
      localStorage.clear()
      window.location.reload()
    }
  }
}
</script>

<style scoped>
.header {
  height: 60px;
  background: #008997;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
}
.left { display: flex; align-items: center; }
.burger { font-size: 1.5rem; background:none; border:none; color:#fff; cursor:pointer; }
.logo { font-size: 1.2rem; margin-left: .5rem; }
.right { display: flex; align-items: center; }
.breadcrumb { margin-right: 1rem; }
.icon-btn { background:none; border:none; font-size:1.2rem; margin-right:1rem; cursor:pointer; }
.user-menu { display:flex; align-items:center; cursor:pointer; }
.avatar { width:32px; height:32px; border-radius:50%; margin-right:.5rem; }
</style>
