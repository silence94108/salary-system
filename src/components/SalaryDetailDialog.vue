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
    :width="760"
    class="salary-timeline-dialog"
    :z-index="3000"
    :show-close="true"
    append-to-body
    destroy-on-close
    align-center
    @open="handleOpen"
  >
    <template #header>
      <div class="timeline-header">
        <div>
          <div class="timeline-title">工资核算时间线</div>
          <div class="timeline-meta">{{ date || '—' }} · 工资详情</div>
        </div>
        <span class="status-pill" :class="confirmPill.cls">{{ confirmPill.text }}</span>
      </div>
    </template>

    <div v-loading="loading" class="timeline-body">
      <template v-if="detail">
        <div class="timeline-summary">
          <div>
            <div class="summary-label">实发工资</div>
            <div class="summary-value">¥{{ formatMoney(detail.total_salary) }}</div>
          </div>
          <div class="summary-grid">
            <div class="summary-item">
              <span>应发工资</span>
              <strong>¥{{ formatMoney(detail.shuiqian_salary) }}</strong>
            </div>
            <div class="summary-item">
              <span>扣款合计</span>
              <strong class="negative">-¥{{ formatMoney(deductionTotal) }}</strong>
            </div>
            <div class="summary-item">
              <span>专项附加扣除</span>
              <strong class="accent">¥{{ formatMoney(detail.special?.sum) }}</strong>
            </div>
          </div>
        </div>

        <div class="salary-timeline">
          <section class="timeline-step">
            <div class="step-content">
              <div class="step-main">
                <div class="step-title">收入汇总</div>
                <div class="step-desc">基本工资、绩效佣金、补贴津贴等项目计入应发工资。</div>
              </div>
              <div class="step-amount positive">¥{{ formatMoney(detail.shuiqian_salary) }}</div>
            </div>

            <div class="step-detail">
              <template v-for="(item, index) in detail.type_archives" :key="index">
                <div class="detail-row">
                  <span class="detail-name">{{ item.fname }}</span>
                  <span class="detail-value">¥{{ formatMoney(item.sum) }}</span>
                </div>
                <div v-if="item.zd && item.zd.length" class="detail-sub">
                  <div v-for="(z, zi) in item.zd" :key="zi" class="detail-row">
                    <span class="detail-name">{{ z.title }}</span>
                    <span class="detail-value">¥{{ formatMoney(z.data) }}</span>
                  </div>
                </div>
              </template>
            </div>
          </section>

          <section class="timeline-step">
            <div class="step-content">
              <div class="step-main">
                <div class="step-title">社保公积金代扣</div>
                <div class="step-desc">养老、医疗、失业与住房公积金等代扣项合并展示。</div>
              </div>
              <div class="step-amount negative">-¥{{ formatMoney(detail.daikou_total) }}</div>
            </div>

            <div v-if="Number(detail.daikou_total) > 0 && detail.daikou" class="step-detail">
              <div v-for="(value, key) in detail.daikou" :key="key" class="detail-row">
                <span class="detail-name">{{ key }}</span>
                <span class="detail-value">¥{{ formatMoney(value) }}</span>
              </div>
            </div>
            <div v-else class="step-empty">本月暂无社保公积金代扣项</div>
          </section>

          <section class="timeline-step">
            <div class="step-content">
              <div class="step-main">
                <div class="step-title">个人所得税</div>
                <div class="step-desc">结合应发工资、代扣项与专项附加扣除后核算。</div>
              </div>
              <div class="step-amount negative">-¥{{ formatMoney(detail.tax) }}</div>
            </div>
          </section>

          <section class="timeline-step">
            <div class="step-content">
              <div class="step-main">
                <div class="step-title">专项附加扣除</div>
                <div class="step-desc">用于个税核算的专项扣除信息，帮助降低应纳税额。</div>
              </div>
              <div class="step-amount accent">¥{{ formatMoney(detail.special?.sum) }}</div>
            </div>

            <div v-if="Number(detail.special?.sum) > 0 && detail.special?.zd?.length" class="step-detail">
              <div v-for="(z, zi) in detail.special.zd" :key="zi" class="detail-row">
                <span class="detail-name">{{ z.title }}</span>
                <span class="detail-value">¥{{ formatMoney(z.data) }}</span>
              </div>
            </div>
            <div v-else class="step-empty">本月暂无专项附加扣除明细</div>
          </section>

          <section class="timeline-step timeline-result">
            <div class="step-content">
              <div class="step-main">
                <div class="step-title">实发工资</div>
                <div class="step-desc">确认无误后，本月工资结构状态会同步更新。</div>
              </div>
              <div class="step-amount result">¥{{ formatMoney(detail.total_salary) }}</div>
            </div>
          </section>
        </div>

        <div v-if="detail.remark" class="timeline-remark">
          <div class="remark-title">异议回复</div>
          <div class="remark-text">{{ detail.remark }}</div>
        </div>
      </template>

      <el-empty v-else-if="!loading" description="未查询到薪资数据" :image-size="80" />
    </div>

    <template #footer>
      <div class="timeline-footer">
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
.salary-timeline-dialog.el-dialog {
  border: 1px solid var(--border-soft);
  border-radius: var(--r-xl);
  overflow: hidden;
  box-shadow: 0 28px 70px rgba(15, 23, 42, .18);
}

.salary-timeline-dialog .el-dialog__header {
  padding: 0;
  margin: 0;
  border-bottom: 1px solid var(--border-soft);
  background: var(--bg);
}

.salary-timeline-dialog .el-dialog__body {
  padding: 0;
  background: var(--bg);
}

.salary-timeline-dialog .el-dialog__footer {
  padding: 14px 22px;
  border-top: 1px solid var(--border-soft);
  background: var(--bg-side);
}

.salary-timeline-dialog .el-dialog__headerbtn {
  top: 15px;
  right: 16px;
  width: 30px;
  height: 30px;
  z-index: 1;
}

.salary-timeline-dialog .el-dialog__close {
  color: var(--fg-4);
}

.salary-timeline-dialog .el-dialog__close:hover {
  color: var(--fg);
}

@media (max-width: 760px) {
  .salary-timeline-dialog.el-dialog {
    width: 92vw !important;
    margin: 5vh auto !important;
  }
}
</style>

<style scoped>
.timeline-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 58px 18px 22px;
}

.timeline-title {
  color: var(--fg);
  font-size: 16px;
  font-weight: 700;
  line-height: 1.35;
}

.timeline-meta {
  margin-top: 3px;
  color: var(--fg-4);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  height: 26px;
  padding: 0 10px;
  border-radius: var(--r-md);
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.pill-success {
  color: var(--success-fg);
  background: var(--color-success-bg);
  border: 1px solid var(--color-success-border);
}

.pill-warning {
  color: var(--warning-fg);
  background: var(--color-warning-bg);
  border: 1px solid var(--color-warning-border);
}

.pill-muted {
  color: var(--accent-fg);
  background: var(--accent-bg);
  border: 1px solid var(--border-soft);
}

.timeline-body {
  max-height: 70vh;
  padding: 22px;
  overflow-y: auto;
}

.timeline-summary {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 16px;
  align-items: center;
  padding: 18px;
  margin-bottom: 18px;
  background: var(--accent-bg);
  border: 1px solid var(--border-soft);
  border-radius: var(--r-xl);
}

.summary-label {
  color: var(--fg-4);
  font-size: 12px;
  font-weight: 700;
}

.summary-value {
  margin-top: 6px;
  color: var(--accent);
  font-size: 34px;
  font-weight: 700;
  line-height: 1.15;
  font-variant-numeric: tabular-nums;
}

.summary-grid {
  display: grid;
  gap: 8px;
}

.summary-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 32px;
  padding: 0 10px;
  background: var(--bg);
  border: 1px solid var(--border-soft);
  border-radius: var(--r-md);
  font-size: 12px;
}

.summary-item span {
  color: var(--fg-3);
  font-weight: 600;
}

.summary-item strong {
  color: var(--fg);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.salary-timeline {
  position: relative;
  display: grid;
  gap: 12px;
  padding-left: 22px;
}

.salary-timeline::before {
  content: '';
  position: absolute;
  top: 18px;
  bottom: 18px;
  left: 7px;
  width: 2px;
  background: var(--border-soft);
}

.timeline-step {
  position: relative;
  padding: 14px;
  background: var(--bg-side);
  border: 1px solid var(--border-soft);
  border-radius: var(--r-xl);
}

.timeline-step::before {
  content: '';
  position: absolute;
  top: 18px;
  left: -21px;
  width: 12px;
  height: 12px;
  background: var(--accent);
  border: 3px solid var(--bg);
  border-radius: 50%;
  box-shadow: 0 0 0 1px var(--accent-bg-2);
}

.timeline-result {
  background: var(--accent-bg);
  border-color: var(--border-soft);
}

.step-content {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16px;
  align-items: start;
}

.step-title {
  color: var(--fg);
  font-size: 14px;
  font-weight: 700;
}

.step-desc {
  margin-top: 3px;
  color: var(--fg-3);
  font-size: 12px;
  line-height: 1.5;
}

.step-amount {
  color: var(--fg);
  font-size: 15px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.step-amount.result {
  color: var(--accent);
  font-size: 19px;
}

.positive {
  color: var(--success-fg) !important;
}

.negative {
  color: var(--danger-fg) !important;
}

.accent {
  color: var(--accent-fg) !important;
}

.step-detail {
  margin-top: 12px;
  padding: 4px 12px;
  background: var(--bg);
  border: 1px solid var(--border-soft);
  border-radius: var(--r-lg);
}

.detail-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 14px;
  min-height: 34px;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-soft);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-name {
  color: var(--fg-2);
  font-size: 13px;
  font-weight: 600;
}

.detail-value {
  min-width: 96px;
  color: var(--fg);
  font-size: 13px;
  font-weight: 700;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.detail-sub {
  padding-left: 14px;
  border-left: 2px solid var(--border-soft);
}

.detail-sub .detail-row {
  min-height: 28px;
  padding: 5px 0;
}

.detail-sub .detail-name,
.detail-sub .detail-value {
  color: var(--fg-3);
  font-weight: 500;
}

.step-empty {
  margin-top: 12px;
  padding: 10px 12px;
  color: var(--fg-4);
  background: var(--bg);
  border: 1px dashed var(--border-soft);
  border-radius: var(--r-lg);
  font-size: 13px;
}

.timeline-remark {
  margin-top: 16px;
  padding: 12px 14px;
  color: var(--fg-2);
  background: var(--color-warning-bg);
  border: 1px solid var(--color-warning-border);
  border-radius: var(--r-lg);
}

.remark-title {
  margin-bottom: 4px;
  color: var(--warning-fg);
  font-size: 12px;
  font-weight: 700;
}

.remark-text {
  font-size: 13px;
  line-height: 1.5;
}

.timeline-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.timeline-footer .btn {
  height: 34px;
  padding: 0 16px;
  color: var(--fg-2);
  background: var(--bg);
  border: 1px solid var(--border-soft);
  border-radius: var(--r-md);
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  transition: all .12s;
}

.timeline-footer .btn:hover:not(:disabled) {
  color: var(--fg);
  border-color: var(--border-strong);
}

.timeline-footer .btn:disabled {
  color: var(--fg-4);
  background: var(--bg-hover, #F2F2F7);
  cursor: default;
}

.timeline-footer .btn-primary {
  color: #fff;
  background: var(--accent);
  border-color: var(--accent);
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(99, 91, 255, .25);
}

.timeline-footer .btn-primary:hover:not(:disabled) {
  color: #fff;
  background: var(--accent-hover);
  border-color: var(--accent-hover);
  box-shadow: 0 4px 10px rgba(99, 91, 255, .35);
}

@media (max-width: 760px) {
  .timeline-header {
    align-items: flex-start;
    flex-direction: column;
    padding: 16px 48px 14px 16px;
  }

  .timeline-body {
    padding: 16px;
  }

  .timeline-summary {
    grid-template-columns: 1fr;
    padding: 16px;
  }

  .summary-value {
    font-size: 28px;
  }

  .salary-timeline {
    padding-left: 18px;
  }

  .salary-timeline::before {
    left: 6px;
  }

  .timeline-step::before {
    left: -18px;
  }

  .step-content {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .step-amount {
    font-size: 16px;
  }

  .timeline-footer {
    flex-wrap: wrap;
  }

  .timeline-footer .btn {
    flex: 1 1 120px;
  }
}
</style>
