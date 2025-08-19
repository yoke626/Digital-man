import { ref } from 'vue';
import { ElMessage } from 'element-plus';

export function useImageCompression() {
  // 压缩状态，用于在UI上显示加载中/禁用按钮
  const isCompressing = ref(false);

  const compressImage = async (file: File): Promise<File | null> => {
    if (!file) return null;

    // 直接返回原始文件，不进行压缩
    return file;
  };

  return {
    isCompressing,
    compressImage,
  };
}