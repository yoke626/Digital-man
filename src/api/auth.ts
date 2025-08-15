import request from '@/utils/request';
import type { ApiResponse } from '@/types/api';
import type { LoginPayload, LoginResponseData, RegisterPayload } from '@/types/auth';

export const login = (data: LoginPayload) => {
  return request<ApiResponse<LoginResponseData>>({
    url: '/auth/login',
    method: 'POST',
    data,
  });
};

export const register = (data: RegisterPayload) => {
  return request<ApiResponse>({
    url: '/auth/register',
    method: 'POST',
    data,
  });
};