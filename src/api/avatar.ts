import request from '@/utils/request'
import type { Avatar } from '@/types/avatar'
import type { ApiResponse, PaginatedData, PaginationParams } from '@/types/api'

/**
 * 1. (New) Uploads a single file and returns its server-side details.
 * @param file The file to upload.
 * @param onUploadProgress Progress event handler.
 */
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

/**
 * 2. (New) Creates an avatar record using previously uploaded files.
 * @param payload Contains name, voice, and file names from the upload step.
 */
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

/**
 * 3. Updates an existing avatar. Can include new files.
 * @param id The ID of the avatar to update.
 * @param data FormData containing name, voice, and optional new image files.
 * @param onUploadProgress Progress event handler for file uploads.
 */
export const updateAvatar = (id: number, data: FormData, onUploadProgress: (e: any) => void) => {
  return request<ApiResponse<Avatar>>({
    url: `/avatars/${id}`,
    method: 'PUT',
    data,
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  });
};

// --- Unchanged Functions ---

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