<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useProjectStore } from '@/stores/project'

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
      :width="isMobile ? '200px' : (isCollapse ? '64px' : '200px')"
      :class="['layout-aside', { 'mobile-aside': isMobile, 'mobile-show': sidebarVisible }]"
    >
      <div class="logo">
        <img src="/logo.svg" alt="logo" class="logo-img" />
        <span v-if="!isCollapse || isMobile">抢单平台</span>
      </div>

      <el-menu
        :default-active="route.path"
        :collapse="isMobile ? false : isCollapse"
        :collapse-transition="false"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
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
import { Fold, Expand, ArrowDown, Money, List } from '@element-plus/icons-vue'
export default {
  components: { Fold, Expand, ArrowDown, Money, List }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.layout-aside {
  background-color: #304156;
  transition: width 0.3s;
  overflow: hidden;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-left: 20px;
  gap: 8px;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  background: rgba(0, 0, 0, 0.1);
}

.logo-img {
  width: 28px;
  height: 28px;
}

.el-menu {
  border-right: none;
}

.layout-header {
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  color: #666;
}

.collapse-btn:hover {
  color: #409EFF;
}

.page-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
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
  color: #666;
}

.username {
  font-size: 14px;
}

.company-name {
  font-size: 14px;
  color: #666;
  margin-right: 16px;
  padding-right: 16px;
  border-right: 1px solid #ddd;
}

.layout-main {
  background: #f0f2f5;
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
  left: -200px;
  height: 100%;
  z-index: 999;
  transition: left 0.3s;
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
