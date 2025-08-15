import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const isAvatarAddDialogVisible = ref(false)

  function openAvatarAddDialog() {
    isAvatarAddDialogVisible.value = true
  }

  function closeAvatarAddDialog() {
    isAvatarAddDialogVisible.value = false
  }

  const isSceneAddDialogVisible = ref(false)

  function openSceneAddDialog() {
    isSceneAddDialogVisible.value = true
  }

  function closeSceneAddDialog() {
    isSceneAddDialogVisible.value = false
  }
  
  const isDigitalHumanDialogVisible = ref(false)

  function openDigitalHumanDialog() {
    isDigitalHumanDialogVisible.value = true
  }

  function closeDigitalHumanDialog() {
    isDigitalHumanDialogVisible.value = false
  }
  
  return { 
    isAvatarAddDialogVisible, 
    openAvatarAddDialog,
    closeAvatarAddDialog,
    
    isSceneAddDialogVisible,
    openSceneAddDialog,
    closeSceneAddDialog,
    
    isDigitalHumanDialogVisible,
    openDigitalHumanDialog,
    closeDigitalHumanDialog,
  }
})