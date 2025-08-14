// src/main.ts

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate' // 1. 引入插件

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus' // 1. 核心修改：在这里导入 ElMessage

import App from './App.vue'
import router from './router'
import { useUserStore } from './stores/user' // 引入 user store

const app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

const pinia = createPinia() // 创建 Pinia 实例
pinia.use(piniaPluginPersistedstate) // 2. 在 Pinia 实例上注册插件

app.use(pinia) // 3. 使用配置好的 Pinia 实例  解决未经登录直接进入后台问题：必须在router之前
app.use(router)

// --- 核心修改：将导航守卫放在这里 ---
router.beforeEach((to, _from, next) => {
  // 在这里调用 useUserStore，可以确保 Pinia 实例已被激活
  const userStore = useUserStore();
  const isAuthenticated = !!userStore.token && !!userStore.username; // 第一个！为逻辑非，第二个！是把后面的字符串强转为布尔值
  const requiresAuth = to.meta.requiresAuth;

  if (requiresAuth && !isAuthenticated) {
    // 2. 核心修改：在重定向之前弹出提示
    ElMessage.warning('请先登录！');
    next({ name: 'Login' });
  } else if ((to.name === 'Login' || to.name === 'Register') && isAuthenticated) { // === 为严格全等，会检查值和类型是否都相等
    next({ path: '/digital-human' });
  } else {
    next();
  }
});

app.use(ElementPlus)

app.mount('#app')