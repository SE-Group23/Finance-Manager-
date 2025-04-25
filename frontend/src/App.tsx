// frontend/src/App.tsx
import type React from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
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
import { AuthProvider } from "./contexts/AuthContext"
import LogoutPage from "./pages/LogoutPage"
import ZakatTaxPage from "./pages/ZakatTaxPage" // ⬅️ Add this at the top


const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/logout" element={<LogoutPage />} />

          {/* Protected routes */}
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

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
