// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Index from '../pages/index.vue'
import About from '../pages/about.vue'
import NotFound from '../pages/404.vue'

const routes = [
    { path: '/', component: Index },
    { path: '/about', component: About },
    { path: '/:pathMatch(.*)*', component: NotFound }
]

export default createRouter({
    history: createWebHistory(),
    routes
})
