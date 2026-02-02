# 薪资佣金计算系统

## 一、项目概述

### 1.1 项目信息
- **项目名称**: salary-system (薪资佣金计算系统)
- **技术栈**: Vue3 + TypeScript + Vite + Element Plus + Pinia + Vue Router + Axios
- **远程仓库**: https://gitee.com/Silence108/salary-system.git

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
│   │   ├── request.ts      # Axios 实例配置（双实例、拦截器、Token注入）
│   │   ├── auth.ts         # 登录相关接口
│   │   └── project.ts      # 项目数据接口
│   ├── assets/             # 静态资源
│   ├── components/         # 公共组件
│   ├── layouts/            # 布局组件
│   │   └── MainLayout.vue  # 主布局（侧边栏+头部+内容区）
│   ├── router/             # 路由配置
│   │   └── index.ts        # 路由定义 + 导航守卫
│   ├── stores/             # Pinia 状态管理
│   │   ├── user.ts         # 用户状态（token、用户信息、公司名）
│   │   └── project.ts      # 项目数据状态
│   ├── utils/              # 工具函数
│   │   └── cookie.ts       # Cookie 操作工具
│   ├── views/              # 页面组件
│   │   ├── Login.vue       # 登录页
│   │   └── SalaryCalc.vue  # 薪资计算页
│   ├── types/              # TypeScript 类型定义
│   │   └── index.ts
│   ├── App.vue
│   └── main.ts
├── .env                    # 环境变量（API基础地址）
└── package.json
```

---

## 三、API 配置

### 3.1 双接口实例
项目使用两个 API 基础地址：

| 实例 | 基础地址 | 用途 |
|------|---------|------|
| hrRequest | https://flexible.china9.cn | HR 系统接口 |
| apiRequest | https://api.china9.cn/api | 业务 API 接口 |

### 3.2 请求拦截器
- **Token 注入**: 从 Cookie 获取 token，添加到请求头 `token` 字段
- **enterpriseSide**: 所有请求自动添加 `enterpriseSide: "pc"` 参数
  - GET 请求: 添加到 query params
  - POST/PUT/DELETE: 添加到 request body

### 3.3 登录接口
```
POST /login/auth (使用 apiRequest)
请求参数:
{
  user_name: string,      // 用户名/手机号
  password: string,       // 密码
  type: "company",        // 登录类型
  enterpriseSide: "pc"    // 自动添加
}

响应格式:
{
  code: 200,
  data: {
    token: string,
    gcc: string,           // 公司名称
    user: {
      username: string
    }
  }
}
```

### 3.4 Token 存储
- Token 存储在 **Cookie** 中（7天过期）
- 用户信息存储在 localStorage

---

## 四、功能模块

### 4.1 登录模块
**页面**: `/login`

**功能**:
- 用户名/密码输入表单
- 调用后端登录接口获取 Token
- Token 存储到 Cookie
- 登录成功跳转到主页
- 表单校验

### 4.2 主布局 (MainLayout)
**功能**:
- 顶部导航栏（显示公司名称、用户名、退出登录按钮）
- 侧边菜单栏（薪资计算等菜单项）
- 内容区域（router-view）

### 4.3 薪资计算模块
**页面**: `/salary`

**功能**:
1. 设置底薪（手动输入，保存到 localStorage）
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

## 五、路由设计

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

## 六、状态管理 (Pinia Stores)

### 6.1 userStore
- token: 登录凭证（存储在 Cookie）
- userInfo: 用户信息
- companyName: 公司名称
- login(): 调用登录接口
- logout(): 清除 token，跳转登录页
- initUserInfo(): 从 localStorage 恢复用户信息

### 6.2 projectStore
- projects: 项目列表
- baseSalary: 底薪
- fetchProjects(): 获取项目数据
- getFinishedByMonth(): 获取指定月份完结的项目
- calculateCommission(): 计算单个项目佣金

---

## 七、开发进度

### 已完成
- [x] 项目初始化 (Vue3 + Vite + TypeScript)
- [x] 安装核心依赖 (element-plus, vue-router, pinia, axios)
- [x] 项目基础配置（Element Plus 引入、路由、Pinia、Axios）
- [x] 登录页面 + 登录逻辑
- [x] 主布局（顶栏+侧边栏）
- [x] 薪资计算页面
- [x] Token 存储改为 Cookie
- [x] 自动添加 enterpriseSide 参数

### 待开发
- [ ] 对接项目列表接口（待用户提供接口信息）
- [ ] 测试登录流程

---

## 八、待确认事项

### 接口相关
- [ ] 项目列表接口：地址、响应格式
- [ ] 项目数据字段（佣金金额、接单时间、完结时间、是否超期）

### 业务相关
- [ ] 底薪是否从接口获取
- [ ] 是否需要其他页面

---

## 九、本地开发

```bash
cd E:\Desktop\salary-system
npm install
npm run dev
# 默认运行在 http://localhost:5173
```

## 十、Git 操作

```bash
# 提交代码
git add .
git commit -m "提交信息"
git push

# 拉取代码
git pull
```
