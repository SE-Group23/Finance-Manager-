"use client"
import { useEffect } from "react"
import AssetList from "../components/assets/AssetList"
import AssetOverview from "../components/assets/AssetOverview"
import PriceChart from "../components/assets/PriceChart"
import Sidebar from "../components/Sidebar"
import AssetDistribution from "../components/assets/AssetDistribution"
import { useAppDispatch, useAppSelector } from "../hooks"
import { fetchAllAssetData, refreshAssets } from "../store/slices/assetSlice"

export default function AssetPage() {
  const dispatch = useAppDispatch()
  const { assets, summary, goldHistory, stockHistory, selectedStock, loading } = useAppSelector((state) => state.assets)

  useEffect(() => {
    dispatch(fetchAllAssetData())
  }, [dispatch])

  const handleRefresh = async () => {
    dispatch(refreshAssets())
  }

  const latestGoldPrice = goldHistory.length > 0 ? goldHistory[goldHistory.length - 1]?.price : 0
  const firstGoldPrice = goldHistory.length > 0 ? goldHistory[0]?.price : 0
  const goldPercentChange = firstGoldPrice > 0 ? ((latestGoldPrice - firstGoldPrice) / firstGoldPrice) * 100 : 0

  const latestStockPrice = stockHistory.length > 0 ? stockHistory[stockHistory.length - 1]?.close : 0
  const firstStockPrice = stockHistory.length > 0 ? stockHistory[0]?.close : 0
  const stockPercentChange = firstStockPrice > 0 ? ((latestStockPrice - firstStockPrice) / firstStockPrice) * 100 : 0

  return (
    <div className="flex h-screen">
      <Sidebar activePage="assets" />
      <div className="flex-1 overflow-auto bg-background-light">
        <div className="p-6 max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Asset Manager</h1>
          </div>

          <div className="border-b border-gray-200 mb-6"></div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
            <div className="lg:col-span-1 grid grid-rows-[120px_1fr] gap-4 ">
              <div className="bg-white p-6 rounded-2xl shadow flex items-center justify-between">
                <AssetOverview summary={summary} loading={loading} onRefresh={handleRefresh} />
              </div>

              <div className="bg-white p-6 rounded-2xl shadow">
                <h2 className="text-l font-semibold mb-2 text-gray-500">Asset Distribution</h2>
                <AssetDistribution distribution={summary?.distribution || []} loading={loading} />
              </div>
            </div>

            <div className="bg-navbar text-white p-6 rounded-2xl shadow h-[440px] flex flex-col">
              <AssetList assets={assets} loading={loading} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow">
              <h2 className="text-l font-semibold mb-4 text-gray-500">Gold Rate</h2>
              {goldHistory.length > 0 ? (
                <>
                  <div className="text-3xl font-bold">PKR {latestGoldPrice.toFixed(2)}</div>
                  <div className={`${goldPercentChange >= 0 ? "text-green-500" : "text-red-500"} font-medium`}>
                    {goldPercentChange >= 0 ? "+" : ""}
                    {goldPercentChange.toFixed(2)}%
                    <span className="text-gray-500 text-sm font-normal">
                      {" "}
                      since {goldHistory[0]?.date ? new Date(goldHistory[0]?.date).toLocaleDateString() : "last period"}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-4xl font-bold">$110.00</div>
                  <div className="text-green-500 font-medium">
                    +2.45% <span className="text-gray-500 text-sm font-normal">since last week</span>
                  </div>
                </>
              )}
              <div className="h-48 mt-4">
                <PriceChart
                  data={goldHistory}
                  dataKey="price"
                  xAxisKey="date"
                  color="#f59e0b"
                  areaColor="rgba(245, 158, 11, 0.1)"
                  title="Gold Price"
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow">
              <h2 className="text-l font-semibold mb-4 text-gray-500">
                Stock Value {selectedStock && `(${selectedStock})`}
              </h2>
              {stockHistory.length > 0 ? (
                <>
                  <div className="text-4xl font-bold">${latestStockPrice.toFixed(2)}</div>
                  <div className={`${stockPercentChange >= 0 ? "text-green-500" : "text-red-500"} font-medium`}>
                    {stockPercentChange >= 0 ? "+" : ""}
                    {stockPercentChange.toFixed(2)}%
                    <span className="text-gray-500 text-sm font-normal">
                      {" "}
                      since{" "}
                      {stockHistory[0]?.date ? new Date(stockHistory[0]?.date).toLocaleDateString() : "last period"}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-4xl font-bold">$76.50</div>
                  <div className="text-green-500 font-medium">
                    +1.24% <span className="text-gray-500 text-sm font-normal">since last week</span>
                  </div>
                </>
              )}
              <div className="h-48 mt-4">
                <PriceChart
                  data={stockHistory}
                  dataKey="close"
                  xAxisKey="date"
                  color="#3b82f6"
                  areaColor="rgba(59, 130, 246, 0.1)"
                  multiline={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
