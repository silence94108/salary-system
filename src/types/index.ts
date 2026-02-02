// 用户相关类型
export interface UserInfo {
  id: number
  username: string
  name?: string
  avatar?: string
  [key: string]: any
}

export interface LoginRequest {
  user_name: string
  password: string
  type: 'company' | 'personal'  // company=企业, personal=个人
  enterpriseSide: 'pc' | 'mobile'
}

export interface LoginResponse {
  token: string
  userInfo?: UserInfo
  [key: string]: any
}

// 任务订单类型（来自 /taskorder/myorderindex 接口）
export interface TaskOrder {
  id: number
  oid: number                    // 订单ID
  name: string                   // 任务名称
  hall_customer: string          // 客户名称
  bountymoney: string            // 抢单佣金金额
  hall_user_money: string        // 用户分成金额
  hall_total_money: string       // 总金额
  ordertime: string              // 接单时间
  performtime: string            // 履约时间（开始执行时间）
  completiontime: string         // 完结时间
  enddatatime: string            // 截止日期
  status: string                 // 状态码
  statustxt: string              // 状态文字
  orderstatus: number            // 订单状态
  syday: number | string         // 逾期天数（负数=逾期，正数=提前）
  button_color: number           // 颜色标识（3=逾期红色，2=正常绿色）
  button_info: string            // 逾期信息（如"逾期252天"）
  hallTypeTitle: string          // 任务类型
  company: string                // 公司名称
  username: string               // 用户名
  [key: string]: any
}

// 任务列表请求参数
export interface TaskListRequest {
  page?: number
  limit?: number
  status?: string
  name?: string
  orderType?: string
  hall_type?: string
  order?: 'asc' | 'desc'
  sort?: string
  bountymoney?: string[]
  completiontime?: string[]
  enddatatime?: string[]
  ordertime?: string[]
  performtime?: string[]
}

// 任务列表响应
export interface TaskListResponse {
  total: number
  per_page: string
  current_page: number
  last_page: number
  data: TaskOrder[]
}

// 项目相关类型（用于薪资计算）
export interface Project {
  id: number
  name: string              // 项目名称
  commission: number        // 抢单佣金金额
  orderMonth: string        // 接单月份 (格式: 2025-01)
  finishMonth?: string      // 完结月份 (格式: 2025-01，空表示未完结)
  isOverdue?: boolean       // 是否超期/严重超期
  overdueDays?: number      // 逾期天数
  status?: string           // 状态
  orderstatus?: number      // 执行状态
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

// API 响应通用格式（API 系统，code=200）
export interface ApiResponse<T = any> {
  code: number
  message?: string
  msg?: string
  data: T
  [key: string]: any
}

// HR 系统响应格式（code=1）
export interface HrResponse<T = any> {
  code: number
  msg: string
  time: string
  data: T
}
