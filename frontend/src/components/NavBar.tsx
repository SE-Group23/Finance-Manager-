import type React from "react"
import logo from "../assets/logo.png" // ✅ Import the logo


const NavBar: React.FC = () => {
  return (
    <nav className="w-full py-4 px-6 bg-teal-800">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
          <img src={logo} alt="Logo" className="h-10 w-auto" />
            <span className="ml-3 text-xl font-bold text-white">TBD</span>
          </div>
          <div className="hidden md:flex items-center">
            <a
              href="#"
              className="text-white hover:text-green-300 px-5 py-2 text-base font-medium tracking-wide transition-colors"
            >
              About Us
            </a>
            <a
              href="#"
              className="text-white hover:text-green-300 px-5 py-2 text-base font-medium tracking-wide transition-colors"
            >
              Contact
            </a>
          </div>
          <div>
            <a
              href="#"
              className="rounded-full border border-white px-6 py-2 text-sm font-medium text-white hover:bg-white hover:text-teal-800 transition-colors"
            >
              Sign In
            </a>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default NavBar
