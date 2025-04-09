// backend/src/controllers/budgetController.ts
import { Request, Response } from 'express';
import { pool } from '../db';

/**
 * Normalizes any passed date to the first day (day=1) of that month.
 */
function getMonthStart(rawDate?: string): Date {
    if (!rawDate) {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    }
    const d = new Date(rawDate);
    return new Date(d.getFullYear(), d.getMonth(), 1);
}

/**
 * Computes total spending for the specified user/category in the calendar month of `monthStart`.
 */
async function getCategorySpending(
    userId: number,
    categoryId: number,
    monthStart: Date
): Promise<number> {
    const spendingResult = await pool.query(
        `
      SELECT COALESCE(SUM(amount), 0) AS spent
      FROM transactions
      WHERE user_id = $1
        AND category_id = $2
        AND DATE_TRUNC('month', transaction_date) = DATE_TRUNC('month', $3::timestamp)
    `,
        [userId, categoryId, monthStart]
    );
    return parseFloat(spendingResult.rows[0].spent);
}

/**
 * Looks up or creates a category by name and returns its category_id.
 */
async function getCategoryId(categoryName: string): Promise<number> {
    let result = await pool.query(
        `SELECT category_id FROM categories WHERE category_name = $1`,
        [categoryName]
    );
    if (result.rowCount === 0) {
        result = await pool.query(
            `INSERT INTO categories (category_name) VALUES ($1) RETURNING category_id`,
            [categoryName]
        );
    }
    return result.rows[0].category_id;
}

/**
 * Inserts or updates a single category-based budget record for a given user, month, and category.
 */
async function upsertCategoryBudget(
    userId: number,
    monthStart: Date,
    category: string,
    limit: number
) {
    const categoryId = await getCategoryId(category);

    const result = await pool.query(
        `
      INSERT INTO budgets (user_id, category_id, month_start, budget_limit)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, category_id, month_start)
      DO UPDATE SET budget_limit = EXCLUDED.budget_limit
      RETURNING *
    `,
        [userId, categoryId, monthStart, limit]
    );
    return result.rows[0];
}

/* ============================================================================
   EXPORTED CONTROLLER FUNCTIONS
   ============================================================================ */

/**
 * GET /api/budgets
 * Returns ALL budgets for the user in chronological order, ignoring any ?month param.
 * For each budget row, we also compute "spent" for that particular month+category.
 */
export async function getBudget(req: Request, res: Response): Promise<void> {
    try {
        const userId = (req as any).userId;

        // Query for ALL budgets belonging to this user, in ascending month/category order
        const budgetRows = await pool.query(
            `
        SELECT b.budget_id,
               b.budget_limit,
               b.month_start,
               b.category_id,
               c.category_name
          FROM budgets b
          JOIN categories c ON b.category_id = c.category_id
         WHERE b.user_id = $1
         ORDER BY b.month_start ASC, c.category_name ASC
      `,
            [userId]
        );

        const budgets = [];
        for (const row of budgetRows.rows) {
            const spent = await getCategorySpending(
                userId,
                row.category_id,
                row.month_start
            );
            const alert = spent > parseFloat(row.budget_limit);

            budgets.push({
                budget_id: row.budget_id,
                category_id: row.category_id,
                category_name: row.category_name,
                budget_limit: row.budget_limit,
                month_start: row.month_start,
                spent,
                alert,
            });
        }

        // Return an object with an array of budgets
        res.json({ budgets });
    } catch (error) {
        console.error('Error fetching budgets:', error);
        res.status(500).json({ error: 'Error fetching budgets' });
    }
}

/**
 * POST /api/budgets
 * Accepts: { "month_start": "YYYY-MM-DD", "category_limits": [ { category, limit }, ... ] }
 * Upserts each category's budget for that user+month. The day portion is forced to day=1.
 */
export async function setBudget(req: Request, res: Response): Promise<void> {
    try {
        const userId = (req as any).userId;
        const { month_start, category_limits } = req.body;

        if (!Array.isArray(category_limits)) {
            res.status(400).json({ error: 'category_limits must be an array.' });
        }

        // Normalize monthStart to the 1st day of that month
        const normalizedMonth = getMonthStart(month_start);

        const updatedBudgets = [];
        for (const cl of category_limits) {
            if (!cl.category || isNaN(cl.limit) || cl.limit <= 0) {
                res.status(400).json({
                    error: 'Each category limit must include a valid category and a limit > 0.',
                });
                return;
            }
            const budgetRecord = await upsertCategoryBudget(
                userId,
                normalizedMonth,
                cl.category,
                Number(cl.limit)
            );
            updatedBudgets.push(budgetRecord);
        }

        res.json({
            category_budgets: updatedBudgets,
        });
    } catch (error) {
        console.error('Error setting budget:', error);
        res.status(500).json({ error: 'Error setting budget' });
    }
}

/**
 * DELETE /api/budgets/:id
 * Removes a specific budget (by budget_id) for the logged-in user.
 */
export async function deleteBudget(req: Request, res: Response): Promise<void> {
    try {
        const userId = (req as any).userId;
        const budgetId = parseInt(req.params.id, 10);

        if (isNaN(budgetId)) {
            res.status(400).json({ error: 'Invalid budget ID.' });
            return;
        }

        const result = await pool.query(
            `
        DELETE FROM budgets
         WHERE budget_id = $1
           AND user_id = $2
      `,
            [budgetId, userId]
        );

        if (result.rowCount === 0) {
            res.status(404).json({ error: 'Budget not found or not authorized.' });
            return
        }

        res.json({ message: 'Budget deleted successfully.' });
    } catch (error) {
        console.error('Error deleting budget:', error);
        res.status(500).json({ error: 'Error deleting budget.' });
    }
}
