import type React from "react"
import type { Transaction } from "../../services/transactionService"

interface TransactionSummaryProps {
  transactions: Transaction[]
}

const TransactionSummary: React.FC<TransactionSummaryProps> = ({ transactions }) => {
  const calculateNetWorth = (): number => {
    return transactions.reduce((total, transaction) => {
      const amount = Number(transaction.amount) || 0
      if (transaction.transaction_type === "credit") {
        return total + amount
      } else {
        return total - amount
      }
    }, 0)
  }

  const calculateIncome = (): number => {
    return transactions
      .filter((t) => t.transaction_type === "credit")
      .reduce((total, transaction) => {
        const amount = Number(transaction.amount) || 0
        return total + amount
      }, 0)
  }

  const calculateExpenses = (): number => {
    return transactions
      .filter((t) => t.transaction_type === "debit")
      .reduce((total, transaction) => {
        const amount = Number(transaction.amount) || 0
        return total + amount
      }, 0)
  }

  const formatCurrency = (value: number): string => {
    const amount = Number(value)

    if (isNaN(amount)) {
      return "$0"
    }

    return amount % 1 === 0 ? `$${amount.toFixed(0)}` : `$${amount.toFixed(2)}`
  }

  return (
    <div className="bg-teal-900 text-white p-6 rounded-lg mb-8">
      <h2 className="text-xl font-semibold mb-4">This Month</h2>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-teal-200">Net Worth</p>
          <p className="text-4xl font-bold">{formatCurrency(calculateNetWorth())}</p>
        </div>
        <div>
          <p className="text-sm text-green-300">Income</p>
          <p className="text-4xl font-bold text-green-400">{formatCurrency(calculateIncome())}</p>
        </div>
        <div>
          <p className="text-sm text-red-300">Expenses</p>
          <p className="text-4xl font-bold text-red-400">{formatCurrency(calculateExpenses())}</p>
        </div>
      </div>
    </div>
  )
}

export default TransactionSummary
