import { createRouter, createWebHistory } from 'vue-router'
import Auth           from '../components/Auth.vue'
import MainLayout     from '../layouts/MainLayout.vue'
import { isAuthenticated, isAdmin } from '@/utils/auth'

// fund-research 系列
const FundList      = () => import('../views/fund-research/List.vue')
const FundCompany   = () => import('../views/fund-research/Company.vue')
const FundManager   = () => import('../views/fund-research/Manager.vue')
const FundProfile   = () => import('../views/fund-research/Profile.vue')

// 其他模块空白页
const FactorMgmt    = () => import('../views/factor-management/index.vue')
const StrategyMgmt  = () => import('../views/strategy-management/index.vue')
const PortfolioMgmt = () => import('../views/portfolio-management/index.vue')
const TradeMgmt     = () => import('../views/trade-management/index.vue')
const AdminPanel    = () => import('../views/admin-management/index.vue')

// lyb 分支新增
const DataSourceConfig      = () => import('../views/DataSourceConfig.vue')
const FactorManagementView  = () => import('../views/FactorManagement.vue')
const FactorTreeManagement  = () => import('../views/FactorTreeManagement.vue')
const StyleFactorManagement = () => import('@/views/StyleFactorManagement.vue')

// 通用 404
const NotFound = () => import('../views/NotFound.vue')

const routes = [
    // 登录、注册
    {
        path: '/login',
        name: 'Login',
        component: Auth,
        meta: { requiresAuth: false }
    },
    {
        path: '/register',
        name: 'Register',
        component: Auth,
        meta: { requiresAuth: false }
    },

    // 主框架
    {
        path: '/',
        component: MainLayout,
        children: [
            // 默认跳转
            { path: '', redirect: 'fund-research/list' },

            // fund-research
            { path: 'fund-research', redirect: 'fund-research/list' },
            {
                path: 'fund-research/list',
                name: 'FundList',
                component: FundList,
                meta: { requiresAuth: true }
            },
            {
                path: 'fund-research/company',
                name: 'FundCompany',
                component: FundCompany,
                meta: { requiresAuth: true }
            },
            {
                path: 'fund-research/manager',
                name: 'FundManager',
                component: FundManager,
                meta: { requiresAuth: true }
            },
            {
                path: 'fund-research/profile/:code',
                name: 'FundProfile',
                component: FundProfile,
                props: true,
                meta: { requiresAuth: true }
            },

            // 其它模块
            {
                path: 'factor-management',
                name: 'FactorManagement',
                component: FactorMgmt,
                meta: { requiresAuth: true }
            },
            {
                path: 'strategy-management',
                name: 'StrategyManagement',
                component: StrategyMgmt,
                meta: { requiresAuth: true }
            },
            {
                path: 'portfolio-management',
                name: 'PortfolioManagement',
                component: PortfolioMgmt,
                meta: { requiresAuth: true }
            },
            {
                path: 'trade-management',
                name: 'TradeManagement',
                component: TradeMgmt,
                meta: { requiresAuth: true }
            },

            // 管理后台
            {
                path: 'admin',
                name: 'Admin',
                component: AdminPanel,
                meta: { requiresAuth: true, requiresAdmin: true }
            },

            // lyb 分支的业务页
            {
                path: 'datasource',
                name: 'DataSourceConfig',
                component: DataSourceConfig,
                meta: { requiresAuth: true, requiresAdmin: true }
            },
            {
                path: 'factors',
                name: 'Factors',
                component: FactorManagementView,
                meta: { requiresAuth: true }
            },
            {
                path: 'factor-tree',
                name: 'FactorTree',
                component: FactorTreeManagement,
                meta: { requiresAuth: true }
            },
            {
                path: 'style-factor-management',
                name: 'StyleFactorManagement',
                component: StyleFactorManagement,
                meta: { requiresAuth: true }
            }
        ]
    },

    // 兜底 404
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: NotFound
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 全局守卫：鉴权 + 超管校验
router.beforeEach((to, from, next) => {
    if (to.meta.requiresAuth) {
        if (!isAuthenticated()) {
            return next({ name: 'Login' })
        }
        if (to.meta.requiresAdmin && !isAdmin()) {
            // 非管理员访问管理页，重定向到基金列表
            return next({ name: 'FundList' })
        }
    }
    next()
})

export default router
