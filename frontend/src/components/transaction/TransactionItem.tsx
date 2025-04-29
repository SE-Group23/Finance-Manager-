"use client"

import type React from "react"
import type { Transaction } from "../../services/transactionService"

interface TransactionItemProps {
  transaction: Transaction
  onEdit: (transaction: Transaction) => void
  onDelete: (id: number) => void
}

const getCategoryColor = (category: string): string => {
  const categoryMap: Record<string, string> = {
    "Food and Drink": "bg-green-100 text-green-800",
    Personal: "bg-pink-100 text-pink-800",
    Income: "bg-yellow-100 text-yellow-800",
    Transport: "bg-purple-100 text-purple-800",
    Shopping: "bg-gray-100 text-gray-800",
    Entertainment: "bg-orange-100 text-orange-800",
    "Health and Fitness": "bg-blue-100 text-blue-800",
    "Bills and Utilities": "bg-blue-100 text-blue-800",
  }

  return categoryMap[category] || "bg-gray-100 text-gray-800"
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onEdit, onDelete }) => {
  const date = new Date(transaction.transaction_date)
  const formattedDate = `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()}`

  const formatAmount = (value: number): string => {
   
    const amount = Number(value)

    if (isNaN(amount)) {
      return "PKR 0"
    }

    return amount % 1 === 0 ? `PKR ${Math.abs(amount).toFixed(0)}` : `PKR ${Math.abs(amount).toFixed(2)}`
  }

  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100">
      <div className="flex items-center space-x-4">
        <div className={`p-2 rounded-md ${transaction.transaction_type === "debit" ? "bg-red-100" : "bg-green-100"}`}>
          {transaction.transaction_type === "debit" ? (
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          )}
        </div>
        <div>
          <h3 className="font-medium">{transaction.vendor || transaction.category}</h3>
          <p className="text-sm text-gray-500">{formattedDate}</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <span className={`px-3 py-1 rounded-md text-sm ${getCategoryColor(transaction.category)}`}>
          {transaction.category}
        </span>
        <span className="font-bold">{formatAmount(transaction.amount)}</span>
        <div className="flex space-x-2">
          <button onClick={() => onEdit(transaction)} className="text-gray-500 hover:text-gray-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>
          <button onClick={() => onDelete(transaction.transaction_id)} className="text-gray-500 hover:text-red-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default TransactionItem
