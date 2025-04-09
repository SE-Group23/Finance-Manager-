"use client"

import type React from "react"

import { useState } from "react"
import {
  DollarSign,
  BarChart2,
  ArrowRight,
  Layers,
  Calendar,
  Calculator,
  Zap,
  Settings,
  FileText,
  Edit,
  X,
} from "lucide-react"

export default function BudgetManager() {
  // Sample data - replace with your actual data
  const [categories, setCategories] = useState([
    { name: "Food and Drink", used: 150, budget: 200, color: "#8FD14F" },
    { name: "Personal", used: 150, budget: 200, color: "#E88B8B" },
    { name: "Income", used: 150, budget: 200, color: "#A0D959" },
    { name: "Transport", used: 200, budget: 200, color: "#C89BF9" },
    { name: "Shopping", used: 150, budget: 200, color: "#F0A6E8" },
    { name: "Entertainment", used: 250, budget: 200, color: "#FFA726" },
    { name: "Health and Fitness", used: 150, budget: 200, color: "#80DECD" },
    { name: "Bills and Utilities", used: 150, budget: 200, color: "#7CD5F9" },
  ])

  const totalBudget = 10300
  const totalSpent = 1000
  const remainingBudget = totalBudget - totalSpent
  const spentPercentage = Math.round((totalSpent / totalBudget) * 100)

  const handleDelete = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index))
  }

  return (
    <div className="flex h-screen bg-[#f0f8e8]">
      {/* Sidebar */}
      <div className="w-64 bg-[#004a42] text-white flex flex-col">
        <div className="p-4 flex items-center gap-2 mb-6">
          <div className="bg-[#006e5f] p-2 rounded">
            <DollarSign className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold">TBD</span>
        </div>

        <nav className="flex-1">
          <SidebarItem icon={<BarChart2 />} label="Dashboard" />
          <SidebarItem icon={<ArrowRight />} label="Transactions" />
          <SidebarItem icon={<Layers />} label="Budgets" active />
          <SidebarItem icon={<FileText />} label="Assets" />
          <SidebarItem icon={<Calendar />} label="Calendar" />
          <SidebarItem icon={<Calculator />} label="Zakat & Tax" />
          <SidebarItem icon={<Zap />} label="AI Chatbot" />
        </nav>

        <div className="mt-auto border-t border-[#006e5f] p-4">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <FileText className="h-5 w-5" />
          </div>
          <div className="mt-2">
            <div className="font-medium">Sam Wheeler</div>
            <div className="text-sm text-green-200">samwheeler@example.com</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-4 text-gray-900">Budget Manager</h1>
          <div className="border-b border-gray-200 mb-6"></div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* This Month Card */}
            <div className="lg:col-span-2 bg-[#003c36] text-white p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">This Month</h2>

              <div className="flex flex-wrap justify-between mb-4">
                <div>
                  <div className="text-sm text-gray-300">Remaining</div>
                  <div className="text-4xl font-bold">${remainingBudget.toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="flex gap-8">
                    <div>
                      <div className="text-sm text-gray-300">Total</div>
                      <div className="text-xl font-semibold">${totalBudget.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-300">Spent</div>
                      <div className="text-xl font-semibold">${totalSpent.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative h-4 bg-[#004a42] rounded-full overflow-hidden mb-2">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-300 to-green-400"
                  style={{ width: `${spentPercentage}%` }}
                ></div>
              </div>
              <div className="text-right text-xl font-semibold">{spentPercentage}%</div>
            </div>

            {/* Summary Card */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Summary</h2>
              <div className="flex justify-center mb-4">
                <DonutChart categories={categories} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((category, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-900">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
                    <span>{category.name}</span>
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
                    <th className="pb-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category, index) => {
                    const percentUsed = Math.round((category.used / category.budget) * 100)
                    const remaining = category.budget - category.used
                    const isOverBudget = remaining < 0

                    return (
                      <tr key={index} className="border-b">
                        <td className="py-4 font-medium text-gray-900">{category.name}</td>
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-900">${category.used}</span>
                            <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full"
                                style={{
                                  width: `${Math.min(percentUsed, 100)}%`,
                                  backgroundColor: category.color,
                                }}
                              ></div>
                            </div>
                            <span className="text-gray-900">${category.budget}</span>
                          </div>
                        </td>
                        <td className="py-4 text-center text-gray-900">{percentUsed}%</td>
                        <td className={`py-4 text-right font-bold ${isOverBudget ? "text-red-500" : "text-gray-900"}`}>
                          {isOverBudget ? "-" : ""}${Math.abs(remaining)}
                          {isOverBudget && <span className="ml-2 text-red-500 text-sm">Limit exceeded!</span>}
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button className="text-gray-500 hover:text-gray-700">
                              <Edit className="h-4 w-4" />
                            </button>
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
      </div>
    </div>
  )
}

function SidebarItem({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 ${
        active ? "bg-yellow-300 text-black font-medium" : "text-white hover:bg-[#00806c]"
      }`}
    >
      {icon}
      <span>{label}</span>
    </div>
  )
}

function DonutChart({ categories }: { categories: { name: string; used: number; budget: number; color: string }[] }) {
  // SVG donut chart
  const size = 180
  const strokeWidth = 30
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  // Calculate total used for percentages
  const totalUsed = categories.reduce((sum, category) => sum + category.used, 0)

  // Calculate stroke dasharray and dashoffset for each segment
  let accumulatedPercentage = 0
  const segments = categories.map((category) => {
    const percentage = totalUsed > 0 ? category.used / totalUsed : 0
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
