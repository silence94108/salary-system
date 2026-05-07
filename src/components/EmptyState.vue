<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  description?: string
  actionText?: string
  type?: 'default' | 'search' | 'data'
}>(), {
  title: '暂无数据',
  description: '',
  type: 'default'
})

const emit = defineEmits<{
  action: []
}>()
</script>

<template>
  <div class="empty-state">
    <div class="empty-illustration">
      <!-- 默认空态插画 -->
      <svg v-if="type === 'default'" width="120" height="120" viewBox="0 0 120 120" fill="none">
        <circle cx="60" cy="60" r="50" fill="#FFF7ED" />
        <path d="M40 55 L50 65 L70 45" stroke="#F97316" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" opacity="0.3" />
        <rect x="35" y="70" width="50" height="30" rx="4" fill="#FFEDD5" />
        <line x1="45" y1="78" x2="65" y2="78" stroke="#FB923C" stroke-width="2" stroke-linecap="round" />
        <line x1="45" y1="85" x2="75" y2="85" stroke="#FB923C" stroke-width="2" stroke-linecap="round" />
        <line x1="45" y1="92" x2="70" y2="92" stroke="#FB923C" stroke-width="2" stroke-linecap="round" />
      </svg>

      <!-- 搜索空态插画 -->
      <svg v-else-if="type === 'search'" width="120" height="120" viewBox="0 0 120 120" fill="none">
        <circle cx="60" cy="60" r="50" fill="#FFF7ED" />
        <circle cx="55" cy="55" r="20" stroke="#F97316" stroke-width="3" fill="none" />
        <line x1="70" y1="70" x2="85" y2="85" stroke="#F97316" stroke-width="3" stroke-linecap="round" />
        <path d="M50 55 Q55 50 60 55" stroke="#FB923C" stroke-width="2" fill="none" opacity="0.5" />
      </svg>

      <!-- 数据空态插画 -->
      <svg v-else-if="type === 'data'" width="120" height="120" viewBox="0 0 120 120" fill="none">
        <circle cx="60" cy="60" r="50" fill="#FFF7ED" />
        <rect x="30" y="45" width="60" height="40" rx="4" fill="#FFEDD5" />
        <line x1="40" y1="55" x2="80" y2="55" stroke="#FB923C" stroke-width="2" />
        <line x1="40" y1="65" x2="70" y2="65" stroke="#FB923C" stroke-width="2" opacity="0.6" />
        <line x1="40" y1="75" x2="75" y2="75" stroke="#FB923C" stroke-width="2" opacity="0.4" />
        <circle cx="75" cy="35" r="8" fill="#F97316" />
        <path d="M73 35 L75 37 L79 33" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </div>

    <h3 class="empty-title">{{ title }}</h3>
    <p v-if="description" class="empty-description">{{ description }}</p>

    <el-button
      v-if="actionText"
      type="primary"
      @click="emit('action')"
      class="empty-action"
    >
      {{ actionText }}
    </el-button>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-12) var(--space-6);
  text-align: center;
}

.empty-illustration {
  margin-bottom: var(--space-6);
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.empty-illustration svg {
  filter: drop-shadow(0 4px 12px rgba(249, 115, 22, 0.15));
}

.empty-title {
  font-size: var(--font-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--space-2) 0;
}

.empty-description {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  margin: 0 0 var(--space-6) 0;
  max-width: 400px;
  line-height: var(--line-height-relaxed);
}

.empty-action {
  margin-top: var(--space-2);
}

@media screen and (max-width: 768px) {
  .empty-state {
    padding: var(--space-8) var(--space-4);
  }

  .empty-illustration svg {
    width: 100px;
    height: 100px;
  }

  .empty-title {
    font-size: var(--font-base);
  }

  .empty-description {
    font-size: var(--font-xs);
  }
}
</style>
