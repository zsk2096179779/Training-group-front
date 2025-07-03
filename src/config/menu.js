// src/config/menu.js
export default [
    { path: '/fund-research',       title: '基金研究',       icon: '📊', roles: ['USER','ADMIN'] ,
    children: [
        { title: '基金列表',     path: '/fund-research/list',    icon: '📑' },
        { title: '公司维度查询', path: '/fund-research/company', icon: '🏢' },
        { title: '经理维度查询', path: '/fund-research/manager', icon: '👤' },
    ]
    },
    { path: '/factor-management',   title: '因子管理',       icon: '⚙️', roles: ['USER','ADMIN'] },
    { path: '/strategy-management', title: '策略管理',       icon: '🧩', roles: ['USER','ADMIN'] },
    { path: '/portfolio-management',  title: '组合产品管理',   icon: '🛍️', roles: ['USER','ADMIN'] },
    { path: '/trade-management',    title: '交易管理',       icon: '💱', roles: ['USER','ADMIN'] },
    { path: '/admin-management',    title: '后台管理',       icon: '🔧', roles: ['ADMIN']     },
]
