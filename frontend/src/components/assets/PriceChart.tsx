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
  title?: string
}

const PriceChart: React.FC<PriceChartProps> = ({
  data,
  dataKey,
  xAxisKey,
  color,
  areaColor,
  multiline = false,
  title,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No data available</p>
      </div>
    )
  }

  const formattedData = data.map((item) => ({
    ...item,
    [xAxisKey]: new Date(item[xAxisKey]).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    [dataKey]: Number(item[dataKey]),
    open: item.open ? Number(item.open) : undefined,
    high: item.high ? Number(item.high) : undefined,
    low: item.low ? Number(item.low) : undefined,
    close: item.close ? Number(item.close) : undefined,
    price: item.price ? Number(item.price) : undefined,
  }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-md shadow-lg border border-gray-200">
          <p className="font-medium text-sm text-gray-600">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`value-${index}`} style={{ color: entry.color }} className="text-sm font-semibold">
              {entry.name}: PKR {entry.value.toFixed(2)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (multiline) {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey={xAxisKey}
            tick={{ fontSize: 12, fill: "#6b7280" }}
            tickLine={{ stroke: "#e5e7eb" }}
            axisLine={{ stroke: "#e5e7eb" }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#6b7280" }}
            tickLine={{ stroke: "#e5e7eb" }}
            axisLine={{ stroke: "#e5e7eb" }}
            tickFormatter={(value) => `PKR${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            height={36}
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ paddingBottom: "10px" }}
          />
          <Line
            type="monotone"
            dataKey="close"
            stroke={color}
            strokeWidth={2}
            dot={{ r: 0 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
            name="Close Price"
          />
          {formattedData[0]?.open && (
            <Line
              type="monotone"
              dataKey="open"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 0 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
              name="Open Price"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={formattedData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey={xAxisKey}
          tick={{ fontSize: 12, fill: "#6b7280" }}
          tickLine={{ stroke: "#e5e7eb" }}
          axisLine={{ stroke: "#e5e7eb" }}
        />
        <YAxis
          tick={{ fontSize: 8, fill: "#6b7280" }}
          tickLine={{ stroke: "#e5e7eb" }}
          axisLine={{ stroke: "#e5e7eb" }}
          tickFormatter={(value) => `PKR${value}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          fill={areaColor}
          strokeWidth={2}
          name={title || "Price"}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export default PriceChart
