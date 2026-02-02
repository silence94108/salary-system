# 薪资佣金计算系统 - 需求大纲

## 一、项目概述

### 1.1 项目信息
- **项目名称**: salary-system (薪资佣金计算系统)
- **项目路径**: `E:\Desktop\salary-system`
- **技术栈**: Vue3 + TypeScript + Vite + Element Plus + Pinia + Vue Router + Axios

### 1.2 项目目标
开发一个薪资佣金计算系统，对接现有后端接口，实现：
1. 用户登录认证
2. 获取项目数据
3. 按月计算员工薪资佣金

---

## 二、技术架构

### 2.1 技术选型
| 类别 | 技术 | 说明 |
|------|------|------|
| 框架 | Vue 3.x | Composition API + script setup |
| 语言 | TypeScript | 类型安全 |
| 构建 | Vite | 快速开发体验 |
| UI库 | Element Plus | 企业级组件库 |
| 路由 | Vue Router 4 | 页面路由 |
| 状态 | Pinia | 状态管理 |
| 请求 | Axios | HTTP 请求 |

### 2.2 目录结构
```
salary-system/
├── src/
│   ├── api/                # API 接口定义
│   │   ├── request.ts      # Axios 实例配置（拦截器、Token注入）
│   │   ├── auth.ts         # 登录相关接口
│   │   └── project.ts      # 项目数据接口
│   ├── assets/             # 静态资源
│   ├── components/         # 公共组件
│   ├── layouts/            # 布局组件
│   │   └── MainLayout.vue  # 主布局（侧边栏+头部+内容区）
│   ├── router/             # 路由配置
│   │   └── index.ts        # 路由定义 + 导航守卫
│   ├── stores/             # Pinia 状态管理
│   │   ├── user.ts         # 用户状态（token、用户信息）
│   │   └── project.ts      # 项目数据状态
│   ├── views/              # 页面组件
│   │   ├── Login.vue       # 登录页
│   │   └── SalaryCalc.vue  # 薪资计算页
│   ├── utils/              # 工具函数
│   ├── types/              # TypeScript 类型定义
│   │   └── index.ts
│   ├── App.vue
│   └── main.ts
├── .env                    # 环境变量（API基础地址）
└── package.json
```

---

## 三、功能模块

### 3.1 登录模块
**页面**: `/login`

**功能**:
- 用户名/密码输入表单
- 调用后端登录接口获取 Token
- Token 存储到 localStorage
- 登录成功跳转到主页
- 表单校验

**接口对接** (待用户提供具体格式):
```
POST /api/login
请求: { username, password }
响应: { token, userInfo? }
```

### 3.2 主布局 (MainLayout)
**功能**:
- 顶部导航栏（显示用户信息、退出登录按钮）
- 侧边菜单栏（薪资计算等菜单项）
- 内容区域（router-view）

### 3.3 项目数据模块
**功能**:
- 登录后请求头携带 Token
- 调用接口获取项目列表数据
- 项目数据用于薪资计算

**接口对接** (待用户提供具体格式):
```
GET /api/projects
请求头: Authorization: Bearer <token>
响应: { projects: [...] }
```

### 3.4 薪资计算模块
**页面**: `/salary`

**功能**:
1. 设置底薪（接口获取或手动输入，待确认）
2. 选择计算月份
3. 自动筛选该月完结的项目
4. 按佣金规则分别计算每个项目的实得佣金
5. 汇总：底薪 + 所有实得佣金 = 当月应发薪资
6. 展示明细表格和汇总结果

**佣金计算规则**:
| 规则 | 条件 | 佣金比例 | 备注 |
|------|------|---------|------|
| ① | 抢单佣金 ≥ 底薪×2 | 70% | 超期/严重超期按50% |
| ② | 抢单佣金 ≥ 底薪 | 50% | - |
| ③ | 底薪/2 ≤ 抢单佣金 < 底薪 | 30% | 当月发薪资=佣金×30%+底薪 |
| ④ | 抢单佣金 < 底薪/2 | 0% | 只发底薪 |

---

## 四、路由设计

```
/login          → 登录页（无需认证）
/               → 主布局（需要认证）
  /salary       → 薪资计算页
  （后续可扩展更多页面）
```

**路由守卫逻辑**:
- 无 Token 访问受保护页面 → 重定向到 /login
- 有 Token 访问 /login → 重定向到 /salary

---

## 五、状态管理 (Pinia Stores)

### 5.1 userStore
- token: 登录凭证
- userInfo: 用户信息
- login(): 调用登录接口
- logout(): 清除token，跳转登录页

### 5.2 projectStore
- projects: 项目列表
- baseSalary: 底薪
- fetchProjects(): 获取项目数据

---

## 六、Axios 配置

- baseURL: 从 .env 读取
- 请求拦截器: 自动携带 Token (Authorization: Bearer xxx)
- 响应拦截器: 401 状态码自动跳转登录页

---

## 七、待用户确认事项

### 接口相关（必须）
- [ ] API 基础地址 (baseURL)
- [ ] 登录接口：地址、请求参数、响应格式
- [ ] 项目列表接口：地址、响应格式
- [ ] Token 传递方式（Header名称、格式）

### 业务相关
- [ ] 项目数据字段有哪些（特别是：佣金金额、接单时间、完结时间、是否超期）
- [ ] 底薪从接口获取还是手动输入
- [ ] 是否需要其他页面

---

## 八、开发进度

### 已完成
- [x] 项目初始化 (Vue3 + Vite + TypeScript)
- [x] 安装核心依赖 (element-plus, vue-router, pinia, axios, @element-plus/icons-vue)

### 待开发
- [ ] 项目基础配置（Element Plus 引入、路由、Pinia、Axios）
- [ ] 登录页面 + 登录逻辑
- [ ] 主布局（顶栏+侧边栏）
- [ ] 薪资计算页面
- [ ] 对接真实接口

---

## 九、本地开发

```bash
cd E:\Desktop\salary-system
npm run dev
# 默认运行在 http://localhost:5173
```
