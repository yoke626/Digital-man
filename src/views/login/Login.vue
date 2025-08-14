<template>
  <div class="login-container">
    <div class="login-left"></div>
    <div class="login-right">
      <div class="login-form-wrapper">
        <h3 class="title">欢迎登录</h3>
        <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" class="login-form" @keyup.enter="handleLogin">
          <el-form-item prop="username">
            <el-input v-model="loginForm.username" size="large" placeholder="请输入账号">
               <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model="loginForm.password" size="large" type="password" placeholder="请输入密码" show-password>
               <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button :loading="loading" type="primary" size="large" class="login-button" @click="handleLogin">登 录</el-button>
          </el-form-item>
          <div class="form-footer">
            <el-link type="primary" @click="$router.push('/register')">没有账号？去注册</el-link>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { useUserStore } from '@/stores/user';
import { ElMessage } from 'element-plus';

const userStore = useUserStore();
const loginFormRef = ref<FormInstance>();
const loading = ref(false);

const loginForm = reactive({
  username: '',
  password: '',
});

const loginRules = reactive<FormRules>({
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
});

const handleLogin = () => {
  loginFormRef.value?.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        // 调用 store 中的登录 action
        await userStore.handleLogin(loginForm);
        // 成功的跳转逻辑已经在 store 中处理
        ElMessage.success('登录成功！');
      } catch (error: any) {
        // store 中的 API 调用如果失败（网络错误或业务错误），会抛出异常
        // 错误消息已在 request.ts 的拦截器中统一弹出，这里可以只在控制台记录
        console.error('Login failed in view:', error);
      } finally {
        loading.value = false;
      }
    }
  });
};
</script>

<style lang="scss" scoped>
/* 样式与您之前确认的版本保持一致 */
.login-container {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.login-left {
  width: 50%;
  background-image: url(@/assets/login-bg.png);
  background-size: cover;
  background-position: center;
}

.login-right {
  width: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: linear-gradient(to right, #e7f0ff, #ffffff);
}

.login-form-wrapper {
  width: 380px;
  padding: 40px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 26px;
  font-weight: 500;
  color: #333;
  margin-bottom: 30px;
  text-align: center;
}

.login-button {
  width: 100%;
  height: 45px;
  font-size: 16px;
}

.form-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
  width: 100%;
}
</style>