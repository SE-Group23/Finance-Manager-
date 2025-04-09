"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { XMarkIcon } from "@heroicons/react/24/solid"
import type { Transaction } from "./TransactionList"

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (transaction: Omit<Transaction, "id">) => void
  transaction?: Transaction
}

// Define category options
const CATEGORY_OPTIONS = [
  { value: "food", label: "Food and Drink", type: "expense" },
  { value: "bills", label: "Bills and Utilities", type: "expense" },
  { value: "personal", label: "Personal", type: "expense" },
  { value: "transport", label: "Transport", type: "expense" },
  { value: "shopping", label: "Shopping", type: "expense" },
  { value: "entertainment", label: "Entertainment", type: "expense" },
  { value: "health", label: "Health and Fitness", type: "expense" },
  { value: "income", label: "Income", type: "income" },
]

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onSave, transaction }) => {
  const [formData, setFormData] = useState<Omit<Transaction, "id">>({
    description: "",
    date: new Date().toISOString().split("T")[0],
    category: "",
    categoryType: "expense",
    paymentMethod: "",
    amount: 0,
  })

  const [transactionType, setTransactionType] = useState<"income" | "expense">("expense")

  useEffect(() => {
    if (transaction) {
      setFormData({
        description: transaction.description,
        date: transaction.date,
        category: transaction.category,
        categoryType: transaction.categoryType,
        paymentMethod: transaction.paymentMethod,
        amount: transaction.amount,
      })
      setTransactionType(transaction.categoryType === "income" ? "income" : "expense")
    } else {
      // Reset form for new transaction
      setFormData({
        description: "",
        date: new Date().toISOString().split("T")[0],
        category: "",
        categoryType: "expense",
        paymentMethod: "",
        amount: 0,
      })
      setTransactionType("expense")
    }
  }, [transaction, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "amount" ? Number.parseFloat(value) : value,
    }))
  }

  const handleCategorySelect = (category: string, type: "income" | "expense") => {
    setFormData((prev) => ({
      ...prev,
      category: category,
      categoryType: type,
    }))
    setTransactionType(type)
  }

  const handleTransactionTypeSelect = (type: "income" | "expense") => {
    setTransactionType(type)
    // Reset category if switching between income and expense
    if (
      (type === "income" && formData.categoryType !== "income") ||
      (type === "expense" && formData.categoryType === "income")
    ) {
      setFormData((prev) => ({
        ...prev,
        category: "",
        categoryType: type,
      }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{transaction ? "Edit Transaction" : "Add Transaction"}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Transaction Type Selection */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Transaction Type</label>
            <div className="flex space-x-4">
              <button
                type="button"
                className={`flex items-center justify-center w-12 h-12 rounded-full ${
                  transactionType === "expense"
                    ? "bg-red-100 text-red-500 ring-2 ring-red-500"
                    : "bg-gray-100 text-gray-400"
                }`}
                onClick={() => handleTransactionTypeSelect("expense")}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  ></path>
                </svg>
              </button>
              <button
                type="button"
                className={`flex items-center justify-center w-12 h-12 rounded-full ${
                  transactionType === "income"
                    ? "bg-green-100 text-green-500 ring-2 ring-green-500"
                    : "bg-gray-100 text-gray-400"
                }`}
                onClick={() => handleTransactionTypeSelect("income")}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  ></path>
                </svg>
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
              Title
            </label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="amount">
              Amount
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
              step="0.01"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="paymentMethod">
              Payment Method
            </label>
            <input
              type="text"
              id="paymentMethod"
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
              placeholder="Cash, Bank, etc."
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">Category</label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORY_OPTIONS.filter((cat) =>
                transactionType === "income" ? cat.type === "income" : cat.type === "expense",
              ).map((category) => (
                <button
                  key={category.value}
                  type="button"
                  className={`py-2 px-3 rounded-full text-sm font-medium text-center transition-all ${
                    formData.category === category.label
                      ? `bg-${category.type === "income" ? "green" : "blue"}-100 text-${
                          category.type === "income" ? "green" : "blue"
                        }-800 ring-2 ring-${category.type === "income" ? "green" : "blue"}-500`
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => handleCategorySelect(category.label, category.type as "income" | "expense")}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
            >
              Cancel
            </button>
            <button type="submit" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TransactionModal
