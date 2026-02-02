import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getMyTaskList } from '@/api/project'
import type { Project, CommissionResult, TaskOrder } from '@/types'

export const useProjectStore = defineStore('project', () => {
  // 状态
  const projects = ref<Project[]>([])       // 当月完结的项目
  const baseSalary = ref<number>(5000)      // 起始底薪
  const entryDate = ref<string>('2024-01-01')  // 入职日期
  const loading = ref(false)
  const totalTasks = ref(0)
  const currentMonth = ref('')              // 当前查询月份
  const orderMonthTotals = ref<Record<string, number>>({})  // 各接单月份的总额缓存

  // 获取月份的起止日期（带时分秒）
  function getMonthRange(month: string): [string, string] {
    const [year, mon] = month.split('-').map(Number)
    const start = `${month}-01 00:00:00`
    const lastDay = new Date(year, mon, 0).getDate()
    const end = `${month}-${String(lastDay).padStart(2, '0')} 23:59:59`
    return [start, end]
  }

  // 将 TaskOrder 转换为 Project
  function convertToProject(task: TaskOrder): Project {
    const orderMonth = task.ordertime ? task.ordertime.substring(0, 7) : ''
    const finishMonth = task.completiontime ? task.completiontime.substring(0, 7) : ''

    const syday = typeof task.syday === 'string' ? parseInt(task.syday) : task.syday
    const isOverdue = syday < 0

    return {
      id: task.oid || task.id,
      name: task.hall_customer || task.name || '未命名项目',
      commission: parseFloat(task.bountymoney) || 0,
      orderMonth,
      finishMonth,
      isOverdue,
      overdueDays: isOverdue ? Math.abs(syday) : 0,
      status: task.statustxt,
      orderstatus: task.orderstatus,
      createTime: task.createtime,
      _raw: task
    }
  }

  // 按月份查询完结的项目
  async function fetchByMonth(month: string) {
    if (!month) return

    loading.value = true
    currentMonth.value = month
    try {
      const [start, end] = getMonthRange(month)
      const res = await getMyTaskList({
        page: 1,
        limit: 16,
        status: '',
        name: '',
        orderType: '',
        hall_type: '',
        order: 'desc',
        sort: 'change_time',
        bountymoney: [],
        completiontime: [start, end],
        enddatatime: [],
        ordertime: [],
        performtime: []
      })

      if (res.data) {
        const tasks = res.data.data || []
        totalTasks.value = res.data.total || 0
        projects.value = tasks.map(convertToProject)

        // 获取所有不同的接单月份，并查询各月份的接单总额
        await fetchOrderMonthTotals()
      }
    } catch (error) {
      console.error('获取任务列表失败:', error)
      projects.value = []
      totalTasks.value = 0
    } finally {
      loading.value = false
    }
  }

  // 查询各接单月份的总额
  async function fetchOrderMonthTotals() {
    // 找出所有不同的接单月份
    const uniqueMonths = [...new Set(projects.value.map(p => p.orderMonth).filter(Boolean))]

    // 并行查询各月份的接单总额
    const promises = uniqueMonths.map(async (orderMonth) => {
      // 如果已缓存，跳过
      if (orderMonthTotals.value[orderMonth] !== undefined) return

      try {
        const [start, end] = getMonthRange(orderMonth)
        const res = await getMyTaskList({
          page: 1,
          limit: 1000,  // 获取该月所有接单
          status: '',
          name: '',
          orderType: '',
          hall_type: '',
          order: 'desc',
          sort: 'change_time',
          bountymoney: [],
          completiontime: [],
          enddatatime: [],
          ordertime: [],
          performtime: [start, end]  // 按接单时间筛选
        })

        if (res.data?.data) {
          const total = res.data.data.reduce((sum: number, task: TaskOrder) => {
            return sum + (parseFloat(task.bountymoney) || 0)
          }, 0)
          orderMonthTotals.value[orderMonth] = total
        }
      } catch (error) {
        console.error(`获取${orderMonth}接单总额失败:`, error)
      }
    })

    await Promise.all(promises)
  }

  // 获取某月接单总额
  function getOrderMonthTotal(orderMonth: string): number {
    return orderMonthTotals.value[orderMonth] ?? 0
  }

  // 当前用户标识（用于隔离存储）
  const userKey = ref('')

  // 设置底薪
  function setBaseSalary(value: number) {
    baseSalary.value = value
    if (userKey.value) {
      localStorage.setItem(`baseSalary_${userKey.value}`, String(value))
    }
  }

  // 设置入职日期
  function setEntryDate(value: string) {
    entryDate.value = value
    if (userKey.value) {
      localStorage.setItem(`entryDate_${userKey.value}`, value)
    }
  }

  // 初始化底薪和入职日期（根据用户恢复）
  function initBaseSalary(username?: string) {
    if (username) {
      userKey.value = username
    }
    const key = userKey.value
    if (!key) return

    const savedSalary = localStorage.getItem(`baseSalary_${key}`)
    if (savedSalary) {
      baseSalary.value = Number(savedSalary)
    } else {
      baseSalary.value = 5000
    }
    const savedEntryDate = localStorage.getItem(`entryDate_${key}`)
    if (savedEntryDate) {
      entryDate.value = savedEntryDate
    } else {
      entryDate.value = '2024-01-01'
    }
  }

  // 重置store（退出登录时调用）
  function resetStore() {
    projects.value = []
    totalTasks.value = 0
    currentMonth.value = ''
    orderMonthTotals.value = {}
    baseSalary.value = 5000
    entryDate.value = '2024-01-01'
    userKey.value = ''
  }

  // 根据接单月份计算底薪（入职满N年后底薪+N*100）
  function getSalaryByOrderMonth(orderMonth: string): number {
    const entry = new Date(entryDate.value)
    // 使用接单月份的第一天作为参考日期
    const orderDate = new Date(orderMonth + '-01')

    // 计算完整年数
    let years = orderDate.getFullYear() - entry.getFullYear()
    // 如果还没到入职周年日，年数减1
    const entryMonthDay = (entry.getMonth() + 1) * 100 + entry.getDate()
    const orderMonthDay = (orderDate.getMonth() + 1) * 100 + 1
    if (orderMonthDay < entryMonthDay) {
      years--
    }

    // 底薪 = 起始底薪 + 完整年数 * 100
    return baseSalary.value + Math.max(0, years) * 100
  }

  // 根据接单月份总额判断适用规则
  function getRuleByOrderMonth(orderMonth: string): { rule: string; ruleNum: number; rate: number } {
    const total = getOrderMonthTotal(orderMonth)
    const base = getSalaryByOrderMonth(orderMonth)

    if (total >= base * 2) {
      return { rule: '规则①', ruleNum: 1, rate: 0.7 }
    } else if (total >= base) {
      return { rule: '规则②', ruleNum: 2, rate: 0.5 }
    } else if (total >= base / 2) {
      return { rule: '规则③', ruleNum: 3, rate: 0.3 }
    } else {
      return { rule: '规则④', ruleNum: 4, rate: 0 }
    }
  }

  // 计算单个项目的佣金（规则由该项目接单月份的总额决定）
  function calculateCommission(project: Project): CommissionResult {
    const commission = project.commission || 0
    const { rule, ruleNum, rate } = getRuleByOrderMonth(project.orderMonth)

    // 规则①下，超期项目比例降为50%
    const actualRate = (ruleNum === 1 && project.isOverdue) ? 0.5 : rate

    return {
      rule,
      ruleNum,
      rate: actualRate,
      actualCommission: commission * actualRate
    }
  }

  return {
    projects,
    baseSalary,
    entryDate,
    loading,
    totalTasks,
    currentMonth,
    fetchByMonth,
    setBaseSalary,
    setEntryDate,
    initBaseSalary,
    resetStore,
    getSalaryByOrderMonth,
    getCurrentRule: getRuleByOrderMonth,
    getOrderMonthTotal,
    calculateCommission
  }
})
