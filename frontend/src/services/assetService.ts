import axios from "axios"
import type { Asset, PortfolioSummary } from "../constants/asset_types"

const API_URL = `${import.meta.env.VITE_API_HOST}/api/assets`

console.log("Asset API URL:", `${import.meta.env.VITE_API_HOST}:${import.meta.env.VITE_API_PORT}/api/assets`);

export const getUserAssets = async (): Promise<Asset[]> => {
  const token = localStorage.getItem("token")
  const response = await axios.get(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

export const getPortfolioSummary = async (): Promise<PortfolioSummary> => {
  const token = localStorage.getItem("token")
  const response = await axios.get(`${API_URL}/summary`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

export const createAsset = async (assetData: any): Promise<Asset> => {
  const token = localStorage.getItem("token")
  const response = await axios.post(API_URL, assetData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

export const updateAsset = async (assetId: number, assetData: any): Promise<Asset> => {
  const token = localStorage.getItem("token")
  const response = await axios.put(`${API_URL}/${assetId}`, assetData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

export const deleteAsset = async (assetId: number): Promise<void> => {
  const token = localStorage.getItem("token")
  await axios.delete(`${API_URL}/${assetId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export const refreshAssetValues = async (): Promise<Asset[]> => {
  const token = localStorage.getItem("token")
  const response = await axios.post(`${API_URL}/refresh`, {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

export const getGoldHistory = async (): Promise<any[]> => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/history/gold`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Gold history fetch error:", error);
    return [];
  }
};

export const getStockHistory = async (ticker: string, from: string, to: string, timespan = "day"): Promise<any[]> => {
  try {
    const token = localStorage.getItem("token")
    const params = new URLSearchParams()
    if (from) params.append("from", from)
    if (to) params.append("to", to)
    if (timespan) params.append("timespan", timespan)

    const response = await axios.get(`${API_URL}/history/stock/${ticker}?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  } catch (error) {
    console.error(`Stock history fetch error for ${ticker}:`, error)
    return []
  }
}

export const getCurrencyRates = async (baseCurrency: string): Promise<any> => {
  try {
    const token = localStorage.getItem("token")
    const response = await axios.get(`${API_URL}/currency/rates?base=${baseCurrency}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  } catch (error) {
    console.error("Currency rates fetch error:", error)
    return {}
  }
}