import { hrLegacyRequest, hrLegacyNoIndexRequest } from './request'
import { getCookie } from '@/utils/cookie'
import type { HrResponse, SalaryDetail, SalaryConfirmRequest } from '@/types'

type UnknownRecord = Record<string, unknown>

export interface SalaryDateItem {
  date?: string
  month?: string
  user_id?: string | number
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

// POST /member/archives_details_wages - 获取工资详情
export function getSalaryDetail(params: {
  user_id: string
  date: string
}): Promise<SalaryDetail> {
  const tokenU = getCookie('tokenU')
  const formData = new FormData()
  formData.append('tokens', tokenU || '')
  formData.append('user_id', params.user_id)
  formData.append('date', params.date)

  // 这个接口的成功码是 code !== 0，需要绕过拦截器的标准判断和错误提示
  return hrLegacyNoIndexRequest.post('/member/archives_details_wages', formData, {
    skipErrorToast: true
  } as any)
    .catch((error) => {
      // 拦截器会因为 code !== 1 而 reject，但我们需要拿到原始响应判断
      if (error.response?.data) {
        const res = error.response.data
        // 这个接口 code !== 0 才是成功
        if (res.code !== 0) {
          return res as SalaryDetail
        }
      }
      // 真正的网络错误或 code === 0 的失败
      throw new Error('获取工资详情失败')
    })
}

// POST /member/yg_salary_confirm - 确认工资或提出异议
export function confirmSalary(data: SalaryConfirmRequest): Promise<HrResponse<any>> {
  const tokenU = getCookie('tokenU')
  const formData = new FormData()
  formData.append('tokens', tokenU || '')
  formData.append('is_confirm', String(data.is_confirm))
  formData.append('salary_structure_id', String(data.salary_structure_id))
  if (data.remarks) {
    formData.append('remarks', data.remarks)
  }

  // 这个接口的成功码是 code === 200，需要绕过拦截器的标准判断和错误提示
  return hrLegacyNoIndexRequest.post('/member/yg_salary_confirm', formData, {
    skipErrorToast: true
  } as any)
    .catch((error) => {
      // 拦截器会因为 code !== 1 而 reject，但我们需要拿到原始响应判断
      if (error.response?.data) {
        const res = error.response.data
        // 这个接口 code === 200 才是成功
        if (res.code === 200) {
          return res
        }
      }
      // 真正的网络错误或其他失败
      throw new Error('操作失败')
    })
}
