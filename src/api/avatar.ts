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

// 1. 获取形象列表（分页）[cite: 73]
export const getAvatarList = (params: PaginationParams) => {
  return request<ApiResponse<PaginatedData<Avatar>>>({
    url: '/avatars', // [cite: 75]
    method: 'GET', // [cite: 76]
    params,
  })
}

// 2. 删除形象 [cite: 117]
export const deleteAvatar = (id: number) => {
  return request<ApiResponse>({
    url: `/avatars/${id}`, // [cite: 118]
    method: 'DELETE', // [cite: 119]
  })
}

// // 3. 新增形象 (使用 FormData) [cite: 51]
// export const addAvatar = (data: FormData) => {
//   return request<ApiResponse<Avatar>>({
//     url: '/avatars', // [cite: 52]
//     method: 'POST', // [cite: 53]
//     data,
//     headers: {
//       'Content-Type': 'multipart/form-data', // [cite: 54]
//     },
//   })
// }

// // 4. 修改形象 (使用 FormData) [cite: 100]
// export const updateAvatar = (id: number, data: FormData) => {
//   return request<ApiResponse<Avatar>>({
//     url: `/avatars/${id}`, // [cite: 101]
//     method: 'PUT', // [cite: 102]
//     data,
//     headers: {
//       'Content-Type': 'multipart/form-data', // [cite: 103]
//     },
//   })
// }