// src/api/auth.ts

import request from '@/utils/request';
import type { ApiResponse } from '@/types/api';
// 核心修正：确保从 @/types/auth 导入，而不是 './auth'
import type { LoginPayload, LoginResponseData, RegisterPayload } from '@/types/auth';

/**
 * 用户登录
 * @param data 包含用户名和密码
 */
export const login = (data: LoginPayload) => {
  return request<ApiResponse<LoginResponseData>>({
    url: '/auth/login',
    method: 'POST',
    data,
  });
};

/**
 * 用户注册
 * @param data 包含用户名和密码
 */
export const register = (data: RegisterPayload) => {
  //delete data.confirmPassword;
  return request<ApiResponse>({
    url: '/auth/register',
    method: 'POST',
    data,
  });
};