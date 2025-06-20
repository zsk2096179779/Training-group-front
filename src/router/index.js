import { createRouter, createWebHistory } from 'vue-router'
import ComboList from '@/views/ComboList.vue'
import Test from "@/views/Test.vue";

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
    },
    {
        path: '/test',
        name: 'test',
        component: Test
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router