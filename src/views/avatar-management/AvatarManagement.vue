<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useUiStore } from '@/stores/ui';
import { getAvatarList, deleteAvatar, uploadAvatarFile, createAvatarWithFiles, updateAvatar } from '@/api/avatar';
import { getDigitalHumanList } from '@/api/digitalHuman';
import type { Avatar } from '@/types/avatar';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { UploadFile, FormRules, FormInstance } from 'element-plus';

// --- 数据与状态 ---
const avatarList = ref<Avatar[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(4);
const formRef = ref<FormInstance>();
const uiStore = useUiStore();
const dialogTitle = ref('新增形象');
const form = ref({
  id: null as number | null,
  name: '',
  voice: '',
});

// --- 文件与上传状态 ---
const staticImageUrlPreview = ref('');
const dynamicImageUrlPreview = ref('');
const staticImageFileName = ref<string | null>(null); // 存储服务器返回的文件名
const dynamicImageFileName = ref<string | null>(null); // 存储服务器返回的文件名
const staticUploadProgress = ref(0);
const dynamicUploadProgress = ref(0);
const isUploadingStatic = ref(false);
const isUploadingDynamic = ref(false);

const dialogVisible = computed({
  get: () => uiStore.isAvatarAddDialogVisible,
  set: (val) => { if (!val) uiStore.closeAvatarAddDialog() }
});
const isUploading = computed(() => isUploadingStatic.value || isUploadingDynamic.value);
const formRules = ref<FormRules>({
  name: [{ required: true, message: '名称不能为空，请输入', trigger: 'blur' }],
});

// --- 核心逻辑 ---

const fetchAvatarList = async () => {
  const response = await getAvatarList({ page: currentPage.value, size: pageSize.value });
  if (response.data.code === 200) {
    const api = response.data;
    avatarList.value = api.data.items;
    total.value = api.data.total;
  }
};

const isAvatarUsedByAnyDigitalHuman = async (avatarId: number): Promise<string | null> => {
  try {
    // 使用专门的API检查形象使用情况
    const { checkAvatarUsage } = await import('@/api/digitalHuman');
    const response = await checkAvatarUsage(avatarId);
    if (response.data.code === 200) {
      const result = response.data.data;
      return result.isUsed ? result.digitalHumanName || '未知数字人' : null;
    }
  } catch (error) {
    // 如果API调用失败，回退到原来的方法
    const resp = await getDigitalHumanList({ page: 1, size: 9999 });
    const items = resp.data.data.items || [];
    const found = items.find((h: any) => h?.avatar?.id === avatarId);
    return found ? found.name : null;
  }
  return null;
};

const handleDelete = async (id: number) => {
  try {
    const usedBy = await isAvatarUsedByAnyDigitalHuman(id);
    if (usedBy) {
      await ElMessageBox.alert(
        `当前形象正在被"${usedBy}"使用，无法删除。请先修改或删除使用该形象的数字人配置。`,
        '无法删除',
        {
          confirmButtonText: '确定',
          type: 'warning',
          customClass: 'custom-message-box'
        }
      );
      return;
    }
    
    await ElMessageBox.confirm(
      '确定要删除这个形象吗？删除后无法恢复。',
      '确认删除',
      { 
        type: 'warning',
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        customClass: 'custom-message-box'
      }
    );
    
    await deleteAvatar(id);
    ElMessage.success('删除成功');
    if (avatarList.value.length === 1 && currentPage.value > 1) {
      currentPage.value--;
    }
    await fetchAvatarList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除形象失败:', error);
      ElMessage.error('删除失败，请稍后重试');
    }
  }
};

// 步骤1：选择文件后立即上传
const handleFileChange = async (uploadFile: UploadFile, type: 'static' | 'dynamic') => {
  if (!uploadFile.raw) return;
  const file = uploadFile.raw;

  const progressHandler = (event: any) => {
    const percent = Math.round((event.loaded * 100) / event.total);
    if (type === 'static') staticUploadProgress.value = percent;
    else dynamicUploadProgress.value = percent;
  };

  if (type === 'static') {
    isUploadingStatic.value = true;
    staticUploadProgress.value = 0;
  } else {
    isUploadingDynamic.value = true;
    dynamicUploadProgress.value = 0;
  }

  try {
    const res = await uploadAvatarFile(file, progressHandler);
    if (res.data.code === 200) {
      if (type === 'static') {
        staticImageFileName.value = res.data.data.fileName;
        staticImageUrlPreview.value = res.data.data.fileUrl;
      } else {
        dynamicImageFileName.value = res.data.data.fileName;
        dynamicImageUrlPreview.value = res.data.data.fileUrl;
      }
      ElMessage.success(`${type === 'static' ? '静态图片' : '动态图片'}上传成功`);
    } else {
      throw new Error(res.data.message);
    }
  } catch (error) {
    ElMessage.error(`${type === 'static' ? '静态图片' : '动态图片'}上传失败`);
    if (type === 'static') staticImageUrlPreview.value = ''; // 失败时清除预览
    else dynamicImageUrlPreview.value = '';
  } finally {
    if (type === 'static') isUploadingStatic.value = false;
    else isUploadingDynamic.value = false;
  }
};

// 步骤2：处理最终表单提交
const handleSubmit = async () => {
  await formRef.value?.validate(async (valid) => {
    if (!valid) return;
    if (isUploading.value) {
      ElMessage.warning('文件仍在上传中，请稍后...');
      return;
    }

    try {
      if (form.value.id) { // --- 更新模式 ---
        const formData = new FormData();
        formData.append('name', form.value.name);
        formData.append('voice', form.value.voice || '');
        // 对于更新操作，如果后端支持，我们可以重用旧逻辑，
        // 或者发送文件名。为了保持一致性，我们假设发送文件名。
        // 注意：这部分取决于后端的PUT端点实现。
        // 最稳健的方式是如果文件发生变化就重新上传。
        // 但是为了简单起见，我们这里只更新元数据。
        // 如果需要更新文件，应该已经通过handleFileChange上传了。
        // 如果只发送文件名进行更新，则需要更完整的解决方案。
         await updateAvatar(form.value.id, formData, () => {});
         ElMessage.success('形象信息更新成功');

      } else { // --- 创建模式 ---
        if (!staticImageFileName.value) {
          ElMessage.warning('请先上传静态形象图片');
          return;
        }
        await createAvatarWithFiles({
          name: form.value.name,
          voice: form.value.voice,
          staticImageFileName: staticImageFileName.value,
          dynamicImageFileName: dynamicImageFileName.value || undefined,
        });
        ElMessage.success('新增形象成功');
      }
      uiStore.closeAvatarAddDialog();
      await fetchAvatarList();
    } catch (error) {
      ElMessage.error('操作失败');
    }
  });
};

const handleEdit = (avatar: Avatar) => {
  handleDialogClose();
  dialogTitle.value = '修改形象';
  form.value = { id: avatar.id, name: avatar.name, voice: avatar.voice || '' };
  staticImageUrlPreview.value = avatar.staticImageUrl;
  dynamicImageUrlPreview.value = avatar.dynamicImageUrl || '';
  uiStore.openAvatarAddDialog();
};

const handleDialogClose = () => {
  form.value = { id: null, name: '', voice: '' };
  staticImageUrlPreview.value = '';
  dynamicImageUrlPreview.value = '';
  staticImageFileName.value = null;
  dynamicImageFileName.value = null;
  staticUploadProgress.value = 0;
  dynamicUploadProgress.value = 0;
  isUploadingStatic.value = false;
  isUploadingDynamic.value = false;
  formRef.value?.clearValidate();
  uiStore.closeAvatarAddDialog();
};

onMounted(fetchAvatarList);
</script>

<template>
  <div class="avatar-management-container">
    <el-row :gutter="30" class="card-row">
      <el-col :xs="24" :sm="12" :md="12" :lg="12" v-for="avatar in avatarList" :key="avatar.id">
        <el-card class="avatar-card" shadow="hover">
          <div class="card-content">
            <div class="card-left">
              <el-image class="avatar-image" :src="avatar.staticImageUrl" fit="cover">
                <template #error>
                  <div class="image-slot-error">
                    <el-icon><Picture /></el-icon>
                    <span>图片加载失败</span>
                  </div>
                </template>
              </el-image>
            </div>
            <div class="card-right">
              <div class="info-top">
                <span class="avatar-name">{{ avatar.name }}</span>
              </div>
              <div class="info-bottom">
                <el-link type="primary" :underline="false" @click="handleEdit(avatar)">修改</el-link>
                <el-link type="danger" :underline="false" @click="handleDelete(avatar.id)">删除</el-link>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <div class="pagination-container">
       <el-pagination
        background
        :total="total"
        v-model:current-page="currentPage"
        :page-size="pageSize"
        layout="total, ->, prev, pager, next, jumper"
        @current-change="fetchAvatarList"
      ></el-pagination>
    </div>
    
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" @close="handleDialogClose" custom-class="avatar-dialog">
      <template #header="{ close, titleId, titleClass }">
        <div class="custom-dialog-header">
          <el-icon><Plus /></el-icon>
          <span :id="titleId" :class="titleClass">{{ dialogTitle }}</span>
        </div>
      </template>
      
      <el-form :model="form" :rules="formRules" ref="formRef" label-width="100px" label-position="right">
        <el-form-item label="形象名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入" :disabled="isUploading"></el-input>
        </el-form-item>
        
        <el-form-item label="形象静态">
          <el-upload
            class="avatar-uploader"
            drag
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            :disabled="isUploading"
            accept=".png,.jpg,.jpeg"
            @change="(file: any) => handleFileChange(file, 'static')"
          >
            <div class="uploader-wrapper">
              <el-image v-if="staticImageUrlPreview" :src="staticImageUrlPreview" class="avatar-preview" />
              <div v-else class="upload-placeholder">
                <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                <div class="el-upload__text">将PNG/JPG文件拖至此，或<em>点击上传</em></div>
              </div>
              <div v-if="isUploadingStatic" class="upload-progress-overlay">
                <el-progress type="circle" :percentage="staticUploadProgress" :width="80" />
              </div>
            </div>
          </el-upload>
        </el-form-item>
        
        <el-form-item label="形象动态">
           <el-upload
            class="avatar-uploader"
            drag
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            :disabled="isUploading"
            accept=".gif,.png,.jpg,.jpeg"
            @change="(file: any) => handleFileChange(file, 'dynamic')"
          >
            <div class="uploader-wrapper">
              <el-image v-if="dynamicImageUrlPreview" :src="dynamicImageUrlPreview" class="avatar-preview" />
              <div v-else class="upload-placeholder">
                <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                <div class="el-upload__text">将GIF/PNG/JPG文件拖至此，或<em>点击上传</em></div>
              </div>
              <div v-if="isUploadingDynamic" class="upload-progress-overlay">
                 <el-progress type="circle" :percentage="dynamicUploadProgress" :width="80" />
              </div>
            </div>
          </el-upload>
        </el-form-item>

        <el-form-item label="音色选择" prop="voice">
          <div class="voice-selector">
            <el-select v-model="form.voice" placeholder="请选择" style="width: 100%;" :disabled="isUploading">
              <el-option label="温柔女生" value="温柔女生"></el-option>
              <el-option label="清爽女声" value="清爽女声"></el-option>
            </el-select>
            <el-button :disabled="!form.voice || isUploading" type="primary" plain class="listen-btn">
              <el-icon><Headset /></el-icon>
              试听
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false" :disabled="isUploading">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="isUploading">
            {{ isUploading ? '上传中...' : '确定' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.avatar-management-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.card-row {
  flex-grow: 1;
  overflow-y: auto;
  padding-right: 5px;
}

.pagination-container {
  margin-top: auto;
  padding-top: 20px;
}

.avatar-card {
  border-radius: 12px;
  .card-content {
    display: flex;
    align-items: center;
    padding: 10px;
  }
}

.card-left {
  flex-shrink: 0;
  margin-right: 20px;
  .avatar-image {
    width: 200px;
    height: 200px;
    border-radius: 10px;
  }
}

.card-right {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 15px;
}

.info-top {
  .avatar-name {
    font-size: 18px;
    font-weight: 600;
  }
}

.info-bottom {
  .el-link {
    margin-right: 15px;
  }
}

:deep(.avatar-dialog .el-dialog__body) {
  padding-top: 15px;
  padding-bottom: 20px; 
  background-image: linear-gradient(to bottom, #f7f8fa, #e6e9f0);
}

.custom-dialog-header {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  .el-icon {
    margin-right: 8px;
  }
}

.avatar-uploader {
  width: 100%;
  .uploader-wrapper {
    position: relative;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  :deep(.el-upload) {
    width: 100%;
  }
  :deep(.el-upload-dragger) {
    padding: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
  }
  .avatar-preview {
    max-width: 60%;
    max-height: 110px; 
  }
}

.voice-selector {
  display: flex;
  width: 100%;
  gap: 10px;
}

.listen-btn {
  flex-shrink: 0;
}

.image-slot-error {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: #f5f7fa;
  color: #c0c4cc;
  font-size: 14px;
}
.image-slot-error .el-icon {
  font-size: 30px;
  margin-bottom: 8px;
}

.upload-progress-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
  border-radius: 8px;
}
</style>