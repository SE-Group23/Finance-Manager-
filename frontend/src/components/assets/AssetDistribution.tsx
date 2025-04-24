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

const COLORS = ["#e8fb5a", "#e88b8b", "#ffa726"]

const AssetDistribution: React.FC<AssetDistributionProps> = ({ distribution, loading }) => {
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    )
  }

  // Format data for the pie chart
  const chartData = distribution.map((item) => ({
    name: item.asset_type,
    value: item.percentage,
    total: item.total,
  }))

  return (
    <div>
      <div className="flex items-center">
        <div className="w-1/3">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name, props) => [`$${props.payload.total.toLocaleString()} (${value}%)`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-2/3 grid grid-cols-3 gap-4">
          {chartData.map((item, index) => (
            <div key={item.name} className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="font-medium">{item.name}</span>
              </div>
              <div className="text-2xl font-bold">{item.value}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AssetDistribution
