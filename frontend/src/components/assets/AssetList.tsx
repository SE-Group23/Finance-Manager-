"use client"

import type React from "react"
import { useState } from "react"
import type { Asset } from "../../types/asset"
import AssetCard from "./AssetCard"
import AssetForm from "./AssetForm"
import LoadingScreen from "../../components/LoadingScreen"
import { Plus } from "lucide-react"

interface AssetListProps {
  assets: Asset[]
  loading: boolean
}

const AssetList: React.FC<AssetListProps> = ({ assets, loading }) => {
  const [showAddForm, setShowAddForm] = useState(false)
  const [expandedAssetType, setExpandedAssetType] = useState<string | null>(null)
  const [selectedAssetType, setSelectedAssetType] = useState<string | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  const goldAssets = assets.filter((asset) => asset.asset_type === "GOLD")
  const stockAssets = assets.filter((asset) => asset.asset_type === "STOCK")
  const currencyAssets = assets.filter((asset) => asset.asset_type === "CURRENCY")

  const toggleExpand = (assetType: string) => {
    if (expandedAssetType === assetType) {
      setExpandedAssetType(null)
    } else {
      setExpandedAssetType(assetType)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-primary-medium rounded w-1/2 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-40 bg-primary-medium rounded"></div>
          <div className="h-40 bg-primary-medium rounded"></div>
          <div className="h-40 bg-primary-medium rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Asset List</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Gold Assets */}
        <div
          className="bg-white rounded-lg p-4 border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => toggleExpand("GOLD")}
        >
          {goldAssets.length > 0 ? (
            <AssetCard
              asset={goldAssets[0]}
              expanded={expandedAssetType === "GOLD"}
              assetType="GOLD"
              totalValue={goldAssets.reduce((sum, asset) => sum + asset.current_value, 0)}
              totalQuantity={goldAssets.reduce((sum, asset) => sum + asset.quantity, 0)}
              unit="g"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-32">
              <h3 className="text-xl font-semibold text-gray-800">Gold</h3>
              <p className="text-gray-500">No gold assets</p>
            </div>
          )}

          {expandedAssetType === "GOLD" && (
            <div className="mt-4 space-y-4">
              {goldAssets.map((asset) => (
                <div key={asset.asset_id} className="p-3 bg-gray-50 rounded-md shadow-sm">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium text-gray-800">{asset.asset_details.name || "Gold"}</p>
                      <p className="text-sm text-gray-500">
                        {asset.quantity}
                        {asset.asset_details.unit} - Purchased: {new Date(asset.acquired_on).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-800">${asset.current_value.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">Bought: ${asset.purchase_value.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
              <button
                className="w-full py-2 px-4 bg-chatbot-highlight text-primary-dark font-medium rounded-md hover:bg-yellow-300"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedAssetType("GOLD")
                }}
              >
                Add Gold Asset
              </button>
            </div>
          )}
        </div>

        {/* Stock Assets */}
        <div
          className="bg-white rounded-lg p-4 border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => toggleExpand("STOCK")}
        >
          {stockAssets.length > 0 ? (
            <AssetCard
              asset={stockAssets[0]}
              expanded={expandedAssetType === "STOCK"}
              assetType="STOCK"
              totalValue={stockAssets.reduce((sum, asset) => sum + asset.current_value, 0)}
              totalQuantity={stockAssets.reduce((sum, asset) => sum + asset.quantity, 0)}
              unit="shares"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-32">
              <h3 className="text-xl font-semibold text-gray-800">Stock</h3>
              <p className="text-gray-500">No stock assets</p>
            </div>
          )}

          {expandedAssetType === "STOCK" && (
            <div className="mt-4 space-y-4">
              {stockAssets.map((asset) => (
                <div key={asset.asset_id} className="p-3 bg-gray-50 rounded-md shadow-sm">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium text-gray-800">
                        {asset.asset_details.ticker} - {asset.asset_details.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {asset.quantity} shares - Purchased: {new Date(asset.acquired_on).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-800">${asset.current_value.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">Bought: ${asset.purchase_value.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
              <button
                className="w-full py-2 px-4 bg-chatbot-highlight text-primary-dark font-medium rounded-md hover:bg-yellow-300"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedAssetType("STOCK")
                }}
              >
                Add Stock Asset
              </button>
            </div>
          )}
        </div>

        {/* Currency Assets */}
        <div
          className="bg-white rounded-lg p-4 border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => toggleExpand("CURRENCY")}
        >
          {currencyAssets.length > 0 ? (
            <AssetCard
              asset={currencyAssets[0]}
              expanded={expandedAssetType === "CURRENCY"}
              assetType="CURRENCY"
              totalValue={currencyAssets.reduce((sum, asset) => sum + asset.current_value, 0)}
              totalQuantity={0}
              unit=""
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-32">
              <h3 className="text-xl font-semibold text-gray-800">Currency</h3>
              <p className="text-gray-500">No currency assets</p>
            </div>
          )}

          {expandedAssetType === "CURRENCY" && (
            <div className="mt-4 space-y-4">
              {currencyAssets.map((asset) => (
                <div key={asset.asset_id} className="p-3 bg-gray-50 rounded-md shadow-sm">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium text-gray-800">
                        {asset.asset_details.name || asset.asset_details.currency}
                      </p>
                      <p className="text-sm text-gray-500">
                        Purchased: {new Date(asset.acquired_on).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-800">${asset.current_value.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">Bought: ${asset.purchase_value.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
              <button
                className="w-full py-2 px-4 bg-chatbot-highlight text-primary-dark font-medium rounded-md hover:bg-yellow-300"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedAssetType("CURRENCY")
                }}
              >
                Add Currency Asset
              </button>
            </div>
          )}
        </div>

        {/* Add New Asset */}
        <div
          className="bg-primary-dark rounded-lg p-4 border border-primary-medium cursor-pointer hover:shadow-md transition-shadow flex flex-col items-center justify-center h-40"
          onClick={() => setShowAddForm(true)}
        >
          <h3 className="text-xl font-semibold mb-2 text-white">Add new asset</h3>
          <button className="bg-chatbot-highlight hover:bg-yellow-300 text-primary-dark p-3 rounded-full">
            <Plus size={24} />
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-primary w-full max-w-md rounded-lg shadow-lg">
            <div className="p-6 text-white">
              <h2 className="text-xl font-semibold mb-4">Add New Asset</h2>
              <div className="flex space-x-4 mb-4">
                <button
                  className="flex-1 py-2 rounded-md bg-green-100 hover:bg-green-200 text-primary-dark"
                  onClick={() => {
                    setShowAddForm(false)
                    setSelectedAssetType("GOLD")
                  }}
                >
                  Gold
                </button>
                <button
                  className="flex-1 py-2 rounded-md bg-blue-100 hover:bg-blue-200 text-primary-dark"
                  onClick={() => {
                    setShowAddForm(false)
                    setSelectedAssetType("STOCK")
                  }}
                >
                  Stock
                </button>
                <button
                  className="flex-1 py-2 rounded-md bg-yellow-100 hover:bg-yellow-200 text-primary-dark"
                  onClick={() => {
                    setShowAddForm(false)
                    setSelectedAssetType("CURRENCY")
                  }}
                >
                  Currency
                </button>
              </div>
              <button className="w-full py-2 text-white hover:text-gray-200" onClick={() => setShowAddForm(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedAssetType && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-primary w-full max-w-md rounded-lg shadow-lg">
            {formLoading ? (
              <div className="p-6">
                <LoadingScreen fullScreen={false} />
              </div>
            ) : (
              <div className="p-6">
                <AssetForm
                  assetType={selectedAssetType}
                  onClose={() => {
                    setSelectedAssetType(null)
                    setExpandedAssetType(null)
                  }}
                  onSubmitStart={() => setFormLoading(true)}
                  onSubmitEnd={() => setFormLoading(false)}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AssetList
