"use client"

import type React from "react"
import { Navigate } from "react-router-dom"
import { useAppSelector } from "../hooks/useAppSelector"
import { useEffect } from "react"
import { useAppDispatch } from "../hooks/useAppDispatch"
import { checkAuthStatus } from "../store/slices/authSlice"

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isLoggedIn } = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()

  // Check auth status when component mounts to ensure it's up-to-date with sessionStorage
  useEffect(() => {
    dispatch(checkAuthStatus())
  }, [dispatch])

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
