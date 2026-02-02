// 用户相关类型
export interface UserInfo {
  id: number
  username: string
  name?: string
  avatar?: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  userInfo?: UserInfo
}

// 项目相关类型
export interface Project {
  id: number
  name: string              // 项目名称
  commission: number        // 抢单佣金金额
  orderMonth: string        // 接单月份 (格式: 2025-01)
  finishMonth?: string      // 完结月份 (格式: 2025-01，空表示未完结)
  isOverdue?: boolean       // 是否超期/严重超期
  status?: string           // 状态
  createTime?: string       // 创建时间
  [key: string]: any        // 其他字段
}

// 佣金计算结果
export interface CommissionResult {
  rule: string              // 规则名称
  ruleNum: number           // 规则编号 1-4
  rate: number              // 佣金比例
  actualCommission: number  // 实得佣金
}

// API 响应通用格式（根据实际接口调整）
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}
