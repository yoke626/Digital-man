import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteMockServe } from 'vite-plugin-mock'

import path from 'path'

export default defineConfig(({ command }) => {
  return {
    plugins: [
      vue(),
      viteMockServe({
        mockPath: 'mock',
        enable: false,  // 后端修复后关闭mock，使用真实API
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'), // 配置 @ 别名，方便导入
      },
    },
    server: {
      port: 5174,
      strictPort: true,
      // 服务器代理 proxy，前端开发解决跨域问题的最佳实践
      proxy: {
        '/api': { // 拦截所有以 /api 开头的请求
          target: 'https://7d0449b36d4a.ngrok-free.app', // 代理到后端服务器地址
          changeOrigin: true, // 必须，否则可能代理失败
          secure: false, // 允许不安全的HTTPS连接
          // 为所有被代理到 ngrok 的请求（包括 OPTIONS）附加 header
          headers: {
            'ngrok-skip-browser-warning': 'true',
          },
        },
      },
      // 明确允许自定义请求头，避免本地预检拦截
      cors: {
        origin: true,
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
      },
    },
  }
})