import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path';

export default defineConfig(async () => {
  // 动态导入
  const { pa } = await import('element-plus/es/locales.mjs');
  
  return {
    resolve: {
      alias: {
      '@': path.resolve(__dirname, 'src'),  // 添加 '@' 别名
      '~': path.resolve(__dirname, 'src'),  // 保留您的 '~' 别名
      'axios': path.resolve(__dirname, 'node_modules/axios/dist/axios.min.js') // 直接解析 Axios
      },
    },
    plugins: [vue()],
    server: {
      port: 8080,
      proxy: {
        '/api': {
          target: 'http://localhost:8081',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '') // 移除/api前缀
        }
      }
    }
  }
})