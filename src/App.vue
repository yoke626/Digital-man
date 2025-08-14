<template>
  <el-config-provider :locale="customLocale">
    <router-view />
  </el-config-provider>
</template>

<script setup lang="ts">
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

// --- 核心修改部分 ---

// 1. 使用对象展开语法创建一个新的、普通的 JavaScript 对象
//    这可以确保我们不会意外地修改原始的 zhCn 对象，并且避免了任何响应式问题。
const customLocale = {
  ...zhCn, // 首先，复制 zhCn 对象的所有顶级属性
  el: {
    ...zhCn.el, // 然后，复制 el 对象的所有属性
    pagination: {
      ...zhCn.el.pagination, // 接着，复制 pagination 对象的所有属性
      total: '共 {total} 条实例', // 最后，只覆盖我们想修改的这一个属性
    },
  },
};
// --- 核心修改部分结束 ---

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