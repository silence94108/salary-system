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
      { confirmButtonText: '确定无误', cancelButtonText: '再看看', type: 'info' }
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
      ? String(result.value) : String(result)
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

function handleOpen() { loadDetail() }
</script>
<template>
  <el-dialog
    v-model="dialogVisible"
    :width="520"
    class="receipt-dialog"
    :z-index="3000"
    :show-close="true"
    append-to-body
    destroy-on-close
    align-center
    @open="handleOpen"
  >
    <template #header>
      <div class="slip-header">
        <div class="slip-title">工资条额</div>
        <div class="slip-meta">{{ date || '—' }} | {{ confirmPill.text }}</div>
      </div>
    </template>

    <div v-loading="loading" class="slip-body">
      <template v-if="detail">
        <div class="slip-hero">
          <div class="slip-hero-label">实发工资</div>
          <div class="slip-hero-value">¥{{ formatMoney(detail.total_salary) }}</div>
        </div>

        <template v-for="(item, index) in detail.type_archives" :key="index">
          <div class="slip-line">
            <span class="slip-line-label">{{ item.fname }}</span>
            <span class="slip-line-value">¥{{ formatMoney(item.sum) }}</span>
          </div>
          <div v-if="item.zd && item.zd.length" class="slip-sub">
            <div v-for="(z, zi) in item.zd" :key="zi" class="slip-line">
              <span class="slip-line-label">{{ z.title }}</span>
              <span class="slip-line-value">¥{{ formatMoney(z.data) }}</span>
            </div>
          </div>
        </template>

        <div class="slip-line slip-line-subtotal">
          <span class="slip-line-label">应发小计</span>
          <span class="slip-line-value">¥{{ formatMoney(detail.shuiqian_salary) }}</span>
        </div>

        <div class="slip-divider"></div>
        <template v-if="Number(detail.daikou_total) > 0">
          <div class="slip-line">
            <span class="slip-line-label">代扣代缴（社保公积金）</span>
            <span class="slip-line-value negative">-¥{{ formatMoney(detail.daikou_total) }}</span>
          </div>
          <div v-if="detail.daikou" class="slip-sub">
            <div v-for="(value, key) in detail.daikou" :key="key" class="slip-line">
              <span class="slip-line-label">{{ key }}</span>
              <span class="slip-line-value">¥{{ formatMoney(value) }}</span>
            </div>
          </div>
        </template>

        <div v-if="Number(detail.tax) > 0" class="slip-line">
          <span class="slip-line-label">个人所得税</span>
          <span class="slip-line-value negative">-¥{{ formatMoney(detail.tax) }}</span>
        </div>

        <template v-if="Number(detail.special?.sum) > 0">
          <div class="slip-divider"></div>
          <div class="slip-line">
            <span class="slip-line-label">专项附加扣除（已节省个税）</span>
            <span class="slip-line-value accent">¥{{ formatMoney(detail.special.sum) }}</span>
          </div>
          <div v-if="detail.special.zd && detail.special.zd.length" class="slip-sub">
            <div v-for="(z, zi) in detail.special.zd" :key="zi" class="slip-line">
              <span class="slip-line-label">{{ z.title }}</span>
              <span class="slip-line-value">¥{{ formatMoney(z.data) }}</span>
            </div>
          </div>
        </template>

        <div class="slip-line slip-total">
          <span class="slip-line-label">实发工资</span>
          <span class="slip-line-value">¥{{ formatMoney(detail.total_salary) }}</span>
        </div>

        <div v-if="detail.remark" class="slip-remark">
          <div class="slip-remark-title">异议回复</div>
          <div class="slip-remark-text">{{ detail.remark }}</div>
        </div>
      </template>

      <el-empty v-else-if="!loading" description="未查询到薪资数据" :image-size="80" />
    </div>

    <template #footer>
      <div class="slip-footer">
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
<style>
.receipt-dialog .el-dialog { border-radius: 12px; overflow: hidden; box-shadow: 0 20px 50px rgba(15,23,42,.2); border: 1px solid var(--border-soft); }
.receipt-dialog .el-dialog__header { padding: 0; margin: 0; border-bottom: 1px solid var(--border-soft); }
.receipt-dialog .el-dialog__body { padding: 0; background: var(--bg); }
.receipt-dialog .el-dialog__footer { padding: 16px 24px; border-top: 1px solid var(--border-soft); background: var(--bg); }
.receipt-dialog .el-dialog__headerbtn { top: 10px; right: 12px; width: 28px; height: 28px; font-size: 16px; z-index: 1; }
.receipt-dialog .el-dialog__close { color: var(--fg-4); }
.receipt-dialog .el-dialog__close:hover { color: var(--fg); }
</style>

<style scoped>
:deep(.el-dialog) { border-radius: 12px; overflow: hidden; box-shadow: 0 20px 50px rgba(15,23,42,.2); border: 1px solid var(--border-soft); }
:deep(.el-dialog__header) { padding: 0; margin: 0; border-bottom: 1px solid var(--border-soft); }
:deep(.el-dialog__body) { padding: 0; background: var(--bg); }
:deep(.el-dialog__footer) { padding: 16px 24px; border-top: 1px solid var(--border-soft); background: var(--bg); }
:deep(.el-dialog__headerbtn) { top: 10px; right: 12px; width: 28px; height: 28px; font-size: 16px; z-index: 1; }
:deep(.el-dialog__close) { color: var(--fg-4); }
:deep(.el-dialog__close:hover) { color: var(--fg); }

.slip-header { text-align: center; padding: 14px 48px 10px; }
.slip-title { font-size: 16px; font-weight: 700; color: var(--fg); margin-bottom: 2px; }
.slip-meta { font-size: 12px; color: var(--fg-4); font-variant-numeric: tabular-nums; }
.slip-body { padding: 24px; max-height: 70vh; overflow-y: auto; }

.slip-hero { background: var(--bg-hover, #F2F2F7); border: 1px solid var(--border-soft); border-radius: 8px; padding: 20px; margin-bottom: 20px; text-align: center; }
.slip-hero-label { font-size: 11px; color: var(--fg-4); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; font-weight: 600; }
.slip-hero-value { font-size: 36px; font-weight: 700; color: var(--accent); font-variant-numeric: tabular-nums; letter-spacing: -0.5px; }

.slip-line { display: flex; justify-content: space-between; align-items: baseline; padding: 9px 0; font-size: 14px; border-bottom: 1px solid var(--border-soft); }
.slip-line:last-child { border-bottom: none; }
.slip-line-label { color: var(--fg-2); font-weight: 500; flex: 1; }
.slip-line-value { font-variant-numeric: tabular-nums; font-weight: 600; color: var(--fg); text-align: right; min-width: 100px; }
.slip-line-value.negative { color: var(--danger-fg); }
.slip-line-value.accent { color: var(--accent-fg); }
.slip-line-subtotal { border-bottom: none; padding-top: 12px; margin-top: 4px; border-top: 1px solid var(--border-soft); }
.slip-line-subtotal .slip-line-label { font-weight: 600; color: var(--fg); }

.slip-divider { height: 1px; margin: 16px 0; background: repeating-linear-gradient(to right, var(--border-strong) 0px, var(--border-strong) 4px, transparent 4px, transparent 8px); }

.slip-sub { padding-left: 16px; margin-top: 2px; margin-bottom: 4px; border-left: 2px solid var(--border-soft); }
.slip-sub .slip-line { font-size: 13px; padding: 5px 0; }
.slip-sub .slip-line-label { color: var(--fg-3); }
.slip-sub .slip-line-value { color: var(--fg-3); font-weight: 500; }

.slip-total { margin-top: 16px; padding-top: 16px !important; border-top: 2px solid var(--fg) !important; border-bottom: none !important; }
.slip-total .slip-line-label { font-weight: 700; color: var(--fg); font-size: 15px; }
.slip-total .slip-line-value { font-size: 18px; font-weight: 700; color: var(--accent); }

.slip-remark { margin-top: 20px; padding: 12px 16px; background: var(--color-warning-bg); border: 1px solid var(--color-warning-border); border-radius: 8px; }
.slip-remark-title { font-size: 12px; font-weight: 600; color: var(--warning-fg); margin-bottom: 4px; }
.slip-remark-text { font-size: 13px; color: var(--fg-2); line-height: 1.5; }

.slip-footer { display: flex; justify-content: flex-end; gap: 8px; }
.slip-footer .btn { height: 34px; padding: 0 16px; font-size: 13px; font-weight: 500; color: var(--fg-2); background: var(--bg); border: 1px solid var(--border-soft); border-radius: var(--r-md); cursor: pointer; transition: all .12s; font-family: inherit; }
.slip-footer .btn:hover:not(:disabled) { border-color: var(--border-strong); color: var(--fg); }
.slip-footer .btn:disabled { cursor: default; color: var(--fg-4); background: var(--bg-hover, #F2F2F7); }
.slip-footer .btn-primary { background: var(--accent); border-color: var(--accent); color: #fff; font-weight: 600; box-shadow: 0 2px 6px rgba(99,91,255,.25); }
.slip-footer .btn-primary:hover:not(:disabled) { background: var(--accent-hover); border-color: var(--accent-hover); color: #fff; box-shadow: 0 4px 10px rgba(99,91,255,.35); }

@media (max-width: 600px) {
  :deep(.el-dialog) { width: 92vw !important; margin: 5vh auto !important; }
  .slip-body { padding: 16px; }
  .slip-header { padding: 16px 40px 12px; }
  .slip-hero-value { font-size: 28px; }
  .slip-total .slip-line-value { font-size: 16px; }
}
</style>