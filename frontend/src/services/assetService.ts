import axios from "axios"
import type { Asset, PortfolioSummary } from "../../frontend/src/types/asset"

const API_URL = "http://localhost:5000/api"

// Get all assets for the user
export const getUserAssets = async (): Promise<Asset[]> => {
  const response = await axios.get(`${API_URL}/assets`)
  return response.data
}

// Get portfolio summary
export const getPortfolioSummary = async (): Promise<PortfolioSummary> => {
  const response = await axios.get(`${API_URL}/assets/summary`)
  return response.data
}

// Create a new asset
export const createAsset = async (assetData: any): Promise<Asset> => {
  const response = await axios.post(`${API_URL}/assets`, assetData)
  return response.data
}

// Update an existing asset
export const updateAsset = async (assetId: number, assetData: any): Promise<Asset> => {
  const response = await axios.put(`${API_URL}/assets/${assetId}`, assetData)
  return response.data
}

// Delete an asset
export const deleteAsset = async (assetId: number): Promise<void> => {
  await axios.delete(`${API_URL}/assets/${assetId}`)
}

// Refresh asset values
export const refreshAssetValues = async (): Promise<Asset[]> => {
  const response = await axios.post(`${API_URL}/assets/refresh`)
  return response.data
}

// Get gold price history
export const getGoldHistory = async (): Promise<any[]> => {
  const response = await axios.get(`${API_URL}/assets/history/gold`)
  return response.data
}

// Get stock price history
export const getStockHistory = async (ticker: string, from: string, to: string, timespan?: string): Promise<any[]> => {
  const params = new URLSearchParams()
  if (from) params.append("from", from)
  if (to) params.append("to", to)
  if (timespan) params.append("timespan", timespan)

  const response = await axios.get(`${API_URL}/assets/history/stock/${ticker}?${params.toString()}`)
  return response.data
}

// Get currency exchange rates (this endpoint doesn't exist yet in the backend)
export const getCurrencyRates = async (baseCurrency: string): Promise<any> => {
  // This is a placeholder for the future currency endpoint
  // You mentioned you'll implement this backend later
  const response = await axios.get(`${API_URL}/assets/currency/rates?base=${baseCurrency}`)
  return response.data
}
