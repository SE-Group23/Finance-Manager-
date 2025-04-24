// frontend/src/services/authService.ts
import axios from "axios"

const API_URL = `${import.meta.env.VITE_API_HOST}:${import.meta.env.VITE_API_PORT}/api/auth`

// Set up axios interceptor to add the token to all requests
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

  // Store token and user ID in localStorage
  if (response.data.token) {
    localStorage.setItem("token", response.data.token)
    localStorage.setItem("userId", response.data.userId.toString())
  }

  return response.data // returns { token, userId }
}

export async function loginUser(email: string, password: string) {
  const response = await axios.post(`${API_URL}/login`, { email, password })

  // Store token and user ID in localStorage
  if (response.data.token) {
    localStorage.setItem("token", response.data.token)
    localStorage.setItem("userId", response.data.userId.toString())
  }

  return response.data // returns { token, userId }
}

export async function logoutUser() {
  try {
    // Call the logout endpoint to invalidate the token on the server
    await axios.post(`${API_URL}/logout`)
  } catch (error) {
    console.error("Logout error:", error)
  } finally {
    // Clear local storage regardless of server response
    localStorage.removeItem("token")
    localStorage.removeItem("userId")
  }
}

export function isAuthenticated() {
  const token = localStorage.getItem("token")
  return !!token // Returns true if token exists
}

export function getCurrentUserId() {
  return localStorage.getItem("userId")
}

export function getAuthToken() {
  return localStorage.getItem("token")
}

// Function to check if token is expired (if your JWT includes an expiration)
export function isTokenExpired() {
  const token = localStorage.getItem("token")
  if (!token) return true

  try {
    // JWT tokens are in format: header.payload.signature
    const payload = token.split(".")[1]
    const decoded = JSON.parse(atob(payload))

    // Check if token has expired
    return decoded.exp < Date.now() / 1000
  } catch (error) {
    return true // If there's an error parsing, assume token is invalid
  }
}
