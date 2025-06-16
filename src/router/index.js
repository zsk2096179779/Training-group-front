// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../components/HelloWorld.vue'

const routes = [
    { path: '/', component: Home }
]

export default createRouter({
    history: createWebHistory(),
    routes,
})
