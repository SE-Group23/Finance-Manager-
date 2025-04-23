// src/services/assetService.ts
import axios from "axios"
import { AssetType, GoldUnit } from "../constants/assets"

const API_URL = `${import.meta.env.VITE_API_HOST}:${import.meta.env.VITE_API_PORT}/api/assets`

export interface AssetDetails {
  /** Only for GOLD */
  unit?: GoldUnit
  /** Only for STOCK */
  ticker?: string
  /** Company name (for STOCK) or Currency name (for CURRENCY) */
  name?: string
  /** Only for CURRENCY */
  currencyCode?: string
}

export async function getAssets() {
  const token = localStorage.getItem("token")
  const res = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return Array.isArray(res.data) ? res.data : res.data.assets
}

export async function createAsset(
  assetType: AssetType,
  quantity: number,
  purchaseValue: number,
  assetDetails: Record<string, any>
) {
  const token = localStorage.getItem("token")
  return axios.post(
    API_URL,
    { assetType, quantity, purchaseValue, assetDetails },
    { headers: { Authorization: `Bearer ${token}` } }
  )
}
