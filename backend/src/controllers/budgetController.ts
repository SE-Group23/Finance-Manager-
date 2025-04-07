// backend/src/controllers/budgetController.ts
import { Request, Response } from 'express';
import { pool } from '../db';

/**
 * UC‑5 – Get Budget:
 * Retrieves the current budget record for the logged‐in user.
 */
export async function getBudget(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).userId;
    const result = await pool.query(
      'SELECT * FROM budgets WHERE user_id = $1 LIMIT 1',
      [userId]
    );
    res.json(result.rows[0] || null);
  } catch (error) {
    console.error('Error fetching budget:', error);
    res.status(500).json({ error: 'Error fetching budget' });
  }
}

/**
 * UC‑5 – Set/Update Budget:
 * The user provides a monthly income and a monthly spending limit.
 * The system validates the inputs and upserts the record.
 */
export async function setBudget(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).userId;
    const { monthly_limit, monthly_income } = req.body;

    // Validate the monthly_limit
    if (isNaN(monthly_limit) || monthly_limit <= 0) {
      res.status(400).json({ error: 'Invalid monthly limit. It must be a number greater than 0.' });
      return;
    }
    // Optionally validate monthly_income if provided
    if (monthly_income !== undefined && (isNaN(monthly_income) || monthly_income < 0)) {
      res.status(400).json({ error: 'Invalid monthly income. It must be a non-negative number.' });
      return;
    }
    
    const result = await pool.query(
      `INSERT INTO budgets (user_id, monthly_limit, monthly_income)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id)
       DO UPDATE SET 
         monthly_limit = EXCLUDED.monthly_limit, 
         monthly_income = EXCLUDED.monthly_income, 
         updated_at = NOW()
       RETURNING *`,
      [userId, monthly_limit, monthly_income]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error setting budget:', error);
    res.status(500).json({ error: 'Error setting budget' });
  }
}
