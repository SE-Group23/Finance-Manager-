import type React from "react"
import HeroSection from "../components/landingpage/HeroSection"
import FeaturesSection from "../components/landingpage/FeaturesSection"
import TestimonialsSection from "../components/landingpage/TestimonialsSection"

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
