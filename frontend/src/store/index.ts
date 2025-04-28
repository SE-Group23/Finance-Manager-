import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./slices/authSlice"
import dashboardReducer from "./slices/dashboardSlice"
import transactionReducer from "./slices/transactionSlice"
import budgetReducer from "./slices/budgetSlice"
import assetReducer from "./slices/assetSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    transactions: transactionReducer,
    budgets: budgetReducer,
    assets: assetReducer,
  },
  // This will allow us to add more reducers later for other components
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
