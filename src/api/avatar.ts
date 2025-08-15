import request from '@/utils/request'
import type { Avatar } from '@/types/avatar'
import type { ApiResponse, PaginatedData, PaginationParams } from '@/types/api'
import { useUploadStore } from '@/stores/upload'; // 1. 引入 upload store

// 2. 新增/修改形象的API函数，不再需要 progress 回调
export const addAvatar = (data: FormData) => {
  const uploadStore = useUploadStore();
  uploadStore.startUpload(); // 3. 开始上传时，通知store

  return request<ApiResponse<Avatar>>({
    url: '/avatars',
    method: 'POST',
    data,
    headers: { 'Content-Type': 'multipart/form-data' },
    // 4. 在axios配置中更新进度
    onUploadProgress: (progressEvent: any) => {
      const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      uploadStore.updateProgress(percent);
    },
  }).finally(() => {
    uploadStore.finishUpload(); // 5. 无论成功失败，都通知store结束
  });
};

export const updateAvatar = (id: number, data: FormData) => {
  const uploadStore = useUploadStore();
  uploadStore.startUpload();

  return request<ApiResponse<Avatar>>({
    url: `/avatars/${id}`,
    method: 'PUT',
    data,
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent: any) => {
      const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      uploadStore.updateProgress(percent);
    },
  }).finally(() => {
    uploadStore.finishUpload();
  });
};

export const getAvatarList = (params: PaginationParams) => {
  return request<ApiResponse<PaginatedData<Avatar>>>({
    url: '/avatars', 
    method: 'GET',
    params,
  })
}

export const deleteAvatar = (id: number) => {
  return request<ApiResponse>({
    url: `/avatars/${id}`, 
    method: 'DELETE', 
  })
}
