import { createRouter, createWebHistory } from 'vue-router'
import ComboList from '@/views/ComboList.vue'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: ComboList
    },
    {
        path: '/combos',
        name: 'ComboList',
        component: ComboList
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router