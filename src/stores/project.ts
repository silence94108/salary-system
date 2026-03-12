import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getMyTaskList } from '@/api/project'
import { getSalaryDateList } from '@/api/salary'
import type { Project, CommissionResult, TaskOrder } from '@/types'

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function extractArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value
  if (isRecord(value)) {
    const candidates: unknown[] = [value.data, value.list, value.month]
    for (const v of candidates) {
      if (Array.isArray(v)) return v
    }
  }
  return []
}

export const useProjectStore = defineStore('project', () => {
  const projects = ref<Project[]>([])
  const baseSalary = ref<number>(5000)
  const entryDate = ref<string>('2024-01-01')
  const loading = ref(false)
  const totalTasks = ref(0)
  const currentMonth = ref('')
  const orderMonthTotals = ref<Record<string, number>>({})

  const salaryDateList = ref<unknown[]>([])
  const salaryDateLoading = ref(false)

  function getMonthRange(month: string): [string, string] {
    const [year, mon] = month.split('-').map(Number)
    const start = `${month}-01 00:00:00`
    const lastDay = new Date(year!, mon!, 0).getDate()
    const end = `${month}-${String(lastDay).padStart(2, '0')} 23:59:59`
    return [start, end]
  }

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

  async function fetchSalaryDateList() {
    salaryDateLoading.value = true
    try {
      const res = await getSalaryDateList()
      // hrRequest 响应拦截器返回的是 response.data（HrResponse<T>）
      salaryDateList.value = extractArray(res?.data ?? res)
    } catch (error) {
      console.error('获取薪资月份列表失败:', error)
      salaryDateList.value = []
    } finally {
      salaryDateLoading.value = false
    }
  }

  async function fetchOrderMonthTotals() {
    const uniqueMonths = [...new Set(projects.value.map(p => p.orderMonth).filter(Boolean))]

    const promises = uniqueMonths.map(async (orderMonth) => {
      if (orderMonthTotals.value[orderMonth] !== undefined) return

      try {
        const [start, end] = getMonthRange(orderMonth)
        const res = await getMyTaskList({
          page: 1,
          limit: 1000,
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
          performtime: [start, end]
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

  function getOrderMonthTotal(orderMonth: string): number {
    return orderMonthTotals.value[orderMonth] ?? 0
  }

  const userKey = ref('')

  function setBaseSalary(value: number) {
    baseSalary.value = value
    if (userKey.value) {
      localStorage.setItem(`baseSalary_${userKey.value}`, String(value))
    }
  }

  function setEntryDate(value: string) {
    entryDate.value = value
    if (userKey.value) {
      localStorage.setItem(`entryDate_${userKey.value}`, value)
    }
  }

  function initBaseSalary(username?: string) {
    if (username) {
      userKey.value = username
    }
    const key = userKey.value
    if (!key) return

    const savedSalary = localStorage.getItem(`baseSalary_${key}`)
    baseSalary.value = savedSalary ? Number(savedSalary) : 5000

    const savedEntryDate = localStorage.getItem(`entryDate_${key}`)
    entryDate.value = savedEntryDate || '2024-01-01'
  }

  function resetStore() {
    projects.value = []
    totalTasks.value = 0
    currentMonth.value = ''
    orderMonthTotals.value = {}
    baseSalary.value = 5000
    entryDate.value = '2024-01-01'
    userKey.value = ''
    salaryDateList.value = []
    salaryDateLoading.value = false
  }

  function getSalaryByOrderMonth(orderMonth: string): number {
    const entry = new Date(entryDate.value)
    const orderDate = new Date(orderMonth + '-01')

    let years = orderDate.getFullYear() - entry.getFullYear()
    const entryMonthDay = (entry.getMonth() + 1) * 100 + entry.getDate()
    const orderMonthDay = (orderDate.getMonth() + 1) * 100 + 1
    if (orderMonthDay < entryMonthDay) {
      years--
    }

    return baseSalary.value + Math.max(0, years) * 100
  }

  function getRuleByOrderMonth(orderMonth: string): { rule: string; ruleNum: number; rate: number } {
    const total = getOrderMonthTotal(orderMonth)
    const base = getSalaryByOrderMonth(orderMonth)

    if (total >= base * 2) {
      return { rule: '规则Ⅰ', ruleNum: 1, rate: 0.7 }
    } else if (total >= base) {
      return { rule: '规则Ⅱ', ruleNum: 2, rate: 0.5 }
    } else if (total >= base / 2) {
      return { rule: '规则Ⅲ', ruleNum: 3, rate: 0.3 }
    } else {
      return { rule: '规则Ⅳ', ruleNum: 4, rate: 0 }
    }
  }

  function calculateCommission(project: Project): CommissionResult {
    const commission = project.commission || 0
    const { rule, ruleNum, rate } = getRuleByOrderMonth(project.orderMonth)

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
    salaryDateList,
    salaryDateLoading,
    fetchByMonth,
    fetchSalaryDateList,
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
