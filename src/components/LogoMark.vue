<script setup lang="ts">
/**
 * LogoMark - 抢单平台品牌符号
 *
 * 候选 J：双手交接
 * - 撮合 · 信任
 * - 两只简化手交接文件，传达"发布方→承接方"的撮合过程
 * - 有温度、有信任感
 */
withDefaults(defineProps<{
  size?: number | string
  /** 唯一 ID 后缀，多实例同页时避免 gradient ID 冲突 */
  uid?: string
}>(), {
  size: 40,
  uid: 'a'
})
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="logo-mark"
    role="img"
    aria-label="抢单平台"
  >
    <defs>
      <linearGradient :id="`lm-warm-${uid}`" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FB923C" />
        <stop offset="100%" stop-color="#F97316" />
      </linearGradient>
    </defs>

    <!-- 圆角橙色底 -->
    <rect x="2" y="2" width="36" height="36" rx="10" :fill="`url(#lm-warm-${uid})`" />

    <!-- 左手 -->
    <path
      d="M 6 22 L 14 22 Q 16 22 16 20 L 16 18 Q 16 16 18 16 L 20 16"
      fill="none"
      stroke="white"
      stroke-width="2"
      stroke-linecap="round"
    />

    <!-- 右手 -->
    <path
      d="M 34 22 L 26 22 Q 24 22 24 20 L 24 18 Q 24 16 22 16 L 20 16"
      fill="none"
      stroke="white"
      stroke-width="2"
      stroke-linecap="round"
    />

    <!-- 中央文件/订单 -->
    <rect x="17" y="12" width="6" height="8" rx="1" fill="white" />

    <!-- 底部微笑弧线（可选装饰） -->
    <path
      d="M 14 26 Q 20 30 26 26"
      fill="none"
      stroke="white"
      stroke-width="1.5"
      stroke-linecap="round"
      opacity="0.7"
    />
  </svg>
</template>

<style scoped>
.logo-mark {
  display: block;
  filter: drop-shadow(0 4px 12px rgba(249, 115, 22, 0.28));
  transition: transform 350ms cubic-bezier(0.34, 1.56, 0.64, 1),
              filter 250ms ease;
}

.logo-mark:hover {
  transform: rotate(-4deg) scale(1.05);
  filter: drop-shadow(0 6px 16px rgba(236, 72, 153, 0.35));
}
</style>
