<script setup lang="ts">
/**
 * LogoMark - 抢单平台品牌符号
 *
 * 设计原则（参考 inkbotdesign / 99designs / Mastercard / Vercel）：
 * - Simplicity: 双三角 + 中央点，5 秒可凭记忆画出
 * - 2 色: 深橙 + 亮橙渐变，同色系不杂乱
 * - 16x16 测试: 形状辨识度高，缩成 favicon 仍可识别
 * - 业务意义: 双三角 = 发布方/承接方，中央点 = 撮合点
 */
withDefaults(defineProps<{
  size?: number | string
  /** 唯一 ID 后缀，多实例同页时避免 gradient ID 冲突 */
  uid?: string
  /** 是否显示中央撮合点（默认显示，favicon 缩到 16px 时可关掉） */
  showDot?: boolean
}>(), {
  size: 40,
  uid: 'a',
  showDot: true
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
        <stop offset="0%" stop-color="#FDBA74" />
        <stop offset="100%" stop-color="#F97316" />
      </linearGradient>
    </defs>

    <!-- 左上三角：深橙实色，代表"发布方" -->
    <path
      d="M 4 8 L 22 8 L 4 26 Z"
      fill="#C2410C"
    />

    <!-- 右下三角：亮橙渐变，代表"承接方"（抢单方）-->
    <path
      d="M 36 32 L 18 32 L 36 14 Z"
      :fill="`url(#lm-warm-${uid})`"
    />

    <!-- 中央撮合点：粉色，品牌强调色 -->
    <circle
      v-if="showDot"
      cx="20"
      cy="20"
      r="2.5"
      fill="#EC4899"
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
