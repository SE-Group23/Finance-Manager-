import React, { Suspense } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import LoadingScreen from "./LoadingScreen"

// Import your pages
// Use React.lazy for code splitting to improve performance
const DashboardPage = React.lazy(() => import("../pages/DashboardPage"))
const AssetsPage = React.lazy(() => import("../pages/AssetsPage"))
const TransactionsPage = React.lazy(() => import("../pages/TransactionsPage"))
const BudgetPage = React.lazy(() => import("../pages/BudgetPage"))
const CalendarPage = React.lazy(() => import("../pages/CalendarPage"))
const ZakatPage = React.lazy(() => import("../pages/ZakatPage"))
const ChatbotPage = React.lazy(() => import("../pages/ChatbotPage"))
const SettingsPage = React.lazy(() => import("../pages/SettingsPage"))
const LoginPage = React.lazy(() => import("../pages/LoginPage"))

const AppRouter: React.FC = () => {
  // Check if user is authenticated
  const isAuthenticated = localStorage.getItem("token") !== null

  return (
    <Router>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />} />

          {/* Protected routes */}
          <Route path="/dashboard" element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />} />
          <Route path="/assets" element={isAuthenticated ? <AssetsPage /> : <Navigate to="/login" />} />
          <Route path="/transactions" element={isAuthenticated ? <TransactionsPage /> : <Navigate to="/login" />} />
          <Route path="/budget" element={isAuthenticated ? <BudgetPage /> : <Navigate to="/login" />} />
          <Route path="/calendar" element={isAuthenticated ? <CalendarPage /> : <Navigate to="/login" />} />
          <Route path="/zakat" element={isAuthenticated ? <ZakatPage /> : <Navigate to="/login" />} />
          <Route path="/chatbot" element={isAuthenticated ? <ChatbotPage /> : <Navigate to="/login" />} />
          <Route path="/settings" element={isAuthenticated ? <SettingsPage /> : <Navigate to="/login" />} />

          {/* Default redirect */}
          <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
        </Routes>
      </Suspense>
    </Router>
  )
}

export default AppRouter
