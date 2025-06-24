// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { isAuthenticated, isAdmin } from '@/utils/auth'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import DataSourceConfig from '../views/DataSourceConfig.vue'
import FactorManagement from '../views/FactorManagement.vue'
import Analysis from '../views/Analysis.vue'
import FactorTreeManagement from '../views/FactorTreeManagement.vue'

const routes = [
    { 
        path: '/', 
        name: 'Login',
        component: Login 
    },
    { 
        path: '/login', 
        name: 'LoginPage',
        component: Login 
    },
    { 
        path: '/register', 
        name: 'Register',
        component: Register 
    },
    { 
        path: '/datasource', 
        name: 'DataSourceConfig',
        component: DataSourceConfig,
        meta: { requiresAuth: true, requiresAdmin: true }
    },
    { 
        path: '/factors', 
        name: 'Factors',
        component: FactorManagement,
        meta: { requiresAuth: true }
    },
    { 
        path: '/analysis', 
        name: 'Analysis',
        component: Analysis,
        meta: { requiresAuth: true }
    },
    { 
        path: '/factor-tree', 
        name: 'FactorTree',
        component: FactorTreeManagement,
        meta: { requiresAuth: true }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

// 路由守卫
router.beforeEach((to, from, next) => {
    // 检查路由是否需要认证
    if (to.meta.requiresAuth) {
        // 检查用户是否已登录
        if (!isAuthenticated()) {
            // 未登录，重定向到登录页
            next({ name: 'Login' })
        } else {
            // 检查路由是否需要管理员权限
            if (to.meta.requiresAdmin && !isAdmin()) {
                // 非管理员访问，可以重定向到无权限页面或首页
                next({ name: 'Factors' }) // 或者 next('/403-forbidden')
            } else {
                // 权限满足，允许访问
                next()
            }
        }
    } else {
        // 不需要认证的路由，直接允许访问
        next()
    }
})

export default router
