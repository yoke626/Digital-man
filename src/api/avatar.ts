import request from '@/utils/request'
import type { Avatar } from '@/types/avatar'
import type { ApiResponse, PaginatedData, PaginationParams } from '@/types/api'


export const uploadAvatarFile = (file: File, onUploadProgress: (e: any) => void) => {
  const formData = new FormData();
  formData.append('file', file);

  return request<ApiResponse<{ fileName: string; fileUrl: string }>>({
    url: '/avatars/upload',
    method: 'POST',
    data: formData,
    onUploadProgress,
  });
};


export const createAvatarWithFiles = (payload: { name: string; voice?: string; staticImageFileName: string; dynamicImageFileName?: string }) => {
  const params = new URLSearchParams();
  params.append('name', payload.name);
  if (payload.voice) params.append('voice', payload.voice);
  params.append('staticImageFileName', payload.staticImageFileName);
  if (payload.dynamicImageFileName) params.append('dynamicImageFileName', payload.dynamicImageFileName);

  return request<ApiResponse<Avatar>>({
    url: '/avatars/create-with-files',
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    data: params,
  });
};


export const updateAvatarWithFiles = (id: number, payload: { name?: string; voice?: string; staticImageFileName?: string; dynamicImageFileName?: string }) => {
  const params = new URLSearchParams();
  // Only append parameters if they have a value
  if (payload.name) params.append('name', payload.name);
  if (payload.voice) params.append('voice', payload.voice);
  if (payload.staticImageFileName) params.append('staticImageFileName', payload.staticImageFileName);
  if (payload.dynamicImageFileName) params.append('dynamicImageFileName', payload.dynamicImageFileName);

  return request<ApiResponse<Avatar>>({
    url: `/avatars/${id}/update-with-files`,
    method: 'PUT',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    data: params,
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