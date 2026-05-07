<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const formRef = ref<FormInstance>()
const loading = ref(false)

const loginForm = reactive({
  user_name: '',
  password: ''
})

const rules: FormRules = {
  user_name: [
    { required: true, message: '请输入手机号/用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

async function handleLogin() {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      const result = await userStore.login(
        loginForm.user_name,
        loginForm.password
      )

      if (result.success) {
        ElMessage.success('登录成功')
        router.push('/salary')
      } else {
        ElMessage.error(result.message || '登录失败')
      }
    } finally {
      loading.value = false
    }
  })
}
</script>

<script setup lang="ts">
import LogoMark from '@/components/LogoMark.vue'
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <LogoMark :size="64" uid="login" class="login-logo" />
        <h1>抢单平台</h1>
        <p>薪资计算系统</p>
      </div>

      <el-form
        ref="formRef"
        :model="loginForm"
        :rules="rules"
        class="login-form"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="user_name">
          <el-input
            v-model="loginForm.user_name"
            placeholder="请输入手机号/用户名"
            size="large"
            :prefix-icon="User"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            class="login-btn"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登 录' }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-page);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.login-container::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 600px;
  height: 600px;
  background: var(--gradient-brand);
  opacity: 0.12;
  border-radius: 50%;
  filter: blur(80px);
  animation: gradient-flow 8s ease infinite alternate;
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: var(--bg-surface);
  border-radius: var(--radius-2xl);
  padding: 48px 40px;
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--border-soft);
  position: relative;
  z-index: 1;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-logo {
  margin-bottom: 20px;
  filter: drop-shadow(0 4px 12px rgba(249, 115, 22, 0.25));
}

.login-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 8px 0;
  letter-spacing: var(--letter-spacing-tight);
}

.login-header p {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
  letter-spacing: 0.05em;
}

.login-form {
  width: 100%;
}

.login-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: var(--radius-md);
  transition: all var(--transition-bounce);
}

.login-btn:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}

.login-btn:active {
  transform: translateY(0);
}

:deep(.el-input__wrapper) {
  padding: 4px 15px;
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
}

:deep(.el-input__wrapper:hover) {
  border-color: var(--border-brand);
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: var(--shadow-glow);
}

:deep(.el-form-item) {
  margin-bottom: 24px;
}

@keyframes gradient-flow {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(-10%, 10%) scale(1.1); }
}

@media screen and (max-width: 768px) {
  .login-card {
    padding: 36px 28px;
  }

  .login-header h1 {
    font-size: 24px;
  }
}
</style>
