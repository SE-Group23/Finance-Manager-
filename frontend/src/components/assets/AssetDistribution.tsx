import type React from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

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

const COLORS = ["#eab308", "#ef4444", "#3b82f6"]

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
      <h2 className="text-xl font-semibold mb-4">Asset Distribution</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name, props) => [`$${props.payload.total.toLocaleString()} (${value}%)`, name]}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default AssetDistribution
