<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

interface Candidate {
  id: string
  name: string
  vibe: string
  desc: string
  selected?: boolean
}

const candidates: Candidate[] = [
  { id: 'A', name: '双三角错位', vibe: '几何拼合 · 撮合', desc: '左上深橙 + 右下亮橙 + 中央粉点。两形错位对峙，传达"发布方/承接方/撮合点"。当前 Demo 页方案。' },
  { id: 'B', name: '闪电 Bolt',   vibe: '速度 · 紧迫', desc: '圆角橙底 + 白色闪电。最直观传达"抢"的速度感。京东闪电、美团骑手同类调性。' },
  { id: 'C', name: 'Vercel 三角', vibe: '极简 · 上升', desc: '单一向上三角 + 内嵌白色反向小三角。极简、scalable、现代 SaaS 主流。Vercel/Linear 同流派。' },
  { id: 'D', name: '抽象 S 斜线', vibe: '流转 · 现代', desc: '三条斜向横条组合成抽象 S 字母。Stripe 风格。强专业感，scalable，含蓄品牌联想。' },
  { id: 'E', name: '同心圆脉冲', vibe: '连接 · 脉动', desc: '3 圈同心圆 + 中央实心点。传达"信号/脉动/连接"。配合品牌动效（脉冲扩散）效果极佳。' },
  { id: 'F', name: '双圆 Mastercard', vibe: '撮合 · 经典', desc: '橙色 + 粉色双圆错位重叠，重叠区域产生第三种暖红色。最直观传达"双方对接"。' },
  { id: 'G', name: '抓取之手', vibe: '抢 · 行动力', desc: '一只简化的手正在抓取圆形订单。最直观传达"抢单"动作本身，有力量感和紧迫感。' },
  { id: 'H', name: '订单飞出', vibe: '速度 · 到手', desc: '文件/订单图标 + 右上方速度线。传达"任务被抢到了、飞速到手"。动感强。' },
  { id: 'I', name: '钱币上升', vibe: '薪资 · 增长', desc: '硬币 + 上升箭头组合。直接传达"赚钱""薪资增长"。偏金融/收入工具调性。' },
  { id: 'J', name: '双手交接', vibe: '撮合 · 信任', desc: '两只简化手交接文件。传达"发布方→承接方"的撮合过程。有温度、有信任感。' },
  { id: 'K', name: '奔跑接单', vibe: '活力 · 竞争', desc: '极简奔跑人形 + 手持文件。传达"跑着去抢单"的竞争活力。运动感强。' },
  { id: 'L', name: '订单闪电', vibe: '极速 · 订单', desc: '文件图标上叠加闪电符号。"订单+速度"双重含义一目了然。辨识度高。' }
]

const selected = ref<string | null>(null)

function pick(id: string) {
  selected.value = id
  const c = candidates.find(x => x.id === id)
  ElMessage.success(`已选 ${c?.name}（候选 ${id}）— 告诉团团这个 ID，去把 LogoMark.vue 换成它`)
}
</script>

<template>
  <div class="picker">
    <header class="picker-header">
      <div class="picker-title">Logo 候选对比</div>
      <div class="picker-sub">12 个方向 · 每个看 3 种尺寸 + 单色测试 · 选好告诉团团 ID</div>
    </header>

    <div class="picker-grid">
      <!-- ============ A: 双三角错位 ============ -->
      <article class="card" :class="{ active: selected === 'A' }">
        <div class="card-id">A</div>
        <div class="card-stage">
          <svg viewBox="0 0 40 40" width="80" height="80" class="lm">
            <defs>
              <linearGradient id="ga-a" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#FDBA74" />
                <stop offset="100%" stop-color="#F97316" />
              </linearGradient>
            </defs>
            <path d="M 4 8 L 22 8 L 4 26 Z" fill="#C2410C" />
            <path d="M 36 32 L 18 32 L 36 14 Z" fill="url(#ga-a)" />
            <circle cx="20" cy="20" r="2.5" fill="#EC4899" />
          </svg>
        </div>
        <div class="card-sizes">
          <span class="size-label">40px</span>
          <svg viewBox="0 0 40 40" width="40" height="40">
            <defs><linearGradient id="ga-a2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FDBA74" /><stop offset="100%" stop-color="#F97316" /></linearGradient></defs>
            <path d="M 4 8 L 22 8 L 4 26 Z" fill="#C2410C" />
            <path d="M 36 32 L 18 32 L 36 14 Z" fill="url(#ga-a2)" />
            <circle cx="20" cy="20" r="2.5" fill="#EC4899" />
          </svg>
          <span class="size-label">16px</span>
          <svg viewBox="0 0 40 40" width="16" height="16">
            <defs><linearGradient id="ga-a3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FDBA74" /><stop offset="100%" stop-color="#F97316" /></linearGradient></defs>
            <path d="M 4 8 L 22 8 L 4 26 Z" fill="#C2410C" />
            <path d="M 36 32 L 18 32 L 36 14 Z" fill="url(#ga-a3)" />
          </svg>
          <span class="size-label">单色</span>
          <svg viewBox="0 0 40 40" width="32" height="32">
            <path d="M 4 8 L 22 8 L 4 26 Z" fill="#1F2937" />
            <path d="M 36 32 L 18 32 L 36 14 Z" fill="#6B7280" />
            <circle cx="20" cy="20" r="2.5" fill="#1F2937" />
          </svg>
        </div>
        <h3 class="card-name">双三角错位</h3>
        <div class="card-vibe">几何拼合 · 撮合</div>
        <p class="card-desc">左上深橙 + 右下亮橙 + 中央粉点。两形错位对峙，传达"发布方/承接方/撮合点"。当前 Demo 页方案。</p>
        <el-button type="primary" round @click="pick('A')">选 A</el-button>
      </article>

      <!-- ============ B: 闪电 Bolt ============ -->
      <article class="card" :class="{ active: selected === 'B' }">
        <div class="card-id">B</div>
        <div class="card-stage">
          <svg viewBox="0 0 40 40" width="80" height="80" class="lm">
            <defs>
              <linearGradient id="gb-1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#FB923C" />
                <stop offset="100%" stop-color="#EA580C" />
              </linearGradient>
            </defs>
            <rect x="2" y="2" width="36" height="36" rx="10" fill="url(#gb-1)" />
            <path d="M 23 8 L 13 22 L 19 22 L 17 32 L 27 18 L 21 18 Z" fill="white" />
          </svg>
        </div>
        <div class="card-sizes">
          <span class="size-label">40px</span>
          <svg viewBox="0 0 40 40" width="40" height="40">
            <defs><linearGradient id="gb-2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FB923C" /><stop offset="100%" stop-color="#EA580C" /></linearGradient></defs>
            <rect x="2" y="2" width="36" height="36" rx="10" fill="url(#gb-2)" />
            <path d="M 23 8 L 13 22 L 19 22 L 17 32 L 27 18 L 21 18 Z" fill="white" />
          </svg>
          <span class="size-label">16px</span>
          <svg viewBox="0 0 40 40" width="16" height="16">
            <defs><linearGradient id="gb-3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FB923C" /><stop offset="100%" stop-color="#EA580C" /></linearGradient></defs>
            <rect x="2" y="2" width="36" height="36" rx="10" fill="url(#gb-3)" />
            <path d="M 23 8 L 13 22 L 19 22 L 17 32 L 27 18 L 21 18 Z" fill="white" />
          </svg>
          <span class="size-label">单色</span>
          <svg viewBox="0 0 40 40" width="32" height="32">
            <rect x="2" y="2" width="36" height="36" rx="10" fill="#1F2937" />
            <path d="M 23 8 L 13 22 L 19 22 L 17 32 L 27 18 L 21 18 Z" fill="white" />
          </svg>
        </div>
        <h3 class="card-name">闪电 Bolt</h3>
        <div class="card-vibe">速度 · 紧迫</div>
        <p class="card-desc">圆角橙底 + 白色闪电。最直观传达"抢"的速度感。京东闪电、美团骑手同类调性。</p>
        <el-button type="primary" round @click="pick('B')">选 B</el-button>
      </article>

      <!-- ============ C: Vercel 三角 ============ -->
      <article class="card" :class="{ active: selected === 'C' }">
        <div class="card-id">C</div>
        <div class="card-stage">
          <svg viewBox="0 0 40 40" width="80" height="80" class="lm">
            <defs>
              <linearGradient id="gc-1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#FB923C" />
                <stop offset="100%" stop-color="#F97316" />
              </linearGradient>
            </defs>
            <path d="M 20 4 L 36 32 L 4 32 Z" fill="url(#gc-1)" />
            <path d="M 20 18 L 28 30 L 12 30 Z" fill="#FFFBF5" />
          </svg>
        </div>
        <div class="card-sizes">
          <span class="size-label">40px</span>
          <svg viewBox="0 0 40 40" width="40" height="40">
            <defs><linearGradient id="gc-2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FB923C" /><stop offset="100%" stop-color="#F97316" /></linearGradient></defs>
            <path d="M 20 4 L 36 32 L 4 32 Z" fill="url(#gc-2)" />
            <path d="M 20 18 L 28 30 L 12 30 Z" fill="#FFFBF5" />
          </svg>
          <span class="size-label">16px</span>
          <svg viewBox="0 0 40 40" width="16" height="16">
            <defs><linearGradient id="gc-3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FB923C" /><stop offset="100%" stop-color="#F97316" /></linearGradient></defs>
            <path d="M 20 4 L 36 32 L 4 32 Z" fill="url(#gc-3)" />
            <path d="M 20 18 L 28 30 L 12 30 Z" fill="#FFFBF5" />
          </svg>
          <span class="size-label">单色</span>
          <svg viewBox="0 0 40 40" width="32" height="32">
            <path d="M 20 4 L 36 32 L 4 32 Z" fill="#1F2937" />
          </svg>
        </div>
        <h3 class="card-name">Vercel 三角</h3>
        <div class="card-vibe">极简 · 上升</div>
        <p class="card-desc">单一向上三角 + 内嵌白色反向小三角。极简、scalable、现代 SaaS 主流。Vercel/Linear 同流派。</p>
        <el-button type="primary" round @click="pick('C')">选 C</el-button>
      </article>

      <!-- ============ D: 抽象 S 斜线 ============ -->
      <article class="card" :class="{ active: selected === 'D' }">
        <div class="card-id">D</div>
        <div class="card-stage">
          <svg viewBox="0 0 40 40" width="80" height="80" class="lm">
            <defs>
              <linearGradient id="gd-1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#FB923C" />
                <stop offset="100%" stop-color="#EA580C" />
              </linearGradient>
            </defs>
            <rect x="2" y="2" width="36" height="36" rx="10" fill="url(#gd-1)" />
            <path d="M 27 9 L 13 13 L 13 16 L 24 13 Z" fill="white" />
            <path d="M 27 18 L 13 22 L 13 25 L 27 21 Z" fill="white" />
            <path d="M 27 27 L 13 31 L 24 31 L 27 30 Z" fill="white" />
          </svg>
        </div>
        <div class="card-sizes">
          <span class="size-label">40px</span>
          <svg viewBox="0 0 40 40" width="40" height="40">
            <defs><linearGradient id="gd-2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FB923C" /><stop offset="100%" stop-color="#EA580C" /></linearGradient></defs>
            <rect x="2" y="2" width="36" height="36" rx="10" fill="url(#gd-2)" />
            <path d="M 27 9 L 13 13 L 13 16 L 24 13 Z" fill="white" />
            <path d="M 27 18 L 13 22 L 13 25 L 27 21 Z" fill="white" />
            <path d="M 27 27 L 13 31 L 24 31 L 27 30 Z" fill="white" />
          </svg>
          <span class="size-label">16px</span>
          <svg viewBox="0 0 40 40" width="16" height="16">
            <defs><linearGradient id="gd-3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FB923C" /><stop offset="100%" stop-color="#EA580C" /></linearGradient></defs>
            <rect x="2" y="2" width="36" height="36" rx="10" fill="url(#gd-3)" />
            <path d="M 27 9 L 13 13 L 13 16 L 24 13 Z" fill="white" />
            <path d="M 27 18 L 13 22 L 13 25 L 27 21 Z" fill="white" />
            <path d="M 27 27 L 13 31 L 24 31 L 27 30 Z" fill="white" />
          </svg>
          <span class="size-label">单色</span>
          <svg viewBox="0 0 40 40" width="32" height="32">
            <rect x="2" y="2" width="36" height="36" rx="10" fill="#1F2937" />
            <path d="M 27 9 L 13 13 L 13 16 L 24 13 Z" fill="white" />
            <path d="M 27 18 L 13 22 L 13 25 L 27 21 Z" fill="white" />
            <path d="M 27 27 L 13 31 L 24 31 L 27 30 Z" fill="white" />
          </svg>
        </div>
        <h3 class="card-name">抽象 S 斜线</h3>
        <div class="card-vibe">流转 · 现代</div>
        <p class="card-desc">三条斜向横条组合成抽象 S 字母。Stripe 风格。强专业感、scalable、含蓄品牌联想。</p>
        <el-button type="primary" round @click="pick('D')">选 D</el-button>
      </article>

      <!-- ============ E: 同心圆脉冲 ============ -->
      <article class="card" :class="{ active: selected === 'E' }">
        <div class="card-id">E</div>
        <div class="card-stage">
          <svg viewBox="0 0 40 40" width="80" height="80" class="lm">
            <defs>
              <linearGradient id="ge-1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#FB923C" />
                <stop offset="100%" stop-color="#F97316" />
              </linearGradient>
            </defs>
            <circle cx="20" cy="20" r="17" fill="none" stroke="url(#ge-1)" stroke-width="2" opacity="0.35" />
            <circle cx="20" cy="20" r="11.5" fill="none" stroke="url(#ge-1)" stroke-width="2" opacity="0.7" />
            <circle cx="20" cy="20" r="6" fill="url(#ge-1)" />
            <circle cx="20" cy="20" r="2.5" fill="#EC4899" />
          </svg>
        </div>
        <div class="card-sizes">
          <span class="size-label">40px</span>
          <svg viewBox="0 0 40 40" width="40" height="40">
            <defs><linearGradient id="ge-2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FB923C" /><stop offset="100%" stop-color="#F97316" /></linearGradient></defs>
            <circle cx="20" cy="20" r="17" fill="none" stroke="url(#ge-2)" stroke-width="2" opacity="0.35" />
            <circle cx="20" cy="20" r="11.5" fill="none" stroke="url(#ge-2)" stroke-width="2" opacity="0.7" />
            <circle cx="20" cy="20" r="6" fill="url(#ge-2)" />
            <circle cx="20" cy="20" r="2.5" fill="#EC4899" />
          </svg>
          <span class="size-label">16px</span>
          <svg viewBox="0 0 40 40" width="16" height="16">
            <defs><linearGradient id="ge-3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FB923C" /><stop offset="100%" stop-color="#F97316" /></linearGradient></defs>
            <circle cx="20" cy="20" r="17" fill="none" stroke="url(#ge-3)" stroke-width="2.5" opacity="0.35" />
            <circle cx="20" cy="20" r="11.5" fill="none" stroke="url(#ge-3)" stroke-width="2.5" opacity="0.7" />
            <circle cx="20" cy="20" r="6" fill="url(#ge-3)" />
          </svg>
          <span class="size-label">单色</span>
          <svg viewBox="0 0 40 40" width="32" height="32">
            <circle cx="20" cy="20" r="17" fill="none" stroke="#1F2937" stroke-width="2" opacity="0.35" />
            <circle cx="20" cy="20" r="11.5" fill="none" stroke="#1F2937" stroke-width="2" opacity="0.7" />
            <circle cx="20" cy="20" r="6" fill="#1F2937" />
          </svg>
        </div>
        <h3 class="card-name">同心圆脉冲</h3>
        <div class="card-vibe">连接 · 脉动</div>
        <p class="card-desc">3 圈同心圆 + 中央实心点。传达"信号/脉动/连接"。配合品牌动效（脉冲扩散）效果极佳。</p>
        <el-button type="primary" round @click="pick('E')">选 E</el-button>
      </article>

      <!-- ============ F: 双圆 Mastercard ============ -->
      <article class="card" :class="{ active: selected === 'F' }">
        <div class="card-id">F</div>
        <div class="card-stage">
          <svg viewBox="0 0 40 40" width="80" height="80" class="lm">
            <g style="mix-blend-mode: multiply">
              <circle cx="14.5" cy="20" r="11" fill="#F97316" />
              <circle cx="25.5" cy="20" r="11" fill="#EC4899" />
            </g>
          </svg>
        </div>
        <div class="card-sizes">
          <span class="size-label">40px</span>
          <svg viewBox="0 0 40 40" width="40" height="40">
            <g style="mix-blend-mode: multiply">
              <circle cx="14.5" cy="20" r="11" fill="#F97316" />
              <circle cx="25.5" cy="20" r="11" fill="#EC4899" />
            </g>
          </svg>
          <span class="size-label">16px</span>
          <svg viewBox="0 0 40 40" width="16" height="16">
            <g style="mix-blend-mode: multiply">
              <circle cx="14.5" cy="20" r="11" fill="#F97316" />
              <circle cx="25.5" cy="20" r="11" fill="#EC4899" />
            </g>
          </svg>
          <span class="size-label">单色</span>
          <svg viewBox="0 0 40 40" width="32" height="32">
            <g style="mix-blend-mode: multiply">
              <circle cx="14.5" cy="20" r="11" fill="#1F2937" opacity="0.7" />
              <circle cx="25.5" cy="20" r="11" fill="#1F2937" opacity="0.7" />
            </g>
          </svg>
        </div>
        <h3 class="card-name">双圆 Mastercard</h3>
        <div class="card-vibe">撮合 · 经典</div>
        <p class="card-desc">橙色 + 粉色双圆错位重叠，重叠区域产生第三种暖红色。最直观传达"双方对接"。</p>
        <el-button type="primary" round @click="pick('F')">选 F</el-button>
      </article>

      <!-- ============ G: 抓取之手 ============ -->
      <article class="card" :class="{ active: selected === 'G' }">
        <div class="card-id">G</div>
        <div class="card-stage">
          <svg viewBox="0 0 40 40" width="80" height="80" class="lm">
            <defs><linearGradient id="gg-1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FB923C" /><stop offset="100%" stop-color="#EA580C" /></linearGradient></defs>
            <rect x="2" y="2" width="36" height="36" rx="10" fill="url(#gg-1)" />
            <path d="M 14 28 L 14 18 Q 14 16 16 16 Q 18 16 18 18 L 18 14 Q 18 12 20 12 Q 22 12 22 14 L 22 13 Q 22 11 24 11 Q 26 11 26 13 L 26 14 Q 26 12 28 12 Q 30 12 30 14 L 30 22 Q 30 28 26 30 L 18 30 Q 14 30 14 28 Z" fill="white" />
            <circle cx="22" cy="22" r="4" fill="none" stroke="white" stroke-width="1.5" opacity="0.5" />
          </svg>
        </div>
        <div class="card-sizes">
          <span class="size-label">40px</span>
          <svg viewBox="0 0 40 40" width="40" height="40"><defs><linearGradient id="gg-2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FB923C" /><stop offset="100%" stop-color="#EA580C" /></linearGradient></defs><rect x="2" y="2" width="36" height="36" rx="10" fill="url(#gg-2)" /><path d="M 14 28 L 14 18 Q 14 16 16 16 Q 18 16 18 18 L 18 14 Q 18 12 20 12 Q 22 12 22 14 L 22 13 Q 22 11 24 11 Q 26 11 26 13 L 26 14 Q 26 12 28 12 Q 30 12 30 14 L 30 22 Q 30 28 26 30 L 18 30 Q 14 30 14 28 Z" fill="white" /></svg>
          <span class="size-label">16px</span>
          <svg viewBox="0 0 40 40" width="16" height="16"><defs><linearGradient id="gg-3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FB923C" /><stop offset="100%" stop-color="#EA580C" /></linearGradient></defs><rect x="2" y="2" width="36" height="36" rx="10" fill="url(#gg-3)" /><path d="M 14 28 L 14 18 Q 14 16 16 16 Q 18 16 18 18 L 18 14 Q 18 12 20 12 Q 22 12 22 14 L 22 13 Q 22 11 24 11 Q 26 11 26 13 L 26 14 Q 26 12 28 12 Q 30 12 30 14 L 30 22 Q 30 28 26 30 L 18 30 Q 14 30 14 28 Z" fill="white" /></svg>
          <span class="size-label">单色</span>
          <svg viewBox="0 0 40 40" width="32" height="32"><rect x="2" y="2" width="36" height="36" rx="10" fill="#1F2937" /><path d="M 14 28 L 14 18 Q 14 16 16 16 Q 18 16 18 18 L 18 14 Q 18 12 20 12 Q 22 12 22 14 L 22 13 Q 22 11 24 11 Q 26 11 26 13 L 26 14 Q 26 12 28 12 Q 30 12 30 14 L 30 22 Q 30 28 26 30 L 18 30 Q 14 30 14 28 Z" fill="white" /></svg>
        </div>
        <h3 class="card-name">抓取之手</h3>
        <div class="card-vibe">抢 · 行动力</div>
        <p class="card-desc">一只简化的手正在抓取圆形订单。最直观传达"抢单"动作本身，有力量感和紧迫感。</p>
        <el-button type="primary" round @click="pick('G')">选 G</el-button>
      </article>

      <!-- ============ H: 订单飞出 ============ -->
      <article class="card" :class="{ active: selected === 'H' }">
        <div class="card-id">H</div>
        <div class="card-stage">
          <svg viewBox="0 0 40 40" width="80" height="80" class="lm">
            <defs><linearGradient id="gh-1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FB923C" /><stop offset="100%" stop-color="#EA580C" /></linearGradient></defs>
            <rect x="2" y="2" width="36" height="36" rx="10" fill="url(#gh-1)" />
            <path d="M 14 10 L 24 10 L 30 16 L 30 30 L 14 30 Z" fill="white" />
            <path d="M 24 10 L 24 16 L 30 16" fill="none" stroke="#EA580C" stroke-width="1" />
            <line x1="6" y1="14" x2="11" y2="14" stroke="white" stroke-width="1.5" stroke-linecap="round" opacity="0.7" />
            <line x1="5" y1="18" x2="10" y2="18" stroke="white" stroke-width="1.5" stroke-linecap="round" opacity="0.5" />
            <line x1="6" y1="22" x2="11" y2="22" stroke="white" stroke-width="1.5" stroke-linecap="round" opacity="0.7" />
          </svg>
        </div>
        <div class="card-sizes">
          <span class="size-label">40px</span>
          <svg viewBox="0 0 40 40" width="40" height="40"><defs><linearGradient id="gh-2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FB923C" /><stop offset="100%" stop-color="#EA580C" /></linearGradient></defs><rect x="2" y="2" width="36" height="36" rx="10" fill="url(#gh-2)" /><path d="M 14 10 L 24 10 L 30 16 L 30 30 L 14 30 Z" fill="white" /></svg>
          <span class="size-label">16px</span>
          <svg viewBox="0 0 40 40" width="16" height="16"><defs><linearGradient id="gh-3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FB923C" /><stop offset="100%" stop-color="#EA580C" /></linearGradient></defs><rect x="2" y="2" width="36" height="36" rx="10" fill="url(#gh-3)" /><path d="M 14 10 L 24 10 L 30 16 L 30 30 L 14 30 Z" fill="white" /></svg>
          <span class="size-label">单色</span>
          <svg viewBox="0 0 40 40" width="32" height="32"><rect x="2" y="2" width="36" height="36" rx="10" fill="#1F2937" /><path d="M 14 10 L 24 10 L 30 16 L 30 30 L 14 30 Z" fill="white" /></svg>
        </div>
        <h3 class="card-name">订单飞出</h3>
        <div class="card-vibe">速度 · 到手</div>
        <p class="card-desc">文件/订单图标 + 左侧速度线。传达"任务被抢到了、飞速到手"。动感强。</p>
        <el-button type="primary" round @click="pick('H')">选 H</el-button>
      </article>

      <!-- ============ I: 钱币上升 ============ -->
      <article class="card" :class="{ active: selected === 'I' }">
        <div class="card-id">I</div>
        <div class="card-stage">
          <svg viewBox="0 0 40 40" width="80" height="80" class="lm">
            <defs><linearGradient id="gi-1" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="#EA580C" /><stop offset="100%" stop-color="#FBBF24" /></linearGradient></defs>
            <rect x="2" y="2" width="36" height="36" rx="10" fill="url(#gi-1)" />
            <circle cx="18" cy="22" r="8" fill="none" stroke="white" stroke-width="2" />
            <text x="18" y="26" text-anchor="middle" font-size="10" font-weight="700" fill="white">$</text>
            <path d="M 30 26 L 30 12 M 27 15 L 30 12 L 33 15" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <div class="card-sizes">
          <span class="size-label">40px</span>
          <svg viewBox="0 0 40 40" width="40" height="40"><defs><linearGradient id="gi-2" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="#EA580C" /><stop offset="100%" stop-color="#FBBF24" /></linearGradient></defs><rect x="2" y="2" width="36" height="36" rx="10" fill="url(#gi-2)" /><circle cx="18" cy="22" r="8" fill="none" stroke="white" stroke-width="2" /><text x="18" y="26" text-anchor="middle" font-size="10" font-weight="700" fill="white">$</text><path d="M 30 26 L 30 12 M 27 15 L 30 12 L 33 15" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
          <span class="size-label">16px</span>
          <svg viewBox="0 0 40 40" width="16" height="16"><defs><linearGradient id="gi-3" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="#EA580C" /><stop offset="100%" stop-color="#FBBF24" /></linearGradient></defs><rect x="2" y="2" width="36" height="36" rx="10" fill="url(#gi-3)" /><circle cx="18" cy="22" r="8" fill="none" stroke="white" stroke-width="2" /><path d="M 30 26 L 30 12 M 27 15 L 30 12 L 33 15" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
          <span class="size-label">单色</span>
          <svg viewBox="0 0 40 40" width="32" height="32"><rect x="2" y="2" width="36" height="36" rx="10" fill="#1F2937" /><circle cx="18" cy="22" r="8" fill="none" stroke="white" stroke-width="2" /><text x="18" y="26" text-anchor="middle" font-size="10" font-weight="700" fill="white">$</text><path d="M 30 26 L 30 12 M 27 15 L 30 12 L 33 15" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </div>
        <h3 class="card-name">钱币上升</h3>
        <div class="card-vibe">薪资 · 增长</div>
        <p class="card-desc">硬币 + 上升箭头组合。直接传达"赚钱""薪资增长"。偏金融/收入工具调性。</p>
        <el-button type="primary" round @click="pick('I')">选 I</el-button>
      </article>

      <!-- ============ J: 双手交接 ============ -->
      <article class="card" :class="{ active: selected === 'J' }">
        <div class="card-id">J</div>
        <div class="card-stage">
          <svg viewBox="0 0 40 40" width="80" height="80" class="lm">
            <defs><linearGradient id="gj-1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FB923C" /><stop offset="100%" stop-color="#F97316" /></linearGradient></defs>
            <rect x="2" y="2" width="36" height="36" rx="10" fill="url(#gj-1)" />
            <path d="M 6 22 L 14 22 Q 16 22 16 20 L 16 18 Q 16 16 18 16 L 20 16" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" />
            <path d="M 34 22 L 26 22 Q 24 22 24 20 L 24 18 Q 24 16 22 16 L 20 16" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" />
            <rect x="17" y="12" width="6" height="8" rx="1" fill="white" />
            <path d="M 14 26 Q 20 30 26 26" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" opacity="0.7" />
          </svg>
        </div>
        <div class="card-sizes">
          <span class="size-label">40px</span>
          <svg viewBox="0 0 40 40" width="40" height="40"><defs><linearGradient id="gj-2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FB923C" /><stop offset="100%" stop-color="#F97316" /></linearGradient></defs><rect x="2" y="2" width="36" height="36" rx="10" fill="url(#gj-2)" /><path d="M 6 22 L 14 22 Q 16 22 16 20 L 16 18 Q 16 16 18 16 L 20 16" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" /><path d="M 34 22 L 26 22 Q 24 22 24 20 L 24 18 Q 24 16 22 16 L 20 16" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" /><rect x="17" y="12" width="6" height="8" rx="1" fill="white" /></svg>
          <span class="size-label">16px</span>
          <svg viewBox="0 0 40 40" width="16" height="16"><defs><linearGradient id="gj-3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FB923C" /><stop offset="100%" stop-color="#F97316" /></linearGradient></defs><rect x="2" y="2" width="36" height="36" rx="10" fill="url(#gj-3)" /><rect x="17" y="12" width="6" height="8" rx="1" fill="white" /></svg>
          <span class="size-label">单色</span>
          <svg viewBox="0 0 40 40" width="32" height="32"><rect x="2" y="2" width="36" height="36" rx="10" fill="#1F2937" /><path d="M 6 22 L 14 22 Q 16 22 16 20 L 16 18 Q 16 16 18 16 L 20 16" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" /><path d="M 34 22 L 26 22 Q 24 22 24 20 L 24 18 Q 24 16 22 16 L 20 16" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" /><rect x="17" y="12" width="6" height="8" rx="1" fill="white" /></svg>
        </div>
        <h3 class="card-name">双手交接</h3>
        <div class="card-vibe">撮合 · 信任</div>
        <p class="card-desc">两只简化手交接文件。传达"发布方到承接方"的撮合过程。有温度、有信任感。</p>
        <el-button type="primary" round @click="pick('J')">选 J</el-button>
      </article>

      <!-- ============ K: 奔跑接单 ============ -->
      <article class="card" :class="{ active: selected === 'K' }">
        <div class="card-id">K</div>
        <div class="card-stage">
          <svg viewBox="0 0 40 40" width="80" height="80" class="lm">
            <defs><linearGradient id="gk-1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FB923C" /><stop offset="100%" stop-color="#EA580C" /></linearGradient></defs>
            <rect x="2" y="2" width="36" height="36" rx="10" fill="url(#gk-1)" />
            <circle cx="20" cy="11" r="3" fill="white" />
            <path d="M 16 16 L 20 14 L 24 16 M 20 14 L 20 22 M 20 22 L 15 30 M 20 22 L 25 30 M 16 16 L 12 20 M 24 16 L 28 14" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <rect x="27" y="11" width="5" height="6" rx="0.5" fill="white" opacity="0.8" />
          </svg>
        </div>
        <div class="card-sizes">
          <span class="size-label">40px</span>
          <svg viewBox="0 0 40 40" width="40" height="40"><defs><linearGradient id="gk-2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FB923C" /><stop offset="100%" stop-color="#EA580C" /></linearGradient></defs><rect x="2" y="2" width="36" height="36" rx="10" fill="url(#gk-2)" /><circle cx="20" cy="11" r="3" fill="white" /><path d="M 16 16 L 20 14 L 24 16 M 20 14 L 20 22 M 20 22 L 15 30 M 20 22 L 25 30 M 16 16 L 12 20 M 24 16 L 28 14" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
          <span class="size-label">16px</span>
          <svg viewBox="0 0 40 40" width="16" height="16"><defs><linearGradient id="gk-3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FB923C" /><stop offset="100%" stop-color="#EA580C" /></linearGradient></defs><rect x="2" y="2" width="36" height="36" rx="10" fill="url(#gk-3)" /><circle cx="20" cy="11" r="3" fill="white" /><path d="M 16 16 L 20 14 L 24 16 M 20 14 L 20 22 M 20 22 L 15 30 M 20 22 L 25 30" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
          <span class="size-label">单色</span>
          <svg viewBox="0 0 40 40" width="32" height="32"><rect x="2" y="2" width="36" height="36" rx="10" fill="#1F2937" /><circle cx="20" cy="11" r="3" fill="white" /><path d="M 16 16 L 20 14 L 24 16 M 20 14 L 20 22 M 20 22 L 15 30 M 20 22 L 25 30 M 16 16 L 12 20 M 24 16 L 28 14" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </div>
        <h3 class="card-name">奔跑接单</h3>
        <div class="card-vibe">活力 · 竞争</div>
        <p class="card-desc">极简奔跑人形 + 手持文件。传达"跑着去抢单"的竞争活力。运动感强。</p>
        <el-button type="primary" round @click="pick('K')">选 K</el-button>
      </article>

      <!-- ============ L: 订单闪电 ============ -->
      <article class="card" :class="{ active: selected === 'L' }">
        <div class="card-id">L</div>
        <div class="card-stage">
          <svg viewBox="0 0 40 40" width="80" height="80" class="lm">
            <defs><linearGradient id="gl-1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FB923C" /><stop offset="100%" stop-color="#EA580C" /></linearGradient></defs>
            <rect x="2" y="2" width="36" height="36" rx="10" fill="url(#gl-1)" />
            <path d="M 11 8 L 24 8 L 30 14 L 30 32 L 11 32 Z" fill="white" opacity="0.9" />
            <path d="M 24 8 L 24 14 L 30 14" fill="none" stroke="#EA580C" stroke-width="1" />
            <path d="M 22 14 L 16 22 L 20 22 L 18 28 L 26 20 L 22 20 Z" fill="#EA580C" />
          </svg>
        </div>
        <div class="card-sizes">
          <span class="size-label">40px</span>
          <svg viewBox="0 0 40 40" width="40" height="40"><defs><linearGradient id="gl-2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FB923C" /><stop offset="100%" stop-color="#EA580C" /></linearGradient></defs><rect x="2" y="2" width="36" height="36" rx="10" fill="url(#gl-2)" /><path d="M 11 8 L 24 8 L 30 14 L 30 32 L 11 32 Z" fill="white" opacity="0.9" /><path d="M 22 14 L 16 22 L 20 22 L 18 28 L 26 20 L 22 20 Z" fill="#EA580C" /></svg>
          <span class="size-label">16px</span>
          <svg viewBox="0 0 40 40" width="16" height="16"><defs><linearGradient id="gl-3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FB923C" /><stop offset="100%" stop-color="#EA580C" /></linearGradient></defs><rect x="2" y="2" width="36" height="36" rx="10" fill="url(#gl-3)" /><path d="M 11 8 L 24 8 L 30 14 L 30 32 L 11 32 Z" fill="white" /><path d="M 22 14 L 16 22 L 20 22 L 18 28 L 26 20 L 22 20 Z" fill="#EA580C" /></svg>
          <span class="size-label">单色</span>
          <svg viewBox="0 0 40 40" width="32" height="32"><rect x="2" y="2" width="36" height="36" rx="10" fill="#1F2937" /><path d="M 11 8 L 24 8 L 30 14 L 30 32 L 11 32 Z" fill="white" /><path d="M 22 14 L 16 22 L 20 22 L 18 28 L 26 20 L 22 20 Z" fill="#1F2937" /></svg>
        </div>
        <h3 class="card-name">订单闪电</h3>
        <div class="card-vibe">极速 · 订单</div>
        <p class="card-desc">文件图标上叠加闪电符号。"订单+速度"双重含义一目了然。辨识度高。</p>
        <el-button type="primary" round @click="pick('L')">选 L</el-button>
      </article>
    </div>

    <footer class="picker-footer">
      <div v-if="selected" class="picker-result">
        当前选择：<strong>候选 {{ selected }}</strong> · 跟团团说"用候选 {{ selected }}"，团团把 LogoMark.vue 替换 + 同步到 MainLayout / Login / favicon
      </div>
      <div v-else class="picker-tip">
        点击任意候选下方的"选 X"按钮 · 或者直接告诉团团想要的方向（A-F）
      </div>
    </footer>
  </div>
</template>

<style scoped>
.picker {
  min-height: 100vh;
  background: linear-gradient(180deg, #FFFBF5 0%, #FFF7ED 100%);
  padding: 40px 24px 80px;
  font-family: var(--font-family-base);
}

.picker-header {
  max-width: 1280px;
  margin: 0 auto 32px;
  text-align: center;
}

.picker-title {
  font-size: 36px;
  font-weight: 800;
  background: linear-gradient(135deg, #F97316 0%, #EC4899 100%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  letter-spacing: -0.03em;
  margin-bottom: 8px;
}

.picker-sub {
  font-size: 14px;
  color: var(--text-secondary);
}

.picker-grid {
  max-width: 1280px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.card {
  position: relative;
  background: white;
  border: 1px solid var(--border-default);
  border-radius: 20px;
  padding: 28px 24px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-sm);
}

.card:hover {
  transform: translateY(-4px);
  border-color: var(--brand-300);
  box-shadow: 0 16px 32px -8px rgba(249, 115, 22, 0.18);
}

.card.active {
  border-color: var(--brand-500);
  border-width: 2px;
  background: linear-gradient(180deg, #FFF7ED 0%, #FFFFFF 50%);
  box-shadow: 0 16px 32px -8px rgba(249, 115, 22, 0.28);
}

.card.active::after {
  content: '✓';
  position: absolute;
  top: 12px;
  right: 16px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--gradient-warm);
  color: white;
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px -2px rgba(249, 115, 22, 0.4);
}

.card-id {
  position: absolute;
  top: 12px;
  left: 16px;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: #F3F4F6;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 700;
  font-family: var(--font-family-mono);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-stage {
  width: 100%;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #FAFAFA 0%, #FFFFFF 100%);
  border-radius: 12px;
  margin-bottom: 16px;
  position: relative;
}

.card-stage::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(0deg, rgba(0,0,0,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px);
  background-size: 16px 16px;
  border-radius: 12px;
}

.lm {
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 8px 16px rgba(249, 115, 22, 0.15));
}

.card-sizes {
  width: 100%;
  display: grid;
  grid-template-columns: auto auto auto auto auto auto auto auto;
  gap: 4px 8px;
  align-items: center;
  justify-content: center;
  padding: 10px 0;
  border-top: 1px dashed var(--border-default);
  border-bottom: 1px dashed var(--border-default);
  margin-bottom: 14px;
}

.size-label {
  font-size: 10px;
  color: var(--text-tertiary);
  font-family: var(--font-family-mono);
  letter-spacing: 0.05em;
}

.card-name {
  font-size: 17px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.card-vibe {
  font-size: 11px;
  font-weight: 600;
  color: var(--brand-700);
  background: var(--brand-50);
  padding: 3px 10px;
  border-radius: 999px;
  margin-bottom: 10px;
  letter-spacing: 0.02em;
}

.card-desc {
  font-size: 12px;
  line-height: 1.6;
  color: var(--text-secondary);
  margin: 0 0 16px 0;
  min-height: 60px;
}

.picker-footer {
  max-width: 1280px;
  margin: 32px auto 0;
  padding: 20px 24px;
  border-radius: 12px;
  text-align: center;
  font-size: 14px;
}

.picker-result {
  background: white;
  border: 2px solid var(--brand-500);
  color: var(--text-primary);
  box-shadow: 0 8px 24px -8px rgba(249, 115, 22, 0.3);
}

.picker-tip {
  background: white;
  border: 1px dashed var(--border-default);
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .picker {
    padding: 24px 12px 60px;
  }
  .picker-title {
    font-size: 26px;
  }
  .picker-grid {
    grid-template-columns: 1fr;
  }
}
</style>
