<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useProjectStore } from '@/stores/project'
import type { Project, CommissionResult } from '@/types'
import type { SalaryDateItem } from '@/api/salary'
import SalaryDetailDialog from '@/components/SalaryDetailDialog.vue'

type UnknownRecord = Record<string, unknown>

type SalaryRow = SalaryDateItem & {
  _groupTitle?: string
}

function isRecord(value: unknown): value is UnknownRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function asSalaryDateItem(value: unknown): SalaryDateItem {
  return isRecord(value) ? (value as SalaryDateItem) : {}
}

const projectStore = useProjectStore()

const calcMonth = ref('')
const detailDialogVisible = ref(false)
const selectedUserId = ref('')
const selectedDate = ref('')

onMounted(() => {
  const now = new Date()
  calcMonth.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  projectStore.fetchSalaryDateList()
})

watch(
  calcMonth,
  (month) => {
    if (month) {
      projectStore.fetchByMonth(month)
    }
  },
  { immediate: true }
)

const monthFinishedTotal = computed(() => {
  return projectStore.projects.reduce((sum, p) => sum + (p.commission || 0), 0)
})

function getResult(project: Project): CommissionResult {
  return projectStore.calculateCommission(project)
}

const totalCommission = computed(() => {
  return projectStore.projects.reduce((sum, p) => sum + getResult(p).actualCommission, 0)
})

const currentBaseSalary = computed(() => {
  if (!calcMonth.value) return projectStore.baseSalary
  return projectStore.getSalaryByOrderMonth(calcMonth.value)
})

const totalSalary = computed(() => {
  return currentBaseSalary.value + totalCommission.value
})

const salaryRows = computed<SalaryRow[]>(() => {
  const list = projectStore.salaryDateList || []
  if (!Array.isArray(list) || list.length === 0) return []

  const first = asSalaryDateItem(list[0])
  // 如果 API 已经返回了“按月份平铺”的行结构，就直接使用
  if (first && (first.date || first.total || first.salary_structure_id)) {
    return list.map((v) => ({ ...asSalaryDateItem(v) }))
  }

  const rows: SalaryRow[] = []
  list.forEach((group) => {
    if (!isRecord(group)) return
    const title = typeof group.title === 'string' ? group.title : ''
    const months = Array.isArray(group.month) ? group.month : []
    months.forEach((m) => {
      rows.push({
        ...asSalaryDateItem(m),
        _groupTitle: title
      })
    })
  })
  return rows
})

function handleBaseSalaryChange(value: number) {
  projectStore.setBaseSalary(value)
}

function handleEntryDateChange(value: string) {
  if (value) {
    projectStore.setEntryDate(value)
  }
}

function refreshProjects() {
  projectStore.fetchByMonth(calcMonth.value)
}

function getSalaryMonth(row: SalaryRow): string {
  return (
    row.date ||
    row.month ||
    (typeof row.salary_month === 'string' ? row.salary_month : '') ||
    (typeof row.salaryMonth === 'string' ? row.salaryMonth : '') ||
    (typeof row.salary_date === 'string' ? row.salary_date : '') ||
    (typeof row.salaryDate === 'string' ? row.salaryDate : '') ||
    (typeof row.time === 'string' ? row.time : '') ||
    ''
  )
}

function getSalaryAmount(row: SalaryRow): number {
  const value =
    row.total ??
    row.actual_salary ??
    (row as UnknownRecord).actualSalary ??
    (row as UnknownRecord).salary ??
    (row as UnknownRecord).salary_money ??
    (row as UnknownRecord).salaryMoney ??
    (row as UnknownRecord).money ??
    (row as UnknownRecord).amount ??
    (row as UnknownRecord).actual_money ??
    (row as UnknownRecord).actualMoney ??
    0
  const num = typeof value === 'string' ? parseFloat(value) : Number(value)
  return Number.isFinite(num) ? num : 0
}

function getSalaryConfirmText(row: SalaryRow): string {
  const v = row.salary_structure_is_confirm
  if (v === '1' || v === 1) return '已确认'
  if (v === '2' || v === 2) return '待确认'
  if (v === false || v === '0' || v === 0) return '未生成'
  return '-'
}

function getRuleType(ruleNum: number): string {
  const types: Record<number, string> = {
    1: 'success',
    2: 'primary',
    3: 'warning',
    4: 'danger'
  }
  return types[ruleNum] || 'info'
}

function handleViewDetail(row: SalaryRow) {
  const userId = row.user_id?.toString() || ''
  const date = getSalaryMonth(row)

  if (!userId || !date) {
    ElMessage.warning('缺少必要参数')
    return
  }

  selectedUserId.value = userId
  selectedDate.value = date
  detailDialogVisible.value = true
}

function handleDetailConfirmed() {
  projectStore.fetchSalaryDateList()
}
</script>

<template>
  <div class="salary-calc">
    <el-card class="setting-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>计算设置</span>
          <div class="header-right">
            <span class="task-count">当月完结 {{ projectStore.totalTasks }} 个</span>
            <el-button type="primary" link @click="refreshProjects" :loading="projectStore.loading">
              <el-icon><Refresh /></el-icon> 刷新
            </el-button>
          </div>
        </div>
      </template>

      <el-form :inline="true">
        <el-form-item label="入职日期">
          <el-date-picker
            :model-value="projectStore.entryDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择入职日期"
            @update:model-value="handleEntryDateChange"
          />
        </el-form-item>

        <el-form-item label="起始底薪">
          <el-input-number
            :model-value="projectStore.baseSalary"
            :min="0"
            :step="500"
            @change="handleBaseSalaryChange"
          />
        </el-form-item>

        <el-form-item label="计算月份">
          <el-date-picker
            v-model="calcMonth"
            type="month"
            value-format="YYYY-MM"
            placeholder="选择月份"
          />
        </el-form-item>
      </el-form>
    </el-card>

    <el-row :gutter="16" class="stat-row">
      <el-col :xs="24" :sm="8">
        <el-card shadow="never" class="stat-card">
          <div class="stat-num primary">{{ projectStore.projects.length }}</div>
          <div class="stat-label">当月完结项目</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="8">
        <el-card shadow="never" class="stat-card">
          <div class="stat-num">{{ monthFinishedTotal.toFixed(2) }}</div>
          <div class="stat-label">完结佣金总额(元)</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="8">
        <el-card shadow="never" class="stat-card">
          <div class="stat-num success">{{ totalCommission.toFixed(2) }}</div>
          <div class="stat-label">实得佣金(元)</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" class="table-card">
      <template #header>
        <span>{{ calcMonth }} 完结项目明细</span>
      </template>

      <el-table
        :data="projectStore.projects"
        v-loading="projectStore.loading"
        stripe
      >
        <el-table-column prop="name" label="项目名称" min-width="150" />
        <el-table-column prop="orderMonth" label="接单月份" width="110" />
        <el-table-column label="本月接单总额" width="130">
          <template #default="{ row }">
            {{ projectStore.getOrderMonthTotal(row.orderMonth).toFixed(2) }} 元
          </template>
        </el-table-column>
        <el-table-column label="执行状态" width="100">
          <template #default="{ row }">
            {{ row.orderstatus }}
          </template>
        </el-table-column>
        <el-table-column label="接单佣金" width="120">
          <template #default="{ row }">
            {{ (row.commission || 0).toFixed(2) }} 元
          </template>
        </el-table-column>
        <el-table-column label="逾期状态" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.isOverdue" type="danger" size="small">
              逾期 {{ row.overdueDays }} 天
            </el-tag>
            <el-tag v-else type="success" size="small">正常</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="适用规则" width="100">
          <template #default="{ row }">
            <el-tag :type="getRuleType(getResult(row).ruleNum)" size="small">
              {{ getResult(row).rule }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="佣金比例" width="110">
          <template #default="{ row }">
            {{ (getResult(row).rate * 100) }}%
            <span v-if="row.isOverdue && getResult(row).ruleNum === 1" class="overdue-tag">(超期扣减)</span>
          </template>
        </el-table-column>
        <el-table-column label="实得佣金" width="120">
          <template #default="{ row }">
            <span class="commission-value">{{ getResult(row).actualCommission.toFixed(2) }} 元</span>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="当月暂无完结项目" />
        </template>
      </el-table>
    </el-card>

    <el-card shadow="never" class="summary-card" v-if="projectStore.projects.length > 0">
      <div class="summary-row">
        <div class="summary-item">
          <div class="label">底薪(含工龄)</div>
          <div class="value">{{ currentBaseSalary.toFixed(2) }} <span class="unit">元</span></div>
        </div>
        <div class="summary-divider"></div>
        <div class="summary-item">
          <div class="label">佣金合计</div>
          <div class="value">{{ totalCommission.toFixed(2) }} <span class="unit">元</span></div>
        </div>
        <div class="summary-divider"></div>
        <div class="summary-item main">
          <div class="label">{{ calcMonth }} 应发薪资</div>
          <div class="value highlight">{{ totalSalary.toFixed(2) }} <span class="unit">元</span></div>
        </div>
      </div>
    </el-card>

    <el-card shadow="never" class="salary-date-card">
      <template #header>
        <div class="card-header">
          <span>每月实际工资</span>
          <el-button
            type="primary"
            link
            @click="projectStore.fetchSalaryDateList"
            :loading="projectStore.salaryDateLoading"
          >
            <el-icon><Refresh /></el-icon> 刷新
          </el-button>
        </div>
      </template>

      <el-table
        :data="salaryRows"
        v-loading="projectStore.salaryDateLoading"
        stripe
      >
        <el-table-column label="月份" width="120">
          <template #default="{ row }">
            {{ getSalaryMonth(row) || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="实际工资" width="140">
          <template #default="{ row }">
            {{ getSalaryAmount(row).toFixed(2) }} 元
          </template>
        </el-table-column>
        <el-table-column label="结构确认" width="120">
          <template #default="{ row }">
            {{ getSalaryConfirmText(row) }}
          </template>
        </el-table-column>
        <el-table-column label="备注">
          <template #default="{ row }">
            {{ row.remark || row.note || row.status || row._groupTitle || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              size="small"
              @click="handleViewDetail(row)"
            >
              查看详情
            </el-button>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="暂无工资记录" />
        </template>
      </el-table>
    </el-card>

    <SalaryDetailDialog
      v-model:visible="detailDialogVisible"
      :user-id="selectedUserId"
      :date="selectedDate"
      @confirmed="handleDetailConfirmed"
    />

    <el-card shadow="never" class="rule-card">
      <template #header>
        <span>佣金计算规则</span>
      </template>

      <el-row :gutter="16">
        <el-col :xs="12" :sm="6">
          <div class="rule-item rule-1">
            <div class="rule-title">规则Ⅰ 高业绩</div>
            <div class="rule-desc">佣金 ≥ 底薪×2</div>
            <div class="rule-rate">提成 70%(超期 50%)</div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6">
          <div class="rule-item rule-2">
            <div class="rule-title">规则Ⅱ 达标</div>
            <div class="rule-desc">佣金 ≥ 底薪</div>
            <div class="rule-rate">提成 50%</div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6">
          <div class="rule-item rule-3">
            <div class="rule-title">规则Ⅲ 基础</div>
            <div class="rule-desc">底薪/2 ≤ 佣金 &lt; 底薪</div>
            <div class="rule-rate">提成 30%</div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6">
          <div class="rule-item rule-4">
            <div class="rule-title">规则Ⅳ 保底</div>
            <div class="rule-desc">佣金 &lt; 底薪/2</div>
            <div class="rule-rate">提成 0%(只发底薪)</div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<style scoped>
.salary-calc {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.task-count {
  color: #999;
  font-size: 13px;
}

.stat-row {
  margin-bottom: 0;
}

.stat-card {
  text-align: center;
  padding: 10px 0;
}

.stat-num {
  font-size: 32px;
  font-weight: bold;
  color: #333;
}

.stat-num.primary { color: #409EFF; }
.stat-num.success { color: #67C23A; }
.stat-num.warning { color: #E6A23C; }

.stat-label {
  font-size: 13px;
  color: #999;
  margin-top: 8px;
}

.table-card {
  flex: 1;
}

.commission-value {
  color: #409EFF;
  font-weight: 600;
}

.overdue-tag {
  color: #E6A23C;
  font-size: 12px;
}

.summary-card {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border: none;
  overflow: hidden;
}

.summary-card :deep(.el-card__body) {
  padding: 28px 32px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  gap: 24px;
}

.summary-divider {
  width: 1px;
  height: 60px;
  background: rgba(255, 255, 255, 0.15);
}

.summary-item {
  flex: 1;
  text-align: center;
}

.summary-item .label {
  font-size: 14px;
  opacity: 0.75;
  margin-bottom: 12px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.summary-item .value {
  font-size: 28px;
  font-weight: 700;
  font-family: 'Monaco', 'Consolas', monospace;
  letter-spacing: 1px;
}

.summary-item .unit {
  font-size: 16px;
  font-weight: 500;
  margin-left: 4px;
  opacity: 0.8;
}

.summary-item.main .label {
  font-size: 15px;
  opacity: 0.9;
}

.summary-item.main .value {
  font-size: 36px;
}

.summary-item.main .value.highlight {
  color: #fbbf24;
  text-shadow: 0 2px 8px rgba(251, 191, 36, 0.3);
}

@media screen and (max-width: 768px) {
  .summary-row {
    flex-direction: column;
    gap: 20px;
  }

  .summary-divider {
    width: 80%;
    height: 1px;
  }

  .summary-item .value {
    font-size: 24px;
  }

  .summary-item.main .value {
    font-size: 32px;
  }
}

.rule-card :deep(.el-card__body) {
  padding: 16px;
}

.rule-item {
  padding: 16px;
  border-radius: 8px;
  text-align: center;
}

.rule-1 { background: #f0f9eb; }
.rule-2 { background: #ecf5ff; }
.rule-3 { background: #fdf6ec; }
.rule-4 { background: #fef0f0; }

.rule-title {
  font-weight: bold;
  margin-bottom: 8px;
}

.rule-1 .rule-title { color: #67C23A; }
.rule-2 .rule-title { color: #409EFF; }
.rule-3 .rule-title { color: #E6A23C; }
.rule-4 .rule-title { color: #F56C6C; }

.rule-desc {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.rule-rate {
  font-size: 13px;
  font-weight: 500;
  color: #333;
}

@media screen and (max-width: 768px) {
  .salary-calc {
    gap: 10px;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .header-right {
    width: 100%;
    justify-content: space-between;
  }

  .setting-card :deep(.el-form--inline .el-form-item) {
    display: flex;
    margin-right: 0;
    margin-bottom: 10px;
    width: 100%;
  }

  .setting-card :deep(.el-form--inline) {
    display: flex;
    flex-direction: column;
  }

  .setting-card :deep(.el-input-number),
  .setting-card :deep(.el-date-editor) {
    width: 100% !important;
  }

  .stat-card {
    padding: 6px 0;
    margin-bottom: 10px;
  }

  .stat-num {
    font-size: 24px;
  }

  .stat-label {
    font-size: 12px;
    margin-top: 4px;
  }

  .table-card :deep(.el-table) {
    font-size: 13px;
  }

  .summary-row {
    flex-direction: column;
    gap: 16px;
  }

  .summary-item .value {
    font-size: 20px;
  }

  .summary-item.main .value {
    font-size: 26px;
  }

  .rule-item {
    padding: 10px;
    margin-bottom: 10px;
  }

  .rule-title {
    font-size: 13px;
  }

  .rule-desc {
    font-size: 11px;
  }

  .rule-rate {
    font-size: 12px;
  }
}
</style>
