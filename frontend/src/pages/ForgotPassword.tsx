"use client"

import type React from "react"
import { useState } from "react"
import developerImage from "../assets/developer-image.svg"
import { useAppDispatch, useAppSelector } from "../hooks"
import { forgotPassword } from "../store/slices/authSlice"

const ForgetPassword: React.FC = () => {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")

  const dispatch = useAppDispatch()
  const { loading } = useAppSelector((state) => state.auth)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const resultAction = await dispatch(forgotPassword(email))

    if (forgotPassword.fulfilled.match(resultAction)) {
      setMessage(resultAction.payload)
    } else if (forgotPassword.rejected.match(resultAction)) {
      setMessage(resultAction.payload as string)
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Left side with illustration */}
      <div className="w-1/2 flex flex-col h-full">
        <div className="flex-1 bg-gradient-to-b from-teal-900 to-teal-600 flex items-center justify-center">
          <div className="flex justify-center items-center w-full h-full p-5">
            <img
              src={developerImage || "/placeholder.svg"}
              alt="Developer illustration"
              className="max-w-full max-h-80 object-contain"
            />
          </div>
        </div>
      </div>

      {/* Right side with forgot password form */}
      <div className="w-1/2 bg-gray-50 flex items-center justify-center h-full">
        <div className="w-full max-w-md px-8">
          <h1 className="text-5xl font-bold mb-12">Forgot Password</h1>
          <p className="text-gray-600 mb-8">
            Enter your email address below and we'll send you a link to reset your password.
          </p>

          {message && (
            <div
              className={`p-3 rounded-md mb-4 ${
                message.includes("Failed") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-10">
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full p-3 bg-yellow-50 border-b border-gray-300 focus:outline-none focus:border-green-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-medium rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <div className="text-center mt-6 text-gray-600">
              Remember your password?
              <a href="/login" className="ml-1 font-medium text-gray-900 hover:underline">
                Back to Login
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ForgetPassword
