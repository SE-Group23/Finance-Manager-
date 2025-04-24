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
    <div className="text-gray-800">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold">{assetType}</h3>
          <p className="text-sm text-gray-500">Purchased: {purchaseDate}</p>
        </div>
        <div className="flex space-x-2">
          <button className="p-1 text-gray-400 hover:text-gray-600">
            <Edit size={16} />
          </button>
          <button className="p-1 text-gray-400 hover:text-red-600">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="flex justify-between mt-4">
        <div>
          <p className="text-sm text-gray-500">Value</p>
          <p className="text-xl font-semibold">${totalValue.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">{assetType !== "CURRENCY" ? "Quantity" : ""}</p>
          <p className="text-xl font-semibold">{assetType !== "CURRENCY" ? `${totalQuantity}${unit}` : "-"}</p>
        </div>
      </div>

      <div className={`mt-2 ${isPositive ? "text-green-500" : "text-red-500"}`}>
        {isPositive ? "+" : ""}
        {formattedPercentChange}% <span className="text-gray-500 text-sm">this month</span>
      </div>

      <div className="flex justify-center mt-2">{expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</div>
    </div>
  )
}

export default AssetCard
