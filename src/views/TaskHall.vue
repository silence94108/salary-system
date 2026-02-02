<script setup lang="ts">
import { ref, reactive } from 'vue'
import { getTaskHallList } from '@/api/project'
import type { TaskOrder } from '@/types'

// 任务列表
const tasks = ref<TaskOrder[]>([])
const loading = ref(false)
const total = ref(0)

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
            <div class="money-item">
              <span class="label">金额：</span>
              <span class="label">总佣金：</span>
              <span class="value primary">¥{{ parseFloat(task.hall_total_money || '0').toFixed(2) }}</span>
            </div>
            <div class="money-item">
              <span class="label">基础佣金：</span>
              <span class="value">¥{{ parseFloat(task.hall_money || '0').toFixed(2) }}</span>
            </div>
            <div class="money-item">
              <span class="label">加价佣金：</span>
              <span class="value warning">¥{{ parseFloat(task.hall_user_money || '0').toFixed(2) }}</span>
            </div>
          </div>

          <!-- 备注 -->
          <div class="remark" v-if="task.description">
            <span class="label">备注：</span>
            <span class="value">{{ task.description }}</span>
          </div>

          <!-- 操作按钮 -->
          <div class="card-footer">
            <el-button type="primary" size="small">接取</el-button>
            <el-button size="small">详情</el-button>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination-wrap" v-if="total > 0">
      <el-pagination
        v-model:current-page="pagination.page"
        :page-size="pagination.limit"
        :total="total"
        layout="total, prev, pager, next"
        @current-change="handlePageChange"
      />
    </div>
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
  height: 100%;
  overflow-y: auto;
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
  gap: 8px 16px;
  margin-bottom: 12px;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 6px;
}

.money-item {
  display: flex;
  align-items: center;
  font-size: 13px;
}

.money-item .label {
  color: #666;
}

.money-item .value {
  font-weight: 600;
}

.money-item .value.primary {
  color: #409eff;
}

.money-item .value.warning {
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
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  padding: 16px 0;
  flex-shrink: 0;
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

  .money-info {
    flex-direction: column;
    gap: 6px;
  }
}
</style>
