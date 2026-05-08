<script setup lang="ts">
import { ref, computed } from 'vue'
import LogoMark from '@/components/LogoMark.vue'
import { useTheme } from '@/composables/useTheme'

const { mode, setMode } = useTheme()

type SchemeKey = 'A' | 'B' | 'C' | 'D' | 'E'

const schemes: { key: SchemeKey; title: string; tag: string; desc: string }[] = [
  { key: 'A', title: '横排 Tab', tag: '最稳', desc: 'GitHub / Linear / Vercel 风：tab 横排在顶栏，active 用底部下划线。' },
  { key: 'B', title: '居中 Pill Tab', tag: '更精致', desc: 'Apple / Notion 风：tab 装在胶囊容器里，active 是白底圆角块。' },
  { key: 'C', title: '双层顶栏', tag: '可扩展', desc: 'Stripe Dashboard 风：第一层品牌+用户，第二层模块切换。次级 tab 多时合适。' },
  { key: 'D', title: '移动 Bottom Tab', tag: '移动必选', desc: '375px 模拟手机视窗：顶栏只放品牌，导航沉到底部。' },
  { key: 'E', title: '浮动胶囊', tag: '官网风', desc: 'Apple / Vercel landing 风：透明顶栏 + 毛玻璃浮动胶囊。漂亮但工具型不耐用。' }
]

const activeNav = ref<Record<SchemeKey, string>>({
  A: 'tasks',
  B: 'tasks',
  C: 'tasks',
  D: 'tasks',
  E: 'tasks'
})

const navItems = [
  { key: 'hall', label: '任务大厅' },
  { key: 'tasks', label: '我的任务' },
  { key: 'salary', label: '薪资计算' }
]

function setActive(scheme: SchemeKey, key: string) {
  activeNav.value[scheme] = key
}

const themeLabel = computed(() => mode.value === 'light' ? '浅色' : mode.value === 'dark' ? '深色' : '跟随系统')

function cycleTheme() {
  const order = ['light', 'dark', 'system'] as const
  const i = order.indexOf(mode.value)
  setMode(order[(i + 1) % order.length])
}
</script>

<template>
  <div class="demo-page">
    <header class="demo-head">
      <div class="head-left">
        <LogoMark :size="32" uid="demohead" />
        <div>
          <div class="head-eyebrow">NAV PATTERNS</div>
          <h1 class="head-title">导航呈现方式 · Demo</h1>
        </div>
      </div>
      <div class="head-right">
        <button class="theme-cycle" @click="cycleTheme">
          当前：{{ themeLabel }} · 点击切换
        </button>
      </div>
    </header>

    <p class="demo-intro">
      下面 5 套方案都用项目当前 tokens 渲染，亮 / 暗模式都生效。点击导航项可以切换 active 态看效果。
    </p>

    <!-- ============ A · 横排 Tab ============ -->
    <section class="scheme">
      <div class="scheme-head">
        <span class="scheme-key">A</span>
        <div class="scheme-meta">
          <div class="scheme-title">{{ schemes[0].title }} <span class="scheme-tag">{{ schemes[0].tag }}</span></div>
          <div class="scheme-desc">{{ schemes[0].desc }}</div>
        </div>
      </div>
      <div class="vp">
        <nav class="a-nav">
          <div class="a-left">
            <LogoMark :size="28" uid="a" />
            <span class="a-brand">抢单平台</span>
            <div class="a-tabs">
              <button
                v-for="it in navItems"
                :key="it.key"
                class="a-tab"
                :class="{ 'is-active': activeNav.A === it.key }"
                @click="setActive('A', it.key)"
              >
                {{ it.label }}
              </button>
            </div>
          </div>
          <div class="a-right">
            <button class="icon-btn" title="主题">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
            </button>
            <div class="user-chip">
              <div class="ava">张</div>
              <span>张三</span>
            </div>
          </div>
        </nav>
        <div class="vp-body">
          <div class="vp-page-title">{{ navItems.find(i => i.key === activeNav.A)?.label }}</div>
          <div class="vp-grid">
            <div class="vp-card" v-for="n in 3" :key="n">卡片 {{ n }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ B · 居中 Pill Tab ============ -->
    <section class="scheme">
      <div class="scheme-head">
        <span class="scheme-key">B</span>
        <div class="scheme-meta">
          <div class="scheme-title">{{ schemes[1].title }} <span class="scheme-tag">{{ schemes[1].tag }}</span></div>
          <div class="scheme-desc">{{ schemes[1].desc }}</div>
        </div>
      </div>
      <div class="vp">
        <nav class="b-nav">
          <div class="b-left">
            <LogoMark :size="28" uid="b" />
            <span class="b-brand">抢单平台</span>
          </div>
          <div class="b-pill">
            <button
              v-for="it in navItems"
              :key="it.key"
              class="b-tab"
              :class="{ 'is-active': activeNav.B === it.key }"
              @click="setActive('B', it.key)"
            >
              {{ it.label }}
            </button>
          </div>
          <div class="b-right">
            <button class="icon-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2"/></svg>
            </button>
            <div class="user-chip">
              <div class="ava">张</div>
              <span>张三</span>
            </div>
          </div>
        </nav>
        <div class="vp-body">
          <div class="vp-page-title">{{ navItems.find(i => i.key === activeNav.B)?.label }}</div>
          <div class="vp-grid">
            <div class="vp-card" v-for="n in 3" :key="n">卡片 {{ n }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ C · 双层顶栏 ============ -->
    <section class="scheme">
      <div class="scheme-head">
        <span class="scheme-key">C</span>
        <div class="scheme-meta">
          <div class="scheme-title">{{ schemes[2].title }} <span class="scheme-tag">{{ schemes[2].tag }}</span></div>
          <div class="scheme-desc">{{ schemes[2].desc }}</div>
        </div>
      </div>
      <div class="vp">
        <nav class="c-top">
          <div class="c-brand-wrap">
            <LogoMark :size="30" uid="c" />
            <span class="c-brand">抢单平台</span>
          </div>
          <div class="c-right">
            <button class="icon-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2"/></svg>
            </button>
            <div class="user-chip">
              <div class="ava">张</div>
              <span>张三</span>
            </div>
          </div>
        </nav>
        <nav class="c-sub">
          <button
            v-for="it in navItems"
            :key="it.key"
            class="c-tab"
            :class="{ 'is-active': activeNav.C === it.key }"
            @click="setActive('C', it.key)"
          >
            {{ it.label }}
          </button>
        </nav>
        <div class="vp-body">
          <div class="vp-page-title">{{ navItems.find(i => i.key === activeNav.C)?.label }}</div>
          <div class="vp-grid">
            <div class="vp-card" v-for="n in 3" :key="n">卡片 {{ n }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ D · 移动 Bottom Tab ============ -->
    <section class="scheme">
      <div class="scheme-head">
        <span class="scheme-key">D</span>
        <div class="scheme-meta">
          <div class="scheme-title">{{ schemes[3].title }} <span class="scheme-tag">{{ schemes[3].tag }}</span></div>
          <div class="scheme-desc">{{ schemes[3].desc }}</div>
        </div>
      </div>
      <div class="vp vp-mobile">
        <nav class="d-top">
          <div class="d-brand-wrap">
            <LogoMark :size="24" uid="d" />
            <span class="d-brand">抢单</span>
          </div>
          <div class="d-actions">
            <button class="icon-btn icon-btn-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2"/></svg>
            </button>
            <div class="ava ava-sm">张</div>
          </div>
        </nav>
        <div class="vp-body vp-body-mobile">
          <div class="vp-page-title vp-page-title-sm">{{ navItems.find(i => i.key === activeNav.D)?.label }}</div>
          <div class="vp-list">
            <div class="vp-list-row" v-for="n in 4" :key="n">
              <div class="vp-list-dot"></div>
              <div>
                <div class="vp-list-t">列表项 {{ n }}</div>
                <div class="vp-list-s">说明文字</div>
              </div>
            </div>
          </div>
        </div>
        <nav class="d-bottom">
          <button
            v-for="it in navItems"
            :key="it.key"
            class="d-tab"
            :class="{ 'is-active': activeNav.D === it.key }"
            @click="setActive('D', it.key)"
          >
            <div class="d-icon">
              <svg v-if="it.key === 'hall'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
              <svg v-else-if="it.key === 'tasks'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <span class="d-label">{{ it.label }}</span>
          </button>
        </nav>
      </div>
    </section>

    <!-- ============ E · 浮动胶囊 ============ -->
    <section class="scheme">
      <div class="scheme-head">
        <span class="scheme-key">E</span>
        <div class="scheme-meta">
          <div class="scheme-title">{{ schemes[4].title }} <span class="scheme-tag">{{ schemes[4].tag }}</span></div>
          <div class="scheme-desc">{{ schemes[4].desc }}</div>
        </div>
      </div>
      <div class="vp vp-e">
        <div class="e-decor"></div>
        <nav class="e-nav">
          <div class="e-brand-wrap">
            <LogoMark :size="26" uid="e" />
            <span class="e-brand">抢单</span>
          </div>
          <div class="e-pill">
            <button
              v-for="it in navItems"
              :key="it.key"
              class="e-tab"
              :class="{ 'is-active': activeNav.E === it.key }"
              @click="setActive('E', it.key)"
            >
              {{ it.label }}
            </button>
          </div>
          <div class="e-right">
            <button class="icon-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2"/></svg>
            </button>
            <div class="ava">张</div>
          </div>
        </nav>
        <div class="vp-body vp-body-e">
          <div class="vp-page-title">{{ navItems.find(i => i.key === activeNav.E)?.label }}</div>
          <div class="vp-grid">
            <div class="vp-card" v-for="n in 3" :key="n">卡片 {{ n }}</div>
          </div>
        </div>
      </div>
    </section>

    <footer class="demo-foot">
      团团推荐：B（桌面）+ D（移动）。挑好告诉我哪一个，动手改 MainLayout。
    </footer>
  </div>
</template>

<style scoped>
/* ============ Page ============ */
.demo-page {
  min-height: 100vh;
  background: var(--bg-page);
  color: var(--fg);
  padding: 48px 24px 80px;
  font-family: var(--font-family-base);
}

.demo-head {
  max-width: 1100px;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.head-left {
  display: flex;
  align-items: center;
  gap: 14px;
}
.head-eyebrow {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: .14em;
  color: var(--fg-4);
  margin-bottom: 2px;
}
.head-title {
  font-size: 22px;
  font-weight: 700;
  margin: 0;
  color: var(--fg);
  letter-spacing: -.015em;
}
.theme-cycle {
  height: 34px;
  padding: 0 14px;
  background: var(--bg-surface);
  border: 1px solid var(--border-soft);
  border-radius: 8px;
  font-size: 13px;
  color: var(--fg-2);
  cursor: pointer;
  font-family: inherit;
  transition: all .15s;
}
.theme-cycle:hover {
  border-color: var(--accent);
  color: var(--accent-fg);
}

.demo-intro {
  max-width: 1100px;
  margin: 0 auto 32px;
  font-size: 13.5px;
  color: var(--fg-3);
  line-height: 1.6;
}

/* ============ Scheme card ============ */
.scheme {
  max-width: 1100px;
  margin: 0 auto 36px;
}
.scheme-head {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 14px;
}
.scheme-key {
  flex-shrink: 0;
  width: 32px; height: 32px;
  border-radius: 8px;
  background: var(--accent);
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  display: flex; align-items: center; justify-content: center;
  letter-spacing: -.02em;
}
.scheme-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--fg);
  display: flex;
  align-items: center;
  gap: 8px;
}
.scheme-tag {
  font-size: 10.5px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 4px;
  background: var(--accent-bg);
  color: var(--accent-fg);
  letter-spacing: .04em;
}
.scheme-desc {
  font-size: 12.5px;
  color: var(--fg-3);
  margin-top: 3px;
  line-height: 1.5;
}

/* ============ Viewport (mock window) ============ */
.vp {
  border: 1px solid var(--border-soft);
  border-radius: 12px;
  background: var(--bg-page);
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(15, 23, 42, .06);
}
[data-theme="dark"] .vp {
  box-shadow: 0 8px 24px rgba(0, 0, 0, .35);
}

.vp-body {
  background: var(--bg-page);
  padding: 22px 24px 36px;
  min-height: 220px;
}
.vp-page-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--fg);
  margin-bottom: 14px;
  letter-spacing: -.015em;
}
.vp-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.vp-card {
  height: 80px;
  border-radius: 10px;
  background: var(--bg-surface);
  border: 1px solid var(--border-soft);
  display: flex; align-items: center; justify-content: center;
  font-size: 13px;
  color: var(--fg-3);
}

.icon-btn {
  width: 32px; height: 32px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid transparent;
  color: var(--fg-3);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: all .15s;
}
.icon-btn:hover {
  background: var(--bg-soft);
  color: var(--fg);
}
.icon-btn-sm { width: 28px; height: 28px; }

.user-chip {
  display: flex; align-items: center; gap: 8px;
  height: 32px;
  padding: 0 10px 0 4px;
  border-radius: 999px;
  border: 1px solid var(--border-soft);
  font-size: 12.5px;
  color: var(--fg-2);
  cursor: pointer;
  transition: all .15s;
}
.user-chip:hover {
  border-color: var(--border-strong);
}
.ava {
  width: 26px; height: 26px;
  border-radius: 50%;
  background: var(--accent);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px;
  font-weight: 600;
}
.ava-sm { width: 22px; height: 22px; font-size: 11px; }

/* ============ A · 横排 Tab ============ */
.a-nav {
  height: 56px;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-soft);
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.a-left { display: flex; align-items: center; gap: 24px; }
.a-brand {
  font-size: 14px;
  font-weight: 700;
  color: var(--fg);
  letter-spacing: -.005em;
}
.a-tabs { display: flex; gap: 4px; height: 56px; align-items: stretch; }
.a-tab {
  position: relative;
  padding: 0 14px;
  background: transparent;
  border: none;
  font-size: 13.5px;
  font-weight: 500;
  color: var(--fg-3);
  cursor: pointer;
  font-family: inherit;
  transition: color .15s;
  display: flex; align-items: center;
}
.a-tab:hover { color: var(--fg); }
.a-tab.is-active {
  color: var(--fg);
  font-weight: 600;
}
.a-tab.is-active::after {
  content: '';
  position: absolute;
  left: 14px; right: 14px;
  bottom: -1px;
  height: 2px;
  background: var(--accent);
  border-radius: 2px 2px 0 0;
}
.a-right { display: flex; align-items: center; gap: 8px; }

/* ============ B · 居中 Pill Tab ============ */
.b-nav {
  height: 56px;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-soft);
  padding: 0 20px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 16px;
}
.b-left { display: flex; align-items: center; gap: 10px; }
.b-brand {
  font-size: 14px;
  font-weight: 700;
  color: var(--fg);
}
.b-pill {
  display: inline-flex;
  padding: 4px;
  background: var(--bg-soft);
  border-radius: 999px;
  gap: 2px;
}
.b-tab {
  padding: 6px 16px;
  background: transparent;
  border: none;
  font-size: 13px;
  font-weight: 500;
  color: var(--fg-3);
  cursor: pointer;
  font-family: inherit;
  border-radius: 999px;
  transition: all .18s;
}
.b-tab:hover:not(.is-active) { color: var(--fg); }
.b-tab.is-active {
  background: var(--bg-surface);
  color: var(--fg);
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(15, 23, 42, .08), 0 1px 2px rgba(15, 23, 42, .04);
}
[data-theme="dark"] .b-tab.is-active {
  background: var(--bg-surface);
  box-shadow: 0 1px 3px rgba(0, 0, 0, .4);
}
.b-right { display: flex; align-items: center; gap: 8px; justify-content: flex-end; }

/* ============ C · 双层顶栏 ============ */
.c-top {
  height: 52px;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-soft);
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.c-brand-wrap { display: flex; align-items: center; gap: 10px; }
.c-brand {
  font-size: 14.5px;
  font-weight: 700;
  color: var(--fg);
  letter-spacing: -.005em;
}
.c-right { display: flex; align-items: center; gap: 8px; }
.c-sub {
  height: 44px;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-soft);
  padding: 0 20px;
  display: flex;
  gap: 4px;
  align-items: stretch;
}
.c-tab {
  position: relative;
  padding: 0 14px;
  background: transparent;
  border: none;
  font-size: 13px;
  font-weight: 500;
  color: var(--fg-3);
  cursor: pointer;
  font-family: inherit;
  display: flex; align-items: center;
  transition: color .15s;
}
.c-tab:hover { color: var(--fg); }
.c-tab.is-active {
  color: var(--accent-fg);
  font-weight: 600;
}
.c-tab.is-active::after {
  content: '';
  position: absolute;
  left: 14px; right: 14px;
  bottom: -1px;
  height: 2px;
  background: var(--accent);
  border-radius: 2px 2px 0 0;
}

/* ============ D · 移动 Bottom Tab ============ */
.vp-mobile {
  width: 375px;
  margin: 0 auto;
  border-radius: 28px;
  overflow: hidden;
  box-shadow: 0 18px 40px rgba(15, 23, 42, .12), 0 0 0 8px var(--bg-muted);
  position: relative;
}
[data-theme="dark"] .vp-mobile {
  box-shadow: 0 18px 40px rgba(0, 0, 0, .5), 0 0 0 8px var(--bg-muted);
}
.d-top {
  height: 50px;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-soft);
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.d-brand-wrap { display: flex; align-items: center; gap: 8px; }
.d-brand { font-size: 14px; font-weight: 700; color: var(--fg); }
.d-actions { display: flex; align-items: center; gap: 6px; }
.vp-body-mobile { padding: 18px 16px 18px; min-height: 320px; }
.vp-page-title-sm { font-size: 16px; }
.vp-list { display: flex; flex-direction: column; gap: 10px; }
.vp-list-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 10px;
  background: var(--bg-surface);
  border: 1px solid var(--border-soft);
}
.vp-list-dot {
  width: 36px; height: 36px;
  border-radius: 8px;
  background: var(--accent-bg);
  flex-shrink: 0;
}
.vp-list-t { font-size: 13.5px; font-weight: 600; color: var(--fg); }
.vp-list-s { font-size: 12px; color: var(--fg-4); margin-top: 2px; }
.d-bottom {
  height: 64px;
  background: var(--bg-surface);
  border-top: 1px solid var(--border-soft);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  padding: 6px 0 8px;
}
.d-tab {
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
  transition: color .15s;
}
.d-tab.is-active { color: var(--accent-fg); }
.d-icon { display: flex; }
.d-label { font-size: 10.5px; font-weight: 500; letter-spacing: .02em; }

/* ============ E · 浮动胶囊 ============ */
.vp-e {
  position: relative;
  background:
    radial-gradient(at 20% 0%, var(--accent-bg-2) 0%, transparent 50%),
    radial-gradient(at 80% 0%, var(--brand-100) 0%, transparent 60%),
    var(--bg-page);
}
[data-theme="dark"] .vp-e {
  background:
    radial-gradient(at 20% 0%, rgba(139, 133, 255, .25) 0%, transparent 50%),
    radial-gradient(at 80% 0%, rgba(99, 91, 255, .15) 0%, transparent 60%),
    var(--bg-page);
}
.e-decor { display: none; }
.e-nav {
  position: relative;
  z-index: 2;
  margin: 16px 20px 0;
  padding: 8px 8px 8px 16px;
  background: rgba(255, 255, 255, .65);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, .8);
  border-radius: 999px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 14px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, .08);
}
[data-theme="dark"] .e-nav {
  background: rgba(24, 29, 44, .65);
  border-color: rgba(255, 255, 255, .08);
  box-shadow: 0 8px 24px rgba(0, 0, 0, .4);
}
.e-brand-wrap { display: flex; align-items: center; gap: 8px; }
.e-brand { font-size: 13.5px; font-weight: 700; color: var(--fg); }
.e-pill {
  justify-self: center;
  display: inline-flex;
  gap: 2px;
}
.e-tab {
  padding: 6px 14px;
  background: transparent;
  border: none;
  font-size: 12.5px;
  font-weight: 500;
  color: var(--fg-3);
  cursor: pointer;
  font-family: inherit;
  border-radius: 999px;
  transition: all .18s;
}
.e-tab:hover:not(.is-active) { color: var(--fg); }
.e-tab.is-active {
  background: var(--accent);
  color: #fff;
  font-weight: 600;
}
.e-right { display: flex; align-items: center; gap: 6px; justify-self: end; }
.vp-body-e { padding-top: 28px; }

/* ============ Footer ============ */
.demo-foot {
  max-width: 1100px;
  margin: 40px auto 0;
  padding: 16px 0;
  border-top: 1px dashed var(--border-soft);
  font-size: 12.5px;
  color: var(--fg-4);
  text-align: center;
}

@media (max-width: 720px) {
  .demo-page { padding: 24px 16px 60px; }
  .vp-grid { grid-template-columns: 1fr; }
  .a-tabs { gap: 0; }
  .a-tab { padding: 0 10px; font-size: 13px; }
  .b-nav { grid-template-columns: 1fr; gap: 8px; padding: 12px 16px; height: auto; }
  .b-left, .b-right { justify-self: start; }
}
</style>
