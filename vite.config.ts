// vite.config.ts

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
        // 关键：在联调时，我们通常禁用 mock
        enable: false, 
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    // --- 核心修改：添加 server.proxy 配置 ---
    server: {
      proxy: {
        // 关键：将所有以 /api 开头的请求，都代理到您的ngrok服务器
        '/api': {
          target: 'https://893385b0bde4.ngrok-free.app', // 使用您后端最新的ngrok地址
          changeOrigin: true, // 必须
          // 如果后端接口路径没有 /api/v1，可以用 rewrite 去掉
          //rewrite: (path) => path.replace(/^\/api\/v1/, ''),
          // 我们还需要重写请求头，确保 ngrok-skip-browser-warning 被加上
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              proxyReq.setHeader('ngrok-skip-browser-warning', 'true');
            });
          }
        },
      },
    },
  }
})