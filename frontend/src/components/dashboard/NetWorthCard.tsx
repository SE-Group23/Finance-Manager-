import type React from "react"

interface NetWorthCardProps {
  netCash: number
  totalCredit: number
  totalDebit: number
}

const NetWorthCard: React.FC<NetWorthCardProps> = ({ netCash, totalCredit, totalDebit }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const assets = totalCredit
  const liabilities = totalDebit

  return (
    <div className="bg-primary-dark text-white p-5 rounded-2xl shadow h-full">
      <h2 className="text-lg font-medium mb-2">Net Worth</h2>

      <div className="flex items-center">
        <div className="flex-1">
          <div className="text-4xl font-bold">{formatCurrency(netCash)}</div>
        </div>

        <div className="flex flex-col space-y-1">
          <div>
            <div className="text-finapp-green text-sm font-medium">Credit</div>
            <div className="text-lg font-semibold">{formatCurrency(assets)}</div>
          </div>

          <div>
            <div className="text-red-400 text-sm font-medium">Debit</div>
            <div className="text-lg font-semibold">{formatCurrency(liabilities)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NetWorthCard
