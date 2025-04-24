import type React from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Line,
  LineChart,
} from "recharts"

interface PriceChartProps {
  data: any[]
  dataKey: string
  xAxisKey: string
  color: string
  areaColor: string
  multiline?: boolean
}

const PriceChart: React.FC<PriceChartProps> = ({ data, dataKey, xAxisKey, color, areaColor, multiline = false }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No data available</p>
      </div>
    )
  }

  // Format dates for better display
  const formattedData = data.map((item) => ({
    ...item,
    [xAxisKey]: new Date(item[xAxisKey]).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }))

  if (multiline) {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xAxisKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey={dataKey} stroke={color} activeDot={{ r: 8 }} name="This Month" />
          <Line type="monotone" dataKey="open" stroke="#3b82f6" name="Last Month" />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxisKey} />
        <YAxis />
        <Tooltip />
        <Area type="monotone" dataKey={dataKey} stroke={color} fill={areaColor} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export default PriceChart
