import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import {
  loginUser as loginUserService,
  registerUser as registerUserService,
  logoutUser as logoutUserService,
  isAuthenticated,
  isTokenExpired,
  getCurrentUserId,
} from "../../services/authService"

interface AuthState {
  isLoggedIn: boolean
  userId: string | null
  token: string | null
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  isLoggedIn: isAuthenticated() && !isTokenExpired(),
  userId: getCurrentUserId(),
  token: sessionStorage.getItem("token"),
  loading: false,
  error: null,
}

export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const data = await loginUserService(email, password)
      sessionStorage.setItem("token", data.token)
      sessionStorage.setItem("userId", data.userId)
      return data
    } catch (error) {
      return rejectWithValue("Invalid email or password.")
    }
  },
)

export const register = createAsyncThunk(
  "auth/register",
  async ({ username, email, password }: { username: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const data = await registerUserService(username, email, password)
      sessionStorage.setItem("token", data.token)
      sessionStorage.setItem("userId", data.userId)
      return data
    } catch (error) {
      return rejectWithValue("Registration failed. Please try again.")
    }
  },
)

export const logout = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
  try {
    await logoutUserService()
    sessionStorage.removeItem("token")
    sessionStorage.removeItem("userId")
    return null
  } catch (error) {
    return rejectWithValue("Logout failed.")
  }
})

export const forgotPassword = createAsyncThunk("auth/forgotPassword", async (email: string, { rejectWithValue }) => {
  try {
    const API_BASE_URL = `${import.meta.env.VITE_API_HOST}:${import.meta.env.VITE_API_PORT}`
    const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })

    const data = await res.json()
    return data.message || "Check your email for reset link."
  } catch (error) {
    return rejectWithValue("Failed to send reset email.")
  }
})

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (
    { userId, token, newPassword }: { userId: string; token: string; newPassword: string },
    { rejectWithValue },
  ) => {
    try {
      const API_BASE_URL = `${import.meta.env.VITE_API_HOST}:${import.meta.env.VITE_API_PORT}`
      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, token, newPassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        return rejectWithValue(data.message || "Failed to reset password")
      }

      return data.message || "Password reset successful!"
    } catch (error) {
      return rejectWithValue("An error occurred. Please try again.")
    }
  },
)

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    checkAuthStatus: (state) => {
      const authenticated = isAuthenticated() && !isTokenExpired()
      state.isLoggedIn = authenticated
      state.userId = authenticated ? getCurrentUserId() : null
      state.token = authenticated ? sessionStorage.getItem("token") : null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoggedIn = true
        state.userId = action.payload.userId
        state.token = action.payload.token
        state.loading = false
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoggedIn = true
        state.userId = action.payload.userId
        state.token = action.payload.token
        state.loading = false
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.isLoggedIn = false
        state.userId = null
        state.token = null
      })
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { checkAuthStatus, clearError } = authSlice.actions
export default authSlice.reducer
