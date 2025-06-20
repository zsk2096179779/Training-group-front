<template>
    <div>
      <el-result icon="warning" title="警告提示" subTitle="请根据提示进行操作">
        <template #extra>
          <el-button type="primary" size="medium" @click="goBack">返回首页</el-button>
        </template>
      </el-result>
    </div>
  </template>

<script>
export default {
  methods: {
    goBack() {
      this.$router.push('/');
    }
  }
}
</script>