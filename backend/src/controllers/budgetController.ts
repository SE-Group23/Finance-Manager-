// backend/src/controllers/budgetController.ts
import { Request, Response } from 'express';
import { pool } from '../db';

/**
 * Returns a Date representing the first day of the month to be used,
 * based on an optional query parameter.
 * If queryMonth is not provided, it returns the first day of the current month.
 */
function getMonthStart(queryMonth?: string): Date {
  if (queryMonth) {
    return new Date(queryMonth);
  } else {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
}


/**
 * Looks up and returns the user's monthly income for the specified month.
 */
async function getMonthlyIncome(userId: number, monthStart: Date): Promise<number | null> {
  const incomeResult = await pool.query(
    `SELECT income_amount FROM user_income WHERE user_id = $1 AND month_start = $2`,
    [userId, monthStart]
  );
  return incomeResult.rowCount > 0 ? incomeResult.rows[0].income_amount : null;
}


/**
 * Retrieves all budget records (category limits) for a user in the specified month.
 */
async function getCategoryBudgets(userId: number, monthStart: Date): Promise<any[]> {
  const budgetResult = await pool.query(
    `SELECT b.budget_id, b.budget_limit, b.month_start, c.category_id, c.category_name
     FROM budgets b
     JOIN categories c ON b.category_id = c.category_id
     WHERE b.user_id = $1 AND b.month_start = $2`,
    [userId, monthStart]
  );
  return budgetResult.rows;
}

/**
 * Computes the total spending for a given category and month.
 */
async function getCategorySpending(userId: number, categoryId: number, monthStart: Date): Promise<number> {
  const spendingResult = await pool.query(
    `SELECT COALESCE(SUM(amount), 0) as spent
     FROM transactions
     WHERE user_id = $1
       AND category_id = $2
       AND DATE_TRUNC('month', transaction_date) = DATE_TRUNC('month', $3::timestamp)`,
    [userId, categoryId, monthStart]
  );
  return parseFloat(spendingResult.rows[0].spent);
}

/**
 * Looks up a category by name or creates a new one if it does not exist,
 * and returns the category_id.
 */
async function getCategoryId(categoryName: string): Promise<number> {
  let result = await pool.query(
    'SELECT category_id FROM categories WHERE category_name = $1',
    [categoryName]
  );
  if (result.rowCount === 0) {
    result = await pool.query(
      'INSERT INTO categories (category_name) VALUES ($1) RETURNING category_id',
      [categoryName]
    );
  }
  return result.rows[0].category_id;
}

/**
 * Upserts (inserts or updates) the monthly income for the user.
 */
async function upsertMonthlyIncome(userId: number, monthStart: Date, income_amount: number): Promise<void> {
  await pool.query(
    `INSERT INTO user_income (user_id, month_start, income_amount)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, month_start)
     DO UPDATE SET income_amount = EXCLUDED.income_amount`,
    [userId, monthStart, income_amount]
  );
}

/**
 * Upserts (inserts or updates) a single category-based budget record.
 * Returns the updated budget record.
 */
async function upsertCategoryBudget(userId: number, monthStart: Date, category: string, limit: number): Promise<any> {
  const categoryId = await getCategoryId(category);
  const result = await pool.query(
    `INSERT INTO budgets (user_id, category_id, month_start, budget_limit)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, category_id, month_start)
     DO UPDATE SET budget_limit = EXCLUDED.budget_limit
     RETURNING *`,
    [userId, categoryId, monthStart, limit]
  );
  return result.rows[0];
}

/* ============================================================================
   EXPORTED CONTROLLER FUNCTIONS
   ============================================================================ */

/**
 * GET Budget (UC‑5)
 * Retrieves the monthly income and all category-based budgets for the logged‑in user.
 * Also calculates current spending for each category and sets an alert flag if needed.
 * Optionally accepts a ?month=YYYY-MM-DD query parameter (defaults to current month).
 */
export async function getBudget(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).userId;
    const monthStart = getMonthStart(req.query.month as string);

    // Get the user's monthly income.
    const monthly_income = await getMonthlyIncome(userId, monthStart);

    // Get all category-based budgets.
    const categoryBudgets = await getCategoryBudgets(userId, monthStart);

    // For each budget record, calculate current spending and determine if an alert is necessary.
    const budgets = [];
    for (const row of categoryBudgets) {
      const spent = await getCategorySpending(userId, row.category_id, monthStart);
      const alert = spent > parseFloat(row.budget_limit);
      budgets.push({
        budget_id: row.budget_id,
        category_id: row.category_id,
        category_name: row.category_name,
        budget_limit: row.budget_limit,
        spent,
        alert
      });
    }

    res.json({
      month_start: monthStart,
      monthly_income,
      budgets
    });
  } catch (error) {
    console.error('Error fetching budget:', error);
    res.status(500).json({ error: 'Error fetching budget' });
  }
}

/**
 * POST Set/Update Budget (UC‑5)
 * Accepts a payload to set/update monthly income and an array of category-based spending limits.
 * Payload example:
 * {
 *   "month_start": "2024-04-01",          // optional, defaults to current month if not provided
 *   "monthly_income": 5000,                // must be non-negative number
 *   "category_limits": [
 *       { "category": "Food", "limit": 600 },
 *       { "category": "Entertainment", "limit": 300 }
 *   ]
 * }
 */
export async function setBudget(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).userId;
    const { monthly_income, category_limits, month_start } = req.body;

    // Validate monthly_income (if provided).
    if (monthly_income !== undefined && (isNaN(monthly_income) || monthly_income < 0)) {
      res.status(400).json({ error: 'Invalid monthly income. It must be a non-negative number.' });
      return;
    }

    // Validate that category_limits is an array.
    if (!Array.isArray(category_limits)) {
      res.status(400).json({ error: 'category_limits must be an array.' });
      return;
    }
    // Validate each element.
    for (const cl of category_limits) {
      if (!cl.category || isNaN(cl.limit) || cl.limit <= 0) {
        res.status(400).json({ error: 'Each category limit must include a valid category and a limit greater than 0.' });
        return;
      }
    }

    const monthStart = month_start ? new Date(month_start) : getMonthStart();

    // Upsert the monthly income, if provided.
    if (monthly_income !== undefined) {
      await upsertMonthlyIncome(userId, monthStart, monthly_income);
    }

    // Upsert each of the category budgets.
    const updatedBudgets = [];
    for (const cl of category_limits) {
      const budgetRecord = await upsertCategoryBudget(userId, monthStart, cl.category, cl.limit);
      updatedBudgets.push(budgetRecord);
    }

    res.json({
      month_start: monthStart,
      monthly_income,
      category_budgets: updatedBudgets
    });
  } catch (error) {
    console.error('Error setting budget:', error);
    res.status(500).json({ error: 'Error setting budget' });
  }
}
