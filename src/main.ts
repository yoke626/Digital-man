import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate' 

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

import App from './App.vue'
import router from './router'
import { useUserStore } from './stores/user'

const app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

const pinia = createPinia() 
pinia.use(piniaPluginPersistedstate)

app.use(pinia) // 使用配置好的 Pinia 实例  解决未经登录直接进入后台问题：必须在router之前
app.use(router)

router.beforeEach((to, _from, next) => {
  // 在这里调用 useUserStore，可以确保 Pinia 实例已被激活
  const userStore = useUserStore();
  const isAuthenticated = !!userStore.token && !!userStore.username; // 第一个！为逻辑非，第二个！是把后面的字符串强转为布尔值
  const requiresAuth = to.meta.requiresAuth; // 读取路由元信息

  if (requiresAuth && !isAuthenticated) {
    //在重定向之前弹出提示
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