//Asset Form

"use client"

import type React from "react"
import { useState } from "react"
import { createAsset, updateAsset } from "../../services/assetService"
import { AssetType, Currency, GoldUnit } from "../../types/asset"

interface AssetFormProps {
  assetType: string
  asset?: any
  onClose: () => void
  onSubmitStart?: () => void
  onSubmitEnd?: () => void
}

const AssetForm: React.FC<AssetFormProps> = ({ assetType, asset, onClose, onSubmitStart, onSubmitEnd }) => {
  const [formData, setFormData] = useState({
    quantity: asset?.quantity || 0,
    purchaseValue: asset?.purchase_value || 0,
    acquiredOn: asset?.acquired_on
      ? new Date(asset.acquired_on).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    unit: asset?.asset_details?.unit || GoldUnit.GRAM,
    ticker: asset?.asset_details?.ticker || "",
    name: asset?.asset_details?.name || "",
    currency: asset?.asset_details?.currency || Currency.PKR,
    currencyCode: asset?.asset_details?.currencyCode || Currency.USD,
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "quantity" || name === "purchaseValue" ? Number(value) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    onSubmitStart?.();
  
    try {
      // Create a payload that exactly matches what the backend expects
      let assetData: any = {
        assetType: assetType.toLowerCase(),
        quantity: Number(formData.quantity),
        purchaseValue: Number(formData.purchaseValue),
        acquiredOn: formData.acquiredOn,
        assetDetails: {}
      };

      
      
      // Set the appropriate asset details based on asset type
      if (assetType === "GOLD") {
        assetData.assetDetails = {
          unit: "tola",
          currency: "PKR"
        };

        const quantity = formData.unit === GoldUnit.GRAM
          ? formData.quantity / 11.6638
          : formData.quantity;

          assetData.quantity = quantity;

      } else if (assetType === "STOCK") {
        assetData.assetDetails = {
          ticker: formData.ticker,
          name: formData.name
        };
      } else if (assetType === "CURRENCY") {
        assetData.assetDetails = {
          currencyCode: formData.currencyCode, // <-- explicitly use currency_code
          name: formData.name
        };
      }
      
  
      console.log("Submitting asset data:", JSON.stringify(assetData));
  
      if (asset) {
        await updateAsset(asset.asset_id, assetData);
      } else {
        await createAsset(assetData);
      }
  
      onClose();
      window.location.reload();
    } catch (err: any) {
      console.error("Error saving asset:", err);
      if (err.response) {
        console.error("Error response data:", err.response.data);
        console.error("Error response status:", err.response.status);
        console.error("Error response headers:", err.response.headers);
      }
      setError(err.response?.data?.error || "Failed to save asset. Please try again.");
    } finally {
      setLoading(false);
      onSubmitEnd?.();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="text-white">
      <h3 className="text-lg font-semibold mb-4">
        {asset ? "Edit" : "Add"} {assetType}
      </h3>

      {error && <div className="mb-4 p-2 bg-red-100 text-red-800 rounded">{error}</div>}

      {/* Common fields for all asset types */}

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Acquisition Date</label>
        <input
          type="date"
          name="acquiredOn"
          value={formData.acquiredOn}
          onChange={handleChange}
          className="w-full p-2 border rounded-md text-gray-800 bg-white"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Purchase Value</label>
        <input
          type="number"
          name="purchaseValue"
          value={formData.purchaseValue}
          onChange={handleChange}
          className="w-full p-2 border rounded-md text-gray-800 bg-white"
          step="0.01"
          min="0"
          required
        />
      </div>

      {/* Gold-specific fields */}
      {assetType === "GOLD" && (
        <>
        <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Currency of Purchase</label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className="w-full p-2 border rounded-md text-gray-800 bg-white"
              required
            >
              <option value={Currency.USD}>USD</option>
              <option value={Currency.PKR}>PKR</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Unit</label>
            <select
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              className="w-full p-2 border rounded-md text-gray-800 bg-white"
              required
            >
              <option value={GoldUnit.TOLA}>Tola</option>
              <option value={GoldUnit.GRAM}>Gram</option>
              
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Quantity</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="w-full p-2 border rounded-md text-gray-800 bg-white"
              step="0.01"
              min="0"
              required
            />
          </div>
        </>
      )}

      {/* Stock-specific fields */}
      {assetType === "STOCK" && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Ticker Symbol</label>
            <input
              type="text"
              name="ticker"
              value={formData.ticker}
              onChange={handleChange}
              className="w-full p-2 border rounded-md text-gray-800 bg-white"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Company Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border rounded-md text-gray-800 bg-white"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Quantity (Shares)</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="w-full p-2 border rounded-md text-gray-800 bg-white"
              min="0"
              required
            />
          </div>
        </>
      )}

      {/* Currency-specific fields */}
      {assetType === "CURRENCY" && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Currency</label>
            <select
              name="currencyCode"
              value={formData.currencyCode}
              onChange={handleChange}
              className="w-full p-2 border rounded-md text-gray-800 bg-white"
              required
            >
              <option value={Currency.USD}>USD</option>
              <option value={Currency.EUR}>EUR</option>
              <option value={Currency.GBP}>GBP</option>
              <option value={Currency.PKR}>PKR</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Amount</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="w-full p-2 border rounded-md text-gray-800 bg-white"
              step="0.01"
              min="0"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Name/Description</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border rounded-md text-gray-800 bg-white"
            />
          </div>
        </>
      )}

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-white rounded-lg text-white hover:bg-dark"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-secondary text-dark rounded-lg hover:bg-secondary-dark font-medium"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  )
}

export default AssetForm