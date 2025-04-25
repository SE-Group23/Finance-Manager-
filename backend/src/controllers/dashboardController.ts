import type { Request, Response } from "express"
import { pool } from "../db"

export async function getDashboardData(req: Request, res: Response): Promise<void> {
    try {
        const userId = (req as any).userId

        const currentDate = new Date()

        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)

        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

        const monthStart = firstDayOfMonth.toISOString()
        const monthEnd = lastDayOfMonth.toISOString()

        const netCashResult = await pool.query(
            `SELECT 
        COALESCE(SUM(CASE WHEN transaction_type = 'credit' THEN amount ELSE 0 END), 0) as total_credit,
        COALESCE(SUM(CASE WHEN transaction_type = 'debit' THEN amount ELSE 0 END), 0) as total_debit
       FROM transactions
       WHERE user_id = $1`,
            [userId],
        )

        const totalCredit = Number.parseFloat(netCashResult.rows[0].total_credit)
        const totalDebit = Number.parseFloat(netCashResult.rows[0].total_debit)
        const netCash = totalCredit - totalDebit

        const recentTransactionsResult = await pool.query(
            `SELECT t.transaction_id,
              t.amount,
              t.transaction_type,
              t.vendor,
              t.description,
              t.transaction_date,
              c.category_name
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.category_id
       WHERE t.user_id = $1
       ORDER BY t.transaction_date DESC
       LIMIT 5`,
            [userId],
        )

        const budgetsResult = await pool.query(
            `SELECT b.budget_id, 
              b.budget_limit, 
              c.category_id,
              c.category_name,
              b.month_start
       FROM budgets b
       JOIN categories c ON b.category_id = c.category_id
       WHERE b.user_id = $1 
       AND DATE_TRUNC('month', b.month_start) = DATE_TRUNC('month', $2::timestamp)
       LIMIT 5`,
            [userId, firstDayOfMonth.toISOString()],
        )

        const budgets = []
        for (const budget of budgetsResult.rows) {
            const spentResult = await pool.query(
                `SELECT COALESCE(SUM(amount), 0) as spent
         FROM transactions
         WHERE user_id = $1
           AND category_id = $2
           AND transaction_date BETWEEN $3 AND $4
           AND transaction_type = 'debit'`,
                [userId, budget.category_id, monthStart, monthEnd],
            )

            const spent = Number.parseFloat(spentResult.rows[0].spent)
            budgets.push({
                budget_id: budget.budget_id,
                budget_limit: budget.budget_limit,
                category_name: budget.category_name,
                spent,
                month_start: budget.month_start,
            })
        }

        if (budgets.length === 0) {

            const currentYear = currentDate.getFullYear()
            const currentMonth = currentDate.getMonth() + 1 

            const alternativeBudgetsResult = await pool.query(
                `SELECT b.budget_id, 
                b.budget_limit, 
                c.category_id,
                c.category_name,
                b.month_start
         FROM budgets b
         JOIN categories c ON b.category_id = c.category_id
         WHERE b.user_id = $1 
         AND EXTRACT(YEAR FROM b.month_start) = $2
         AND EXTRACT(MONTH FROM b.month_start) = $3
         LIMIT 5`,
                [userId, currentYear, currentMonth],
            )

            for (const budget of alternativeBudgetsResult.rows) {
                const spentResult = await pool.query(
                    `SELECT COALESCE(SUM(amount), 0) as spent
           FROM transactions
           WHERE user_id = $1
             AND category_id = $2
             AND transaction_date BETWEEN $3 AND $4
             AND transaction_type = 'debit'`,
                    [userId, budget.category_id, monthStart, monthEnd],
                )

                const spent = Number.parseFloat(spentResult.rows[0].spent)
                budgets.push({
                    budget_id: budget.budget_id,
                    budget_limit: budget.budget_limit,
                    category_name: budget.category_name,
                    spent,
                    month_start: budget.month_start,
                })
            }
        }

        const totalBudgetResult = await pool.query(
            `SELECT 
        COALESCE(SUM(budget_limit), 0) as total_budget
       FROM budgets
       WHERE user_id = $1 
       AND EXTRACT(YEAR FROM month_start) = $2
       AND EXTRACT(MONTH FROM month_start) = $3`,
            [userId, currentDate.getFullYear(), currentDate.getMonth() + 1],
        )

        const totalMonthlySpendingResult = await pool.query(
            `SELECT 
        COALESCE(SUM(amount), 0) as total_spent
       FROM transactions
       WHERE user_id = $1 
         AND transaction_date BETWEEN $2 AND $3
         AND transaction_type = 'debit'`,
            [userId, monthStart, monthEnd],
        )

        const totalBudget = Number.parseFloat(totalBudgetResult.rows[0].total_budget)
        const totalSpent = Number.parseFloat(totalMonthlySpendingResult.rows[0].total_spent)
        const budgetProgress = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0

        const categoryBreakdownResult = await pool.query(
            `SELECT 
        c.category_name,
        COALESCE(SUM(t.amount), 0) as amount
       FROM transactions t
       JOIN categories c ON t.category_id = c.category_id
       WHERE t.user_id = $1 
         AND t.transaction_date BETWEEN $2 AND $3
         AND t.transaction_type = 'debit'
       GROUP BY c.category_name
       ORDER BY amount DESC`,
            [userId, monthStart, monthEnd],
        )

        const totalMonthlyExpenses = categoryBreakdownResult.rows.reduce(
            (sum, category) => sum + Number.parseFloat(category.amount),
            0,
        )

        const categoryBreakdown = categoryBreakdownResult.rows.map((category) => ({
            ...category,
            percentage:
                totalMonthlyExpenses > 0 ? Math.round((Number.parseFloat(category.amount) / totalMonthlyExpenses) * 100) : 0,
        }))


        res.json({
            netCash,
            totalCredit,
            totalDebit,
            recentTransactions: recentTransactionsResult.rows,
            budgets,
            budgetProgress: {
                totalBudget,
                totalSpent,
                percentage: budgetProgress,
            },
            categoryBreakdown,
            totalMonthlyExpenses,
        })
    } catch (error) {
        res.status(500).json({ error: "Error fetching dashboard data" })
    }
}
