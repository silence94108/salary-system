import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi, logout as logoutApi } from '@/api/auth'
import type { UserInfo, LoginRequest } from '@/types'
import router from '@/router'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref<string>(localStorage.getItem('token') || '')
  const userInfo = ref<UserInfo | null>(null)

  // 计算属性
  const isLoggedIn = computed(() => !!token.value)

  // 登录
  async function login(loginData: LoginRequest) {
    try {
      const res = await loginApi(loginData)
      // 根据实际接口响应格式调整
      const data = res.data || res

      token.value = data.token
      localStorage.setItem('token', data.token)

      if (data.userInfo) {
        userInfo.value = data.userInfo
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, message: error.message || '登录失败' }
    }
  }

  // 退出登录
  async function logout() {
    try {
      await logoutApi()
    } catch (e) {
      // 即使接口失败也要清除本地状态
    }

    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
    router.push('/login')
  }

  // 设置 token（用于初始化或刷新）
  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  // 清除用户状态
  function clearUser() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    login,
    logout,
    setToken,
    clearUser
  }
})
