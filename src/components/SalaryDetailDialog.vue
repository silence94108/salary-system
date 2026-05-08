<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getSalaryDetail, confirmSalary } from '@/api/salary'
import type { SalaryDetail } from '@/types'

interface Props {
  visible: boolean
  userId: string
  date: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:visible': [value: boolean]
  'confirmed': []
}>()

const loading = ref(false)
const detail = ref<SalaryDetail | null>(null)

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const isConfirmed = computed(() => detail.value?.is_confirm === 2)
const isObjected = computed(() => detail.value?.is_confirm === 3)

const confirmPill = computed(() => {
  if (isConfirmed.value) return { cls: 'pill-success', text: '已确认' }
  if (isObjected.value) return { cls: 'pill-warning', text: '有异议' }
  return { cls: 'pill-muted', text: '待确认' }
})

const deductionTotal = computed(() => {
  if (!detail.value) return 0
  return (Number(detail.value.daikou_total) || 0) + (Number(detail.value.tax) || 0)
})

const totalSalaryParts = computed(() => {
  const v = detail.value ? Number(detail.value.total_salary) || 0 : 0
  const fixed = v.toFixed(2)
  const [intPart, decPart] = fixed.split('.')
  return { int: intPart || '0', dec: '.' + (decPart || '00') }
})

async function loadDetail() {
  if (!props.userId || !props.date) return

  loading.value = true
  try {
    detail.value = await getSalaryDetail({
      user_id: props.userId,
      date: props.date
    })
  } catch (error) {
    ElMessage.error('获取工资详情失败')
  } finally {
    loading.value = false
  }
}

function formatMoney(value: string | number | undefined): string {
  if (value === undefined || value === null || value === '') return '0.00'
  const num = typeof value === 'string' ? parseFloat(value) : value
  return isNaN(num) ? '0.00' : num.toFixed(2)
}

async function handleConfirm() {
  if (!detail.value) return

  try {
    await ElMessageBox.confirm(
      '确认当月工资发放无误？逾期未确认则默认认可核算方式。',
      '确认工资',
      {
        confirmButtonText: '确定无误',
        cancelButtonText: '再看看',
        type: 'info'
      }
    )

    await confirmSalary({
      is_confirm: 2,
      salary_structure_id: detail.value.salary_structure
    })

    ElMessage.success('确认成功')
    detail.value.is_confirm = 2
    emit('confirmed')
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error?.msg || '确认失败')
    }
  }
}

async function handleObjection() {
  if (!detail.value) return

  try {
    const result = await ElMessageBox.prompt('请简要说明您的异议内容', '提出异议', {
      confirmButtonText: '提交',
      cancelButtonText: '取消',
      inputType: 'textarea',
      inputPlaceholder: '如：加班费核算有误...',
      inputValue: detail.value.remark || '',
      inputValidator: (value) => {
        if (!value) return '请填写异议内容'
        if (value.length > 200) return '回复字数不能超过200个字'
        return true
      }
    })

    const remarks = typeof result === 'object' && result && 'value' in result
      ? String(result.value)
      : String(result)

    await confirmSalary({
      is_confirm: 3,
      salary_structure_id: detail.value.salary_structure,
      remarks
    })

    ElMessage.success('异议已提交')
    detail.value.is_confirm = 3
    detail.value.remark = remarks
    emit('confirmed')
    dialogVisible.value = false
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error?.msg || '提交异议失败')
    }
  }
}

function handleOpen() {
  loadDetail()
}
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :width="560"
    class="receipt-dialog"
    :show-close="true"
    destroy-on-close
    align-center
    @open="handleOpen"
  >
    <!-- 自定义 header -->
    <template #header>
      <div class="receipt-head">
        <div class="receipt-head-left">
          <div class="receipt-eyebrow">SALARY · 工资单</div>
          <div class="receipt-title">{{ date || '—' }} 月薪资明细</div>
        </div>
        <span class="pill" :class="confirmPill.cls">{{ confirmPill.text }}</span>
      </div>
    </template>

    <div v-loading="loading" class="receipt-body">
      <template v-if="detail">

        <!-- ============ Hero · 实发大数字 ============ -->
        <section class="receipt-hero">
          <div class="hero-label">实发工资</div>
          <div class="hero-amount">
            <span class="hero-cur">¥</span>
            <span class="hero-int num">{{ totalSalaryParts.int }}</span>
            <span class="hero-dec">{{ totalSalaryParts.dec }}</span>
          </div>
          <div class="hero-meta">
            应发
            <b class="num">¥{{ formatMoney(detail.shuiqian_salary) }}</b>
            <span class="dot-sep">·</span>
            扣除
            <b class="num">¥{{ formatMoney(deductionTotal) }}</b>
          </div>
        </section>

        <!-- ============ 收入项 ============ -->
        <section class="rcp-section">
          <div class="rcp-section-head">
            <div class="rcp-section-title">收入项</div>
            <div class="rcp-section-meta">{{ detail.type_archives?.length || 0 }} 项</div>
          </div>
          <div class="rcp-lines">
            <template v-for="(item, index) in detail.type_archives" :key="index">
              <div class="rcp-line">
                <span class="rcp-label">{{ item.fname }}</span>
                <span class="rcp-value positive num">+ ¥{{ formatMoney(item.sum) }}</span>
              </div>
              <div v-if="item.zd && item.zd.length" class="rcp-sub">
                <div v-for="(z, zi) in item.zd" :key="zi" class="rcp-sub-line">
                  <span class="rcp-sub-label">└ {{ z.title }}</span>
                  <span class="rcp-sub-value num">¥{{ formatMoney(z.data) }}</span>
                </div>
              </div>
            </template>
          </div>
          <div class="rcp-line rcp-line-subtotal">
            <span class="rcp-label">收入小计</span>
            <span class="rcp-value num">¥{{ formatMoney(detail.shuiqian_salary) }}</span>
          </div>
        </section>

        <!-- ============ 扣除项 ============ -->
        <section
          v-if="Number(detail.daikou_total) > 0 || Number(detail.tax) > 0"
          class="rcp-section"
        >
          <div class="rcp-section-head">
            <div class="rcp-section-title">扣除项</div>
            <div class="rcp-section-meta">合计 ¥{{ formatMoney(deductionTotal) }}</div>
          </div>
          <div class="rcp-lines">
            <template v-if="Number(detail.daikou_total) > 0">
              <div class="rcp-line">
                <span class="rcp-label">代扣代缴（社保公积金）</span>
                <span class="rcp-value negative num">− ¥{{ formatMoney(detail.daikou_total) }}</span>
              </div>
              <div v-if="detail.daikou" class="rcp-sub">
                <div v-for="(value, key) in detail.daikou" :key="key" class="rcp-sub-line">
                  <span class="rcp-sub-label">└ {{ key }}</span>
                  <span class="rcp-sub-value num">¥{{ formatMoney(value) }}</span>
                </div>
              </div>
            </template>
            <div v-if="Number(detail.tax) > 0" class="rcp-line">
              <span class="rcp-label">个人所得税</span>
              <span class="rcp-value negative num">− ¥{{ formatMoney(detail.tax) }}</span>
            </div>
          </div>
        </section>

        <!-- ============ 免税额（专项附加） ============ -->
        <section v-if="Number(detail.special?.sum) > 0" class="rcp-section rcp-section-info">
          <div class="rcp-section-head">
            <div class="rcp-section-title">
              专项附加扣除
              <span class="rcp-tip">已节省个税</span>
            </div>
            <div class="rcp-section-meta accent">
              抵扣 ¥{{ formatMoney(detail.special.sum) }}
            </div>
          </div>
          <div v-if="detail.special.zd && detail.special.zd.length" class="rcp-lines">
            <div v-for="(z, zi) in detail.special.zd" :key="zi" class="rcp-line subtle">
              <span class="rcp-label">{{ z.title }}</span>
              <span class="rcp-value info num">¥{{ formatMoney(z.data) }}</span>
            </div>
          </div>
        </section>

        <!-- ============ 实发结果 ============ -->
        <section class="rcp-final">
          <div class="rcp-final-divider"></div>
          <div class="rcp-final-row">
            <span class="rcp-final-label">实发合计</span>
            <span class="rcp-final-value">
              <span class="cur">¥</span>
              <span class="num">{{ formatMoney(detail.total_salary) }}</span>
            </span>
          </div>
        </section>

        <!-- ============ 异议备注 ============ -->
        <section v-if="detail.remark" class="rcp-objection">
          <div class="obj-icon">!</div>
          <div class="obj-content">
            <div class="obj-title">异议回复</div>
            <div class="obj-text">{{ detail.remark }}</div>
          </div>
        </section>

      </template>

      <el-empty v-else description="未查询到薪资数据" :image-size="80" />
    </div>

    <template #footer>
      <div class="rcp-footer">
        <template v-if="detail && !isConfirmed">
          <button class="btn" @click="handleObjection">提出异议</button>
          <button class="btn btn-primary" @click="handleConfirm">确认无误</button>
        </template>
        <template v-else-if="detail && isConfirmed">
          <button class="btn" disabled>已确认无误</button>
        </template>
        <button v-else class="btn" @click="dialogVisible = false">关闭</button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
/* ============ Dialog 容器深度样式 ============ */
:deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(15, 23, 42, .24);
  border: 1px solid var(--border-soft);
}

:deep(.el-dialog__header) {
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--border-soft);
  background: var(--bg);
  margin: 0;
}

:deep(.el-dialog__body) {
  padding: 0;
  background: var(--bg);
}

:deep(.el-dialog__footer) {
  padding: 16px 24px;
  border-top: 1px solid var(--border-soft);
  background: var(--bg-soft);
}

:deep(.el-dialog__close) {
  font-size: 18px;
  color: var(--fg-4);
}
:deep(.el-dialog__close:hover) {
  color: var(--fg);
}

:deep(.el-dialog__headerbtn) {
  top: 18px;
  right: 20px;
}

/* ============ Header ============ */
.receipt-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}
.receipt-eyebrow {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: .12em;
  color: var(--fg-4);
  margin-bottom: 4px;
}
.receipt-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--fg);
  letter-spacing: -.015em;
  line-height: 1.2;
}

/* ============ Body ============ */
.receipt-body {
  padding: 24px;
  max-height: 70vh;
  overflow-y: auto;
}

/* ============ Hero · 实发大数字 ============ */
.receipt-hero {
  position: relative;
  padding: 24px 24px 22px;
  margin-bottom: 22px;
  border-radius: 12px;
  background:
    radial-gradient(at 100% 0%, var(--accent-bg-2) 0%, transparent 60%),
    linear-gradient(135deg, var(--accent-bg) 0%, var(--bg-soft) 100%);
  border: 1px solid var(--border-soft);
  overflow: hidden;
}
.receipt-hero::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--accent) 0%, #EC4899 100%);
}

.hero-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--fg-3);
  letter-spacing: .04em;
  margin-bottom: 6px;
}
.hero-amount {
  display: flex;
  align-items: baseline;
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum';
  color: var(--fg);
}
.hero-cur {
  font-size: 18px;
  font-weight: 500;
  color: var(--fg-3);
  margin-right: 3px;
}
.hero-int {
  font-size: 36px;
  font-weight: 700;
  letter-spacing: -.025em;
  line-height: 1;
}
.hero-dec {
  font-size: 18px;
  font-weight: 500;
  color: var(--fg-4);
  margin-left: 1px;
}

.hero-meta {
  margin-top: 10px;
  font-size: 12.5px;
  color: var(--fg-3);
}
.hero-meta b {
  color: var(--fg);
  font-weight: 600;
}
.dot-sep {
  margin: 0 8px;
  color: var(--fg-4);
}

/* ============ Section ============ */
.rcp-section {
  margin-bottom: 18px;
}
.rcp-section:last-child { margin-bottom: 0; }

.rcp-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0 8px;
  border-bottom: 1px dashed var(--border-soft);
  margin-bottom: 4px;
}
.rcp-section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--fg);
  letter-spacing: -.005em;
  display: flex;
  align-items: center;
  gap: 8px;
}
.rcp-tip {
  font-size: 10.5px;
  font-weight: 500;
  padding: 1px 6px;
  border-radius: 4px;
  background: var(--accent-bg);
  color: var(--accent-fg);
  letter-spacing: .04em;
}
.rcp-section-meta {
  font-size: 12px;
  color: var(--fg-4);
  font-variant-numeric: tabular-nums;
}
.rcp-section-meta.accent {
  color: var(--accent-fg);
  font-weight: 600;
}

/* ============ Lines ============ */
.rcp-lines {
  display: flex;
  flex-direction: column;
}

.rcp-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 0;
  border-bottom: 1px dashed var(--border-soft);
  font-size: 13.5px;
}
.rcp-line:last-child { border-bottom: none; }
.rcp-line.subtle .rcp-label,
.rcp-line.subtle .rcp-value { color: var(--fg-3); }

.rcp-label {
  color: var(--fg-2);
  font-weight: 500;
}
.rcp-value {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  color: var(--fg);
}
.rcp-value.positive { color: var(--success-fg); }
.rcp-value.negative { color: var(--danger-fg); }
.rcp-value.info     { color: var(--accent-fg); }

/* 子明细 */
.rcp-sub {
  display: flex;
  flex-direction: column;
  padding: 4px 0 8px 16px;
  background: var(--bg-soft);
  margin: -1px -8px 4px;
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px dashed var(--border-soft);
}
.rcp-sub-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 12.5px;
}
.rcp-sub-label {
  color: var(--fg-3);
  font-family: 'Inter', monospace;
}
.rcp-sub-value {
  color: var(--fg-3);
  font-variant-numeric: tabular-nums;
}

/* 小计行 */
.rcp-line-subtotal {
  margin-top: 4px;
  padding: 12px 0 4px;
  border-top: 1px solid var(--border-soft);
  border-bottom: none;
  font-size: 13.5px;
}
.rcp-line-subtotal .rcp-label {
  font-weight: 600;
  color: var(--fg);
}

/* 信息块（专项附加） */
.rcp-section-info {
  background: var(--accent-bg);
  border: 1px solid var(--accent-bg-2);
  border-radius: 10px;
  padding: 4px 16px 12px;
}
.rcp-section-info .rcp-section-head {
  border-bottom-color: var(--accent-bg-2);
}
.rcp-section-info .rcp-line {
  border-bottom-color: var(--accent-bg-2);
}

/* ============ Final · 实发合计 ============ */
.rcp-final {
  margin-top: 24px;
  margin-bottom: 8px;
}
.rcp-final-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, var(--border-strong) 50%, transparent 100%);
  margin-bottom: 16px;
}
.rcp-final-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 8px 0;
}
.rcp-final-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--fg);
  letter-spacing: -.005em;
}
.rcp-final-value {
  display: inline-flex;
  align-items: baseline;
  gap: 2px;
  color: var(--accent-fg);
  font-variant-numeric: tabular-nums;
  font-weight: 700;
}
.rcp-final-value .cur { font-size: 15px; opacity: 0.85; }
.rcp-final-value .num {
  font-size: 28px;
  letter-spacing: -.022em;
  line-height: 1;
}

/* ============ 异议备注 ============ */
.rcp-objection {
  margin-top: 18px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  background: var(--color-warning-bg);
  border: 1px solid var(--color-warning-border);
  border-radius: 10px;
}
.obj-icon {
  flex-shrink: 0;
  width: 22px; height: 22px;
  border-radius: 50%;
  background: var(--color-warning);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700;
  font-size: 13px;
}
.obj-title {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--warning-fg);
  margin-bottom: 4px;
}
.obj-text {
  font-size: 13px;
  color: var(--fg-2);
  line-height: 1.5;
}

/* ============ Footer ============ */
.rcp-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.rcp-footer .btn {
  height: 34px;
  padding: 0 16px;
  font-size: 13px;
  font-weight: 500;
  color: var(--fg-2);
  background: var(--bg);
  border: 1px solid var(--border-soft);
  border-radius: var(--r-md);
  cursor: pointer;
  transition: all .12s;
  font-family: inherit;
}
.rcp-footer .btn:hover:not(:disabled) {
  border-color: var(--border-strong);
  color: var(--fg);
}
.rcp-footer .btn:disabled {
  cursor: default;
  color: var(--fg-4);
  background: var(--bg-soft);
}
.rcp-footer .btn-primary {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(99, 91, 255, .25);
}
.rcp-footer .btn-primary:hover:not(:disabled) {
  background: var(--accent-hover);
  border-color: var(--accent-hover);
  color: #fff;
  box-shadow: 0 4px 10px rgba(99, 91, 255, .35);
}

/* ============ 响应式 ============ */
@media (max-width: 600px) {
  :deep(.el-dialog) {
    width: 92vw !important;
    margin: 5vh auto !important;
  }
  .receipt-body { padding: 16px; max-height: 75vh; }
  .receipt-hero { padding: 18px 18px 16px; }
  .hero-int { font-size: 30px; }
  .rcp-final-value .num { font-size: 24px; }
  :deep(.el-dialog__header) { padding: 16px 20px 12px; }
  :deep(.el-dialog__footer) { padding: 12px 20px; }
}
</style>
