import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { getCookie } from '@/utils/cookie'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false, title: '登录' }
  },
  {
    // 设计系统 Demo 页（独立预览，无需登录）
    path: '/design',
    name: 'DesignSystem',
    component: () => import('@/views/DesignSystem.vue'),
    meta: { requiresAuth: false, title: '设计系统 · 活力科技橙' }
  },
  {
    // Logo 候选对比页（无需登录）
    path: '/logo-picker',
    name: 'LogoPicker',
    component: () => import('@/views/LogoPicker.vue'),
    meta: { requiresAuth: false, title: 'Logo 候选对比' }
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/hall'
      },
      {
        path: 'hall',
        name: 'TaskHall',
        component: () => import('@/views/TaskHall.vue'),
        meta: { title: '任务大厅' }
      },
      {
        path: 'tasks',
        name: 'MyTasks',
        component: () => import('@/views/MyTasks.vue'),
        meta: { title: '我的任务' }
      },
      {
        path: 'salary',
        name: 'Salary',
        component: () => import('@/views/SalaryCalc.vue'),
        meta: { title: '薪资计算' }
      },
      {
        path: 'salary/history',
        name: 'SalaryHistory',
        component: () => import('@/views/PlaceholderPage.vue'),
        meta: { title: '历史薪资' }
      },
      {
        path: 'salary/rules',
        name: 'SalaryRules',
        component: () => import('@/views/PlaceholderPage.vue'),
        meta: { title: '规则配置' }
      },
      {
        path: 'reports',
        name: 'Reports',
        component: () => import('@/views/PlaceholderPage.vue'),
        meta: { title: '数据报表' }
      },
      {
        path: 'transactions',
        name: 'Transactions',
        component: () => import('@/views/PlaceholderPage.vue'),
        meta: { title: '结算流水' }
      },
      {
        path: 'leaderboard',
        name: 'Leaderboard',
        component: () => import('@/views/PlaceholderPage.vue'),
        meta: { title: '业绩排行' }
      },
      {
        path: 'preferences',
        name: 'Preferences',
        component: () => import('@/views/PlaceholderPage.vue'),
        meta: { title: '偏好设置' }
      },
      {
        path: 'notifications',
        name: 'Notifications',
        component: () => import('@/views/PlaceholderPage.vue'),
        meta: { title: '通知设置' }
      },
      {
        path: 'integrations',
        name: 'Integrations',
        component: () => import('@/views/PlaceholderPage.vue'),
        meta: { title: '集成与 API' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login'
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  // 设置页面标题
  document.title = (to.meta.title as string) || '薪资计算系统'

  const token = getCookie('token')
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth !== false)

  if (requiresAuth && !token) {
    // 需要认证但没有 token，跳转登录
    next('/login')
  } else if (to.path === '/login' && token) {
    // 已登录访问登录页，跳转主页
    next('/tasks')
  } else {
    next()
  }
})

export default router
