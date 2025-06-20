<script>
import { getCombos } from "@/api/index.js";

export default {
  data() {
    return {
      message: '',
      items: [],
      loading: false,  // 新增加载状态
      error: null      // 新增错误处理
    };
  },
  methods: {
    async fetchData() {
      this.loading = true;
      try {
        const res = await getCombos();  // 确保调用函数
        this.items = res.data;
        console.log('调试信息:', this.items);  // 调试日志
      } catch (err) {
        this.error = err.message || '数据获取失败';
        console.error('API错误:', err);
      } finally {
        this.loading = false;
      }
    }
  },
  mounted() {
    this.fetchData();  // 页面加载时自动触发[1,6](@ref)
  }
};
</script>

<template>
  <div>
    <!-- 加载状态提示 -->
    <p v-if="loading">数据加载中...</p>

    <!-- 错误提示 -->
    <p v-if="error" class="error">{{ error }}</p>

    <!-- 数据渲染 -->
    <ul v-if="!loading && items.length > 0">
      <li v-for="item in items" :key="item.id">
        {{ item }}
      </li>
    </ul>

    <!-- 空数据提示 -->
    <p v-if="!loading && items.length === 0">暂无数据</p>
  </div>
</template>

<style scoped>
.error { color: red; }
</style>