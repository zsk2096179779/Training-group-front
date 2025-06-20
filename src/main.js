// import { createApp } from 'vue'
// import './style.css'
// import App from './App.vue'
//
// createApp(App).mount('#app')
import { createApp } from 'vue'
import App from './App.vue'
import index from './router/index.js'      // 如果你装了 Vue Router
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)
app.use(ElementPlus)
app.use(createPinia())
app.use(index)
app.mount('#app')
