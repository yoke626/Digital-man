<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useUiStore } from '@/stores/ui';
import { getDigitalHumanList, addDigitalHuman, updateDigitalHuman, deleteDigitalHuman, updateDigitalHumanStatus } from '@/api/digitalHuman';
import { getAvatarList } from '@/api/avatar';
import type { DigitalHuman } from '@/types/digitalHuman';
import type { Avatar } from '@/types/avatar';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormRules, FormInstance } from 'element-plus'

// --- 数据状态 ---
const humanList = ref<DigitalHuman[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(4);

// --- 弹窗与表单状态 ---
const formRef = ref<FormInstance>();
const uiStore = useUiStore();
const dialogTitle = ref('新增数字人');
const availableAvatars = ref<Avatar[]>([]); // 用于存储所有可用的形象
const form = ref({
  id: null as number | null,
  name: '',
  avatarId: undefined as number | undefined,
  enableModelFallback: true,
  enableMultiTurnDialogue: false,
});
const dialogVisible = computed({
  get: () => uiStore.isDigitalHumanDialogVisible,
  set: (val) => { if (!val) uiStore.closeDigitalHumanDialog(); }
});

const formRules = ref<FormRules>({
  name: [
    { required: true, message: '名称不能为空，请输入', trigger: 'blur' }
  ],
  avatarId: [
    { required: true, message: '请选择一个数字人形象', trigger: 'blur' }
  ]
});

// 5. 在弹窗打开的时候，去调用这个方法
watch(() => uiStore.isDigitalHumanDialogVisible, (newValue) => {
  if (newValue) {
    fetchAvailableAvatars(); // 打开弹窗时，获取最新的形象列表
    if (form.value.id === null) {
      dialogTitle.value = '新增数字人';
    }
  }
});

// --- 核心逻辑 ---
const fetchDigitalHumanList = async () => {
  const response = await getDigitalHumanList({ page: currentPage.value, size: pageSize.value });
  if (response.data.code === 200) {
    humanList.value = response.data.data.items;
    total.value = response.data.data.total;
  }
};

const fetchAvailableAvatars = async () => {
  // 获取所有形象用于弹窗选择，这里不分页
  const response = await getAvatarList({ page: 1, size: 100 }); 
  if (response.data.code === 200) {
    availableAvatars.value = response.data.data.items;
  }
};

const handleStatusChange = async (human: DigitalHuman) => {
  const newStatus = human.status === 'ENABLED' ? 'DISABLED' : 'ENABLED';
  try {
    await updateDigitalHumanStatus(human.id, newStatus);
    ElMessage.success('状态更新成功');
    fetchDigitalHumanList();
  } catch (error) {
    ElMessage.error('状态更新失败');
  }
};

const handleDelete = (id: number) => {
  ElMessageBox.confirm('确定要删除这个数字人配置吗?', '警告', { type: 'warning' })
    .then(async () => {
      await deleteDigitalHuman(id);
      ElMessage.success('删除成功');
      fetchDigitalHumanList();
    });
};

const handleEdit = (human: DigitalHuman) => {
  dialogTitle.value = '修改数字人';
  form.value = {
    id: human.id,
    name: human.name,
    avatarId: human.avatar.id,
    enableModelFallback: human.enableModelFallback ?? true,
    enableMultiTurnDialogue: human.enableMultiTurnDialogue ?? false,
  };
  uiStore.openDigitalHumanDialog();
};

// 提交表单
const handleSubmit = async () => {
  // 使用解构赋值将 id 和其他字段分开
  // 'payload' 对象将包含 form.value 中除了 id 以外的所有属性
  const { id, ...payload } = form.value;

  try {
    if (id) { // 判断 id 是否存在且不为null
      await updateDigitalHuman(id, payload);
      ElMessage.success('修改成功');
    } else {
      await addDigitalHuman(payload);
      ElMessage.success('新增成功');
    }
    uiStore.closeDigitalHumanDialog();
    fetchDigitalHumanList();
  } catch (error) {
    console.error("操作失败", error);
  }
};

const handleDialogClose = () => {
  form.value = {
    id: null,
    name: '',
    avatarId: undefined,
    enableModelFallback: true,
    enableMultiTurnDialogue: false,
  };
  uiStore.closeDigitalHumanDialog();
};

onMounted(() => {
  fetchDigitalHumanList();
});
</script>

<template>
  <div class="digital-human-config-container">
    <el-row :gutter="30" class="card-row">
      <el-col :xs="24" :sm="12" :md="12" :lg="12" v-for="human in humanList" :key="human.id">
        <el-card class="human-card" shadow="hover">
          <div class="card-content">
            <div class="card-left">
              <el-image class="avatar-image" :src="human.avatar.staticImageUrl" fit="cover">
                 <template #error>
                  <div class="image-slot-error">
                    <el-icon><Picture /></el-icon>
                    <span>图片加载失败</span>
                  </div>
                </template>
              </el-image>
            </div>
            <div class="card-right">
              <div class="info-header">
                <span class="human-name">{{ human.name }}</span>
                <el-switch :model-value="human.status === 'ENABLED'" @change="handleStatusChange(human)"/>
              </div>
              <div class="info-actions">
                  <el-link type="primary" :underline="false" @click="handleEdit(human)">修改</el-link>
                  <el-link type="danger" :underline="false" @click="handleDelete(human.id)">删除</el-link>
              </div>
              <div class="info-footer">
                <el-button 
                  :type="human.status === 'ENABLED' ? 'default' : 'primary'" 
                  class="action-button" 
                  round
                  @click="handleStatusChange(human)"
                >
                  {{ human.status === 'ENABLED' ? '停用' : '启用' }}
                </el-button>
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
        @current-change="fetchDigitalHumanList"
      ></el-pagination>
    </div>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" @close="handleDialogClose">
      <el-form :model="form" :rules="formRules" ref="formRef" label-width="100px" label-position="right">
        <el-form-item label="数字人名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入"></el-input>
        </el-form-item>
        <el-form-item label="数字人形象" prop="avatarId">
          <el-radio-group v-model="form.avatarId">
            <el-radio v-for="avatar in availableAvatars" :key="avatar.id" :label="avatar.id">
              {{ avatar.name }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="大模型配置" required>
          <el-checkbox v-model="form.enableModelFallback" label="模型兜底" />
          <el-checkbox v-model="form.enableMultiTurnDialogue" label="多轮对话" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.digital-human-config-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}
.card-row {
  flex-grow: 1;
  overflow-y: auto;
  padding-right: 5px; /* 为滚动条预留空间 */
}
.pagination-container {
  margin-top: auto;
  padding-top: 20px;
}

.human-card {
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
    width: 200px; /* 增加图片宽度 */
    height: 200px; /* 增加图片高度 */
    border-radius: 10px;
  }
}

.card-right {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  height: 200px; /* 与图片高度保持一致 */
  justify-content: space-between;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .human-name {
    font-size: 18px;
    font-weight: 600;
  }
}

.info-actions {
  .el-link {
    margin-right: 15px;
  }
}

.info-footer {
  text-align: right;
}
</style>