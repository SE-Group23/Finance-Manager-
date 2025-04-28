import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import {
  getUserAssets,
  getPortfolioSummary,
  getGoldHistory,
  getStockHistory,
  refreshAssetValues,
  createAsset,
  updateAsset,
  deleteAsset,
} from "../../services/assetService"
import type { Asset, PortfolioSummary } from "../../types/asset"

interface AssetState {
  assets: Asset[]
  summary: PortfolioSummary | null
  goldHistory: any[]
  stockHistory: any[]
  selectedStock: string
  loading: boolean
  formLoading: boolean
  error: string | null
  showAddForm: boolean
  selectedAssetType: string | null
  editingAsset: Asset | null
  detailsModalType: string | null
}

const initialState: AssetState = {
  assets: [],
  summary: null,
  goldHistory: [],
  stockHistory: [],
  selectedStock: "",
  loading: true,
  formLoading: false,
  error: null,
  showAddForm: false,
  selectedAssetType: null,
  editingAsset: null,
  detailsModalType: null,
}

export const fetchAssets = createAsyncThunk("assets/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const assets = await getUserAssets()
    return assets
  } catch (error) {
    return rejectWithValue("Failed to fetch assets. Please try again later.")
  }
})

export const fetchPortfolioSummary = createAsyncThunk("assets/fetchSummary", async (_, { rejectWithValue }) => {
  try {
    const summary = await getPortfolioSummary()
    return summary
  } catch (error) {
    return rejectWithValue("Failed to fetch portfolio summary. Please try again later.")
  }
})

export const fetchGoldHistory = createAsyncThunk("assets/fetchGoldHistory", async (_, { rejectWithValue }) => {
  try {
    const history = await getGoldHistory()
    return history
  } catch (error) {
    return rejectWithValue("Failed to fetch gold price history. Please try again later.")
  }
})

export const fetchStockHistory = createAsyncThunk(
  "assets/fetchStockHistory",
  async (
    { ticker, from, to, timespan = "day" }: { ticker: string; from: string; to: string; timespan?: string },
    { rejectWithValue },
  ) => {
    try {
      const history = await getStockHistory(ticker, from, to, timespan)
      return { ticker, history }
    } catch (error) {
      return rejectWithValue(`Failed to fetch stock history for ${ticker}. Please try again later.`)
    }
  },
)

export const refreshAssets = createAsyncThunk("assets/refresh", async (_, { rejectWithValue, dispatch }) => {
  try {
    const refreshedAssets = await refreshAssetValues()
    dispatch(fetchPortfolioSummary())
    return refreshedAssets
  } catch (error) {
    return rejectWithValue("Failed to refresh asset values. Please try again later.")
  }
})

export const addAsset = createAsyncThunk("assets/add", async (assetData: any, { rejectWithValue, dispatch }) => {
  try {
    const newAsset = await createAsset(assetData)
    dispatch(fetchPortfolioSummary())
    return newAsset
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || "Failed to create asset. Please try again.")
  }
})

export const editAsset = createAsyncThunk(
  "assets/edit",
  async ({ assetId, assetData }: { assetId: string; assetData: any }, { rejectWithValue, dispatch }) => {
    try {
      const updatedAsset = await updateAsset(Number(assetId), assetData)
      dispatch(fetchPortfolioSummary())
      return updatedAsset
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to update asset. Please try again.")
    }
  },
)

export const removeAsset = createAsyncThunk("assets/remove", async (assetId: number, { rejectWithValue, dispatch }) => {
  try {
    await deleteAsset(assetId)
    dispatch(fetchPortfolioSummary())
    return assetId
  } catch (error) {
    return rejectWithValue("Failed to delete asset. Please try again.")
  }
})

export const fetchAllAssetData = createAsyncThunk(
  "assets/fetchAllData",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(fetchAssets())
      dispatch(fetchPortfolioSummary())

      const assetsResult = await dispatch(fetchAssets()).unwrap()

      if (assetsResult.some((a: Asset) => a.asset_type.toUpperCase() === "GOLD")) {
        dispatch(fetchGoldHistory())
      }

      const stockAssets = assetsResult.filter((a: Asset) => a.asset_type.toUpperCase() === "STOCK")
      if (stockAssets.length > 0) {
        const ticker = stockAssets[0].asset_details?.ticker

        const today = new Date()
        const oneMonthAgo = new Date()
        oneMonthAgo.setMonth(today.getMonth() - 1)
        const from = oneMonthAgo.toISOString().split("T")[0]
        const to = today.toISOString().split("T")[0]

        if (ticker) {
            dispatch(fetchStockHistory({ ticker, from, to }))
          }
      }

      return true
    } catch (error) {
      return rejectWithValue("Failed to fetch asset data. Please try again later.")
    }
  },
)

const assetSlice = createSlice({
  name: "assets",
  initialState,
  reducers: {
    setShowAddForm: (state, action) => {
      state.showAddForm = action.payload
      if (!action.payload) {
        state.selectedAssetType = null
      }
    },
    setSelectedAssetType: (state, action) => {
      state.selectedAssetType = action.payload
      state.showAddForm = false
    },
    setEditingAsset: (state, action) => {
      state.editingAsset = action.payload
      state.selectedAssetType = action.payload?.asset_type?.toUpperCase() || null
      state.detailsModalType = null
    },
    setDetailsModalType: (state, action) => {
      state.detailsModalType = action.payload
    },
    clearAssetError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssets.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAssets.fulfilled, (state, action) => {
        state.assets = action.payload
        state.loading = false
      })
      .addCase(fetchAssets.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      .addCase(fetchPortfolioSummary.fulfilled, (state, action) => {
        state.summary = action.payload
      })

      .addCase(fetchGoldHistory.fulfilled, (state, action) => {
        state.goldHistory = action.payload
      })

      .addCase(fetchStockHistory.fulfilled, (state, action) => {
        state.stockHistory = action.payload.history
        state.selectedStock = action.payload.ticker
      })

      .addCase(refreshAssets.pending, (state) => {
        state.loading = true
      })
      .addCase(refreshAssets.fulfilled, (state, action) => {
        state.assets = action.payload
        state.loading = false
      })
      .addCase(refreshAssets.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      .addCase(addAsset.pending, (state) => {
        state.formLoading = true
        state.error = null
      })
      .addCase(addAsset.fulfilled, (state) => {
        state.formLoading = false
        state.selectedAssetType = null
      })
      .addCase(addAsset.rejected, (state, action) => {
        state.formLoading = false
        state.error = action.payload as string
      })

      .addCase(editAsset.pending, (state) => {
        state.formLoading = true
        state.error = null
      })
      .addCase(editAsset.fulfilled, (state) => {
        state.formLoading = false
        state.selectedAssetType = null
        state.editingAsset = null
      })
      .addCase(editAsset.rejected, (state, action) => {
        state.formLoading = false
        state.error = action.payload as string
      })

      .addCase(removeAsset.fulfilled, (state, action) => {
        state.assets = state.assets.filter((asset) => asset.asset_id !== action.payload)
      })
  },
})

export const { setShowAddForm, setSelectedAssetType, setEditingAsset, setDetailsModalType, clearAssetError } =
  assetSlice.actions
export default assetSlice.reducer
