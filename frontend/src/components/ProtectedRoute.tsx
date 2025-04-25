import type React from "react"
import { Navigate } from "react-router-dom"
import { isAuthenticated, isTokenExpired } from "../services/authService"

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuth = isAuthenticated() && !isTokenExpired()

  if (!isAuth) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
