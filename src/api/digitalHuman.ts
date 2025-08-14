import request from '@/utils/request'
import type { DigitalHuman } from '@/types/digitalHuman'
import type { ApiResponse, PaginatedData, PaginationParams } from '@/types/api'

// 1. 获取数字人列表（分页）
export const getDigitalHumanList = (params: PaginationParams) => {
  return request<ApiResponse<PaginatedData<DigitalHuman>>>({
    url: '/digital-humans',
    method: 'GET',
    params,
  })
}

// 2. 新增数字人
export const addDigitalHuman = (data: Omit<DigitalHuman, 'id' | 'status' | 'avatar'>) => {
  return request<ApiResponse<DigitalHuman>>({
    url: '/digital-humans',
    method: 'POST',
    data,
  })
}

// 3. 修改数字人
export const updateDigitalHuman = (id: number, data: Partial<Omit<DigitalHuman, 'id' | 'status' | 'avatar'>>) => {
  return request<ApiResponse<DigitalHuman>>({
    url: `/digital-humans/${id}`,
    method: 'PUT',
    data,
  })
}

// 4. 修改数字人状态 (启用/停用)
export const updateDigitalHumanStatus = (id: number, status: 'ENABLED' | 'DISABLED') => {
  return request<ApiResponse>({
    url: `/digital-humans/${id}/status`,
    method: 'PATCH',
    data: { status },
  })
}

// 5. 删除数字人
export const deleteDigitalHuman = (id: number) => {
  return request<ApiResponse>({
    url: `/digital-humans/${id}`,
    method: 'DELETE',
  })
}