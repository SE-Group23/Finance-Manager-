"use client"

import type React from "react"
import type { Asset } from "../../types/asset"
import { Edit, Trash2 } from "lucide-react"

interface AssetCardProps {
  asset: Asset
  assetType: string
  totalValue: number
  totalQuantity: number
  unit: string
  onDelete?: (assetId: number) => void
  onEdit?: (asset: Asset) => void
  onClick?: () => void
}

const AssetCard: React.FC<AssetCardProps> = ({
  asset,
  assetType,
  totalValue,
  totalQuantity,
  unit,
  onDelete,
  onEdit,
  onClick,
}) => {
  // Calculate percentage change
  const purchaseValue = Number.parseFloat(asset.purchase_value.toString())
  const currentValue = Number.parseFloat(asset.current_value.toString())
  const percentChange = ((currentValue - purchaseValue) / purchaseValue) * 100
  const formattedPercentChange = percentChange.toFixed(1)
  const isPositive = percentChange >= 0

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDelete) {
      onDelete(asset.asset_id)
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onEdit) {
      onEdit(asset)
    }
  }

  return (
    <div className="text-white" onClick={onClick}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold">{assetType}</h3>
          <p className="text-sm text-gray-300">{assetType !== "CURRENCY" ? `${totalQuantity}${unit}` : ""}</p>
        </div>
        <div className="flex space-x-2">
          <button className="p-1 text-gray-300 hover:text-white" onClick={handleEdit}>
            <Edit size={16} />
          </button>
          <button className="p-1 text-gray-300 hover:text-red-400" onClick={handleDelete}>
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="flex justify-between mt-4">
        <div>
          <p className="text-sm text-gray-300">Purchase Value</p>
          <p className="text-xl font-semibold">${Number.parseFloat(asset.purchase_value.toString()).toFixed(2)}</p>
        </div>
        <div>
          <p className={`text-xl font-semibold ${isPositive ? "text-green-400" : "text-red-400"}`}>
            {isPositive ? "+" : ""}
            {formattedPercentChange}%
          </p>
        </div>
      </div>
    </div>
  )
}

export default AssetCard
