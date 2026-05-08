import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'

export type ThemeMode = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

const STORAGE_KEY = 'salary_theme_mode'

const mode = ref<ThemeMode>(loadMode())
const systemPrefersDark = ref(getSystemPrefersDark())

function loadMode(): ThemeMode {
  if (typeof window === 'undefined') return 'system'
  const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null
  if (saved === 'light' || saved === 'dark' || saved === 'system') return saved
  return 'system'
}

function getSystemPrefersDark(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

const resolvedTheme = computed<ResolvedTheme>(() => {
  if (mode.value === 'system') return systemPrefersDark.value ? 'dark' : 'light'
  return mode.value
})

function applyTheme(theme: ResolvedTheme) {
  const html = document.documentElement
  html.setAttribute('data-theme', theme)
  if (theme === 'dark') html.classList.add('dark')
  else html.classList.remove('dark')
}

let mediaQuery: MediaQueryList | null = null
let mqHandler: ((e: MediaQueryListEvent) => void) | null = null

function bindSystemListener() {
  if (typeof window === 'undefined' || !window.matchMedia) return
  mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mqHandler = (e: MediaQueryListEvent) => {
    systemPrefersDark.value = e.matches
  }
  mediaQuery.addEventListener('change', mqHandler)
}

function unbindSystemListener() {
  if (mediaQuery && mqHandler) {
    mediaQuery.removeEventListener('change', mqHandler)
    mediaQuery = null
    mqHandler = null
  }
}

let initialized = false

export function initTheme() {
  if (initialized || typeof window === 'undefined') return
  initialized = true
  bindSystemListener()
  applyTheme(resolvedTheme.value)
  watch(resolvedTheme, applyTheme)
  watch(mode, (m) => {
    localStorage.setItem(STORAGE_KEY, m)
  })
}

export function useTheme() {
  onMounted(() => {
    if (!initialized) initTheme()
  })

  onBeforeUnmount(() => {
    // 监听器是全局的，不在组件卸载时移除
  })

  function setMode(next: ThemeMode) {
    mode.value = next
  }

  return {
    mode,
    resolvedTheme,
    setMode,
  }
}

export function teardownTheme() {
  unbindSystemListener()
  initialized = false
}
