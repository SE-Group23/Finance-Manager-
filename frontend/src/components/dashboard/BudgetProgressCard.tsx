import type React from "react"

interface BudgetProgressCardProps {
  totalSpent: number
  totalBudget: number
  percentage: number
  currentMonth: string
}

const BudgetProgressCard: React.FC<BudgetProgressCardProps> = ({
  totalSpent,
  totalBudget,
  percentage,
  currentMonth,
}) => {
  const clampedPercentage = Math.min(percentage, 100)

  return (
    <div className="bg-white p-5 rounded-2xl shadow h-full">
      <h2 className="text-xl font-semibold mb-3">Total Budget Spent ({currentMonth})</h2>

      <div className="flex items-center mb-3">
        <div className="flex-1 h-5 bg-[#e8f8e8] rounded-full mr-4">
          <div
            style={{
              width: clampedPercentage > 0 ? `${clampedPercentage}%` : "8px",
              height: "100%",
              backgroundColor: percentage > 100 ? "#ef4444" : "#d2ff65",
              borderRadius: "9999px",
              display: "block",
            }}
          ></div>
        </div>

        <div className={`text-lg font-bold ${percentage > 100 ? "text-red-600" : "text-gray-600"}`}>{percentage}%</div>
      </div>

      <div className="text-base text-gray-600 mt-2">
        <span className="font-semibold text-lg">PKR {totalSpent.toLocaleString()}</span> spent of{" "}
        <span className="font-semibold text-lg">PKR {totalBudget.toLocaleString()}</span> budget
      </div>
    </div>
  )
}

export default BudgetProgressCard
