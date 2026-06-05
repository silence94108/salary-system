<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getTaskHallList, checkTaskStatus, takeTask } from '@/api/project'
import type { TaskOrder } from '@/types'
import TaskDetailDrawer from '@/components/TaskDetailDrawer.vue'

// 任务列表
const tasks = ref<TaskOrder[]>([])
const loading = ref(false)
const total = ref(0)

// 详情抽屉
const detailVisible = ref(false)
const detailTaskId = ref<number | string>('')
const detailStartWithForm = ref(false) // 打开详情时是否直接进入接取表单

// 筛选条件
const filters = reactive({
  name: '',
  hall_type: ''
})

// 分页
const pagination = reactive({
  page: 1,
  limit: 9
})

// 查询任务列表
async function fetchTasks() {
  loading.value = true
  try {
    const res = await getTaskHallList({
      page: pagination.page,
      limit: pagination.limit,
      status: '',
      name: filters.name,
      orderType: '',
      hall_type: filters.hall_type,
      order: 'desc',
      sort: 'id',
      enterpriseSide: 'pc',
      bountymoney: [],
      completiontime: [],
      enddatatime: [],
      ordertime: [],
      performtime: []
    })

    if (res.data) {
      tasks.value = res.data.data || []
      total.value = res.data.total || 0
    }
  } catch (error) {
    console.error('获取任务大厅列表失败:', error)
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
  filters.hall_type = ''
  pagination.page = 1
  fetchTasks()
}

// 分页变化
function handlePageChange(page: number) {
  pagination.page = page
  fetchTasks()
}

// 获取逾期 pill class
function getOverduePill(task: any): string {
  if (task.syday < 0) return 'pill-danger'
  return 'pill-warning'
}

// 获取逾期文本
function getOverdueText(task: any): string {
  if (task.syday < 0) return `逾期 ${Math.abs(task.syday)} 天`
  return `剩余 ${task.syday} 天`
}

// 接取任务
async function handleReceive(task: TaskOrder) {
  // 对于任务类型(orderType === 1)，需要先检查再打开详情弹窗填写备注
  if (task.orderType === 1) {
    // 先检查是否有执行中的任务
    try {
      const checkRes = await checkTaskStatus()
      if (checkRes.code === 1 && checkRes.data !== 0) {
        ElMessageBox.alert(
          '您当前有执行中任务未申请完结，无法申请接取新任务。请及时完成并申请完结执行中的任务，即可接取新任务。',
          '正在执行其他任务',
          { type: 'warning' }
        )
        return
      }
      // 打开详情弹窗并显示表单
      openDetailWithForm(task)
    } catch (error) {
      console.error('检查任务状态失败:', error)
      ElMessage.error('检查任务状态失败，请稍后再试')
    }
    return
  }

  // 项目类型(orderType === 2 或其他)直接确认接取，不检查执行中任务
  try {
    // 确认接取
    await ElMessageBox.confirm(
      '接单后需要根据内容指派，请及时把控工期进度。',
      '确认接取',
      {
        confirmButtonText: '确定接单',
        cancelButtonText: '取消',
        type: 'info'
      }
    )

    // 接取任务
    const res = await takeTask({ id: task.id, remark: '1' })
    if (res.code === 1 || res.code === 0) {
      ElMessage.success(res.msg || '接单成功，祝您工作愉快！')
      // 从列表中移除已接取的任务
      tasks.value = tasks.value.filter(t => t.id !== task.id)
      total.value = total.value - 1
      // 刷新列表
      fetchTasks()
    } else {
      ElMessage.error(res.msg || '接单失败，请稍后再试')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('接取任务失败:', error)
      ElMessage.error('接取任务失败，请稍后再试')
    }
  }
}

// 打开详情弹窗（带表单，用于接取）
function openDetailWithForm(task: TaskOrder) {
  detailStartWithForm.value = true
  detailTaskId.value = task.id
  detailVisible.value = true
}

// 查看详情（仅查看，不带表单）
function handleDetail(task: TaskOrder) {
  detailStartWithForm.value = false
  detailTaskId.value = task.id
  detailVisible.value = true
}

// 接取成功后从列表移除并刷新
function onTaken(taskId: number) {
  tasks.value = tasks.value.filter(t => t.id !== taskId)
  total.value = total.value - 1
  fetchTasks()
}

// 初始化加载
fetchTasks()
</script>

<template>
  <div class="page-wrap">
    <!-- 页头 -->
    <div class="page-head">
      <div>
        <h1 class="page-title">任务大厅</h1>
        <div class="page-sub">浏览待接任务，点击「接取」开启新工单</div>
      </div>
    </div>

    <!-- 筛选区 -->
    <section class="card">
      <div class="card-body">
        <el-form :inline="true" class="filter-form" @submit.prevent="handleSearch">
          <el-form-item label="项目名称">
            <el-input v-model="filters.name" placeholder="搜索项目名称" clearable style="width: 220px" />
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

    <!-- 任务卡片列表 -->
    <div class="task-list" v-loading="loading">
      <div v-if="tasks.length === 0 && !loading" class="empty-wrapper">
        <el-empty description="暂无待接任务" />
      </div>

      <div v-else class="task-grid">
        <el-card v-for="task in tasks" :key="task.id" class="task-card" shadow="hover">
          <!-- 卡片头部 -->
          <div class="tc-head">
            <div class="header-left">
              <span v-if="task.timeout" class="timeout-tag">{{ task.timeout }}</span>
            </div>
            <div class="header-right">
              <span v-if="task.syday" class="pill" :class="getOverduePill(task)">{{ getOverdueText(task) }}</span>
              <span class="pill pill-info">{{ task.statusInfo }}</span>
            </div>
          </div>

          <!-- 项目名称 -->
          <div class="project-name">
            接取后可见项目全称
          </div>

          <!-- 项目信息 -->
          <div class="project-info">
            <div class="info-row">
              <span class="label">项目类型：</span>
              <span class="value">{{ task.hallTypeTitle }}</span>
            </div>
            <div class="info-row">
              <span class="label">项目工期：</span>
              <span class="value">
                开始日期：{{ task.ordertime?.split(' ')[0] || '-' }}
              </span>
            </div>
            <div class="info-row">
              <span class="label"></span>
              <span class="value">
                截止日期：{{ task.enddatatime || '-' }}
              </span>
              <span class="duration" v-if="task.hall_duration">
                工期：{{ task.hall_duration }} 个工作日
              </span>
            </div>
          </div>

          <!-- 金额信息 -->
          <div class="money-info">
            <span class="label">金额：</span>
            <span>总佣金：<span class="value primary num">¥{{ parseFloat(task.hall_total_money || '0').toFixed(2) }}</span></span>
            <span>基础佣金：<span class="value num">¥{{ parseFloat(task.hall_money || '0').toFixed(2) }}</span></span>
            <span>加价佣金：<span class="value warning num">¥{{ parseFloat(task.hall_user_money || '0').toFixed(2) }}</span></span>
          </div>

          <!-- 备注 -->
          <div class="remark" v-if="task.description">
            <span class="label">备注：</span>
            <span class="value">{{ task.description }}</span>
          </div>

          <!-- 操作按钮 -->
          <div class="card-footer">
            <el-button class="btn btn-primary" @click="handleReceive(task)">接取</el-button>
            <el-button class="btn" @click="handleDetail(task)">详情</el-button>
          </div>
        </el-card>
      </div>

      <!-- 分页 -->
      <div class="pagination-wrap" v-if="total > 0">
        <el-pagination
          v-model:current-page="pagination.page"
          :page-size="pagination.limit"
          :total="total"
          layout="total, prev, pager, next"
          background
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 任务详情抽屉 -->
    <TaskDetailDrawer
      v-model:visible="detailVisible"
      :task-id="detailTaskId"
      list-type="hall"
      allow-take
      :start-with-form="detailStartWithForm"
      @taken="onTaken"
    />
  </div>
</template>

<style scoped>
.page-wrap {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 0;
}

.filter-form :deep(.el-form-item) {
  margin-bottom: 0;
}

.filter-form :deep(.el-input__wrapper) {
  background: var(--bg);
  border: 1px solid var(--border-soft);
  border-radius: var(--r-md);
  box-shadow: none !important;
}

.filter-form :deep(.el-input__wrapper:hover) {
  border-color: var(--border-strong);
}

.filter-form :deep(.el-input__wrapper.is-focus) {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-bg) !important;
}

.task-list {
  flex: 1;
  min-height: 200px;
}

.empty-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}

.task-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 16px;
}

.task-card {
  background: var(--bg);
  border-radius: var(--r-lg);
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-soft);
  box-shadow: var(--shadow-1);
  transition: box-shadow .15s, border-color .15s;
}

.task-card:hover {
  border-color: var(--border-strong);
  box-shadow: var(--shadow-2);
}

.task-card :deep(.el-card__body) {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 20px;
}

.task-card .tc-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-soft);
}

.header-right {
  display: flex;
  gap: 6px;
}

.timeout-tag {
  color: var(--color-danger);
  font-size: 11.5px;
  font-weight: 500;
}

.project-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--accent-fg);
  text-align: center;
  margin-bottom: 14px;
  padding: 8px 0;
  background: var(--accent-bg);
  border-radius: var(--r-md);
}

.project-info {
  margin-bottom: 12px;
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  font-size: 13px;
}

.info-row .label {
  color: var(--fg-3);
  width: 70px;
  flex-shrink: 0;
}

.info-row .value {
  color: var(--fg);
}

.info-row .duration {
  margin-left: auto;
  color: var(--fg-3);
}

.money-info {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 16px;
  margin-bottom: 12px;
  padding: 12px;
  background: var(--bg-soft);
  border-radius: var(--r-md);
  font-size: 13px;
  color: var(--fg-3);
  border: 1px solid var(--border-soft);
}

.money-info .label {
  color: var(--fg-3);
}

.money-info .value {
  font-weight: 600;
  color: var(--fg);
}

.money-info .value.primary {
  color: var(--accent-fg);
}

.money-info .value.warning {
  color: var(--warning-fg);
}

.remark {
  font-size: 13px;
  margin-bottom: 12px;
  color: var(--fg-3);
}

.remark .label {
  color: var(--fg-3);
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--border-soft);
  margin-top: auto;
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

/* 手机端适配 */
@media screen and (max-width: 768px) {
  .page-wrap {
    gap: 12px;
  }

  .filter-form :deep(.el-form-item) {
    display: flex;
    margin-right: 0;
    margin-bottom: 8px;
    width: 100%;
  }

  .filter-form :deep(.el-form--inline) {
    display: flex;
    flex-direction: column;
  }

  .filter-form :deep(.el-input) {
    width: 100% !important;
  }

  .task-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>
