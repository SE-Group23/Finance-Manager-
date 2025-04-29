"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import developerImage from "../assets/developer-image.svg"
import { Eye, EyeOff } from "lucide-react"
import { useAppDispatch, useAppSelector } from "../hooks"
import { resetPassword } from "../store/slices/authSlice"

const ResetPassword: React.FC = () => {
  const { userId, token } = useParams()
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const navigate = useNavigate()

  const dispatch = useAppDispatch()
  const { loading } = useAppSelector((state) => state.auth)

  const [validations, setValidations] = useState({
    length: false,
    capital: false,
    number: false,
  })

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  useEffect(() => {
    setValidations({
      length: newPassword.length >= 8,
      capital: /[A-Z]/.test(newPassword),
      number: /[0-9]/.test(newPassword),
    })

    const errors = []
    if (newPassword && !validations.length) errors.push("length")
    if (newPassword && !validations.capital) errors.push("capital")
    if (newPassword && !validations.number) errors.push("number")

    setValidationErrors(errors)
  }, [newPassword])

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (validationErrors.length > 0) {
      return
    }

    if (newPassword !== confirmPassword) {
      setMessage("Passwords don't match")
      return
    }

    if (!userId || !token) {
      setMessage("Invalid reset link")
      return
    }

    const resultAction = await dispatch(resetPassword({ userId, token, newPassword }))

    if (resetPassword.fulfilled.match(resultAction)) {
      setMessage(resultAction.payload)
      // Redirect to login after 2 seconds
      setTimeout(() => navigate("/login"), 2000)
    } else if (resetPassword.rejected.match(resultAction)) {
      setMessage(resultAction.payload as string)
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
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

      <div className="w-1/2 bg-gray-50 flex items-center justify-center h-full">
        <div className="w-full max-w-md px-8">
          <h1 className="text-5xl font-bold mb-12">Reset Password</h1>
          <p className="text-gray-600 mb-8">Please enter your new password below.</p>

          {message && (
            <div
              className={`p-3 rounded-md mb-4 ${
                message.includes("successful") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6 relative">
              <label htmlFor="newPassword" className="block text-sm font-medium mb-1">
                New Password
              </label>
              <input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={handlePasswordChange}
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

              <div className="mt-2 text-sm">
                <p className="font-medium text-gray-700 mb-1">Password must have:</p>
                <ul className="space-y-1 pl-5 list-disc">
                  <li
                    className={newPassword ? (validations.length ? "text-green-600" : "text-red-600") : "text-red-600"}
                  >
                    At least 8 characters
                  </li>
                  <li
                    className={newPassword ? (validations.capital ? "text-green-600" : "text-red-600") : "text-red-600"}
                  >
                    At least 1 capital letter
                  </li>
                  <li
                    className={newPassword ? (validations.number ? "text-green-600" : "text-red-600") : "text-red-600"}
                  >
                    At least 1 number
                  </li>
                </ul>
              </div>
            </div>

            <div className="mb-10 relative">
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="**************"
                className="w-full p-3 bg-yellow-50 border-b border-gray-300 focus:outline-none focus:border-green-500"
                required
              />
              {newPassword && confirmPassword && newPassword !== confirmPassword && (
                <p className="mt-1 text-sm text-red-600">Passwords don't match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || validationErrors.length > 0 || newPassword !== confirmPassword || !newPassword}
              className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-medium rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Resetting..." : "Reset Password"}
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

export default ResetPassword
