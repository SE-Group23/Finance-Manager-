// backend/src/controllers/transactionController.ts
import { Request, Response } from 'express';
import { pool } from '../db';

/**
 * Create a new transaction.
 * UC-3: The user submits transaction amount, category, (optional) vendor, note, and optionally a date.
 */
export async function createTransaction(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).userId;
    const { amount, category, note, vendor, transactionDate } = req.body;
    if (!amount || !category) {
      res.status(400).json({ error: 'Amount and category are required.' });
      return;
    }
    // Use provided transactionDate if available, otherwise default to NOW()
    const tDate = transactionDate ? transactionDate : new Date();
    const result = await pool.query(
      `INSERT INTO transactions (user_id, amount, category, note, vendor, transaction_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, amount, category, note, vendor, tDate]
    );
    res.status(201).json(result.rows[0]);
    return;
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Error creating transaction' });
    return;
  }
}

/**
 * Retrieve all transactions for the logged-in user.
 */
export async function getTransactions(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).userId;
    const result = await pool.query(
      'SELECT * FROM transactions WHERE user_id = $1 ORDER BY transaction_date DESC',
      [userId]
    );
    res.json(result.rows);
    return;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Error fetching transactions' });
    return;
  }
}

/**
 * Update a transaction.
 */
export async function updateTransaction(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;
    const { amount, category, note, vendor, transactionDate } = req.body;
    const result = await pool.query(
      `UPDATE transactions 
       SET amount = $1, category = $2, note = $3, vendor = $4, transaction_date = $5
       WHERE transaction_id = $6 AND user_id = $7
       RETURNING *`,
      [amount, category, note, vendor, transactionDate, id, userId]
    );
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }
    res.json(result.rows[0]);
    return;
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Error updating transaction' });
    return;
  }
}

/**
 * Delete a transaction.
 */
export async function deleteTransaction(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM transactions WHERE transaction_id = $1 AND user_id = $2',
      [id, userId]
    );
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }
    res.json({ success: true });
    return;
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Error deleting transaction' });
    return;
  }
}
