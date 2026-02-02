import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi } from '@/api/auth'
import type { UserInfo } from '@/types'
import router from '@/router'
import { getCookie, setCookie, removeCookie } from '@/utils/cookie'
import { useProjectStore } from '@/stores/project'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref<string>(getCookie('token') || '')         // API 系统 token
  const tokenU = ref<string>(getCookie('tokenU') || '')       // HR 系统 token（U结尾）
  const userInfo = ref<UserInfo | null>(null)
  const companyName = ref<string>(localStorage.getItem('companyName') || '')

  // 计算属性
  const isLoggedIn = computed(() => !!token.value)

  // 登录
  async function login(user_name: string, password: string) {
    try {
      const res = await loginApi({
        user_name,
        password,
        type: 'company',
        enterpriseSide: 'pc'
      })

      // 根据响应格式处理
      // { code: 200, data: { token, user: { username, token: tokenU }, gcc } }
      const data = res.data

      // 保存 token 到 cookie（API 系统用）
      token.value = data.token
      setCookie('token', data.token, 7)

      // 保存用户信息
      if (data.user) {
        userInfo.value = {
          id: 0,
          username: data.user.username,
          name: data.user.username,
          ...data.user
        }
        localStorage.setItem('userInfo', JSON.stringify(userInfo.value))

        // 保存 tokenU 到 cookie（HR 系统用，在 user.token 里）
        if (data.user.token) {
          tokenU.value = data.user.token
          setCookie('tokenU', data.user.token, 7)
        }
      }

      // 保存公司名称
      if (data.gcc) {
        companyName.value = data.gcc
        localStorage.setItem('companyName', data.gcc)
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, message: error.message || '登录失败' }
    }
  }

  // 退出登录
  function logout() {
    // 重置项目store
    const projectStore = useProjectStore()
    projectStore.resetStore()

    token.value = ''
    tokenU.value = ''
    userInfo.value = null
    companyName.value = ''
    removeCookie('token')
    removeCookie('tokenU')
    localStorage.removeItem('userInfo')
    localStorage.removeItem('companyName')
    router.push('/login')
  }

  // 初始化用户信息（页面刷新时从 localStorage 恢复）
  function initUserInfo() {
    const savedUserInfo = localStorage.getItem('userInfo')
    if (savedUserInfo) {
      try {
        userInfo.value = JSON.parse(savedUserInfo)
      } catch (e) {
        // ignore
      }
    }
  }

  // 设置 token
  function setToken(newToken: string) {
    token.value = newToken
    setCookie('token', newToken, 7)
  }

  return {
    token,
    tokenU,
    userInfo,
    companyName,
    isLoggedIn,
    login,
    logout,
    initUserInfo,
    setToken
  }
})
