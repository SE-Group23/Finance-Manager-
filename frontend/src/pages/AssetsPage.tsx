// frontend/src/pages/AssetsPage.tsx
"use client"

import React, { useState, useEffect } from "react"
import { AssetType, GoldUnit } from "../constants/assets"
import { getAssets, createAsset } from "../services/assetService"

const API_URL = `${import.meta.env.VITE_API_HOST}:${import.meta.env.VITE_API_PORT}/api/assets`

interface Asset {
  asset_id:      number
  asset_type:    string
  quantity:      number
  purchase_value:number
  current_value: number
  acquired_on:   string
  asset_details: {
    ticker?:       string
    unit?:         string
    name?:         string
    currencyCode?: string
  }
}

const AssetsPage: React.FC = () => {
  // form state
  const [assetType, setAssetType]       = useState<AssetType>(AssetType.GOLD)
  const [quantity, setQuantity]         = useState<number>(0)
  const [purchaseValue, setPurchaseValue] = useState<number>(0)
  const [unit, setUnit]                 = useState<GoldUnit>(GoldUnit.GRAM)
  const [ticker, setTicker]             = useState<string>("")
  const [name, setName]                 = useState<string>("")
  const [currencyCode, setCurrencyCode] = useState<string>("")
  const [currencyName, setCurrencyName] = useState<string>("")

  // list + loading/error states
  const [assets, setAssets]             = useState<Asset[]>([])
  const [isLoadingAssets, setIsLoadingAssets]   = useState(false)
  const [isSubmitting, setIsSubmitting]         = useState(false)
  const [error, setError]               = useState<string>("")

  // fetch on mount
  useEffect(() => {
    fetchAssets()
  }, [])

  async function fetchAssets() {
    setError("")
    setIsLoadingAssets(true)
    try {
      const list = await getAssets()
      setAssets(list || [])
    } catch {
      setError("Failed to load assets")
    } finally {
      setIsLoadingAssets(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)
    try {
      const assetDetails: any = {}
      if (assetType === AssetType.GOLD) {
        assetDetails.unit = unit
      }
      if (assetType === AssetType.STOCK) {
        assetDetails.ticker = ticker
        assetDetails.name   = name
      }
      if (assetType === AssetType.CURRENCY) {
        assetDetails.currencyCode = currencyCode
        assetDetails.name         = currencyName
      }

      await createAsset(assetType, quantity, purchaseValue, assetDetails)

      // reset form
      setQuantity(0)
      setPurchaseValue(0)
      setUnit(GoldUnit.GRAM)
      setTicker("")
      setName("")
      setCurrencyCode("")
      setCurrencyName("")

      // refresh list
      await fetchAssets()
    } catch {
      setError("Failed to create asset")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Asset Management</h1>

      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        {/* Asset Type */}
        <div>
          <label className="block text-sm font-medium">Asset Type</label>
          <select
            value={assetType}
            onChange={e => setAssetType(e.target.value as AssetType)}
            className="mt-1 block w-full border rounded p-2"
          >
            <option value={AssetType.GOLD}>Gold</option>
            <option value={AssetType.STOCK}>Stock</option>
            <option value={AssetType.CURRENCY}>Currency</option>
          </select>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium">Quantity</label>
          <input
            type="number"
            value={quantity}
            onChange={e => setQuantity(parseFloat(e.target.value))}
            className="mt-1 block w-full border rounded p-2"
          />
        </div>

        {/* Purchase Value */}
        <div>
          <label className="block text-sm font-medium">Purchase Value</label>
          <input
            type="number"
            value={purchaseValue}
            onChange={e => setPurchaseValue(parseFloat(e.target.value))}
            className="mt-1 block w-full border rounded p-2"
          />
        </div>

        {/* Gold-specific */}
        {assetType === AssetType.GOLD && (
          <div>
            <label className="block text-sm font-medium">Unit</label>
            <select
              value={unit}
              onChange={e => setUnit(e.target.value as GoldUnit)}
              className="mt-1 block w-full border rounded p-2"
            >
              <option value={GoldUnit.GRAM}>Gram</option>
              <option value={GoldUnit.TOLA}>Tola</option>
              <option value={GoldUnit.OUNCE}>Ounce</option>
            </select>
          </div>
        )}

        {/* Stock-specific */}
        {assetType === AssetType.STOCK && (
          <>
            <div>
              <label className="block text-sm font-medium">Ticker</label>
              <input
                type="text"
                value={ticker}
                onChange={e => setTicker(e.target.value)}
                className="mt-1 block w-full border rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Company Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="mt-1 block w-full border rounded p-2"
              />
            </div>
          </>
        )}

        {/* Currency-specific */}
        {assetType === AssetType.CURRENCY && (
          <>
            <div>
              <label className="block text-sm font-medium">Currency Code</label>
              <input
                type="text"
                value={currencyCode}
                onChange={e => setCurrencyCode(e.target.value)}
                className="mt-1 block w-full border rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Currency Name</label>
              <input
                type="text"
                value={currencyName}
                onChange={e => setCurrencyName(e.target.value)}
                className="mt-1 block w-full border rounded p-2"
              />
            </div>
          </>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full p-2 rounded text-white ${
            isSubmitting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isSubmitting ? "Adding…" : "Add Asset"}
        </button>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </form>

      {/* Asset List */}
      {isLoadingAssets ? (
        <p>Loading assets…</p>
      ) : (
        <ul className="space-y-2">
          {assets.map(a => (
            <li
              key={a.asset_id}
              className="border rounded p-4 flex justify-between items-center"
            >
              <div>
                <p className="font-medium">{a.asset_type}</p>
                {a.asset_details.name && (
                  <p className="text-sm">Name: {a.asset_details.name}</p>
                )}
                <p className="text-sm">Quantity: {a.quantity}</p>
                <p className="text-sm">Purchased: {a.purchase_value}</p>
                <p className="text-sm">Current: {a.current_value}</p>
              </div>
              <div className="text-xs text-gray-500">
                {new Date(a.acquired_on).toLocaleDateString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default AssetsPage
