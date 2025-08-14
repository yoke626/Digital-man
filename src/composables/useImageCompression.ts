import { ref } from 'vue';
import imageCompression from 'browser-image-compression';
import { ElMessage } from 'element-plus';

/**
 * 全局可复用的图片压缩组合式函数
 * @returns {object} 包含压缩状态和压缩方法的对象
 */
export function useImageCompression() {
  // 压缩状态，用于在UI上显示加载中/禁用按钮
  const isCompressing = ref(false);

  /**
   * 压缩图片的核心方法
   * @param {File} file - 用户选择的原始图片文件
   * @returns {Promise<File | null>} 返回一个Promise，解析为压缩后的File对象，或在失败时解析为null
   */
  const compressImage = async (file: File): Promise<File | null> => {
    if (!file) return null;

    // 检查文件是否为图片类型
    if (!file || !file.type.startsWith('image/')) {
        // 如果不是图片，直接返回原始文件，不进行压缩
        return file;
    }

    isCompressing.value = true;
    ElMessage.info('正在优化图片，请稍候...');

    const options = {
      maxSizeMB: 1.5,         // 目标最大体积：1.5MB
      maxWidthOrHeight: 1920,  // 目标最大尺寸：1920px
      useWebWorker: true,      // 使用后台线程处理，避免UI卡顿
    };

    try {
      const compressedFile = await imageCompression(file, options);
      ElMessage.success('图片优化完成！');
      return compressedFile;
    } catch (error) {
      ElMessage.error('图片压缩失败，请检查文件格式。');
      console.error('Image compression error:', error);
      return null;
    } finally {
      isCompressing.value = false;
    }
  };

  return {
    isCompressing,
    compressImage,
  };
}