<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useProjectStore } from '@/stores/project'
import type { Project, CommissionResult } from '@/types'

const projectStore = useProjectStore()

// 当前选择的计算月份
const calcMonth = ref('')

// 初始化
onMounted(() => {
  // 设置默认月份为当前月
  const now = new Date()
  calcMonth.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
})

// 监听月份变化，自动查询
watch(calcMonth, (month) => {
  if (month) {
    projectStore.fetchByMonth(month)
  }
}, { immediate: true })

// 完结项目佣金总额（原始）
const monthFinishedTotal = computed(() => {
  return projectStore.projects.reduce((sum, p) => sum + (p.commission || 0), 0)
})

// 计算每个项目的结果
function getResult(project: Project): CommissionResult {
  return projectStore.calculateCommission(project)
}

// 实得佣金合计
const totalCommission = computed(() => {
  return projectStore.projects.reduce((sum, p) => sum + getResult(p).actualCommission, 0)
})

// 当月实际底薪（含工龄工资）
const currentBaseSalary = computed(() => {
  if (!calcMonth.value) return projectStore.baseSalary
  return projectStore.getSalaryByOrderMonth(calcMonth.value)
})

// 当月应发薪资
const totalSalary = computed(() => {
  return currentBaseSalary.value + totalCommission.value
})

// 修改底薪
function handleBaseSalaryChange(value: number) {
  projectStore.setBaseSalary(value)
}

// 修改入职日期
function handleEntryDateChange(value: string) {
  if (value) {
    projectStore.setEntryDate(value)
  }
}

// 刷新项目数据
function refreshProjects() {
  projectStore.fetchByMonth(calcMonth.value)
}

// 规则对应的样式
function getRuleType(ruleNum: number): string {
  const types: Record<number, string> = {
    1: 'success',
    2: 'primary',
    3: 'warning',
    4: 'danger'
  }
  return types[ruleNum] || 'info'
}
</script>

<template>
  <div class="salary-calc">
    <!-- 设置区域 -->
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

    <!-- 统计卡片 -->
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

    <!-- 完结项目明细 -->
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
        <el-table-column label="月接单总额" width="130">
          <template #default="{ row }">
            {{ projectStore.getOrderMonthTotal(row.orderMonth).toFixed(2) }} 元
          </template>
        </el-table-column>
        <el-table-column label="执行状态" width="100">
          <template #default="{ row }">
            {{ row.orderstatus }}
          </template>
        </el-table-column>
        <el-table-column label="抢单佣金" width="120">
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

    <!-- 薪资汇总 -->
    <el-card shadow="never" class="summary-card" v-if="projectStore.projects.length > 0">
      <div class="summary-row">
        <div class="summary-item">
          <div class="label">底薪（含工龄）</div>
          <div class="value">{{ currentBaseSalary.toFixed(2) }} 元</div>
        </div>
        <div class="summary-item">
          <div class="label">佣金合计</div>
          <div class="value">{{ totalCommission.toFixed(2) }} 元</div>
        </div>
        <div class="summary-item main">
          <div class="label">{{ calcMonth }} 应发薪资</div>
          <div class="value">{{ totalSalary.toFixed(2) }} 元</div>
        </div>
      </div>
    </el-card>

    <!-- 规则说明 -->
    <el-card shadow="never" class="rule-card">
      <template #header>
        <span>佣金计算规则</span>
      </template>

      <el-row :gutter="16">
        <el-col :xs="12" :sm="6">
          <div class="rule-item rule-1">
            <div class="rule-title">规则① 高业绩</div>
            <div class="rule-desc">佣金 ≥ 底薪×2</div>
            <div class="rule-rate">提成 70%（超期50%）</div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6">
          <div class="rule-item rule-2">
            <div class="rule-title">规则② 达标</div>
            <div class="rule-desc">佣金 ≥ 底薪</div>
            <div class="rule-rate">提成 50%</div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6">
          <div class="rule-item rule-3">
            <div class="rule-title">规则③ 基础</div>
            <div class="rule-desc">底薪/2 ≤ 佣金 &lt; 底薪</div>
            <div class="rule-rate">提成 30%</div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6">
          <div class="rule-item rule-4">
            <div class="rule-title">规则④ 保底</div>
            <div class="rule-desc">佣金 &lt; 底薪/2</div>
            <div class="rule-rate">提成 0%（只发底薪）</div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script lang="ts">
import { Refresh } from '@element-plus/icons-vue'
export default {
  components: { Refresh }
}
</script>

<style scoped>
.salary-calc {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  overflow-y: auto;
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.summary-card :deep(.el-card__body) {
  padding: 20px;
}

.summary-row {
  display: flex;
  justify-content: space-around;
  align-items: center;
  color: white;
}

.summary-item {
  text-align: center;
}

.summary-item .label {
  font-size: 13px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.summary-item .value {
  font-size: 24px;
  font-weight: bold;
}

.summary-item.main .value {
  font-size: 32px;
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

/* 手机端适配 */
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
