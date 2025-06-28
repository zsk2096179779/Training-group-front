<template>
  <div class="login-container">
    <!-- 添加用户名输入框 -->
    <el-input 
      v-model="username" 
      placeholder="请输入用户名" 
      clearable 
      style="margin-bottom: 20px; width: 300px;"
      @keyup.enter="go"
    >
      <template #prepend>
        <el-icon><User /></el-icon>
      </template>
    </el-input>
    <br>
    
    <!-- 登录按钮 -->
    <el-button 
      type="primary" 
      @click="go"
      :disabled="!username"
      :loading="loading"
    >
      登录进入
    </el-button>
    
    <!-- 错误提示 -->
    <div v-if="errorMessage" class="error-message">
      <el-alert :title="errorMessage" type="error" show-icon />
    </div>
  </div>
</template>

<script>
import { User } from '@element-plus/icons-vue'

export default {
  components: { User },
  data() {
    return {
      username: "",       // 绑定的用户名
      loading: false,     // 加载状态
      errorMessage: ""    // 错误信息
    };
  },
  methods: {
    async go() {
      // 验证用户名
      if (!this.username.trim()) {
        this.errorMessage = "用户名不能为空";
        return;
      }
      
      this.loading = true;
      this.errorMessage = "";
      
      try {
        // 发送认证请求到后端
        const response = await this.$http.post('/api/test', {
          id: 1,
          name: this.username
        });
        
        // 认证成功后跳转到策略管理页面
        if (response.data.success) {
          this.$router.push({
            path: '/strategy_manage',
            query: { 
              username: this.username
            }
          });
        } else {
          this.errorMessage = response.data.message || "认证失败，请重试";
        }
      } catch (error) {
        console.error('认证请求失败', error);
        this.errorMessage = error.response?.data?.message || "网络错误，请稍后重试";
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.error-message {
  margin-top: 20px;
  width: 300px;
}
</style>