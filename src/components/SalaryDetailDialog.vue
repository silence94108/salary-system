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
const expandedItems = ref<Set<number>>(new Set())

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const isConfirmed = computed(() => detail.value?.is_confirm === 2)

async function loadDetail() {
  if (!props.userId || !props.date) return

  console.log('请求工资详情参数:', {
    user_id: props.userId,
    date: props.date
  })

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
      '如对当月工资、加班补助等有异议，需在发放工资后一个月内书面向公司提出异议。逾期则表明确认当月工资发放无误及认可公司工资等待遇的核算方式，以后再也不会有相关补偿或赔偿诉求。',
      '温馨提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
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
      console.error('确认失败:', error)
      ElMessage.error(error?.msg || '确认失败')
    }
  }
}

async function handleObjection() {
  if (!detail.value) return

  try {
    const result = await ElMessageBox.prompt('请填写异议内容', '我的异议', {
      confirmButtonText: '提交',
      cancelButtonText: '取消',
      inputType: 'textarea',
      inputPlaceholder: '请填写异议内容',
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

    ElMessage.success('提交成功')
    detail.value.is_confirm = 3
    detail.value.remark = remarks
    emit('confirmed')
    dialogVisible.value = false
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('提交异议失败:', error)
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
    :title="`${date}月工资详情`"
    width="90%"
    :close-on-click-modal="false"
    @open="handleOpen"
    class="salary-detail-dialog"
  >
    <div v-loading="loading" class="detail-content">
      <div v-if="detail" class="salary-list">
        <!-- 工资类型分组 -->
        <div
          v-for="(item, index) in detail.type_archives"
          :key="index"
          class="salary-item"
          @click="toggleExpand(index)"
        >
          <div class="item-header">
            <div class="item-left">
              <span class="item-icon">💰</span>
              <span class="item-name">{{ item.fname }}</span>
              <span
                v-if="item.zd && item.zd.length > 0"
                class="arrow-icon"
                :class="{ expanded: expandedItems.has(index) }"
              >▼</span>
            </div>
            <span class="item-value">{{ formatMoney(item.sum) }}</span>
          </div>
          <div v-if="item.zd && item.zd.length > 0 && expandedItems.has(index)" class="item-details">
            <div v-for="(field, fIndex) in item.zd" :key="fIndex" class="detail-row">
              <span class="detail-label">{{ field.title }}</span>
              <span class="detail-value">{{ formatMoney(field.data) }}</span>
            </div>
          </div>
        </div>

        <!-- 应付工资 -->
        <div class="salary-item">
          <div class="item-header">
            <div class="item-left">
              <span class="item-icon">📊</span>
              <span class="item-name">应付工资金额</span>
            </div>
            <span class="item-value">{{ formatMoney(detail.shuiqian_salary) }}</span>
          </div>
        </div>

        <!-- 代扣代缴 -->
        <div class="salary-item" @click="toggleExpand(-1)">
          <div class="item-header">
            <div class="item-left">
              <span class="item-icon">🏦</span>
              <span class="item-name">代扣代缴</span>
              <span
                v-if="detail.daikou && Object.keys(detail.daikou).length > 0"
                class="arrow-icon"
                :class="{ expanded: expandedItems.has(-1) }"
              >▼</span>
            </div>
            <span class="item-value">{{ formatMoney(detail.daikou_total) }}</span>
          </div>
          <div v-if="detail.daikou && expandedItems.has(-1)" class="item-details">
            <div v-for="(value, key) in detail.daikou" :key="key" class="detail-row">
              <span class="detail-label">{{ key }}</span>
              <span class="detail-value">{{ formatMoney(value) }}</span>
            </div>
          </div>
        </div>

        <!-- 专项扣除 -->
        <div class="salary-item" @click="toggleExpand(-2)">
          <div class="item-header">
            <div class="item-left">
              <span class="item-icon">📋</span>
              <span class="item-name">专项扣除</span>
              <span
                v-if="detail.special.zd && detail.special.zd.length > 0"
                class="arrow-icon"
                :class="{ expanded: expandedItems.has(-2) }"
              >▼</span>
            </div>
            <span class="item-value">{{ formatMoney(detail.special.sum) }}</span>
          </div>
          <div v-if="detail.special.zd && expandedItems.has(-2)" class="item-details">
            <div v-for="(field, fIndex) in detail.special.zd" :key="fIndex" class="detail-row">
              <span class="detail-label">{{ field.title }}</span>
              <span class="detail-value">{{ formatMoney(field.data) }}</span>
            </div>
          </div>
        </div>

        <!-- 个人所得税 -->
        <div class="salary-item">
          <div class="item-header">
            <div class="item-left">
              <span class="item-icon">🧾</span>
              <span class="item-name">个人所得税</span>
            </div>
            <span class="item-value">{{ formatMoney(detail.tax) }}</span>
          </div>
        </div>

        <!-- 实付工资 -->
        <div class="salary-item highlight">
          <div class="item-header">
            <div class="item-left">
              <span class="item-icon">💵</span>
              <span class="item-name">实付工资金额</span>
            </div>
            <span class="item-value">{{ formatMoney(detail.total_salary) }}</span>
          </div>
        </div>
      </div>

      <el-empty v-else description="暂无数据" />
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button
          v-if="detail && !isConfirmed"
          type="danger"
          @click="handleConfirm"
        >
          已查看
        </el-button>
        <el-button
          v-if="detail && !isConfirmed"
          @click="handleObjection"
        >
          提出异议
        </el-button>
        <el-button
          v-if="detail && isConfirmed"
          disabled
        >
          已查看
        </el-button>
        <el-button
          v-if="detail && isConfirmed"
          disabled
        >
          提出异议
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.salary-detail-dialog :deep(.el-dialog__body) {
  padding: 10px 20px;
  max-height: 70vh;
  overflow-y: auto;
}

.detail-content {
  min-height: 200px;
}

.salary-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.salary-item {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.salary-item:hover {
  border-color: #409EFF;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.salary-item.highlight {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.item-icon {
  font-size: 18px;
  line-height: 1;
}

.item-name {
  font-size: 15px;
  font-weight: 500;
}

.arrow-icon {
  font-size: 10px;
  transition: transform 0.3s;
  display: inline-block;
}

.arrow-icon.expanded {
  transform: rotate(180deg);
}

.item-value {
  font-size: 16px;
  font-weight: 600;
  color: #409EFF;
}

.salary-item.highlight .item-value {
  color: white;
}

.item-details {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  padding: 4px 0;
}

.detail-label {
  color: #666;
}

.detail-value {
  color: #333;
  font-weight: 500;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 16px;
}

@media screen and (max-width: 768px) {
  .salary-detail-dialog {
    width: 95% !important;
  }

  .salary-detail-dialog :deep(.el-dialog__body) {
    padding: 8px 12px;
    max-height: 60vh;
  }

  .salary-item {
    padding: 10px 12px;
  }

  .item-name {
    font-size: 14px;
  }

  .item-value {
    font-size: 15px;
  }

  .detail-row {
    font-size: 13px;
  }
}
</style>
