"use client"

// frontend/src/contexts/AuthContext.tsx
import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { isAuthenticated, getCurrentUserId, logoutUser, isTokenExpired } from "../services/authService"

interface AuthContextType {
  isLoggedIn: boolean
  userId: string | null
  logout: () => Promise<void>
  checkAuthStatus: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
  const [userId, setUserId] = useState<string | null>(null)

  // Check authentication status on component mount
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = () => {
    const authenticated = isAuthenticated() && !isTokenExpired()
    setIsLoggedIn(authenticated)

    if (authenticated) {
      setUserId(getCurrentUserId())
    } else {
      setUserId(null)
    }
  }

  const logout = async () => {
    await logoutUser()
    setIsLoggedIn(false)
    setUserId(null)
  }

  const value = {
    isLoggedIn,
    userId,
    logout,
    checkAuthStatus,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
