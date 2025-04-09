// frontend/src/components/ProtectedRoute.tsx
import type React from "react"
import { Navigate } from "react-router-dom"
import { isAuthenticated, isTokenExpired } from "../services/authService"

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // Check if user is authenticated and token is not expired
  const isAuth = isAuthenticated() && !isTokenExpired()

  if (!isAuth) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
