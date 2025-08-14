// src/stores/user.ts

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
        router.push('/digital-human');
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
  // --- 核心修改：确保 persist 对象的结构正确 ---
  {
    persist: {
      storage: localStorage, // 您可以明确指定存储方式
      pick: ['token', 'username'], // 要持久化的 state 字段
    },
  }
);