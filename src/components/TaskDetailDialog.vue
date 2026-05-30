<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { checkTaskStatus, takeTask } from '@/api/project'

const props = withDefaults(defineProps<{
  visible: boolean
  task: any
  loading?: boolean
  allowTake?: boolean      // 是否允许接取（任务大厅 true，我的任务 false）
  startWithForm?: boolean  // 打开时是否直接进入接取备注表单
}>(), {
  loading: false,
  allowTake: false,
  startWithForm: false
})

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'taken', taskId: number): void
}>()

// 是否手机端
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

// 接取表单状态
const showTakeForm = ref(false)
const taskRemark = ref('')
const takeLoading = ref(false)

// 弹窗打开时按模式初始化接取表单
function handleOpen() {
  showTakeForm.value = props.allowTake && props.startWithForm
  taskRemark.value = ''
}

function handleClose() {
  emit('update:visible', false)
}

// 判断是否为图片文件
function isImageFile(url: string): boolean {
  if (!url) return false
  const ext = url.substring(url.lastIndexOf('.') + 1).toLowerCase()
  return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico'].includes(ext)
}

// 获取文件类型
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

// 文件类型徽标（缩写 + 颜色）
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

// 提交接取任务（表单模式）
async function submitTakeTask() {
  if (!props.task) return

  if (!taskRemark.value.trim()) {
    ElMessage.warning('请填写接取任务备注说明')
    return
  }

  takeLoading.value = true
  try {
    // 再次检查是否有执行中的任务
    const checkRes = await checkTaskStatus()
    if (checkRes.code === 1 && checkRes.data !== 0) {
      ElMessageBox.alert(
        '您当前有执行中任务未申请完结，无法申请接取新任务。请及时完成并申请完结执行中的任务，即可接取新任务。',
        '正在执行其他任务',
        { type: 'warning' }
      )
      return
    }

    const taskId = props.task.id
    const res = await takeTask({ id: taskId, remark: taskRemark.value })
    if (res.code === 1 || res.code === 0) {
      ElMessage.success(res.msg || '接单成功，祝您工作愉快！')
      emit('taken', taskId)
      emit('update:visible', false)
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

// 从详情底部点「接取任务」按钮（查看模式）：先检查再显示表单
async function handleReceiveFromDetail() {
  if (!props.task) return

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
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="任务详情"
    :width="isMobile ? '95%' : 'min(900px, 92vw)'"
    :close-on-click-modal="false"
    @open="handleOpen"
    @update:model-value="handleClose"
  >
    <div v-loading="loading" class="task-detail-content">
      <template v-if="task">
        <!-- 基本信息 -->
        <el-descriptions :column="isMobile ? 1 : 2" border>
          <el-descriptions-item label="发布公司" :span="isMobile ? 1 : 2">
            {{ task.company || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="佣金" :span="isMobile ? 1 : 2">
            <template v-if="task.moneytype === 2">
              接取后分配（佣金总额：¥{{ task.bountymoney || '0' }}）
            </template>
            <template v-else>
              <span style="color: var(--accent); font-weight: 600;">¥{{ task.money || task.bountymoney || '0' }}</span>
              <span v-if="task.moneytype === 1">/人</span>
            </template>
          </el-descriptions-item>
        </el-descriptions>

        <el-descriptions :column="isMobile ? 1 : 2" border style="margin-top: -1px;">
          <el-descriptions-item label="项目名称" :span="isMobile ? 1 : 2">
            {{ task.name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="发布人">
            {{ task.username || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="发布时间">
            {{ task.ordertime || '-' }}
          </el-descriptions-item>
        </el-descriptions>

        <el-descriptions :column="isMobile ? 1 : 2" border style="margin-top: -1px;">
          <el-descriptions-item label="接单方式">
            {{ task.tasktype ? (task.tasktype == 1 ? '先抢先得' : '需要审批') : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="需求人数">
            {{ task.num || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="客户名称" :span="isMobile ? 1 : 2" v-if="task.customername">
            {{ task.customername }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- 条件区域 -->
        <div class="condition-section">
          <div class="condition-label">条件：</div>
          <div class="condition-list">
            <div v-if="task.datatime" class="condition-item">
              时间：{{ task.datatime }} - {{ task.enddatatime }}
            </div>
            <div v-if="task.position" class="condition-item">
              岗位/工种：{{ task.position }}
            </div>
            <div v-if="task.positionlistarr && task.positionlistarr.length" class="condition-item">
              岗位资质：
              <span v-for="(item, index) in task.positionlistarr" :key="index">
                {{ item.position }}：{{ item.aptitude }}<span v-if="Number(index) < task.positionlistarr.length - 1">；</span>
              </span>
            </div>
            <div v-if="task.aptitudetxt" class="condition-item">
              人员资质：{{ task.aptitudetxt }}
            </div>
            <div v-if="task.appointlist && task.appointlist.length" class="condition-item">
              指定人员：{{ task.appointlist.filter((u: any) => u.username).map((u: any) => u.username).join('、') }}
            </div>
            <template v-if="Array.isArray(task.description)">
              <div v-for="(citem, cindex) in task.description" :key="cindex" class="condition-item">
                {{ citem.condition_title }}：{{ citem.condition }}
              </div>
            </template>
            <div v-else-if="task.description" class="condition-item">
              备注：{{ task.description }}
            </div>
          </div>
        </div>

        <!-- 附件区域 -->
        <div class="attachment-section" v-if="task.filelist && task.filelist.length">
          <div class="attachment-label">附件：</div>
          <div class="attachment-list">
            <div v-for="(item, index) in task.filelist" :key="index" class="attachment-item">
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
              >
                {{ getFileBadge(item.fileurl).label }}
              </a>
              <p class="attachment-name">{{ item.filename }}</p>
            </div>
          </div>
        </div>

        <!-- 接取备注表单（仅在接取模式显示） -->
        <div class="take-form" v-if="showTakeForm">
          <el-form label-position="left" :label-width="isMobile ? '100px' : '140px'">
            <el-form-item label="接取任务备注说明" required>
              <el-input
                v-model="taskRemark"
                type="textarea"
                :rows="4"
                placeholder="请填写备注说明"
              />
            </el-form-item>
          </el-form>
          <div class="take-form-buttons">
            <el-button type="primary" @click="submitTakeTask" :loading="takeLoading" style="width: 150px;">
              {{ task?.tasktype == 1 ? '接取任务' : '申请接任务' }}
            </el-button>
            <el-button @click="handleClose" style="width: 150px;">取消</el-button>
          </div>
        </div>
      </template>
    </div>

    <template #footer v-if="!showTakeForm">
      <template v-if="allowTake">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleReceiveFromDetail" :loading="takeLoading">
          接取任务
        </el-button>
      </template>
      <el-button v-else @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.take-form {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border-soft);
}

.take-form-buttons {
  text-align: center;
  margin-top: 16px;
}

.take-form-buttons .el-button + .el-button {
  margin-left: 32px;
}

.condition-section {
  display: flex;
  margin-top: 16px;
}

.condition-label {
  color: var(--fg);
  font-weight: 500;
  flex-shrink: 0;
  width: 50px;
}

.condition-list {
  flex: 1;
}

.condition-item {
  padding: 4px 8px;
  background: var(--bg-soft);
  margin-bottom: 8px;
  line-height: 1.5;
  font-size: 13px;
  color: var(--fg);
  border-radius: var(--r-sm);
  border: 1px solid var(--border-soft);
}

.attachment-section {
  display: flex;
  margin-top: 16px;
}

.attachment-label {
  color: var(--fg);
  font-weight: 500;
  flex-shrink: 0;
  width: 50px;
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
  border-radius: var(--r-sm);
  border: 1px solid var(--border-soft);
  overflow: hidden;
}

.file-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: .02em;
  color: #fff;
  background: var(--badge-color);
  border-color: transparent;
  text-decoration: none;
  transition: opacity .15s;
}

.file-badge:hover {
  opacity: .85;
}

.attachment-name {
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.4;
  color: var(--fg-2);
  word-break: break-all;
}

@media screen and (max-width: 768px) {
  .condition-section,
  .attachment-section {
    flex-direction: column;
  }

  .condition-label,
  .attachment-label {
    width: auto;
    margin-bottom: 8px;
  }

  :deep(.el-dialog) {
    width: 95% !important;
    margin: 5vh auto !important;
    max-height: 90vh;
  }

  :deep(.el-dialog__body) {
    max-height: calc(90vh - 120px);
    overflow-y: auto;
    padding: 15px;
  }

  :deep(.el-descriptions) {
    font-size: 13px;
  }

  :deep(.el-descriptions__label) {
    width: 80px !important;
    min-width: 80px !important;
  }

  :deep(.el-descriptions__content) {
    word-break: break-all;
  }

  :deep(.el-descriptions-item__container) {
    display: flex;
    flex-direction: column;
  }
}

:deep(.el-descriptions__label) {
  color: var(--fg-3);
  font-weight: 500;
  white-space: nowrap;
  min-width: 88px;
}

:deep(.el-descriptions__content) {
  color: var(--fg);
}
</style>
