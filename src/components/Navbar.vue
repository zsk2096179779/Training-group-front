<template>
  <nav class="navbar">
    <div class="navbar-brand">
      <router-link to="/" class="logo">Training Group</router-link>
    </div>
    <div class="navbar-menu">
      <!-- <router-link to="/" class="nav-item">首页</router-link> -->
      <router-link to="/datasource" class="nav-item">数据源配置</router-link>
      <router-link to="/factors" class="nav-item">因子管理</router-link>
      <router-link to="/analysis" class="nav-item">数据分析</router-link>
      <router-link to="/factor-tree" class="nav-item">因子树管理</router-link>
      <router-link to="/settings" class="nav-item">设置</router-link>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'Navbar'
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
}

.nav-item {
  color: white;
  text-decoration: none;
  font-size: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.nav-item:hover {
  background-color: rgba(255,255,255,0.1);
  color: #64ffda;
}

.router-link-active {
  background-color: rgba(255,255,255,0.2);
  color: #64ffda;
}
</style> 