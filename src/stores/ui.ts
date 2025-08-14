// src/stores/ui.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  // --- Avatar Dialog State (Keep as is) ---
  const isAvatarAddDialogVisible = ref(false)

  function openAvatarAddDialog() {
    isAvatarAddDialogVisible.value = true
  }

  function closeAvatarAddDialog() {
    isAvatarAddDialogVisible.value = false
  }

  // --- 核心修改：为场景弹窗新增状态和方法 ---
  const isSceneAddDialogVisible = ref(false)

  function openSceneAddDialog() {
    isSceneAddDialogVisible.value = true
  }

  function closeSceneAddDialog() {
    isSceneAddDialogVisible.value = false
  }
  // --- 修改结束 ---

   // --- 新增代码 ---
  const isDigitalHumanDialogVisible = ref(false)

  function openDigitalHumanDialog() {
    isDigitalHumanDialogVisible.value = true
  }

  function closeDigitalHumanDialog() {
    isDigitalHumanDialogVisible.value = false
  }
  // --- 新增结束 ---

  return { 
    isAvatarAddDialogVisible, 
    openAvatarAddDialog,
    closeAvatarAddDialog,
    
    // 核心修改：导出新增的状态和方法
    isSceneAddDialogVisible,
    openSceneAddDialog,
    closeSceneAddDialog,

    // --- 新增代码 ---
    isDigitalHumanDialogVisible,
    openDigitalHumanDialog,
    closeDigitalHumanDialog,
  }
})