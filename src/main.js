// import { createApp } from 'vue'
// import './style.css'
// import App from './App.vue'
//
// createApp(App).mount('#app')
import { createApp } from 'vue'
import App from './App.vue'
import index from './router/index.js'      // 如果你装了 Vue Router
import { createPinia } from 'pinia'

const app = createApp(App)
app.use(createPinia())
app.use(index)
app.mount('#app')
