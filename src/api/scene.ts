import request from '@/utils/request'
import type { Scene } from '@/types/scene'
import type { ApiResponse, PaginatedData, PaginationParams } from '@/types/api'

//1. 获取场景列表（分页）
export const getSceneList = (params: PaginationParams) => {
  return request<ApiResponse<PaginatedData<Scene>>>({
    url: '/scenes', 
    method: 'GET',
    params,
  })
}

//2. 设定当前选中场景
export const selectScene = (id: number) => {
  return request<ApiResponse>({
    url: `/scenes/${id}/select`, 
    method: 'PATCH', 
  })
}

//3. 删除场景
export const deleteScene = (id: number) => {
  return request<ApiResponse>({
    url: `/scenes/${id}`, 
    method: 'DELETE',
  })
}

//4. 新增场景 (使用 FormData)
export const addScene = (data: FormData) => {
  return request<ApiResponse<Scene>>({
    url: '/scenes',
    method: 'POST',
    data,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}


// 5. 修改场景 (使用 FormData)
export const updateScene = (id: number, data: FormData) => {
  return request<ApiResponse<Scene>>({
    url: `/scenes/${id}`,
    method: 'PUT',
    data,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}