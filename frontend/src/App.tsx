import type React from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { Provider } from "react-redux"
import { store } from "./store"
import SignUpPage from "./pages/SignUpPage"
import LoginPage from "./pages/LoginPage"
import DashboardPage from "./pages/DashboardPage"
import TransactionsPage from "./pages/TransactionsPage"
import BudgetPage from "./pages/BudgetPage"
import AboutUsPage from "./pages/AboutUsPage"
import ContactPage from "./pages/ContactPage"
import ChatbotPage from "./pages/ChatbotPage"
import LandingPage from "./pages/LandingPage"
import ProtectedRoute from "./components/ProtectedRoute"
import LogoutPage from "./pages/LogoutPage"
import ZakatTaxPage from "./pages/ZakatTaxPage"

import RecurringCalendarPage from "./pages/RecurringCalendarPage"
import AssetsPage from "./pages/AssetPage"
import ForgetPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/logout" element={<LogoutPage />} />
          <Route path="/forgot-password" element={<ForgetPassword />} />
          <Route path="/reset-password/:userId/:token" element={<ResetPassword />} />

          <Route
            path="/assets"
            element={
              <ProtectedRoute>
                <AssetsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <TransactionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/budget"
            element={
              <ProtectedRoute>
                <BudgetPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chatbot"
            element={
              <ProtectedRoute>
                <ChatbotPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/zakat-tax"
            element={
              <ProtectedRoute>
                <ZakatTaxPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <RecurringCalendarPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </Provider>
  )
}

export default App
