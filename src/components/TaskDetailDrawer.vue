<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getProjectDetail,
  syncProject,
  checkTaskStatus,
  takeTask
} from '@/api/project'
import ExecutionInfo from './task-detail/ExecutionInfo.vue'
import TaskExecutionInfo from './task-detail/TaskExecutionInfo.vue'

const props = withDefaults(defineProps<{
  visible: boolean
  taskId: number | string
  listType?: 'hall' | 'myTask'   // hall=任务大厅（隐藏敏感信息），myTask=我的任务
  allowTake?: boolean            // 是否允许接取
  startWithForm?: boolean        // 打开时直接进入接取备注表单
}>(), {
  listType: 'myTask',
  allowTake: false,
  startWithForm: false
})

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'taken', taskId: number | string): void
}>()

// ============ 响应式 ============
const isMobile = ref(false)
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

const drawerDirection = computed(() => (isMobile.value ? 'btt' : 'rtl'))
const drawerSize = computed(() => (isMobile.value ? '90%' : '70%'))
const descColumn = computed(() => (isMobile.value ? 1 : 3))

// ============ 详情数据 ============
const form = ref<any>({})
const loading = ref(false)
const demandData = ref<any>(null)   // 客户信息（syncProject）
const demandLoading = ref(false)

const isHall = computed(() => props.listType === 'hall')
const statusNum = computed(() => Number(form.value.status) || 0)

const typeStrMap: Record<string, string> = { '1': '任务', '2': '项目', '3': '任务' }
const typeStr = computed(() => typeStrMap[String(form.value.orderType)] || '')

// 项目名称（大厅隐藏全称）
const orderName = computed(() => {
  const f = form.value
  if (isHall.value) return '接取后可见项目全称'
  const orderNo = f.hall_orderNumber ? `（${f.hall_orderNumber}）` : ''
  if (f.orderType === 2 || f.orderType === 3) return (f.hall_customer || '') + orderNo
  if (f.orderType === 1) return f.name || ''
  return f.name || f.hall_customer || '-'
})

async function loadDetail() {
  if (!props.taskId) return
  loading.value = true
  demandData.value = null
  try {
    const res = await getProjectDetail({ id: Number(props.taskId) })
    form.value = res.code === 1 ? (res.data || {}) : {}
    // 非大厅且有项目编号 → 同步客户信息/需求文档
    if (!isHall.value && form.value.hall_orderNumber) {
      loadDemand(form.value.hall_orderNumber)
    }
  } catch (error) {
    console.error('获取详情失败:', error)
    form.value = {}
  } finally {
    loading.value = false
  }
}

async function loadDemand(orderNumber: string) {
  demandLoading.value = true
  try {
    const res = await syncProject({ orderNumber })
    demandData.value = res.code === 1 ? res.data : null
  } catch (error) {
    console.error('同步客户信息失败:', error)
    demandData.value = null
  } finally {
    demandLoading.value = false
  }
}

// ============ 佣金三档计算（对齐 zihaiyun DetailTemplate）============
function num(v: any): number {
  return Number(v) || 0
}
const totalMoney = computed(() => {
  const f = form.value
  if (f.orderType === 2) return (num(f.bountymoney) + num(f.hall_money)).toFixed(2)
  if (num(f.hall_user_money)) return num(f.hall_user_money).toFixed(2)
  return (num(f.bountymoney) + num(f.hall_money)).toFixed(2)
})
const baseMoney = computed(() => {
  const f = form.value
  if (f.orderType === 2) return num(f.bountymoney).toFixed(2)
  if (num(f.hall_user_money)) return (num(f.hall_user_money) - num(f.hall_money)).toFixed(2)
  return num(f.bountymoney).toFixed(2)
})
const showBaseMoney = computed(() => num(form.value.hall_money) >= 0)
const showAddMoney = computed(() => num(form.value.hall_money) > 0)

// ============ 工具函数 ============
function removeTime(dt: any): string {
  if (!dt) return ''
  return String(dt).split(' ')[0]
}

// 状态 pill
const statusPillMap: Record<string, string> = {
  '待接单': 'pill-info',
  '已接单': 'pill-warning',
  '发布中': 'pill-info',
  '已发布': 'pill-info',
  '已逾期': 'pill-danger',
  '核对中': 'pill-info',
  '待质检': 'pill-info',
  '已完结': 'pill-success',
  '已完成': 'pill-success',
  '已驳回': 'pill-danger'
}
function statusPill(status: string): string {
  return statusPillMap[status] || 'pill-muted'
}
// 工期预警 tag 颜色（button_color：3=逾期红，2=正常绿）
function warnPill(color: number | string): string {
  const c = Number(color)
  if (c === 3) return 'pill-danger'
  if (c === 2) return 'pill-success'
  return 'pill-info'
}

// 验收记录 timeline 颜色
function checkColor(status: number | string): string {
  const map: Record<string, string> = { '0': '#409eff', '1': '#67c23a', '2': '#f56c6c' }
  return map[String(status)] || '#909399'
}
const checkLogs = computed(() => {
  const a = form.value.appendlog
  if (!a) return []
  return Array.isArray(a) ? a : [a]
})

// 佣金修改记录解析
function parseMoneyJson(data: string) {
  try {
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}
function moneyEditText(item: string): string {
  const o = parseMoneyJson(item)
  const t = num(o.hall_user_money) ? num(o.hall_user_money) : num(o.bountymoney) + num(o.hall_money)
  return `总佣金：${t.toFixed(2)}　基础：${o.bountymoney ?? '-'}　加价：${o.hall_money ?? '-'}`
}

// ============ 附件类型徽标（沿用 TaskDetailDialog 逻辑）============
function isImageFile(url: string): boolean {
  if (!url) return false
  const ext = url.substring(url.lastIndexOf('.') + 1).toLowerCase()
  return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico'].includes(ext)
}
function getFileType(url: string): string {
  if (!url) return 'default'
  const ext = url.substring(url.lastIndexOf('.') + 1).toLowerCase()
  if (['xlsx', 'xls', 'csv'].includes(ext)) return 'excel'
  if (['ppt', 'pptx'].includes(ext)) return 'ppt'
  if (ext === 'pdf') return 'pdf'
  if (['doc', 'docx'].includes(ext)) return 'word'
  if (ext === 'txt') return 'txt'
  if (['zip', 'rar', '7z'].includes(ext)) return 'zip'
  return 'default'
}
const DEFAULT_BADGE = { label: 'FILE', color: '#6b7280' }
const fileBadgeMap: Record<string, { label: string; color: string }> = {
  excel: { label: 'XLS', color: '#217346' },
  ppt: { label: 'PPT', color: '#c43e1c' },
  pdf: { label: 'PDF', color: '#d93025' },
  word: { label: 'DOC', color: '#2b579a' },
  txt: { label: 'TXT', color: '#5f6368' },
  zip: { label: 'ZIP', color: '#c1843a' }
}
function getFileBadge(url: string) {
  return fileBadgeMap[getFileType(url)] || DEFAULT_BADGE
}

// ============ 接取逻辑（沿用 TaskDetailDialog）============
const showTakeForm = ref(false)
const taskRemark = ref('')
const takeLoading = ref(false)

async function submitTakeTask() {
  if (!form.value) return
  if (!taskRemark.value.trim()) {
    ElMessage.warning('请填写接取任务备注说明')
    return
  }
  takeLoading.value = true
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
    const id = form.value.id
    const res = await takeTask({ id, remark: taskRemark.value })
    if (res.code === 1 || res.code === 0) {
      ElMessage.success(res.msg || '接单成功，祝您工作愉快！')
      emit('taken', id)
      emit('update:visible', false)
    } else {
      ElMessage.error(res.msg || '接单失败，请稍后再试')
    }
  } catch (error) {
    console.error('接取任务失败:', error)
    ElMessage.error('接取任务失败，请稍后再试')
  } finally {
    takeLoading.value = false
  }
}

async function handleReceiveFromDetail() {
  if (!form.value) return
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
    showTakeForm.value = true
  } catch (error) {
    console.error('检查任务状态失败:', error)
    ElMessage.error('检查任务状态失败，请稍后再试')
  }
}

// ============ 打开/关闭 ============
watch(() => props.visible, (val) => {
  if (val) {
    showTakeForm.value = props.allowTake && props.startWithForm
    taskRemark.value = ''
    loadDetail()
  }
})

function handleClose() {
  emit('update:visible', false)
}
</script>

<template>
  <el-drawer
    :model-value="visible"
    title="任务详情"
    :direction="drawerDirection"
    :size="drawerSize"
    :close-on-click-modal="false"
    append-to-body
    :z-index="3000"
    @update:model-value="handleClose"
  >
    <div v-loading="loading" class="detail-body">
      <template v-if="form && form.id">
        <!-- 标题区 -->
        <div class="detail-head">
          <h2 class="detail-name">{{ orderName }}</h2>
          <div class="detail-tags">
            <span v-if="form.hallTypeTitle" class="pill pill-info">{{ form.hallTypeTitle }}</span>
            <span v-if="form.statusInfo" class="pill" :class="statusPill(form.statusInfo)">{{ form.statusInfo }}</span>
            <span v-if="form.button_info" class="pill" :class="warnPill(form.button_color)">{{ form.button_info }}</span>
          </div>
        </div>

        <!-- 可接单岗位 -->
        <div class="position-row" v-if="form.positionlistarr && form.positionlistarr.length">
          <span class="position-label">可接单岗位：</span>
          <span v-for="(p, i) in form.positionlistarr" :key="i" class="pill pill-info">{{ p.position }}</span>
        </div>

        <!-- 基本信息 -->
        <el-descriptions class="detail-desc" :column="descColumn" border>
          <el-descriptions-item label="发布公司">{{ form.company || '未知' }}</el-descriptions-item>
          <el-descriptions-item v-if="statusNum > 1" label="发布人">{{ form.username || '公司主账号发布' }}</el-descriptions-item>
          <el-descriptions-item label="发布时间">{{ removeTime(form.ordertime) || '未知' }}</el-descriptions-item>
          <el-descriptions-item label="接单时间">{{ removeTime(form.performtime) || '未知' }}</el-descriptions-item>
          <el-descriptions-item label="截止日期">{{ removeTime(form.enddatatime) || '未知' }}</el-descriptions-item>
          <el-descriptions-item :label="typeStr + '工期'">
            <span v-if="form.hall_duration">{{ form.hall_duration }} 个工作日</span>
            <span v-else>未知</span>
          </el-descriptions-item>
          <el-descriptions-item label="完成时间">{{ form.completiontime || '未知' }}</el-descriptions-item>
          <el-descriptions-item label="项目编号">
            <span v-if="!isHall">{{ form.hall_orderNumber || '未知' }}</span>
            <span v-else class="tips">{{ typeStr }}接取后展示</span>
          </el-descriptions-item>
          <el-descriptions-item label="总佣金（元）">
            <span class="money-primary">{{ totalMoney }}</span>
          </el-descriptions-item>
          <el-descriptions-item v-if="showBaseMoney" label="基础佣金（元）">{{ baseMoney }}</el-descriptions-item>
          <el-descriptions-item v-if="showAddMoney" label="加价佣金（元）">{{ form.hall_money }}</el-descriptions-item>
          <el-descriptions-item :span="descColumn" label="备注">{{ form.description || '无' }}</el-descriptions-item>
          <el-descriptions-item :span="descColumn" label="报价说明">{{ form.desc || '无' }}</el-descriptions-item>
        </el-descriptions>

        <!-- 功能文档附件 -->
        <div class="attachment-section" v-if="form.functionfilelist && form.functionfilelist.length">
          <div class="section-label">功能文档：</div>
          <div class="attachment-list">
            <div v-for="(item, index) in form.functionfilelist" :key="index" class="attachment-item">
              <el-image
                v-if="isImageFile(item.fileurl)"
                :src="item.fileurl"
                :preview-src-list="[item.fileurl]"
                :preview-teleported="true"
                fit="cover"
                class="attachment-thumb"
              />
              <a
                v-else
                :href="item.fileurl"
                target="_blank"
                rel="noopener"
                class="attachment-thumb file-badge"
                :style="{ '--badge-color': getFileBadge(item.fileurl).color }"
              >{{ getFileBadge(item.fileurl).label }}</a>
              <p class="attachment-name">{{ item.filename }}</p>
            </div>
          </div>
        </div>

        <!-- 客户信息（非大厅，需求同步成功）-->
        <div class="block" v-if="!isHall && form.hall_orderNumber">
          <h3 class="block-title">客户信息</h3>
          <div v-loading="demandLoading">
            <el-descriptions v-if="demandData" :column="descColumn" border>
              <el-descriptions-item label="客户名称">{{ demandData.customer?.customer_name || '未知' }}</el-descriptions-item>
              <el-descriptions-item label="项目编号">{{ demandData.hall_orderNumber || form.hall_orderNumber || '未知' }}</el-descriptions-item>
              <el-descriptions-item label="客户姓名">{{ demandData.contact?.contacts || '未知' }}</el-descriptions-item>
              <el-descriptions-item label="手机号">{{ demandData.contact?.contact_phone || '未知' }}</el-descriptions-item>
              <el-descriptions-item label="email">{{ demandData.contact?.email || '未知' }}</el-descriptions-item>
              <el-descriptions-item label="联系地址">{{ demandData.contact?.contact_address || '未知' }}</el-descriptions-item>
            </el-descriptions>
            <el-empty v-else-if="!demandLoading" description="暂无客户信息" :image-size="60" />
          </div>
        </div>

        <!-- 佣金修改记录 -->
        <div class="block" v-if="form.moneyeditlst && form.moneyeditlst.length">
          <h3 class="block-title">佣金修改记录</h3>
          <div class="money-edit-list">
            <div v-for="item in form.moneyeditlst" :key="item.id" class="money-edit-item">
              <div class="me-row"><span class="me-k">修改时间</span><span class="me-v">{{ item.createtime }}</span></div>
              <div class="me-row"><span class="me-k">修改依据</span><span class="me-v">{{ item.remarks || '-' }}</span></div>
              <div class="me-row"><span class="me-k">修改前</span><span class="me-v">{{ moneyEditText(item.befor) }}</span></div>
              <div class="me-row"><span class="me-k">修改后</span><span class="me-v">{{ moneyEditText(item.after) }}</span></div>
            </div>
          </div>
        </div>

        <!-- 执行信息（非大厅，已接取）：项目(orderType=2)用派单执行表，任务用功能地址明细表 -->
        <div class="block" v-if="!isHall && statusNum > 1">
          <ExecutionInfo v-if="form.orderType === 2" :id="form.id" :is-mobile="isMobile" @refresh="loadDetail" />
          <TaskExecutionInfo v-else :form="form" :is-mobile="isMobile" @refresh="loadDetail" />
        </div>

        <!-- 验收记录（非大厅）-->
        <div class="block" v-if="!isHall && checkLogs.length">
          <h3 class="block-title">验收记录</h3>
          <el-timeline>
            <el-timeline-item
              v-for="item in checkLogs"
              :key="item.id"
              :color="checkColor(item.status)"
            >
              <p class="tl-time">{{ item.audittime || '未知' }}</p>
              <p class="tl-desc">{{ item.description || '无' }}</p>
            </el-timeline-item>
          </el-timeline>
        </div>

        <!-- 变更记录 -->
        <div class="block" v-if="form.change_list && form.change_list.length">
          <h3 class="block-title">变更记录</h3>
          <el-timeline>
            <el-timeline-item v-for="item in form.change_list" :key="item.id">
              <p class="tl-time">{{ item.createtime }} <span class="tl-type">{{ item.type_title }}</span></p>
              <p class="tl-desc">{{ item.description }}</p>
            </el-timeline-item>
          </el-timeline>
        </div>

        <!-- 接取备注表单 -->
        <div class="take-form" v-if="showTakeForm">
          <el-form label-position="top">
            <el-form-item label="接取任务备注说明" required>
              <el-input v-model="taskRemark" type="textarea" :rows="4" placeholder="请填写备注说明" />
            </el-form-item>
          </el-form>
        </div>
      </template>

      <el-empty v-else-if="!loading" description="暂无详情数据" />
    </div>

    <template #footer>
      <template v-if="showTakeForm">
        <el-button type="primary" :loading="takeLoading" @click="submitTakeTask">
          {{ form.tasktype == 1 ? '接取任务' : '申请接任务' }}
        </el-button>
        <el-button @click="handleClose">取消</el-button>
      </template>
      <template v-else-if="allowTake">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="takeLoading" @click="handleReceiveFromDetail">接取任务</el-button>
      </template>
      <el-button v-else @click="handleClose">关闭</el-button>
    </template>
  </el-drawer>
</template>

<style scoped>
.detail-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-head {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-soft, #eee);
}

.detail-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--fg, #333);
  margin: 0;
}

.detail-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.position-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.position-label {
  color: var(--fg-3, #999);
  font-size: 14px;
}

.detail-desc {
  margin-top: -4px;
}

.money-primary {
  color: var(--accent, #f08b25);
  font-weight: 600;
}

.tips {
  color: var(--fg-3, #999);
}

.block-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--fg, #333);
  padding-bottom: 12px;
  margin: 0 0 16px;
  border-bottom: 1px solid var(--border-soft, #eee);
}

.section-label,
.tl-time {
  color: var(--fg-2, #666);
  font-size: 13px;
}

.tl-type {
  margin-left: 16px;
  color: var(--fg-3, #999);
}

.tl-desc {
  margin-top: 4px;
  color: var(--fg, #333);
}

/* 附件 */
.attachment-section {
  display: flex;
  gap: 12px;
}

.section-label {
  flex-shrink: 0;
  font-weight: 500;
}

.attachment-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.attachment-item {
  width: 80px;
  text-align: center;
}

.attachment-thumb {
  width: 64px;
  height: 64px;
  margin: 0 auto;
  display: block;
  border-radius: var(--r-sm, 4px);
  border: 1px solid var(--border-soft, #eee);
  overflow: hidden;
}

.file-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  background: var(--badge-color);
  border-color: transparent;
  text-decoration: none;
}

.file-badge:hover {
  opacity: .85;
}

.attachment-name {
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.4;
  color: var(--fg-2, #666);
  word-break: break-all;
}

.take-form {
  padding-top: 16px;
  border-top: 1px solid var(--border-soft, #eee);
}

/* 佣金修改记录 */
.money-edit-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.money-edit-item {
  padding: 12px 14px;
  background: var(--bg-soft, #f7f8fa);
  border: 1px solid var(--border-soft, #eee);
  border-radius: var(--r-md, 6px);
}

.me-row {
  display: flex;
  gap: 12px;
  font-size: 13px;
  line-height: 1.8;
}

.me-k {
  flex-shrink: 0;
  width: 64px;
  color: var(--fg-3, #999);
}

.me-v {
  color: var(--fg, #333);
  word-break: break-all;
}

@media screen and (max-width: 768px) {
  .attachment-section {
    flex-direction: column;
  }
}
</style>
