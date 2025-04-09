import type React from "react"

interface TransactionSummaryProps {
  netWorth: number
  income: number
  expenses: number
}

const TransactionSummary: React.FC<TransactionSummaryProps> = ({ netWorth, income, expenses }) => {
  return (
    <div className="bg-teal-900 rounded-lg p-6">
      <h2 className="text-white text-lg mb-4">This Month</h2>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-white text-sm mb-1">Net Worth</p>
          <p className="text-white text-4xl font-bold">${netWorth.toLocaleString()}</p>
        </div>

        <div>
          <p className="text-green-400 text-sm mb-1">Income</p>
          <p className="text-green-400 text-4xl font-bold">${income.toLocaleString()}</p>
        </div>

        <div>
          <p className="text-red-400 text-sm mb-1">Expenses</p>
          <p className="text-red-400 text-4xl font-bold">${expenses.toLocaleString()}</p>
        </div>
      </div>
    </div>
  )
}

export default TransactionSummary
