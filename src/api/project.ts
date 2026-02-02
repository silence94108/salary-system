import { hrRequest } from './request'
import type { TaskListRequest, TaskListResponse, HrResponse } from '@/types'

// 获取我的任务列表
// POST https://flexible.china9.cn/api/taskorder/myorderindex
export function getMyTaskList(params: TaskListRequest): Promise<HrResponse<TaskListResponse>> {
  return hrRequest.post('/taskorder/myorderindex', params)
}
