<template>
  <el-config-provider :locale="customLocale">
    <router-view />
  </el-config-provider>
</template>

<script setup lang="ts">
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

const customLocale = {
  ...zhCn, // 复制 zhCn 对象的所有顶级属性
  el: {
    ...zhCn.el, // 复制 el 对象的所有属性
    pagination: {
      ...zhCn.el.pagination, // 复制 pagination 对象的所有属性
      total: '共 {total} 条实例', // 只覆盖修改的这一个属性
    },
  },
};

</script>

<style>

/* 全局样式重置，确保无边距和滚动条 */
html, body, #app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}
</style>