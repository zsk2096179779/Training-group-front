import { createRouter, createWebHistory } from 'vue-router'
import ComboList from '@/views/ComboList.vue'
import Test from "@/views/Test.vue";
import DIYComboList from "@/views/DIYComboList.vue";
import ComboCreate from "@/views/ComboCreate.vue";

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
        path: '/create',
        name: 'ComboCreate',
        component: ComboCreate
    },

    {
        path: '/mycombos',
        name: 'DIYComboList',
        component: DIYComboList
    }

]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router