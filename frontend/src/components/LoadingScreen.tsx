import type React from "react"
import logo from "../assets/logo.svg"

interface LoadingScreenProps {
  fullScreen?: boolean
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ fullScreen = true }) => {
  return (
    <div
      className={`flex flex-col items-center justify-center bg-background-light ${
        fullScreen ? "fixed inset-0 z-50" : "w-full h-full min-h-[300px]"
      }`}
    >
      <div className="relative">
        <div className="w-32 h-32 bg-navbar rounded-full flex items-center justify-center">
          <img src={logo} alt="Logo" className="w-16 h-16" />
        </div>
        <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-navbar animate-spin"></div>
      </div>
      <div className="mt-4 text-navbar font-medium">Loading..</div>
    </div>
  )
}

export default LoadingScreen
