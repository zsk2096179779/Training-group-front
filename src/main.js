// import { createApp } from 'vue'
// import './style.css'
// import App from './App.vue'
//
// createApp(App).mount('#app')
import { createApp } from 'vue'
import App           from './App.vue'
import router        from './router'

import ElementPlus   from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn          from 'element-plus/es/locale/lang/zh-cn'

// 1. 全局引入 vue-echarts 组件 和 echarts 全量包
import VChart     from 'vue-echarts'
import * as echarts from 'echarts'

// （可选）你的全局样式、token 注入逻辑等
import './styles/global.css'
import './styles/animation.css'
import './styles/login.css'
import { setToken } from './utils/auth'
const saved = localStorage.getItem('jwt_token')
if (saved) setToken(saved)

const app = createApp(App)

// —— **关键两步** ——
// a) 把 echarts 实例“注入”给所有 <VChart> 使用
app.provide('echarts', echarts)
// b) 全局注册 VChart 组件
app.component('VChart', VChart)

// 安装 vue-router 和 ElementPlus
app.use(router)
app.use(ElementPlus, { locale: zhCn })

app.mount('#app')
