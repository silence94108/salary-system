import { hrRequest } from './request'
import type { TaskListRequest, TaskListResponse, HrResponse } from '@/types'

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
