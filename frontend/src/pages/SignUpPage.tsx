"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { registerUser } from "../services/authService"
import { Eye, EyeOff } from "lucide-react"

const SignUpPage: React.FC = () => {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const data = await registerUser(username, email, password)

      // Store token and user ID in localStorage
      localStorage.setItem("token", data.token)
      localStorage.setItem("userId", data.userId)

      // Redirect to dashboard
      navigate("/dashboard")
    } catch (err) {
      console.error("Registration error:", err)
      setError("Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Left side with illustration */}
      <div className="w-1/2 flex flex-col h-full">
        {/* Navigation */}
        {/* <div className="flex items-center h-16 px-8 bg-teal-900">
          <a href="#" className="text-white no-underline text-sm mr-8 hover:text-teal-200 transition-colors">
            Explore
          </a>
          <a href="#" className="text-white no-underline text-sm mr-8 hover:text-teal-200 transition-colors">
            About Us
          </a>
          <a href="#" className="text-white no-underline text-sm hover:text-teal-200 transition-colors">
            Contact
          </a>
        </div> */}

        <div className="flex-1 bg-gradient-to-b from-teal-900 to-teal-600 flex items-center justify-center">
          <div className="flex justify-center items-center w-full h-full p-5">
            <img
              src="/src/assets/developer-image.png"
              alt="Developer illustration"
              className="max-w-full max-h-[80%] object-contain"
            />
          </div>
        </div>
      </div>

      {/* Right side with sign up form */}
      <div className="w-1/2 bg-gray-50 flex items-center justify-center h-full">
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
      </div>
    </div>
  )
}

export default SignUpPage
