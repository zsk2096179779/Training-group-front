// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Index from '../pages/index.vue'
import Leader from '../pages/Leader.vue'
import NotFound from '../pages/404.vue'
import StrategyManagement from '../pages/StrategyManagement.vue'
import StrategyCreation from '../pages/StrategyCreation.vue'
import StrategyMonitoring from '../pages/StrategyMonitoring.vue'
import RebalanceSetting from '../pages/RebalanceSetting.vue'

const routes = [
    { path: '/', component: Index },
    { 
        path: '/Leader', 
        component:Leader,
        children: [
            { path: '/strategy-management',name: 'StrategyManagement',component: StrategyManagement},
            { path: '/strategy-creation',name: 'StrategyCreation',component: StrategyCreation},
            { path: '/strategy-monitoring',name: 'StrategyMonitoring',component: StrategyMonitoring},
            { path: '/rebalance-setting',name: 'RebalanceSetting',component: RebalanceSetting}
        ]
    },
    { path: '/:pathMatch(.*)*', component: NotFound }, 
]

export default createRouter({
    history: createWebHistory(),
    routes
})
