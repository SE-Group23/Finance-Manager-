import React, { useState } from "react"
import styles from "./signup.module.css"

// Icon components
const EyeIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const EyeOffIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
)

const SignUpForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className={styles.formWrapper}>
      <h1 className={styles.title}>Sign Up To TBD</h1>

      <div className={styles.formBox}>
        <div className={styles.inputGroup}>
          <label htmlFor="username" className={styles.label}>
            Username
          </label>
          <input type="text" id="username" defaultValue="tobedecided" className={styles.input} />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="email" className={styles.label}>
            Email
          </label>
          <input type="email" id="email" defaultValue="group23@gmail.com" className={styles.input} />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="password" className={styles.label}>
            Password
          </label>
          <div className={styles.passwordField}>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              defaultValue="••••••••••••"
              className={styles.input}
              style={{ paddingRight: "24px" }}
            />
            <button type="button" className={styles.toggleButton} onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>
      </div>

      <button className={styles.signupButton}>Sign Up</button>

      <p className={styles.loginText}>
        Already have an account?{" "}
        <a href="#" className={styles.loginLink}>
          Login
        </a>
      </p>
    </div>
  )
}

export default SignUpForm
