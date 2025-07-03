<template>
  <div id="app">
    <!-- 路由视图：/login 渲染 Auth.vue，/ 渲染 MainLayout.vue -->
    <HeaderBar />
    <Sidebar />
    <router-view />
  </div>
</template>

<script setup>
// 无需手动 import Auth 或 MainLayout
import Sidebar from "./components/Sidebar.vue";
import HeaderBar from "./components/Header.vue";
</script>

<style>
/* 交给全局样式管理，这里保持空 */
</style>
