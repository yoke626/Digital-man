import axios from 'axios';
import { useUserStore } from '@/stores/user';
import { ElMessage } from 'element-plus';

const service = axios.create({
  baseURL: '/api/v1', //
  timeout: 60000,
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 动态导入 store 以避免循环依赖
    const userStore = useUserStore();
    if (userStore.token && config.headers) {
      config.headers['Authorization'] = `Bearer ${userStore.token}`; //
    }

    // --- 核心修改：在这里添加绕过ngrok警告页面的请求头 ---
    // 这个值可以是任意的字符串，"true" 只是一个示例
    config.headers['ngrok-skip-browser-warning'] = 'true';
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 (保持之前的修改，保持健壮性)
service.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (typeof res !== 'object' || res === null || res.code === undefined) {
      return response;
    }
    if (res.code !== 200 && res.code !== 201 && res.code !== 204) {
      ElMessage.error(res.message || 'Error');
      return Promise.reject(new Error(res.message || 'Error'));
    }
    return response;
  },
  (error) => {
     ElMessage.error(error.response?.data?.message || error.message || 'Request Error');
    return Promise.reject(error);
  }
);

// 关键：确保有默认导出
export default service;