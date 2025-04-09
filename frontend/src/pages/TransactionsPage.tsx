"use client"

import type React from "react"
import { useState } from "react"
import TransactionSummary from "../components/TransactionSummary"
import TransactionList, { type Transaction } from "../components/TransactionList"
import TransactionModal from "../components/TransactionModal"
import FinanceSidebar from "../components/FinanceSidebar"

const TransactionsPage: React.FC = () => {
  // Sample data
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "1",
      description: "Electricity Bill",
      date: "2025-04-06",
      category: "Bills and Utilities",
      categoryType: "bills",
      paymentMethod: "Meezan Bank",
      amount: 200,
    },
    {
      id: "2",
      description: "Ayesha Mirza",
      date: "2025-04-06",
      category: "Personal",
      categoryType: "personal",
      paymentMethod: "Cash",
      amount: 70,
    },
    {
      id: "3",
      description: "LUMS SSE",
      date: "2025-04-06",
      category: "Income",
      categoryType: "income",
      paymentMethod: "Meezan Bank",
      amount: 1110,
    },
    {
      id: "4",
      description: "Electricity Bill",
      date: "2025-03-29",
      category: "Food and Drink",
      categoryType: "food",
      paymentMethod: "Meezan Bank",
      amount: 200,
    },
    {
      id: "5",
      description: "Namwar Rauf",
      date: "2025-03-29",
      category: "Personal",
      categoryType: "personal",
      paymentMethod: "Cash",
      amount: 70,
    },
    {
      id: "6",
      description: "LUMS SSE",
      date: "2025-03-29",
      category: "Income",
      categoryType: "income",
      paymentMethod: "Meezan Bank",
      amount: 1110,
    },
  ])

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | undefined>(undefined)

  // Calculate summary data
  const netWorth = 140202
  const income = 12202
  const expenses = 10000

  // Handle edit transaction
  const handleEditTransaction = (id: string) => {
    const transaction = transactions.find((t) => t.id === id)
    if (transaction) {
      setCurrentTransaction(transaction)
      setIsModalOpen(true)
    }
  }

  // Handle delete transaction
  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter((transaction) => transaction.id !== id))
  }

  // Handle add transaction
  const handleAddTransaction = () => {
    setCurrentTransaction(undefined)
    setIsModalOpen(true)
  }

  // Handle save transaction
  const handleSaveTransaction = (transactionData: Omit<Transaction, "id">) => {
    if (currentTransaction) {
      // Update existing transaction
      setTransactions(
        transactions.map((t) =>
          t.id === currentTransaction.id ? { ...transactionData, id: currentTransaction.id } : t,
        ),
      )
    } else {
      // Add new transaction
      const newTransaction = {
        ...transactionData,
        id: Date.now().toString(), // Simple ID generation
      }
      setTransactions([newTransaction, ...transactions])
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <FinanceSidebar />

      {/* Main content */}
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Transactions</h1>

        {/* Summary section and Add Transaction button */}
        <div className="flex mb-8">
          <div className="flex-1">
            <TransactionSummary netWorth={netWorth} income={income} expenses={expenses} />
          </div>
          <div className="ml-4 flex items-start">
            <button
              className="bg-lime-300 hover:bg-lime-400 text-gray-800 font-bold py-4 px-6 rounded-lg flex items-center"
              onClick={handleAddTransaction}
            >
              <svg
                className="w-6 h-6 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
              </svg>
              <span>Record Transaction</span>
            </button>
          </div>
        </div>

        {/* Transaction history */}
        <TransactionList
          transactions={transactions}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteTransaction}
        />

        {/* Transaction modal */}
        <TransactionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveTransaction}
          transaction={currentTransaction}
        />
      </div>
    </div>
  )
}

export default TransactionsPage

