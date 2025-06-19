import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  // 开发服务器配置（解决跨域问题）
  server: {
    port: 8080, // Vue 开发服务器端口
    proxy: {
      '/api': {
        target: 'http://localhost:8081', // 你的后端端口
        changeOrigin: true
      }
    }
  },

  // 生产环境构建配置
  build: {
    outDir: 'dist', // 打包输出目录
    assetsDir: 'assets', // 静态资源目录
    sourcemap: false, // 是否生成源码映射
    minify: 'terser', // 压缩工具
    terserOptions: {
      compress: {
        drop_console: true, // 移除 console
        drop_debugger: true // 移除 debugger
      }
    },
    rollupOptions: {
      output: {
        // 分割代码，生成更小的文件
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1].split('/')[0].toString();
          }
        }
      }
    }
  }
})
