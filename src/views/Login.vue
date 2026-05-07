<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import LogoMark from '@/components/LogoMark.vue'

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

<template>
  <div class="login-container">
    <!-- 大字品牌水印 -->
    <div class="bg-watermark">JOBS</div>
    <div class="bg-watermark-2">SALARY</div>

    <!-- 斜向光带 -->
    <div class="bg-streak streak-1"></div>
    <div class="bg-streak streak-2"></div>

    <!-- 多层 mesh blob -->
    <div class="bg-blob blob-1"></div>
    <div class="bg-blob blob-2"></div>
    <div class="bg-blob blob-3"></div>
    <div class="bg-blob blob-4"></div>
    <div class="bg-blob blob-5"></div>

    <!-- 浮动几何 -->
    <div class="float-shape shape-ring"></div>
    <div class="float-shape shape-ring-2"></div>
    <div class="float-shape shape-square"></div>
    <div class="float-shape shape-square-fill"></div>
    <div class="float-shape shape-dot-cluster"></div>
    <div class="float-shape shape-dot-cluster-2"></div>
    <div class="float-shape shape-cross"></div>
    <div class="float-shape shape-cross-2"></div>

    <!-- 浮动迷你 UI 卡 -->
    <div class="mini-card mini-card-1">
      <span class="mc-dot mc-dot-success"></span>
      <span>本月完结 +12 项</span>
    </div>
    <div class="mini-card mini-card-2">
      <span class="mc-dot mc-dot-accent"></span>
      <span>实得佣金 ¥4,320</span>
    </div>

    <!-- noise 纹理 -->
    <div class="bg-noise"></div>

    <!-- 主登录卡 -->
    <div class="login-card">
      <div class="card-deco"></div>
      <div class="card-inner">

        <div class="brand">
          <LogoMark :size="44" uid="login" class="brand-logo" />
          <div class="brand-text">
            <div class="brand-name">抢单平台</div>
            <div class="brand-sub">薪资计算系统</div>
          </div>
          <span class="brand-pill">PRO</span>
        </div>

        <h2 class="form-title">欢迎回来</h2>
        <p class="form-sub">使用工作账号登录，继续您的抢单旅程</p>

        <el-form
          ref="formRef"
          :model="loginForm"
          :rules="rules"
          class="login-form"
          @keyup.enter="handleLogin"
        >
          <el-form-item prop="user_name" label="手机号 / 用户名">
            <el-input
              v-model="loginForm.user_name"
              placeholder="输入手机号或用户名"
              size="large"
              :prefix-icon="User"
            />
          </el-form-item>

          <el-form-item prop="password" label="密码">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="输入登录密码"
              size="large"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <div class="form-row">
            <label class="form-check">
              <input type="checkbox" checked>
              <span>记住登录状态</span>
            </label>
            <a href="#" class="form-link" @click.prevent>忘记密码？</a>
          </div>

          <el-form-item>
            <el-button
              type="primary"
              size="large"
              :loading="loading"
              class="login-btn"
              @click="handleLogin"
            >
              {{ loading ? '登录中...' : '立 即 登 录' }}
            </el-button>
          </el-form-item>

          <div class="form-foot">
            还没账号？请联系管理员开通 · <a href="#" @click.prevent>查看指引</a>
          </div>
        </el-form>
      </div>

      <!-- 卡底状态条 -->
      <div class="system-bar">
        <div class="system-status">
          <span class="status-dot"></span>
          <span>系统运行正常</span>
        </div>
        <span>v 2.4.1</span>
      </div>
    </div>

    <!-- 全局底部 -->
    <div class="auth-foot">
      © 2026 抢单平台 · <a href="#" @click.prevent>服务协议</a> · <a href="#" @click.prevent>隐私政策</a>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  background: var(--bg-page);
  position: relative;
  overflow: hidden;
}

/* ============ 网格底纹 ============ */
.login-container::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 1px 1px, rgba(99,91,255,.18) 1px, transparent 1px);
  background-size: 24px 24px;
  opacity: 0.55;
  pointer-events: none;
  z-index: 0;
  mask-image: radial-gradient(ellipse at center, #000 30%, transparent 75%);
  -webkit-mask-image: radial-gradient(ellipse at center, #000 30%, transparent 75%);
}

/* ============ 大字水印 ============ */
.bg-watermark,
.bg-watermark-2 {
  position: absolute;
  z-index: 0;
  pointer-events: none;
  user-select: none;
  font-weight: 800;
  color: transparent;
  line-height: 0.85;
}
.bg-watermark {
  font-size: 24vw;
  letter-spacing: -.06em;
  -webkit-text-stroke: 1.5px rgba(99, 91, 255, .14);
  top: -3vw;
  left: -2vw;
}
.bg-watermark-2 {
  font-size: 14vw;
  letter-spacing: -.05em;
  -webkit-text-stroke: 1px rgba(236, 72, 153, .10);
  bottom: -2vw;
  right: -1vw;
  transform: rotate(-3deg);
}

/* ============ 斜向光带 ============ */
.bg-streak {
  position: absolute;
  z-index: 0;
  pointer-events: none;
  width: 120vw;
  height: 200px;
  filter: blur(40px);
}
.streak-1 {
  top: 18%;
  left: -20vw;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(255, 255, 255, .5) 30%,
    rgba(255, 255, 255, .7) 50%,
    rgba(255, 255, 255, .5) 70%,
    transparent 100%);
  transform: rotate(-12deg);
  opacity: 0.5;
}
.streak-2 {
  top: 65%;
  left: -10vw;
  height: 140px;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(236, 72, 153, .35) 50%,
    transparent 100%);
  transform: rotate(8deg);
  opacity: 0.55;
}

/* ============ Mesh blob ============ */
.bg-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  pointer-events: none;
  z-index: 0;
}
.blob-1 {
  width: 520px; height: 520px;
  background: radial-gradient(circle, #635BFF 0%, transparent 70%);
  top: -120px; left: -140px;
  opacity: 0.42;
  animation: float-slow 18s ease-in-out infinite;
}
.blob-2 {
  width: 460px; height: 460px;
  background: radial-gradient(circle, #818CF8 0%, transparent 70%);
  bottom: -100px; right: -90px;
  opacity: 0.48;
  animation: float-slow 22s ease-in-out infinite reverse;
}
.blob-3 {
  width: 320px; height: 320px;
  background: radial-gradient(circle, #EC4899 0%, transparent 70%);
  top: 12%; right: 20%;
  opacity: 0.22;
  animation: float-center 26s ease-in-out infinite;
}
.blob-4 {
  width: 380px; height: 380px;
  background: radial-gradient(circle, #1E3A8A 0%, transparent 70%);
  bottom: 14%; left: 10%;
  opacity: 0.18;
  animation: float-slow 30s ease-in-out infinite;
}
.blob-5 {
  width: 220px; height: 220px;
  background: radial-gradient(circle, #4F46E5 0%, transparent 70%);
  top: 60%; left: 35%;
  opacity: 0.30;
  animation: float-center 24s ease-in-out infinite reverse;
}

@keyframes float-slow {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50%      { transform: translate(-30px, 40px) scale(1.05); }
}
@keyframes float-center {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33%      { transform: translate(40px, -30px) scale(.95); }
  66%      { transform: translate(-20px, 50px) scale(1.05); }
}

/* ============ 浮动几何 ============ */
.float-shape {
  position: absolute;
  z-index: 0;
  pointer-events: none;
}
.shape-ring {
  width: 110px; height: 110px;
  border: 2.5px solid rgba(99, 91, 255, .42);
  border-radius: 50%;
  top: 12%; right: 7%;
  animation: spin-slow 30s linear infinite;
  opacity: 0.85;
}
.shape-ring::before {
  content: '';
  position: absolute;
  width: 10px; height: 10px;
  background: var(--accent);
  border-radius: 50%;
  top: -5px; left: 50%;
  transform: translateX(-50%);
  box-shadow: 0 0 16px rgba(99, 91, 255, .7);
}
.shape-ring-2 {
  width: 60px; height: 60px;
  border: 2px dashed rgba(236, 72, 153, .4);
  border-radius: 50%;
  bottom: 28%; right: 22%;
  animation: spin-slow 18s linear infinite reverse;
  opacity: 0.7;
}
.shape-square {
  width: 48px; height: 48px;
  border: 2px solid rgba(236, 72, 153, .45);
  border-radius: 10px;
  bottom: 20%; left: 7%;
  transform: rotate(15deg);
  animation: tilt 8s ease-in-out infinite;
  opacity: 0.85;
}
.shape-square-fill {
  width: 28px; height: 28px;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-deep) 100%);
  border-radius: 7px;
  top: 70%; right: 6%;
  transform: rotate(-12deg);
  animation: tilt 10s ease-in-out infinite reverse;
  box-shadow: 0 8px 24px rgba(99, 91, 255, .4);
  opacity: 0.85;
}
.shape-dot-cluster {
  top: 22%; left: 5%;
  width: 96px; height: 96px;
  background-image: radial-gradient(circle, var(--accent) 2px, transparent 2px);
  background-size: 14px 14px;
  opacity: 0.55;
}
.shape-dot-cluster-2 {
  bottom: 12%; right: 32%;
  width: 80px; height: 80px;
  background-image: radial-gradient(circle, #EC4899 1.8px, transparent 1.8px);
  background-size: 12px 12px;
  opacity: 0.4;
}
.shape-cross {
  bottom: 11%; right: 15%;
  width: 32px; height: 32px;
  color: var(--accent);
  opacity: 0.7;
}
.shape-cross::before,
.shape-cross::after {
  content: '';
  position: absolute;
  background: currentColor;
  border-radius: 1.5px;
}
.shape-cross::before { left: 14px; top: 0; width: 3px; height: 32px; }
.shape-cross::after  { left: 0; top: 14px; width: 32px; height: 3px; }

.shape-cross-2 {
  top: 55%; left: 12%;
  width: 18px; height: 18px;
  color: #EC4899;
  opacity: 0.6;
}
.shape-cross-2::before,
.shape-cross-2::after {
  content: '';
  position: absolute;
  background: currentColor;
  border-radius: 1px;
}
.shape-cross-2::before { left: 8px; top: 0; width: 2px; height: 18px; }
.shape-cross-2::after  { left: 0; top: 8px; width: 18px; height: 2px; }

@keyframes spin-slow {
  from { transform: rotate(0); }
  to   { transform: rotate(360deg); }
}
@keyframes tilt {
  0%, 100% { transform: rotate(15deg) translateY(0); }
  50%      { transform: rotate(-8deg) translateY(-12px); }
}

/* ============ 浮动迷你 UI 卡 ============ */
.mini-card {
  position: absolute;
  z-index: 0;
  pointer-events: none;
  background: rgba(255, 255, 255, .7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(99, 91, 255, .12);
  border-radius: 10px;
  padding: 10px 14px;
  box-shadow: 0 8px 24px rgba(99, 91, 255, .12);
  font-size: 12px;
  color: var(--fg-3);
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}
.mc-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.mc-dot-success { background: #00A36F; }
.mc-dot-accent  { background: var(--accent); }

.mini-card-1 {
  top: 18%; left: 6%;
  transform: rotate(-6deg);
  animation: tilt 12s ease-in-out infinite;
}
.mini-card-2 {
  bottom: 18%; right: 6%;
  transform: rotate(5deg);
  animation: tilt 14s ease-in-out infinite reverse;
}

/* ============ noise 纹理 ============ */
.bg-noise {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.5;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/></svg>");
}

/* ============ 主登录卡 ============ */
.login-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 440px;
  background: var(--bg-surface);
  border: 1px solid var(--border-soft);
  border-radius: 16px;
  box-shadow:
    0 4px 12px rgba(0, 0, 0, .04),
    0 24px 60px rgba(99, 91, 255, .14);
  overflow: hidden;
}

/* 顶部高光条 */
.login-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--accent) 0%, #EC4899 100%);
  z-index: 2;
}

/* 卡内右上小装饰 */
.card-deco {
  position: absolute;
  top: -40px; right: -40px;
  width: 140px; height: 140px;
  background: radial-gradient(circle, var(--accent-bg-2) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
}

.card-inner {
  padding: 44px 40px 36px;
  position: relative;
  z-index: 1;
}

/* 品牌区 */
.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 28px;
}
.brand-logo {
  flex-shrink: 0;
  filter: drop-shadow(0 6px 16px rgba(99, 91, 255, .35));
}
.brand-text { display: flex; flex-direction: column; min-width: 0; }
.brand-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--fg);
  letter-spacing: -.01em;
  line-height: 1.2;
}
.brand-sub {
  font-size: 11.5px;
  color: var(--fg-4);
  letter-spacing: .04em;
  text-transform: uppercase;
}
.brand-pill {
  margin-left: auto;
  font-size: 10px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 4px;
  background: var(--accent-bg);
  color: var(--accent-fg);
  letter-spacing: .06em;
}

/* 标题 */
.form-title {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -.022em;
  margin: 0 0 8px;
  color: var(--fg);
}
.form-sub {
  font-size: 13.5px;
  color: var(--fg-3);
  margin-bottom: 28px;
}

/* 表单微调 */
.login-form :deep(.el-form-item) {
  margin-bottom: 18px;
}
.login-form :deep(.el-form-item__label) {
  font-size: 12.5px;
  font-weight: 500;
  color: var(--fg-2);
  line-height: 1.6;
  padding: 0 0 4px;
}
.login-form :deep(.el-input__wrapper) {
  background: var(--bg-surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--r-md);
  box-shadow: none !important;
  height: 44px;
  padding: 0 14px;
  transition: border-color .15s, box-shadow .15s;
}
.login-form :deep(.el-input__wrapper:hover) {
  border-color: var(--border-strong);
}
.login-form :deep(.el-input__wrapper.is-focus) {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-bg) !important;
}

/* 记住 + 忘记密码 */
.form-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
}
.form-check {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  color: var(--fg-3);
  user-select: none;
}
.form-check input { margin: 0; accent-color: var(--accent); }
.form-link {
  color: var(--accent-fg);
  font-weight: 500;
  text-decoration: none;
}
.form-link:hover { text-decoration: underline; }

/* 主按钮 */
.login-btn {
  width: 100%;
  height: 46px;
  border: none;
  border-radius: var(--r-md);
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-deep) 100%) !important;
  color: #fff !important;
  font-size: 14.5px;
  font-weight: 600;
  letter-spacing: .04em;
  box-shadow: 0 4px 12px rgba(99, 91, 255, .32);
  position: relative;
  overflow: hidden;
  transition: box-shadow .2s;
}
.login-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, transparent 30%, rgba(255, 255, 255, .25) 50%, transparent 70%);
  transform: translateX(-100%);
  transition: transform .6s;
  pointer-events: none;
}
.login-btn:hover {
  box-shadow: 0 6px 20px rgba(99, 91, 255, .45);
}
.login-btn:hover::before { transform: translateX(100%); }

/* 底部 */
.form-foot {
  margin-top: 18px;
  text-align: center;
  font-size: 13px;
  color: var(--fg-3);
}
.form-foot a {
  color: var(--accent-fg);
  font-weight: 500;
  text-decoration: none;
}
.form-foot a:hover { text-decoration: underline; }

/* 卡底状态条 */
.system-bar {
  padding: 14px 20px;
  background: var(--bg-soft);
  border-top: 1px solid var(--border-soft);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11.5px;
  color: var(--fg-4);
}
.system-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.status-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #00A36F;
  box-shadow: 0 0 0 3px rgba(0, 163, 111, .18);
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 3px rgba(0, 163, 111, .18); }
  50%      { box-shadow: 0 0 0 5px rgba(0, 163, 111, .05); }
}

/* 全局底部 */
.auth-foot {
  position: absolute;
  bottom: 18px;
  left: 0; right: 0;
  text-align: center;
  font-size: 11.5px;
  color: var(--fg-4);
  z-index: 1;
  pointer-events: none;
}
.auth-foot a {
  pointer-events: auto;
  color: var(--fg-3);
  text-decoration: none;
}
.auth-foot a:hover { color: var(--accent-fg); }

/* 响应式 */
@media screen and (max-width: 768px) {
  .login-container { padding: 24px 20px; }
  .card-inner { padding: 32px 24px 24px; }
  .form-title { font-size: 22px; }
  .mini-card-1, .mini-card-2 { display: none; }
  .shape-ring, .shape-ring-2 { display: none; }
  .auth-foot { font-size: 10.5px; }
}

@media screen and (max-width: 480px) {
  .bg-watermark { font-size: 32vw; }
  .bg-watermark-2 { display: none; }
  .shape-dot-cluster, .shape-dot-cluster-2 { display: none; }
}
</style>
