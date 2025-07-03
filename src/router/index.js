import { createRouter, createWebHistory } from 'vue-router'
import Auth        from '../components/Auth.vue'
import MainLayout  from '../layouts/MainLayout.vue'

// 下面这几个路径要跟你的文件夹保持一致，如果你做了子目录，请自行调整
const FundList      = () => import('../views/fund-research/List.vue')
const FundCompany   = () => import('../views/fund-research/Company.vue')
const FundManager   = () => import('../views/fund-research/Manager.vue')
const FundProfile   = () => import('../views/fund-research/Profile.vue')

// 因子管理、策略管理等等同理，如果还没建暂时留空页面
const FactorMgmt    = () => import('../views/factor-management/index.vue')
const StrategyMgmt  = () => import('../views/strategy-management/index.vue')
const PortfolioMgmt = () => import('../views/portfolio-management/index.vue')
const TradeMgmt     = () => import('../views/trade-management/index.vue')
const AdminPanel    = () => import('../views/admin-management/index.vue')

// 404 页面
const NotFound      = () => import('../views/NotFound.vue')

const routes = [
    // 登录注册页
    { path: '/login', name: 'Login', component: Auth },

    // 主框架：Header + Sidebar + 二级 <router-view>
    {
        path: '/',
        component: MainLayout,
        children: [
            // 先把 fund-research 做成一个「父路由」，里面再放它的子功能
            {
                path: 'fund-research',
                name: 'FundResearch',
                // 如果需要给 fund-research 做点布局（比如二级菜单栏），可以把它换成 Layout 组件
                // 暂时我们让它直接跳到 list
                redirect: 'fund-research/list'
            },
            {
                path: 'fund-research/list',
                name: 'FundList',
                component: FundList
            },
            {
                path: 'fund-research/company',
                name: 'FundCompany',
                component: FundCompany
            },
            {
                path: 'fund-research/manager',
                name: 'FundManager',
                component: FundManager
            },
            {
                path: 'fund-research/profile/:code',
                name: 'FundProfile',
                component: FundProfile,
                props:true
            },

            // 下面几个模块先兜底一个空白页
            {
                path: 'factor-management',
                name: 'FactorManagement',
                component: FactorMgmt
            },
            {
                path: 'strategy-management',
                name: 'StrategyManagement',
                component: StrategyMgmt
            },
            {
                path: 'portfolio-management',
                name: 'PortfolioManagement',
                component: PortfolioMgmt
            },
            {
                path: 'trade-management',
                name: 'TradeManagement',
                component: TradeMgmt
            },

            // 超管的后台管理
            {
                path: 'admin',
                name: 'Admin',
                component: AdminPanel
            },

            // 根路径直接跳到基金研究首页
            { path: '', redirect: 'fund-research/list' }
        ]
    },

    // 兜底：任何未命中都去 404（或 /login）
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 登录拦截
router.beforeEach((to, from, next) => {
    if (to.path !== '/login' && !localStorage.getItem('jwt_token')) {
        return next('/login')
    }
    next()
})

export default router
