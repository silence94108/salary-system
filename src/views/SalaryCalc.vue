<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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

// 当月完结的项目
const monthFinished = computed(() => {
  return projectStore.getFinishedByMonth(calcMonth.value)
})

// 当月接单的项目
const monthOrdered = computed(() => {
  return projectStore.getOrderedByMonth(calcMonth.value)
})

// 未完结项目
const pendingProjects = computed(() => projectStore.pendingProjects)

// 完结项目佣金总额（原始）
const monthFinishedTotal = computed(() => {
  return monthFinished.value.reduce((sum, p) => sum + (p.commission || 0), 0)
})

// 计算每个项目的结果
function getResult(project: Project): CommissionResult {
  return projectStore.calculateCommission(project)
}

// 实得佣金合计
const totalCommission = computed(() => {
  return monthFinished.value.reduce((sum, p) => sum + getResult(p).actualCommission, 0)
})

// 当月应发薪资
const totalSalary = computed(() => {
  return projectStore.baseSalary + totalCommission.value
})

// 修改底薪
function handleBaseSalaryChange(value: number) {
  projectStore.setBaseSalary(value)
}

// 刷新项目数据
function refreshProjects() {
  projectStore.fetchProjects()
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
          <el-button type="primary" link @click="refreshProjects">
            <el-icon><Refresh /></el-icon> 刷新数据
          </el-button>
        </div>
      </template>

      <el-form :inline="true">
        <el-form-item label="底薪">
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
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-num primary">{{ monthFinished.length }}</div>
          <div class="stat-label">当月完结项目</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-num success">{{ monthOrdered.length }}</div>
          <div class="stat-label">当月接单项目</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-num warning">{{ pendingProjects.length }}</div>
          <div class="stat-label">未完结项目</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-num">{{ monthFinishedTotal.toFixed(0) }}</div>
          <div class="stat-label">完结佣金总额(元)</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 完结项目明细 -->
    <el-card shadow="never" class="table-card">
      <template #header>
        <span>{{ calcMonth }} 完结项目明细</span>
      </template>

      <el-table
        :data="monthFinished"
        v-loading="projectStore.loading"
        stripe
      >
        <el-table-column prop="name" label="项目名称" min-width="150" />
        <el-table-column prop="orderMonth" label="接单月份" width="110" />
        <el-table-column label="抢单佣金" width="120">
          <template #default="{ row }">
            {{ (row.commission || 0).toFixed(2) }} 元
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
            <span v-if="row.isOverdue && getResult(row).ruleNum === 1" class="overdue-tag">(超期)</span>
          </template>
        </el-table-column>
        <el-table-column label="实得佣金" width="120">
          <template #default="{ row }">
            <span class="commission-value">{{ getResult(row).actualCommission.toFixed(2) }} 元</span>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="monthFinished.length === 0 && !projectStore.loading" description="当月暂无完结项目" />
    </el-card>

    <!-- 薪资汇总 -->
    <el-card shadow="never" class="summary-card" v-if="monthFinished.length > 0">
      <div class="summary-row">
        <div class="summary-item">
          <div class="label">底薪</div>
          <div class="value">{{ projectStore.baseSalary.toFixed(2) }} 元</div>
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

    <!-- 未完结项目 -->
    <el-card shadow="never" class="table-card" v-if="pendingProjects.length > 0">
      <template #header>
        <span class="pending-title">未完结项目（{{ pendingProjects.length }} 个）</span>
      </template>

      <el-table :data="pendingProjects" stripe>
        <el-table-column prop="name" label="项目名称" />
        <el-table-column label="抢单佣金">
          <template #default="{ row }">
            {{ (row.commission || 0).toFixed(2) }} 元
          </template>
        </el-table-column>
        <el-table-column prop="orderMonth" label="接单月份" />
        <el-table-column label="状态" width="100">
          <el-tag type="warning" size="small">进行中</el-tag>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 规则说明 -->
    <el-card shadow="never" class="rule-card">
      <template #header>
        <span>佣金计算规则</span>
      </template>

      <el-row :gutter="16">
        <el-col :span="6">
          <div class="rule-item rule-1">
            <div class="rule-title">规则① 高业绩</div>
            <div class="rule-desc">佣金 ≥ 底薪×2</div>
            <div class="rule-rate">提成 70%（超期50%）</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="rule-item rule-2">
            <div class="rule-title">规则② 达标</div>
            <div class="rule-desc">佣金 ≥ 底薪</div>
            <div class="rule-rate">提成 50%</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="rule-item rule-3">
            <div class="rule-title">规则③ 基础</div>
            <div class="rule-desc">底薪/2 ≤ 佣金 &lt; 底薪</div>
            <div class="rule-rate">提成 30%</div>
          </div>
        </el-col>
        <el-col :span="6">
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
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.pending-title {
  color: #E6A23C;
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
</style>
