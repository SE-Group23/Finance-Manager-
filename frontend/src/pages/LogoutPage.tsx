"use client"

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAppDispatch } from "../hooks"
import { logout } from "../store/slices/authSlice"

const LogoutPage = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  useEffect(() => {
    const performLogout = async () => {
      console.log("Logging out...")
      await dispatch(logout())
      navigate("/login", { replace: true })
    }

    performLogout()
  }, [navigate, dispatch])

  return null
}

export default LogoutPage
