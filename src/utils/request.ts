import axios from 'axios';
import { useUserStore } from '@/stores/user';
import { ElMessage } from 'element-plus';

// 新增：一个递归函数，用于深度转换URL （将后端传来的完整资源路径转换为相对路径）
const convertUrlsToRelative = (data: any, baseUrl: string): any => {
  if (!data) return data;

  if (Array.isArray(data)) {
    return data.map(item => convertUrlsToRelative(item, baseUrl));
  }

  if (typeof data === 'object' && data !== null) {
    const newData: { [key: string]: any } = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        let value = data[key];
        if (typeof value === 'string' && value.startsWith(baseUrl)) {
          // 将绝对URL替换为空字符串，得到相对路径
          newData[key] = value.replace(baseUrl, '');
        } else {
          newData[key] = convertUrlsToRelative(value, baseUrl);
        }
      }
    }
    return newData;
  }
  return data;
};


const service = axios.create({
  baseURL: '/api/v1', // 所有请求的基础路径，会和 vite.config.ts 的 /api 匹配
  timeout: 60000,
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const userStore = useUserStore();
    if (userStore.token && config.headers) {
      config.headers['Authorization'] = `Bearer ${userStore.token}`;
    }
    // 注意：这个头现在由Vite Proxy在服务器端添加，客户端可以不加，但保留也无妨
    config.headers['ngrok-skip-browser-warning'] = 'true';
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    // 全局转换URL
    if (response.data && response.config.baseURL) {
        // 动态获取代理的目标地址来进行转换
        const targetUrl = 'https://01e0023522be.ngrok-free.app';
        response.data = convertUrlsToRelative(response.data, targetUrl);
    }

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

// 确保有默认导出
export default service;