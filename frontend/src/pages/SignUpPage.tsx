"use client"

import React, { useEffect } from "react"
import SignUpForm from "../components/SignUpForm";

const SignUpPage: React.FC = () => {
  // Add Inter font and reset default margins
  useEffect(() => {
    const fontLink = document.createElement("link")
    fontLink.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
    fontLink.rel = "stylesheet"
    document.head.appendChild(fontLink)

    document.body.style.margin = "0"
    document.body.style.padding = "0"
    document.body.style.overflow = "hidden"
    document.documentElement.style.margin = "0"
    document.documentElement.style.padding = "0"
    document.documentElement.style.overflow = "hidden"

    return () => {
      document.head.removeChild(fontLink)
    }
  }, [])

  return (
    <div style={styles.container}>
      {/* Left side with illustration */}
      <div style={styles.leftSide}>
        {/* Navigation */}
        <div style={styles.navBar}>
          <a href="#" style={styles.navLink}>Explore</a>
          <a href="#" style={styles.navLink}>About Us</a>
          <a href="#" style={styles.navLink}>Contact</a>
        </div>

        {/* Illustration */}
        <div style={styles.illustrationArea}>
          <div style={styles.illustrationContainer}>
            <img
              src="/src/assets/developer-image.png"
              alt="Developer illustration"
              style={styles.illustration}
            />
          </div>
        </div>
      </div>

      {/* Right side with form */}
      <div style={styles.rightSide}>
        <SignUpForm />
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    width: "100vw",
    fontFamily: '"Inter", sans-serif',
    overflow: "hidden",
  },
  leftSide: {
    width: "50%",
    display: "flex",
    flexDirection: "column" as const,
    height: "100%",
  },
  navBar: {
    display: "flex",
    alignItems: "center",
    height: "48px",
    padding: "0 20px",
    backgroundColor: "#003c36",
    borderBottom: "1px solid rgba(0, 80, 72, 0.3)",
  },
  navLink: {
    color: "white",
    textDecoration: "none",
    fontSize: "14px",
    marginRight: "32px",
  },
  illustrationArea: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(to bottom, #004a42 0%, #006e5f 50%, #00806c 100%)",
    height: "calc(100% - 48px)",
  },
  illustrationContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
    padding: "20px",
  },
  illustration: {
    maxWidth: "100%",
    maxHeight: "80%",
    objectFit: "contain" as const,
  },
  rightSide: {
    width: "50%",
    backgroundColor: "#f0f8e8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
}

export default SignUpPage
