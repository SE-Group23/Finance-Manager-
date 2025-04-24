"use client"

import { useState, useEffect } from "react"
import { Edit, X, Plus, Save, Check, Bell, BellOff } from "lucide-react"
import {
  getBudgets,
  setBudgets,
  deleteBudget,
  getCurrentMonthStart,
  calculateBudgetStats,
  updateMonthlyIncome,
  updateAlertSettings,
  type Budget,
  type CategoryLimit,
} from "../services/budgetService"

export default function BudgetManagerContent() {
  const [budgets, setBudgetsState] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [newBudgetAmount, setNewBudgetAmount] = useState<string>("")
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [newCategory, setNewCategory] = useState({ name: "", budget: "" })
  const [monthlyIncome, setMonthlyIncome] = useState<number>(0)
  const [editingIncome, setEditingIncome] = useState(false)
  const [newIncomeAmount, setNewIncomeAmount] = useState<string>("")
  const [showAlertSettings, setShowAlertSettings] = useState(false)
  const [alertThreshold, setAlertThreshold] = useState<number>(100)

  // Colors for different categories
  const categoryColors: Record<string, string> = {
    "Food and Drink": "#8FD14F",
    Personal: "#E88B8B",
    Income: "#A0D959",
    Transport: "#C89BF9",
    Shopping: "#F0A6E8",
    Entertainment: "#FFA726",
    "Health and Fitness": "#80DECD",
    "Bills and Utilities": "#7CD5F9",
  }

  // Get a color for a category, or generate one if it doesn't exist
  const getCategoryColor = (categoryName: string) => {
    if (categoryColors[categoryName]) {
      return categoryColors[categoryName]
    }

    // Generate a random color if we don't have one predefined
    const letters = "0123456789ABCDEF"
    let color = "#"
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)]
    }
    return color
  }

  // Fetch budgets from the API
  const fetchBudgets = async () => {
    try {
      setLoading(true)
      const data = await getBudgets()

      // Add color to each budget
      const budgetsWithColor = data.budgets.map((budget: Budget) => ({
        ...budget,
        color: getCategoryColor(budget.category_name),
      }))

      setBudgetsState(budgetsWithColor)
      setMonthlyIncome(data.monthly_income || 0)
      setAlertThreshold(data.alert_threshold || 100)
      setError(null)
    } catch (err) {
      console.error("Error fetching budgets:", err)
      setError("Failed to load budgets. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  // Load budgets on component mount
  useEffect(() => {
    fetchBudgets()
  }, [])

  // Handle editing a budget
  const handleEdit = (index: number) => {
    setEditingIndex(index)
    setNewBudgetAmount(budgets[index].budget_limit.toString())
  }

  // Handle saving an edited budget
  const handleSave = async (index: number) => {
    try {
      const budget = budgets[index]
      const amount = Number.parseFloat(newBudgetAmount)

      if (isNaN(amount) || amount <= 0) {
        setError("Please enter a valid budget amount greater than zero.")
        return
      }

      // Prepare the category limit for the API
      const categoryLimit: CategoryLimit = {
        category: budget.category_name,
        limit: amount,
      }

      await setBudgets(budget.month_start, [categoryLimit])

      // Update the local state
      const updatedBudgets = [...budgets]
      updatedBudgets[index] = {
        ...budget,
        budget_limit: amount,
      }

      setBudgetsState(updatedBudgets)
      setEditingIndex(null)
      setError(null)
    } catch (err) {
      console.error("Error updating budget:", err)
      setError("Failed to update budget. Please try again.")
    }
  }

  // Handle deleting a budget
  const handleDelete = async (index: number) => {
    try {
      const budget = budgets[index]
      await deleteBudget(budget.budget_id)

      // Update the local state
      const updatedBudgets = budgets.filter((_, i) => i !== index)
      setBudgetsState(updatedBudgets)
      setError(null)
    } catch (err) {
      console.error("Error deleting budget:", err)
      setError("Failed to delete budget. Please try again.")
    }
  }

  // Handle adding a new category
  const handleAddCategory = async () => {
    try {
      if (!newCategory.name.trim()) {
        setError("Please enter a category name.")
        return
      }

      const amount = Number.parseFloat(newCategory.budget)
      if (isNaN(amount) || amount <= 0) {
        setError("Please enter a valid budget amount greater than zero.")
        return
      }

      // Prepare the category limit for the API
      const categoryLimit: CategoryLimit = {
        category: newCategory.name,
        limit: amount,
      }

      await setBudgets(getCurrentMonthStart(), [categoryLimit])

      // Refresh budgets from the server
      await fetchBudgets()

      // Reset form
      setNewCategory({ name: "", budget: "" })
      setShowAddCategory(false)
      setError(null)
    } catch (err) {
      console.error("Error adding category:", err)
      setError("Failed to add category. Please try again.")
    }
  }

  // Handle editing monthly income
  const handleEditIncome = () => {
    setEditingIncome(true)
    setNewIncomeAmount(monthlyIncome.toString())
  }

  // Handle saving monthly income
  const handleSaveIncome = async () => {
    try {
      const amount = Number.parseFloat(newIncomeAmount)
      if (isNaN(amount) || amount < 0) {
        setError("Please enter a valid income amount.")
        return
      }

      await updateMonthlyIncome(amount)
      setMonthlyIncome(amount)
      setEditingIncome(false)
      setError(null)
    } catch (err) {
      console.error("Error updating income:", err)
      setError("Failed to update income. Please try again.")
    }
  }

  // Handle saving alert settings
  const handleSaveAlertSettings = async () => {
    try {
      if (alertThreshold < 0 || alertThreshold > 200) {
        setError("Please enter a valid threshold between 0 and 200.")
        return
      }

      await updateAlertSettings(alertThreshold)
      setShowAlertSettings(false)
      setError(null)
    } catch (err) {
      // console.error("Error updating alert settings:", err)
      // setError("Failed to update alert settings. Please try again.")
    }
  }

  // Calculate budget statistics
  const { totalBudget, totalSpent, remainingBudget, spentPercentage } = calculateBudgetStats(budgets)

  if (loading) {
    return <div className="p-6 text-center">Loading budget data...</div>
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Budget Manager</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAlertSettings(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            Alert Settings
          </button>
          <button
            onClick={() => setShowAddCategory(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </button>
        </div>
      </div>

      <div className="border-b border-gray-200 mb-6"></div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {/* Alert Settings Form */}
      {showAlertSettings && (
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Alert Settings</h2>
            <button onClick={() => setShowAlertSettings(false)} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Alert Threshold (% of budget limit)</label>
            <input
              type="number"
              value={alertThreshold}
              onChange={(e) => setAlertThreshold(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md"
              min="0"
              max="200"
              step="1"
            />
            <p className="text-sm text-gray-500 mt-1">
              You will be alerted when spending reaches {alertThreshold}% of your budget limit.
            </p>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSaveAlertSettings}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              Save Settings
            </button>
          </div>
        </div>
      )}

      {/* Add Category Form */}
      {showAddCategory && (
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Add New Budget Category</h2>
            <button onClick={() => setShowAddCategory(false)} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="e.g., Groceries"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget Amount</label>
              <input
                type="number"
                value={newCategory.budget}
                onChange={(e) => setNewCategory({ ...newCategory, budget: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="e.g., 200"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleAddCategory}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              Save Category
            </button>
          </div>
        </div>
      )}

      {/* Monthly Income Card
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Monthly Income</h2>
          {!editingIncome ? (
            <button onClick={handleEditIncome} className="text-gray-500 hover:text-gray-700">
              <Edit className="h-5 w-5" />
            </button>
          ) : (
            <button onClick={handleSaveIncome} className="text-green-500 hover:text-green-600">
              <Save className="h-5 w-5" />
            </button>
          )}
        </div>

        {editingIncome ? (
          <div className="flex items-center">
            <span className="text-gray-700 mr-2">$</span>
            <input
              type="number"
              value={newIncomeAmount}
              onChange={(e) => setNewIncomeAmount(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              min="0"
              step="0.01"
            />
          </div>
        ) : (
          <div className="text-3xl font-bold text-gray-900">${monthlyIncome.toLocaleString()}</div>
        )}
        <p className="text-sm text-gray-500 mt-1">Your monthly income helps calculate your overall budget health.</p>
      </div> */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* This Month Card */}
        <div className="lg:col-span-2 bg-[#003c36] text-black p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">This Month</h2>

          <div className="flex flex-wrap justify-between mb-4">
            <div>
              <div className="text-sm text-black-300">Remaining</div>
              <div className="text-4xl font-bold">${remainingBudget.toLocaleString()}</div>
            </div>
            <div className="text-right">
              <div className="flex gap-8">
                <div>
                  <div className="text-sm text-black-300">Total</div>
                  <div className="text-xl font-semibold">${totalBudget.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-black-300">Spent</div>
                  <div className="text-xl font-semibold">${totalSpent.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-4 bg-[#004a42] rounded-full overflow-hidden mb-2">
            <div
              className={`absolute top-0 left-0 h-full ${
                spentPercentage >= alertThreshold ? "bg-red-500" : "bg-gradient-to-r from-yellow-300 to-green-400"
              }`}
              style={{ width: `${spentPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center">
            <div>
              {spentPercentage >= alertThreshold && (
                <div className="flex items-center text-red-300">
                  <Bell className="h-4 w-4 mr-1" />
                  Alert: Spending exceeds {alertThreshold}% of budget
                </div>
              )}
            </div>
            <div className="text-xl font-semibold">{spentPercentage}%</div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Summary</h2>
          <div className="flex justify-center mb-4">
            <DonutChart categories={budgets} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {budgets.map((category, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-gray-900">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
                <span>{category.category_name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Budget by Category */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Monthly Budget by Category</h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2">Name</th>
                <th className="pb-2">Used</th>
                <th className="pb-2"></th>
                <th className="pb-2 text-right">Remaining</th>
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
                        <span className="text-gray-900">${category.spent}</span>
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
                            onChange={(e) => setNewBudgetAmount(e.target.value)}
                            className="w-20 p-1 border border-gray-300 rounded"
                            min="0"
                            step="0.01"
                          />
                        ) : (
                          <span className="text-gray-900">${category.budget_limit}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 text-center text-gray-900">{percentUsed}%</td>
                    <td className={`py-4 text-right font-bold ${isOverBudget ? "text-red-500" : "text-gray-900"}`}>
                      {isOverBudget ? "-" : ""}${Math.abs(remaining)}
                      {isOverBudget && <span className="ml-2 text-red-500 text-sm">Limit exceeded!</span>}
                    </td>
                    <td className="py-4 text-center">
                      {/* {category.alert ? (
                        <Bell className="h-4 w-4 text-blue-500 mx-auto" />
                      ) : (
                        <BellOff className="h-4 w-4 text-gray-400 mx-auto" />
                      )} */}
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
  // SVG donut chart
  const size = 180
  const strokeWidth = 30
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  // Calculate total used for percentages
  const totalUsed = categories.reduce((sum, category) => sum + category.spent, 0)

  // Calculate stroke dasharray and dashoffset for each segment
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
