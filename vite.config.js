import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueDevTools from 'vite-plugin-vue-devtools'

// 将 defineConfig 的参数改为一个接收 mode 的函数
export default defineConfig(({ mode }) => ({
  plugins: [
    vue(),
    // 使用三元运算符，判断只有在开发模式下 (mode === 'development') 才加载 VueDevTools
    mode === 'development' ? VueDevTools() : undefined,
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    port: 5173,
    host: true,
    open: true
  }
}))
