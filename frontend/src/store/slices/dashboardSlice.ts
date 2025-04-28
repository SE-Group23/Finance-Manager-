import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { fetchDashboardData, type DashboardData } from "../../services/dashboardService"

interface DashboardState {
  data: DashboardData | null
  loading: boolean
  error: string | null
  currentMonth: string
}

const initialState: DashboardState = {
  data: null,
  loading: true,
  error: null,
  currentMonth: new Date().toLocaleString("default", { month: "long", year: "numeric" }),
}

export const getDashboardData = createAsyncThunk("dashboard/getData", async (_, { rejectWithValue }) => {
  try {
    const data = await fetchDashboardData()
    return data
  } catch (error) {
    return rejectWithValue("Failed to fetch dashboard data. Please try again later.")
  }
})

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setCurrentMonth: (state, action) => {
      state.currentMonth = action.payload
    },
    clearDashboardError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getDashboardData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getDashboardData.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(getDashboardData.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { setCurrentMonth, clearDashboardError } = dashboardSlice.actions
export default dashboardSlice.reducer
