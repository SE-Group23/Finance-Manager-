"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Eye, EyeOff } from "lucide-react"
import { useAppDispatch, useAppSelector } from "../hooks"
import { register, clearError } from "../store/slices/authSlice"

const SignUpForm: React.FC = () => {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const dispatch = useAppDispatch()
  const { loading: isLoading, error } = useAppSelector((state) => state.auth)

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(clearError())

    const resultAction = await dispatch(register({ username, email, password }))

    if (register.fulfilled.match(resultAction)) {
      navigate("/dashboard")
    }
  }

  return (
    <div className="w-full max-w-md px-8">
      <h1 className="text-5xl font-bold mb-12">Sign Up To TBD</h1>

      {error && <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="username" className="block text-sm font-medium mb-1">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="tobedecided"
            className="w-full p-3 bg-yellow-50 border-b border-gray-300 focus:outline-none focus:border-green-500"
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="group23@email.com"
            className="w-full p-3 bg-yellow-50 border-b border-gray-300 focus:outline-none focus:border-green-500"
            required
          />
        </div>

        <div className="mb-10 relative">
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="**************"
            className="w-full p-3 bg-yellow-50 border-b border-gray-300 focus:outline-none focus:border-green-500"
            required
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-9 text-gray-400 focus:outline-none"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-medium rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? "Signing up..." : "Sign Up"}
        </button>

        <div className="text-center mt-6 text-gray-600">
          Already have an account?
          <a href="/login" className="ml-1 font-medium text-gray-900 hover:underline">
            Login
          </a>
        </div>
      </form>
    </div>
  )
}

export default SignUpForm
