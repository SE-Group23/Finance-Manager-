"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowUp, ArrowDown, ChevronRight } from "lucide-react"
import Sidebar from "../components/Sidebar"
import NetWorthCard from "../components/NetWorthCard"
import ExpenseBarChart from "../components/ExpenseBarChart"
import BudgetProgressCard from "../components/BudgetProgressCard"
import LoadingScreen from "../components/LoadingScreen"
import { useAppDispatch, useAppSelector } from "../hooks"
import { getDashboardData } from "../store/slices/dashboardSlice"

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

const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const { data: dashboardData, loading, error, currentMonth } = useAppSelector((state) => state.dashboard)
  const { isLoggedIn } = useAppSelector((state) => state.auth)
  const [pageLoading, setPageLoading] = useState<boolean>(true)

  useEffect(() => {
    // Simulate page loading for a minimum time to show the loading screen
    const pageLoadTimer = setTimeout(() => {
      setPageLoading(false)
    }, 800)

    // Check if user is logged in before fetching data
    if (isLoggedIn) {
      dispatch(getDashboardData())
    }

    return () => clearTimeout(pageLoadTimer)
  }, [dispatch, isLoggedIn])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    })
  }

  const calculatePercentage = (spent: number, limit: number) => {
    if (limit === 0) return 0
    return Math.min(Math.round((spent / limit) * 100), 100)
  }

  if (loading || pageLoading) {
    return <LoadingScreen />
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    )
  }

  const currentMonthBudgets = dashboardData?.budgets || []
  console.log("Filtered budgets for current month:", currentMonthBudgets)

  const emptyState =
    !dashboardData ||
    (dashboardData.recentTransactions.length === 0 &&
      (!dashboardData.budgets || dashboardData.budgets.length === 0) &&
      (!dashboardData.categoryBreakdown || dashboardData.categoryBreakdown.length === 0))

  const sampleExpenseData = [
    { category_name: "Food", amount: 2500, percentage: 55 },
    { category_name: "Rent", amount: 2000, percentage: 45 },
  ]

  const expenseData =
    dashboardData?.categoryBreakdown && dashboardData.categoryBreakdown.length > 0
      ? dashboardData.categoryBreakdown
      : sampleExpenseData

  const totalExpense = dashboardData?.totalMonthlyExpenses || 4500

  return (
    <div className="flex min-h-screen bg-background-light font-inter">
      <Sidebar activePage="dashboard" />

      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-8">Dashboard</h1>

        {emptyState ? (
          <div className="bg-white rounded-2xl shadow p-8 text-center">
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
            <div className="grid grid-cols-1 gap-6">
              <div className="h-[170px]">
                <NetWorthCard
                  netCash={dashboardData?.netCash || 0}
                  totalCredit={dashboardData?.totalCredit || 0}
                  totalDebit={dashboardData?.totalDebit || 0}
                />
              </div>

              <div className="h-[170px]">
                <BudgetProgressCard
                  totalSpent={dashboardData?.budgetProgress?.totalSpent || 0}
                  totalBudget={dashboardData?.budgetProgress?.totalBudget || 0}
                  percentage={dashboardData?.budgetProgress?.percentage || 0}
                  currentMonth={currentMonth}
                />
              </div>

              <div className="bg-white p-6 rounded-2xl shadow h-[300px] flex flex-col">
                <h2 className="text-lg font-medium mb-4">Transaction History</h2>

                <div className="flex-1 overflow-y-auto">
                  {dashboardData?.recentTransactions && dashboardData.recentTransactions.length > 0 ? (
                    <div className="space-y-6">
                      {dashboardData.recentTransactions.map((transaction, index) => (
                        <div key={transaction.transaction_id} className="flex items-center justify-between py-2">
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
                </div>

                <div className="mt-6 text-right">
                  <Link
                    to="/transactions"
                    className="text-green-600 hover:text-green-700 flex items-center justify-end"
                  >
                    View full Transaction History
                    <ChevronRight size={16} className="ml-1" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow h-[350px]">
                <h2 className="text-lg font-medium mb-4">Monthly Expense Summary ({currentMonth})</h2>
                <ExpenseBarChart data={expenseData} totalAmount={totalExpense} />
              </div>

              <div className="bg-white p-6 rounded-2xl shadow h-[300px] flex flex-col">
                <h2 className="text-lg font-medium mb-4">Budget by Category ({currentMonth})</h2>

                <div className="flex-1 overflow-y-auto">
                  {dashboardData?.budgets && dashboardData.budgets.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {dashboardData.budgets.map((budget) => {
                        const percent = calculatePercentage(budget.spent, budget.budget_limit)

                        return (
                          <div key={budget.budget_id || `budget-${budget.category_name}`} className="mb-4">
                            <div className="flex justify-between mb-1">
                              <span className="font-medium">{budget.category_name}</span>
                              <span className="text-gray-600">{percent}%</span>
                            </div>
                            <div className="h-2 bg-[#e8f8e8] rounded-full mb-2">
                              <div
                                style={{
                                  height: "100%",
                                  width: percent > 0 ? `${percent}%` : "8px",
                                  backgroundColor: "#d2ff65",
                                  borderRadius: "9999px",
                                  display: "block",
                                  minWidth: "8px",
                                }}
                              ></div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">No budgets set for {currentMonth}</div>
                  )}
                </div>

                <div className="mt-6 text-right">
                  <Link to="/budget" className="text-green-600 hover:text-green-700 flex items-center justify-end">
                    View full Budget Details
                    <ChevronRight size={16} className="ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardPage
