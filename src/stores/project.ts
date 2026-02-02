import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getProjects } from '@/api/project'
import type { Project, CommissionResult } from '@/types'

export const useProjectStore = defineStore('project', () => {
  // 状态
  const projects = ref<Project[]>([])
  const baseSalary = ref<number>(5000) // 默认底薪，可从接口获取或手动设置
  const loading = ref(false)

  // 获取项目列表
  async function fetchProjects() {
    loading.value = true
    try {
      const res = await getProjects()
      // 根据实际接口响应格式调整
      projects.value = res.data || res || []
    } catch (error) {
      console.error('获取项目列表失败:', error)
      projects.value = []
    } finally {
      loading.value = false
    }
  }

  // 设置底薪
  function setBaseSalary(value: number) {
    baseSalary.value = value
    localStorage.setItem('baseSalary', String(value))
  }

  // 初始化底薪（从localStorage恢复）
  function initBaseSalary() {
    const saved = localStorage.getItem('baseSalary')
    if (saved) {
      baseSalary.value = Number(saved)
    }
  }

  // 计算单个项目的佣金
  function calculateCommission(project: Project): CommissionResult {
    const commission = project.commission || 0
    const base = baseSalary.value

    if (commission >= base * 2) {
      // 规则①：佣金 ≥ 底薪×2，提成70%（超期50%）
      const rate = project.isOverdue ? 0.5 : 0.7
      return {
        rule: '规则①',
        ruleNum: 1,
        rate,
        actualCommission: commission * rate
      }
    } else if (commission >= base) {
      // 规则②：佣金 ≥ 底薪，提成50%
      return {
        rule: '规则②',
        ruleNum: 2,
        rate: 0.5,
        actualCommission: commission * 0.5
      }
    } else if (commission >= base / 2) {
      // 规则③：底薪/2 ≤ 佣金 < 底薪，提成30%
      return {
        rule: '规则③',
        ruleNum: 3,
        rate: 0.3,
        actualCommission: commission * 0.3
      }
    } else {
      // 规则④：佣金 < 底薪/2，无佣金
      return {
        rule: '规则④',
        ruleNum: 4,
        rate: 0,
        actualCommission: 0
      }
    }
  }

  // 获取指定月份完结的项目
  function getFinishedByMonth(month: string): Project[] {
    return projects.value.filter(p => p.finishMonth === month)
  }

  // 获取指定月份接单的项目
  function getOrderedByMonth(month: string): Project[] {
    return projects.value.filter(p => p.orderMonth === month)
  }

  // 获取未完结的项目
  const pendingProjects = computed(() => {
    return projects.value.filter(p => !p.finishMonth)
  })

  return {
    projects,
    baseSalary,
    loading,
    pendingProjects,
    fetchProjects,
    setBaseSalary,
    initBaseSalary,
    calculateCommission,
    getFinishedByMonth,
    getOrderedByMonth
  }
})
