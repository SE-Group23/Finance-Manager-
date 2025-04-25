import axios from "axios"

const API_URL = `${import.meta.env.VITE_API_HOST}:${import.meta.env.VITE_API_PORT}/api/auth`

axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

export async function registerUser(fullName: string, email: string, password: string) {
  const response = await axios.post(`${API_URL}/register`, { fullName, email, password })

  if (response.data.token) {
    localStorage.setItem("token", response.data.token)
    localStorage.setItem("userId", response.data.userId.toString())
  }

  return response.data 
}

export async function loginUser(email: string, password: string) {
  const response = await axios.post(`${API_URL}/login`, { email, password })

  if (response.data.token) {
    localStorage.setItem("token", response.data.token)
    localStorage.setItem("userId", response.data.userId.toString())
  }

  return response.data
}

export async function logoutUser() {
  try {
    await axios.post(`${API_URL}/logout`)
  } catch (error) {
    console.error("Logout error:", error)
  } finally {
    localStorage.removeItem("token")
    localStorage.removeItem("userId")
  }
}

export function isAuthenticated() {
  const token = localStorage.getItem("token")
  return !!token 
}

export function getCurrentUserId() {
  return localStorage.getItem("userId")
}

export function getAuthToken() {
  return localStorage.getItem("token")
}

export function isTokenExpired() {
  const token = localStorage.getItem("token")
  if (!token) return true

  try {

    const payload = token.split(".")[1]
    const decoded = JSON.parse(atob(payload))

    return decoded.exp < Date.now() / 1000
  } catch (error) {
    return true 
  }
}
