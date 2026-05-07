<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import LogoMark from '@/components/LogoMark.vue'
import { ElMessage, ElNotification, ElMessageBox, ElLoading } from 'element-plus'
import type { FormInstance, FormRules, UploadProps } from 'element-plus'

/* ============================================================
 * 章节锚点
 * ============================================================ */
const sections = [
  { id: 'hero', label: '总览' },
  { id: 'colors', label: '配色' },
  { id: 'typography', label: '字体' },
  { id: 'buttons', label: '按钮' },
  { id: 'forms', label: '表单' },
  { id: 'tags', label: '标签' },
  { id: 'data', label: '数据' },
  { id: 'feedback', label: '反馈' },
  { id: 'nav', label: '导航' },
  { id: 'table', label: '表格' },
  { id: 'overlays', label: '弹窗' },
  { id: 'business', label: '业务卡片' },
  { id: 'tokens', label: 'Token' }
]

const activeSection = ref('hero')

function scrollTo(id: string) {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    activeSection.value = id
  }
}

/* ============================================================
 * 配色色板数据
 * ============================================================ */
const brandColors = [
  { name: 'brand-50', hex: '#FFF7ED' },
  { name: 'brand-100', hex: '#FFEDD5' },
  { name: 'brand-200', hex: '#FED7AA' },
  { name: 'brand-300', hex: '#FDBA74' },
  { name: 'brand-400', hex: '#FB923C' },
  { name: 'brand-500', hex: '#F97316', primary: true },
  { name: 'brand-600', hex: '#EA580C' },
  { name: 'brand-700', hex: '#C2410C' },
  { name: 'brand-800', hex: '#9A3412' },
  { name: 'brand-900', hex: '#7C2D12' }
]

const indigoColors = [
  { name: 'indigo-100', hex: '#E0E7FF' },
  { name: 'indigo-300', hex: '#A5B4FC' },
  { name: 'indigo-500', hex: '#6366F1' },
  { name: 'indigo-700', hex: '#4338CA' },
  { name: 'indigo-900', hex: '#1E3A8A', secondary: true }
]

const semanticColors = [
  { name: 'success', label: '成功', hex: '#10B981', bg: '#ECFDF5' },
  { name: 'warning', label: '警告', hex: '#F59E0B', bg: '#FFFBEB' },
  { name: 'danger', label: '危险', hex: '#EF4444', bg: '#FEF2F2' },
  { name: 'info', label: '信息', hex: '#3B82F6', bg: '#EFF6FF' }
]

const grayColors = [
  { name: 'gray-50', hex: '#F9FAFB' },
  { name: 'gray-200', hex: '#E5E7EB' },
  { name: 'gray-400', hex: '#9CA3AF' },
  { name: 'gray-600', hex: '#4B5563' },
  { name: 'gray-800', hex: '#1F2937' },
  { name: 'gray-900', hex: '#111827' }
]

/* ============================================================
 * 表单数据
 * ============================================================ */
const formRef = ref<FormInstance>()
const formData = reactive({
  name: '',
  phone: '',
  password: '',
  region: '',
  type: [] as string[],
  level: 1,
  date: '',
  online: true,
  bio: '',
  rate: 4
})
const formRules: FormRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  region: [{ required: true, message: '请选择地区', trigger: 'change' }]
}
function submitForm() {
  formRef.value?.validate((valid) => {
    if (valid) {
      ElMessage.success('表单提交成功 ')
    } else {
      ElMessage.warning('请检查必填项')
    }
  })
}
function resetForm() {
  formRef.value?.resetFields()
}

/* ============================================================
 * 表格数据
 * ============================================================ */
const tableData = ref([
  { id: 1001, project: '某商场设计图绘制', amount: 2400, status: 'pending', date: '2026-05-01', urgent: true },
  { id: 1002, project: '小程序首页改版', amount: 1800, status: 'doing', date: '2026-04-28', urgent: false },
  { id: 1003, project: '官网重构 - PC 端', amount: 5200, status: 'done', date: '2026-04-20', urgent: false },
  { id: 1004, project: '运营海报 5 张', amount: 900, status: 'overdue', date: '2026-04-10', urgent: true },
  { id: 1005, project: '产品白皮书排版', amount: 3000, status: 'pending', date: '2026-05-03', urgent: false }
])
const statusMap: Record<string, { type: string; label: string }> = {
  pending: { type: 'warning', label: '待接取' },
  doing: { type: '', label: '进行中' },
  done: { type: 'success', label: '已完成' },
  overdue: { type: 'danger', label: '已逾期' }
}

/* ============================================================
 * 弹窗控制
 * ============================================================ */
const dialogVisible = ref(false)
const drawerVisible = ref(false)

function openMessageBox() {
  ElMessageBox.confirm('这条任务接取后不可撤回，确认接取吗？', '操作确认', {
    confirmButtonText: '确认接取',
    cancelButtonText: '再想想',
    type: 'warning'
  })
    .then(() => ElMessage.success('已接取，加油 '))
    .catch(() => { })
}

function showLoading() {
  const loading = ElLoading.service({
    lock: true,
    text: '正在处理...',
    background: 'rgba(255, 251, 245, 0.85)'
  })
  setTimeout(() => loading.close(), 1500)
}

function showNotification(type: 'success' | 'warning' | 'info' | 'error') {
  const map = {
    success: { title: ' 接单成功', message: '项目已加入【我的任务】' },
    warning: { title: ' 注意', message: '截止时间还剩不到 24 小时' },
    info: { title: 'ℹ 系统通知', message: '版本已更新到 v2.0' },
    error: { title: ' 接单失败', message: '当前有进行中任务未完成' }
  }
  ElNotification[type]({ title: map[type].title, message: map[type].message, duration: 3000 })
}

/* ============================================================
 * 倒计时（业务卡片用）
 * ============================================================ */
const countdown = ref({ h: 3, m: 24, s: 15 })
let timer: number | undefined
onMounted(() => {
  timer = window.setInterval(() => {
    let { h, m, s } = countdown.value
    s--
    if (s < 0) { s = 59; m-- }
    if (m < 0) { m = 59; h-- }
    if (h < 0) { h = 0; m = 0; s = 0 }
    countdown.value = { h, m, s }
  }, 1000)

  // 滚动监听激活章节
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) activeSection.value = e.target.id
      })
    },
    { rootMargin: '-30% 0px -60% 0px' }
  )
  sections.forEach(s => {
    const el = document.getElementById(s.id)
    if (el) observer.observe(el)
  })
})
onUnmounted(() => {
  if (timer) clearInterval(timer)
})

function formatProgress(p: number) {
  return p + '/100'
}
function viewRow(id: number) {
  ElMessage.info('查看 #' + id)
}
function spacingBarStyle(n: number) {
  return { width: (n * 4) + 'px' }
}

const pad = (n: number) => String(n).padStart(2, '0')

/* ============================================================
 * Token 速查
 * ============================================================ */
const radiusTokens = [
  { name: '--radius-xs', value: '4px', size: 4 },
  { name: '--radius-sm', value: '8px', size: 8 },
  { name: '--radius-md', value: '12px', size: 12 },
  { name: '--radius-lg', value: '16px', size: 16 },
  { name: '--radius-xl', value: '20px', size: 20 },
  { name: '--radius-full', value: '9999px', size: 9999 }
]
const shadowTokens = [
  { name: '--shadow-xs', class: 'demo-shadow-xs' },
  { name: '--shadow-sm', class: 'demo-shadow-sm' },
  { name: '--shadow-md', class: 'demo-shadow-md' },
  { name: '--shadow-lg', class: 'demo-shadow-lg' },
  { name: '--shadow-xl', class: 'demo-shadow-xl' },
  { name: '--shadow-glow', class: 'demo-shadow-glow' }
]

/* ============================================================
 * 字体 Type Scale
 * ============================================================ */
const typeScale = [
  { tag: 'Display', size: '48px', weight: 700, sample: '抢单平台' },
  { tag: 'H1', size: '36px', weight: 700, sample: '一级标题' },
  { tag: 'H2', size: '30px', weight: 600, sample: '二级标题' },
  { tag: 'H3', size: '24px', weight: 600, sample: '三级标题' },
  { tag: 'H4', size: '20px', weight: 600, sample: '四级标题' },
  { tag: 'Body Lg', size: '16px', weight: 400, sample: '正文（大号）— 行高 1.6 阅读舒适' },
  { tag: 'Body', size: '14px', weight: 400, sample: '正文（默认）— 表格、卡片、表单使用' },
  { tag: 'Caption', size: '12px', weight: 400, sample: '辅助文字 — 时间戳、标签描述、占位说明' }
]

/* ============================================================
 * 上传
 * ============================================================ */
const uploadHandler: UploadProps['onSuccess'] = () => ElMessage.success('上传成功')
function copyHex(hex: string) {
  navigator.clipboard?.writeText(hex)
  ElMessage.success(`已复制 ${hex}`)
}
</script>

<template>
  <div class="design-system">
    <!-- 顶部章节导航 -->
    <nav class="ds-nav">
      <div class="ds-nav-inner">
        <div class="ds-nav-brand">
          <LogoMark :size="40" uid="nav" />
          <div class="ds-brand-text">
            <div class="ds-brand-title">抢单平台</div>
            <div class="ds-brand-sub">Design System</div>
          </div>
        </div>
        <div class="ds-nav-tabs">
          <button v-for="s in sections" :key="s.id" class="ds-nav-tab" :class="{ active: activeSection === s.id }"
            @click="scrollTo(s.id)">
            <span class="ds-nav-tab-icon">{{ s.icon }}</span>
            <span class="ds-nav-tab-label">{{ s.label }}</span>
          </button>
        </div>
      </div>
    </nav>

    <main class="ds-main">
      <!-- ====== Hero ====== -->
      <section id="hero" class="ds-hero">
        <div class="ds-hero-bg"></div>
        <div class="ds-hero-content">
          <div class="ds-hero-badge">
            <span class="ds-pulse-dot"></span>
            v2.0 · 活力科技橙
          </div>
          <h1 class="ds-hero-title">
            为<span class="ds-gradient-text">抢单</span>而生的设计系统
          </h1>
          <p class="ds-hero-desc">
            #F97316 活力橙 · #1E3A8A 深蓝点缀 · #EC4899 高能强调<br>
            HarmonyOS Sans · 12px 圆角 · 强动效（脉冲 / 流光 / 微弹）
          </p>
          <div class="ds-hero-actions">
            <el-button type="primary" size="large" @click="scrollTo('buttons')">
              立即体验组件
            </el-button>
            <el-button size="large" plain @click="scrollTo('business')">
              查看业务卡片
            </el-button>
          </div>
          <div class="ds-hero-stats">
            <div class="ds-hero-stat">
              <div class="ds-hero-stat-num">13</div>
              <div class="ds-hero-stat-label">章节</div>
            </div>
            <div class="ds-hero-stat">
              <div class="ds-hero-stat-num">50+</div>
              <div class="ds-hero-stat-label">组件</div>
            </div>
            <div class="ds-hero-stat">
              <div class="ds-hero-stat-num">100%</div>
              <div class="ds-hero-stat-label">EP 兼容</div>
            </div>
          </div>
        </div>
      </section>

      <!-- ====== 配色 ====== -->
      <section id="colors" class="ds-section">
        <div class="ds-section-header">
          <h2 class="ds-section-title"> 配色体系</h2>
          <p class="ds-section-desc">
            主品牌橙 #F97316 · 辅助深蓝 #1E3A8A · 强调亮粉 #EC4899
          </p>
        </div>

        <h3 class="ds-block-title">品牌主色 · Brand Orange（点击复制）</h3>
        <div class="ds-color-row">
          <div v-for="c in brandColors" :key="c.name" class="ds-color-card" :class="{ 'is-primary': c.primary }"
            :style="{ background: c.hex }" @click="copyHex(c.hex)">
            <div class="ds-color-info">
              <div class="ds-color-name">{{ c.name }}</div>
              <div class="ds-color-hex">{{ c.hex }}</div>
            </div>
            <span v-if="c.primary" class="ds-color-tag">PRIMARY</span>
          </div>
        </div>

        <h3 class="ds-block-title">辅助色 · Indigo（深蓝点缀）</h3>
        <div class="ds-color-row">
          <div v-for="c in indigoColors" :key="c.name" class="ds-color-card" :class="{ 'is-primary': c.secondary }"
            :style="{ background: c.hex }" @click="copyHex(c.hex)">
            <div class="ds-color-info">
              <div class="ds-color-name">{{ c.name }}</div>
              <div class="ds-color-hex">{{ c.hex }}</div>
            </div>
            <span v-if="c.secondary" class="ds-color-tag ds-color-tag-dark">SECONDARY</span>
          </div>
        </div>

        <h3 class="ds-block-title">语义色 · Semantic</h3>
        <div class="ds-semantic-grid">
          <div v-for="c in semanticColors" :key="c.name" class="ds-semantic-card"
            :style="{ background: c.bg, borderColor: c.hex }">
            <div class="ds-semantic-dot" :style="{ background: c.hex }"></div>
            <div>
              <div class="ds-semantic-label">{{ c.label }} · {{ c.name }}</div>
              <div class="ds-semantic-hex">{{ c.hex }} / {{ c.bg }}</div>
            </div>
          </div>
        </div>

        <h3 class="ds-block-title">中性色 · Gray</h3>
        <div class="ds-gray-row">
          <div v-for="c in grayColors" :key="c.name" class="ds-gray-card" :style="{ background: c.hex }"
            @click="copyHex(c.hex)">
            <div class="ds-gray-name">{{ c.name }}</div>
            <div class="ds-gray-hex">{{ c.hex }}</div>
          </div>
        </div>

        <h3 class="ds-block-title">渐变 · Gradient</h3>
        <div class="ds-gradient-grid">
          <div class="ds-gradient-card" style="background: var(--gradient-brand)">
            <div class="ds-gradient-name">日出暖光</div>
            <div class="ds-gradient-code">#F97316 #EC4899</div>
          </div>
          <div class="ds-gradient-card" style="background: var(--gradient-warm)">
            <div class="ds-gradient-name">纯橙渐变</div>
            <div class="ds-gradient-code">#FB923C #F97316</div>
          </div>
          <div class="ds-gradient-card" style="background: var(--gradient-hot)">
            <div class="ds-gradient-name">HOT 红橙</div>
            <div class="ds-gradient-code">#EF4444 #F97316</div>
          </div>
          <div class="ds-gradient-card" style="background: var(--gradient-cool)">
            <div class="ds-gradient-name">深蓝点缀</div>
            <div class="ds-gradient-code">#6366F1 #1E3A8A</div>
          </div>
        </div>
      </section>

      <!-- ====== 字体 ====== -->
      <section id="typography" class="ds-section">
        <div class="ds-section-header">
          <h2 class="ds-section-title"> 字体排版</h2>
          <p class="ds-section-desc">
            HarmonyOS Sans 优先，回退苹方/微软雅黑 · Type Scale 比例 1.25
          </p>
        </div>
        <div class="ds-type-list">
          <div v-for="t in typeScale" :key="t.tag" class="ds-type-row">
            <div class="ds-type-meta">
              <div class="ds-type-tag">{{ t.tag }}</div>
              <div class="ds-type-spec">{{ t.size }} · {{ t.weight }}</div>
            </div>
            <div class="ds-type-sample" :style="{ fontSize: t.size, fontWeight: t.weight }">
              {{ t.sample }}
            </div>
          </div>
        </div>
      </section>

      <!-- ====== 按钮 ====== -->
      <section id="buttons" class="ds-section">
        <div class="ds-section-header">
          <h2 class="ds-section-title"> 按钮 Button</h2>
          <p class="ds-section-desc">主按钮带流光动效，hover 上浮 1px，点击下压</p>
        </div>

        <h3 class="ds-block-title">类型 Type</h3>
        <div class="ds-demo-row">
          <el-button>默认按钮</el-button>
          <el-button type="primary">主要按钮</el-button>
          <el-button type="success">成功按钮</el-button>
          <el-button type="warning">警告按钮</el-button>
          <el-button type="danger">危险按钮</el-button>
          <el-button type="info">信息按钮</el-button>
        </div>

        <h3 class="ds-block-title">朴素 Plain</h3>
        <div class="ds-demo-row">
          <el-button plain>默认</el-button>
          <el-button type="primary" plain>主要</el-button>
          <el-button type="success" plain>成功</el-button>
          <el-button type="warning" plain>警告</el-button>
          <el-button type="danger" plain>危险</el-button>
        </div>

        <h3 class="ds-block-title">圆角 Round</h3>
        <div class="ds-demo-row">
          <el-button round>默认</el-button>
          <el-button type="primary" round>主要</el-button>
          <el-button type="primary" round size="large">大号圆角</el-button>
        </div>

        <h3 class="ds-block-title">尺寸 Size</h3>
        <div class="ds-demo-row">
          <el-button type="primary" size="large">大号 large</el-button>
          <el-button type="primary">默认 default</el-button>
          <el-button type="primary" size="small">小号 small</el-button>
        </div>

        <h3 class="ds-block-title">图标 & 加载 & 禁用</h3>
        <div class="ds-demo-row">
          <el-button type="primary" :icon="'Plus'">新建任务</el-button>
          <el-button type="primary" :icon="'Search'">搜索</el-button>
          <el-button type="primary" :icon="'Edit'" circle />
          <el-button type="danger" :icon="'Delete'" circle />
          <el-button type="primary" loading>加载中</el-button>
          <el-button type="primary" disabled>已禁用</el-button>
        </div>

        <h3 class="ds-block-title">文字 / 链接 Button</h3>
        <div class="ds-demo-row">
          <el-button type="primary" text>文字按钮</el-button>
          <el-button type="primary" text bg>带背景</el-button>
          <el-button link type="primary">链接按钮</el-button>
        </div>

        <h3 class="ds-block-title">按钮组 Group</h3>
        <div class="ds-demo-row">
          <el-button-group>
            <el-button type="primary" :icon="'ArrowLeft'">上一页</el-button>
            <el-button type="primary">下一页 <el-icon class="el-icon--right">
                <ArrowRight />
              </el-icon></el-button>
          </el-button-group>
        </div>
      </section>

      <!-- ====== 表单 ====== -->
      <section id="forms" class="ds-section">
        <div class="ds-section-header">
          <h2 class="ds-section-title"> 输入与表单</h2>
          <p class="ds-section-desc">焦点态自带橙色光晕，hover 边框变色</p>
        </div>

        <div class="ds-form-grid">
          <div class="ds-form-col">
            <h3 class="ds-block-title">基础控件</h3>
            <el-form ref="formRef" :model="formData" :rules="formRules" label-position="top" class="ds-form">
              <el-form-item label="姓名" prop="name">
                <el-input v-model="formData.name" placeholder="请输入姓名" clearable />
              </el-form-item>
              <el-form-item label="手机号" prop="phone">
                <el-input v-model="formData.phone" placeholder="11 位手机号">
                  <template #prefix>
                    <el-icon>
                      <Phone />
                    </el-icon>
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item label="密码">
                <el-input v-model="formData.password" type="password" show-password placeholder="6-20 位字符" />
              </el-form-item>
              <el-form-item label="所在地区" prop="region">
                <el-select v-model="formData.region" placeholder="请选择" style="width: 100%">
                  <el-option label="北京" value="bj" />
                  <el-option label="上海" value="sh" />
                  <el-option label="广州" value="gz" />
                  <el-option label="深圳" value="sz" />
                </el-select>
              </el-form-item>
              <el-form-item label="技能方向（多选）">
                <el-checkbox-group v-model="formData.type">
                  <el-checkbox value="design">设计</el-checkbox>
                  <el-checkbox value="dev">开发</el-checkbox>
                  <el-checkbox value="copy">文案</el-checkbox>
                  <el-checkbox value="ops">运营</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
              <el-form-item label="经验等级">
                <el-radio-group v-model="formData.level">
                  <el-radio-button :value="1">初级</el-radio-button>
                  <el-radio-button :value="2">中级</el-radio-button>
                  <el-radio-button :value="3">高级</el-radio-button>
                  <el-radio-button :value="4">专家</el-radio-button>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="入职日期">
                <el-date-picker v-model="formData.date" type="date" placeholder="选择日期" style="width: 100%" />
              </el-form-item>
              <el-form-item label="是否在线">
                <el-switch v-model="formData.online" active-text="在线" inactive-text="离线" inline-prompt />
              </el-form-item>
              <el-form-item label="自我评价">
                <el-input v-model="formData.bio" type="textarea" :rows="3" placeholder="一句话介绍自己" />
              </el-form-item>
              <el-form-item label="服务评分">
                <el-rate v-model="formData.rate" show-text />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="submitForm">提交表单</el-button>
                <el-button @click="resetForm">重置</el-button>
              </el-form-item>
            </el-form>
          </div>

          <div class="ds-form-col">
            <h3 class="ds-block-title">滑块 Slider</h3>
            <div class="ds-demo-block">
              <el-slider v-model="formData.level" :min="1" :max="4" :step="1" show-stops />
              <el-slider v-model="formData.rate" :min="0" :max="5" :step="0.5"
                :marks="{ 0: '0', 2.5: '2.5', 5: '5' }" />
            </div>

            <h3 class="ds-block-title">数字 InputNumber</h3>
            <div class="ds-demo-row">
              <el-input-number v-model="formData.level" :min="1" :max="10" />
              <el-input-number v-model="formData.rate" :precision="1" :step="0.1" controls-position="right" />
            </div>

            <h3 class="ds-block-title">上传 Upload</h3>
            <el-upload class="ds-uploader" action="#" :auto-upload="false" :on-success="uploadHandler" drag>
              <el-icon class="el-icon--upload">
                <UploadFilled />
              </el-icon>
              <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
              <template #tip>
                <div class="el-upload__tip">支持 jpg/png/pdf，单文件不超过 10MB</div>
              </template>
            </el-upload>

            <h3 class="ds-block-title">输入框前后缀 / 复合输入</h3>
            <div class="ds-demo-block">
              <el-input v-model="formData.name" placeholder="搜索任务...">
                <template #prefix><el-icon>
                    <Search />
                  </el-icon></template>
                <template #append>
                  <el-button :icon="'Search'">搜索</el-button>
                </template>
              </el-input>
              <el-input v-model="formData.phone" placeholder="网址">
                <template #prepend>https://</template>
                <template #append>.com</template>
              </el-input>
            </div>
          </div>
        </div>
      </section>

      <!-- ====== 标签 & 徽标 ====== -->
      <section id="tags" class="ds-section">
        <div class="ds-section-header">
          <h2 class="ds-section-title"> 标签 & 徽标</h2>
          <p class="ds-section-desc">Tag / Badge / Avatar — 状态、计数、身份</p>
        </div>

        <h3 class="ds-block-title">Tag · 各色填充 / 朴素 / 圆角</h3>
        <div class="ds-demo-row">
          <el-tag>默认</el-tag>
          <el-tag type="primary">主要</el-tag>
          <el-tag type="success">成功</el-tag>
          <el-tag type="warning">警告</el-tag>
          <el-tag type="danger">危险</el-tag>
          <el-tag type="info">信息</el-tag>
        </div>
        <div class="ds-demo-row">
          <el-tag effect="plain">默认</el-tag>
          <el-tag effect="plain" type="primary">主要</el-tag>
          <el-tag effect="plain" type="success">成功</el-tag>
          <el-tag effect="plain" type="warning">警告</el-tag>
          <el-tag effect="plain" type="danger">危险</el-tag>
        </div>
        <div class="ds-demo-row">
          <el-tag round>圆角</el-tag>
          <el-tag round type="success">已完成</el-tag>
          <el-tag round type="warning">待审核</el-tag>
          <el-tag round closable>可关闭</el-tag>
        </div>

        <h3 class="ds-block-title">Badge · 计数徽标</h3>
        <div class="ds-demo-row ds-demo-row--gap">
          <el-badge :value="12" class="ds-badge-item">
            <el-button>消息</el-button>
          </el-badge>
          <el-badge :value="200" :max="99" class="ds-badge-item">
            <el-button>评论</el-button>
          </el-badge>
          <el-badge value="HOT" type="danger" class="ds-badge-item">
            <el-button>限时任务</el-button>
          </el-badge>
          <el-badge is-dot class="ds-badge-item">
            <el-button>通知</el-button>
          </el-badge>
        </div>

        <h3 class="ds-block-title">Avatar · 头像</h3>
        <div class="ds-demo-row">
          <el-avatar :size="32" />
          <el-avatar :size="40" :icon="'UserFilled'" />
          <el-avatar :size="48" style="background: var(--gradient-warm); color: #fff">团</el-avatar>
          <el-avatar :size="56" style="background: var(--indigo-900); color: #fff">张</el-avatar>
          <el-avatar :size="64" shape="square"
            style="background: var(--brand-100); color: var(--brand-700)">UI</el-avatar>
        </div>
      </section>

      <!-- ====== 数据展示 ====== -->
      <section id="data" class="ds-section">
        <div class="ds-section-header">
          <h2 class="ds-section-title"> 数据展示</h2>
          <p class="ds-section-desc">Statistic / Progress / Skeleton / Empty</p>
        </div>

        <h3 class="ds-block-title">数据统计 Statistic</h3>
        <div class="ds-stat-grid">
          <div class="ds-stat-card">
            <div class="ds-stat-icon" style="background: var(--gradient-warm)"><el-icon>
                <Money />
              </el-icon></div>
            <div class="ds-stat-info">
              <div class="ds-stat-label">本月佣金</div>
              <div class="ds-stat-value">¥ 8,420.<span class="ds-stat-decimal">00</span></div>
              <div class="ds-stat-trend up"> 12.5% 较上月</div>
            </div>
          </div>
          <div class="ds-stat-card">
            <div class="ds-stat-icon" style="background: var(--gradient-cool)"><el-icon>
                <Box />
              </el-icon></div>
            <div class="ds-stat-info">
              <div class="ds-stat-label">完成任务</div>
              <div class="ds-stat-value">42</div>
              <div class="ds-stat-trend up"> 8 较上月</div>
            </div>
          </div>
          <div class="ds-stat-card">
            <div class="ds-stat-icon" style="background: var(--gradient-hot)"><el-icon>
                <AlarmClock />
              </el-icon></div>
            <div class="ds-stat-info">
              <div class="ds-stat-label">进行中</div>
              <div class="ds-stat-value">5</div>
              <div class="ds-stat-trend">2 个临近截止</div>
            </div>
          </div>
          <div class="ds-stat-card">
            <div class="ds-stat-icon" style="background: linear-gradient(135deg, #10B981, #059669)"><el-icon>
                <Medal />
              </el-icon></div>
            <div class="ds-stat-info">
              <div class="ds-stat-label">综合评分</div>
              <div class="ds-stat-value">4.8</div>
              <div class="ds-stat-trend">超过 92% 同行</div>
            </div>
          </div>
        </div>

        <h3 class="ds-block-title">进度 Progress（横向 / 圆形 / 仪表盘）</h3>
        <div class="ds-progress-grid">
          <div class="ds-progress-line">
            <div class="ds-progress-label">总目标完成度</div>
            <el-progress :percentage="68" :stroke-width="10" />
            <el-progress :percentage="100" status="success" :stroke-width="10" />
            <el-progress :percentage="42" status="exception" :stroke-width="10" />
            <el-progress :percentage="80" :stroke-width="10" :format="formatProgress" />
          </div>
          <div class="ds-progress-circles">
            <el-progress type="circle" :percentage="68" :width="100" />
            <el-progress type="circle" :percentage="100" status="success" :width="100" />
            <el-progress type="dashboard" :percentage="78" :width="100" />
          </div>
        </div>

        <h3 class="ds-block-title">骨架 Skeleton</h3>
        <div class="ds-demo-block">
          <el-skeleton :rows="3" animated />
        </div>

        <h3 class="ds-block-title">空状态 Empty</h3>
        <div class="ds-demo-row ds-empty-demo">
          <el-empty description="暂无数据" />
          <el-empty description="还没有接取任何任务">
            <el-button type="primary">去任务大厅看看</el-button>
          </el-empty>
        </div>
      </section>

      <!-- ====== 反馈 ====== -->
      <section id="feedback" class="ds-section">
        <div class="ds-section-header">
          <h2 class="ds-section-title"> 反馈</h2>
          <p class="ds-section-desc">Alert / Message / Notification / Loading / MessageBox</p>
        </div>

        <h3 class="ds-block-title">Alert · 警告提示</h3>
        <div class="ds-alert-stack">
          <el-alert title=" 接单成功" description="项目已加入【我的任务】，请按时完成。" type="success" show-icon />
          <el-alert title=" 临近截止" description="您有 2 个任务在 24 小时内到期，请尽快处理。" type="warning" show-icon />
          <el-alert title=" 接单失败" description="当前有进行中任务未申请完结，无法接取新任务。" type="error" show-icon />
          <el-alert title="ℹ 系统通知" description="本月起佣金计算规则升级，详见说明。" type="info" show-icon />
        </div>

        <h3 class="ds-block-title">触发反馈（点击体验）</h3>
        <div class="ds-demo-row">
          <el-button type="success" @click="ElMessage.success('操作成功 ')">Message · 成功</el-button>
          <el-button type="warning" @click="ElMessage.warning('请注意检查')">Message · 警告</el-button>
          <el-button type="danger" @click="ElMessage.error('操作失败')">Message · 错误</el-button>
          <el-button @click="showNotification('success')">Notification · 成功</el-button>
          <el-button @click="showNotification('warning')">Notification · 警告</el-button>
          <el-button @click="openMessageBox">MessageBox · 确认框</el-button>
          <el-button @click="showLoading">Loading · 全屏加载</el-button>
        </div>
      </section>

      <!-- ====== 导航 ====== -->
      <section id="nav" class="ds-section">
        <div class="ds-section-header">
          <h2 class="ds-section-title"> 导航</h2>
          <p class="ds-section-desc">Tabs / Breadcrumb / Steps / Pagination</p>
        </div>

        <h3 class="ds-block-title">Tabs · 标签页</h3>
        <el-tabs type="border-card" class="ds-tabs">
          <el-tab-pane label=" 任务概览">
            任务概览内容 — 显示当前进行中、待接取、已完成的统计
          </el-tab-pane>
          <el-tab-pane label=" 佣金明细">佣金明细内容 — 按月份展示已结算/未结算金额</el-tab-pane>
          <el-tab-pane label=" 评价反馈">评价反馈内容 — 客户评分与文字反馈</el-tab-pane>
          <el-tab-pane label=" 个人设置">个人设置内容 — 底薪、入职日期、通知偏好</el-tab-pane>
        </el-tabs>

        <h3 class="ds-block-title">Breadcrumb · 面包屑</h3>
        <el-breadcrumb separator=">">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>任务大厅</el-breadcrumb-item>
          <el-breadcrumb-item>商场设计图绘制</el-breadcrumb-item>
          <el-breadcrumb-item>详情</el-breadcrumb-item>
        </el-breadcrumb>

        <h3 class="ds-block-title">Steps · 步骤条</h3>
        <el-steps :active="2" finish-status="success" align-center>
          <el-step title="接取任务" description="2026-05-01" />
          <el-step title="正在执行" description="进行中" />
          <el-step title="申请完结" description="待审核" />
          <el-step title="结算完成" description="待结算" />
        </el-steps>

        <h3 class="ds-block-title">Pagination · 分页</h3>
        <el-pagination background layout="total, sizes, prev, pager, next, jumper" :total="400" :page-size="20"
          :current-page="3" />
      </section>

      <!-- ====== 表格 ====== -->
      <section id="table" class="ds-section">
        <div class="ds-section-header">
          <h2 class="ds-section-title"> 表格 Table</h2>
          <p class="ds-section-desc">表头浅橙背景，行 hover 变橙色调</p>
        </div>

        <el-table :data="tableData" stripe class="ds-table" border>
          <el-table-column type="selection" width="48" />
          <el-table-column prop="id" label="编号" width="80" />
          <el-table-column prop="project" label="项目名称" min-width="200">
            <template #default="{ row }">
              <span class="ds-table-project">
                <span v-if="row.urgent" class="ds-urgent-dot"></span>
                {{ row.project }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="amount" label="佣金 ¥" width="120" align="right">
            <template #default="{ row }">
              <span class="ds-table-amount">¥ {{ row.amount.toLocaleString() }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="120">
            <template #default="{ row }">
              <el-tag :type="(statusMap[row.status].type as any)" round size="small" effect="light">
                {{ statusMap[row.status].label }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="date" label="接单时间" width="140" />
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="viewRow(row.id)">详情</el-button>
              <el-button type="primary" link size="small">编辑</el-button>
              <el-button type="danger" link size="small">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </section>

      <!-- ====== 弹窗 ====== -->
      <section id="overlays" class="ds-section">
        <div class="ds-section-header">
          <h2 class="ds-section-title"> 弹窗 Overlay</h2>
          <p class="ds-section-desc">Dialog / Drawer / Popover / Tooltip / Popconfirm</p>
        </div>

        <div class="ds-demo-row">
          <el-button type="primary" @click="dialogVisible = true">打开 Dialog</el-button>
          <el-button @click="drawerVisible = true">打开 Drawer</el-button>
          <el-popover trigger="click" placement="top" title="温馨提示" width="220">
            <template #reference>
              <el-button>Popover 气泡卡片</el-button>
            </template>
            <p>这是一段说明文字，可以放置富内容。</p>
            <el-button type="primary" size="small" style="margin-top: 8px">了解更多</el-button>
          </el-popover>
          <el-tooltip content="这是一个 Tooltip 提示" placement="top">
            <el-button>悬停查看 Tooltip</el-button>
          </el-tooltip>
          <el-popconfirm title="确认要删除这条记录吗？" @confirm="ElMessage.success('已删除')">
            <template #reference>
              <el-button type="danger">Popconfirm 确认</el-button>
            </template>
          </el-popconfirm>
        </div>

        <el-dialog v-model="dialogVisible" title="任务详情 · 商场设计图绘制" width="560px">
          <div class="ds-dialog-content">
            <div class="ds-dialog-row">
              <span class="ds-dialog-label">项目编号</span>
              <span>#1001</span>
            </div>
            <div class="ds-dialog-row">
              <span class="ds-dialog-label">佣金</span>
              <span class="ds-dialog-amount">¥ 2,400.00</span>
            </div>
            <div class="ds-dialog-row">
              <span class="ds-dialog-label">截止时间</span>
              <span>2026-05-15 18:00</span>
            </div>
            <div class="ds-dialog-row">
              <span class="ds-dialog-label">需求说明</span>
              <span>共 12 张商场布局图，需高清矢量交付，支持 2 轮免费修改。</span>
            </div>
          </div>
          <template #footer>
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="dialogVisible = false; ElMessage.success('已接取')">立即接取</el-button>
          </template>
        </el-dialog>

        <el-drawer v-model="drawerVisible" title="筛选条件" size="400px">
          <el-form label-position="top">
            <el-form-item label="项目类型">
              <el-checkbox-group v-model="formData.type">
                <el-checkbox value="design">设计</el-checkbox>
                <el-checkbox value="dev">开发</el-checkbox>
                <el-checkbox value="copy">文案</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="佣金范围">
              <el-slider v-model="formData.level" :min="0" :max="10000" range />
            </el-form-item>
            <el-form-item label="状态">
              <el-radio-group v-model="formData.level">
                <el-radio :value="1">全部</el-radio>
                <el-radio :value="2">待接取</el-radio>
                <el-radio :value="3">进行中</el-radio>
              </el-radio-group>
            </el-form-item>
            <div class="ds-drawer-actions">
              <el-button style="flex: 1" @click="drawerVisible = false">重置</el-button>
              <el-button type="primary" style="flex: 1" @click="drawerVisible = false">确定</el-button>
            </div>
          </el-form>
        </el-drawer>
      </section>

      <!-- ====== 业务卡片 ====== -->
      <section id="business" class="ds-section">
        <div class="ds-section-header">
          <h2 class="ds-section-title"> 业务卡片预览</h2>
          <p class="ds-section-desc">把品牌调性应用到真实业务场景，方便对比效果</p>
        </div>

        <h3 class="ds-block-title">限时任务 · 倒计时 + 流光</h3>
        <div class="biz-card biz-urgent">
          <div class="biz-urgent-bg"></div>
          <div class="biz-urgent-header">
            <div class="biz-urgent-tag">
              <span class="ds-pulse-dot"></span> 限时抢
            </div>
            <div class="biz-urgent-countdown">
              <span class="biz-cd-label">剩余</span>
              <span class="biz-cd-num">{{ pad(countdown.h) }}</span>
              <span class="biz-cd-sep">:</span>
              <span class="biz-cd-num">{{ pad(countdown.m) }}</span>
              <span class="biz-cd-sep">:</span>
              <span class="biz-cd-num">{{ pad(countdown.s) }}</span>
            </div>
          </div>
          <div class="biz-urgent-body">
            <div class="biz-urgent-title">某连锁品牌 5 月份新品 KV 设计</div>
            <div class="biz-urgent-meta">
              <span> 远程</span>
              <span> 工期 5 个工作日</span>
              <span> 限 3 人</span>
            </div>
            <div class="biz-urgent-money">
              <span class="biz-money-label">总佣金</span>
              <span class="biz-money-num">¥ 4,800</span>
              <span class="biz-money-extra">+800 加价</span>
            </div>
          </div>
          <div class="biz-urgent-footer">
            <el-button type="primary" size="large" round style="width: 100%; font-weight: 600">
              立即抢 · 先到先得
            </el-button>
          </div>
        </div>

        <h3 class="ds-block-title">普通任务卡 · 网格布局</h3>
        <div class="biz-grid">
          <div class="biz-card biz-task" v-for="i in 3" :key="i">
            <div class="biz-task-header">
              <el-tag :type="i === 1 ? 'warning' : i === 2 ? 'success' : ''" size="small" round>
                {{ i === 1 ? '待接取' : i === 2 ? '进行中' : '已完成' }}
              </el-tag>
              <span class="biz-task-deadline">截止 05-{{ 10 + i * 3 }}</span>
            </div>
            <div class="biz-task-title">商场购物中心 LOGO 改版 · {{ i }}号项目</div>
            <div class="biz-task-info">
              <div class="biz-task-row">
                <span class="biz-task-label">类型</span>
                <span>视觉设计</span>
              </div>
              <div class="biz-task-row">
                <span class="biz-task-label">工期</span>
                <span>{{ 5 + i }} 个工作日</span>
              </div>
            </div>
            <div class="biz-task-money">
              <span class="biz-task-money-num">¥ {{ (1800 + i * 600).toLocaleString() }}</span>
              <span class="biz-task-money-label">总佣金</span>
            </div>
            <div class="biz-task-actions">
              <el-button type="primary" size="small" round style="flex: 1">{{ i === 1 ? '接取' : '查看' }}</el-button>
              <el-button size="small" round>详情</el-button>
            </div>
          </div>
        </div>

        <h3 class="ds-block-title">薪资统计 · 大数字 + 渐变</h3>
        <div class="biz-salary">
          <div class="biz-salary-title">本月薪资明细 · 2026 年 5 月</div>
          <div class="biz-salary-main">
            <div class="biz-salary-amount">
              <span class="biz-salary-currency">¥</span>
              <span class="biz-salary-num">8,420</span>
              <span class="biz-salary-decimal">.00</span>
            </div>
            <div class="biz-salary-trend"> 12.5% 较上月（¥ 7,485）</div>
          </div>
          <div class="biz-salary-breakdown">
            <div class="biz-salary-item">
              <div class="biz-salary-item-label">底薪</div>
              <div class="biz-salary-item-value">¥ 3,200</div>
            </div>
            <div class="biz-salary-divider"></div>
            <div class="biz-salary-item">
              <div class="biz-salary-item-label">总佣金</div>
              <div class="biz-salary-item-value">¥ 10,440</div>
            </div>
            <div class="biz-salary-divider"></div>
            <div class="biz-salary-item">
              <div class="biz-salary-item-label">实得比例</div>
              <div class="biz-salary-item-value biz-salary-rate">50%</div>
            </div>
          </div>
        </div>
      </section>

      <!-- ====== Token 速查 ====== -->
      <section id="tokens" class="ds-section">
        <div class="ds-section-header">
          <h2 class="ds-section-title"> Design Token 速查</h2>
          <p class="ds-section-desc">业务页面应通过 var(--xxx) 引用，禁止硬编码</p>
        </div>

        <h3 class="ds-block-title">圆角 Radius</h3>
        <div class="ds-token-row">
          <div v-for="r in radiusTokens" :key="r.name" class="ds-token-radius">
            <div class="ds-token-radius-box" :style="{ borderRadius: r.value }"></div>
            <div class="ds-token-name">{{ r.name }}</div>
            <div class="ds-token-value">{{ r.value }}</div>
          </div>
        </div>

        <h3 class="ds-block-title">阴影 Shadow</h3>
        <div class="ds-token-row">
          <div v-for="s in shadowTokens" :key="s.name" class="ds-token-shadow">
            <div class="ds-token-shadow-box" :class="s.class"></div>
            <div class="ds-token-name">{{ s.name }}</div>
          </div>
        </div>

        <h3 class="ds-block-title">动效 Easing & Duration</h3>
        <div class="ds-token-easing">
          <div class="ds-token-name">--easing-bounce · 微弹（按钮 hover）</div>
          <div class="ds-easing-track">
            <div class="ds-easing-ball ds-ball-bounce"></div>
          </div>
          <div class="ds-token-name" style="margin-top: 12px">--easing-standard · 标准（大多数过渡）</div>
          <div class="ds-easing-track">
            <div class="ds-easing-ball ds-ball-standard"></div>
          </div>
        </div>

        <h3 class="ds-block-title">间距 Spacing（4px 基准网格）</h3>
        <div class="ds-token-spacing">
          <div class="ds-spacing-row" v-for="n in [1, 2, 3, 4, 6, 8, 12]" :key="n">
            <div class="ds-spacing-name">--space-{{ n }}</div>
            <div class="ds-spacing-bar" :style="spacingBarStyle(n)"></div>
            <div class="ds-spacing-value">{{ n * 4 }}px</div>
          </div>
        </div>
      </section>

      <!-- 底部 -->
      <footer class="ds-footer">
        <div class="ds-footer-inner">
          <div>抢单平台 · Design System v2.0</div>
          <div class="ds-footer-tags">
            <span class="ds-footer-tag">Vue 3</span>
            <span class="ds-footer-tag">Element Plus</span>
            <span class="ds-footer-tag">活力科技橙</span>
            <span class="ds-footer-tag">CSS Variables</span>
          </div>
        </div>
      </footer>
    </main>
  </div>
</template>

<script lang="ts">
import {
  Plus, Search, Edit, Delete, ArrowLeft, ArrowRight,
  Phone, UploadFilled, UserFilled
} from '@element-plus/icons-vue'
export default {
  components: {
    Plus, Search, Edit, Delete, ArrowLeft, ArrowRight,
    Phone, UploadFilled, UserFilled
  }
}
</script>

<style scoped>
/* ============================================================
 * 整体布局
 * ============================================================ */
.design-system {
  min-height: 100vh;
  background: var(--bg-page);
  color: var(--text-primary);
  font-family: var(--font-family-base);
}

/* ============================================================
 * 顶部导航
 * ============================================================ */
.ds-nav {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: saturate(180%) blur(12px);
  border-bottom: 1px solid var(--border-default);
  box-shadow: var(--shadow-sm);
}

.ds-nav-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  gap: 32px;
}

.ds-nav-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.ds-logo {
  display: flex;
  align-items: center;
  justify-content: center;
}

.ds-brand-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}

.ds-brand-sub {
  font-size: 11px;
  color: var(--text-secondary);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.ds-nav-tabs {
  display: flex;
  gap: 4px;
  flex: 1;
  overflow-x: auto;
  scrollbar-width: none;
}

.ds-nav-tabs::-webkit-scrollbar {
  display: none;
}

.ds-nav-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: var(--radius-md);
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  transition: all var(--transition-base);
  font-family: inherit;
}

.ds-nav-tab:hover {
  background: var(--brand-50);
  color: var(--brand-700);
}

.ds-nav-tab.active {
  background: var(--gradient-warm);
  color: white;
  box-shadow: 0 4px 12px -2px rgba(249, 115, 22, 0.35);
}

.ds-nav-tab-icon {
  font-size: 14px;
}

/* ============================================================
 * 主内容
 * ============================================================ */
.ds-main {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px 80px;
}

.ds-section {
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  padding: 40px;
  margin-top: 32px;
  box-shadow: var(--shadow-sm);
}

.ds-section-header {
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 1px dashed var(--border-default);
}

.ds-section-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 8px 0;
  letter-spacing: var(--letter-spacing-tight);
}

.ds-section-desc {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
}

.ds-block-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 32px 0 16px;
  padding-left: 12px;
  border-left: 3px solid var(--brand-500);
  letter-spacing: var(--letter-spacing-normal);
}

.ds-block-title:first-child {
  margin-top: 0;
}

.ds-demo-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
}

.ds-demo-row--gap {
  gap: 28px;
}

.ds-demo-block {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 16px;
}

/* ============================================================
 * Hero
 * ============================================================ */
.ds-hero {
  position: relative;
  margin-top: 32px;
  border-radius: var(--radius-2xl);
  overflow: hidden;
  padding: 80px 60px;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  box-shadow: var(--shadow-sm);
}

.ds-hero-bg {
  position: absolute;
  top: -50%;
  right: -20%;
  width: 600px;
  height: 600px;
  background: var(--gradient-brand);
  opacity: 0.15;
  border-radius: 50%;
  filter: blur(80px);
  animation: gradient-flow 8s ease infinite alternate;
}

.ds-hero-content {
  position: relative;
  z-index: 1;
}

.ds-hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: var(--brand-50);
  border: 1px solid var(--brand-200);
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 600;
  color: var(--brand-700);
  margin-bottom: 24px;
}

.ds-pulse-dot {
  width: 8px;
  height: 8px;
  background: var(--brand-500);
  border-radius: 50%;
  animation: pulse-brand 2s ease-in-out infinite;
}

.ds-hero-title {
  font-size: 56px;
  font-weight: 800;
  line-height: 1.1;
  margin: 0 0 20px 0;
  letter-spacing: -0.03em;
}

.ds-gradient-text {
  background: var(--gradient-brand);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  background-size: 200% 200%;
  animation: gradient-flow 4s ease infinite;
}

.ds-hero-desc {
  font-size: 16px;
  line-height: 1.8;
  color: var(--text-secondary);
  margin: 0 0 32px 0;
}

.ds-hero-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 48px;
}

.ds-hero-stats {
  display: flex;
  gap: 48px;
  padding-top: 32px;
  border-top: 1px solid var(--border-default);
}

.ds-hero-stat-num {
  font-size: 36px;
  font-weight: 800;
  background: var(--gradient-warm);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  line-height: 1;
  margin-bottom: 4px;
}

.ds-hero-stat-label {
  font-size: 13px;
  color: var(--text-secondary);
}

/* ============================================================
 * 配色卡片
 * ============================================================ */
.ds-color-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 8px;
  margin-bottom: 16px;
}

.ds-color-card {
  position: relative;
  height: 96px;
  border-radius: var(--radius-md);
  padding: 12px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  cursor: pointer;
  transition: all var(--transition-base);
  border: 1px solid rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.ds-color-card:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: var(--shadow-lg);
  z-index: 1;
}

.ds-color-card.is-primary {
  height: 120px;
  box-shadow: 0 8px 24px -8px rgba(249, 115, 22, 0.4);
}

.ds-color-name,
.ds-color-hex {
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  font-size: 12px;
}

.ds-color-card[style*="FFF7ED"] .ds-color-name,
.ds-color-card[style*="FFEDD5"] .ds-color-name,
.ds-color-card[style*="FED7AA"] .ds-color-name,
.ds-color-card[style*="FDBA74"] .ds-color-name,
.ds-color-card[style*="E0E7FF"] .ds-color-name,
.ds-color-card[style*="A5B4FC"] .ds-color-name,
.ds-color-card[style*="FFF7ED"] .ds-color-hex,
.ds-color-card[style*="FFEDD5"] .ds-color-hex,
.ds-color-card[style*="FED7AA"] .ds-color-hex,
.ds-color-card[style*="FDBA74"] .ds-color-hex,
.ds-color-card[style*="E0E7FF"] .ds-color-hex,
.ds-color-card[style*="A5B4FC"] .ds-color-hex {
  color: var(--text-primary);
  text-shadow: none;
}

.ds-color-name {
  font-weight: 600;
}

.ds-color-hex {
  font-family: var(--font-family-mono);
  margin-top: 2px;
  opacity: 0.9;
}

.ds-color-tag {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(4px);
  border-radius: var(--radius-xs);
  font-size: 10px;
  font-weight: 700;
  color: white;
  letter-spacing: 0.05em;
}

.ds-color-tag-dark {
  background: rgba(255, 255, 255, 0.2);
}

.ds-semantic-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.ds-semantic-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-radius: var(--radius-md);
  border: 1px solid;
}

.ds-semantic-dot {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.ds-semantic-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.ds-semantic-hex {
  font-size: 12px;
  font-family: var(--font-family-mono);
  color: var(--text-secondary);
  margin-top: 2px;
}

.ds-gray-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 8px;
}

.ds-gray-card {
  height: 80px;
  border-radius: var(--radius-md);
  padding: 12px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  cursor: pointer;
  transition: transform var(--transition-base);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.ds-gray-card:hover {
  transform: translateY(-2px);
}

.ds-gray-name {
  font-size: 12px;
  font-weight: 600;
}

.ds-gray-hex {
  font-size: 11px;
  font-family: var(--font-family-mono);
  margin-top: 2px;
  opacity: 0.8;
}

.ds-gray-card[style*="F9FAFB"] .ds-gray-name,
.ds-gray-card[style*="E5E7EB"] .ds-gray-name,
.ds-gray-card[style*="F9FAFB"] .ds-gray-hex,
.ds-gray-card[style*="E5E7EB"] .ds-gray-hex {
  color: var(--text-primary);
}

.ds-gray-card[style*="9CA3AF"] .ds-gray-name,
.ds-gray-card[style*="4B5563"] .ds-gray-name,
.ds-gray-card[style*="1F2937"] .ds-gray-name,
.ds-gray-card[style*="111827"] .ds-gray-name,
.ds-gray-card[style*="9CA3AF"] .ds-gray-hex,
.ds-gray-card[style*="4B5563"] .ds-gray-hex,
.ds-gray-card[style*="1F2937"] .ds-gray-hex,
.ds-gray-card[style*="111827"] .ds-gray-hex {
  color: white;
}

.ds-gradient-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.ds-gradient-card {
  height: 120px;
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  color: white;
  cursor: pointer;
  transition: all var(--transition-base);
  background-size: 200% 200% !important;
}

.ds-gradient-card:hover {
  transform: translateY(-3px) scale(1.01);
  box-shadow: var(--shadow-lg);
  animation: gradient-flow 3s ease infinite;
}

.ds-gradient-name {
  font-weight: 700;
  font-size: 16px;
  margin-bottom: 4px;
}

.ds-gradient-code {
  font-size: 12px;
  font-family: var(--font-family-mono);
  opacity: 0.9;
}

/* ============================================================
 * 字体
 * ============================================================ */
.ds-type-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ds-type-row {
  display: grid;
  grid-template-columns: 160px 1fr;
  align-items: center;
  padding: 16px 20px;
  border-radius: var(--radius-md);
  transition: background var(--transition-base);
}

.ds-type-row:hover {
  background: var(--brand-50);
}

.ds-type-meta {
  border-right: 1px dashed var(--border-default);
  padding-right: 16px;
}

.ds-type-tag {
  font-size: 11px;
  font-weight: 700;
  color: var(--brand-700);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.ds-type-spec {
  font-size: 11px;
  font-family: var(--font-family-mono);
  color: var(--text-tertiary);
  margin-top: 2px;
}

.ds-type-sample {
  padding-left: 24px;
  color: var(--text-primary);
  line-height: 1.4;
}

/* ============================================================
 * 表单网格
 * ============================================================ */
.ds-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}

.ds-form .el-form-item {
  margin-bottom: 20px;
}

.ds-uploader {
  width: 100%;
}

/* ============================================================
 * 数据展示
 * ============================================================ */
.ds-stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.ds-stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
}

.ds-stat-card:hover {
  transform: translateY(-2px);
  border-color: var(--border-brand);
  box-shadow: var(--shadow-md);
}

.ds-stat-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: var(--shadow-md);
  color: #FFFFFF;
}

.ds-stat-icon .el-icon {
  font-size: 26px;
}

.ds-stat-info {
  flex: 1;
  min-width: 0;
}

.ds-stat-label {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.ds-stat-value {
  font-size: 26px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
  font-family: var(--font-family-base);
}

.ds-stat-decimal {
  font-size: 16px;
  color: var(--text-tertiary);
}

.ds-stat-trend {
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 6px;
}

.ds-stat-trend.up {
  color: var(--color-success);
  font-weight: 500;
}

.ds-progress-grid {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 32px;
  align-items: start;
}

.ds-progress-line {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ds-progress-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: -8px;
}

.ds-progress-circles {
  display: flex;
  gap: 24px;
}

.ds-empty-demo {
  justify-content: space-around;
  align-items: stretch;
}

/* ============================================================
 * 反馈
 * ============================================================ */
.ds-alert-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

/* ============================================================
 * 导航
 * ============================================================ */
.ds-tabs {
  margin-bottom: 24px;
}

.ds-tabs :deep(.el-tabs__content) {
  padding: 16px 4px;
  color: var(--text-secondary);
}

/* ============================================================
 * 表格
 * ============================================================ */
.ds-table {
  border-radius: var(--radius-md);
}

.ds-table-project {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.ds-urgent-dot {
  width: 6px;
  height: 6px;
  background: var(--color-danger);
  border-radius: 50%;
  animation: pulse-brand 1.5s ease-in-out infinite;
  flex-shrink: 0;
}

.ds-table-amount {
  font-weight: 600;
  color: var(--brand-700);
  font-family: var(--font-family-base);
}

/* ============================================================
 * Dialog 内容
 * ============================================================ */
.ds-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ds-dialog-row {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.6;
}

.ds-dialog-label {
  width: 80px;
  flex-shrink: 0;
  color: var(--text-secondary);
}

.ds-dialog-amount {
  font-weight: 700;
  color: var(--brand-700);
  font-size: 18px;
}

.ds-drawer-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

/* ============================================================
 * 业务卡片 · 限时
 * ============================================================ */
.biz-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  overflow: hidden;
  position: relative;
  transition: all var(--transition-base);
}

.biz-urgent {
  background: linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 70%);
  border: 1px solid var(--brand-200);
  margin-bottom: 16px;
}

.biz-urgent::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: var(--gradient-hot);
  background-size: 200% 200%;
  animation: gradient-flow 3s ease infinite;
}

.biz-urgent-bg {
  position: absolute;
  top: -50px;
  right: -50px;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(236, 72, 153, 0.12) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

.biz-urgent-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px dashed var(--border-default);
  position: relative;
  z-index: 1;
}

.biz-urgent-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: var(--gradient-hot);
  color: white;
  font-size: 12px;
  font-weight: 700;
  border-radius: var(--radius-full);
  box-shadow: 0 4px 12px -2px rgba(239, 68, 68, 0.4);
}

.biz-urgent-tag .ds-pulse-dot {
  background: white;
  animation: pulse-pink 1.5s ease-in-out infinite;
}

.biz-urgent-countdown {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  font-family: var(--font-family-mono);
}

.biz-cd-label {
  font-size: 12px;
  color: var(--text-secondary);
  margin-right: 4px;
}

.biz-cd-num {
  display: inline-block;
  min-width: 36px;
  padding: 4px 8px;
  background: var(--gray-800);
  color: white;
  font-size: 18px;
  font-weight: 700;
  border-radius: var(--radius-xs);
  text-align: center;
}

.biz-cd-sep {
  color: var(--gray-800);
  font-weight: 700;
  font-size: 18px;
}

.biz-urgent-body {
  padding: 24px;
  position: relative;
  z-index: 1;
}

.biz-urgent-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.biz-urgent-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 20px;
}

.biz-urgent-money {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.biz-money-label {
  font-size: 13px;
  color: var(--text-secondary);
}

.biz-money-num {
  font-size: 32px;
  font-weight: 800;
  background: var(--gradient-warm);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  line-height: 1;
  letter-spacing: -0.02em;
}

.biz-money-extra {
  display: inline-block;
  padding: 2px 8px;
  background: var(--brand-50);
  color: var(--brand-700);
  font-size: 11px;
  font-weight: 600;
  border-radius: var(--radius-xs);
  border: 1px solid var(--brand-200);
}

.biz-urgent-footer {
  padding: 0 24px 24px;
  position: relative;
  z-index: 1;
}

/* 普通任务卡 */
.biz-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.biz-task {
  padding: 20px;
  cursor: pointer;
}

.biz-task:hover {
  transform: translateY(-3px);
  border-color: var(--border-brand);
  box-shadow: var(--shadow-lg);
}

.biz-task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.biz-task-deadline {
  font-size: 12px;
  color: var(--text-secondary);
}

.biz-task-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
  line-height: 1.4;
}

.biz-task-info {
  padding: 12px;
  background: var(--bg-soft);
  border-radius: var(--radius-sm);
  margin-bottom: 16px;
}

.biz-task-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  padding: 2px 0;
}

.biz-task-label {
  color: var(--text-secondary);
}

.biz-task-money {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 16px;
}

.biz-task-money-num {
  font-size: 24px;
  font-weight: 800;
  color: var(--brand-600);
}

.biz-task-money-label {
  font-size: 11px;
  color: var(--text-tertiary);
}

.biz-task-actions {
  display: flex;
  gap: 8px;
}

/* 薪资统计大卡 */
.biz-salary {
  position: relative;
  background: var(--gradient-cool);
  border-radius: var(--radius-xl);
  padding: 36px;
  color: white;
  overflow: hidden;
  box-shadow: var(--shadow-xl);
}

.biz-salary::before {
  content: '';
  position: absolute;
  top: -100px;
  right: -100px;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(249, 115, 22, 0.4) 0%, transparent 70%);
  border-radius: 50%;
}

.biz-salary-title {
  position: relative;
  font-size: 13px;
  font-weight: 500;
  opacity: 0.85;
  letter-spacing: 0.05em;
  margin-bottom: 16px;
}

.biz-salary-main {
  position: relative;
  margin-bottom: 32px;
}

.biz-salary-amount {
  display: flex;
  align-items: baseline;
}

.biz-salary-currency {
  font-size: 24px;
  font-weight: 600;
  opacity: 0.85;
  margin-right: 4px;
}

.biz-salary-num {
  font-size: 56px;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1;
  background: linear-gradient(135deg, #FFF 0%, #FED7AA 100%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

.biz-salary-decimal {
  font-size: 24px;
  font-weight: 600;
  opacity: 0.7;
  margin-left: 2px;
}

.biz-salary-trend {
  font-size: 13px;
  margin-top: 8px;
  opacity: 0.85;
  display: inline-block;
  padding: 4px 10px;
  background: rgba(16, 185, 129, 0.25);
  border-radius: var(--radius-xs);
  border: 1px solid rgba(16, 185, 129, 0.4);
}

.biz-salary-breakdown {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: var(--radius-md);
  padding: 16px 24px;
}

.biz-salary-item {
  flex: 1;
}

.biz-salary-item-label {
  font-size: 11px;
  opacity: 0.75;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
}

.biz-salary-item-value {
  font-size: 18px;
  font-weight: 700;
}

.biz-salary-rate {
  background: var(--gradient-warm);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

.biz-salary-divider {
  width: 1px;
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
  margin: 0 16px;
}

/* ============================================================
 * Token 速查
 * ============================================================ */
.ds-token-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.ds-token-radius,
.ds-token-shadow {
  text-align: center;
  padding: 16px 8px;
}

.ds-token-radius-box {
  width: 60px;
  height: 60px;
  background: var(--gradient-warm);
  margin: 0 auto 12px;
}

.ds-token-shadow-box {
  width: 80px;
  height: 80px;
  background: white;
  border-radius: var(--radius-md);
  margin: 8px auto 16px;
}

.demo-shadow-xs {
  box-shadow: var(--shadow-xs);
}

.demo-shadow-sm {
  box-shadow: var(--shadow-sm);
}

.demo-shadow-md {
  box-shadow: var(--shadow-md);
}

.demo-shadow-lg {
  box-shadow: var(--shadow-lg);
}

.demo-shadow-xl {
  box-shadow: var(--shadow-xl);
}

.demo-shadow-glow {
  box-shadow: var(--shadow-glow);
}

.ds-token-name {
  font-size: 12px;
  font-family: var(--font-family-mono);
  color: var(--text-primary);
  font-weight: 600;
  margin-bottom: 2px;
}

.ds-token-value {
  font-size: 11px;
  color: var(--text-tertiary);
  font-family: var(--font-family-mono);
}

.ds-token-easing {
  background: var(--bg-soft);
  border-radius: var(--radius-md);
  padding: 20px;
  margin-bottom: 16px;
}

.ds-easing-track {
  height: 24px;
  position: relative;
  background: rgba(0, 0, 0, 0.05);
  border-radius: var(--radius-full);
  margin: 8px 0;
}

.ds-easing-ball {
  position: absolute;
  top: 2px;
  left: 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--gradient-warm);
}

.ds-ball-bounce {
  animation: easing-demo-bounce 2s var(--easing-bounce) infinite;
}

.ds-ball-standard {
  animation: easing-demo-standard 2s var(--easing-standard) infinite;
}

@keyframes easing-demo-bounce {

  0%,
  100% {
    left: 0;
  }

  50% {
    left: calc(100% - 20px);
  }
}

@keyframes easing-demo-standard {

  0%,
  100% {
    left: 0;
  }

  50% {
    left: calc(100% - 20px);
  }
}

.ds-token-spacing {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: var(--bg-soft);
  border-radius: var(--radius-md);
  padding: 16px;
}

.ds-spacing-row {
  display: grid;
  grid-template-columns: 100px 1fr 60px;
  align-items: center;
  gap: 16px;
  padding: 4px 0;
}

.ds-spacing-name {
  font-size: 12px;
  font-family: var(--font-family-mono);
  color: var(--text-secondary);
}

.ds-spacing-bar {
  height: 12px;
  background: var(--gradient-warm);
  border-radius: var(--radius-xs);
}

.ds-spacing-value {
  font-size: 11px;
  font-family: var(--font-family-mono);
  color: var(--text-tertiary);
  text-align: right;
}

/* ============================================================
 * Footer
 * ============================================================ */
.ds-footer {
  margin-top: 32px;
  padding: 32px 24px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 12px;
}

.ds-footer-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  max-width: 1280px;
  margin: 0 auto;
}

.ds-footer-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.ds-footer-tag {
  padding: 4px 10px;
  background: var(--brand-50);
  color: var(--brand-700);
  border: 1px solid var(--brand-200);
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 500;
}

.ds-badge-item {
  margin-right: 0;
}

/* ============================================================
 * 响应式
 * ============================================================ */
@media (max-width: 768px) {
  .ds-nav-inner {
    flex-direction: column;
    align-items: stretch;
    padding: 12px 16px;
    gap: 12px;
  }

  .ds-nav-tab-label {
    display: none;
  }

  .ds-nav-tab {
    padding: 8px 10px;
  }

  .ds-main {
    padding: 0 12px 60px;
  }

  .ds-section,
  .ds-hero {
    padding: 24px 20px;
  }

  .ds-hero {
    padding: 48px 20px;
  }

  .ds-hero-title {
    font-size: 32px;
  }

  .ds-hero-stats {
    gap: 24px;
  }

  .ds-hero-stat-num {
    font-size: 24px;
  }

  .ds-section-title {
    font-size: 22px;
  }

  .ds-form-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .ds-progress-grid {
    grid-template-columns: 1fr;
  }

  .ds-progress-circles {
    justify-content: center;
  }

  .ds-type-row {
    grid-template-columns: 1fr;
  }

  .ds-type-meta {
    border-right: none;
    border-bottom: 1px dashed var(--border-default);
    padding-right: 0;
    padding-bottom: 8px;
    margin-bottom: 8px;
  }

  .ds-type-sample {
    padding-left: 0;
  }

  .biz-urgent-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .biz-urgent-meta {
    flex-direction: column;
    gap: 4px;
  }

  .biz-money-num {
    font-size: 24px;
  }

  .biz-salary {
    padding: 24px 20px;
  }

  .biz-salary-num {
    font-size: 40px;
  }

  .biz-salary-breakdown {
    flex-direction: column;
    gap: 12px;
    padding: 16px;
  }

  .biz-salary-divider {
    width: 100%;
    height: 1px;
    margin: 0;
  }
}
</style>
