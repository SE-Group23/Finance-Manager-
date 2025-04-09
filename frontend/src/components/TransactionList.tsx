"use client"

import type React from "react"

// Transaction type definition
export interface Transaction {
  id: string
  description: string
  date: string
  category: string
  categoryType:
    | "income"
    | "expense"
    | "bills"
    | "personal"
    | "food"
    | "transport"
    | "shopping"
    | "entertainment"
    | "health"
  paymentMethod: string
  amount: number
}

// Group transactions by date
interface GroupedTransactions {
  [date: string]: Transaction[]
}

interface TransactionListProps {
  transactions: Transaction[]
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onEdit = () => {}, onDelete = () => {} }) => {
  // Group transactions by date
  const groupTransactionsByDate = (transactions: Transaction[]): GroupedTransactions => {
    return transactions.reduce((groups: GroupedTransactions, transaction) => {
      const date = new Date(transaction.date)
      const formattedDate = `${date.toLocaleString("default", { month: "short" })} ${date.getDate()}`

      if (!groups[formattedDate]) {
        groups[formattedDate] = []
      }

      groups[formattedDate].push(transaction)
      return groups
    }, {})
  }

  const groupedTransactions = groupTransactionsByDate(transactions)

  // Function to determine if a transaction is an expense or income
  const isExpense = (transaction: Transaction) => {
    return transaction.categoryType !== "income"
  }

  // Function to get category background color
  const getCategoryBgColor = (categoryType: string) => {
    switch (categoryType) {
      case "income":
        return "bg-green-100 text-green-800"
      case "bills":
        return "bg-blue-100 text-blue-800"
      case "personal":
        return "bg-pink-100 text-pink-800"
      case "food":
        return "bg-yellow-100 text-yellow-800"
      case "transport":
        return "bg-purple-100 text-purple-800"
      case "shopping":
        return "bg-indigo-100 text-indigo-800"
      case "entertainment":
        return "bg-orange-100 text-orange-800"
      case "health":
        return "bg-teal-100 text-teal-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div>
      <h2 className="text-xl font-medium text-gray-700 mb-4">Transaction History</h2>

      {Object.entries(groupedTransactions).map(([date, transactions]) => (
        <div key={date} className="mb-6">
          <h3 className="text-gray-500 mb-2">{date}</h3>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="border-b border-gray-100 last:border-b-0 p-4 flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                    isExpense(transaction) ? "bg-red-100" : "bg-green-100"
                  }`}
                >
                  {isExpense(transaction) ? (
                    <svg
                      className="w-5 h-5 text-red-500"
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
                  ) : (
                    <svg
                      className="w-5 h-5 text-green-500"
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
                  )}
                </div>

                <div className="flex-1">
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
                </div>

                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium text-center mx-4 ${getCategoryBgColor(
                    transaction.categoryType,
                  )}`}
                >
                  {transaction.category}
                </div>

                <div className="text-sm text-gray-600 text-center mx-4">{transaction.paymentMethod}</div>

                <div className="text-xl font-bold mr-4">${transaction.amount}</div>

                <div className="flex space-x-2">
                  <button className="text-gray-400 hover:text-gray-600" onClick={() => onEdit(transaction.id)}>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      ></path>
                    </svg>
                  </button>
                  <button className="text-gray-400 hover:text-gray-600" onClick={() => onDelete(transaction.id)}>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      ></path>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default TransactionList
