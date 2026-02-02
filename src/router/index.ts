import { createRouter, createWebHistory } from 'vue-router'
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
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/salary'
      },
      {
        path: 'salary',
        name: 'Salary',
        component: () => import('@/views/SalaryCalc.vue'),
        meta: { title: '薪资计算' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = (to.meta.title as string) || '薪资计算系统'

  const token = getCookie('token')
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth !== false)

  if (requiresAuth && !token) {
    // 需要认证但没有 token，跳转登录
    next('/login')
  } else if (to.path === '/login' && token) {
    // 已登录访问登录页，跳转主页
    next('/salary')
  } else {
    next()
  }
})

export default router
