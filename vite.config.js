import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path';

export default defineConfig(async () => {
  // 动态导入
  const { pa } = await import('element-plus/es/locales.mjs');
  
  return {
    resolve: {
      alias: {
        '~': path.resolve(__dirname, 'src')
      },
    },
    plugins: [vue()],
  }
})