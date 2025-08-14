// src/types/auth.d.ts

// 登录请求体
export interface LoginPayload {
  username: string;
  password: string;
}

// 登录成功返回的数据
export interface LoginResponseData {
  token: string;
  expiresIn: number;
}

// 注册请求体
export interface RegisterPayload {
  username: string;
  password: string;
  confirmPassword?: string; // 确认密码字段，用于前端校验
}