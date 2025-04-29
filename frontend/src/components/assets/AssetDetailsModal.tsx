"use client"

import type React from "react"
import type { Asset } from "../../constants/asset_types"
import { Edit, Trash2, X } from "lucide-react"

interface AssetDetailsModalProps {
  assets: Asset[]
  assetType: string
  onClose: () => void
  onDelete: (assetId: number) => void
  onEdit: (asset: Asset) => void
}

const AssetDetailsModal: React.FC<AssetDetailsModalProps> = ({ assets, assetType, onClose, onDelete, onEdit }) => {

  const totalCurrentValue = assets.reduce((sum, asset) => sum + Number.parseFloat(asset.current_value.toString()), 0)
  const totalPurchaseValue = assets.reduce((sum, asset) => sum + Number.parseFloat(asset.purchase_value.toString()), 0)
  const totalQuantity = assets.reduce((sum, asset) => sum + Number.parseFloat(asset.quantity.toString()), 0)

  const getUnit = () => {
    switch (assetType) {
      case "GOLD":
        return "tola"
      case "STOCK":
        return "shares"
      default:
        return ""
    }
  }

  const getAssetColor = () => {
    switch (assetType) {
      case "GOLD":
        return "text-yellow-500"
      case "STOCK":
        return "text-blue-500"
      case "CURRENCY":
        return "text-green-500"
      default:
        return "text-white"
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-navbar-dark w-full max-w-2xl rounded-xl shadow-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-2xl font-bold ${getAssetColor()}`}>{assetType} Assets</h2>
            <button className="text-gray-400 hover:text-white p-1 rounded-full" onClick={onClose}>
              <X size={24} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-dark p-4 rounded-lg">
              <p className="text-sm text-gray-400">Total Value</p>
              <p className="text-xl font-bold text-white">${totalCurrentValue.toFixed(2)}</p>
            </div>
            <div className="bg-dark p-4 rounded-lg">
              <p className="text-sm text-gray-400">Purchase Value</p>
              <p className="text-xl font-bold text-white">${totalPurchaseValue.toFixed(2)}</p>
            </div>
            <div className="bg-dark p-4 rounded-lg">
            </div>
          </div>

          {assetType !== "CURRENCY" && (
            <div className="mb-6 bg-dark p-4 rounded-lg">
              <p className="text-sm text-gray-400">Total Quantity</p>
              <p className="text-xl font-bold text-white">
                {totalQuantity} {getUnit()}
              </p>
            </div>
          )}

          <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
            <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">Individual Assets</h3>
            {assets.map((asset) => (
              <div key={asset.asset_id} className="bg-dark p-4 rounded-lg">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium text-white">
                      {assetType === "STOCK"
                        ? `${asset.asset_details?.ticker} - ${asset.asset_details?.name}`
                        : assetType === "CURRENCY"
                          ? `${asset.asset_details?.currency || ""
                          }`
                          : asset.asset_details?.name || assetType}
                    </p>
                    <p className="text-m text-white">
                      {assetType === "CURRENCY"
                        ? `Amount: ${asset.quantity} ${asset.asset_details?.currency || ""
                        } `
                        : `${asset.quantity} ${asset.asset_details?.unit || getUnit()} - `}
                      
                    </p>
                    <p className="text-sm text-gray-400">
                    Purchased: {new Date(asset.acquired_on).toLocaleDateString()}
                    </p>
                   
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm text-gray-400">
                      Value: PKR {Number.parseFloat(asset.current_value.toString()).toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex justify-end mt-2 space-x-2">
                  <button className="text-gray-400 hover:text-white p-1" onClick={() => onEdit(asset)}>
                    <Edit size={16} />
                  </button>
                  <button className="text-gray-400 hover:text-red-400 p-1" onClick={() => onDelete(asset.asset_id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AssetDetailsModal
