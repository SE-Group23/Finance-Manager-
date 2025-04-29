import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./slices/authSlice"
import dashboardReducer from "./slices/dashboardSlice"
import transactionReducer from "./slices/transactionSlice"
import budgetReducer from "./slices/budgetSlice"
import assetReducer from "./slices/assetSlice"
import zakatTaxReducer from "./slices/zakatTaxSlice"
import chatbotReducer from "./slices/chatbotSlice"
import calendarReducer from "./slices/calendarSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    transactions: transactionReducer,
    budgets: budgetReducer,
    assets: assetReducer,
    zakatTax: zakatTaxReducer,
    chatbot: chatbotReducer,
    calendar: calendarReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
