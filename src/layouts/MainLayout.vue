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
  background: linear-gradient(180deg, #1A1F2E 0%, #0F1419 100%);
  transition: width var(--transition-base);
  overflow: hidden;
  border-right: 1px solid rgba(249, 115, 22, 0.15);
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.12);
  position: relative;
}

.layout-aside::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 1px;
  height: 100%;
  background: linear-gradient(180deg,
    transparent 0%,
    rgba(249, 115, 22, 0.3) 50%,
    transparent 100%);
}

.logo {
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  position: relative;
}

.logo::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 2px;
  background: var(--gradient-warm);
  border-radius: var(--radius-full);
  box-shadow: 0 0 12px rgba(249, 115, 22, 0.6);
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.5px;
  background: linear-gradient(135deg, #FFFFFF 0%, #FED7AA 100%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  text-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
}

.sidebar-menu {
  border-right: none;
  background: transparent;
  padding: var(--space-6) var(--space-4);
}

.sidebar-menu .el-menu-item {
  color: rgba(255, 255, 255, 0.7);
  transition: all var(--transition-bounce);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-3);
  position: relative;
  overflow: visible;
  border: 1px solid transparent;
  backdrop-filter: blur(8px);
  height: 48px;
  line-height: 48px;
}

.sidebar-menu .el-menu-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 0;
  background: var(--gradient-warm);
  border-radius: 0 var(--radius-full) var(--radius-full) 0;
  transition: height var(--transition-bounce);
  box-shadow: 0 0 12px rgba(249, 115, 22, 0.6);
}

.sidebar-menu .el-menu-item::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg,
    rgba(249, 115, 22, 0) 0%,
    rgba(249, 115, 22, 0.1) 100%);
  opacity: 0;
  transition: opacity var(--transition-base);
}

.sidebar-menu .el-menu-item:hover {
  background: rgba(249, 115, 22, 0.12);
  color: #FED7AA;
  border-color: rgba(249, 115, 22, 0.3);
  transform: translateX(6px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.2);
}

.sidebar-menu .el-menu-item:hover::before {
  height: 70%;
}

.sidebar-menu .el-menu-item:hover::after {
  opacity: 1;
}

.sidebar-menu .el-menu-item.is-active {
  background: linear-gradient(135deg,
    rgba(249, 115, 22, 0.25) 0%,
    rgba(251, 146, 60, 0.15) 100%);
  color: #FFFFFF;
  border-color: rgba(249, 115, 22, 0.5);
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.sidebar-menu .el-menu-item.is-active::before {
  height: 85%;
}

.sidebar-menu .el-menu-item.is-active::after {
  opacity: 1;
}

.sidebar-menu .el-menu-item .el-icon {
  font-size: 20px;
  transition: all var(--transition-bounce);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.sidebar-menu .el-menu-item:hover .el-icon {
  transform: scale(1.15) rotate(-5deg);
  color: #FB923C;
}

.sidebar-menu .el-menu-item.is-active .el-icon {
  transform: scale(1.1);
  color: #FB923C;
  filter: drop-shadow(0 0 8px rgba(249, 115, 22, 0.6));
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

/* 手机端遮罩 */
.sidebar-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 998;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.mobile-aside {
  position: fixed;
  top: 0;
  left: -220px;
  height: 100%;
  z-index: 999;
  transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 8px 0 32px rgba(0, 0, 0, 0.3);
}

.mobile-aside.mobile-show {
  left: 0;
}

@media screen and (max-width: 768px) {
  .layout-header {
    padding: 0 var(--space-3);
  }

  .page-title {
    font-size: var(--font-base);
  }

  .layout-main {
    padding: var(--space-3);
  }

  .sidebar-menu {
    padding: var(--space-4) var(--space-3);
  }

  .sidebar-menu .el-menu-item {
    height: 44px;
    line-height: 44px;
  }
}
</style>
