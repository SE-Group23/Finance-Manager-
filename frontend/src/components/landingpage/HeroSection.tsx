import type React from "react"
import { Link } from "react-router-dom"
import Navbar from "./NavBar"
import developerImage from "../../assets/developer-image.svg"

const HeroSection: React.FC = () => {
  return (
    <section className="min-h-screen w-full bg-gradient-to-b from-teal-800 to-teal-600 text-white">
      <Navbar />

      <div className="container mx-auto flex min-h-[calc(100vh-80px)] flex-col items-center px-4 py-12 lg:flex-row lg:justify-between lg:gap-4">
        <div className="max-w-xl text-center lg:text-left">
          <div className="mb-4 mx-auto lg:mx-0 inline-block rounded-full bg-white/20 px-4 py-1 text-xs font-semibold">
            100% TRUSTED PLATFORM
          </div>
          <h1 className="mb-4 text-5xl font-bold leading-tight text-white">
            Finance With Security And <span className="text-yellow-300">Flexibility</span>
          </h1>
          <p className="mb-8 text-lg text-white">
            Easily Track Spending, Manage Investments, And Stay On Top Of All Your Deadlines—All In One Secure Platform.
            Get AI-Powered Insights To Optimize Your Financial Future!
          </p>
          <div className="flex items-center justify-center lg:justify-start space-x-4">
            <Link
              to="/signup"
              className="flex items-center rounded-full bg-green-500 px-6 py-3 font-medium text-white hover:bg-green-600"
            >
              Open Account
              <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </div>
        </div>
        <div className="mt-10 lg:mt-0 -ml-8">
          <img src={developerImage || "/placeholder.svg"} alt="Financial Platform" className="h-auto max-w-full" />
        </div>
      </div>
    </section>
  )
}

export default HeroSection
