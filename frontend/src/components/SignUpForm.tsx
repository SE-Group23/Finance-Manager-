import React, { useState } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = `${import.meta.env.VITE_API_HOST}:${import.meta.env.VITE_API_PORT}/api/auth/register`;

const SignUpForm: React.FC = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(API_URL, { fullName, email, password });
      console.log("Registration successful", response.data);
      navigate('/dashboard');

    } catch (err: any) {
      const message = err?.response?.data?.error || err?.message || "Registration failed";
      console.error("Registration error", message);
      setError(message);
    }
  };
  

  return (
    <div className="p-8 rounded shadow-md w-96 bg-white">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Sign Up</h2>
      
      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-100 border border-red-400 rounded px-4 py-2">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Full Name Field */}
        <div className="mb-4">
          <label htmlFor="fullName" className="block text-gray-700 text-sm font-bold mb-2">
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>
        {/* Email Field */}
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        {/* Password Field */}
        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {/* Submit Button and Forgot Password Link */}
        <div className="flex items-center justify-between">
          <button
            className="bg-primary-lighter hover:bg-primary-light text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Sign Up
          </button>
          <a
            className="inline-block align-baseline font-bold text-sm text-primary-lighter hover:text-primary-light"
            href="#"
          >
            Forgot Password?
          </a>
        </div>
      </form>
    </div>
  );
};

export default SignUpForm;
