<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <div class="page-wrap">
    <div class="page-head">
      <div>
        <h1 class="page-title">{{ (route.meta.title as string) || '页面' }}</h1>
        <div class="page-sub">该模块正在开发中，敬请期待</div>
      </div>
    </div>

    <div class="card">
      <div class="card-body placeholder-body">
        <svg class="placeholder-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="8" y="12" width="48" height="40" rx="4" />
          <line x1="14" y1="22" x2="34" y2="22" />
          <line x1="14" y1="30" x2="50" y2="30" />
          <line x1="14" y1="38" x2="44" y2="38" />
          <line x1="14" y1="46" x2="38" y2="46" />
        </svg>
        <h3>功能开发中</h3>
        <p>「{{ (route.meta.title as string) || '该模块' }}」正在紧锣密鼓地建设中，敬请期待</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-wrap {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.placeholder-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 80px 24px;
  gap: 16px;
}

.placeholder-icon {
  width: 64px;
  height: 64px;
  color: var(--accent);
  opacity: 0.4;
}

.placeholder-body h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--fg);
}

.placeholder-body p {
  margin: 0;
  font-size: 13.5px;
  color: var(--fg-3);
  max-width: 340px;
  line-height: 1.6;
}
</style>
