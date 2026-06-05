<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Delete, UploadFilled } from '@element-plus/icons-vue'
import { applyForFinish, editEnclosure, uploadFile } from '@/api/project'

interface EnclosureRow {
  annex: string
  username: string
  password: string
}

interface UploadedFile {
  id: number | string
  name: string
  url: string
}

const props = withDefaults(defineProps<{
  visible: boolean
  projectId: number | string       // 项目/任务 id（新增提交用）
  type?: 'add' | 'edit'             // 新增 or 编辑
  appendlogId?: number | string     // 编辑时的 appendlog id
  initData?: {                      // 编辑时回填的数据
    enclosure?: EnclosureRow[]
    fileList?: any[]
    description?: string
  } | null
}>(), {
  type: 'add',
  appendlogId: '',
  initData: null
})

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}>()

const submitting = ref(false)
const uploading = ref(false)

const form = reactive<{
  enclosure: EnclosureRow[]
  image: string                     // 文件 id 逗号拼接
  fileList: UploadedFile[]
  description: string
}>({
  enclosure: [{ annex: '', username: '', password: '' }],
  image: '',
  fileList: [],
  description: ''
})

// 打开时初始化 / 回填
function initForm() {
  const rows = props.initData?.enclosure
  form.enclosure = rows && rows.length
    ? rows.map((r) => ({ annex: r.annex || '', username: r.username || '', password: r.password || '' }))
    : [{ annex: '', username: '', password: '' }]

  const files = props.initData?.fileList || []
  form.fileList = files.map((f: any) => ({
    id: f.id,
    name: f.filename || f.name || '附件',
    url: f.fileurl || f.url || ''
  }))
  form.image = form.fileList.map((f) => f.id).join(',')
  form.description = props.initData?.description || ''
}

watch(() => props.visible, (val) => {
  if (val) initForm()
})

function addRow() {
  form.enclosure.push({ annex: '', username: '', password: '' })
}

function removeRow(index: number) {
  if (form.enclosure.length === 1) return
  form.enclosure.splice(index, 1)
}

// 自定义上传：上传接口成功码 200，返回文件对象
async function handleUpload(options: any) {
  const file: File = options.file
  if (file.size > 20 * 1024 * 1024) {
    ElMessage.error('文件大小不能超过 20M')
    options.onError?.(new Error('文件过大'))
    return
  }
  uploading.value = true
  try {
    const res = await uploadFile(file)
    if (res.code === 200) {
      const f = res.data
      const uploaded: UploadedFile = {
        id: f.id,
        name: f.filename || f.name || file.name,
        url: f.fileurl || f.url || ''
      }
      form.fileList.push(uploaded)
      form.image = form.fileList.map((v) => v.id).join(',')
      ElMessage.success(res.msg || '上传成功')
      options.onSuccess?.(res)
    } else {
      ElMessage.error(res.msg || '上传失败')
      options.onError?.(new Error(res.msg))
    }
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error('上传失败，请稍后再试')
    options.onError?.(error)
  } finally {
    uploading.value = false
  }
}

function handleRemoveFile(file: any) {
  const id = file.id ?? file.uid
  form.fileList = form.fileList.filter((v) => v.id !== id)
  form.image = form.fileList.map((v) => v.id).join(',')
}

function handleClose() {
  emit('update:visible', false)
}

async function submit() {
  // 校验：每行附件地址必填
  if (form.enclosure.some((r) => !r.annex.trim())) {
    ElMessage.warning('请填写附件地址')
    return
  }

  const params = {
    id: props.type === 'edit' ? Number(props.appendlogId) : Number(props.projectId),
    description: form.description,
    image: form.image,
    annex: form.enclosure.map((v) => v.annex).join(','),
    username: form.enclosure.map((v) => v.username).join(','),
    password: form.enclosure.map((v) => v.password).join(',')
  }

  submitting.value = true
  try {
    const res = props.type === 'edit' ? await editEnclosure(params) : await applyForFinish(params)
    if (res.code === 1) {
      ElMessage.success('保存成功')
      emit('success')
      handleClose()
    } else {
      ElMessage.error(res.msg || '保存失败')
    }
  } catch (error) {
    console.error('保存功能地址失败:', error)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    :title="type === 'edit' ? '编辑功能地址' : '新增功能地址'"
    width="min(720px, 94vw)"
    :close-on-click-modal="false"
    @update:model-value="handleClose"
  >
    <div class="enclosure-form">
      <div v-for="(row, index) in form.enclosure" :key="index" class="enclosure-row">
        <div class="row-fields">
          <el-input v-model="row.annex" placeholder="功能地址（必填）" />
          <el-input v-model="row.username" placeholder="账号" />
          <el-input v-model="row.password" placeholder="密码" />
        </div>
        <el-button
          v-if="form.enclosure.length > 1"
          class="row-del"
          type="danger"
          :icon="Delete"
          circle
          plain
          @click="removeRow(index)"
        />
      </div>

      <el-button class="add-row-btn" type="primary" plain :icon="Plus" @click="addRow">
        新增功能地址
      </el-button>

      <div class="form-block">
        <div class="block-label">附件</div>
        <el-upload
          class="enclosure-upload"
          :http-request="handleUpload"
          :file-list="form.fileList as any"
          :on-remove="handleRemoveFile"
          multiple
        >
          <el-button :icon="UploadFilled" :loading="uploading">上传文件</el-button>
          <template #tip>
            <div class="upload-tip">支持图片/Office/PDF/压缩包等，单个最大 20M</div>
          </template>
        </el-upload>
      </div>

      <div class="form-block">
        <div class="block-label">备注</div>
        <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入备注" />
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="submit">提交</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.enclosure-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.enclosure-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.row-fields {
  flex: 1;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 8px;
}

.row-del {
  flex-shrink: 0;
}

.add-row-btn {
  align-self: flex-start;
}

.form-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.block-label {
  font-weight: 500;
  color: var(--fg, #333);
  font-size: 14px;
}

.upload-tip {
  font-size: 12px;
  color: var(--fg-3, #999);
  margin-top: 4px;
}

@media screen and (max-width: 768px) {
  .row-fields {
    grid-template-columns: 1fr;
  }
}
</style>
