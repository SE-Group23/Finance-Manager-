"use client"

import type React from "react"
import { useState } from "react"
import type { TransactionInput } from "../../services/transactionService"

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

interface TransactionFormProps {
  onSubmit: (transaction: TransactionInput) => void
  onCancel: () => void
  initialValues?: Partial<TransactionInput>
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onSubmit, onCancel, initialValues = {} }) => {
  const [title, setTitle] = useState(initialValues.vendor || "")
  const [amount, setAmount] = useState(initialValues.amount?.toString() || "")
  const [date, setDate] = useState(initialValues.transactionDate || "")
  const [category, setCategory] = useState(initialValues.category || "")
  const [transactionType, setTransactionType] = useState<"debit" | "credit">(initialValues.transaction_type || "debit")

  const handleCategorySelect = (categoryOption: CategoryOption) => {
    setCategory(categoryOption.value)
    setTransactionType(categoryOption.type)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const transaction: TransactionInput = {
      amount: Number.parseFloat(amount),
      category,
      vendor: title,
      transaction_type: transactionType,
      transactionDate: date || new Date().toISOString(),
    }

    onSubmit(transaction)
  }

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toISOString().split("T")[0]
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-6 border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-md ${transactionType === "debit" ? "bg-red-100" : "bg-green-100"}`}>
            {transactionType === "debit" ? (
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            )}
          </div>
        </div>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter title"
              required
            />
          </div>
          <div className="hidden">
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Payment method"
              disabled
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="0.00"
              step="0.01"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={formatDateForInput(date)}
              onChange={(e) => setDate(new Date(e.target.value).toISOString())}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleCategorySelect(option)}
                className={`px-3 py-1 rounded-md text-sm ${
                  category === option.value ? "ring-2 ring-green-500 " + option.color : option.color + " opacity-70"
                }`}
              >
                {option.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  )
}

export default TransactionForm
