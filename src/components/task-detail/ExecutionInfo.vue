<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getPerformanceList, taskEndSplit } from '@/api/project'
import AddEnclosureDialog from './AddEnclosureDialog.vue'

const props = withDefaults(defineProps<{
  id: number | string
  isMobile?: boolean
}>(), {
  isMobile: false
})

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

const tableData = ref<any[]>([])
const total = ref(0)
const loading = ref(false)
const page = ref(1)
const limit = ref(10)

const excludeStatusInfo = ['删除', '已转移', '已撤销']

// 功能地址编辑弹窗
const enclosureVisible = ref(false)
const enclosureType = ref<'add' | 'edit'>('edit')
const enclosureAppendlogId = ref<number | string>('')
const enclosureInitData = ref<any>(null)

async function fetchList() {
  if (!props.id) return
  loading.value = true
  try {
    const res = await getPerformanceList({ id: Number(props.id), page: page.value, limit: limit.value })
    if (res.code === 1 && res.data) {
      const rows = res.data.data || []
      rows.forEach((v: any) => {
        const money = Number(v.hall_user_money)
          ? Number(v.hall_user_money)
          : (Number(v.bountymoney) + Number(v.hall_money))
        v.totalMoney = money.toFixed(2)
      })
      tableData.value = rows
      total.value = res.data.total || 0
    } else {
      tableData.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('获取执行情况失败:', error)
    tableData.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

watch(() => props.id, (val) => {
  if (val) {
    page.value = 1
    fetchList()
  }
}, { immediate: true })

function handlePageChange(p: number) {
  page.value = p
  fetchList()
}

// 合计：仅累加未排除状态的总佣金
function getSummaries({ columns, data }: { columns: any[]; data: any[] }) {
  const sums: string[] = []
  columns.forEach((column, index) => {
    if (index === 0) {
      sums[index] = '合计'
      return
    }
    if (column.property === 'totalMoney') {
      const totalMoney = data.reduce((sum, row) => {
        if (excludeStatusInfo.includes(row.statusInfo)) return sum
        return sum + Math.round(Number(row.totalMoney || 0) * 100)
      }, 0)
      sums[index] = '¥' + (totalMoney / 100).toFixed(2)
    } else {
      sums[index] = ''
    }
  })
  return sums
}

// 状态 tag 类型
function appendStatusType(status: number | string): '' | 'success' | 'warning' | 'danger' {
  const map: Record<string, '' | 'success' | 'warning' | 'danger'> = {
    '0': 'warning',
    '1': 'success',
    '2': 'danger'
  }
  return map[String(status)] || ''
}

// 是否可上报完结（拆分任务：已完成 + 可上报 + 未上报）
function canFinish(row: any): boolean {
  if (!row || !row.appendlog) return false
  return String(row.status) === '4' && row.operation === 1 && row.operationUp === 0
}

async function handleFinish(row: any) {
  if (!row || !row.id) return
  try {
    await ElMessageBox.confirm('是否上报完结？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch {
    return
  }
  try {
    const res = await taskEndSplit({ id: Number(row.id) })
    if (res.code === 1) {
      ElMessage.success('上报完结成功，等待质检审核')
      fetchList()
      emit('refresh')
    } else {
      ElMessage.error(res.msg || '上报完结失败')
    }
  } catch (error) {
    console.error('上报完结失败:', error)
  }
}

// 查看/编辑功能地址：解析 appendlog 的逗号拼接字段
function openEnclosure(row: any) {
  const item = row.appendlog
  if (!item) return
  const annexArr = (item.annex || '').split(',')
  const usernameArr = (item.username || '').split(',')
  const passwordArr = (item.password || '').split(',')
  const enclosure = annexArr.map((annex: string, i: number) => ({
    annex,
    username: usernameArr[i] || '',
    password: passwordArr[i] || ''
  }))
  enclosureInitData.value = {
    enclosure,
    fileList: item.filelist || [],
    description: item.description || ''
  }
  enclosureAppendlogId.value = item.id
  enclosureType.value = 'edit'
  enclosureVisible.value = true
}

function onEnclosureSuccess() {
  fetchList()
  emit('refresh')
}
</script>

<template>
  <div class="execution-info">
    <h3 class="block-title">执行信息</h3>

    <div class="table-scroll">
      <el-table
        :data="tableData"
        v-loading="loading"
        show-summary
        :summary-method="getSummaries"
        size="small"
      >
        <el-table-column prop="hallTypeTitle" label="任务类型" min-width="100" align="center" />
        <el-table-column prop="totalMoney" label="总佣金" min-width="100" align="right">
          <template #default="{ row }">
            <span v-if="row.totalMoney">¥{{ row.totalMoney }}</span>
          </template>
        </el-table-column>
        <el-table-column label="申请人" min-width="100" align="center">
          <template #default="{ row }">
            <span v-if="row.userlist && row.userlist.length">{{ row.userlist[0].username }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="createtime" label="发布时间" min-width="160" align="center" />
        <el-table-column prop="performtime" label="接单时间" min-width="160" align="center" />
        <el-table-column prop="statusInfo" label="状态" min-width="90" align="center">
          <template #default="{ row }">
            <span v-if="row.statusInfo" class="pill pill-info">{{ row.statusInfo }}</span>
          </template>
        </el-table-column>
        <el-table-column label="功能地址" min-width="90" align="center">
          <template #default="{ row }">
            <el-button v-if="row.appendlog" link type="primary" @click="openEnclosure(row)">查看</el-button>
            <span v-else>未上传</span>
          </template>
        </el-table-column>
        <el-table-column label="验收情况" min-width="90" align="center">
          <template #default="{ row }">
            <el-tag
              v-if="row.appendlog && row.appendlog.statustxt"
              :type="appendStatusType(row.appendlog.status)"
              size="small"
            >
              {{ row.appendlog.statustxt }}
            </el-tag>
            <span v-else>未申请</span>
          </template>
        </el-table-column>
        <el-table-column prop="evaluate" label="满意度" min-width="80" align="center" />
        <el-table-column label="完成时间" min-width="160" align="center">
          <template #default="{ row }">
            {{ row.appendlog?.createtime || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="审核时间" min-width="160" align="center">
          <template #default="{ row }">
            {{ row.appendlog?.audittime || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="90" align="center" fixed="right">
          <template #default="{ row }">
            <el-button v-if="canFinish(row)" link type="primary" @click="handleFinish(row)">上报完结</el-button>
            <span v-else>-</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="pagination-wrap" v-if="total > limit">
      <el-pagination
        :current-page="page"
        :page-size="limit"
        :total="total"
        :layout="isMobile ? 'prev, next' : 'total, prev, pager, next'"
        small
        background
        @current-change="handlePageChange"
      />
    </div>

    <AddEnclosureDialog
      v-model:visible="enclosureVisible"
      :project-id="id"
      :type="enclosureType"
      :appendlog-id="enclosureAppendlogId"
      :init-data="enclosureInitData"
      @success="onEnclosureSuccess"
    />
  </div>
</template>

<style scoped>
.execution-info {
  margin-top: 8px;
}

.block-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--fg, #333);
  padding-bottom: 12px;
  margin: 0 0 16px;
  border-bottom: 1px solid var(--border-soft, #eee);
}

.table-scroll {
  overflow-x: auto;
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}
</style>
