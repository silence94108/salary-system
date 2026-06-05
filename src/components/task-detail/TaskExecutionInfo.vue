<script setup lang="ts">
import { ref, computed } from 'vue'
import AddEnclosureDialog from './AddEnclosureDialog.vue'

const props = withDefaults(defineProps<{
  form: any
  isMobile?: boolean
}>(), {
  isMobile: false
})

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

// appendlog 兼容数组/空对象：取有效的单条
const appendlog = computed(() => {
  const a = props.form?.appendlog
  if (!a) return null
  const item = Array.isArray(a) ? a[0] : a
  if (!item) return null
  return (item.annex || item.id) ? item : null
})

// 功能地址明细：annex/username/password 逗号拆分，每个地址一行（对齐 zihaiyun TaskDetail）
const rows = computed(() => {
  const a = appendlog.value
  if (!a || !a.annex) return []
  const annex = String(a.annex).split(',')
  const username = a.username ? String(a.username).split(',') : []
  const password = a.password ? String(a.password).split(',') : []
  return annex.map((annexItem: string, i: number) => ({
    annex: annexItem,
    username: username[i] || '',
    password: password[i] || '',
    statustxt: a.statustxt,
    status: a.status,
    filelist: a.filelist || [],
    createtime: a.createtime,
    audittime: a.audittime
  }))
})

// 完结前(form.status < 3)可新增/编辑功能地址
const canEdit = computed(() => (Number(props.form?.status) || 0) < 3)

function statusType(status: number | string): '' | 'success' | 'warning' | 'danger' {
  const map: Record<string, '' | 'success' | 'warning' | 'danger'> = {
    '0': 'warning',
    '1': 'success',
    '2': 'danger'
  }
  return map[String(status)] || ''
}

// 新增/编辑弹窗
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const dialogAppendlogId = ref<number | string>('')
const dialogInitData = ref<any>(null)

function openAdd() {
  dialogType.value = 'add'
  dialogAppendlogId.value = ''
  dialogInitData.value = null
  dialogVisible.value = true
}

function openEdit() {
  const a = appendlog.value
  if (!a) return
  // 对齐 zihaiyun：仅待审核(status=0)走编辑接口，已驳回等其它状态重新申请完结
  if (Number(a.status) === 0) {
    dialogType.value = 'edit'
    dialogAppendlogId.value = a.id
  } else {
    dialogType.value = 'add'
    dialogAppendlogId.value = ''
  }
  dialogInitData.value = {
    enclosure: rows.value.map((r: any) => ({ annex: r.annex, username: r.username, password: r.password })),
    fileList: a.filelist || [],
    description: a.description || ''
  }
  dialogVisible.value = true
}

function onSuccess() {
  emit('refresh')
}
</script>

<template>
  <div class="task-execution">
    <div class="te-head">
      <h3 class="block-title">执行信息</h3>
      <el-button v-if="canEdit && rows.length === 0" type="primary" size="small" @click="openAdd">
        新增功能地址
      </el-button>
      <el-button v-else-if="canEdit" type="primary" size="small" @click="openEdit">
        编辑功能地址
      </el-button>
    </div>

    <div class="table-scroll" v-if="rows.length">
      <el-table :data="rows" size="small">
        <el-table-column prop="annex" label="地址" min-width="200">
          <template #default="{ row }">
            <span class="addr">{{ row.annex || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名" min-width="110" />
        <el-table-column prop="password" label="密码" min-width="110" />
        <el-table-column label="附件" min-width="140">
          <template #default="{ row }">
            <template v-if="row.filelist && row.filelist.length">
              <div v-for="f in row.filelist" :key="f.id" class="file-link">
                <el-link :href="f.fileurl || f.url" target="_blank" type="primary">
                  {{ f.filename || f.name || '附件' }}
                </el-link>
              </div>
            </template>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" min-width="90" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.statustxt" :type="statusType(row.status)" size="small">{{ row.statustxt }}</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="createtime" label="创建时间" min-width="160" align="center">
          <template #default="{ row }">{{ row.createtime || '-' }}</template>
        </el-table-column>
        <el-table-column prop="audittime" label="审核时间" min-width="160" align="center">
          <template #default="{ row }">{{ row.audittime || '-' }}</template>
        </el-table-column>
      </el-table>
    </div>

    <el-empty v-else description="暂未上传功能地址" :image-size="60" />

    <AddEnclosureDialog
      v-model:visible="dialogVisible"
      :project-id="form.id"
      :type="dialogType"
      :appendlog-id="dialogAppendlogId"
      :init-data="dialogInitData"
      @success="onSuccess"
    />
  </div>
</template>

<style scoped>
.task-execution {
  margin-top: 8px;
}

.te-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 12px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--border-soft, #eee);
}

.block-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--fg, #333);
  margin: 0;
}

.table-scroll {
  overflow-x: auto;
}

.addr {
  word-break: break-all;
}

.file-link {
  line-height: 1.6;
}

.file-link :deep(.el-link) {
  font-size: 13px;
}
</style>
