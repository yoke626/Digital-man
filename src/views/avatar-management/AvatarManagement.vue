<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useUiStore } from '@/stores/ui';
import { getAvatarList, deleteAvatar, addAvatar, updateAvatar } from '@/api/avatar';
import type { Avatar } from '@/types/avatar';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { UploadFile, UploadUserFile, FormRules, FormInstance } from 'element-plus';
import { useImageCompression } from '@/composables/useImageCompression';

const { isCompressing, compressImage } = useImageCompression();
// --- 数据状态 ---
const avatarList = ref<Avatar[]>([]); // 直接使用这个 list 来渲染
const total = ref(0);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(4);


// --- 弹窗状态 ---
const uiStore = useUiStore();
const dialogVisible = computed({
  get: () => uiStore.isAvatarAddDialogVisible,
  set: (val) => { if (!val) uiStore.closeAvatarAddDialog() }
});
const dialogTitle = ref('新增形象');
const formRef = ref<FormInstance>();
const form = ref({
  id: null as number | null,
  name: '',
  voice: '',
});

const formRules = ref<FormRules>({
  name: [
    { required: true, message: '名称不能为空，请输入', trigger: 'blur' }
  ],
});

// 定义新的状态，专门用于存储压缩后的文件
const staticImageFile = ref<File | null>(null);
const dynamicImageFile = ref<File | null>(null);
const staticImageUrlPreview = ref('');
const dynamicImageUrlPreview = ref('');

// --- 核心逻辑 ---
const fetchAvatarList = async () => {
  loading.value = true;
  try {
    const response = await getAvatarList({ page: currentPage.value, size: pageSize.value });
    const apiResponse = response.data;
    if (apiResponse.code === 200) {
      avatarList.value = apiResponse.data.items;
      total.value = apiResponse.data.total;
    }
  } finally {
    loading.value = false;
  }
};

const handleDelete = (id: number) => {
  ElMessageBox.confirm('确定要删除这个形象吗?', '警告', { type: 'warning' })
    .then(async () => {
      await deleteAvatar(id);
      ElMessage.success('删除成功');
      // 如果删除后当前页没有数据了，返回上一页
      if (avatarList.value.length === 1 && currentPage.value > 1) {
        currentPage.value--;
      }
      fetchAvatarList();
    });
};

// 文件选择后，立刻调用压缩函数
const handleFileChange = async (uploadFile: UploadFile, type: 'static' | 'dynamic') => {
  if (!uploadFile.raw) return;
  
  const compressedFile = await compressImage(uploadFile.raw);

  if (compressedFile) {
    const previewUrl = URL.createObjectURL(compressedFile);
    if (type === 'static') {
      staticImageFile.value = compressedFile;
      staticImageUrlPreview.value = previewUrl;
    } else {
      dynamicImageFile.value = compressedFile;
      dynamicImageUrlPreview.value = previewUrl;
    }
  }
};

const handleStaticFileChange = (uploadFile: UploadFile) => handleFileChange(uploadFile, 'static');
const handleDynamicFileChange = (uploadFile: UploadFile) => handleFileChange(uploadFile, 'dynamic');

const handleAdd = () => {
  handleDialogClose();
  dialogTitle.value = '新增形象';
  uiStore.openAvatarAddDialog();
};

const handleEdit = (avatar: Avatar) => {
  dialogTitle.value = '修改形象';
  form.value = {
    id: avatar.id,
    name: avatar.name,
    voice: avatar.voice || '',
  };
  // 设置图片预览
  staticImageUrlPreview.value = avatar.staticImageUrl;
  dynamicImageUrlPreview.value = avatar.dynamicImageUrl || '';
  uiStore.openAvatarAddDialog();
};


// 确保 handleSubmit 使用的是压缩后的文件
const handleSubmit = async () => {
  if (isCompressing.value) {
    ElMessage.warning('正在处理图片，请稍后...');
    return;
  }
  
  const formData = new FormData();
  formData.append('name', form.value.name);
  formData.append('voice', form.value.voice);

  // 确保从我们新的状态变量中获取文件
  if (staticImageFile.value) {
    formData.append('staticImage', staticImageFile.value);
  }
  if (dynamicImageFile.value) {
    formData.append('dynamicImage', dynamicImageFile.value);
  }

  try {
    if (form.value.id) {
      await updateAvatar(form.value.id, formData);
      ElMessage.success('修改成功');
    } else {
      await addAvatar(formData);
      ElMessage.success('新增成功');
    }
    uiStore.closeAvatarAddDialog();
    fetchAvatarList();
  } catch (error) {
    console.error("操作失败", error);
  }
};

// 关闭弹窗时，重置所有相关状态
const handleDialogClose = () => {
  form.value.id = null;
  form.value.name = '';
  form.value.voice = '';
  
  staticImageFile.value = null; // 重置压缩文件
  dynamicImageFile.value = null; // 重置压缩文件
  
  staticImageUrlPreview.value = '';
  dynamicImageUrlPreview.value = '';
  formRef.value?.clearValidate();
  uiStore.closeAvatarAddDialog();
};

onMounted(() => {
  fetchAvatarList();
});
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
          <el-input v-model="form.name" placeholder="请输入"></el-input>
        </el-form-item>
        
        <el-form-item label="形象静态" prop="staticImage">
          <el-upload
            class="avatar-uploader"
            drag
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            @change="handleStaticFileChange"
          >
            <el-image v-if="staticImageUrlPreview" :src="staticImageUrlPreview" class="avatar-preview" />
            <div v-else class="upload-placeholder">
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">将PNG文件拖至此区域，或<em>点击上传</em></div>
            </div>
          </el-upload>
        </el-form-item>
        
        <el-form-item label="形象动态" prop="dynamicImage">
          <el-upload
            class="avatar-uploader"
            drag
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            @change="handleDynamicFileChange"
          >
            <el-image v-if="dynamicImageUrlPreview" :src="dynamicImageUrlPreview" class="avatar-preview" />
            <div v-else class="upload-placeholder">
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">将GIF/PNG文件拖至此区域，或<em>点击上传</em></div>
            </div>
          </el-upload>
        </el-form-item>

        <el-form-item label="音色选择" prop="voice">
          <div class="voice-selector">
            <el-select v-model="form.voice" placeholder="请选择" style="width: 100%;">
              <el-option label="温柔女生" value="温柔女生"></el-option>
              <el-option label="清爽女声" value="清爽女声"></el-option>
            </el-select>
            <el-button :disabled="!form.voice" type="primary" plain class="listen-btn">
              <el-icon><Headset /></el-icon>
              试听
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false" :disabled="isCompressing">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="isCompressing">
          {{ isCompressing ? '图片处理中...' : '确定' }}
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
}

.card-row {
  flex-grow: 1;
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

/* 调整弹窗Body的内边距，减少垂直方向的留白 */
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
  :deep(.el-upload) {
    width: 100%;
  }
  /* 精确减少文件上传拖拽区域的垂直内边距 */
  :deep(.el-upload-dragger) {
    padding-top: 10px;
    padding-bottom: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .avatar-preview {
    max-width: 60%;
    /* 适当减小预览图的最大高度，防止图片撑开容器 */
    max-height: 110px; 
  }
  .upload-placeholder {
    text-align: center;
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

/* 为加载失败的占位图添加样式 */
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

</style>