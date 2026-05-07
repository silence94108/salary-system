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

/* ============================================================
 * 近 6 个月薪资 sparkline（用于 hero 卡）
 * ============================================================ */
const recentSalaryTrend = computed<number[]>(() => {
  const allRows: SalaryRow[] = []
  Object.values(salaryByYear.value).forEach(yearRows => {
    allRows.push(...yearRows)
  })
  allRows.sort((a, b) => getSalaryMonth(b).localeCompare(getSalaryMonth(a)))
  return allRows.slice(0, 6).reverse().map(r => getSalaryAmount(r))
})

const sparkline = computed(() => {
  const data = recentSalaryTrend.value
  if (data.length < 2) return null
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const W = 260
  const H = 64
  const PAD = 8
  const stepX = W / (data.length - 1)
  const dots = data.map((v, i) => ({
    x: +(i * stepX).toFixed(1),
    y: +(H - PAD - ((v - min) / range) * (H - PAD * 2)).toFixed(1)
  }))
  const line = 'M ' + dots.map(d => `${d.x},${d.y}`).join(' L ')
  const fill = `M ${dots[0]!.x},${H} L ${dots.map(d => `${d.x},${d.y}`).join(' L ')} L ${dots[dots.length - 1]!.x},${H} Z`
  return { dots, line, fill, W, H, last: dots[dots.length - 1]! }
})

const lastMonthSalary = computed(() => {
  const data = recentSalaryTrend.value
  return data.length >= 2 ? data[data.length - 2]! : 0
})

const salaryDelta = computed(() => {
  const last = lastMonthSalary.value
  const cur = totalSalary.value
  if (!last) return null
  const pct = ((cur - last) / last) * 100
  return {
    pct: Math.abs(pct).toFixed(1),
    up: pct >= 0,
    last
  }
})
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
        <div class="stat-card">
          <div class="stat-head">
            <span class="stat-label">当月完结项目</span>
            <span class="stat-pill primary">
              <el-icon :size="11"><Document /></el-icon>
              个
            </span>
          </div>
          <div class="stat-value num">{{ projectStore.projects.length }}</div>
          <div class="stat-foot">基于完结月份</div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="8">
        <div class="stat-card">
          <div class="stat-head">
            <span class="stat-label">完结佣金总额</span>
            <span class="stat-pill warning">
              <el-icon :size="11"><Wallet /></el-icon>
              元
            </span>
          </div>
          <div class="stat-value">
            <span class="cur">¥</span><span class="num">{{ monthFinishedTotal.toFixed(2) }}</span>
          </div>
          <div class="stat-foot">基于接单月份汇总</div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="8">
        <div class="stat-card">
          <div class="stat-head">
            <span class="stat-label">实得佣金</span>
            <span class="stat-pill success">
              <el-icon :size="11"><TrendCharts /></el-icon>
              提成
            </span>
          </div>
          <div class="stat-value">
            <span class="cur">¥</span><span class="num">{{ totalCommission.toFixed(2) }}</span>
          </div>
          <div class="stat-foot">实得 / 完结 = {{ monthFinishedTotal > 0 ? ((totalCommission / monthFinishedTotal) * 100).toFixed(0) : 0 }}%</div>
        </div>
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

    <!-- ============ Hero · 应发薪资（白底大数字 + sparkline）============ -->
    <div class="hero-card" v-if="projectStore.projects.length > 0">
      <div class="hero-top">
        <div class="hero-main">
          <div class="hero-label">
            应发薪资
            <span class="hero-pill">{{ calcMonth }}</span>
          </div>
          <div class="hero-amount">
            <span class="hero-cur">¥</span>
            <span class="num">{{ totalSalary.toFixed(2) }}</span>
          </div>
          <div v-if="salaryDelta" class="hero-trend" :class="{ down: !salaryDelta.up }">
            <span class="arrow">{{ salaryDelta.up ? '↑' : '↓' }}</span>
            <span class="num">{{ salaryDelta.pct }}%</span>
            <span class="vs">较上月（¥{{ salaryDelta.last.toFixed(2) }}）</span>
          </div>
          <div v-else class="hero-trend muted">
            首月数据 · 暂无对比
          </div>
        </div>

        <div v-if="sparkline" class="spark-wrap">
          <div class="spark-meta">近 {{ recentSalaryTrend.length }} 个月薪资走势</div>
          <svg class="spark" :viewBox="`0 0 ${sparkline.W} ${sparkline.H}`" preserveAspectRatio="none">
            <defs>
              <linearGradient :id="`spark-fill-${calcMonth}`" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="var(--brand-500)" stop-opacity="0.18"/>
                <stop offset="100%" stop-color="var(--brand-500)" stop-opacity="0"/>
              </linearGradient>
            </defs>
            <line :x1="0" :y1="sparkline.H / 2" :x2="sparkline.W" :y2="sparkline.H / 2" stroke="var(--gray-100)" stroke-dasharray="2,4"/>
            <path :d="sparkline.fill" :fill="`url(#spark-fill-${calcMonth})`"/>
            <path :d="sparkline.line" fill="none" stroke="var(--brand-500)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>
            <circle v-for="(d, i) in sparkline.dots" :key="i" :cx="d.x" :cy="d.y" :r="i === sparkline.dots.length - 1 ? 3 : 2.2" :fill="i === sparkline.dots.length - 1 ? 'var(--brand-500)' : 'var(--brand-500)'" :stroke="i === sparkline.dots.length - 1 ? '#fff' : 'none'" :stroke-width="i === sparkline.dots.length - 1 ? 2 : 0"/>
          </svg>
        </div>
      </div>

      <div class="hero-bottom">
        <div class="hero-cell">
          <div class="hero-cell-label">底薪（含工龄）</div>
          <div class="hero-cell-value num">¥{{ currentBaseSalary.toFixed(2) }}</div>
        </div>
        <div class="hero-cell">
          <div class="hero-cell-label">佣金合计</div>
          <div class="hero-cell-value num">¥{{ totalCommission.toFixed(2) }}</div>
        </div>
        <div class="hero-cell">
          <div class="hero-cell-label">实得比例</div>
          <div class="hero-cell-value accent">
            {{ monthFinishedTotal > 0 ? ((totalCommission / monthFinishedTotal) * 100).toFixed(0) : 0 }}%
          </div>
        </div>
      </div>
    </div>

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

/* ============ Stat 卡（Stripe 风：白底，无图标盒）============ */
.stat-card {
  background: var(--bg-surface);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-md);
  padding: 16px 18px;
  box-shadow: var(--shadow-xs);
  transition: box-shadow .15s, border-color .15s;
  height: 100%;
}
.stat-card:hover {
  border-color: var(--border-strong);
  box-shadow: var(--shadow-sm);
}
.stat-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.stat-label {
  font-size: 12.5px;
  font-weight: 500;
  color: var(--text-secondary);
}
.stat-pill {
  font-size: 11px;
  font-weight: 500;
  padding: 1px 7px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  letter-spacing: .03em;
}
.stat-pill.primary {
  background: var(--brand-50);
  color: var(--brand-700);
}
.stat-pill.warning {
  background: var(--color-warning-bg);
  color: #B45309;
}
.stat-pill.success {
  background: var(--color-success-bg);
  color: #047857;
}
.stat-value {
  font-size: 26px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -.02em;
  line-height: 1.1;
  display: flex;
  align-items: baseline;
  font-variant-numeric: tabular-nums;
}
.stat-value .cur {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-tertiary);
  margin-right: 2px;
}
.stat-value .num {
  font-variant-numeric: tabular-nums;
}
.stat-foot {
  margin-top: 6px;
  font-size: 12px;
  color: var(--text-tertiary);
}

.table-card {
  flex: 1;
}

.commission-value {
  color: var(--brand-700);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.overdue-tag {
  color: var(--color-warning);
  font-size: var(--font-xs);
}

/* ============ Hero · 白底大卡 + sparkline ============ */
.hero-card {
  background: var(--bg-surface);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-xs);
  overflow: hidden;
}
.hero-top {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 32px;
  padding: 22px 24px 18px;
  align-items: end;
}
.hero-main {
  min-width: 0;
}
.hero-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.hero-pill {
  font-size: 11px;
  font-weight: 500;
  padding: 1px 7px;
  border-radius: 10px;
  background: var(--brand-50);
  color: var(--brand-700);
  font-variant-numeric: tabular-nums;
}
.hero-amount {
  font-size: 36px;
  font-weight: 700;
  letter-spacing: -.025em;
  color: var(--text-primary);
  line-height: 1.1;
  display: flex;
  align-items: baseline;
  font-variant-numeric: tabular-nums;
}
.hero-cur {
  font-size: 22px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-right: 4px;
}
.hero-trend {
  margin-top: 8px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12.5px;
  color: #047857;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}
.hero-trend.down {
  color: #B91C1C;
}
.hero-trend.muted {
  color: var(--text-tertiary);
  font-weight: 400;
}
.hero-trend .arrow {
  font-size: 12px;
}
.hero-trend .vs {
  color: var(--text-tertiary);
  font-weight: 400;
  margin-left: 4px;
}

/* Sparkline */
.spark-wrap {
  width: 260px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.spark-meta {
  font-size: 11.5px;
  color: var(--text-tertiary);
  margin-bottom: 6px;
}
.spark {
  width: 100%;
  height: 64px;
  display: block;
}

.hero-bottom {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border-top: 1px solid var(--gray-100);
  background: var(--bg-muted);
}
.hero-cell {
  padding: 12px 18px;
  border-right: 1px solid var(--gray-100);
}
.hero-cell:last-child {
  border-right: none;
}
.hero-cell-label {
  font-size: 11.5px;
  color: var(--text-tertiary);
  margin-bottom: 4px;
}
.hero-cell-value {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}
.hero-cell-value.accent {
  color: var(--brand-700);
}

@media screen and (max-width: 768px) {
  .hero-top {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 18px 16px 14px;
  }
  .spark-wrap {
    width: 100%;
  }
  .hero-amount {
    font-size: 30px;
  }
  .hero-bottom {
    grid-template-columns: 1fr;
  }
  .hero-cell {
    border-right: none;
    border-bottom: 1px solid var(--gray-100);
  }
  .hero-cell:last-child {
    border-bottom: none;
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
    padding: 14px 16px;
  }

  .stat-value {
    font-size: 22px;
  }

  .stat-label {
    font-size: var(--font-xs);
  }

  .table-card :deep(.el-table) {
    font-size: var(--font-sm);
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
