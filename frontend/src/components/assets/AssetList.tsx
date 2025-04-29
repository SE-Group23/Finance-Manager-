"use client"

import type React from "react"
import type { Asset } from "../../constants/asset_types"
import AssetCard from "./AssetCard"
import AssetForm from "./AssetForm"
import AssetDetailsModal from "./AssetDetailsModal"
import LoadingScreen from "../LoadingScreen"
import { Plus } from "lucide-react"
import { useAppDispatch, useAppSelector } from "../../hooks"
import {
  setShowAddForm,
  setSelectedAssetType,
  setEditingAsset,
  setDetailsModalType,
  addAsset,
  editAsset,
  removeAsset,
} from "../../store/slices/assetSlice"

interface AssetListProps {
  assets: Asset[]
  loading: boolean
}

const AssetList: React.FC<AssetListProps> = ({ assets, loading }) => {
  const dispatch = useAppDispatch()
  const { showAddForm, selectedAssetType, editingAsset, formLoading, detailsModalType } = useAppSelector(
    (state) => state.assets,
  )

  const goldAssets = assets.filter((asset) => asset.asset_type?.toUpperCase() === "GOLD")
  const stockAssets = assets.filter((asset) => asset.asset_type?.toUpperCase() === "STOCK")
  const currencyAssets = assets.filter((asset) => asset.asset_type?.toUpperCase() === "CURRENCY")

  const handleDeleteAsset = async (assetId: number) => {
    if (window.confirm("Are you sure you want to delete this asset?")) {
      dispatch(removeAsset(assetId))
    }
  }

  const handleEditAsset = (asset: Asset) => {
    dispatch(setEditingAsset(asset))
  }

  const handleCreateAsset = async (assetData: any) => {
    await dispatch(addAsset(assetData)).unwrap()
  }

  const handleUpdateAsset = async (assetId: string, assetData: any) => {
    await dispatch(editAsset({ assetId, assetData })).unwrap()
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
        <div
          className="bg-dark-light rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => dispatch(setDetailsModalType("GOLD"))}
        >
          {goldAssets.length > 0 ? (
            <AssetCard
              asset={goldAssets[0]}
              assetType="GOLD"
              totalValue={goldAssets.reduce((sum, asset) => sum + asset.current_value, 0)}
              totalQuantity={goldAssets.reduce((sum, asset) => sum + asset.quantity, 0)}
              unit=" tola"
              onDelete={handleDeleteAsset}
              onEdit={handleEditAsset}
              onClick={() => dispatch(setDetailsModalType("GOLD"))}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-32">
              <h3 className="text-xl font-semibold text-white">Gold</h3>
              <p className="text-gray-300">No gold assets</p>
            </div>
          )}
        </div>

        <div
          className="bg-dark-light rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => dispatch(setDetailsModalType("STOCK"))}
        >
          {stockAssets.length > 0 ? (
            <AssetCard
              asset={stockAssets[0]}
              assetType="STOCK"
              totalValue={stockAssets.reduce((sum, asset) => sum + asset.current_value, 0)}
              totalQuantity={stockAssets.reduce((sum, asset) => sum + asset.quantity, 0)}
              unit=" shares"
              onDelete={handleDeleteAsset}
              onEdit={handleEditAsset}
              onClick={() => dispatch(setDetailsModalType("STOCK"))}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-32">
              <h3 className="text-xl font-semibold text-white">Stock</h3>
              <p className="text-gray-300">No stock assets</p>
            </div>
          )}
        </div>

        <div
          className="bg-dark-light rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => dispatch(setDetailsModalType("CURRENCY"))}
        >
          {currencyAssets.length > 0 ? (
            <AssetCard
              asset={currencyAssets[0]}
              assetType="CURRENCY"
              totalValue={currencyAssets.reduce((sum, asset) => sum + asset.current_value, 0)}
              totalQuantity={0}
              unit=""
              onDelete={handleDeleteAsset}
              onEdit={handleEditAsset}
              onClick={() => dispatch(setDetailsModalType("CURRENCY"))}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-32">
              <h3 className="text-xl font-semibold text-white">Currency</h3>
              <p className="text-gray-300">No currency assets</p>
            </div>
          )}
        </div>

        <div
          className="bg-dark-light rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow flex flex-col items-center justify-center h-40"
          onClick={() => dispatch(setShowAddForm(true))}
        >
          <h3 className="text-xl font-semibold mb-2 text-white">Add new asset</h3>
          <button className="bg-secondary hover:bg-secondary-dark text-dark p-3 rounded-full">
            <Plus size={24} />
          </button>
        </div>
      </div>

      {detailsModalType === "GOLD" && goldAssets.length > 0 && (
        <AssetDetailsModal
          assets={goldAssets}
          assetType="GOLD"
          onClose={() => dispatch(setDetailsModalType(null))}
          onDelete={handleDeleteAsset}
          onEdit={handleEditAsset}
        />
      )}

      {detailsModalType === "STOCK" && stockAssets.length > 0 && (
        <AssetDetailsModal
          assets={stockAssets}
          assetType="STOCK"
          onClose={() => dispatch(setDetailsModalType(null))}
          onDelete={handleDeleteAsset}
          onEdit={handleEditAsset}
        />
      )}

      {detailsModalType === "CURRENCY" && currencyAssets.length > 0 && (
        <AssetDetailsModal
          assets={currencyAssets}
          assetType="CURRENCY"
          onClose={() => dispatch(setDetailsModalType(null))}
          onDelete={handleDeleteAsset}
          onEdit={handleEditAsset}
        />
      )}

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-navbar w-full max-w-md rounded-2xl shadow-lg">
            <div className="p-6 text-white">
              <h2 className="text-xl font-semibold mb-4">Add New Asset</h2>
              <div className="flex space-x-4 mb-4">
                <button
                  className="flex-1 py-2 rounded-md bg-green-500 hover:bg-green-200 text-dark"
                  onClick={() => {
                    dispatch(setShowAddForm(false))
                    dispatch(setSelectedAssetType("GOLD"))
                  }}
                >
                  Gold
                </button>
                <button
                  className="flex-1 py-2 rounded-md bg-blue-300 hover:bg-blue-200 text-dark"
                  onClick={() => {
                    dispatch(setShowAddForm(false))
                    dispatch(setSelectedAssetType("STOCK"))
                  }}
                >
                  Stock
                </button>
                <button
                  className="flex-1 py-2 rounded-md bg-yellow-400 hover:bg-yellow-200 text-dark"
                  onClick={() => {
                    dispatch(setShowAddForm(false))
                    dispatch(setSelectedAssetType("CURRENCY"))
                  }}
                >
                  Currency
                </button>
              </div>
              <button
                className="w-full py-2 text-white hover:text-gray-200"
                onClick={() => dispatch(setShowAddForm(false))}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedAssetType && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-navbar w-full max-w-md rounded-2xl shadow-lg">
            {formLoading ? (
              <div className="p-6">
                <LoadingScreen fullScreen={false} />
              </div>
            ) : (
              <div className="p-6">
                <AssetForm
                  assetType={selectedAssetType}
                  asset={editingAsset}
                  onClose={() => {
                    dispatch(setSelectedAssetType(null))
                    dispatch(setEditingAsset(null))
                  }}
                  createAsset={handleCreateAsset}
                  updateAsset={handleUpdateAsset}
                  onSubmitStart={() => {}} // Redux handles loading state
                  onSubmitEnd={() => {}} // Redux handles loading state
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
