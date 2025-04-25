"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowUp, ArrowDown, ChevronRight } from "lucide-react"
import { PieChart as PieChartComponent, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import Sidebar from "../components/Sidebar"
import LoadingScreen from "../components/LoadingScreen"

// Define types for our data
interface Transaction {
  transaction_id: number
  amount: number
  transaction_type: "credit" | "debit"
  vendor: string
  description: string
  transaction_date: string
  category_name: string
}

interface Budget {
  budget_id: number
  budget_limit: number
  category_name: string
  spent: number
  month_start?: string
}

interface CategoryBreakdown {
  category_name: string
  amount: number
  percentage: number
}

interface DashboardData {
  netCash: number
  totalCredit: number
  totalDebit: number
  recentTransactions: Transaction[]
  budgets: Budget[]
  budgetProgress: {
    totalBudget: number
    totalSpent: number
    percentage: number
  }
  categoryBreakdown: CategoryBreakdown[]
  totalMonthlyExpenses: number
}

const DashboardPage: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [pageLoading, setPageLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState<string>("")

  // Add console logging to help debug
  useEffect(() => {
    // Set current month name
    const now = new Date()
    setCurrentMonth(now.toLocaleString("default", { month: "long", year: "numeric" }))

    // Simulate page loading for a minimum time to show the loading screen
    const pageLoadTimer = setTimeout(() => {
      setPageLoading(false)
    }, 800)

    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          window.location.href = "/login"
          return
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_HOST}:${import.meta.env.VITE_API_PORT}/api/dashboard`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data")
        }

        const data = await response.json()
        console.log("Dashboard data received:", data)
        setDashboardData(data)
      } catch (err) {
        setError("Error loading dashboard data. Please try again later.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()

    return () => clearTimeout(pageLoadTimer)
  }, [])

  // Colors for the pie chart
  const COLORS = ["#00C49F", "#0088FE", "#FFBB28", "#FF8042", "#a64dff", "#ff4d4d"]

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    })
  }

  // Calculate percentage for budget progress
  const calculatePercentage = (spent: number, limit: number) => {
    if (limit === 0) return 0
    return Math.min(Math.round((spent / limit) * 100), 100)
  }

  // Get current month as YYYY-MM string for comparison
  const getCurrentMonthString = () => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  }

  // Filter budgets for current month only
  const getCurrentMonthBudgets = () => {
    if (!dashboardData?.budgets || dashboardData.budgets.length === 0) return []

    const currentMonthStr = getCurrentMonthString()
    console.log("Current month string for filtering:", currentMonthStr)

    // Log all budgets to debug
    console.log("All budgets:", dashboardData.budgets)

    return dashboardData.budgets.filter((budget) => {
      // If month_start is missing, include the budget (fallback)
      if (!budget.month_start) return true

      // Extract YYYY-MM from the budget's month_start
      const budgetDate = new Date(budget.month_start)
      const budgetMonthStr = `${budgetDate.getFullYear()}-${String(budgetDate.getMonth() + 1).padStart(2, "0")}`

      console.log(`Budget ${budget.category_name}: ${budgetMonthStr} vs current ${currentMonthStr}`)

      return budgetMonthStr === currentMonthStr
    })
  }

  if (pageLoading) {
    return <LoadingScreen />
  }

  if (loading) {
    return <LoadingScreen />
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    )
  }

  // Get current month budgets
  const currentMonthBudgets = dashboardData?.budgets || []
  console.log("Filtered budgets for current month:", currentMonthBudgets)

  // If no data is available yet (new user), show empty state
  const emptyState =
    !dashboardData ||
    (dashboardData.recentTransactions.length === 0 &&
      (!dashboardData.budgets || dashboardData.budgets.length === 0) &&
      (!dashboardData.categoryBreakdown || dashboardData.categoryBreakdown.length === 0))

  return (
    <div className="flex min-h-screen bg-background-light font-inter">
      {/* Sidebar - Using our shared component */}
      <Sidebar activePage="dashboard" />

      {/* Main content */}
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-8">Dashboard</h1>

        {emptyState ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Welcome to your Finance Dashboard!</h2>
            <p className="mb-6">
              Start by adding transactions and setting up budgets to see your financial overview here.
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/transactions" className="bg-navbar text-white px-4 py-2 rounded hover:bg-navbar-dark">
                Add Transaction
              </Link>
              <Link to="/budget" className="bg-navbar text-white px-4 py-2 rounded hover:bg-navbar-dark">
                Set Budget
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Net Cash */}
            <div className="bg-navbar text-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium mb-4">Net Cash</h2>
              <div className="text-4xl font-bold mb-4">{formatCurrency(dashboardData?.netCash || 0)}</div>
              <div className="flex justify-between">
                <div>
                  <div className="text-teal-200">Credits</div>
                  <div className="font-semibold">{formatCurrency(dashboardData?.totalCredit || 0)}</div>
                </div>
                <div>
                  <div className="text-teal-200">Debits</div>
                  <div className="font-semibold">{formatCurrency(dashboardData?.totalDebit || 0)}</div>
                </div>
              </div>
            </div>

            {/* Monthly Expense Summary */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium mb-4">Monthly Expense Summary ({currentMonth})</h2>
              <div className="flex items-center justify-center">
                {dashboardData?.categoryBreakdown && dashboardData.categoryBreakdown.length > 0 ? (
                  <div className="relative">
                    <ResponsiveContainer width={200} height={200}>
                      <PieChartComponent>
                        <Pie
                          data={dashboardData.categoryBreakdown}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="amount"
                        >
                          {dashboardData.categoryBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      </PieChartComponent>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <div className="text-2xl font-bold">{formatCurrency(dashboardData.totalMonthlyExpenses)}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">No expense data available for {currentMonth}</div>
                )}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {dashboardData?.categoryBreakdown?.slice(0, 6).map((category, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="text-sm">{category.category_name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Budget Spent */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium mb-4">Total Budget Spent ({currentMonth})</h2>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-gradient-to-r from-lime-300 to-lime-500"
                  style={{ width: `${dashboardData?.budgetProgress?.percentage || 0}%` }}
                ></div>
              </div>
              <div className="text-right text-sm text-gray-600">{dashboardData?.budgetProgress?.percentage || 0}%</div>
              <div className="mt-4 text-sm text-gray-600">
                <span className="font-medium">{formatCurrency(dashboardData?.budgetProgress?.totalSpent || 0)}</span>{" "}
                spent of {formatCurrency(dashboardData?.budgetProgress?.totalBudget || 0)} budget
              </div>
            </div>

            {/* Transaction History */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium mb-4">Transaction History</h2>
              {dashboardData?.recentTransactions && dashboardData.recentTransactions.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.recentTransactions.map((transaction, index) => (
                    <div key={transaction.transaction_id} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-center font-medium w-6">{index + 1}</div>
                        <div>
                          <div className="font-medium">{transaction.vendor || transaction.category_name}</div>
                          <div className="text-xs text-gray-500">{formatDate(transaction.transaction_date)}</div>
                        </div>
                      </div>
                      <div
                        className={`font-medium flex items-center ${
                          transaction.transaction_type === "credit" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {transaction.transaction_type === "credit" ? (
                          <ArrowUp size={16} className="mr-1" />
                        ) : (
                          <ArrowDown size={16} className="mr-1" />
                        )}
                        {formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">No transactions yet</div>
              )}
              <div className="mt-6 text-right">
                <Link to="/transactions" className="text-navbar hover:text-navbar-dark flex items-center justify-end">
                  View full Transaction History
                  <ChevronRight size={16} className="ml-1" />
                </Link>
              </div>
            </div>

            {/* Budget by Category */}
            <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
              <h2 className="text-lg font-medium mb-4">Budget by Category ({currentMonth})</h2>
              {dashboardData?.budgets && dashboardData.budgets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {dashboardData.budgets.map((budget) => (
                    <div key={budget.budget_id || `budget-${budget.category_name}`}>
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">{budget.category_name}</span>
                        <span className="text-gray-600">{calculatePercentage(budget.spent, budget.budget_limit)}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                        <div
                          className="h-full bg-gradient-to-r from-lime-300 to-lime-500"
                          style={{ width: `${calculatePercentage(budget.spent, budget.budget_limit)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">No budgets set for {currentMonth}</div>
              )}
              <div className="mt-6 text-right">
                <Link to="/budget" className="text-navbar hover:text-navbar-dark flex items-center justify-end">
                  View full Budget Details
                  <ChevronRight size={16} className="ml-1" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardPage
