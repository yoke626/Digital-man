<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'; 
import { useUiStore } from '@/stores/ui'; 
import { getSceneList, deleteScene, selectScene, addScene, updateScene } from '@/api/scene';
import type { Scene } from '@/types/scene';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { UploadFile } from 'element-plus';
import { useImageCompression } from '@/composables/useImageCompression';
import { useUploadStore } from '@/stores/upload';

const { isCompressing, compressImage } = useImageCompression();
const uploadStore = useUploadStore();

// --- 数据状态 ---
const sceneList = ref<Scene[]>([]);
const total = ref(0);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(3);

// --- 弹窗与表单状态 ---
const uiStore = useUiStore();
const formRef = ref<any>(null);
const dialogTitle = ref('新增场景');

// 弹窗的v-model直接绑定到store的状态
const dialogVisible = computed({
  get: () => uiStore.isSceneAddDialogVisible,
  set: (val) => {
    if (!val) {
      uiStore.closeSceneAddDialog();
    }
  }
});

// 表单数据模型
const form = ref<{
  id: number | null;
  name: string;
  sceneFile: File | null;
}>({
  id: null,
  name: '',
  sceneFile: null,
});
const fileUrlPreview = ref('');
// 已上传标记，避免“确定”再次上传
const sceneUploaded = ref(false);

// 上传状态
const isUploading = computed(() => uploadStore.isUploading);
const uploadProgress = computed(() => uploadStore.progress);

// --- 核心逻辑 ---

// 监听Pinia中弹窗状态的变化
watch(() => uiStore.isSceneAddDialogVisible, (newValue) => {
  // 仅在弹窗从"关闭"变为"打开"时执行
  if (newValue) {
    // 如果表单ID不是一个有效的数字（即它为null），
    // 证明这不是一个"修改"操作，而是一个"新增"操作，
    if (typeof form.value.id !== 'number') {
      dialogTitle.value = '新增场景';
    }
  }
});

// 获取场景列表
const fetchSceneList = async () => {
  loading.value = true;
  try {
    const response = await getSceneList({ page: currentPage.value, size: pageSize.value });
    const apiResponse = response.data;
    if (apiResponse.code === 200) {
      sceneList.value = apiResponse.data.items;
      total.value = apiResponse.data.total;
    }
  } finally {
    loading.value = false;
  }
};

// 删除场景
const handleDelete = (id: number) => {
  ElMessageBox.confirm('确定要删除这个场景吗?', '警告', { type: 'warning' })
    .then(async () => {
      await deleteScene(id);
      ElMessage.success('删除成功');
      if (sceneList.value.length === 1 && currentPage.value > 1) {
        currentPage.value--;
      }
      fetchSceneList();
    });
};

// 设为已选
const handleSelect = async (id: number) => {
  try {
    const response = await selectScene(id);
    if (response.data.code === 200) {
      ElMessage.success('场景已设为当前选中');
      fetchSceneList();
    }
  } catch (error) {
    console.error("设置失败", error);
  }
};

// 检查是否为图片预览：支持 blob/object URL
const isImage = (url: string) => {
  if (!url) return false;
  // blob/object URL 直接认为是图片预览（由 input 选择生成）
  if (url.startsWith('blob:') || url.startsWith('data:')) return true;
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];
  return imageExtensions.some(ext => url.toLowerCase().includes(ext));
};

// 文件选择处理函数，立即上传
const handleFileChange = async (uploadFile: UploadFile) => {
  if (!uploadFile.raw) return;

  // 调用压缩函数，如果不是图片，会直接返回原文件
  const finalFile = await compressImage(uploadFile.raw);
  
  if (finalFile) {
    // 存储最终的文件（可能是压缩后的图片，也可能是原始的非图片文件）
    form.value.sceneFile = finalFile;
    fileUrlPreview.value = URL.createObjectURL(finalFile);
    
    // 立即上传文件
    await uploadFileToServer(finalFile);
  }
};

// 上传文件到后端
const uploadFileToServer = async (file: File) => {
  const formData = new FormData();
  formData.append('name', form.value.name || 'temp');
  formData.append('sceneFile', file);

  try {
    const resp = form.value.id
      ? await updateScene(form.value.id, formData)
      : await addScene(formData);
    const apiRes: any = resp?.data;
    if (!form.value.id && apiRes?.data?.id) {
      form.value.id = apiRes.data.id;
    }
    sceneUploaded.value = true;
    ElMessage.success('场景文件上传成功');
  } catch (error) {
    ElMessage.error('场景文件上传失败');
    console.error("上传失败", error);
  }
};

// 打开修改弹窗
const handleEdit = (scene: Scene) => {
  // 1. 先填充表单
  dialogTitle.value = '修改场景';
  form.value.id = scene.id;
  form.value.name = scene.name;
  fileUrlPreview.value = scene.sceneUrl;
  
  // 2. 再打开弹窗
  uiStore.openSceneAddDialog();
};

// handleSubmit 仅刷新列表，不再重复上传
const handleSubmit = async () => {
  if (isUploading.value) {
    ElMessage.warning('正在上传文件，请稍后...');
    return;
  }
  if (!form.value.id) {
    ElMessage.warning('请先选择并上传场景文件');
    return;
  }
  // 仅关闭并刷新列表
  uiStore.closeSceneAddDialog();
  await fetchSceneList();
};

// 关闭弹窗并重置表单
const handleDialogClose = () => {
  // 重置表单状态
  form.value.id = null;
  form.value.name = '';
  form.value.sceneFile = null;
  fileUrlPreview.value = '';
  sceneUploaded.value = false;
  formRef.value?.clearValidate();
  // 确保关闭动作也同步到store
  uiStore.closeSceneAddDialog();
};

onMounted(() => {
  fetchSceneList();
});
</script>

<template>
  <div class="scene-management-container">
    <el-row :gutter="20" class="card-row">
      <el-col :span="8" v-for="scene in sceneList" :key="scene.id">
        <el-card class="scene-card" shadow="hover" :body-style="{ padding: '0', height: '100%', display: 'flex', flexDirection: 'column' }">
          <div class="card-header">
            <span class="scene-name">{{ scene.name }}</span>
            <div class="actions">
              <el-link type="primary" :underline="false" @click="handleEdit(scene)">修改</el-link>
              <el-link type="danger" :underline="false" @click="handleDelete(scene.id)">删除</el-link>
            </div>
          </div>
          <div class="card-body">
            <el-image :src="scene.sceneUrl" class="scene-image" fit="contain" />
          </div>
          <div class="card-footer">
            <el-button
              :type="scene.isSelected ? 'primary' : 'default'"
              :disabled="scene.isSelected"
              class="select-button"
              round
              @click="handleSelect(scene.id)"
            >
              {{ scene.isSelected ? '已选' : '设为已选' }}
            </el-button>
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
        @current-change="fetchSceneList"
      ></el-pagination>
    </div>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" @close="handleDialogClose">
      <!-- 上传进度条 -->
      <div v-if="isUploading" class="upload-progress-container">
        <el-progress 
          :percentage="uploadProgress" 
          :stroke-width="4"
          status="success"
        />
        <div class="upload-status">正在上传文件... {{ uploadProgress }}%</div>
      </div>
      
      <el-form :model="form" ref="formRef" label-width="100px" label-position="right">
        <el-form-item label="场景名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入场景名称"></el-input>
        </el-form-item>
        
        <el-form-item label="场景文件" prop="sceneFile">
          <el-upload
            class="scene-uploader"
            drag
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            @change="handleFileChange"
          >
            <div v-if="fileUrlPreview" class="preview-container">
              <span class="file-name-preview">{{ form.sceneFile?.name || '文件已选择' }}</span>
              <el-image v-if="isImage(fileUrlPreview)" :src="fileUrlPreview" class="scene-preview" />
              <div v-else class="file-placeholder">
                <el-icon><Document /></el-icon>
                <span>非图片文件</span>
              </div>
            </div>
            <div v-else class="upload-placeholder">
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">将文件拖至此区域，或<em>点击上传</em></div>
            </div>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false" :disabled="isUploading">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="isUploading" :disabled="isUploading">
            {{ isUploading ? '上传中...' : '确定' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.scene-management-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}
.card-row {
  flex-grow: 1;
  /* 移除内部滚动，交由外层布局处理，避免右侧出现多余滚动条 */
  overflow: visible;
  /* 取消为滚动条预留的右内边距，防止出现额外空白 */
  padding-right: 0;
  .el-col {
    /* 列高度自适应内容，避免被强制拉满导致容器溢出 */
    height: auto;
  }
}
.pagination-container {
  margin-top: auto;
  padding-top: 20px;
}
.scene-card {
  border-radius: 12px;
  /* 使用内容高度，避免与父级高度耦合产生多余滚动 */
  height: auto;
  display: flex;
  flex-direction: column;
}
.card-header {
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
}
.scene-name {
  font-weight: 600;
}
.actions .el-link {
  margin-left: 15px;
}
.card-body {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  background-color: #f9f9f9;
  overflow: hidden;
}
.scene-image {
  max-width: 100%;
  max-height: 100%;
}
.card-footer {
  flex-shrink: 0;
  padding: 15px 20px;
}
.select-button {
  width: 100%;
}

/* 上传进度条样式 */
.upload-progress-container {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.upload-status {
  margin-top: 8px;
  text-align: center;
  color: #409eff;
  font-size: 14px;
  font-weight: 500;
}
</style>