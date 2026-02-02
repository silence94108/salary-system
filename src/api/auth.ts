import { request } from './request'
import type { LoginRequest, LoginResponse, ApiResponse } from '@/types'

// 登录接口（根据实际接口调整）
export function login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
  return request.post('/login', data)
}

// 获取用户信息（根据实际接口调整）
export function getUserInfo(): Promise<ApiResponse<any>> {
  return request.get('/user/info')
}

// 退出登录（根据实际接口调整）
export function logout(): Promise<ApiResponse<any>> {
  return request.post('/logout')
}
