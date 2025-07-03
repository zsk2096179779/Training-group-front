<template>
  <div class="auth-wrapper">
    <div class="left-container">
      <svg width="800" height="300" class="text">
        <defs>
          <linearGradient id="geekColor" gradientTransform="rotate(90)">
            <stop offset="0%" stop-color="#000000">
              <animate
                  attributeName="stop-color"
                  values="#000000;#555555;#FFFFFF;#555555;#000000"
                  dur="10s"
                  repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stop-color="#FFFFFF">
              <animate
                  attributeName="stop-color"
                  values="#FFFFFF;#AAAAAA;#000000;#AAAAAA;#FFFFFF"
                  dur="10s"
                  repeatCount="indefinite"
              />
            </stop>
          </linearGradient>
        </defs>
        <text class="logo_text" x="80" y="140">智能投顾系统</text>
      </svg>
    </div>

    <div class="right-container">
      <div :class="['container', { 'right-panel-active': isSignUp }]">
        <!-- 注册表单 -->
        <div class="container__form container--signup">
          <SignupForm @registered="isSignUp = false" />
        </div>
        <!-- 登录表单 -->
        <div class="container__form container--signin">
          <LoginForm @login-success="onLoginSuccess" />
        </div>
        <!-- 切换面板 -->
        <div class="container__overlay">
          <div class="overlay">
            <div class="overlay__panel overlay--left">
              <button class="btn" @click="isSignUp = false">登录</button>
            </div>
            <div class="overlay__panel overlay--right">
              <button class="btn" @click="isSignUp = true">注册</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LoginForm from "./LoginForm.vue";
import SignupForm from "./SignupForm.vue";

export default {
  components: { LoginForm, SignupForm },
  data() {
    return { isSignUp: false };
  },
  methods: {
    onLoginSuccess() {
      // 登录成功后跳到主框架的第一个子路由
      this.$router.push("/");
    },
  },
};
</script>

<style scoped>
.auth-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: url("src/assets/background.png")no-repeat center/cover;
}
.left-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.right-container {
  flex: 1.2;
  display: flex;
  align-items: center;
  justify-content: center;
}
.right-container .container {
  width: 90%;
}
.container--signin,
.container--signup {
  width: 50%;
}
</style>
