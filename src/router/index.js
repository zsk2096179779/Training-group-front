// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Index from '../pages/index.vue'
import Strategy_Manage from '../pages/strategy_manage.vue'
import NotFound from '../pages/404.vue'

const routes = [
    { path: '/', component: Index },
    { path: '/strategy_manage', component: Strategy_Manage },
    { path: '/:pathMatch(.*)*', component: NotFound }
]

export default createRouter({
    history: createWebHistory(),
    routes
})
