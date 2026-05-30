<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'
import { getMyTaskList, getProjectDetail } from '@/api/project'
import type { TaskOrder } from '@/types'
import EmptyState from '@/components/EmptyState.vue'
import TaskDetailDialog from '@/components/TaskDetailDialog.vue'

// 任务列表
const tasks = ref<TaskOrder[]>([])
const loading = ref(false)
const total = ref(0)
const isMobile = ref(false)
const viewMode = ref<'table' | 'card'>('table')

// 详情弹窗
const detailVisible = ref(false)
const detailLoading = ref(false)
const currentTask = ref<any>(null)

function checkMobile() {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

const paginationLayout = computed(() => {
  return isMobile.value ? 'prev, next' : 'total, sizes, prev, pager, next, jumper'
})

const filters = reactive({
  name: '',
  status: '',
  hall_type: '',
  orderType: '',
  moneyRange: [null, null] as [number | null, number | null],
  enddatatime: [] as string[],
  ordertime: [] as [Date, Date] | [],
  performtime: [] as [Date, Date] | [],
  completiontime: [] as [Date, Date] | []
})

const pagination = reactive({
  page: 1,
  limit: 12
})

const dateShortcuts = [
  {
    text: '本月',
    value: () => {
      const now = new Date()
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
      return [start, end]
    }
  },
  {
    text: '上月',
    value: () => {
      const now = new Date()
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
      return [start, end]
    }
  },
  {
    text: '近3个月',
    value: () => {
      const now = new Date()
      const start = new Date(now.getFullYear(), now.getMonth() - 2, 1)
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
      return [start, end]
    }
  },
  {
    text: '近半年',
    value: () => {
      const now = new Date()
      const start = new Date(now.getFullYear(), now.getMonth() - 5, 1)
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
      return [start, end]
    }
  },
  {
    text: '今年',
    value: () => {
      const now = new Date()
      const start = new Date(now.getFullYear(), 0, 1)
      const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59)
      return [start, end]
    }
  }
]

function formatDateTime(date: Date, isEnd = false): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const time = isEnd ? '23:59:59' : '00:00:00'
  return `${year}-${month}-${day} ${time}`
}

async function fetchTasks() {
  loading.value = true
  try {
    const performtimeParam = filters.performtime.length === 2
      ? [formatDateTime(filters.performtime[0]), formatDateTime(filters.performtime[1], true)]
      : []
    const completiontimeParam = filters.completiontime.length === 2
      ? [formatDateTime(filters.completiontime[0]), formatDateTime(filters.completiontime[1], true)]
      : []
    const ordertimeParam = filters.ordertime.length === 2
      ? [formatDateTime(filters.ordertime[0]), formatDateTime(filters.ordertime[1], true)]
      : []

    // 接单金额区间（单边时上下限取同值）
    const moneyNums = filters.moneyRange.filter((v): v is number => typeof v === 'number')
    let bountymoney: number[] = []
    if (moneyNums.length === 2) {
      bountymoney = [Math.min(moneyNums[0]!, moneyNums[1]!), Math.max(moneyNums[0]!, moneyNums[1]!)]
    } else if (moneyNums.length === 1) {
      bountymoney = [moneyNums[0]!, moneyNums[0]!]
    }

    const res = await getMyTaskList({
      page: pagination.page,
      limit: pagination.limit,
      status: filters.status,
      name: filters.name,
      orderType: filters.orderType,
      hall_type: filters.hall_type,
      order: 'desc',
      sort: 'change_time',
      bountymoney,
      completiontime: completiontimeParam,
      enddatatime: filters.enddatatime || [],
      ordertime: ordertimeParam,
      performtime: performtimeParam
    })

    if (res.data) {
      tasks.value = res.data.data || []
      total.value = res.data.total || 0
    }
  } catch (error) {
    console.error('获取任务列表失败:', error)
    tasks.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.page = 1
  fetchTasks()
}

function handleReset() {
  filters.name = ''
  filters.status = ''
  filters.hall_type = ''
  filters.orderType = ''
  filters.moneyRange = [null, null]
  filters.enddatatime = []
  filters.ordertime = []
  filters.performtime = []
  filters.completiontime = []
  pagination.page = 1
  fetchTasks()
}

function handlePageChange(page: number) {
  pagination.page = page
  fetchTasks()
}

function handleSizeChange(size: number) {
  pagination.limit = size
  pagination.page = 1
  fetchTasks()
}

// 查看任务详情
async function handleDetail(task: TaskOrder) {
  detailLoading.value = true
  detailVisible.value = true
  try {
    const res = await getProjectDetail({ id: task.id })
    currentTask.value = res.code === 1 ? (res.data || task) : task
  } catch (error) {
    console.error('获取任务详情失败:', error)
    currentTask.value = task
  } finally {
    detailLoading.value = false
  }
}

// 逾期 pill
function getOverduePill(task: TaskOrder): string {
  const syday = typeof task.syday === 'string' ? parseInt(task.syday) : task.syday
  if (syday < 0) return 'pill-danger'
  if (syday > 0) return 'pill-info'
  return 'pill-muted'
}

function getOverdueText(task: TaskOrder): string {
  const syday = typeof task.syday === 'string' ? parseInt(task.syday) : task.syday
  if (syday < 0) return `逾期 ${Math.abs(syday)} 天`
  if (syday > 0) return `提前 ${syday} 天`
  return '正常'
}

// 状态 pill 映射
const statusPillMap: Record<string, string> = {
  '待接单': 'pill-info',
  '已接单': 'pill-warning',
  '发布中': 'pill-info',
  '已发布': 'pill-info',
  '已逾期': 'pill-danger',
  '核对中': 'pill-info',
  '待质检': 'pill-info',
  '已完结': 'pill-success',
  '已驳回': 'pill-danger'
}

function getStatusPill(status: string): string {
  return statusPillMap[status] || 'pill-muted'
}

// 格式化备注（后端可能返回数组或字符串）
function formatDescription(desc: any): string {
  if (Array.isArray(desc)) {
    return desc
      .map((d) => (d && d.condition_title ? `${d.condition_title}：${d.condition}` : d))
      .join('；')
  }
  return desc || ''
}

function getSummaries({ columns, data }: { columns: any[]; data: TaskOrder[] }) {
  const sums: string[] = []
  columns.forEach((column, index) => {
    if (index === 0) {
      sums[index] = '合计'
      return
    }
    if (column.property === 'bountymoney') {
      const total = data.reduce((sum, row) => {
        return sum + parseFloat(row.bountymoney || '0')
      }, 0)
      sums[index] = '¥' + total.toFixed(2)
    } else if (column.property === 'base_bountymoney') {
      const total = data.reduce((sum, row) => {
        return sum + parseFloat(row.base_bountymoney || row.bountymoney || '0')
      }, 0)
      sums[index] = '¥' + total.toFixed(2)
    } else if (column.property === 'add_bountymoney') {
      const total = data.reduce((sum, row) => {
        return sum + parseFloat(row.add_bountymoney || '0')
      }, 0)
      sums[index] = '¥' + total.toFixed(2)
    } else {
      sums[index] = ''
    }
  })
  return sums
}

fetchTasks()
</script>

<template>
  <div class="page-wrap">
    <!-- 页头 -->
    <div class="page-head">
      <div>
        <h1 class="page-title">我的任务</h1>
        <div class="page-sub">按时间、状态、项目名筛选个人接单记录</div>
      </div>
    </div>

    <!-- 筛选区 -->
    <section class="card">
      <div class="card-body">
        <el-form :inline="true" class="filter-form" @submit.prevent="handleSearch">
          <el-form-item label="项目名称">
            <el-input v-model="filters.name" placeholder="搜索项目名称" clearable />
          </el-form-item>

          <el-form-item label="项目/任务">
            <el-select v-model="filters.orderType" placeholder="全部" clearable style="width: 120px">
              <el-option label="项目" value="1" />
              <el-option label="任务" value="2" />
            </el-select>
          </el-form-item>

          <el-form-item label="任务状态">
            <el-select v-model="filters.status" placeholder="全部状态" clearable style="width: 130px">
              <el-option label="待执行" value="1" />
              <el-option label="执行中" value="2" />
              <el-option label="已完结" value="3" />
            </el-select>
          </el-form-item>

          <el-form-item label="接单金额">
            <div class="money-range">
              <el-input-number v-model="filters.moneyRange[0]" :min="0" :controls="false" placeholder="最低" />
              <span class="range-sep">-</span>
              <el-input-number v-model="filters.moneyRange[1]" :min="0" :controls="false" placeholder="最高" />
            </div>
          </el-form-item>

          <el-form-item label="发布时间">
            <el-date-picker
              v-model="filters.ordertime"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :shortcuts="dateShortcuts"
            />
          </el-form-item>

          <el-form-item label="接单时间">
            <el-date-picker
              v-model="filters.performtime"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :shortcuts="dateShortcuts"
            />
          </el-form-item>

          <el-form-item label="完结时间">
            <el-date-picker
              v-model="filters.completiontime"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :shortcuts="dateShortcuts"
            />
          </el-form-item>

          <el-form-item label="截止时间">
            <el-date-picker
              v-model="filters.enddatatime"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD HH:mm:ss"
              :shortcuts="dateShortcuts"
            />
          </el-form-item>

          <el-form-item>
            <el-button class="btn btn-primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              <span>查询</span>
            </el-button>
            <el-button class="btn" @click="handleReset">
              <el-icon><Refresh /></el-icon>
              <span>重置</span>
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </section>

    <!-- 任务列表 -->
    <section class="card table-card">
      <div class="card-head">
        <div class="card-title">任务列表</div>
        <div class="card-head-right">
          <span class="card-meta">共 {{ total }} 条记录</span>
          <el-radio-group v-model="viewMode" size="small">
            <el-radio-button value="table">表格</el-radio-button>
            <el-radio-button value="card">卡片</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <div class="table-wrapper" v-if="viewMode === 'table'">
        <el-table
          :data="tasks"
          v-loading="loading"
          class="t-style"
          show-summary
          :summary-method="getSummaries"
        >
          <el-table-column prop="hall_customer" label="项目名称" min-width="150" show-overflow-tooltip />
          <el-table-column prop="statustxt" label="状态" width="100">
            <template #default="{ row }">
              <span class="pill" :class="getStatusPill(row.statustxt)">{{ row.statustxt }}</span>
            </template>
          </el-table-column>
          <el-table-column label="项目/任务佣金" align="center">
            <el-table-column prop="bountymoney" label="总佣金" width="110" align="right">
              <template #default="{ row }">
                <span class="num">¥{{ parseFloat(row.bountymoney || '0').toFixed(2) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="base_bountymoney" label="基础佣金" width="110" align="right">
              <template #default="{ row }">
                <span class="num">¥{{ parseFloat(row.base_bountymoney || row.bountymoney || '0').toFixed(2) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="add_bountymoney" label="加价佣金" width="110" align="right">
              <template #default="{ row }">
                <span class="num">¥{{ parseFloat(row.add_bountymoney || '0').toFixed(2) }}</span>
              </template>
            </el-table-column>
          </el-table-column>
          <el-table-column prop="hallTypeTitle" label="任务类型" width="100" show-overflow-tooltip />
          <el-table-column prop="ordertime" label="开始日期" width="170" />
          <el-table-column prop="performtime" label="接单时间" width="170" />
          <el-table-column prop="enddatatime" label="截止时间" width="170" />
          <el-table-column prop="hall_duration" label="工期" width="90" align="center">
            <template #default="{ row }">
              {{ row.hall_duration ? row.hall_duration + ' 个工作日' : '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="completiontime" label="完结时间" width="170" />
          <el-table-column label="逾期" width="120">
            <template #default="{ row }">
              <span class="pill" :class="getOverduePill(row)">{{ getOverdueText(row) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="备注" min-width="180" show-overflow-tooltip>
            <template #default="{ row }">
              {{ formatDescription(row.description) || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="90" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="handleDetail(row)">详情</el-button>
            </template>
          </el-table-column>
          <template #empty>
            <EmptyState
              type="search"
              title="暂无任务数据"
              description="调整筛选条件或等待新任务分配"
            />
          </template>
        </el-table>
      </div>
      <div class="card-view" v-else v-loading="loading">
        <EmptyState
          v-if="tasks.length === 0 && !loading"
          type="search"
          title="暂无任务数据"
          description="调整筛选条件或等待新任务分配"
        />
        <div v-else class="my-task-grid">
          <div v-for="task in tasks" :key="task.id" class="my-task-card">
            <div class="mtc-head">
              <span class="mtc-name">{{ task.hall_customer || '-' }}</span>
              <span class="pill" :class="getStatusPill(task.statustxt)">{{ task.statustxt }}</span>
            </div>
            <div class="mtc-body">
              <div class="mtc-row"><span class="k">类型</span><span class="v">{{ task.hallTypeTitle || '-' }}</span></div>
              <div class="mtc-row"><span class="k">接单</span><span class="v">{{ task.performtime || '-' }}</span></div>
              <div class="mtc-row"><span class="k">截止</span><span class="v">{{ task.enddatatime || '-' }}</span></div>
              <div class="mtc-row"><span class="k">完结</span><span class="v">{{ task.completiontime || '-' }}</span></div>
              <div class="mtc-row">
                <span class="k">逾期</span>
                <span class="pill" :class="getOverduePill(task)">{{ getOverdueText(task) }}</span>
              </div>
              <div class="mtc-row" v-if="formatDescription(task.description)">
                <span class="k">备注</span>
                <span class="v">{{ formatDescription(task.description) }}</span>
              </div>
            </div>
            <div class="mtc-money">
              <span>总佣金 <b class="num primary">¥{{ parseFloat(task.bountymoney || '0').toFixed(2) }}</b></span>
              <span>基础 <b class="num">¥{{ parseFloat(task.base_bountymoney || task.bountymoney || '0').toFixed(2) }}</b></span>
              <span>加价 <b class="num">¥{{ parseFloat(task.add_bountymoney || '0').toFixed(2) }}</b></span>
            </div>
            <div class="mtc-foot">
              <el-button link type="primary" @click="handleDetail(task)">详情</el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination-wrap" v-if="total > 0">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          :layout="paginationLayout"
          background
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </section>

    <TaskDetailDialog
      v-model:visible="detailVisible"
      :task="currentTask"
      :loading="detailLoading"
    />
  </div>
</template>

<style scoped>
.page-wrap {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: calc(100vh - 100px);
}

.table-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.table-wrapper {
  flex: 1;
  overflow: auto;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 0;
}

.filter-form :deep(.el-form-item) {
  margin-bottom: 12px;
}

.money-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.money-range :deep(.el-input-number) {
  width: 110px;
}

.range-sep {
  color: var(--fg-3);
}

.filter-form :deep(.el-input__wrapper),
.filter-form :deep(.el-select .el-select__wrapper) {
  background: var(--bg);
  border: 1px solid var(--border-soft);
  border-radius: var(--r-md);
  box-shadow: none !important;
}

.filter-form :deep(.el-input__wrapper:hover) {
  border-color: var(--border-strong);
}

.filter-form :deep(.el-input__wrapper.is-focus),
.filter-form :deep(.el-select .el-select__wrapper.is-focused) {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-bg) !important;
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  padding: 16px 20px;
  border-top: 1px solid var(--border-soft);
  flex-shrink: 0;
}

.card-head-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.card-view {
  flex: 1;
  overflow: auto;
  padding: 16px;
}

.my-task-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.my-task-card {
  display: flex;
  flex-direction: column;
  background: var(--bg);
  border: 1px solid var(--border-soft);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-1);
  padding: 16px;
  transition: box-shadow .15s, border-color .15s;
}

.my-task-card:hover {
  border-color: var(--border-strong);
  box-shadow: var(--shadow-2);
}

.mtc-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  padding-bottom: 10px;
  margin-bottom: 10px;
  border-bottom: 1px solid var(--border-soft);
}

.mtc-name {
  font-weight: 600;
  color: var(--fg);
  font-size: 14px;
  line-height: 1.4;
}

.mtc-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
}

.mtc-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mtc-row .k {
  color: var(--fg-3);
  width: 42px;
  flex-shrink: 0;
}

.mtc-row .v {
  color: var(--fg-2);
  word-break: break-all;
}

.mtc-money {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
  margin: 12px 0;
  padding: 10px 12px;
  background: var(--bg-soft);
  border: 1px solid var(--border-soft);
  border-radius: var(--r-md);
  font-size: 12.5px;
  color: var(--fg-3);
}

.mtc-money .num {
  font-weight: 600;
  color: var(--fg);
}

.mtc-money .num.primary {
  color: var(--accent-fg);
}

.mtc-foot {
  display: flex;
  justify-content: flex-end;
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px solid var(--border-soft);
}

/* el-table 视觉对齐 */
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
.t-style :deep(.el-table__footer-wrapper td.el-table__cell) {
  background: var(--bg-soft);
  font-weight: 600;
  color: var(--fg);
}

/* 手机端 */
@media screen and (max-width: 768px) {
  .page-wrap {
    gap: 12px;
    height: auto;
  }

  .table-card {
    flex: none;
    overflow: visible;
  }

  .table-wrapper {
    flex: none;
    overflow: visible;
  }

  .table-wrapper :deep(.el-table) {
    height: auto !important;
  }

  .filter-form :deep(.el-form-item) {
    width: 100%;
    margin-right: 0;
  }

  .filter-form :deep(.el-input),
  .filter-form :deep(.el-select),
  .filter-form :deep(.el-date-editor) {
    width: 100% !important;
  }

  .pagination-wrap {
    padding: 12px;
  }

  .pagination-wrap :deep(.el-pagination) {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
