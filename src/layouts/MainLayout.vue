<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useProjectStore } from '@/stores/project'
import LogoMark from '@/components/LogoMark.vue'
import { useTheme, type ThemeMode } from '@/composables/useTheme'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const projectStore = useProjectStore()

const isMobile = ref(false)
function checkMobile() {
  isMobile.value = window.innerWidth <= 768
}

type NavItem = { path: string; title: string; icon: 'grid' | 'check' | 'wallet' }
const navItems: NavItem[] = [
  { path: '/hall',   title: '任务大厅', icon: 'grid' },
  { path: '/tasks',  title: '我的任务', icon: 'check' },
  { path: '/salary', title: '薪资计算', icon: 'wallet' }
]

function isActive(item: NavItem) {
  return route.path === item.path
}

function go(path: string) {
  if (route.path !== path) router.push(path)
}

const userName = computed(() => userStore.userInfo?.username || userStore.userInfo?.name || '用户')
const userInitial = computed(() => userName.value.charAt(0).toUpperCase())

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

function handleLogout() {
  userStore.logout()
}

// 主题切换
const { mode: themeMode, resolvedTheme, setMode } = useTheme()
const themeOptions: { value: ThemeMode; label: string }[] = [
  { value: 'light',  label: '浅色' },
  { value: 'dark',   label: '深色' },
  { value: 'system', label: '跟随系统' }
]
function handleThemeCommand(value: ThemeMode) {
  setMode(value)
}

const themeTitle = computed(() => {
  const opt = themeOptions.find(o => o.value === themeMode.value)
  return '主题：' + (opt?.label || '')
})
</script>

<template>
  <div class="layout">
    <!-- ambient 背景光晕，让浮动胶囊有"浮"的感觉 -->
    <div class="ambient" aria-hidden="true">
      <div class="ambient-blob ambient-blob-1"></div>
      <div class="ambient-blob ambient-blob-2"></div>
    </div>

    <!-- ============ 桌面：浮动胶囊 ============ -->
    <nav v-if="!isMobile" class="float-nav">
      <div class="fn-brand">
        <LogoMark :size="26" uid="mainnav" />
        <span class="fn-brand-name">抢单</span>
      </div>

      <div class="fn-pill">
        <button
          v-for="it in navItems"
          :key="it.path"
          class="fn-tab"
          :class="{ 'is-active': isActive(it) }"
          @click="go(it.path)"
        >
          {{ it.title }}
        </button>
      </div>

      <div class="fn-right">
        <el-dropdown trigger="click" @command="handleThemeCommand" placement="bottom-end">
          <button class="fn-icon" :title="themeTitle">
            <svg
              v-if="themeMode === 'light'"
              width="16" height="16" viewBox="0 0 16 16" fill="none"
              stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
            >
              <circle cx="8" cy="8" r="3"/>
              <path d="M8 1.5v1.5M8 13v1.5M1.5 8h1.5M13 8h1.5M3.3 3.3l1.05 1.05M11.65 11.65l1.05 1.05M3.3 12.7l1.05-1.05M11.65 4.35l1.05-1.05"/>
            </svg>
            <svg
              v-else-if="themeMode === 'dark'"
              width="16" height="16" viewBox="0 0 16 16" fill="none"
              stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
            >
              <path d="M13.5 9.2A5.5 5.5 0 0 1 6.8 2.5a5.5 5.5 0 1 0 6.7 6.7z"/>
            </svg>
            <svg
              v-else
              width="16" height="16" viewBox="0 0 16 16" fill="none"
              stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
            >
              <rect x="2" y="3" width="12" height="8" rx="1"/>
              <line x1="5.5" y1="13.5" x2="10.5" y2="13.5"/>
              <line x1="8" y1="11" x2="8" y2="13.5"/>
            </svg>
          </button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="opt in themeOptions"
                :key="opt.value"
                :command="opt.value"
                :class="{ 'is-current-theme': themeMode === opt.value }"
              >
                <span class="fn-theme-dot" :class="`is-${opt.value}`"></span>
                {{ opt.label }}
                <span v-if="opt.value === 'system'" class="fn-theme-hint">
                  （{{ resolvedTheme === 'dark' ? '当前深色' : '当前浅色' }}）
                </span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <el-dropdown trigger="click" @command="handleLogout" placement="bottom-end">
          <button class="fn-user" :title="userName">
            <span class="fn-ava">{{ userInitial }}</span>
          </button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="logout" icon="SwitchButton">
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </nav>

    <!-- ============ 移动：顶栏 ============ -->
    <header v-else class="m-top">
      <div class="m-brand">
        <LogoMark :size="22" uid="mtop" />
        <span class="m-brand-name">抢单</span>
      </div>
      <div class="m-actions">
        <el-dropdown trigger="click" @command="handleThemeCommand" placement="bottom-end">
          <button class="fn-icon fn-icon-sm" title="主题">
            <svg
              v-if="themeMode === 'light'"
              width="14" height="14" viewBox="0 0 16 16" fill="none"
              stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
            >
              <circle cx="8" cy="8" r="3"/>
              <path d="M8 1.5v1.5M8 13v1.5M1.5 8h1.5M13 8h1.5M3.3 3.3l1.05 1.05M11.65 11.65l1.05 1.05M3.3 12.7l1.05-1.05M11.65 4.35l1.05-1.05"/>
            </svg>
            <svg
              v-else-if="themeMode === 'dark'"
              width="14" height="14" viewBox="0 0 16 16" fill="none"
              stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
            >
              <path d="M13.5 9.2A5.5 5.5 0 0 1 6.8 2.5a5.5 5.5 0 1 0 6.7 6.7z"/>
            </svg>
            <svg
              v-else
              width="14" height="14" viewBox="0 0 16 16" fill="none"
              stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
            >
              <rect x="2" y="3" width="12" height="8" rx="1"/>
              <line x1="5.5" y1="13.5" x2="10.5" y2="13.5"/>
              <line x1="8" y1="11" x2="8" y2="13.5"/>
            </svg>
          </button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="opt in themeOptions"
                :key="opt.value"
                :command="opt.value"
                :class="{ 'is-current-theme': themeMode === opt.value }"
              >
                <span class="fn-theme-dot" :class="`is-${opt.value}`"></span>
                {{ opt.label }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <el-dropdown trigger="click" @command="handleLogout" placement="bottom-end">
          <button class="fn-user fn-user-sm">
            <span class="fn-ava fn-ava-sm">{{ userInitial }}</span>
          </button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="logout" icon="SwitchButton">
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>

    <!-- ============ 主内容 ============ -->
    <main class="content" :class="{ 'is-mobile': isMobile }">
      <router-view />
    </main>

    <!-- ============ 移动：底部 Tab Bar ============ -->
    <nav v-if="isMobile" class="m-bottom">
      <button
        v-for="it in navItems"
        :key="it.path"
        class="m-tab"
        :class="{ 'is-active': isActive(it) }"
        @click="go(it.path)"
      >
        <svg v-if="it.icon === 'grid'" class="m-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/>
          <rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>
        <svg v-else-if="it.icon === 'check'" class="m-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 11l3 3L22 4"/>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
        <svg v-else class="m-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="1" x2="12" y2="23"/>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
        <span class="m-label">{{ it.title }}</span>
      </button>
    </nav>
  </div>
</template>

<script lang="ts">
import { SwitchButton } from '@element-plus/icons-vue'
export default {
  components: { SwitchButton }
}
</script>

<style scoped>
/* ============ Layout 容器 ============ */
.layout {
  position: relative;
  min-height: 100vh;
  background: var(--bg-page);
  color: var(--fg);
  isolation: isolate;
  overflow-x: hidden;
}

/* ============ Ambient 背景光晕 ============ */
.ambient {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}
.ambient-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.55;
}
.ambient-blob-1 {
  width: 480px; height: 480px;
  top: -160px; left: -120px;
  background: radial-gradient(circle, var(--brand-200), transparent 70%);
}
.ambient-blob-2 {
  width: 420px; height: 420px;
  top: -120px; right: -100px;
  background: radial-gradient(circle, #FBCFE8, transparent 70%);
  opacity: 0.42;
}
[data-theme="dark"] .ambient-blob-1 {
  background: radial-gradient(circle, rgba(99, 91, 255, .55), transparent 70%);
  opacity: 0.40;
}
[data-theme="dark"] .ambient-blob-2 {
  background: radial-gradient(circle, rgba(236, 72, 153, .35), transparent 70%);
  opacity: 0.30;
}

/* ============ 桌面：浮动胶囊 ============ */
.float-nav {
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  width: calc(100% - 48px);
  max-width: 1100px;
  padding: 6px 8px 6px 16px;
  background: rgba(255, 255, 255, .68);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, .85);
  border-radius: 999px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 16px;
  box-shadow:
    0 8px 24px rgba(15, 23, 42, .08),
    0 1px 0 rgba(255, 255, 255, .9) inset;
  transition: box-shadow .25s, background .25s;
}
[data-theme="dark"] .float-nav {
  background: rgba(24, 29, 44, .65);
  border-color: rgba(255, 255, 255, .08);
  box-shadow:
    0 12px 32px rgba(0, 0, 0, .45),
    0 1px 0 rgba(255, 255, 255, .04) inset;
}

.fn-brand {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 0 4px 0 0;
}
.fn-brand-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--fg);
  letter-spacing: -.01em;
}

.fn-pill {
  justify-self: center;
  display: inline-flex;
  gap: 2px;
}
.fn-tab {
  padding: 7px 16px;
  background: transparent;
  border: none;
  font-size: 13px;
  font-weight: 500;
  color: var(--fg-3);
  cursor: pointer;
  font-family: inherit;
  border-radius: 999px;
  transition: all .18s cubic-bezier(.4, 0, .2, 1);
  letter-spacing: -.005em;
}
.fn-tab:hover:not(.is-active) {
  color: var(--fg);
  background: rgba(15, 23, 42, .04);
}
[data-theme="dark"] .fn-tab:hover:not(.is-active) {
  background: rgba(255, 255, 255, .05);
}
.fn-tab.is-active {
  background: var(--accent);
  color: #fff;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(99, 91, 255, .35);
}
[data-theme="dark"] .fn-tab.is-active {
  box-shadow: 0 2px 10px rgba(99, 91, 255, .55);
}

.fn-right {
  display: flex;
  align-items: center;
  gap: 4px;
  justify-self: end;
}
.fn-icon {
  width: 32px; height: 32px;
  border-radius: 999px;
  background: transparent;
  border: none;
  color: var(--fg-3);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: all .15s;
}
.fn-icon:hover {
  background: rgba(15, 23, 42, .06);
  color: var(--fg);
}
[data-theme="dark"] .fn-icon:hover {
  background: rgba(255, 255, 255, .06);
}
.fn-icon-sm { width: 30px; height: 30px; }

.fn-user {
  width: 32px; height: 32px;
  border-radius: 999px;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.fn-ava {
  width: 28px; height: 28px;
  border-radius: 50%;
  background: var(--accent);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0;
  box-shadow: 0 1px 3px rgba(99, 91, 255, .35);
  transition: transform .15s;
}
.fn-user:hover .fn-ava {
  transform: scale(1.05);
}
.fn-user-sm { width: 28px; height: 28px; }
.fn-ava-sm { width: 24px; height: 24px; font-size: 11px; }

/* dropdown 项的圆点 */
.fn-theme-dot {
  display: inline-block;
  width: 8px; height: 8px;
  border-radius: 50%;
  margin-right: 8px;
  vertical-align: middle;
}
.fn-theme-dot.is-light { background: #FBBF24; }
.fn-theme-dot.is-dark { background: #4B5563; }
.fn-theme-dot.is-system {
  background: linear-gradient(135deg, #FBBF24 0%, #4B5563 50%, #4B5563 100%);
}
.fn-theme-hint {
  font-size: 11px;
  color: var(--fg-4);
  margin-left: 4px;
}

/* ============ 移动：顶栏 ============ */
.m-top {
  position: sticky;
  top: 0;
  z-index: 50;
  height: 52px;
  padding: 0 14px;
  background: rgba(255, 255, 255, .85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border-soft);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
[data-theme="dark"] .m-top {
  background: rgba(24, 29, 44, .85);
}
.m-brand {
  display: flex;
  align-items: center;
  gap: 8px;
}
.m-brand-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--fg);
}
.m-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* ============ 主内容区 ============ */
.content {
  position: relative;
  z-index: 1;
  /* 桌面：给浮动胶囊预留 80px 顶部间距，水平 24px，最大宽 1200 */
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 24px 32px;
  min-height: 100vh;
  box-sizing: border-box;
}
.content.is-mobile {
  max-width: none;
  margin: 0;
  padding: 16px 14px calc(80px + env(safe-area-inset-bottom, 0px));
  min-height: calc(100vh - 52px);
}

/* ============ 移动：底部 Tab Bar ============ */
.m-bottom {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  z-index: 50;
  height: 64px;
  padding: 6px 0 calc(6px + env(safe-area-inset-bottom, 0px));
  background: rgba(255, 255, 255, .92);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-top: 1px solid var(--border-soft);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}
[data-theme="dark"] .m-bottom {
  background: rgba(24, 29, 44, .92);
}
.m-tab {
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: inherit;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  color: var(--fg-4);
  transition: color .15s, transform .12s;
  padding: 0;
}
.m-tab.is-active { color: var(--accent-fg); }
.m-tab:active { transform: scale(.95); }
.m-icon { display: block; }
.m-label {
  font-size: 10.5px;
  font-weight: 500;
  letter-spacing: .02em;
}
</style>
