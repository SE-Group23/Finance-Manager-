// frontend/src/services/dashboardService.ts
import axios from "axios"

const API_URL = `${import.meta.env.VITE_API_HOST}:${import.meta.env.VITE_API_PORT}/api/dashboard`

export interface Transaction {
    transaction_id: number
    amount: number
    transaction_type: "credit" | "debit"
    vendor: string
    description: string
    transaction_date: string
    category_name: string
}

export interface Budget {
    budget_id: number
    budget_limit: number
    category_name: string
    spent: number
}

export interface CategoryBreakdown {
    category_name: string
    amount: number
    percentage: number
}

export interface DashboardData {
    netCash: number
    totalCredit: number
    totalDebit: number
    recentTransactions: Transaction[]
    budgets: Budget[]
    budgetProgress: {
        totalBudget: number
        totalSpent: number
        percentage: number
    }
    categoryBreakdown: CategoryBreakdown[]
    totalMonthlyExpenses: number
}

export async function fetchDashboardData() {
    const token = localStorage.getItem("token")

    try {
        const response = await axios.get(API_URL, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        console.log("Dashboard data received:", response.data)
        return response.data
    } catch (error) {
        console.error("Error fetching dashboard data:", error)
        throw error
    }
}
