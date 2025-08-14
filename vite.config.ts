// vite.config.ts

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteMockServe } from 'vite-plugin-mock'

export default defineConfig(({ command }) => {
  return {
    plugins: [
      vue(),
      viteMockServe({
        mockPath: 'mock',
        // 关键：在联调时，我们通常禁用 mock
        enable: false, 
      }),
    ],
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    // --- 核心修改：添加 server.proxy 配置 ---
    server: {
      proxy: {
        // 将所有以 /api/v1 开头的请求，代理到后端的 8080 端口
        '/api/v1': {
          target: 'https://dea2fdad4336.ngrok-free.app', // 这里替换成您后端同事的地址
          changeOrigin: true, // 必须设置为 true，否则后端会拒绝请求
          // 如果后端接口路径没有 /api/v1，可以用 rewrite 去掉
          //rewrite: (path) => path.replace(/^\/api\/v1/, ''),
        },
      },
    },
  }
})