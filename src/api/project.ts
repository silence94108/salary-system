import axios from 'axios'
import { hrRequest } from './request'
import { getCookie } from '@/utils/cookie'
import type { TaskListRequest, TaskListResponse, HrResponse } from '@/types'

const HR_BASE_URL = import.meta.env.VITE_HR_BASE_URL || 'https://flexible.china9.cn/api'

// 获取我的任务列表
// POST https://flexible.china9.cn/api/taskorder/myorderindex
export function getMyTaskList(params: TaskListRequest): Promise<HrResponse<TaskListResponse>> {
  return hrRequest.post('/taskorder/myorderindex', params)
}

// 获取任务大厅列表
// POST https://flexible.china9.cn/api/taskorder/orderindex
export function getTaskHallList(params: TaskListRequest & { enterpriseSide?: string }): Promise<HrResponse<TaskListResponse>> {
  return hrRequest.post('/taskorder/orderindex', params)
}

// 检查是否有正在执行的任务
// GET https://flexible.china9.cn/api/taskorder/querytask
export function checkTaskStatus(): Promise<HrResponse<number>> {
  return hrRequest.get('/taskorder/querytask')
}

// 接取任务
// POST https://flexible.china9.cn/api/taskorder/addtask
export function takeTask(params: { id: number; remark?: string }): Promise<HrResponse<any>> {
  return hrRequest.post('/taskorder/addtask', params)
}

// 获取任务详情（接取前查看）
// POST https://flexible.china9.cn/api/taskorder/takeshow
export function getTaskDetail(params: { id: number }): Promise<HrResponse<any>> {
  return hrRequest.post('/taskorder/takeshow', params)
}

// 获取项目/任务详情（已接取）
// POST https://flexible.china9.cn/api/taskorder/show
export function getProjectDetail(params: { id: number }): Promise<HrResponse<any>> {
  return hrRequest.post('/taskorder/show', params)
}

// 功能地址提交参数
export interface EnclosureSubmit {
  id: number
  description?: string
  image?: string      // 附件文件 id，逗号拼接
  annex: string       // 功能地址，逗号拼接
  username: string    // 账号，逗号拼接
  password: string    // 密码，逗号拼接
}

// 同步客户信息 / 需求文档（按项目编号）
// POST https://flexible.china9.cn/api/taskorder/getCustomerByNumbersy
export function syncProject(params: { orderNumber: string }): Promise<HrResponse<any>> {
  return hrRequest.post('/taskorder/getCustomerByNumbersy', params)
}

// 执行情况列表（项目下各子任务执行进度）
// POST https://flexible.china9.cn/api/taskorder/getHallShow
export function getPerformanceList(params: { id: number; page?: number; limit?: number }): Promise<HrResponse<any>> {
  return hrRequest.post('/taskorder/getHallShow', params)
}

// 申请完结（首次提交功能地址 + 附件）
// POST https://flexible.china9.cn/api/taskorder/addappend
export function applyForFinish(params: EnclosureSubmit): Promise<HrResponse<any>> {
  return hrRequest.post('/taskorder/addappend', params)
}

// 编辑已提交的功能地址
// POST https://flexible.china9.cn/api/taskorder/editAppend
export function editEnclosure(params: EnclosureSubmit): Promise<HrResponse<any>> {
  return hrRequest.post('/taskorder/editAppend', params)
}

// 上报完结（拆分任务单条上报）
// POST https://flexible.china9.cn/api/taskorder/operationUp
export function taskEndSplit(params: { id: number }): Promise<HrResponse<any>> {
  return hrRequest.post('/taskorder/operationUp', params)
}

// 上传附件（multipart/form-data，返回文件信息含 id、fileurl、filename）
// 注意：上传接口成功码为 200（与 HR 系统的 1 不同），故独立调用绕过 hrRequest 拦截器
// POST https://flexible.china9.cn/api/ajax/upload
export async function uploadFile(file: File): Promise<HrResponse<any>> {
  const tokenU = getCookie('tokenU') || ''
  const formData = new FormData()
  formData.append('file', file)
  formData.append('name', file.name)
  formData.append('tokens', tokenU)
  formData.append('enterpriseSide', 'pc')
  const res = await axios.post(`${HR_BASE_URL}/ajax/upload`, formData, {
    headers: { Tokens: tokenU }
  })
  return res.data
}
