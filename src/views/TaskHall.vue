<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getTaskHallList, checkTaskStatus, takeTask, getTaskDetail } from '@/api/project'
import type { TaskOrder } from '@/types'

// 任务列表
const tasks = ref<TaskOrder[]>([])
const loading = ref(false)
const total = ref(0)

// 详情弹窗
const detailVisible = ref(false)
const detailLoading = ref(false)
const currentTask = ref<any>(null)
const taskRemark = ref('')
const takeLoading = ref(false)

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

// 获取逾期标签类型
function getOverdueType(task: any): string {
  if (task.syday < 0) return 'danger'
  return 'warning'
}

// 获取逾期文本
function getOverdueText(task: any): string {
  if (task.syday < 0) return `逾期${Math.abs(task.syday)}天`
  return `剩余${task.syday}天`
}

// 接取任务（直接接取，用于项目类型）
async function handleReceive(task: TaskOrder) {
  // 对于任务类型(orderType === 1)，需要先打开详情弹窗填写备注
  if (task.orderType === 1) {
    await handleDetail(task)
    return
  }

  // 项目类型(orderType === 2 或其他)直接确认接取
  try {
    // 先检查是否有执行中的任务
    const checkRes = await checkTaskStatus()
    if (checkRes.code === 1 && checkRes.data !== 0) {
      ElMessageBox.alert(
        '您当前有执行中任务未申请完结，无法申请接取新任务。请及时完成并申请完结执行中的任务，即可接取新任务。',
        '正在执行其他任务',
        { type: 'warning' }
      )
      return
    }

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

// 查看详情
async function handleDetail(task: TaskOrder) {
  detailLoading.value = true
  detailVisible.value = true
  taskRemark.value = ''
  try {
    const res = await getTaskDetail({ id: task.id })
    if (res.code === 1) {
      currentTask.value = res.data || task
    } else {
      currentTask.value = task
    }
  } catch (error) {
    console.error('获取任务详情失败:', error)
    currentTask.value = task
  } finally {
    detailLoading.value = false
  }
}

// 关闭详情弹窗
function closeDetail() {
  detailVisible.value = false
  currentTask.value = null
  taskRemark.value = ''
}

// 从详情弹窗接取任务
async function handleReceiveFromDetail() {
  if (!currentTask.value) return

  // 验证备注
  if (!taskRemark.value.trim()) {
    ElMessage.warning('请填写接取任务备注说明')
    return
  }

  takeLoading.value = true
  try {
    // 先检查是否有执行中的任务
    const checkRes = await checkTaskStatus()
    if (checkRes.code === 1 && checkRes.data !== 0) {
      ElMessageBox.alert(
        '您当前有执行中任务未申请完结，无法申请接取新任务。请及时完成并申请完结执行中的任务，即可接取新任务。',
        '正在执行其他任务',
        { type: 'warning' }
      )
      return
    }

    // 接取任务
    const res = await takeTask({ id: currentTask.value.id, remark: taskRemark.value })
    if (res.code === 1 || res.code === 0) {
      ElMessage.success(res.msg || '接单成功，祝您工作愉快！')
      closeDetail()
      // 从列表中移除已接取的任务
      tasks.value = tasks.value.filter(t => t.id !== currentTask.value.id)
      total.value = total.value - 1
      // 刷新列表
      fetchTasks()
    } else {
      ElMessage.error(res.msg || '接单失败，请稍后再试')
    }
  } catch (error: any) {
    console.error('接取任务失败:', error)
    ElMessage.error('接取任务失败，请稍后再试')
  } finally {
    takeLoading.value = false
  }
}

// 初始化加载
fetchTasks()
</script>

<template>
  <div class="task-hall">
    <!-- 筛选区域 -->
    <el-card shadow="never" class="filter-card">
      <el-form :inline="true" class="filter-form" @submit.prevent="handleSearch">
        <el-form-item label="项目名称">
          <el-input v-model="filters.name" placeholder="搜索项目名称" clearable style="width: 200px" />
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

    <!-- 任务卡片列表 -->
    <div class="task-list" v-loading="loading">
      <div v-if="tasks.length === 0 && !loading" class="empty-wrapper">
        <el-empty description="暂无待接任务" />
      </div>

      <div v-else class="task-grid">
        <el-card v-for="task in tasks" :key="task.id" class="task-card" shadow="hover">
          <!-- 卡片头部 -->
          <div class="card-header">
            <div class="header-left">
              <span v-if="task.timeout" class="timeout-tag">{{ task.timeout }}</span>
            </div>
            <div class="header-right">
              <el-tag v-if="task.syday" :type="getOverdueType(task)" size="small">
                {{ getOverdueText(task) }}
              </el-tag>
              <el-tag type="danger" size="small" effect="plain">{{ task.statusInfo }}</el-tag>
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
            <span>总佣金：<span class="value primary">¥{{ parseFloat(task.hall_total_money || '0').toFixed(2) }}</span></span>
            <span>基础佣金：<span class="value">¥{{ parseFloat(task.hall_money || '0').toFixed(2) }}</span></span>
            <span>加价佣金：<span class="value warning">¥{{ parseFloat(task.hall_user_money || '0').toFixed(2) }}</span></span>
          </div>

          <!-- 备注 -->
          <div class="remark" v-if="task.description">
            <span class="label">备注：</span>
            <span class="value">{{ task.description }}</span>
          </div>

          <!-- 操作按钮 -->
          <div class="card-footer">
            <el-button type="primary" size="small" @click="handleReceive(task)">接取</el-button>
            <el-button size="small" @click="handleDetail(task)">详情</el-button>
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

    <!-- 任务详情弹窗 -->
    <el-dialog
      v-model="detailVisible"
      title="任务详情"
      width="650px"
      :close-on-click-modal="false"
      @close="closeDetail"
    >
      <div v-loading="detailLoading">
        <template v-if="currentTask">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="发布公司" :span="2">
              {{ currentTask.company || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="项目名称" :span="2">
              {{ currentTask.name || '接取后可见项目全称' }}
            </el-descriptions-item>
            <el-descriptions-item label="项目类型">
              {{ currentTask.hallTypeTitle || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="发布人">
              {{ currentTask.username || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="发布时间">
              {{ currentTask.ordertime || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="截止时间">
              {{ currentTask.enddatatime || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="工期" v-if="currentTask.hall_duration">
              {{ currentTask.hall_duration }} 个工作日
            </el-descriptions-item>
            <el-descriptions-item label="工期状态">
              <el-tag v-if="currentTask.syday" :type="getOverdueType(currentTask)" size="small">
                {{ getOverdueText(currentTask) }}
              </el-tag>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="佣金" :span="2">
              <span style="color: #409eff; font-weight: 600; font-size: 16px;">
                ¥{{ parseFloat(currentTask.hall_total_money || currentTask.bountymoney || '0').toFixed(2) }}
              </span>
              <span style="margin-left: 16px; color: #666;">
                （基础：¥{{ parseFloat(currentTask.hall_money || currentTask.bountymoney || '0').toFixed(2) }}，
                加价：<span style="color: #e6a23c;">¥{{ parseFloat(currentTask.hall_user_money || '0').toFixed(2) }}</span>）
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="接单方式" v-if="currentTask.tasktype">
              {{ currentTask.tasktype == 1 ? '先抢先得' : '需要审批' }}
            </el-descriptions-item>
            <el-descriptions-item label="需求人数" v-if="currentTask.num">
              {{ currentTask.num }}
            </el-descriptions-item>
            <el-descriptions-item label="备注" :span="2" v-if="currentTask.description">
              {{ currentTask.description }}
            </el-descriptions-item>
          </el-descriptions>

          <!-- 接取备注表单 -->
          <div class="take-form">
            <el-form label-position="top">
              <el-form-item label="接取任务备注说明" required>
                <el-input
                  v-model="taskRemark"
                  type="textarea"
                  :rows="3"
                  placeholder="请填写备注说明"
                />
              </el-form-item>
            </el-form>
          </div>
        </template>
      </div>

      <template #footer>
        <el-button @click="closeDetail">取消</el-button>
        <el-button type="primary" @click="handleReceiveFromDetail" :loading="takeLoading">
          {{ currentTask?.tasktype == 1 ? '接取任务' : '申请接任务' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Search, Refresh } from '@element-plus/icons-vue'
export default {
  components: { Search, Refresh }
}
</script>

<style scoped>
.task-hall {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-card {
  flex-shrink: 0;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 0;
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
  border-radius: 8px;
  display: flex;
  flex-direction: column;
}

.task-card :deep(.el-card__body) {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.task-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.header-right {
  display: flex;
  gap: 8px;
}

.timeout-tag {
  color: #f56c6c;
  font-size: 12px;
}

.project-name {
  font-size: 16px;
  font-weight: 600;
  color: #409eff;
  text-align: center;
  margin-bottom: 16px;
  padding: 8px 0;
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
  color: #666;
  width: 70px;
  flex-shrink: 0;
}

.info-row .value {
  color: #333;
}

.info-row .duration {
  margin-left: auto;
  color: #666;
}

.money-info {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 16px;
  margin-bottom: 12px;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 6px;
  font-size: 13px;
  color: #666;
}

.money-info .label {
  color: #666;
}

.money-info .value {
  font-weight: 600;
  color: #333;
}

.money-info .value.primary {
  color: #409eff;
}

.money-info .value.warning {
  color: #e6a23c;
}

.remark {
  font-size: 13px;
  margin-bottom: 12px;
  color: #666;
}

.remark .label {
  color: #666;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #eee;
  margin-top: auto;
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

/* 手机端适配 */
@media screen and (max-width: 768px) {
  .task-hall {
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

  .filter-card :deep(.el-input) {
    width: 100% !important;
  }

  .task-grid {
    grid-template-columns: 1fr;
  }
}

.take-form {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}
</style>
