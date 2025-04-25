"use client"

import type React from "react"
import { useEffect } from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

const LogoutPage: React.FC = () => {
  const { logout } = useAuth()

  useEffect(() => {
    const performLogout = async () => {
      await logout()
    }

    performLogout()
  }, [logout])

  return <Navigate to="/login" replace />
}

export default LogoutPage
