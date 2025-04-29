import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { fetchZakatAndTaxSummary } from "../../services/zakatTaxService"

interface ZakatSummary {
  nisaab_status: {
    status: string
    based_on: string
  }
  current_assets: number
  cash_savings: number
  total_assets: number
  asset_breakdown: {
    gold: number
    currency: number
    stocks: number
  }
  nisaab_threshold: number
  zakat_rate: number
  zakat_payable: number
}

interface TaxSummary {
  threshold_status: {
    status: string
    based_on: string
  }
  annual_income: number
  tax_bracket: string
  tax_rate: number
  tax_payable: number
  due_date: {
    date: string
    days_remaining: number
  }
}

interface ZakatTaxState {
  zakat: ZakatSummary
  tax: TaxSummary
  loading: boolean
  error: string | null
  hasZakatData: boolean
  hasTaxData: boolean
}

const emptyZakat: ZakatSummary = {
  nisaab_status: {
    status: "Loading...",
    based_on: "Loading...",
  },
  current_assets: 0,
  cash_savings: 0,
  total_assets: 0,
  asset_breakdown: {
    gold: 0,
    currency: 0,
    stocks: 0,
  },
  nisaab_threshold: 0,
  zakat_rate: 0,
  zakat_payable: 0,
}

const emptyTax: TaxSummary = {
  threshold_status: {
    status: "Loading...",
    based_on: "Loading...",
  },
  annual_income: 0,
  tax_bracket: "Loading...",
  tax_rate: 0,
  tax_payable: 0,
  due_date: {
    date: "Loading...",
    days_remaining: 0,
  },
}

const initialState: ZakatTaxState = {
  zakat: emptyZakat,
  tax: emptyTax,
  loading: true,
  error: null,
  hasZakatData: true,
  hasTaxData: true,
}

export const fetchZakatTaxData = createAsyncThunk("zakatTax/fetchData", async (_, { rejectWithValue }) => {
  try {
    const response = await fetchZakatAndTaxSummary()
    return response
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch Zakat and Tax data")
  }
})

const zakatTaxSlice = createSlice({
  name: "zakatTax",
  initialState,
  reducers: {
    clearZakatTaxError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchZakatTaxData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchZakatTaxData.fulfilled, (state, action) => {
        state.loading = false

        if (action.payload && action.payload.zakat && action.payload.tax) {
          const zakatData = action.payload.zakat
          const hasAssets =
            zakatData.current_assets > 0 ||
            zakatData.cash_savings > 0 ||
            zakatData.total_assets > 0 ||
            Object.values(zakatData.asset_breakdown).some((value) => (value as number) > 0)

          state.hasZakatData = hasAssets

          if (!hasAssets) {
            zakatData.nisaab_status = {
              status: "Nisaab Threshold Not Met",
              based_on: "no assets added",
            }
            zakatData.zakat_payable = 0
          }

          state.zakat = zakatData

          const taxData = action.payload.tax
          const hasIncome = taxData.annual_income > 0

          state.hasTaxData = hasIncome

          if (!hasIncome) {
            taxData.threshold_status = {
              status: "Tax Threshold Not Met",
              based_on: "no income added",
            }
            taxData.tax_payable = 0
          }

          state.tax = taxData
        } else {
          state.error = "API response missing expected data structure"
        }
      })
      .addCase(fetchZakatTaxData.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearZakatTaxError } = zakatTaxSlice.actions
export default zakatTaxSlice.reducer
