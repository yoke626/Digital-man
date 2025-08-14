<template>
  <div class="global-uploader-container">
    <el-progress
      v-if="uploadStore.isUploading"
      :percentage="uploadStore.progress"
      :stroke-width="3"
      :show-text="false"
      status="success"
    />
  </div>
</template>

<script setup lang="ts">
import { useUploadStore } from '@/stores/upload';
const uploadStore = useUploadStore();
</script>

<style lang="scss" scoped>
.global-uploader-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 9999; /* 确保在最顶层 */
}
</style>