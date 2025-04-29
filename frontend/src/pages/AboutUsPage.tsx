"use client"

import type React from "react"
import Navbar from "../components/landingpage/NavBar"

const AboutUsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-900 to-teal-600 text-white">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-8">About Us</h1>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 mb-12">
            <h2 className="text-3xl font-semibold mb-4">Our Mission</h2>
            <p className="text-lg mb-6">
              At TBD, we're committed to revolutionizing the way finances are managed, be it by ordinary folks or specialized asset managers. Our platform provides a way to consolidate and track all financial matters, making your life easier!

            </p>
            <p className="text-lg">
              Founded in 2025, we aim to empower individuals and teams with the tools they need to make informed financial decisions.
              Our mission is to simplify the complexities of finance, making it accessible and understandable for everyone.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-2xl font-semibold mb-3">Our Values</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Innovation at every step</li>
                <li>Integrity and transparency</li>
                <li>User-centered design</li>
                <li>Continuous improvement</li>
              </ul>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-2xl font-semibold mb-3">Our Team</h3>
              <p className="mb-4">
                We are a diverse group of professionals with backgrounds in finance, technology, and design. 
                Our team is dedicated to building a platform that meets the needs of our users.
              </p>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
            <h2 className="text-3xl font-semibold mb-4">Our Story</h2>
            <p className="text-lg mb-4">
              TBD began with a simple idea: to create a platform that makes financial management easier for everyone.
              We started as a small team of developers and designers, passionate about technology and finance.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutUsPage
