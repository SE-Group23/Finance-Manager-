import type React from "react"
import type { Asset } from "../../types/asset"
import { ChevronDown, ChevronUp, Edit, Trash2 } from "lucide-react"

interface AssetCardProps {
  asset: Asset
  expanded: boolean
  assetType: string
  totalValue: number
  totalQuantity: number
  unit: string
}

const AssetCard: React.FC<AssetCardProps> = ({ asset, expanded, assetType, totalValue, totalQuantity, unit }) => {
  // Calculate percentage change
  const percentChange = ((asset.current_value - asset.purchase_value) / asset.purchase_value) * 100
  const formattedPercentChange = percentChange.toFixed(1)
  const isPositive = percentChange >= 0

  // Format the purchase date
  const purchaseDate = new Date(asset.acquired_on).toLocaleDateString()

  return (
    <div className="text-white">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold">{assetType}</h3>
          <p className="text-sm text-gray-300">Purchased: {purchaseDate}</p>
        </div>
        <div className="flex space-x-2">
          <button className="p-1 text-gray-300 hover:text-white">
            <Edit size={16} />
          </button>
          <button className="p-1 text-gray-300 hover:text-red-400">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="flex justify-between mt-4">
        <div>
          <p className="text-sm text-gray-300">Value</p>
          <p className="text-xl font-semibold">${totalValue.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-300">{assetType !== "CURRENCY" ? "Quantity" : ""}</p>
          <p className="text-xl font-semibold">{assetType !== "CURRENCY" ? `${totalQuantity}${unit}` : "-"}</p>
        </div>
      </div>

      <div className={`mt-2 ${isPositive ? "text-green-400" : "text-red-400"}`}>
        {isPositive ? "+" : ""}
        {formattedPercentChange}% <span className="text-gray-300 text-sm">this month</span>
      </div>

      <div className="flex justify-center mt-2">
        {expanded ? (
          <ChevronUp size={20} className="text-gray-300" />
        ) : (
          <ChevronDown size={20} className="text-gray-300" />
        )}
      </div>
    </div>
  )
}

export default AssetCard
