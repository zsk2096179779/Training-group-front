import { createRouter, createWebHistory } from 'vue-router'
import Auth       from '../components/Auth.vue'
import MainLayout from '../layouts/MainLayout.vue'
import { isAuthenticated, isAdmin } from '@/utils/auth'
import StrategyManagement from '../pages/StrategyManagement.vue'
import StrategyCreation from '../pages/StrategyCreation.vue'
import StrategyMonitoring from '../pages/StrategyMonitoring.vue'
import RebalanceSetting from '../pages/RebalanceSetting.vue'
import StrategyDetail from '../pages/Detail.vue'
// fund-research 系列
const FundList    = () => import('../views/fund-research/List.vue')
const FundCompany = () => import('../views/fund-research/Company.vue')
const FundManager = () => import('../views/fund-research/Manager.vue')
const FundProfile = () => import('../views/fund-research/Profile.vue')

// 因子管理分页组件
const FactorOverview = () => import('../views/factor-management/FactorManagement.vue')
const FactorLayout         = () => import('../components/FactorLayout.vue') // 父组件，需要 <router-view/>
const FactorTreeManagement = () => import('../views/factor-management/FactorTreeManagement.vue')
const StyleFactorManagement= () => import('../views/factor-management/StyleFactorManagement.vue')
const DataSourceConfig = () => import('../views/factor-management/DataSourceConfig.vue')


//组合调仓分页组件
const PortfolioLayout = () => import('../components/PortfolioLayout.vue')
const ComboList = () => import('../views/portfolio-management/ComboList.vue')
const ComboCreate = () => import('../views/portfolio-management/ComboCreate.vue')
const DIYComboList = () => import('../views/portfolio-management/DiyComboList.vue')

// 其它模块空白页
const StrategyMgmt  = () => import('../views/strategy-management/index.vue')

const TradeMgmt     = () => import('../views/trade-management/index.vue')
const AdminPanel    = () => import('../views/admin-management/index.vue')
const NotFound      = () => import('../views/NotFound.vue')


const routes = [
    // 登录 / 注册
    { path: '/login',    name: 'Login',    component: Auth, meta: { requiresAuth: false } },
    { path: '/register', name: 'Register', component: Auth, meta: { requiresAuth: false } },

    // 主框架
    {
        path: '/',
        component: MainLayout,
        children: [
            { path: '', redirect: 'fund-research/list' },

            // —— 基金研究 —— //
            { path: 'fund-research',              redirect: 'fund-research/list' },
            { path: 'fund-research/list',         name: 'FundList',    component: FundList,    meta: { requiresAuth: true } },
            { path: 'fund-research/company',      name: 'FundCompany', component: FundCompany, meta: { requiresAuth: true } },
            { path: 'fund-research/manager',      name: 'FundManager', component: FundManager, meta: { requiresAuth: true } },
            { path: 'fund-research/profile/:code',
                name: 'FundProfile',
                component: FundProfile,
                props: true,
                meta: { requiresAuth: true }
            },

            // —— 因子管理 —— //
            {
                path: 'factor-management',
                component: FactorLayout,
                meta: { requiresAuth: true },
                children: [
                    { path: '',                name: 'FactorOverview',        component: FactorOverview },
                    { path: 'tree',            name: 'FactorTreeManagement',    component: FactorTreeManagement },
                    { path: 'style',           name: 'StyleFactorManagement',   component: StyleFactorManagement },
                    { path: 'datasource',      name: 'DataSourceConfig',        component: DataSourceConfig },
                ]
            },

            {
                path: 'portfolio-management',
                component:PortfolioLayout,
                meta: { requiresAuth: true },
                children: [
                    {
                        path: 'list',
                        name: 'ComboList',
                        component: ComboList,
                        meta: {  title: '组合列表' }
                    },

                    {
                        path: 'create',
                        name: 'ComboCreate',
                        component: ComboCreate,
                        meta: {  title: '创建组合'}
                    },

                    {
                        path: 'diy',
                        name: 'DIYComboList',
                        component: DIYComboList,
                        meta: { title: '我的组合'}
                    },
                ]
            },
    { path: '/', component: Index },
    {
        path: '/Leader',
        component:Leader,
        children: [
            { path: '/strategy-management',name: 'StrategyManagement',component: StrategyManagement},
            { path: '/strategy-creation',name: 'StrategyCreation',component: StrategyCreation},
            { path: '/strategy-monitoring',name: 'StrategyMonitoring',component: StrategyMonitoring},
            { path: '/rebalance-setting',name: 'RebalanceSetting',component: RebalanceSetting},
            { path: '/strategy-management/Detail',name : 'StrategyDetail',component: StrategyDetail}
        ]
    },
    { path: '/:pathMatch(.*)*', component: NotFound },
]


            // 其它模块
            { path: 'strategy-management',   name: 'StrategyManagement',   component: StrategyMgmt,  meta: { requiresAuth: true } },
            { path: 'trade-management',      name: 'TradeManagement',      component: TradeMgmt,     meta: { requiresAuth: true } },
            { path: 'admin',                 name: 'Admin',                component: AdminPanel,    meta: { requiresAuth: true, requiresAdmin: true } }
        ]
    },

    // 404
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    if (to.meta.requiresAuth) {
        if (!isAuthenticated()) return next({ name: 'Login' })
        if (to.meta.requiresAdmin && !isAdmin()) {
            return next({ name: 'FundList' })
        }
    }
    next()
})

export default router