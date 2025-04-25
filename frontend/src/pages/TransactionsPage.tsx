"use client"

import type React from "react"
import { useEffect, useState } from "react"
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  type Transaction,
  type TransactionInput,
} from "../services/transactionService"
import TransactionForm from "../components/TransactionForm"
import TransactionItem from "../components/TransactionItem"
import TransactionSummary from "../components/TransactionSummary"
import Sidebar from "../components/Sidebar"

const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Group transactions by date
  const groupedTransactions = transactions.reduce<Record<string, Transaction[]>>((groups, transaction) => {
    const date = new Date(transaction.transaction_date)
    const formattedDate = `${date.toLocaleString("default", { month: "short" })} ${date.getDate()}`

    if (!groups[formattedDate]) {
      groups[formattedDate] = []
    }

    groups[formattedDate].push(transaction)
    return groups
  }, {})

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    setIsLoading(true)
    try {
      const data = await getTransactions()
      setTransactions(data)
      setError(null)
    } catch (err) {
      setError("Failed to load transactions. Please try again later.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTransaction = async (transaction: TransactionInput) => {
    try {
      const newTransaction = await createTransaction(transaction)
      setTransactions([newTransaction, ...transactions])
      setIsFormVisible(false)
      setError(null)
    } catch (err) {
      setError("Failed to create transaction. Please try again.")
      console.error(err)
    }
  }

  const handleUpdateTransaction = async (transaction: TransactionInput) => {
    if (!editingTransaction) return

    try {
      const updatedTransaction = await updateTransaction(editingTransaction.transaction_id, transaction)
      setTransactions(
        transactions.map((t) => (t.transaction_id === updatedTransaction.transaction_id ? updatedTransaction : t)),
      )
      setEditingTransaction(null)
      setIsFormVisible(false)
      setError(null)
    } catch (err) {
      setError("Failed to update transaction. Please try again.")
      console.error(err)
    }
  }

  const handleDeleteTransaction = async (id: number) => {
    try {
      await deleteTransaction(id)
      setTransactions(transactions.filter((t) => t.transaction_id !== id))
      setError(null)
    } catch (err) {
      setError("Failed to delete transaction. Please try again.")
      console.error(err)
    }
  }

  const handleEditClick = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setIsFormVisible(true)
  }

  const handleCancelForm = () => {
    setIsFormVisible(false)
    setEditingTransaction(null)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Transactions</h1>
          </div>

          <div className="flex justify-between mb-6">
            <div className="w-3/4">
              <TransactionSummary transactions={transactions} />
            </div>
            <div className="w-1/4 pl-4 flex items-start justify-end">
              <button
                onClick={() => setIsFormVisible(true)}
                className="bg-lime-300 hover:bg-lime-400 text-gray-800 font-medium py-4 px-6 rounded-lg flex flex-col items-center justify-center h-full w-full"
              >
                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Record Transaction</span>
              </button>
            </div>
          </div>

          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

          {isFormVisible && (
            <TransactionForm
              onSubmit={editingTransaction ? handleUpdateTransaction : handleCreateTransaction}
              onCancel={handleCancelForm}
              initialValues={editingTransaction || {}}
            />
          )}

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Transaction History</h2>

            {isLoading ? (
              <div className="text-center py-8">
                <svg
                  className="animate-spin h-8 w-8 text-teal-600 mx-auto"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <p className="mt-2 text-gray-600">Loading transactions...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No transactions found. Add your first transaction!</p>
              </div>
            ) : (
              <div>
                {Object.entries(groupedTransactions).map(([date, transactionsForDate]) => (
                  <div key={date}>
                    <h3 className="font-medium text-gray-500 mt-6 mb-2">{date}</h3>
                    {transactionsForDate.map((transaction) => (
                      <TransactionItem
                        key={transaction.transaction_id}
                        transaction={transaction}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteTransaction}
                      />
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TransactionsPage
