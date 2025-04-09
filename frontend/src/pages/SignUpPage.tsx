"use client"

import type React from "react"
import SignUpForm from "../components/SignUpForm"

const SignUpPage: React.FC = () => {
  return (
    <div className="flex h-screen w-screen font-inter overflow-hidden">
      {/* Left side with illustration */}
      <div className="w-1/2 flex flex-col h-full">
        {/* Navigation */}
        <div className="flex items-center h-12 px-5 bg-primary-dark border-b border-opacity-30 border-primary-medium">
          <a href="#" className="text-white no-underline text-sm mr-8">
            Explore
          </a>
          <a href="#" className="text-white no-underline text-sm mr-8">
            About Us
          </a>
          <a href="#" className="text-white no-underline text-sm">
            Contact
          </a>
        </div>

        {/* Illustration */}
        <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-primary-medium via-primary-light to-primary-lighter h-[calc(100%-3rem)]">
          <div className="flex justify-center items-center w-full h-full p-5">
            <img
              src="/src/assets/developer-image.png"
              alt="Developer illustration"
              className="max-w-full max-h-[80%] object-contain"
            />
          </div>
        </div>
      </div>

      {/* Right side with form */}
      <div className="w-1/2 bg-background-light flex items-center justify-center h-full">
        <SignUpForm />
      </div>
    </div>
  )
}

export default SignUpPage
