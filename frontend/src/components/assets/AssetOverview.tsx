"use client"

import type React from "react"
import type { PortfolioSummary } from "../../types/asset"
import { RefreshCw } from "lucide-react"

interface AssetOverviewProps {
  summary: PortfolioSummary | null
  loading: boolean
  onRefresh: () => void
}

const AssetOverview: React.FC<AssetOverviewProps> = ({ summary, loading, onRefresh }) => {
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-16 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="flex space-x-4">
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    )
  }

  const totalCurrent = summary?.portfolio_summary?.total_current || 0
  const goldTotal = summary?.distribution?.find((d) => d.asset_type === "GOLD")?.total || 0
  const stocksTotal = summary?.distribution?.find((d) => d.asset_type === "STOCK")?.total || 0
  const currencyTotal = summary?.distribution?.find((d) => d.asset_type === "CURRENCY")?.total || 0

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Total Asset Value</h2>
        <button
          onClick={onRefresh}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          title="Refresh asset values"
        >
          <RefreshCw size={18} />
        </button>
      </div>
      <div className="text-5xl font-bold mb-6">${totalCurrent.toLocaleString()}</div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <div className="text-sm text-green-600 font-medium">Gold</div>
          <div className="font-semibold">${goldTotal.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-sm text-blue-600 font-medium">Stocks</div>
          <div className="font-semibold">${stocksTotal.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-sm text-yellow-500 font-medium">Currency</div>
          <div className="font-semibold">${currencyTotal.toLocaleString()}</div>
        </div>
      </div>
    </div>
  )
}

export default AssetOverview
