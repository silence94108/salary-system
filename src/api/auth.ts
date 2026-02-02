import { apiRequest } from './request'
import type { LoginRequest, LoginResponse, ApiResponse } from '@/types'

// 登录接口
// POST https://api.china9.cn/api/login/auth
export function login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
  return apiRequest.post('/login/auth', data)
}

// 获取用户信息（根据实际接口调整）
export function getUserInfo(): Promise<ApiResponse<any>> {
  return apiRequest.get('/user/info')
}

// 退出登录（根据实际接口调整）
export function logout(): Promise<ApiResponse<any>> {
  return apiRequest.post('/logout')
}
