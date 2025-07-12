<template>
  <div class="strategy-layout">
    <!-- 你可以在这里放一些共享的头部 / 面包屑 -->
    <h2>策略管理</h2>

    <!-- 一定要有这行，才能把子路由的组件渲染进来 -->
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'StrategyLayout'
}
</script>