<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useProjectStore } from '@/stores/project'
import LogoMark from '@/components/LogoMark.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const projectStore = useProjectStore()

const isCollapse = ref(false)
const isMobile = ref(false)
const sidebarVisible = ref(false)

// 检测是否手机端
function checkMobile() {
  isMobile.value = window.innerWidth <= 768
  if (isMobile.value) {
    isCollapse.value = true
    sidebarVisible.value = false
  }
}

// 菜单配置
const menuItems = [
  { index: '/hall', icon: 'Grid', title: '任务大厅' },
  { index: '/tasks', icon: 'List', title: '我的任务' },
  { index: '/salary', icon: 'Money', title: '薪资计算' }
]

// 初始化
onMounted(() => {
  // 初始化用户信息（从 localStorage 恢复）
  userStore.initUserInfo()
  // 初始化底薪（按用户隔离）
  const username = userStore.userInfo?.username || userStore.userInfo?.name || ''
  projectStore.initBaseSalary(username)
  // 检测设备
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

// 菜单点击
function handleMenuSelect(index: string) {
  router.push(index)
  if (isMobile.value) {
    sidebarVisible.value = false
  }
}

// 退出登录
function handleLogout() {
  userStore.logout()
}

// 切换侧边栏
function toggleSidebar() {
  if (isMobile.value) {
    sidebarVisible.value = !sidebarVisible.value
  } else {
    isCollapse.value = !isCollapse.value
  }
}
</script>

<template>
  <el-container class="layout-container">
    <!-- 手机端遮罩 -->
    <div v-if="isMobile && sidebarVisible" class="sidebar-mask" @click="sidebarVisible = false"></div>

    <!-- 侧边栏 -->
    <el-aside
      :width="isMobile ? '220px' : (isCollapse ? '64px' : '220px')"
      :class="['layout-aside', { 'mobile-aside': isMobile, 'mobile-show': sidebarVisible }]"
    >
      <div class="logo">
        <LogoMark :size="isCollapse && !isMobile ? 32 : 40" uid="sidebar" />
        <span v-if="!isCollapse || isMobile" class="logo-text">抢单平台</span>
      </div>

      <el-menu
        :default-active="route.path"
        :collapse="isMobile ? false : isCollapse"
        :collapse-transition="false"
        class="sidebar-menu"
        @select="handleMenuSelect"
      >
        <el-menu-item
          v-for="item in menuItems"
          :key="item.index"
          :index="item.index"
        >
          <el-icon><component :is="item.icon" /></el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <!-- 顶部导航 -->
      <el-header class="layout-header">
        <div class="header-left">
          <el-icon
            class="collapse-btn"
            @click="toggleSidebar"
          >
            <Fold v-if="!isCollapse && !isMobile" />
            <Expand v-else />
          </el-icon>
          <span class="page-title">{{ route.meta.title }}</span>
        </div>

        <div class="header-right">
          <span v-if="userStore.companyName && !isMobile" class="company-name">
            {{ userStore.companyName }}
          </span>
          <el-dropdown @command="handleLogout">
            <span class="user-info">
              <el-avatar :size="32" icon="UserFilled" />
              <span v-if="!isMobile" class="username">{{ userStore.userInfo?.username || userStore.userInfo?.name || '用户' }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout" icon="SwitchButton">
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 主内容区 -->
      <el-main class="layout-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts">
import { Fold, Expand, ArrowDown, Money, List, Grid } from '@element-plus/icons-vue'
export default {
  components: { Fold, Expand, ArrowDown, Money, List, Grid }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.layout-aside {
  background: var(--bg-surface);
  transition: width var(--transition-base);
  overflow: hidden;
  border-right: 1px solid var(--border-default);
  box-shadow: var(--shadow-sm);
}

.logo {
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-default);
  position: relative;
}

.logo::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 3px;
  background: var(--gradient-warm);
  border-radius: var(--radius-full);
}

.logo-text {
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 700;
  letter-spacing: var(--letter-spacing-tight);
  background: var(--gradient-warm);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

.sidebar-menu {
  border-right: none;
  background: transparent;
  padding: var(--space-4) var(--space-3);
}

.sidebar-menu .el-menu-item {
  color: var(--text-secondary);
  transition: all var(--transition-bounce);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-2);
  position: relative;
  overflow: hidden;
  border: 1px solid transparent;
}

.sidebar-menu .el-menu-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 0;
  background: var(--gradient-warm);
  border-radius: 0 var(--radius-full) var(--radius-full) 0;
  transition: height var(--transition-bounce);
}

.sidebar-menu .el-menu-item:hover {
  background: var(--brand-50);
  color: var(--brand-700);
  border-color: var(--brand-200);
  transform: translateX(4px);
}

.sidebar-menu .el-menu-item:hover::before {
  height: 60%;
}

.sidebar-menu .el-menu-item.is-active {
  background: linear-gradient(135deg, var(--brand-50) 0%, #FFF7ED 100%);
  color: var(--brand-700);
  border-color: var(--brand-300);
  font-weight: 600;
  box-shadow: var(--shadow-sm);
}

.sidebar-menu .el-menu-item.is-active::before {
  height: 80%;
}

.sidebar-menu .el-menu-item .el-icon {
  font-size: 20px;
  transition: all var(--transition-bounce);
}

.sidebar-menu .el-menu-item:hover .el-icon,
.sidebar-menu .el-menu-item.is-active .el-icon {
  transform: scale(1.1);
  color: var(--brand-600);
}

.layout-header {
  background: var(--bg-surface);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: var(--shadow-sm);
  border-bottom: 1px solid var(--border-default);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all var(--transition-base);
}

.collapse-btn:hover {
  color: var(--brand-600);
  transform: scale(1.1);
}

.page-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: var(--letter-spacing-normal);
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 6px 12px;
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
}

.user-info:hover {
  background: var(--brand-50);
  color: var(--brand-700);
}

.username {
  font-size: 14px;
  font-weight: 500;
}

.company-name {
  font-size: 13px;
  color: var(--text-secondary);
  margin-right: 16px;
  padding-right: 16px;
  border-right: 1px solid var(--border-default);
}

.layout-main {
  background: var(--bg-page);
  padding: 20px;
  overflow-y: auto;
}

/* 手机端适配 */
.sidebar-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 998;
}

.mobile-aside {
  position: fixed;
  top: 0;
  left: -220px;
  height: 100%;
  z-index: 999;
  transition: left 0.3s;
  box-shadow: var(--shadow-xl);
}

.mobile-aside.mobile-show {
  left: 0;
}

@media screen and (max-width: 768px) {
  .layout-header {
    padding: 0 12px;
  }

  .page-title {
    font-size: 14px;
  }

  .layout-main {
    padding: 12px;
  }
}
</style>
