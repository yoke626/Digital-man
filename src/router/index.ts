import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/components/layout/Layout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // 使用 H5 History 模式，URL 更美观（没有 #）
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/login/Login.vue'), // 组件懒加载
      meta: { requiresAuth: false } // meta 字段用于存放自定义数据
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('../views/register/Register.vue'),
      meta: { requiresAuth: false } // 不需要认证
    },
    {
      path: '/main',
      component: Layout,
      redirect: '/digital-human',
      children: [ // 嵌套路由，共享 Layout 布局
        {
          path: '/digital-human',
          name: 'DigitalHuman',
          component: () => import('../views/digital-human/DigitalHumanConfig.vue'),
          meta: {
            title: '数字人配置',
            icon: 'User',
            buttonText: '增加数字人',
            requiresAuth: true // 明确需要认证
          }
        },
        {
          path: '/scene-management',
          name: 'SceneManagement',
          component: () => import('../views/scene-management/SceneManagement.vue'),
          meta: {
            title: '场景管理',
            icon: 'Picture',
            buttonText: '增加场景',
            requiresAuth: true // 明确需要认证
          }
        },
        {
          path: '/avatar-management',
          name: 'AvatarManagement',
          component: () => import('../views/avatar-management/AvatarManagement.vue'),
          meta: {
            title: '形象管理',
            icon: 'Avatar',
            buttonText: '增加形象',
            requiresAuth: true // 明确需要认证
          }
        }
      ]
    }
  ],
})

export default router