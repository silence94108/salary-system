<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getSalaryDetail, confirmSalary } from '@/api/salary'
import type { SalaryDetail } from '@/types'
import {
  Money,
  TrendCharts,
  CreditCard,
  Wallet,
  Ticket,
  List,
  ArrowDown,
  InfoFilled
} from '@element-plus/icons-vue'

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
const expandedItems = ref<Set<number>>(new Set())
const uiStyle = ref('card') // card, list, flow

const isMobile = computed(() => window.innerWidth <= 768)

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const isConfirmed = computed(() => detail.value?.is_confirm === 2)

async function loadDetail() {
  if (!props.userId || !props.date) return

  loading.value = true
  try {
    detail.value = await getSalaryDetail({
      user_id: props.userId,
      date: props.date
    })
    expandedItems.value.clear()
  } catch (error) {
    ElMessage.error('获取工资详情失败')
  } finally {
    loading.value = false
  }
}

function toggleExpand(index: number) {
  if (expandedItems.value.has(index)) {
    expandedItems.value.delete(index)
  } else {
    expandedItems.value.add(index)
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
    :title="`${date}月薪资明细`"
    :width="isMobile ? '95%' : '500px'"
    :close-on-click-modal="false"
    @open="handleOpen"
    class="salary-detail-dialog"
    destroy-on-close
  >
    <div class="style-switcher">
      <el-radio-group v-model="uiStyle" size="small">
        <el-radio-button label="card">商务卡片</el-radio-button>
        <el-radio-button label="list">极简列表</el-radio-button>
        <el-radio-button label="flow">薪资流向</el-radio-button>
      </el-radio-group>
    </div>

    <div v-loading="loading" class="detail-content" :class="`style-${uiStyle}`">
      <div v-if="detail" class="salary-container">

        <!-- ==================== 1. 商务卡片 (原方案优化) ==================== -->
        <div v-if="uiStyle === 'card'" class="salary-list-card">
          <!-- 分组：基本与浮动 -->
          <div
            v-for="(item, index) in detail.type_archives"
            :key="index"
            class="salary-item"
            :class="{ 'has-details': item.zd && item.zd.length > 0 }"
            @click="item.zd && item.zd.length > 0 && toggleExpand(index)"
          >
            <div class="item-header">
              <div class="item-left">
                <el-icon class="item-icon"><Money /></el-icon>
                <span class="item-name">{{ item.fname }}</span>
                <el-icon
                  v-if="item.zd && item.zd.length > 0"
                  class="arrow-icon"
                  :class="{ expanded: expandedItems.has(index) }"
                ><ArrowDown /></el-icon>
              </div>
              <div class="item-right">
                <span class="currency">¥</span>
                <span class="item-value">{{ formatMoney(item.sum) }}</span>
              </div>
            </div>
            <el-collapse-transition>
              <div v-if="item.zd && item.zd.length > 0 && expandedItems.has(index)" class="item-details">
                <div v-for="(field, fIndex) in item.zd" :key="fIndex" class="detail-row">
                  <span class="detail-label">{{ field.title }}</span>
                  <span class="detail-value">{{ formatMoney(field.data) }}</span>
                </div>
              </div>
            </el-collapse-transition>
          </div>

          <!-- 应付工资 -->
          <div class="salary-item highlight-soft">
            <div class="item-header">
              <div class="item-left">
                <el-icon class="item-icon"><TrendCharts /></el-icon>
                <span class="item-name">应付工资总额</span>
              </div>
              <div class="item-right">
                <span class="currency">¥</span>
                <span class="item-value">{{ formatMoney(detail.shuiqian_salary) }}</span>
              </div>
            </div>
          </div>

          <!-- 代扣代缴 -->
          <div class="salary-item" @click="toggleExpand(-1)">
            <div class="item-header">
              <div class="item-left">
                <el-icon class="item-icon"><CreditCard /></el-icon>
                <span class="item-name">代扣代缴</span>
                <el-icon
                  v-if="detail.daikou && Object.keys(detail.daikou).length > 0"
                  class="arrow-icon"
                  :class="{ expanded: expandedItems.has(-1) }"
                ><ArrowDown /></el-icon>
              </div>
              <div class="item-right">
                <span class="currency">¥</span>
                <span class="item-value">{{ formatMoney(detail.daikou_total) }}</span>
              </div>
            </div>
            <el-collapse-transition>
              <div v-if="detail.daikou && expandedItems.has(-1)" class="item-details">
                <div v-for="(value, key) in detail.daikou" :key="key" class="detail-row">
                  <span class="detail-label">{{ key }}</span>
                  <span class="detail-value">{{ formatMoney(value) }}</span>
                </div>
              </div>
            </el-collapse-transition>
          </div>

          <!-- 专项扣除 -->
          <div class="salary-item" @click="toggleExpand(-2)">
            <div class="item-header">
              <div class="item-left">
                <el-icon class="item-icon"><Ticket /></el-icon>
                <span class="item-name">专项附加扣除</span>
                <el-icon
                  v-if="detail.special.zd && detail.special.zd.length > 0"
                  class="arrow-icon"
                  :class="{ expanded: expandedItems.has(-2) }"
                ><ArrowDown /></el-icon>
              </div>
              <div class="item-right">
                <span class="currency">¥</span>
                <span class="item-value">{{ formatMoney(detail.special.sum) }}</span>
              </div>
            </div>
            <el-collapse-transition>
              <div v-if="detail.special.zd && expandedItems.has(-2)" class="item-details">
                <div v-for="(field, fIndex) in detail.special.zd" :key="fIndex" class="detail-row">
                  <span class="detail-label">{{ field.title }}</span>
                  <span class="detail-value">{{ formatMoney(field.data) }}</span>
                </div>
              </div>
            </el-collapse-transition>
          </div>

          <!-- 个人所得税 -->
          <div class="salary-item">
            <div class="item-header">
              <div class="item-left">
                <el-icon class="item-icon"><List /></el-icon>
                <span class="item-name">个人所得税</span>
              </div>
              <div class="item-right">
                <span class="currency">¥</span>
                <span class="item-value text-error">{{ formatMoney(detail.tax) }}</span>
              </div>
            </div>
          </div>

          <!-- 实付工资 -->
          <div class="salary-item final-item">
            <div class="item-header">
              <div class="item-left">
                <el-icon class="item-icon"><Wallet /></el-icon>
                <span class="item-name">实付工资金额</span>
              </div>
              <div class="item-right">
                <span class="currency">¥</span>
                <span class="item-value large">{{ formatMoney(detail.total_salary) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ==================== 2. 极简列表 (Flat List) ==================== -->
        <div v-else-if="uiStyle === 'list'" class="salary-list-flat">
          <div class="flat-group">
            <div class="flat-title">收入项</div>
            <div v-for="(item, index) in detail.type_archives" :key="index" class="flat-row">
              <span class="flat-label">{{ item.fname }}</span>
              <span class="flat-value" :class="{ negative: Number(item.sum) < 0 }">
                {{ Number(item.sum) >= 0 ? '+' : '' }}{{ formatMoney(item.sum) }}
              </span>
            </div>
            <div class="flat-row total">
              <span class="flat-label">应发总额</span>
              <span class="flat-value">{{ formatMoney(detail.shuiqian_salary) }}</span>
            </div>
          </div>

          <div class="flat-group">
            <div class="flat-title">扣款项</div>
            <div class="flat-row" v-if="Number(detail.daikou_total) > 0">
              <span class="flat-label">代扣代缴 (社保公积金)</span>
              <span class="flat-value negative">{{ formatMoney(detail.daikou_total) }}</span>
            </div>
            <div class="flat-row" v-if="Number(detail.tax) > 0">
              <span class="flat-label">个人所得税</span>
              <span class="flat-value negative">{{ formatMoney(detail.tax) }}</span>
            </div>
            <div class="flat-row bonus" v-if="Number(detail.special.sum) > 0">
              <span class="flat-label">专项附加扣除 (免税额)</span>
              <span class="flat-value info">({{ formatMoney(detail.special.sum) }})</span>
            </div>
          </div>

          <div class="flat-result">
            <div class="result-label">实发工资</div>
            <div class="result-value">¥ {{ formatMoney(detail.total_salary) }}</div>
          </div>
        </div>

        <!-- ==================== 3. 薪资流向 (Flow) ==================== -->
        <div v-else-if="uiStyle === 'flow'" class="salary-list-flow">
          <!-- 1. 收入流 -->
          <div class="flow-step positive">
            <div class="step-icon"><el-icon><Money /></el-icon></div>
            <div class="step-content">
              <div class="step-title">税前应发明细</div>
              <div class="step-details-inline">
                <div v-for="(item, index) in detail.type_archives" :key="index" class="inline-item">
                  <span class="label">{{ item.fname }}</span>
                  <span class="value">{{ formatMoney(item.sum) }}</span>
                </div>
              </div>
              <div class="step-money-total">应发总额：¥ {{ formatMoney(detail.shuiqian_salary) }}</div>
            </div>
          </div>

          <div class="flow-line"></div>

          <!-- 2. 扣除流 -->
          <div class="flow-step negative" v-if="Number(detail.shuiqian_salary) - Number(detail.total_salary) > 0">
            <div class="step-icon"><el-icon><Ticket /></el-icon></div>
            <div class="step-content">
              <div class="step-title">各项扣款明细</div>
              <div class="step-details-inline">
                <div class="inline-item" v-if="Number(detail.daikou_total) > 0">
                  <span class="label">社保公积金等</span>
                  <span class="value">{{ formatMoney(detail.daikou_total) }}</span>
                </div>
                <div class="inline-item" v-if="Number(detail.tax) > 0">
                  <span class="label">个人所得税</span>
                  <span class="value">{{ formatMoney(detail.tax) }}</span>
                </div>
              </div>
              <div class="step-money-total">扣除总额：- ¥ {{ formatMoney(Number(detail.shuiqian_salary) - Number(detail.total_salary)) }}</div>
              <div class="step-tip" v-if="Number(detail.special.sum) > 0">
                💡 已为您节省个税抵扣额度：¥ {{ formatMoney(detail.special.sum) }}
              </div>
            </div>
          </div>

          <div class="flow-line" v-if="Number(detail.shuiqian_salary) - Number(detail.total_salary) > 0"></div>

          <!-- 3. 到手流 -->
          <div class="flow-step final">
            <div class="step-icon"><el-icon><Wallet /></el-icon></div>
            <div class="step-content">
              <div class="step-title">实际到手薪资</div>
              <div class="step-money">¥ {{ formatMoney(detail.total_salary) }}</div>
              <div class="step-desc">已成功计算并准备发放</div>
            </div>
          </div>
        </div>

        <div v-if="detail.remark" class="objection-remark">
          <el-alert
            :title="`异议回复：${detail.remark}`"
            type="warning"
            :closable="false"
            show-icon
          />
        </div>
      </div>

      <el-empty v-else description="未查询到薪资数据" :image-size="80" />
    </div>

    <template #footer>
      <div class="dialog-footer">
        <template v-if="detail && !isConfirmed">
          <el-button @click="handleObjection">提出异议</el-button>
          <el-button type="primary" @click="handleConfirm">确认无误</el-button>
        </template>
        <template v-else-if="detail && isConfirmed">
          <el-button disabled type="success">已确认无误</el-button>
        </template>
        <el-button v-else @click="dialogVisible = false">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
/* 配色系统 */
:root {
  --salary-primary: #2563eb;
  --salary-bg: #f8fafc;
  --salary-text-main: #1e293b;
  --salary-text-muted: #64748b;
  --salary-border: #e2e8f0;
}

.salary-detail-dialog :deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
}

.salary-detail-dialog :deep(.el-dialog__header) {
  margin-right: 0;
  padding: 20px 24px;
  border-bottom: 1px solid var(--salary-border);
}

.salary-detail-dialog :deep(.el-dialog__title) {
  font-size: 18px;
  font-weight: 600;
  color: var(--salary-text-main);
}

.salary-detail-dialog :deep(.el-dialog__body) {
  padding: 0 24px 20px;
  background-color: var(--salary-bg);
  max-height: 70vh;
  overflow-y: auto;
}

.style-switcher {
  display: flex;
  justify-content: center;
  padding: 12px 0 20px;
  background: white;
  margin: 0 -24px;
  border-bottom: 1px solid var(--salary-border);
  position: sticky;
  top: 0;
  z-index: 10;
}

.detail-content {
  padding-top: 20px;
}

/* ==================== 极简列表样式 (List) ==================== */
.salary-list-flat {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.flat-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.flat-title {
  font-size: 13px;
  color: var(--salary-text-muted);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e2e8f0;
}

.flat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.flat-label {
  font-size: 15px;
  color: var(--salary-text-main);
}

.flat-value {
  font-family: 'Monaco', 'Consolas', monospace;
  font-weight: 600;
  color: #10b981;
}

.flat-value.negative {
  color: #ef4444;
}

.flat-value.info {
  color: #64748b;
  font-style: italic;
  font-weight: 400;
}

.flat-row.bonus {
  opacity: 0.8;
}

.flat-row.total {
  margin-top: 4px;
  padding-top: 12px;
  border-top: 1px dashed #cbd5e1;
}

.flat-row.total .flat-label {
  font-weight: 600;
}

.flat-result {
  margin-top: 12px;
  background: #1e293b;
  padding: 24px;
  border-radius: 16px;
  text-align: center;
  color: white;
}

.result-label {
  font-size: 14px;
  opacity: 0.8;
  margin-bottom: 8px;
}

.result-value {
  font-size: 32px;
  font-weight: 700;
  color: #fbbf24;
}

/* ==================== 薪资流向样式 (Flow) ==================== */
.salary-list-flow {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.flow-step {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  width: 100%;
  padding: 20px;
  border-radius: 16px;
  background: white;
  border: 1px solid #e2e8f0;
}

.step-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.positive .step-icon { background: #eff6ff; color: #2563eb; }
.negative .step-icon { background: #fef2f2; color: #ef4444; }
.final .step-icon { background: #1e293b; color: #fbbf24; }

.step-content {
  flex: 1;
}

.step-title {
  font-size: 14px;
  color: var(--salary-text-muted);
  margin-bottom: 4px;
}

.step-money {
  font-size: 20px;
  font-weight: 700;
  color: var(--salary-text-main);
}

.step-money-total {
  font-size: 15px;
  font-weight: 700;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #e2e8f0;
}

.positive .step-money-total { color: #2563eb; }
.negative .step-money-total { color: #ef4444; }

.step-details-inline {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
}

.inline-item {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.inline-item .label {
  color: var(--salary-text-muted);
}

.inline-item .value {
  font-weight: 600;
}

.step-tip {
  font-size: 11px;
  color: #64748b;
  background: #f1f5f9;
  padding: 4px 8px;
  border-radius: 4px;
  margin-top: 8px;
  display: inline-block;
}

.step-tags {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.step-tags span {
  font-size: 11px;
  padding: 2px 8px;
  background: #f1f5f9;
  color: #64748b;
  border-radius: 4px;
}

.flow-line {
  width: 2px;
  height: 30px;
  background: linear-gradient(to bottom, #e2e8f0, transparent);
  margin: 4px 0;
}

.step-desc {
  font-size: 12px;
  color: #10b981;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.step-desc::before {
  content: '✓';
  font-weight: bold;
}

@media screen and (max-width: 768px) {
  .style-switcher {
    margin: 0 -20px;
  }
}

.salary-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.salary-item {
  background: #ffffff;
  border-radius: 12px;
  padding: 14px 16px;
  border: 1px solid transparent;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.salary-item.has-details {
  cursor: pointer;
}

.salary-item.has-details:hover {
  border-color: var(--salary-primary);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.item-icon {
  font-size: 20px;
  color: var(--salary-primary);
  background: #eff6ff;
  padding: 8px;
  border-radius: 8px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--salary-text-main);
}

.arrow-icon {
  font-size: 14px;
  color: var(--salary-text-muted);
  transition: transform 0.3s;
}

.arrow-icon.expanded {
  transform: rotate(180deg);
}

.item-right {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.currency {
  font-size: 12px;
  font-weight: 600;
  color: var(--salary-text-muted);
}

.item-value {
  font-size: 17px;
  font-weight: 700;
  font-family: 'Monaco', 'Consolas', monospace;
  color: var(--salary-text-main);
}

.text-error {
  color: #ef4444;
}

/* 强调样式 */
.highlight-soft {
  background: #f1f5f9;
}

.final-item {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  color: white;
}

.final-item .item-name,
.final-item .currency,
.final-item .item-value {
  color: white;
}

.final-item .item-icon {
  background: rgba(255, 255, 255, 0.15);
  color: #fbbf24;
  font-size: 22px;
}

.item-value.large {
  font-size: 22px;
  color: #fbbf24;
}

/* 详情展开 */
.item-details {
  margin-top: 14px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.detail-label {
  color: var(--salary-text-muted);
}

.detail-value {
  color: var(--salary-text-main);
  font-weight: 500;
}

.objection-remark {
  margin-top: 8px;
}

.dialog-footer {
  padding: 16px 24px 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.dialog-footer :deep(.el-button) {
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 500;
}

@media screen and (max-width: 768px) {
  .salary-detail-dialog :deep(.el-dialog) {
    width: 92% !important;
    margin: 5vh auto !important;
  }

  .salary-detail-dialog :deep(.el-dialog__header) {
    padding: 16px 20px;
  }

  .salary-detail-dialog :deep(.el-dialog__title) {
    font-size: 16px;
  }

  .salary-detail-dialog :deep(.el-dialog__body) {
    padding: 16px 20px;
    max-height: 60vh;
  }

  .salary-item {
    padding: 12px 14px;
  }

  .item-icon {
    font-size: 18px;
    width: 32px;
    height: 32px;
    padding: 6px;
  }

  .item-name {
    font-size: 14px;
  }

  .item-value {
    font-size: 16px;
  }

  .item-value.large {
    font-size: 20px;
  }

  .currency {
    font-size: 11px;
  }

  .detail-row {
    font-size: 13px;
  }

  .dialog-footer {
    padding: 12px 20px 20px;
  }

  .dialog-footer :deep(.el-button) {
    padding: 8px 16px;
    font-size: 14px;
  }
}
</style>
