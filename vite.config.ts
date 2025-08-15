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
        enable: false,  // 联调时设置为 false， 前期做UI时设置为 true
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'), // 配置 @ 别名，方便导入
      },
    },
    server: {
      // 服务器代理 proxy，前端开发解决跨域问题的最佳实践
      proxy: {
        '/api': { // 拦截所有以 /api 开头的请求
          target: 'https://01e0023522be.ngrok-free.app', // 代理到后端服务器地址
          changeOrigin: true, // 必须，否则可能代理失败
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              proxyReq.setHeader('ngrok-skip-browser-warning', 'true'); // 绕过 ngrok 的浏览器警告
            });
          }
        },
      },
    },
  }
})