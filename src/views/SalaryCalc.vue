<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
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

  const sortedGroups: Record<string, SalaryRow[]> = {}
  Object.keys(groups)
    .sort((a, b) => {
      const yearA = parseInt(a) || 0
      const yearB = parseInt(b) || 0
      return yearB - yearA
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

function getSalaryConfirmPill(row: SalaryRow): string {
  const v = row.salary_structure_is_confirm
  if (v === '1' || v === 1) return 'pill-success'
  if (v === '2' || v === 2) return 'pill-warning'
  return 'pill-muted'
}

// 状态文本 → pill class（用于完结明细表）
function getRulePill(ruleNum: number): string {
  if (ruleNum === 1) return 'pill-info'
  if (ruleNum === 2) return 'pill-warning'
  if (ruleNum === 3) return 'pill-warning'
  if (ruleNum === 4) return 'pill-danger'
  return 'pill-muted'
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
  const W = 280
  const H = 72
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

// 整数和小数拆分（hero 大数字用）
const heroAmountParts = computed(() => {
  const v = totalSalary.value
  const fixed = v.toFixed(2)
  const [intPart, decPart] = fixed.split('.')
  return { int: intPart || '0', dec: '.' + (decPart || '00') }
})

const monthFinishedTotalParts = computed(() => {
  const v = monthFinishedTotal.value
  const fixed = v.toFixed(2)
  const [intPart, decPart] = fixed.split('.')
  return { int: intPart || '0', dec: '.' + (decPart || '00') }
})

const totalCommissionParts = computed(() => {
  const v = totalCommission.value
  const fixed = v.toFixed(2)
  const [intPart, decPart] = fixed.split('.')
  return { int: intPart || '0', dec: '.' + (decPart || '00') }
})

const commissionRatio = computed(() => {
  if (monthFinishedTotal.value <= 0) return 0
  return Math.round((totalCommission.value / monthFinishedTotal.value) * 100)
})

const isNewRules = computed(() => calcMonth.value >= '2026-04')
</script>

<template>
  <div class="page-wrap">
    <!-- 页头 -->
    <div class="page-head">
      <div>
        <h1 class="page-title">薪资计算</h1>
        <div class="page-sub">
          基于接单月份的总佣金计算实得提成 · 当前月份 {{ calcMonth || '—' }}
        </div>
      </div>
      <div class="page-actions">
        <el-button class="btn" :loading="projectStore.loading" @click="refreshProjects">
          <el-icon><Refresh /></el-icon>
          <span>刷新</span>
        </el-button>
      </div>
    </div>

    <!-- ============ Hero · 应发薪资（白底大数字 + sparkline）============ -->
    <section class="hero">
      <div class="hero-top">
        <div>
          <div class="hero-label">
            应发薪资
            <span class="hero-pill">{{ calcMonth || '—' }}</span>
          </div>
          <div class="hero-amount">
            <span class="hero-currency">¥</span>
            <span class="num">{{ heroAmountParts.int }}</span>
            <span class="hero-decimal">{{ heroAmountParts.dec }}</span>
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

        <div v-if="sparkline" class="sparkline-wrap">
          <div class="sparkline-meta">近 {{ recentSalaryTrend.length }} 个月薪资走势</div>
          <svg class="sparkline" :viewBox="`0 0 ${sparkline.W} ${sparkline.H}`" preserveAspectRatio="none">
            <defs>
              <linearGradient :id="`spark-fill-${calcMonth}`" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="var(--accent)" stop-opacity="0.18" />
                <stop offset="100%" stop-color="var(--accent)" stop-opacity="0" />
              </linearGradient>
            </defs>
            <line
              :x1="0"
              :y1="sparkline.H / 2"
              :x2="sparkline.W"
              :y2="sparkline.H / 2"
              stroke="var(--border-soft)"
              stroke-dasharray="2,4"
            />
            <path :d="sparkline.fill" :fill="`url(#spark-fill-${calcMonth})`" />
            <path
              :d="sparkline.line"
              fill="none"
              stroke="var(--accent)"
              stroke-width="1.8"
              stroke-linejoin="round"
              stroke-linecap="round"
            />
            <circle
              v-for="(d, i) in sparkline.dots"
              :key="i"
              :cx="d.x"
              :cy="d.y"
              :r="i === sparkline.dots.length - 1 ? 3 : 2.2"
              fill="var(--accent)"
              :stroke="i === sparkline.dots.length - 1 ? 'var(--bg-surface)' : 'none'"
              :stroke-width="i === sparkline.dots.length - 1 ? 2 : 0"
            />
          </svg>
        </div>
      </div>

      <div class="hero-bottom">
        <div class="hero-cell">
          <div class="hero-cell-label">底薪（含工龄）</div>
          <div class="hero-cell-value">¥{{ currentBaseSalary.toFixed(2) }}</div>
        </div>
        <div class="hero-cell">
          <div class="hero-cell-label">佣金合计</div>
          <div class="hero-cell-value">¥{{ totalCommission.toFixed(2) }}</div>
        </div>
        <div class="hero-cell">
          <div class="hero-cell-label">实得比例</div>
          <div class="hero-cell-value accent">
            {{ isNewRules ? '新规则' : '旧规则' }} · {{ commissionRatio }}%
          </div>
        </div>
      </div>
    </section>

    <!-- ============ Stats 三栏 ============ -->
    <div class="stats">
      <div class="stat">
        <div class="stat-head">
          <div class="stat-label">当月完结项目</div>
          <span class="stat-pill primary">个</span>
        </div>
        <div class="stat-value">
          <span class="num">{{ projectStore.projects.length }}</span>
        </div>
        <div class="stat-foot">基于完结月份</div>
      </div>
      <div class="stat">
        <div class="stat-head">
          <div class="stat-label">完结佣金总额</div>
          <span class="stat-pill warning">汇总</span>
        </div>
        <div class="stat-value">
          <span class="cur">¥</span>
          <span class="num">{{ monthFinishedTotalParts.int }}</span>
          <span class="dec">{{ monthFinishedTotalParts.dec }}</span>
        </div>
        <div class="stat-foot">基于接单月份汇总</div>
      </div>
      <div class="stat">
        <div class="stat-head">
          <div class="stat-label">实得佣金</div>
          <span class="stat-pill">{{ isNewRules ? '新规则' : '旧规则' }}</span>
        </div>
        <div class="stat-value">
          <span class="cur">¥</span>
          <span class="num">{{ totalCommissionParts.int }}</span>
          <span class="dec">{{ totalCommissionParts.dec }}</span>
        </div>
        <div class="stat-foot">
          实得 / 完结 = <span class="accent-text">{{ commissionRatio }}%</span>
        </div>
      </div>
    </div>

    <!-- ============ 计算设置 ============ -->
    <section class="card">
      <div class="card-head">
        <div class="card-title">计算设置</div>
        <div class="card-meta">当月完结 {{ projectStore.totalTasks }} 个项目</div>
      </div>
      <div class="card-body">
        <el-form class="setting-form" label-position="top">
          <div class="form-grid">
            <div class="field">
              <div class="field-label">入职日期</div>
              <el-date-picker
                :model-value="projectStore.entryDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="选择入职日期"
                style="width: 100%;"
                @update:model-value="handleEntryDateChange"
              />
            </div>
            <div class="field">
              <div class="field-label">起始底薪 ¥</div>
              <el-input-number
                :model-value="projectStore.baseSalary"
                :min="0"
                :step="500"
                style="width: 100%;"
                @change="handleBaseSalaryChange"
              />
            </div>
            <div class="field">
              <div class="field-label">计算月份</div>
              <el-date-picker
                v-model="calcMonth"
                type="month"
                value-format="YYYY-MM"
                placeholder="选择月份"
                style="width: 100%;"
              />
            </div>
          </div>
        </el-form>
      </div>
    </section>

    <!-- ============ 完结项目明细 ============ -->
    <section class="card">
      <div class="card-head">
        <div class="card-title">完结项目明细 · {{ calcMonth || '—' }}</div>
        <div class="card-meta">{{ projectStore.projects.length }} 条记录</div>
      </div>
      <el-table
        :data="projectStore.projects"
        v-loading="projectStore.loading"
        class="t-style"
      >
        <el-table-column prop="name" label="项目名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="orderMonth" label="接单月份" width="110" />
        <el-table-column label="本月接单总额" width="140">
          <template #default="{ row }">
            <span class="num">¥{{ projectStore.getOrderMonthTotal(row.orderMonth).toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <span class="pill pill-success">{{ row.orderstatus || '已完结' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="接单佣金" width="120">
          <template #default="{ row }">
            <span class="num">¥{{ (row.commission || 0).toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="逾期" width="120">
          <template #default="{ row }">
            <span v-if="row.isOverdue" class="pill pill-danger">逾期 {{ row.overdueDays }} 天</span>
            <span v-else class="pill pill-muted">正常</span>
          </template>
        </el-table-column>
        <el-table-column label="规则" width="100">
          <template #default="{ row }">
            <span class="pill" :class="getRulePill(getResult(row).ruleNum)">{{ getResult(row).rule }}</span>
          </template>
        </el-table-column>
        <el-table-column label="比例" width="90">
          <template #default="{ row }">
            <span class="num">{{ (getResult(row).rate * 100) }}%</span>
            <span v-if="row.isOverdue && getResult(row).ruleNum === 1" class="overdue-tag">超期扣减</span>
          </template>
        </el-table-column>
        <el-table-column label="实得佣金" width="130" align="right">
          <template #default="{ row }">
            <span class="commission-value num">¥{{ getResult(row).actualCommission.toFixed(2) }}</span>
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
    </section>

    <!-- ============ 每月实际工资（年度分组）============ -->
    <section class="card">
      <div class="card-head">
        <div class="card-title">每月实际工资</div>
        <div class="card-meta">
          <el-button
            class="btn"
            link
            :loading="projectStore.salaryDateLoading"
            @click="projectStore.fetchSalaryDateList"
          >
            <el-icon><Refresh /></el-icon>
            <span>刷新</span>
          </el-button>
        </div>
      </div>

      <div v-loading="projectStore.salaryDateLoading" class="year-list">
        <div
          v-for="year in Object.keys(salaryByYear).sort((a, b) => parseInt(b) - parseInt(a))"
          :key="year"
          class="year-row"
          :class="{ open: expandedYears.has(year) }"
        >
          <div class="year-head" @click="toggleYear(year)">
            <div class="year-left">
              <svg class="chev" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
                <polyline points="6,4 10,8 6,12" />
              </svg>
              <div class="year-name">{{ year }}</div>
              <div class="year-count">{{ salaryByYear[year]?.length || 0 }} 条记录</div>
            </div>
            <div class="year-total">
              年度总额
              <b class="num">
                ¥{{ (salaryByYear[year]?.reduce((sum, r) => sum + getSalaryAmount(r), 0) || 0).toFixed(2) }}
              </b>
            </div>
          </div>

          <div class="year-body">
            <el-table :data="salaryByYear[year]" class="t-style">
              <el-table-column label="月份" width="120">
                <template #default="{ row }">
                  <span class="num">{{ getSalaryMonth(row) || '-' }}</span>
                </template>
              </el-table-column>
              <el-table-column label="实际工资" width="140">
                <template #default="{ row }">
                  <span class="commission-value num">¥{{ getSalaryAmount(row).toFixed(2) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="结构确认" width="120">
                <template #default="{ row }">
                  <span class="pill" :class="getSalaryConfirmPill(row)">
                    {{ getSalaryConfirmText(row) }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="备注">
                <template #default="{ row }">
                  <span class="text-muted">{{ row.remark || row.note || row.status || row._groupTitle || '—' }}</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120" fixed="right" align="right">
                <template #default="{ row }">
                  <a class="link" @click="handleViewDetail(row)">查看详情</a>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>

        <EmptyState
          v-if="Object.keys(salaryByYear).length === 0"
          type="data"
          title="暂无工资记录"
          description="工资数据会在每月结算后显示"
        />
      </div>
    </section>

    <!-- ============ 佣金计算规则 ============ -->
    <section class="card">
      <div class="card-head">
        <div class="card-title">佣金计算规则</div>
        <div class="card-meta">{{ isNewRules ? '新规则 · 2026-04 起' : '旧规则 · 2026-04 前' }}</div>
      </div>
      <div class="card-body">
        <!-- 新规则：两条 -->
        <div v-if="isNewRules" class="rules">
          <div class="rule">
            <div class="rule-head">
              <div class="rule-no">Ⅰ</div>
              <div class="rule-title">达标</div>
            </div>
            <div class="rule-cond">总佣金 ≥ 当月底薪</div>
            <div class="rule-rate">提成 50%</div>
          </div>
          <div class="rule">
            <div class="rule-head">
              <div class="rule-no">Ⅱ</div>
              <div class="rule-title">基础</div>
            </div>
            <div class="rule-cond">总佣金 &lt; 当月底薪</div>
            <div class="rule-rate">提成 30%</div>
          </div>
        </div>

        <!-- 旧规则：四条 -->
        <div v-else class="rules rules-4">
          <div class="rule">
            <div class="rule-head">
              <div class="rule-no">Ⅰ</div>
              <div class="rule-title">高业绩</div>
            </div>
            <div class="rule-cond">总佣金 ≥ 底薪 × 2</div>
            <div class="rule-rate">提成 70%（逾期 50%）</div>
          </div>
          <div class="rule">
            <div class="rule-head">
              <div class="rule-no">Ⅱ</div>
              <div class="rule-title">达标</div>
            </div>
            <div class="rule-cond">总佣金 ≥ 当月底薪</div>
            <div class="rule-rate">提成 50%</div>
          </div>
          <div class="rule">
            <div class="rule-head">
              <div class="rule-no">Ⅲ</div>
              <div class="rule-title">基础</div>
            </div>
            <div class="rule-cond">底薪 / 2 ≤ 总佣金 &lt; 底薪</div>
            <div class="rule-rate">提成 30%</div>
          </div>
          <div class="rule">
            <div class="rule-head">
              <div class="rule-no">Ⅳ</div>
              <div class="rule-title">保底</div>
            </div>
            <div class="rule-cond">总佣金 &lt; 底薪 / 2</div>
            <div class="rule-rate">提成 0%（只发底薪）</div>
          </div>
        </div>
      </div>
    </section>

    <SalaryDetailDialog
      v-model:visible="detailDialogVisible"
      :user-id="selectedUserId"
      :date="selectedDate"
      @confirmed="handleDetailConfirmed"
    />
  </div>
</template>

<style scoped>
.page-wrap {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ---------- 设置卡内 EP 表单视觉对齐 ---------- */
.setting-form :deep(.el-form-item) {
  margin-bottom: 0;
}
.setting-form :deep(.el-form-item__label) {
  display: none;
}
.setting-form :deep(.el-input__wrapper),
.setting-form :deep(.el-input-number .el-input__wrapper) {
  background: var(--bg);
  border: 1px solid var(--border-soft);
  border-radius: var(--r-md);
  box-shadow: none !important;
  transition: border-color .12s, box-shadow .12s;
}
.setting-form :deep(.el-input__wrapper:hover) {
  border-color: var(--border-strong);
}
.setting-form :deep(.el-input__wrapper.is-focus),
.setting-form :deep(.el-input-number .el-input__wrapper.is-focus) {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-bg) !important;
}

/* ---------- el-table 视觉对齐原型 .t ---------- */
.t-style :deep(.el-table__inner-wrapper) {
  background: var(--bg);
}
.t-style :deep(.el-table th.el-table__cell) {
  background: var(--bg-soft);
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: .03em;
  color: var(--fg-3);
  padding: 10px 16px;
  border-bottom: 1px solid var(--border-soft);
}
.t-style :deep(.el-table td.el-table__cell) {
  padding: 13px 16px;
  font-size: 13px;
  color: var(--fg-2);
  border-bottom: 1px solid var(--border-soft);
}
.t-style :deep(.el-table .el-table__row:hover > td.el-table__cell) {
  background: var(--bg-hover);
}
.t-style :deep(.el-table::before),
.t-style :deep(.el-table::after) {
  display: none;
}

.commission-value {
  color: var(--accent-fg);
  font-weight: 600;
}

.overdue-tag {
  margin-left: 4px;
  font-size: 11px;
  color: var(--warning-fg);
}

.text-muted {
  color: var(--fg-4);
}

.accent-text {
  color: var(--accent-fg);
  font-weight: 600;
}

/* ---------- 旧规则四列网格 ---------- */
.rules.rules-4 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

/* ---------- 年度分组内表格特殊处理 ---------- */
.year-body .t-style :deep(.el-table th.el-table__cell) {
  background: transparent;
}
.year-body .t-style :deep(.el-table .el-table__row > td.el-table__cell) {
  background: var(--bg);
}

/* ---------- 顶栏按钮 EP 风格对齐 ---------- */
.page-actions :deep(.el-button) {
  height: 32px;
  padding: 0 12px;
  background: var(--bg);
  border: 1px solid var(--border-soft);
  border-radius: var(--r-md);
  color: var(--fg-2);
  font-size: 13px;
  font-weight: 500;
  box-shadow: none;
}
.page-actions :deep(.el-button:hover) {
  border-color: var(--border-strong);
  color: var(--fg);
  background: var(--bg);
}
.page-actions :deep(.el-button .el-icon) {
  margin-right: 4px;
}

@media (max-width: 900px) {
  .rules.rules-4 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .rules.rules-4 {
    grid-template-columns: 1fr;
  }
}
</style>
