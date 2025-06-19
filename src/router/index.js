// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import DataSourceConfig from '../views/DataSourceConfig.vue'
import FactorManagement from '../views/FactorManagement.vue'
import Analysis from '../views/Analysis.vue'
import Settings from '../views/Settings.vue'
import FactorTreeManagement from '../views/FactorTreeManagement.vue'

const routes = [
    { 
        path: '/', 
        name: 'DataSourceConfig',
        component: DataSourceConfig 
    },
    { 
        path: '/factors', 
        name: 'Factors',
        component: FactorManagement 
    },
    { 
        path: '/analysis', 
        name: 'Analysis',
        component: Analysis 
    },
    { 
        path: '/settings', 
        name: 'Settings',
        component: Settings 
    },
    { 
        path: '/factor-tree', 
        name: 'FactorTree',
        component: FactorTreeManagement 
    },
    { 
        path: '/datasource', 
        name: 'DataSourceConfigPage',
        component: DataSourceConfig 
    }
]

export default createRouter({
    history: createWebHistory(),
    routes,
})
