import type React from "react"
import { Link } from "react-router-dom"

const Navbar: React.FC = () => {
  return (
    <nav className="container mx-auto flex items-center justify-between px-4 py-6">
      <div className="flex items-center space-x-8">
        {/* <a href="#" className="text-sm font-medium hover:text-green-300">
          Explore
        </a> */}
        <Link to="/about" className="text-sm font-medium hover:text-green-300">
          About Us
        </Link>
        <Link to="/contact" className="text-sm font-medium hover:text-green-300">
          Contact
        </Link>
      </div>
      <Link
        to="/login"
        className="rounded-full border border-white px-6 py-2 text-sm font-medium hover:bg-white hover:text-teal-800"
      >
        Sign In
      </Link>
    </nav>
  )
}

export default Navbar
