"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Sidebar from "../components/Sidebar"
import AssetOverview from "../components/assets/AssetOverview"
import AssetDistribution from "../components/assets/AssetDistribution"
import AssetList from "../components/assets/AssetList"
import PriceChart from "../components/assets/PriceChart"
import LoadingScreen from "../components/LoadingScreen"
import { getPortfolioSummary, refreshAssetValues, getUserAssets } from "../services/assetService"
import { getGoldHistory, getStockHistory } from "../services/assetService"
import type { Asset, PortfolioSummary } from "../types/asset"

const AssetsPage: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([])
  const [summary, setSummary] = useState<PortfolioSummary | null>(null)
  const [goldHistory, setGoldHistory] = useState<any[]>([])
  const [stockHistory, setStockHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    const pageLoadTimer = setTimeout(() => {
      setPageLoading(false)
    }, 600)

    const fetchData = async () => {
      try {
        setLoading(true)
        const [assetsData, summaryData, goldHistoryData] = await Promise.all([
          getUserAssets(),
          getPortfolioSummary(),
          getGoldHistory(),
        ])

        setAssets(assetsData)
        setSummary(summaryData)
        setGoldHistory(goldHistoryData)

        // Get stock history for the first stock if available
        const stockAsset = assetsData.find((asset) => asset.asset_type === "STOCK")
        if (stockAsset && stockAsset.asset_details.ticker) {
          const today = new Date()
          const oneMonthAgo = new Date()
          oneMonthAgo.setMonth(today.getMonth() - 1)

          const stockHistoryData = await getStockHistory(
            stockAsset.asset_details.ticker,
            oneMonthAgo.toISOString().split("T")[0],
            today.toISOString().split("T")[0],
          )
          setStockHistory(stockHistoryData)
        }
      } catch (error) {
        console.error("Error fetching asset data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    return () => clearTimeout(pageLoadTimer)
  }, [])

  const handleRefresh = async () => {
    try {
      setLoading(true)
      const updatedAssets = await refreshAssetValues()
      const updatedSummary = await getPortfolioSummary()
      setAssets(updatedAssets)
      setSummary(updatedSummary)
    } catch (error) {
      console.error("Error refreshing asset values:", error)
    } finally {
      setLoading(false)
    }
  }

  if (pageLoading) {
    return <LoadingScreen />
  }

  return (
    <div className="flex min-h-screen bg-background-light">
      <Sidebar activePage="assets" />
      <div className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Asset Manager</h1>
          <div className="h-0.5 bg-gray-200 mt-4"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top row */}
          <div className="bg-white rounded-lg shadow p-6">
            <AssetOverview summary={summary} loading={loading} onRefresh={handleRefresh} />
          </div>
          <div className="bg-primary-dark text-white rounded-lg shadow p-6">
            <AssetList assets={assets} loading={loading} />
          </div>

          {/* Middle row */}
          <div className="bg-white rounded-lg shadow p-6">
            <AssetDistribution distribution={summary?.distribution || []} loading={loading} />
          </div>

          {/* Bottom row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Gold Rate</h2>
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
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Stock Value</h2>
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

export default AssetsPage
