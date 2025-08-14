import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUploadStore = defineStore('upload', () => {
  // --- State ---
  const isUploading = ref(false);
  const progress = ref(0);

  // --- Actions ---
  function startUpload() {
    isUploading.value = true;
    progress.value = 0;
  }

  function updateProgress(newProgress: number) {
    progress.value = newProgress;
  }

  function finishUpload() {
    // 延迟一小段时间再隐藏，让用户能看到100%的状态
    setTimeout(() => {
      isUploading.value = false;
    }, 500);
  }

  return { isUploading, progress, startUpload, updateProgress, finishUpload };
});