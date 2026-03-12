import { hrRequest } from './request'
import type { HrResponse } from '@/types'

export interface SalaryDateItem {
  [key: string]: any
}

// GET https://hr.china9.cn/index.php/baseapi/member/salary_date
export function getSalaryDateList(params?: Record<string, any>): Promise<HrResponse<SalaryDateItem[]>> {
  return hrRequest.get('https://hr.china9.cn/index.php/baseapi/member/salary_date', { params })
}
