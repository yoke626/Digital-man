<template>
  <div class="register-container">
    <div class="register-left"></div>
    <div class="register-right">
      <div class="register-form-wrapper">
        <h3 class="title">创建您的账号</h3>
        <el-form ref="registerFormRef" :model="registerForm" :rules="registerRules" class="register-form">
          <el-form-item prop="username">
            <el-input v-model="registerForm.username" size="large" placeholder="请输入用户名" />
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model="registerForm.password" size="large" type="password" placeholder="请输入密码" show-password />
          </el-form-item>
          <el-form-item prop="confirmPassword">
            <el-input v-model="registerForm.confirmPassword" size="large" type="password" placeholder="请再次输入密码" show-password />
          </el-form-item>
          <el-form-item>
            <el-button :loading="loading" type="primary" size="large" class="register-button" @click="handleRegister">注 册</el-button>
          </el-form-item>
          <div class="form-footer">
            <el-link type="primary" @click="$router.push('/login')">已有账号？去登录</el-link>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import { register as registerApi } from '@/api/auth';

const router = useRouter();
const registerFormRef = ref<FormInstance>();
const loading = ref(false);

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
});

const validatePass = (rule: any, value: any, callback: any) => {
  if (value !== registerForm.password) {
    callback(new Error("两次输入的密码不一致!"));
  } else {
    callback();
  }
};

const registerRules = reactive<FormRules>({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validatePass, trigger: 'blur' }
  ],
});

const handleRegister = () => {
  registerFormRef.value?.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        const res = await registerApi(registerForm);
        if (res.data.code === 201 || res.data.code === 200) {
          ElMessage.success('注册成功！');
          router.push('/login');
        } else {
          // 接口文档中没有明确定义注册失败的code，这里做一个通用处理
          ElMessage.error(res.data.message || '注册失败');
        }
      } catch (error: any) {
        // HTTP层面的错误，例如409用户名冲突
        ElMessage.error(error.response?.data?.message || '注册请求失败');
      } finally {
        loading.value = false;
      }
    }
  });
};
</script>

<style lang="scss" scoped>
// 样式与登录页保持一致，可以复用或单独定义
.register-container {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.register-left {
  width: 50%;
  background-image: url(@/assets/login-bg.png); // 复用同一张背景图
  background-size: cover;
  background-position: center;
}

.register-right {
  width: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: linear-gradient(to right, #e7f0ff, #ffffff);
}

.register-form-wrapper {
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

.register-button {
  width: 100%;
  height: 45px;
  font-size: 16px;
}

.form-footer {
  display: flex;
  justify-content: flex-end; /* 右对齐 */
  margin-top: 15px;
  width: 100%;
}
</style>