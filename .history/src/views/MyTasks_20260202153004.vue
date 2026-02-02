<script setup lang="ts">
import { ref, reactive } from 'vue'
import { getMyTaskList } from '@/api/project'
import type { TaskOrder } from '@/types'

// 任务列表
const tasks = ref<TaskOrder[]>([])
const loading = ref(false)
const total = ref(0)

// 筛选条件
const filters = reactive({
  name: '',
  status: '',
  hall_type: '',
  enddatatime: [] as string[],
  performtime: [] as [Date, Date] | [],
  completiontime: [] as [Date, Date] | []
})

// 分页
const pagination = reactive({
  page: 1,
  limit: 10
})

// 日期快捷选项
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

// 格式化日期为 YYYY-MM-DD HH:mm:ss
function formatDateTime(date: Date, isEnd = false): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const time = isEnd ? '23:59:59' : '00:00:00'
  return `${year}-${month}-${day} ${time}`
}

// 查询任务列表
async function fetchTasks() {
  loading.value = true
  try {
    // 格式化日期参数
    const performtimeParam = filters.performtime.length === 2
      ? [formatDateTime(filters.performtime[0]), formatDateTime(filters.performtime[1], true)]
      : []
    const completiontimeParam = filters.completiontime.length === 2
      ? [formatDateTime(filters.completiontime[0]), formatDateTime(filters.completiontime[1], true)]
      : []

    const res = await getMyTaskList({
      page: pagination.page,
      limit: pagination.limit,
      status: filters.status,
      name: filters.name,
      orderType: '',
      hall_type: filters.hall_type,
      order: 'desc',
      sort: 'change_time',
      bountymoney: [],
      completiontime: completiontimeParam,
      enddatatime: filters.enddatatime || [],
      ordertime: [],
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

// 搜索
function handleSearch() {
  pagination.page = 1
  fetchTasks()
}

// 重置筛选
function handleReset() {
  filters.name = ''
  filters.status = ''
  filters.hall_type = ''
  filters.enddatatime = []
  filters.performtime = []
  filters.completiontime = []
  pagination.page = 1
  fetchTasks()
}

// 分页变化
function handlePageChange(page: number) {
  pagination.page = page
  fetchTasks()
}

function handleSizeChange(size: number) {
  pagination.limit = size
  pagination.page = 1
  fetchTasks()
}

// 逾期状态样式
function getOverdueType(task: TaskOrder): string {
  const syday = typeof task.syday === 'string' ? parseInt(task.syday) : task.syday
  if (syday < 0) return 'danger'
  return 'success'
}

function getOverdueText(task: TaskOrder): string {
  const syday = typeof task.syday === 'string' ? parseInt(task.syday) : task.syday
  if (syday < 0) return `逾期 ${Math.abs(syday)} 天`
  if (syday > 0) return `提前 ${syday} 天`
  return '正常'
}

// 状态颜色映射
const statusColorMap: Record<string, string> = {
  '待接单': '#fa367a',
  '已接单': '#f08b25',
  '发布中': '#fa367a',
  '已发布': '#fa367a',
  '已逾期': '#d7000f',
  '核对中': '#409eff',
  '待质检': '#409eff',
  '已完结': '#3b9b4f',
  '已驳回': '#d7000f'
}

function getStatusColor(status: string): string {
  return statusColorMap[status] || '#909399'
}

// 初始化加载
fetchTasks()
</script>

<template>
  <div class="my-tasks">
    <!-- 筛选区域 -->
    <el-card shadow="never" class="filter-card">
      <el-form :inline="true" class="filter-form" @submit.prevent="handleSearch">
        <el-form-item label="项目名称">
          <el-input v-model="filters.name" placeholder="搜索项目名称" clearable />
        </el-form-item>

        <el-form-item label="任务状态">
          <el-select v-model="filters.status" placeholder="全部状态" clearable style="width: 120px">
            <el-option label="待执行" value="1" />
            <el-option label="执行中" value="2" />
            <el-option label="已完结" value="3" />
          </el-select>
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
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon> 查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon> 重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 任务列表 -->
    <el-card shadow="never" class="table-card">
      <template #header>
        <div class="table-header">
          <span>任务列表</span>
          <span class="total-text">共 {{ total }} 条</span>
        </div>
      </template>

      <el-table :data="tasks" v-loading="loading" stripe>
        <el-table-column prop="hall_customer" label="项目名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="statustxt" label="状态" width="90">
          <template #default="{ row }">
            <el-tag size="small" :color="getStatusColor(row.statustxt)" style="color: #fff; border: none;">
              {{ row.statustxt }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="佣金" width="110">
          <template #default="{ row }">
            {{ parseFloat(row.bountymoney || '0').toFixed(2) }} 元
          </template>
        </el-table-column>
        <el-table-column prop="hallTypeTitle" label="任务类型" width="100" show-overflow-tooltip />
        <el-table-column prop="performtime" label="接单时间" width="170" />
        <el-table-column prop="enddatatime" label="截止时间" width="170" />
        <el-table-column prop="completiontime" label="完结时间" width="170" />
        <el-table-column label="逾期状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getOverdueType(row)" size="small">
              {{ getOverdueText(row) }}
            </el-tag>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="暂无任务数据" />
        </template>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrap" v-if="total > 0">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script lang="ts">
import { Search, Refresh } from '@element-plus/icons-vue'
export default {
  components: { Search, Refresh }
}
</script>

<style scoped>
.my-tasks {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 0;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-text {
  font-size: 13px;
  color: #999;
  font-weight: normal;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

/* 手机端适配 */
@media screen and (max-width: 768px) {
  .my-tasks {
    gap: 10px;
  }

  .filter-card :deep(.el-form--inline .el-form-item) {
    display: flex;
    margin-right: 0;
    margin-bottom: 10px;
    width: 100%;
  }

  .filter-card :deep(.el-form--inline) {
    display: flex;
    flex-direction: column;
  }

  .filter-card :deep(.el-input),
  .filter-card :deep(.el-select),
  .filter-card :deep(.el-date-editor) {
    width: 100% !important;
  }

  .pagination-wrap {
    justify-content: center;
  }

  .pagination-wrap :deep(.el-pagination) {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
