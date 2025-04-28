"use client";

import type React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import { Eye, EyeOff } from "lucide-react";

const SignUpPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const [emailValid, setEmailValid] = useState(true);
  const [passwordValid, setPasswordValid] = useState(true);

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setEmailValid(validateEmail(newEmail));
  };

  const getPasswordStrength = (pwd: string): string => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;

    if (strength <= 1) return "Weak";
    if (strength === 2 || strength === 3) return "Medium";
    return "Strong";
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPwd = e.target.value;
    setPassword(newPwd);
    setPasswordStrength(getPasswordStrength(newPwd));
    setPasswordValid(
      newPwd.length >= 8 && /[A-Z]/.test(newPwd) && /[0-9]/.test(newPwd)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!emailValid) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!passwordValid) {
      setError("Password must be at least 8 characters long, contain one uppercase letter and one number.");
      return;
    }

    setIsLoading(true);
    try {
      const data = await registerUser(username, email, password);
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);
      navigate("/dashboard");
    } catch (err) {
      console.error("Registration error:", err);
      setError("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <div className="w-1/2 flex flex-col h-full">
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

      <div className="w-1/2 bg-gray-50 flex items-center justify-center h-full">
        <div className="w-full max-w-md px-8">
          <h1 className="text-5xl font-bold mb-12">Sign Up To TBD</h1>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
              {error}
            </div>
          )}

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
                onChange={handleEmailChange}
                placeholder="group23@email.com"
                className="w-full p-3 bg-yellow-50 border-b border-gray-300 focus:outline-none focus:border-green-500"
                required
              />
              {!emailValid && (
                <div className="text-red-500 text-sm mt-1">Please enter a valid email address.</div>
              )}
            </div>

            <div className="mb-2 relative">
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Password
              </label>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
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
            </div>

            <div className="mb-6 text-sm">
              Strength:{" "}
              <span
                className={
                  passwordStrength === "Weak"
                    ? "text-red-500"
                    : passwordStrength === "Medium"
                    ? "text-yellow-600"
                    : "text-green-600"
                }
              >
                {passwordStrength}
              </span>
            </div>

            {!passwordValid && (
              <div className="text-red-500 text-sm mt-1">
                Password must be at least 8 characters long, contain one uppercase letter, and one number.
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !emailValid || !passwordValid}
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
  );
};

export default SignUpPage;
