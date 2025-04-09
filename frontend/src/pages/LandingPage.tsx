import type React from "react"
import HeroSection from "../components/HeroSection"
import FeaturesSection from "../components/FeaturesSection"
import TestimonialsSection from "../components/TestimonialsSection"

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen w-full">
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
    </div>
  )
}

export default LandingPage
