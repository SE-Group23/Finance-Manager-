// "use client"

// // frontend/src/pages/LogoutPage.tsx
// import type React from "react"
// import { useEffect } from "react"
// import { Navigate } from "react-router-dom"
// import { useAuth } from "../contexts/AuthContext"

// const LogoutPage: React.FC = () => {
//   const { logout } = useAuth()

//   useEffect(() => {
//     const performLogout = async () => {
//       await logout()
//     }

//     performLogout()
//   }, [logout])

//   return <Navigate to="/login" replace />
// }

// export default LogoutPage
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { logoutUser } from "../services/authService"

const LogoutPage = () => {
  const navigate = useNavigate()

  useEffect(() => {
    logoutUser() // Correct function!
    console.log("Logging out...")
    navigate("/login", { replace: true })
  }, [navigate])

  return null
}

export default LogoutPage
