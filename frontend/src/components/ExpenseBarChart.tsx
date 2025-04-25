import type React from "react"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, LabelList } from "recharts"

interface ExpenseCategory {
  category_name: string
  amount: number
  percentage: number
}

interface ExpenseBarChartProps {
  data: ExpenseCategory[]
  totalAmount: number
}

const ExpenseBarChart: React.FC<ExpenseBarChartProps> = ({ data, totalAmount }) => {
  const COLORS = ["#00C49F", "#4285F4", "#FFBB28", "#8F73FF", "#F9E04C", "#FF6384"]

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
    }).format(amount)

  const chartData = data.map((item) => ({
    name: item.category_name,
    value: item.amount,
    percentage: item.percentage,
  }))

  const renderCustomLabel = ({ x, y, width, value, index }: any) => {
    const category = chartData[index]
    return (
      <text
        x={x + width + 10}
        y={y + 10}
        fill="#333"
        fontSize={12}
        textAnchor="start"
      >
        {`${formatCurrency(value)} (${category.percentage}%)`}
      </text>
    )
  }

  return (
    <div className="w-full">
      <div className="mb-4 text-center">
        <div className="text-3xl font-bold">{formatCurrency(totalAmount)}</div>
      </div>

      <div style={{ width: "100%", height: "240px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 20, right: 80, left: 80, bottom: 5 }} 
          >
            <XAxis type="number" hide domain={[0, "dataMax + 200"]} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
            <Bar dataKey="value" barSize={20} radius={[0, 4, 4, 0]} animationDuration={700}>
              {chartData.map((entry,index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
              <LabelList dataKey="value" content={renderCustomLabel} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4">
        {data.map((entry, index) => (
          <div key={`legend-${index}`} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
            <span className="text-sm">{entry.category_name} ({entry.percentage}%)</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ExpenseBarChart
