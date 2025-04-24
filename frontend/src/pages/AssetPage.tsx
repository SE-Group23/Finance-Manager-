"use client"

import { RefreshCw } from "lucide-react"
import { useEffect, useState } from "react"
import AssetList from "../components/assets/AssetList"
import AssetOverview from "../components/assets/AssetOverview"
import PriceChart from "../components//assets/PriceChart"
import Sidebar from "../components/Sidebar"
import AssetDistribution from "../components/assets/AssetDistribution"

export default function AssetPage() {
  const [assets, setAssets] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [goldHistory, setGoldHistory] = useState<any[]>([])
  const [stockHistory, setStockHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const assetsResponse = await fetch("/api/assets")
      const assetsData = await assetsResponse.json()
      setAssets(assetsData)

      const summaryResponse = await fetch("/api/assets/summary")
      const summaryData = await summaryResponse.json()
      setSummary(summaryData)

      const goldResponse = await fetch("/api/gold")
      const goldData = await goldResponse.json()
      setGoldHistory(goldData)

      const stockResponse = await fetch("/api/stock")
      const stockData = await stockResponse.json()
      setStockHistory(stockData)
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleRefresh = () => {
    fetchData()
  }

  return (
    <div className="flex h-screen">
      <Sidebar activePage="assets" />
      <div className="flex-1 overflow-auto bg-background-light">
        <div className="p-6 max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Asset Manager</h1>
            <div className="flex gap-2">
              <button
                onClick={handleRefresh}
                className="bg-navbar hover:bg-navbar-dark text-white px-2 py-1 text-xs rounded-lg flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                Refresh Values
              </button>
            </div>
          </div>

          <div className="border-b border-gray-200 mb-6"></div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Left Column: Nested 2-row grid */}
            <div className="lg:col-span-1 grid grid-rows-[120px_1fr] gap-4 ">
              {/* Total Asset Value */}
              <div className="bg-white p-6 rounded-2xl shadow flex items-center justify-between">
                <AssetOverview summary={summary} loading={loading} onRefresh={handleRefresh} />
              </div>

               {/* Asset Distribution */}
              <div className="bg-white p-6 rounded-2xl shadow">
                <h2 className="text-l font-semibold mb-2 text-gray-500">Asset Distribution</h2>
                <AssetDistribution distribution={summary?.distribution || []} loading={loading} />
              </div>
            </div>

            {/* Asset List */}
            <div className="bg-navbar text-white p-6 rounded-2xl shadow h-[440px] flex flex-col">
              <AssetList assets={assets} loading={loading} />
            </div>
      
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Gold Rate */}
            <div className="bg-white p-6 rounded-2xl shadow">
              <h2 className="text-l font-semibold mb-4 text-gray-500">Gold Rate</h2>
              <div className="text-4xl font-bold">$110</div>
              <div className="text-green-500 font-medium">
                +2.45% <span className="text-gray-500 text-sm font-normal">since last week</span>
              </div>
              <div className="h-48 mt-4">
                <PriceChart
                  data={goldHistory}
                  dataKey="price"
                  xAxisKey="date"
                  color="#f59e0b"
                  areaColor="rgba(245, 158, 11, 0.1)"
                />
              </div>
            </div>

            {/* Stock Value */}
            <div className="bg-white p-6 rounded-2xl shadow">
              <h2 className="text-l font-semibold mb-4 text-gray-500">Stock Value</h2>
              <div className="text-4xl font-bold">$76.5</div>
              <div className="text-green-500 font-medium">
                +1.24% <span className="text-gray-500 text-sm font-normal">since last week</span>
              </div>
              <div className="h-48 mt-4">
                <PriceChart
                  data={stockHistory}
                  dataKey="close"
                  xAxisKey="date"
                  color="#10b981"
                  areaColor="rgba(16, 185, 129, 0.1)"
                  multiline
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
