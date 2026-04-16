# 抢单平台 - 项目说明

## Git 提交规范

- 每次修改后立即提交
- 提交信息使用中文
- 提交信息简洁明了，描述本次修改的内容

## 技术栈

- Vue 3 + TypeScript + Vite
- Element Plus（UI 组件库，已配置中文语言包）
- Pinia（状态管理）
- Vue Router（路由）
- Axios（HTTP 请求）

## API 接口

### HR 系统 API
- 基础地址：`https://flexible.china9.cn/api`
- 认证方式：`Tokens` header（注意不是 Authorization）
- Token 字段：`tokenU`（存储在 Cookie）

### API 系统
- 基础地址：`https://api.china9.cn/api`
- 认证方式：`Authorization: Bearer {token}`
- Token 字段：`token`（存储在 Cookie）

## 认证机制

- 双 Token 系统：`token`（API系统）和 `tokenU`（HR系统）
- Cookie 存储，7天过期
- 401 响应自动跳转登录页
- 错误提示去重处理

## 核心功能

### 我的任务 (/tasks)
- 任务列表展示，支持分页
- 筛选条件：项目名称、任务状态、接单时间、完结时间、截止时间
- 日期筛选支持快捷选项（本月、上月、近3个月、近半年、今年）
- 状态标签颜色区分

### 薪资计算 (/salary)
- 按完结月份查询项目
- 佣金计算基于接单月份的总接单金额

## 佣金计算规则

基于接单月份总佣金 vs 当月底薪计算：

### 新规则 (2026-04 起)

| 条件 | 实得比例 |
|------|----------|
| 总佣金 ≥ 底薪 | 50% |
| 总佣金 < 底薪 | 30% |

### 旧规则 (2026-04 前)

| 条件 | 实得比例 |
|------|----------|
| 总佣金 ≥ 2倍底薪 | 70% (逾期50%) |
| 总佣金 ≥ 底薪 | 50% |
| 总佣金 ≥ 底薪/2 | 30% |
| 总佣金 < 底薪/2 | 0% |

**注意**: 新规则取消了逾期扣减机制

## 底薪计算

- 基础底薪：用户设置（默认 3000）
- 入职日期：用户设置（YYYY-MM-DD 格式）
- 工龄工资：入职满 N 年后，底薪 + N × 100
- 判断逻辑：以接单月份为准，判断是否已过入职周年

## 数据存储

- 用户设置按账号隔离存储
- localStorage key 格式：`salary_baseSalary_{username}`、`salary_entryDate_{username}`
- 切换账号时自动加载对应设置

## 响应式设计

- 支持手机端适配
- 侧边栏在手机端为抽屉式覆盖
- 表单、卡片、表格自适应布局
- 开发服务器配置 `host: '0.0.0.0'` 支持 IP 访问

## 项目结构

```
src/
├── api/           # API 接口定义
├── layouts/       # 布局组件（MainLayout）
├── stores/        # Pinia 状态管理（user, project）
├── types/         # TypeScript 类型定义
├── utils/         # 工具函数（cookie, request）
├── views/         # 页面组件
│   ├── Login.vue
│   ├── MyTasks.vue
│   └── SalaryCalc.vue
└── router/        # 路由配置
```
