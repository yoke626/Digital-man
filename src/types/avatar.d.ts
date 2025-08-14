// src/types/avatar.d.ts

export interface Avatar {
  id: number;
  name: string;
  staticImageUrl: string;
  dynamicImageUrl?: string;
  voice?: string;

  // --- 核心修改：添加后端返回的时间戳字段 ---
  createdAt?: string;
  updatedAt?: string;
}