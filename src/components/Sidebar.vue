<!-- src/components/Sidebar.vue -->
<template>
  <aside class="sidebar">
    <ul class="menu-list">
      <li v-for="item in filteredMenu" :key="item.path" class="menu-item-wrap">
        <!-- 如果有 children，就用 <div> 点击折叠，不跳路由 -->
        <div
            v-if="item.children"
            class="menu-item top-level"
            :class="{ expanded: isOpen(item.path) }"
            @click="toggle(item.path)"
        >
          <span class="icon">{{ item.icon }}</span>
          <span class="title">{{ item.title }}</span>
          <span class="arrow">{{ isOpen(item.path) ? '▾' : '▸' }}</span>
        </div>
        <!-- 无 children 的顶级菜单才用 router-link -->
        <router-link
            v-else
            :to="item.path"
            class="menu-item top-level"
            active-class="active-link"
        >
          <span class="icon">{{ item.icon }}</span>
          <span class="title">{{ item.title }}</span>
        </router-link>

        <!-- 子菜单 -->
        <ul v-if="item.children && isOpen(item.path)" class="submenu-list">
          <li
              v-for="sub in item.children"
              :key="sub.path"
              class="submenu-item"
          >
            <router-link
                :to="sub.path"
                class="menu-item"
                active-class="active-link"
            >
              <span class="dot">·</span>
              <span class="title">{{ sub.title }}</span>
            </router-link>
          </li>
        </ul>
      </li>
    </ul>
  </aside>
</template>

<script>
import menuConfig from '../config/menu.js'

export default {
  name: 'Sidebar',
  data() {
    return {
      // 用来记录当前展开了哪些菜单 path
      openPaths: []
    }
  },
  computed: {
    userRole() {
      return localStorage.getItem('user_role') || 'USER'
    },
    filteredMenu() {
      const role = this.userRole
      return menuConfig
          .filter(item =>
              Array.isArray(item.roles) && item.roles.includes(role)
      )
          // 2. 对每个留下的菜单，处理它的 children
          .map(item => {
            // 如果它原本有 children，就再过滤子项
            let children = []
            if (Array.isArray(item.children)) {
              children = item.children.filter(sub =>
                  Array.isArray(sub.roles) && sub.roles.includes(role)
              )
            }
            // 如果原本定义了 children 且过滤后没有任何子项，就不展示这个父菜单
            if (Array.isArray(item.children) && children.length === 0) {
              return null
            }
            // 否则把过滤后的 children (可能是 [] 或有效数组) 赋回去
            return {
              ...item,
              children
            }
          })
          // 3. 去掉上一步 map 里返回 null 的
          .filter(item => item !== null)
    }
  },
  methods: {
    isOpen(path) {
      return this.openPaths.includes(path)
    },
    toggle(path) {
      const idx = this.openPaths.indexOf(path)
      if (idx === -1) {
        this.openPaths.push(path)
      } else {
        this.openPaths.splice(idx, 1)
      }
    }
  }
}
</script>

<style scoped>
.sidebar {
  width: 240px;
  background: #0367a6;
  color: #fff;
  overflow-y: auto;
}
.menu-list {
  margin: 0;
  padding: 0;
  list-style: none;
}
.menu-item-wrap {
  margin-bottom: 0.25rem;
}
.menu-item, .menu-item.top-level {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: #fff;
  text-decoration: none;
  cursor: pointer;
  user-select: none;
}
.menu-item.top-level.active-link {
  background: rgba(255,255,255,0.15);
}
/* 折叠状态下箭头和加粗 */
.menu-item.top-level.expanded {
  font-weight: bold;
}
.arrow {
  margin-left: auto;
  font-size: 0.8em;
}
.submenu-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.submenu-item {
  margin-left: 1.5rem;
}
.submenu-item .menu-item {
  display: flex;
  align-items: center;
  padding: 0.4rem 1rem;
  color: #eee;
  text-decoration: none;
  font-size: 0.9rem;
}
.submenu-item .menu-item.active-link {
  background: rgba(255,255,255,0.1);
}
.dot {
  margin-right: 0.5rem;
}
.icon {
  margin-right: 0.5rem;
}
.title {
  flex: 1;
}
</style>
