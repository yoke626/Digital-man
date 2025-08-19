<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useUiStore } from '@/stores/ui';
import { Plus, SwitchButton } from '@element-plus/icons-vue' 
import { useUserStore } from '@/stores/user'
//import GlobalUploader from '../common/GlobalUploader.vue';

const route = useRoute();
const uiStore = useUiStore(); 
const userStore = useUserStore();

// 退出登录
const handleLogout = () => {
  userStore.logout(); // 调用 store 中的 logout action
};

const handleAddButtonClick = () => {
  // 根据当前路由判断应该打开哪个弹窗
  if (route.name === 'AvatarManagement') {
    uiStore.openAvatarAddDialog();
  }
  else if (route.name === 'SceneManagement') {
    uiStore.openSceneAddDialog();
  }
  else if (route.name === 'DigitalHuman') {
    uiStore.openDigitalHumanDialog();
  }
}

</script>

<template>
  <GlobalUploader />

  <el-container class="layout-container">
    <el-aside width="220px" class="sidebar">
      <div class="brand-logo">
        数字人管理端
      </div>
      <el-menu
        :default-active="$route.path"
        class="el-menu-vertical"
        router
      >
        <el-menu-item index="/digital-human">
          <el-icon><User /></el-icon>
          <span>数字人配置</span>
        </el-menu-item>
        <el-menu-item index="/scene-management">
          <el-icon><Picture /></el-icon>
          <span>场景管理</span>
        </el-menu-item>
        <el-menu-item index="/avatar-management">
          <el-icon><Avatar /></el-icon>
          <span>形象管理</span>
        </el-menu-item>

        <div class="sidebar-footer">
          <span class="welcome-message">【欢迎您, {{ userStore.username }}】</span>
          <el-popconfirm
            title="您确定要退出登录吗?"
            confirm-button-text="确定"
            cancel-button-text="取消"
            @confirm="handleLogout"
          >
            <template #reference>
              <div class="logout-button">
                <el-icon><SwitchButton /></el-icon>
                <span>退出登录</span>
              </div>
            </template>
          </el-popconfirm>
        </div>
      </el-menu>
    </el-aside>

    <el-container>
      <el-main class="main-content">
        <div class="page-header">
          <div class="page-title">
            <el-icon class="page-title-icon">
              <component :is="route.meta.icon" />
            </el-icon>
            <span class="page-title-text">{{ route.meta.title }}</span>
          </div>
          <div class="page-actions">
            <el-button type="primary" :icon="Plus" @click="handleAddButtonClick">{{ route.meta.buttonText }}</el-button>
          </div>
        </div>

        <div class="page-content">
           <router-view></router-view>
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<style lang="scss" scoped>
.layout-container {
  height: 100vh;
  background-color: #f7f8fa; /* 为整体容器设置一个浅灰色背景 */
}

/* --- 侧边栏核心配色修改 --- */
.sidebar {
  background-color: #ffffff; /* 侧边栏背景改为白色 */
  border-right: 1px solid #e6e6e6; /* 使用边框代替阴影，更清爽 */
  border-top-right-radius: 30px; /* --- 新增：右上角圆弧 --- */
  padding: 0 8px; /* 增加左右内边距，让菜单项不要贴边 */
  box-sizing: border-box;

  display: flex; /* 1. 设置为 Flex 容器 */
  flex-direction: column; /* 2. 设置为垂直方向 */
}

.brand-logo {
  flex-shrink: 0; /* 防止被压缩 */
  height: 60px;
  line-height: 60px;
  text-align: center;
  font-size: 22px;
  font-weight: 600;
  margin: 10px 0; /* 增加上下外边距 */
  
  /* 紫色艺术字效果保持不变 */
  background-image: linear-gradient(135deg, #a5b4fc 0%, #6366f1 100%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

/* 菜单整体样式 */
.el-menu {
  border-right: none;
  background-color: transparent; /* 菜单背景透明，以继承父级 .sidebar 的白色背景 */
}

/* 菜单项样式 */
.el-menu-item {
  color: #606266; /* 默认文字颜色 */
  border-radius: 8px; /* 为菜单项增加圆角 */
  margin: 8px 0; /* 增加菜单项之间的垂直间距 */

  /* 鼠标悬浮效果 */
  &:hover {
    background-color: #f0faff; /* 淡蓝色背景 */
    color: #409eff; /* 蓝色文字 */
  }

  /* 当前激活菜单项的样式 */
  &.is-active {
    background-color: #f0faff; /* 淡蓝色背景 */
    color: #409eff; /* 蓝色文字 */
    font-weight: bold; /* 字体加粗 */
  }
}

.main-content {
  /*让 main-content 自身也成为弹性容器 */
  display: flex;
  flex-direction: column;
  // background-color: #f7f8fa;
  padding: 20px;
  /* 从上到下，淡紫蓝到白色的渐变背景 */
  background-image: linear-gradient(to bottom, #f7f8fa, #cfdafa);
  /* 防止出现滚动条 */
  overflow: hidden;
}

.page-title-icon {
  width: 32px;
  height: 32px;
  font-size: 20px;
  margin-right: 12px;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  /* 模仿图二的图标背景 */
  background-color: #e3e8ff;
  color: #6366f1;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  display: flex;
  align-items: center;
  font-size: 22px;
  font-weight: 600;
  color: #303133;
}

.page-content {
  /* 让 page-content 占据所有可用的垂直空间 */
  flex-grow: 1;
  /* 防止内容溢出导致滚动条 */
  overflow: hidden;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  z-index: 10;
}

/* --- 底部用户信息和退出登录模块样式 --- */
.sidebar-footer {
  flex-shrink: 0; /* 防止被压缩 */
  padding: 350px 10px 0 10px;
  border-top: 1px solid #f0f0f0;
}

.welcome-message {
  display: block;
  text-align: center;
  color: #909399;
  font-size: 14px;
  margin-bottom: 15px;
}

.logout-button {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #606266;
  transition: color 0.3s;
  
  &:hover {
    color: var(--el-color-primary);
  }

  .el-icon {
    margin-right: 8px;
  }
}
</style>