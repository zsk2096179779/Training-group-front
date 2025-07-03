<template>
  <form class="form" @submit.prevent="onSubmit">
    <h2 class="form__title">注册</h2>
    <input v-model="form.username" type="text" placeholder="用户名" class="input" required />
    <input v-model="form.email"    type="email" placeholder="邮箱" class="input" required />
    <input v-model="form.password" type="password" placeholder="密码" class="input" required />
    <input v-model="form.confirmPassword"  type="password" placeholder="确认密码" class="input" required />
    <button :disabled="loading" class="btn">
      {{ loading ? '注册中…' : '注册' }}
    </button>
  </form>
</template>

<script>
import {register} from "../api/auth";

export default {
  name: 'SignupForm',
  data() {
    return {
      form:{username: '',
        email: '',
        password: '',
        confirmPassword: ''
      },
      loading: false
    }
  },
  methods: {
    async onSubmit() {
      console.log('register payload', this.form)
      this.loading = true;
      try{
        await register(this.form);
        alert('注册成功，请登录')
        this.$emit('registered')
      }catch(e){
        alert('注册失败:' + (e.response?.data?.msg || e.message))
      }finally{
        this.loading = false;
      }
    }
  }
}
</script>
