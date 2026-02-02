import { request } from './request'
import type { Project, ApiResponse } from '@/types'

// 获取项目列表（根据实际接口调整）
export function getProjects(params?: any): Promise<ApiResponse<Project[]>> {
  return request.get('/projects', { params })
}

// 获取单个项目详情（根据实际接口调整）
export function getProjectById(id: number): Promise<ApiResponse<Project>> {
  return request.get(`/projects/${id}`)
}

// 获取底薪配置（如果有接口的话）
export function getBaseSalary(): Promise<ApiResponse<{ baseSalary: number }>> {
  return request.get('/salary/base')
}
