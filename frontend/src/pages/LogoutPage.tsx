import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { logoutUser } from "../services/authService"

const LogoutPage = () => {
  const navigate = useNavigate()

  useEffect(() => {
    logoutUser()
    console.log("Logging out...")
    navigate("/login", { replace: true })
  }, [navigate])

  return null
}

export default LogoutPage
