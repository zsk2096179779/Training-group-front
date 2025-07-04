<template>
  <form @submit.prevent="onSubmit" class="form">
    <h2 class="form__title">登录</h2>
    <input v-model="form.username" placeholder="用户名" class="input" required />
    <input
        v-model="form.password"
        type="password"
        placeholder="密码"
        class="input"
        required
    />
    <button :disabled="loading" class="btn">
      {{ loading ? '登录中…' : '登录' }}
    </button>
  </form>
</template>

<script>
import { login } from '../api/auth'
import {setToken,setUserInfo} from "../utils/auth";

export default {
  name: 'LoginForm',
  data() {
    return {
      form: {username: '', password: ''},
      loading: false
    }
  },
  methods: {
    async onSubmit() {
      this.loading = true
      try {
        const {accessToken,user} = await login(this.form)
        setToken(accessToken)
        setUserInfo(user)

        alert('登录成功！')
        this.$emit('login-success')
      } catch (err) {
        const msg = err.response?.data?.msg || err.response?.data?.message || err.message
        alert('登录失败：' + msg)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
