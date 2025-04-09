import type React from "react"
import { Link, useLocation } from "react-router-dom"

const Sidebar: React.FC = () => {
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <div className="w-60 bg-emerald-600 text-white min-h-screen">
      {/* Logo */}
      <div className="p-4 border-b border-emerald-700">
        <div className="flex items-center space-x-2">
          <span className="p-2 bg-emerald-700 rounded">
            <span className="font-bold">TBD</span>
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-6">
        <Link
          to="/dashboard"
          className={`flex items-center px-4 py-3 ${isActive("/dashboard") ? "bg-emerald-500 text-white" : "text-emerald-100 hover:bg-emerald-700"}`}
        >
          <svg
            className="w-5 h-5 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            ></path>
          </svg>
          Dashboard
        </Link>

        <Link
          to="/transactions"
          className={`flex items-center px-4 py-3 ${isActive("/transactions") ? "bg-emerald-500 text-white" : "text-emerald-100 hover:bg-emerald-700"}`}
        >
          <svg
            className="w-5 h-5 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
          Transactions
        </Link>

        <Link
          to="/budget"
          className={`flex items-center px-4 py-3 ${isActive("/budget") ? "bg-emerald-500 text-white" : "text-emerald-100 hover:bg-emerald-700"}`}
        >
          <svg
            className="w-5 h-5 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
            ></path>
          </svg>
          Budgets
        </Link>

        <Link
          to="/assets"
          className={`flex items-center px-4 py-3 ${isActive("/assets") ? "bg-emerald-500 text-white" : "text-emerald-100 hover:bg-emerald-700"}`}
        >
          <svg
            className="w-5 h-5 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
            ></path>
          </svg>
          Assets
        </Link>

        <Link
          to="/calendar"
          className={`flex items-center px-4 py-3 ${isActive("/calendar") ? "bg-emerald-500 text-white" : "text-emerald-100 hover:bg-emerald-700"}`}
        >
          <svg
            className="w-5 h-5 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            ></path>
          </svg>
          Calendar
        </Link>

        <Link
          to="/zakat"
          className={`flex items-center px-4 py-3 ${isActive("/zakat") ? "bg-emerald-500 text-white" : "text-emerald-100 hover:bg-emerald-700"}`}
        >
          <svg
            className="w-5 h-5 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            ></path>
          </svg>
          Zakat & Tax
        </Link>

        <Link
          to="/chatbot"
          className={`flex items-center px-4 py-3 ${isActive("/chatbot") ? "bg-emerald-500 text-white" : "text-emerald-100 hover:bg-emerald-700"}`}
        >
          <svg
            className="w-5 h-5 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
          AI Chatbot
        </Link>
      </nav>

      {/* User profile */}
      <div className="absolute bottom-0 w-60 p-4 border-t border-emerald-700">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg
              className="w-8 h-8 text-emerald-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">Sam Wheeler</p>
            <p className="text-xs text-emerald-200">samwheeler@example.com</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
