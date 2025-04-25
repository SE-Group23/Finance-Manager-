import type React from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

interface DistributionItem {
  asset_type: string
  count: number
  total: number
  percentage: number
}

interface AssetDistributionProps {
  distribution: DistributionItem[]
  loading: boolean
}

const COLORS = {
  GOLD: "#f59e0b",
  STOCK: "#3b82f6",
  CURRENCY: "#10b981", 
}

const AssetDistribution: React.FC<AssetDistributionProps> = ({ distribution, loading }) => {
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    )
  }

  const chartData = distribution.map((item) => ({
    name: item.asset_type.toUpperCase(),
    value: item.percentage,
    total: item.total,
    count: item.count,
  }))

  const getColor = (assetType: string) => {
    const normalizedType = assetType.toUpperCase()
    return COLORS[normalizedType as keyof typeof COLORS] || "#6b7280"
  }

  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 rounded-md shadow-lg border border-gray-200">
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm">
            <span className="font-medium">Total:</span> PKR {data.total.toLocaleString()}
          </p>
          <p className="text-sm">
            <span className="font-medium">Percentage:</span> {data.value}%
          </p>
          <p className="text-sm">
            <span className="font-medium">Count:</span> {data.count} {data.count === 1 ? "asset" : "assets"}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <>
      <div className="flex flex-col md:flex-row items-center">
        <div className="w-full md:w-1/2">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry) => (
                  <Cell key={`cell-${entry.name}`} fill={getColor(entry.name)} />
                ))}
              </Pie>
              <Tooltip content={customTooltip} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="w-full md:w-1/2 grid grid-cols-1 gap-4 mt-4 md:mt-0">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: getColor(item.name) }}></div>
                <span className="font-medium">{item.name}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold">PKR {item.total.toLocaleString()}</span>
                <span className="text-sm text-gray-500">{item.value}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {chartData.length === 0 && (
        <div className="flex items-center justify-center h-30">
          <p className="text-gray-500">No asset data available</p>
        </div>
      )}
    </>
  )
}

export default AssetDistribution
