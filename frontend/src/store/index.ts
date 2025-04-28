import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./slices/authSlice"
import dashboardReducer from "./slices/dashboardSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
  },
  // This will allow us to add more reducers later for other components
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
