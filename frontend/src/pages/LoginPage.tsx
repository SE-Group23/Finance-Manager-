"use client"

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import developerImage from "../assets/developer-image.svg";
import { Eye, EyeOff } from "lucide-react";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const data = await loginUser(email, password);
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

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
          <h1 className="text-5xl font-bold mb-12">Welcome Back</h1>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
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

            <div className="mb-6 relative">
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

            <div className="flex justify-end mb-6">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-green-600 hover:text-green-800 hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-medium rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? "Logging in..." : "Log In"}
            </button>

            <div className="text-center mt-6 text-gray-600">
              Don't have an account?
              <a href="/signup" className="ml-1 font-medium text-gray-900 hover:underline">
                Sign Up
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;