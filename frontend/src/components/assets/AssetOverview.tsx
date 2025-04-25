"use client"

import type React from "react"
import type { PortfolioSummary } from "../../types/asset"

interface AssetOverviewProps {
  summary: PortfolioSummary | null
  loading: boolean
  onRefresh: () => void
}

const AssetOverview: React.FC<AssetOverviewProps> = ({ summary, loading }) => {
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
  const goldTotal = summary?.distribution?.find((d) => d.asset_type.toUpperCase() === "GOLD")?.total || 0
  const stocksTotal = summary?.distribution?.find((d) => d.asset_type.toUpperCase() === "STOCK")?.total || 0
  const currencyTotal = summary?.distribution?.find((d) => d.asset_type.toUpperCase() === "CURRENCY")?.total || 0

  return (
    <div className="flex justify-start items-start gap-12">

    <div className="flex-grow">
      <h2 className="text-l font-semibold mb-2 text-gray-500">Total Asset Value</h2>
      <div className="text-3xl font-bold">PKR {totalCurrent.toLocaleString()}</div>
    </div>
  
    <div className="flex flex-col space-y-1 text-sm ml-3">
      <div className="flex justify-between gap-3 text-yellow-500 font-medium">
        <span>Gold</span>
        <span className="text-gray-900 font-semibold">PKR {goldTotal.toLocaleString()}</span>
      </div>
      <div className="flex justify-between gap-3 text-red-400 font-medium">
        <span>Stocks</span>
        <span className="text-gray-900 font-semibold">PKR {stocksTotal.toLocaleString()}</span>
      </div>
      <div className="flex justify-between gap-3 text-orange-400 font-medium">
        <span>Currency</span>
        <span className="text-gray-900 font-semibold">PKR {currencyTotal.toLocaleString()}</span>
      </div>
    </div>
  </div>
  

  )
}

export default AssetOverview
