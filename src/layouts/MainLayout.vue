<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
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
type MenuBadge = { text: string; type: 'new' | 'beta' | 'muted' | 'primary' }
type MenuItem = {
  index: string
  title: string
  icon: 'grid' | 'list' | 'wallet' | 'chart' | 'gear'
  badge?: MenuBadge
}

const menuItems: MenuItem[] = [
  { index: '/hall',   title: '任务大厅', icon: 'grid',   badge: { text: 'NEW', type: 'new' } },
  { index: '/tasks',  title: '我的任务', icon: 'list' },
  { index: '/salary', title: '薪资计算', icon: 'wallet' }
]

// 当前用户名 / 公司名
const userName = computed(() => userStore.userInfo?.username || userStore.userInfo?.name || '用户')
const userInitial = computed(() => userName.value.charAt(0).toUpperCase())
const companyName = computed(() => userStore.companyName || '我的工作台')
const companyInitial = computed(() => companyName.value.charAt(0).toUpperCase())

// 进度卡数据
const totalDone = computed(() => projectStore.totalTasks || 0)
const targetTasks = 15
const progressPercent = computed(() => {
  if (!totalDone.value) return 0
  return Math.min(100, Math.round((totalDone.value / targetTasks) * 100))
})

// 当前页面 title（用于顶栏）
const currentPageTitle = computed(() => (route.meta.title as string) || '')

// 初始化
onMounted(() => {
  userStore.initUserInfo()
  const username = userStore.userInfo?.username || userStore.userInfo?.name || ''
  projectStore.initBaseSalary(username)
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

// 切换侧边栏（移动端）
function toggleSidebar() {
  if (isMobile.value) {
    sidebarVisible.value = !sidebarVisible.value
  } else {
    isCollapse.value = !isCollapse.value
  }
}

// 快速跳到任务大厅
function quickCreate() {
  router.push('/hall')
  if (isMobile.value) sidebarVisible.value = false
}

// 用户菜单
const userMenuOpen = ref(false)
function toggleUserMenu() {
  userMenuOpen.value = !userMenuOpen.value
}
</script>

<template>
  <div class="layout">
    <!-- 手机端遮罩 -->
    <div
      v-if="isMobile && sidebarVisible"
      class="sidebar-mask"
      @click="sidebarVisible = false"
    ></div>

    <!-- ============ Sidebar ============ -->
    <aside
      :class="[
        'sidebar',
        { 'is-mobile': isMobile, 'is-mobile-show': sidebarVisible }
      ]"
    >
      <!-- Brand -->
      <div class="sb-brand">
        <LogoMark :size="26" uid="sidebar" />
        <span class="sb-brand-name">抢单平台</span>
        <span class="sb-brand-ver">PRO</span>
      </div>

      <!-- Workspace -->
      <div class="sb-workspace" :title="companyName">
        <div class="sb-ws-avatar">
          {{ companyInitial }}
          <span class="sb-ws-status"></span>
        </div>
        <div class="sb-ws-text">
          <div class="sb-ws-name">{{ companyName }}</div>
          <div class="sb-ws-role">{{ userName }} · 工作台</div>
        </div>
        <svg class="sb-ws-arr" width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
          <polyline points="5,6 8,3 11,6"/>
          <polyline points="5,10 8,13 11,10"/>
        </svg>
      </div>

      <!-- Quick create -->
      <button class="sb-quick" @click="quickCreate">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 8h10M8 3v10"/>
        </svg>
        <span>找新任务</span>
        <span class="sb-quick-kbd">⌘K</span>
      </button>

      <!-- Nav -->
      <nav class="sb-nav">
        <div class="sb-section">工作台</div>

        <a
          v-for="item in menuItems"
          :key="item.index"
          class="sb-item"
          :class="{ 'is-active': route.path === item.index }"
          @click="handleMenuSelect(item.index)"
        >
          <!-- icon-grid -->
          <svg v-if="item.icon === 'grid'" class="sb-ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/>
            <rect x="2" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/>
          </svg>
          <!-- icon-list -->
          <svg v-else-if="item.icon === 'list'" class="sb-ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
            <line x1="3" y1="4" x2="13" y2="4"/>
            <line x1="3" y1="8" x2="13" y2="8"/>
            <line x1="3" y1="12" x2="13" y2="12"/>
          </svg>
          <!-- icon-wallet -->
          <svg v-else-if="item.icon === 'wallet'" class="sb-ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="8" cy="8" r="6"/>
            <path d="M8 4.5v3.5l2.2 1.3"/>
          </svg>
          <!-- icon-chart -->
          <svg v-else-if="item.icon === 'chart'" class="sb-ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
            <polyline points="2,12 6,7 9,10 14,4"/>
          </svg>
          <!-- icon-gear -->
          <svg v-else class="sb-ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="8" cy="8" r="2.5"/>
            <path d="M8 1v2M8 13v2M1 8h2M13 8h2"/>
          </svg>

          <span class="sb-item-text">{{ item.title }}</span>

          <span
            v-if="item.badge"
            class="sb-badge"
            :class="`is-${item.badge.type}`"
          >
            {{ item.badge.text }}
          </span>
        </a>

        <!-- 进度卡 -->
        <div class="sb-progress">
          <div class="sb-progress-head">
            <span class="sb-progress-title">本月接单进度</span>
            <span class="sb-progress-pct">{{ progressPercent }}%</span>
          </div>
          <div class="sb-progress-bar">
            <div class="sb-progress-fill" :style="{ width: progressPercent + '%' }"></div>
          </div>
          <div class="sb-progress-foot">
            <span>已完结 <b>{{ totalDone }}</b> / {{ targetTasks }}</span>
            <span v-if="totalDone < targetTasks">剩 {{ targetTasks - totalDone }} 个</span>
            <span v-else>已达标</span>
          </div>
        </div>
      </nav>

      <!-- Sidebar footer -->
      <div class="sb-foot">
        <div class="sb-tools">
          <button class="sb-tool" title="帮助">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="8" cy="8" r="6"/>
              <path d="M6.3 6.3a1.7 1.7 0 0 1 3.4 0c0 1-1.7 1.4-1.7 2.4M8 11h.01"/>
            </svg>
          </button>
          <button class="sb-tool" title="反馈">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M3 3h10v8H6l-3 3z"/>
            </svg>
          </button>
          <button class="sb-tool" title="主题">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M8 2a6 6 0 1 0 5.5 8.5A5 5 0 0 1 8 2z"/>
            </svg>
          </button>
          <button class="sb-tool" title="快捷键">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="2" y="4" width="12" height="8" rx="1.5"/>
              <line x1="5" y1="9.5" x2="11" y2="9.5"/>
            </svg>
          </button>
        </div>

        <div class="sb-user" @click="toggleUserMenu">
          <div class="sb-avatar">
            {{ userInitial }}
            <span class="sb-avatar-status"></span>
          </div>
          <div class="sb-user-info">
            <div class="sb-user-name">
              {{ userName }}
              <span class="sb-user-pro">PRO</span>
            </div>
            <div class="sb-user-org">{{ companyName }}</div>
          </div>

          <el-dropdown trigger="click" @command="handleLogout">
            <svg class="sb-user-menu" viewBox="0 0 16 16" fill="currentColor">
              <circle cx="3" cy="8" r="1.2"/>
              <circle cx="8" cy="8" r="1.2"/>
              <circle cx="13" cy="8" r="1.2"/>
            </svg>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout" icon="SwitchButton">
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </aside>

    <!-- ============ Main ============ -->
    <div class="main">
      <!-- 顶栏 -->
      <header class="topbar">
        <div class="tb-left">
          <button class="tb-toggle" @click="toggleSidebar" :title="isMobile ? '菜单' : (isCollapse ? '展开' : '折叠')">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
              <line x1="3" y1="4" x2="13" y2="4"/>
              <line x1="3" y1="8" x2="13" y2="8"/>
              <line x1="3" y1="12" x2="13" y2="12"/>
            </svg>
          </button>
          <div class="tb-crumb">
            <span class="tb-crumb-root">工作台</span>
            <span class="tb-crumb-sep">/</span>
            <span class="tb-crumb-cur">{{ currentPageTitle }}</span>
          </div>
        </div>

        <div class="tb-right">
          <button class="tb-icon" title="搜索">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="7" cy="7" r="4.5"/><line x1="10.5" y1="10.5" x2="13.5" y2="13.5"/>
            </svg>
          </button>
          <button class="tb-icon" title="通知">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M8 2a4 4 0 0 0-4 4v3l-1.5 2h11L12 9V6a4 4 0 0 0-4-4z"/>
              <path d="M6.5 13a1.5 1.5 0 0 0 3 0"/>
            </svg>
            <span class="tb-icon-dot"></span>
          </button>
        </div>
      </header>

      <!-- 主内容 -->
      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script lang="ts">
import { SwitchButton } from '@element-plus/icons-vue'
export default {
  components: { SwitchButton }
}
</script>

<style scoped>
/* ============ Layout ============ */
.layout {
  display: flex;
  min-height: 100vh;
  background: var(--bg-page);
}

/* ============ Sidebar ============ */
.sidebar {
  width: 248px;
  flex-shrink: 0;
  background: var(--bg-muted);
  border-right: 1px solid var(--gray-200);
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: sticky;
  top: 0;
  z-index: 999;
}

/* Brand */
.sb-brand {
  height: 56px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 16px;
  border-bottom: 1px solid var(--gray-100);
}
.sb-brand-name {
  font-weight: 600;
  font-size: 14.5px;
  color: var(--text-primary);
  letter-spacing: -.01em;
}
.sb-brand-ver {
  margin-left: auto;
  font-size: 10.5px;
  font-weight: 600;
  color: var(--brand-700);
  background: var(--brand-50);
  padding: 2px 6px;
  border-radius: 4px;
  letter-spacing: .03em;
}

/* Workspace */
.sb-workspace {
  margin: 10px 12px 8px;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  background: var(--bg-surface);
  border: 1px solid var(--gray-100);
  box-shadow: var(--shadow-xs);
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all .15s;
}
.sb-workspace:hover {
  border-color: var(--gray-200);
  box-shadow: var(--shadow-sm);
}
.sb-ws-avatar {
  position: relative;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: linear-gradient(135deg, var(--brand-400), var(--brand-500));
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}
.sb-ws-status {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--color-success);
  border: 2px solid var(--bg-surface);
}
.sb-ws-text {
  flex: 1;
  min-width: 0;
}
.sb-ws-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.sb-ws-role {
  font-size: 11.5px;
  color: var(--text-tertiary);
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.sb-ws-arr {
  color: var(--text-tertiary);
  flex-shrink: 0;
}

/* Quick create */
.sb-quick {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 12px 4px;
  padding: 7px 10px;
  border-radius: var(--radius-sm);
  color: var(--brand-700);
  background: transparent;
  border: 1px dashed var(--brand-200);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all .12s;
  font-family: inherit;
}
.sb-quick:hover {
  background: var(--brand-50);
  border-color: var(--brand-500);
  border-style: solid;
}
.sb-quick svg {
  width: 14px;
  height: 14px;
}
.sb-quick-kbd {
  margin-left: auto;
  font-family: ui-monospace, monospace;
  font-size: 11px;
  color: var(--text-tertiary);
  padding: 1px 5px;
  border: 1px solid var(--gray-200);
  border-radius: 3px;
  background: var(--bg-surface);
}

/* Nav */
.sb-nav {
  padding: 6px 12px;
  flex: 1;
  overflow-y: auto;
}
.sb-section {
  font-size: 10.5px;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: .06em;
  padding: 14px 10px 6px;
}

.sb-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  font-size: 13.5px;
  color: var(--gray-700);
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  margin-bottom: 1px;
  position: relative;
  transition: background .12s, color .12s;
  user-select: none;
}
.sb-item:hover {
  background: var(--gray-100);
  color: var(--text-primary);
}
.sb-item.is-active {
  background: var(--brand-50);
  color: var(--brand-700);
  font-weight: 600;
}
.sb-item.is-active::before {
  content: '';
  position: absolute;
  left: -12px;
  top: 50%;
  transform: translateY(-50%);
  width: 2px;
  height: 18px;
  background: var(--brand-500);
  border-radius: 0 2px 2px 0;
}
.sb-item.is-active .sb-ic {
  color: var(--brand-500);
}
.sb-ic {
  width: 16px;
  height: 16px;
  color: var(--text-secondary);
  flex-shrink: 0;
}
.sb-item-text {
  flex: 1;
}

.sb-badge {
  font-size: 10.5px;
  font-weight: 600;
  padding: 1px 6px;
  min-width: 18px;
  text-align: center;
  border-radius: 10px;
  letter-spacing: .04em;
}
.sb-badge.is-new {
  background: linear-gradient(135deg, #00C896, #00A36F);
  color: #fff;
}
.sb-badge.is-beta {
  background: var(--color-warning-bg);
  color: #B45309;
}
.sb-badge.is-muted {
  background: var(--gray-100);
  color: var(--text-tertiary);
}
.sb-badge.is-primary {
  background: var(--brand-500);
  color: #fff;
}

/* Progress card */
.sb-progress {
  margin: 16px 4px 8px;
  padding: 12px 12px 14px;
  background: linear-gradient(135deg, var(--brand-50) 0%, var(--bg-muted) 100%);
  border: 1px solid var(--brand-100);
  border-radius: var(--radius-sm);
}
.sb-progress-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.sb-progress-title {
  font-size: 11.5px;
  font-weight: 600;
  color: var(--text-secondary);
  letter-spacing: .02em;
}
.sb-progress-pct {
  font-size: 12px;
  font-weight: 700;
  color: var(--brand-700);
  font-variant-numeric: tabular-nums;
}
.sb-progress-bar {
  height: 6px;
  background: rgba(99, 91, 255, .12);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;
}
.sb-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--brand-500), var(--brand-400));
  border-radius: 3px;
  transition: width .4s ease;
}
.sb-progress-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  color: var(--text-secondary);
}
.sb-progress-foot b {
  color: var(--text-primary);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

/* Sidebar foot */
.sb-foot {
  border-top: 1px solid var(--gray-100);
  padding: 8px;
}
.sb-tools {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 4px 0 8px;
  border-bottom: 1px solid var(--gray-100);
  margin-bottom: 8px;
}
.sb-tool {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  transition: all .12s;
  cursor: pointer;
  font-family: inherit;
}
.sb-tool:hover {
  background: var(--gray-100);
  color: var(--brand-700);
}
.sb-tool svg {
  width: 15px;
  height: 15px;
}

.sb-user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background .12s;
}
.sb-user:hover {
  background: var(--gray-100);
}
.sb-avatar {
  position: relative;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FBA94C, #F77B6A);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}
.sb-avatar-status {
  position: absolute;
  bottom: -1px;
  right: -1px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--color-success);
  border: 2px solid var(--bg-muted);
}
.sb-user-info {
  min-width: 0;
  flex: 1;
}
.sb-user-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.2;
  display: flex;
  align-items: center;
  gap: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.sb-user-pro {
  font-size: 9.5px;
  font-weight: 700;
  color: #B45309;
  background: var(--color-warning-bg);
  padding: 1px 4px;
  border-radius: 3px;
  letter-spacing: .04em;
  flex-shrink: 0;
}
.sb-user-org {
  font-size: 11px;
  color: var(--text-tertiary);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.sb-user-menu {
  color: var(--text-tertiary);
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  cursor: pointer;
  transition: color .12s;
}
.sb-user:hover .sb-user-menu {
  color: var(--text-primary);
}

/* ============ Main ============ */
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: var(--bg-page);
}

/* Topbar */
.topbar {
  height: 56px;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--gray-100);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 10;
}
.tb-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.tb-toggle {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all .12s;
  font-family: inherit;
}
.tb-toggle:hover {
  background: var(--gray-100);
  color: var(--text-primary);
}
.tb-crumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13.5px;
}
.tb-crumb-root {
  color: var(--text-tertiary);
}
.tb-crumb-sep {
  color: var(--text-tertiary);
}
.tb-crumb-cur {
  color: var(--text-primary);
  font-weight: 500;
}
.tb-right {
  display: flex;
  align-items: center;
  gap: 4px;
}
.tb-icon {
  position: relative;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all .12s;
  font-family: inherit;
}
.tb-icon:hover {
  background: var(--gray-100);
  color: var(--text-primary);
}
.tb-icon-dot {
  position: absolute;
  top: 7px;
  right: 8px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-danger);
  border: 1.5px solid var(--bg-surface);
}

/* Content */
.content {
  flex: 1;
  padding: 20px 24px;
  overflow-y: auto;
}

/* ============ Mask ============ */
.sidebar-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 23, 42, .5);
  backdrop-filter: blur(4px);
  z-index: 998;
  animation: fadeIn .2s ease;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* ============ 移动端 ============ */
.sidebar.is-mobile {
  position: fixed;
  top: 0;
  left: -260px;
  height: 100%;
  z-index: 999;
  transition: left .25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 8px 0 32px rgba(15, 23, 42, .15);
}
.sidebar.is-mobile.is-mobile-show {
  left: 0;
}

@media screen and (max-width: 768px) {
  .topbar {
    padding: 0 16px;
  }
  .content {
    padding: 16px;
  }
  .tb-crumb-root,
  .tb-crumb-sep {
    display: none;
  }
}
</style>
