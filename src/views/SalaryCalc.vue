<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Refresh, ArrowDown, Document, Wallet, TrendCharts } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useProjectStore } from '@/stores/project'
import type { Project, CommissionResult } from '@/types'
import type { SalaryDateItem } from '@/api/salary'
import SalaryDetailDialog from '@/components/SalaryDetailDialog.vue'
import EmptyState from '@/components/EmptyState.vue'

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
  // 如果 API 已经返回了”按月份平铺”的行结构，就直接使用
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

// 按年分组
const salaryByYear = computed(() => {
  const groups: Record<string, SalaryRow[]> = {}
  salaryRows.value.forEach(row => {
    const month = getSalaryMonth(row)
    const year = month.substring(0, 4) || '未知年份'
    if (!groups[year]) {
      groups[year] = []
    }
    groups[year].push(row)
  })

  // 每年内部按月份倒序排序
  Object.keys(groups).forEach(year => {
    const yearRows = groups[year]
    if (yearRows) {
      yearRows.sort((a, b) => {
        const monthA = getSalaryMonth(a)
        const monthB = getSalaryMonth(b)
        return monthB.localeCompare(monthA)
      })
    }
  })

  // 返回按年份倒序的对象（数字比较）
  const sortedGroups: Record<string, SalaryRow[]> = {}
  Object.keys(groups)
    .sort((a, b) => {
      const yearA = parseInt(a) || 0
      const yearB = parseInt(b) || 0
      return yearB - yearA // 数字倒序
    })
    .forEach(year => {
      const yearRows = groups[year]
      if (yearRows) {
        sortedGroups[year] = yearRows
      }
    })

  return sortedGroups
})

const expandedYears = ref<Set<string>>(new Set())

function toggleYear(year: string) {
  if (expandedYears.value.has(year)) {
    expandedYears.value.delete(year)
  } else {
    expandedYears.value.add(year)
  }
}

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

    <el-row :gutter="24" class="stat-row">
      <el-col :xs="24" :sm="8">
        <el-card shadow="never" class="stat-card stat-card-hover">
          <div class="stat-card-inner">
            <div class="stat-icon-wrapper primary">
              <el-icon :size="24"><Document /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-num primary">{{ projectStore.projects.length }}</div>
              <div class="stat-label">当月完结项目</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="8">
        <el-card shadow="never" class="stat-card stat-card-hover">
          <div class="stat-card-inner">
            <div class="stat-icon-wrapper warning">
              <el-icon :size="24"><Wallet /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-num warning">{{ monthFinishedTotal.toFixed(2) }}</div>
              <div class="stat-label">完结佣金总额(元)</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="8">
        <el-card shadow="never" class="stat-card stat-card-hover">
          <div class="stat-card-inner">
            <div class="stat-icon-wrapper success">
              <el-icon :size="24"><TrendCharts /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-num success">{{ totalCommission.toFixed(2) }}</div>
              <div class="stat-label">实得佣金(元)</div>
            </div>
          </div>
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
          <EmptyState
            type="data"
            title="当月暂无完结项目"
            description="完成项目后，数据会自动显示在这里"
          />
        </template>
      </el-table>
    </el-card>

    <el-card shadow="never" class="hero-salary-card" v-if="projectStore.projects.length > 0">
      <div class="hero-card-bg"></div>
      <div class="hero-card-content">
        <div class="hero-label">{{ calcMonth }} 应发薪资</div>
        <div class="hero-amount">
          <span class="hero-currency">¥</span>
          <span class="hero-value">{{ totalSalary.toFixed(2) }}</span>
        </div>
        <div class="hero-breakdown">
          <div class="breakdown-item">
            <span class="breakdown-label">底薪(含工龄)</span>
            <span class="breakdown-value">{{ currentBaseSalary.toFixed(2) }}</span>
          </div>
          <div class="breakdown-divider">+</div>
          <div class="breakdown-item">
            <span class="breakdown-label">佣金合计</span>
            <span class="breakdown-value">{{ totalCommission.toFixed(2) }}</span>
          </div>
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

      <div v-loading="projectStore.salaryDateLoading" class="salary-year-list">
        <div v-for="year in Object.keys(salaryByYear).sort((a, b) => parseInt(b) - parseInt(a))" :key="year" class="year-group">
          <div class="year-header" @click="toggleYear(year)">
            <div class="year-title">
              <el-icon class="arrow-icon" :class="{ expanded: expandedYears.has(year) }">
                <ArrowDown />
              </el-icon>
              <span class="year-text">{{ year }}</span>
              <span class="year-count">{{ salaryByYear[year]?.length || 0 }} 条记录</span>
            </div>
            <div class="year-total">
              年度总额：{{ (salaryByYear[year]?.reduce((sum, r) => sum + getSalaryAmount(r), 0) || 0).toFixed(2) }} 元
            </div>
          </div>

          <el-collapse-transition>
            <div v-if="expandedYears.has(year)" class="year-content">
              <el-table :data="salaryByYear[year]" stripe>
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
              </el-table>
            </div>
          </el-collapse-transition>
        </div>

        <EmptyState
          v-if="Object.keys(salaryByYear).length === 0"
          type="data"
          title="暂无工资记录"
          description="工资数据会在每月结算后显示"
        />
      </div>
    </el-card>

    <SalaryDetailDialog
      v-model:visible="detailDialogVisible"
      :user-id="selectedUserId"
      :date="selectedDate"
      @confirmed="handleDetailConfirmed"
    />

    <el-card shadow="never" class="rule-card">
      <template #header>
        <span>佣金计算规则 {{ calcMonth >= '2026-04' ? '(新规则 2026-04起)' : '(旧规则 2026-04前)' }}</span>
      </template>

      <!-- 新规则 (2026-04起) -->
      <el-row v-if="calcMonth >= '2026-04'" :gutter="16">
        <el-col :xs="12" :sm="12">
          <div class="rule-item rule-2">
            <div class="rule-title">规则Ⅰ 达标</div>
            <div class="rule-desc">佣金 ≥ 底薪</div>
            <div class="rule-rate">提成 50%</div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="12">
          <div class="rule-item rule-3">
            <div class="rule-title">规则Ⅱ 基础</div>
            <div class="rule-desc">佣金 &lt; 底薪</div>
            <div class="rule-rate">提成 30%</div>
          </div>
        </el-col>
      </el-row>

      <!-- 旧规则 (2026-04前) -->
      <el-row v-else :gutter="16">
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
  gap: var(--space-4);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.task-count {
  color: var(--text-secondary);
  font-size: var(--font-sm);
}

.stat-row {
  margin-bottom: 0;
}

.stat-card {
  border: 1px solid var(--border-default);
  transition: all var(--transition-bounce);
  overflow: hidden;
  position: relative;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--gradient-warm);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--transition-bounce);
}

.stat-card-hover:hover {
  transform: translateY(-4px);
  border-color: var(--border-brand);
  box-shadow: var(--shadow-lg);
}

.stat-card-hover:hover::before {
  transform: scaleX(1);
}

.stat-card-inner {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-5);
}

.stat-icon-wrapper {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-bounce);
}

.stat-icon-wrapper.primary {
  background: linear-gradient(135deg, var(--brand-100) 0%, var(--brand-200) 100%);
  color: var(--brand-600);
}

.stat-icon-wrapper.warning {
  background: linear-gradient(135deg, var(--color-warning-bg) 0%, #FEF3C7 100%);
  color: var(--color-warning);
}

.stat-icon-wrapper.success {
  background: linear-gradient(135deg, var(--color-success-bg) 0%, #D1FAE5 100%);
  color: var(--color-success);
}

.stat-card-hover:hover .stat-icon-wrapper {
  transform: scale(1.1) rotate(-5deg);
}

.stat-content {
  flex: 1;
  text-align: left;
}

.stat-num {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  font-family: var(--font-family-base);
  line-height: 1.2;
}

.stat-num.primary { color: var(--brand-600); }
.stat-num.success { color: var(--color-success); }
.stat-num.warning { color: var(--color-warning); }

.stat-label {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  margin-top: var(--space-1);
  font-weight: 500;
}

.table-card {
  flex: 1;
}

.commission-value {
  color: var(--brand-600);
  font-weight: 600;
}

.overdue-tag {
  color: var(--color-warning);
  font-size: var(--font-xs);
}

.hero-salary-card {
  position: relative;
  background: linear-gradient(135deg, #F97316 0%, #FB923C 50%, #FDBA74 100%);
  border: none;
  overflow: hidden;
  overflow: clip;
  box-shadow: 0 20px 40px rgba(249, 115, 22, 0.3);
  margin-bottom: var(--space-6);
}

.hero-card-bg {
  position: absolute;
  top: -50%;
  right: -10%;
  width: min(400px, 80vw);
  height: min(400px, 80vw);
  background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%);
  border-radius: 50%;
  animation: pulse 4s ease-in-out infinite;
  pointer-events: none;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

.hero-salary-card :deep(.el-card__body) {
  padding: var(--space-10) var(--space-8);
  position: relative;
  z-index: 1;
}

.hero-card-content {
  text-align: center;
  color: white;
}

.hero-label {
  font-size: var(--font-base);
  opacity: 0.9;
  margin-bottom: var(--space-4);
  font-weight: 500;
  letter-spacing: var(--letter-spacing-wide);
  text-transform: uppercase;
}

.hero-amount {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: var(--space-2);
  margin-bottom: var(--space-6);
  flex-wrap: wrap;
}

.hero-currency {
  font-size: 32px;
  font-weight: 600;
  opacity: 0.9;
}

.hero-value {
  font-size: 56px;
  font-weight: 800;
  font-family: var(--font-family-base);
  letter-spacing: -0.03em;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: countUp 0.8s ease-out;
}

@keyframes countUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.hero-breakdown {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-6);
  padding-top: var(--space-6);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.breakdown-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.breakdown-label {
  font-size: var(--font-xs);
  opacity: 0.8;
  font-weight: 500;
}

.breakdown-value {
  font-size: var(--font-lg);
  font-weight: 700;
  font-family: var(--font-family-base);
}

.breakdown-divider {
  font-size: var(--font-xl);
  font-weight: 300;
  opacity: 0.6;
}

@media screen and (max-width: 768px) {
  .hero-salary-card :deep(.el-card__body) {
    padding: var(--space-6) var(--space-4);
  }

  .hero-value {
    font-size: 40px;
  }

  .hero-currency {
    font-size: 24px;
  }

  .hero-breakdown {
    flex-direction: column;
    gap: var(--space-4);
  }

  .breakdown-divider {
    transform: rotate(90deg);
  }
}

.salary-year-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  min-height: 200px;
}

.year-group {
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--bg-surface);
  transition: all var(--transition-base);
}

.year-group:hover {
  border-color: var(--border-brand);
  box-shadow: var(--shadow-sm);
}

.year-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4) var(--space-5);
  background: var(--bg-soft);
  cursor: pointer;
  transition: all var(--transition-base);
  border-bottom: 1px solid var(--border-default);
}

.year-header:hover {
  background: var(--brand-50);
}

.year-title {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.arrow-icon {
  font-size: var(--font-md);
  color: var(--text-secondary);
  transition: transform var(--transition-base);
}

.arrow-icon.expanded {
  transform: rotate(180deg);
  color: var(--brand-600);
}

.year-text {
  font-size: var(--font-md);
  font-weight: 600;
  color: var(--text-primary);
}

.year-count {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  background: var(--bg-surface);
  padding: 2px var(--space-2);
  border-radius: var(--radius-full);
  border: 1px solid var(--border-default);
}

.year-total {
  font-size: var(--font-md);
  font-weight: 600;
  color: var(--brand-600);
}

.year-content {
  padding: 0;
}

.year-content :deep(.el-table) {
  border-radius: 0;
}

.year-content :deep(.el-table::before) {
  display: none;
}

@media screen and (max-width: 768px) {
  .year-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .year-total {
    font-size: 14px;
  }
}

.rule-card :deep(.el-card__body) {
  padding: var(--space-4);
}

.rule-item {
  padding: var(--space-4);
  border-radius: var(--radius-md);
  text-align: center;
  border: 1px solid transparent;
  transition: all var(--transition-base);
}

.rule-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.rule-1 {
  background: var(--color-success-bg);
  border-color: var(--color-success-border);
}
.rule-2 {
  background: var(--brand-50);
  border-color: var(--brand-200);
}
.rule-3 {
  background: var(--color-warning-bg);
  border-color: var(--color-warning-border);
}
.rule-4 {
  background: var(--color-danger-bg);
  border-color: var(--color-danger-border);
}

.rule-title {
  font-weight: 600;
  margin-bottom: var(--space-2);
  font-size: var(--font-base);
}

.rule-1 .rule-title { color: var(--color-success); }
.rule-2 .rule-title { color: var(--brand-700); }
.rule-3 .rule-title { color: var(--color-warning); }
.rule-4 .rule-title { color: var(--color-danger); }

.rule-desc {
  font-size: var(--font-xs);
  color: var(--text-secondary);
  margin-bottom: var(--space-1);
}

.rule-rate {
  font-size: var(--font-sm);
  font-weight: 500;
  color: var(--text-primary);
}

@media screen and (max-width: 768px) {
  .salary-calc {
    gap: var(--space-2);
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-2);
  }

  .header-right {
    width: 100%;
    justify-content: space-between;
  }

  .setting-card :deep(.el-form--inline .el-form-item) {
    display: flex;
    margin-right: 0;
    margin-bottom: var(--space-2);
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
    margin-bottom: var(--space-2);
  }

  .stat-card-inner {
    padding: var(--space-4);
    gap: var(--space-3);
  }

  .stat-icon-wrapper {
    width: 48px;
    height: 48px;
  }

  .stat-num {
    font-size: 24px;
  }

  .stat-label {
    font-size: var(--font-xs);
    margin-top: var(--space-1);
  }

  .table-card :deep(.el-table) {
    font-size: var(--font-sm);
  }

  .summary-row {
    flex-direction: column;
    gap: var(--space-4);
  }

  .summary-item .value {
    font-size: 20px;
  }

  .summary-item.main .value {
    font-size: 26px;
  }

  .rule-item {
    padding: var(--space-2);
    margin-bottom: var(--space-2);
  }

  .rule-title {
    font-size: var(--font-sm);
  }

  .rule-desc {
    font-size: 11px;
  }

  .rule-rate {
    font-size: var(--font-xs);
  }
}
</style>
