import { defineStore } from 'pinia';
import { ref } from 'vue';
import { login as loginApi } from '@/api/auth';
import type { LoginPayload } from '@/types/auth';
import router from '@/router';

export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref<string | null>(null);
    const username = ref<string>('');

    const handleLogin = async (payload: LoginPayload) => {
      const response = await loginApi(payload);
      const apiResponse = response.data;

      if (apiResponse.code === 200) {
        token.value = apiResponse.data.token;
        username.value = payload.username;
        router.push('/digital-human'); // 登录成功后跳转
      }
      return apiResponse;
    };

    const logout = () => {
      token.value = null;
      username.value = '';
      router.push('/login');
    };

    return {
      token,
      username,
      handleLogin,
      logout,
    };
  },
  {
    persist: {  // 配置持久化
      storage: localStorage, // 指定存储方式为浏览器的 localstorage
      pick: ['token', 'username'],
    },
  }
);