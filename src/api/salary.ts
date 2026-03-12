import { hrLegacyRequest } from './request'
import type { HrResponse } from '@/types'

type UnknownRecord = Record<string, unknown>

export interface SalaryDateItem {
  date?: string
  month?: string
  total?: number | string
  actual_salary?: number | string
  salary_structure_id?: number | string
  salary_structure_is_confirm?: number | string | boolean
  remark?: string
  note?: string
  status?: string
  // 兼容接口不稳定字段
  [key: string]: unknown
}

export type SalaryDateListResponse = HrResponse<SalaryDateItem[]>

// GET /member/salary_date
export function getSalaryDateList(params?: UnknownRecord): Promise<SalaryDateListResponse> {
  return hrLegacyRequest.get('/member/salary_date', { params })
}
