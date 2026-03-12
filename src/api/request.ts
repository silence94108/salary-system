import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { getCookie, removeCookie } from '@/utils/cookie'

// ============ 公共参数 ============
const ENTERPRISE_SIDE = 'pc'

// ============ 防止重复提示 ============
let isShowingLoginExpired = false
let lastErrorMessage = ''
let lastErrorTime = 0

function showErrorOnce(message: string, duration = 3000) {
  const now = Date.now()
  // 相同消息 3 秒内不重复显示
  if (message === lastErrorMessage && now - lastErrorTime < duration) {
    return
  }
  lastErrorMessage = message
  lastErrorTime = now
  ElMessage.error(message)
}

function handleLoginExpired() {
  if (isShowingLoginExpired) return
  isShowingLoginExpired = true

  removeCookie('token')
  removeCookie('tokenU')
  ElMessage.error('登录已过期，请重新登录')

  setTimeout(() => {
    isShowingLoginExpired = false
    router.push('/login')
  }, 500)
}

// ============ 创建通用的拦截器配置函数 ============

// API 系统拦截器（成功码为 200）
function setupApiInterceptors(instance: AxiosInstance) {
  // 请求拦截器
  instance.interceptors.request.use(
    (config) => {
      // Token 注入（从 cookie 获取）
      const token = getCookie('token')
      if (token) {
        config.headers['token'] = token
      }

      // 自动添加 enterpriseSide 参数
      if (config.method?.toLowerCase() === 'get') {
        // GET 请求添加到 params
        config.params = {
          ...config.params,
          enterpriseSide: ENTERPRISE_SIDE
        }
      } else {
        // POST/PUT/DELETE 请求添加到 data
        if (config.data instanceof FormData) {
          config.data.append('enterpriseSide', ENTERPRISE_SIDE)
        } else {
          config.data = {
            ...config.data,
            enterpriseSide: ENTERPRISE_SIDE
          }
        }
      }

      return config
    },
    (error) => {
      console.error('请求错误:', error)
      return Promise.reject(error)
    }
  )

  // 响应拦截器
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      const res = response.data

      // code 为 200 表示成功
      if (res.code !== undefined && res.code !== 200) {
        // 101/401 等表示登录过期
        if (res.code === 101 || res.code === 401 || res.code === -1 || res.code === 403) {
          handleLoginExpired()
        } else {
          showErrorOnce(res.message || res.msg || '请求失败')
        }

        return Promise.reject(new Error(res.message || res.msg || '请求失败'))
      }

      return res
    },
    (error) => {
      console.error('响应错误:', error)
      handleHttpError(error)
      return Promise.reject(error)
    }
  )

  return instance
}

// HR 系统拦截器（成功码为 1）
function setupHrInterceptors(instance: AxiosInstance) {
  // 请求拦截器
  instance.interceptors.request.use(
    (config) => {
      // Token 注入（从 cookie 获取）- HR 系统使用 tokenU
      const tokenU = getCookie('tokenU')
      if (tokenU) {
        config.headers['Tokens'] = tokenU
      }

      // 自动添加 enterpriseSide 参数
      if (config.method?.toLowerCase() === 'get') {
        config.params = {
          ...config.params,
          enterpriseSide: ENTERPRISE_SIDE
        }
      } else {
        if (config.data instanceof FormData) {
          config.data.append('enterpriseSide', ENTERPRISE_SIDE)
        } else {
          config.data = {
            ...config.data,
            enterpriseSide: ENTERPRISE_SIDE
          }
        }
      }

      return config
    },
    (error) => {
      console.error('请求错误:', error)
      return Promise.reject(error)
    }
  )

  // 响应拦截器
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      const res = response.data

      // HR 系统 code 为 1 表示成功
      if (res.code !== undefined && res.code !== 1) {
        // code 101 = 登录过期
        if (res.code === 101 || res.code === 401 || res.code === -1 || res.code === 403) {
          handleLoginExpired()
        } else {
          showErrorOnce(res.message || res.msg || '请求失败')
        }

        return Promise.reject(new Error(res.message || res.msg || '请求失败'))
      }

      return res
    },
    (error) => {
      console.error('响应错误:', error)
      handleHttpError(error)
      return Promise.reject(error)
    }
  )

  return instance
}

// 通用 HTTP 错误处理
function handleHttpError(error: any) {
  if (error.response) {
    const status = error.response.status

    switch (status) {
      case 401:
        handleLoginExpired()
        break
      case 403:
        showErrorOnce('没有权限访问')
        break
      case 404:
        showErrorOnce('请求的资源不存在')
        break
      case 500:
        showErrorOnce('服务器错误')
        break
      default:
        showErrorOnce(error.message || '网络错误')
    }
  } else {
    showErrorOnce('网络连接失败')
  }
}

// ============ HR 系统接口实例 ============
// https://flexible.china9.cn
const hrService: AxiosInstance = setupHrInterceptors(
  axios.create({
    baseURL: import.meta.env.VITE_HR_BASE_URL || 'https://flexible.china9.cn/api',
    timeout: 0 // 永不超时
  })
)

// ============ HR Legacy 系统接口实例 ============
// https://hr.china9.cn/index.php/baseapi
const hrLegacyService: AxiosInstance = setupHrInterceptors(
  axios.create({
    baseURL: import.meta.env.VITE_HR_LEGACY_BASE_URL || 'https://hr.china9.cn/index.php/baseapi',
    timeout: 0 // 永不超时
  })
)

// ============ 业务 API 接口实例 ============
// https://api.china9.cn/api
const apiService: AxiosInstance = setupApiInterceptors(
  axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.china9.cn/api',
    timeout: 0 // 永不超时
  })
)

// ============ 封装请求方法 ============

// HR 系统请求 (https://flexible.china9.cn)
export const hrRequest = {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return hrService.get(url, config)
  },
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return hrService.post(url, data, config)
  },
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return hrService.put(url, data, config)
  },
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return hrService.delete(url, config)
  }
}

// HR Legacy 系统请求 (https://hr.china9.cn/index.php/baseapi)
export const hrLegacyRequest = {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return hrLegacyService.get(url, config)
  },
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return hrLegacyService.post(url, data, config)
  },
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return hrLegacyService.put(url, data, config)
  },
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return hrLegacyService.delete(url, config)
  }
}

// 业务 API 请求 (https://api.china9.cn/api)
export const apiRequest = {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return apiService.get(url, config)
  },
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return apiService.post(url, data, config)
  },
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return apiService.put(url, data, config)
  },
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return apiService.delete(url, config)
  }
}

// 默认导出 API 请求
export const request = apiRequest

export { hrService, hrLegacyService, apiService }
export default apiService
