<template>
    <div>
        <el-button @click="go">进入</el-button>
    </div>
</template>
<script>
export default {
  methods: {
    async go() {
      // 添加/api前缀（会被Vite代理重写）
      //这里要传个User
      await this.$http.post('/api/test', { id: 1, name: 'fe4geliu' })
      this.$router.push('/strategy_manage')
    }
  }
}
</script>