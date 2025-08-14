// src/types/api.d.ts

// 关键：添加 export
export interface ApiResponse<T = any> {
  code: number;// [cite: 9, 16]
  message: string;// [cite: 10, 17]
  data: T;// [cite: 11, 18]
}

export interface PaginatedData<T> {
  items: T[]; // [cite: 86]
  total: number; // [cite: 94]
  page: number; // [cite: 95]
  size: number; // [cite: 96]
}

export interface PaginationParams {
  page?: number;
  size?: number;
}