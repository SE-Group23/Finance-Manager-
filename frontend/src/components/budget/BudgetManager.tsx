"use client"

import { useEffect } from "react"
import { Edit, X, Plus, Save, Check, Bell } from "lucide-react"
import { calculateBudgetStats } from "../../services/budgetService"
import LoadingScreen from "../LoadingScreen"
import { useAppDispatch, useAppSelector } from "../../hooks"
import {
  fetchBudgets,
  saveBudget,
  removeBudget,
  addBudgetCategory,
  setEditingIndex,
  setNewBudgetAmount,
  setShowAddCategory,
  setNewCategory,
} from "../../store/slices/budgetSlice"

interface CategoryOption {
  name: string
  value: string
  type: "debit" | "credit"
  color: string
}

const CATEGORY_OPTIONS: CategoryOption[] = [
  { name: "Food and Drink", value: "Food and Drink", type: "debit", color: "bg-green-100 text-green-800" },
  { name: "Personal", value: "Personal", type: "debit", color: "bg-pink-100 text-pink-800" },
  { name: "Income", value: "Income", type: "credit", color: "bg-yellow-100 text-yellow-800" },
  { name: "Transport", value: "Transport", type: "debit", color: "bg-purple-100 text-purple-800" },
  { name: "Shopping", value: "Shopping", type: "debit", color: "bg-gray-100 text-gray-800" },
  { name: "Entertainment", value: "Entertainment", type: "debit", color: "bg-orange-100 text-orange-800" },
  { name: "Health and Fitness", value: "Health and Fitness", type: "debit", color: "bg-blue-100 text-blue-800" },
  { name: "Bills and Utilities", value: "Bills and Utilities", type: "debit", color: "bg-blue-100 text-blue-800" },
]

export default function BudgetManagerContent() {
  const dispatch = useAppDispatch()
  const {
    budgets,
    loading,
    error,
    editingIndex,
    newBudgetAmount,
    showAddCategory,
    newCategory,
    alertThreshold,
  } = useAppSelector((state) => state.budgets)

  useEffect(() => {
    dispatch(fetchBudgets())
  }, [dispatch])

  const handleEdit = (index: number) => {
    dispatch(setEditingIndex(index))
  }

  const handleSave = async (index: number) => {
    const amount = Number.parseFloat(newBudgetAmount)

    if (isNaN(amount) || amount <= 0) {
      return
    }

    dispatch(saveBudget({ index, amount, budgets }))
  }

  const handleDelete = async (index: number) => {
    dispatch(removeBudget({ index, budgets }))
  }

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      // We could dispatch an action to set an error message here
      return
    }

    const amount = Number.parseFloat(newCategory.budget)
    if (isNaN(amount) || amount <= 0) {
      // We could dispatch an action to set an error message here
      return
    }

    dispatch(addBudgetCategory({ name: newCategory.name, budget: amount }))
      .unwrap()
      .then(() => {
        dispatch(fetchBudgets())
      })
  }

  const { totalBudget, totalSpent, remainingBudget, spentPercentage } = calculateBudgetStats(budgets)

  if (loading) {
    return <LoadingScreen fullScreen={false} />
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Budget Manager</h1>
        <div className="flex gap-2">
          <button
            onClick={() => dispatch(setShowAddCategory(true))}
            className="bg-navbar hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </button>
        </div>
      </div>

      <div className="border-b border-gray-200 mb-6"></div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {showAddCategory && (
        <div className="bg-white text-black p-6 rounded-2xl shadow mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Add New Budget Category</h2>
            <button onClick={() => dispatch(setShowAddCategory(false))} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => dispatch(setNewCategory({ ...newCategory, name: option.value }))}
                  className={`px-3 py-1 rounded-md text-sm ${
                    newCategory.name === option.value
                      ? "ring-2 ring-green-500 " + option.color
                      : option.color + " opacity-70"
                  }`}
                >
                  {option.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Budget Amount</label>
            <input
              type="number"
              value={newCategory.budget}
              onChange={(e) => dispatch(setNewCategory({ ...newCategory, budget: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="e.g., 200"
              min="0"
              step="0.01"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleAddCategory}
              className="bg-navbar hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              Save Category
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-navbar text-white p-6 rounded-2xl shadow h-80">
          <h2 className="text-xl font-semibold mb-4">This Month</h2>

          <div className="flex flex-wrap justify-between mb-4">
            <div>
              <div className="text-sm text-black-300">Remaining</div>
              <div className="text-4xl font-bold">PKR {remainingBudget.toLocaleString()}</div>
            </div>
            <div className="text-right">
              <div className="flex gap-8 mt-2.5">
                <div>
                  <div className="text-sm text-black-300">Total</div>
                  <div className="text-xl font-semibold">PKR {totalBudget.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-black-300">Spent</div>
                  <div className="text-xl font-semibold">PKR {totalSpent.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center mt-14 mb-4">
            <div className="relative h-6 bg-[#004a42] rounded-full overflow-hidden flex-grow mr-4">
              <div
                className={`absolute top-0 left-0 h-full ${
                  spentPercentage >= alertThreshold ? "bg-red-500" : "bg-gradient-to-r from-yellow-300 to-green-400"
                }`}
                style={{ width: `${spentPercentage}%` }}
              ></div>
              <div
                className="absolute top-0 right-0 h-full bg-white"
                style={{ width: `${100 - spentPercentage}%` }}
              ></div>
            </div>
            <div className="text-xl font-semibold whitespace-nowrap">{spentPercentage}%</div>
          </div>
          <div>
            {spentPercentage >= alertThreshold && (
              <div className="flex items-center text-red-300">
                <Bell className="h-4 w-4 mr-1" />
                Alert: Spending exceeds {alertThreshold}% of budget
              </div>
            )}
          </div>
        </div>

        <div className="bg-white text-white p-6 rounded-2xl shadow h-80">
          <h2 className="text-l font-semibold mb-4 text-gray-500">Summary</h2>
          <div className="flex justify-center mb-4">
            <DonutChart categories={budgets} />
          </div>
          <div className="grid grid-cols-5 gap-0.2">
            {budgets.map((category, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-gray-900">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
                <span>{category.category_name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white text-black p-6 rounded-2xl shadow mb-6">
        <h2 className="text-l font-semibold mb-4 text-gray-500">Monthly Budget by Category</h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2">Name</th>
                <th className="pb-2 text-center">Used</th>
                <th className="pb-2 text-center">% Used</th>
                <th className="pb-2 text-center">Remaining</th>
                <th className="pb-2 text-center">Alerts</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {budgets.map((category, index) => {
                const percentUsed = Math.round((category.spent / category.budget_limit) * 100)
                const remaining = category.budget_limit - category.spent
                const isOverBudget = remaining < 0
                const isNearLimit = percentUsed >= alertThreshold

                return (
                  <tr key={index} className="border-b">
                    <td className="py-4 font-medium text-gray-900">{category.category_name}</td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-900">PKR {category.spent}</span>
                        <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${isNearLimit ? "bg-red-500" : ""}`}
                            style={{
                              width: `${Math.min(percentUsed, 100)}%`,
                              backgroundColor: isNearLimit ? undefined : category.color,
                            }}
                          ></div>
                        </div>
                        {editingIndex === index ? (
                          <input
                            type="number"
                            value={newBudgetAmount}
                            onChange={(e) => dispatch(setNewBudgetAmount(e.target.value))}
                            className="w-20 p-1 border border-gray-300 rounded"
                            min="0"
                            step="0.01"
                          />
                        ) : (
                          <span className="text-gray-900">PKR {category.budget_limit}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 text-center text-gray-900">{percentUsed}%</td>
                    <td className={`py-4 text-center font-bold ${isOverBudget ? "text-red-500" : "text-gray-900"}`}>
                      {isOverBudget ? "-" : ""}PKR {Math.abs(remaining)}
                    </td>
                    <td className="py-4 text-center">
                      {isOverBudget && <span className="ml-2 text-red-500 text-sm">Limit exceeded!</span>}
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {editingIndex === index ? (
                          <button
                            className="bg-green-500 text-white p-1 rounded hover:bg-green-600"
                            onClick={() => handleSave(index)}
                          >
                            <Save className="h-4 w-4" />
                          </button>
                        ) : (
                          <button className="text-gray-500 hover:text-gray-700" onClick={() => handleEdit(index)}>
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                        <button className="text-gray-500 hover:text-gray-700" onClick={() => handleDelete(index)}>
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function DonutChart({ categories }: { categories: any[] }) {
  const size = 180
  const strokeWidth = 30
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  const totalUsed = categories.reduce((sum, category) => sum + category.spent, 0)

  let accumulatedPercentage = 0
  const segments = categories.map((category) => {
    const percentage = totalUsed > 0 ? category.spent / totalUsed : 0
    const dashArray = circumference * percentage
    const dashOffset = circumference * (1 - accumulatedPercentage)
    accumulatedPercentage += percentage

    return {
      color: category.color,
      dashArray,
      dashOffset,
    }
  })

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {segments.map((segment, index) => (
          <circle
            key={index}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={segment.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${segment.dashArray} ${circumference - segment.dashArray}`}
            strokeDashoffset={segment.dashOffset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        ))}
      </svg>
    </div>
  )
}
