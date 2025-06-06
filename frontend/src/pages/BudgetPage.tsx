"use client"

import { useState, useEffect } from "react"
import BudgetManagerContent from "../components/budget/BudgetManager"
import Sidebar from "../components/Sidebar"
import LoadingScreen from "../components/LoadingScreen"

function BudgetPage() {
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    const pageLoadTimer = setTimeout(() => {
      setPageLoading(false)
    }, 800)

    return () => clearTimeout(pageLoadTimer)
  }, [])

  if (pageLoading) {
    return <LoadingScreen />
  }

  return (
    <div className="flex h-screen">
      <Sidebar activePage="budgets" />

      <div className="flex-1 overflow-auto bg-background-light">
        <BudgetManagerContent />
      </div>
    </div>
  )
}

export default BudgetPage
