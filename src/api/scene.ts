import request from '@/utils/request'
import type { Scene } from '@/types/scene'
import type { ApiResponse, PaginatedData, PaginationParams } from '@/types/api'

/**
 * 1. 获取场景列表（分页）
 * @param params 包含page和size
 */
export const getSceneList = (params: PaginationParams) => {
  return request<ApiResponse<PaginatedData<Scene>>>({
    url: '/scenes', // [cite: 150]
    method: 'GET', // [cite: 151]
    params,
  })
}

/**
 * 2. 设定当前选中场景
 * @param id 场景的ID
 */
export const selectScene = (id: number) => {
  return request<ApiResponse>({
    url: `/scenes/${id}/select`, // [cite: 185]
    method: 'PATCH', // [cite: 186]
  })
}

/**
 * 3. 删除场景
 * @param id 场景的ID
 */
export const deleteScene = (id: number) => {
  return request<ApiResponse>({
    url: `/scenes/${id}`, // [cite: 192]
    method: 'DELETE', // [cite: 193]
  })
}

// 注意：新增和修改场景的功能(POST /scenes, PUT /scenes/{id})在此暂未实现，
// 因为它们通常需要一个单独的弹窗表单来完成，我们可以在下一步实现。

/**
 * 4. 新增场景 (使用 FormData)
 * @param data 包含名称和场景文件的 FormData
 */
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

/**
 * 5. 修改场景 (使用 FormData)
 * @param id 场景的ID
 * @param data 包含名称和场景文件的 FormData
 */
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