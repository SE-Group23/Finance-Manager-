import axios from "axios"

const API_URL = `${import.meta.env.VITE_API_HOST}/api/budgets`

export interface Budget {
  budget_id: number
  category_id: number
  category_name: string
  budget_limit: number
  month_start: string
  spent: number
  alert: boolean
  color?: string
}

export interface CategoryLimit {
  category: string
  limit: number
}

export async function getBudgets() {
  const token = sessionStorage.getItem("token")
  const response = await axios.get(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

export async function setBudgets(month_start: string, category_limits: CategoryLimit[]) {
  const token = sessionStorage.getItem("token")
  const response = await axios.post(
    API_URL,
    { month_start, category_limits },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )
  return response.data
}

export async function deleteBudget(budgetId: number) {
  const token = sessionStorage.getItem("token")
  const response = await axios.delete(`${API_URL}/${budgetId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

export async function updateMonthlyIncome(amount: number) {
  const token = sessionStorage.getItem("token")
  const response = await axios.post(
    `${API_URL}/income`,
    { amount },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )
  return response.data
}

export async function updateAlertSettings(threshold: number) {
  const token = sessionStorage.getItem("token")
  const response = await axios.post(
    `${API_URL}/alerts`,
    { threshold },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )
  return response.data
}

export function getCurrentMonthStart(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`
}

export function calculateBudgetStats(budgets: Budget[]) {
  const totalBudget = budgets.reduce((sum, budget) => sum + Number(budget.budget_limit), 0)
  const totalSpent = budgets.reduce((sum, budget) => sum + Number(budget.spent), 0)
  const remainingBudget = totalBudget - totalSpent
  const spentPercentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0

  return {
    totalBudget,
    totalSpent,
    remainingBudget,
    spentPercentage,
  }
}
