// src/config/menu.js
export default [
    { path: '/fund-research',       title: '基金研究',       icon: '📊', roles: ['USER','ADMIN'] ,
    children: [
        { title: '基金列表',     path: '/fund-research/list',    icon: '📑', roles: ['USER','ADMIN'] },
        { title: '公司维度查询', path: '/fund-research/company', icon: '🏢' , roles: ['USER','ADMIN'] },
        { title: '经理维度查询', path: '/fund-research/manager', icon: '👤' , roles: ['USER','ADMIN'] },
    ]
    },
    { path: '/factor-management',   title: '因子管理',       icon: '⚙️', roles: ['USER','ADMIN'],
        children: [
            { title: '概览', path: '/factor-management',        roles: ['USER','ADMIN'] },
            { title: '因子树', path: '/factor-management/tree', roles: ['USER','ADMIN'] },
            { title: '风格因子', path: '/factor-management/style', roles: ['USER','ADMIN'] },
            {title: '数据源管理', path: '/factor-management/datasource',  roles: ['ADMIN'] },
        ]
    },
    { path: '/strategy-management', title: '策略管理',       icon: '🧩', roles: ['USER','ADMIN'] },
    { path: '/portfolio-management',  title: '组合产品管理',   icon: '🛍️', roles: ['USER','ADMIN'] },
    { path: '/trade-management',    title: '交易管理',       icon: '💱', roles: ['USER','ADMIN'] },
    { path: '/admin',    title: '后台管理',       icon: '🔧', roles: ['ADMIN']     },
]
