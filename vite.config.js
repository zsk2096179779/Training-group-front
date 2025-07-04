import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  // 代理到8080
  server: {
    proxy: {
      '/combos': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },
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
    port: 5173, // Vue 开发服务器端口
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // 你的后端端口
        changeOrigin: true,
        secure: false,
        // 添加调试信息
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
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

