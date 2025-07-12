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
    { path: '/strategy-management', title: '策略管理',       icon: '🧩', roles: ['USER','ADMIN'] ,
        children: [
            {title: '策略管理', path: '/strategy-management',  roles: ['USER','ADMIN'] },
            {title: '策略创建', path: '/strategy-management/create',  roles: ['USER','ADMIN'] },
            {title:'策略监控', path: '/strategy-management/monitor',  roles: ['USER','ADMIN']},
            {title: '配置管理', path: '/strategy-management/setting',  roles: ['USER','ADMIN'] },
        ]

    },
    { path: '/portfolio-management',  title: '组合产品管理',   icon: '🛍️', roles: ['USER','ADMIN'] ,
        children: [
            {title:"组合列表", path: '/portfolio-management/list',  roles: ['USER','ADMIN'] },
        ]
    },

    {
        path: '/trade-management',
        title: '交易管理',
        icon: '💱',
        roles: ['USER','ADMIN'],
        children: [
            {
                title: '组合调仓',
                path: '/trade-management/rebalancing',
                icon: '🔄',
                roles: ['USER','ADMIN']
            },
            {
                title: '差错处理',
                path: '/trade-management/error-handling',
                icon: '⚠️',
                roles: ['USER','ADMIN']
            },
            {
                title: '账户调仓',
                path: '/trade-management/account-rebalancing',
                icon: '🏦',
                roles: ['USER','ADMIN']
            },
            {
                title: '交易单管理',
                path: '/trade-management/orders',
                icon: '📋',
                roles: ['USER','ADMIN']
            },
            {
                title: '交割单管理',
                path: '/trade-management/settlement-slip',
                icon: '📜',
                roles: ['USER','ADMIN']
            },
        ]
    },
    { path: '/admin',    title: '后台管理',       icon: '🔧', roles: ['ADMIN']     },
]
