// backend/src/controllers/transactionController.ts
import { Request, Response } from 'express';
import { pool } from '../db';


/**
 * Transaction Data Get
 */

/**
 * Helper function to get or create a category by its name.
 * Returns the category_id.
 */
async function getCategoryId(categoryName: string): Promise<number> {
  // Try to find the category by name.
  let result = await pool.query(
    "SELECT category_id FROM categories WHERE category_name = $1",
    [categoryName]
  );

  if (result.rowCount === 0) {
    // Category does not exist; insert it.
    result = await pool.query(
      "INSERT INTO categories (category_name) VALUES ($1) RETURNING category_id",
      [categoryName]
    );
  }

  return result.rows[0].category_id;
}

/**
 * Retrieve all transactions for the logged-in user.
 */
export async function getTransactions(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).userId;
    const result = await pool.query(
      `SELECT t.transaction_id,
              t.amount,
              t.transaction_type,
              t.vendor,
              t.description AS note,
              t.transaction_date,
              c.category_name AS category
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.category_id
       WHERE t.user_id = $1
       ORDER BY t.transaction_date DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Error fetching transactions' });
  }
}

/**
 * Retrieve a transaction by its ID.
 */
export async function getTransactionById(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM transactions WHERE transaction_id = $1 AND user_id = $2',
      [id, userId]
    );
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }
    res.json(result.rows[0]);
    return;
  } catch (error) {
    console.error('Error fetching transaction by ID:', error);
    res.status(500).json({ error: 'Error fetching transaction' });
    return;
  }
}

/**
 * Retrieve transactions for the logged-in user within a date range.
 * Expects 'start' and 'end' query parameters in ISO date format.
 */
export async function getTransactionsByDateRange(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).userId;
    const { start, end } = req.query;

    if (!start || !end) {
      res.status(400).json({ error: 'Start and end dates are required as query parameters.' });
      return;
    }

    const result = await pool.query(
      `SELECT * FROM transactions 
       WHERE user_id = $1 
         AND transaction_date BETWEEN $2 AND $3
       ORDER BY transaction_date DESC`,
      [userId, new Date(start as string), new Date(end as string)]
    );

    res.json(result.rows);
    return;
  } catch (error) {
    console.error('Error fetching transactions by date range:', error);
    res.status(500).json({ error: 'Error fetching transactions' });
    return;
  }
}

/**
 * Retrieve all categories associated with the logged-in user.
 * This fetches the unique categories from the user's transactions.
 */
export async function getUserCategories(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).userId;
    const result = await pool.query(
      `SELECT DISTINCT c.category_id, c.category_name
       FROM categories c
       INNER JOIN transactions t ON c.category_id = t.category_id
       WHERE t.user_id = $1
       ORDER BY c.category_name`,
      [userId]
    );
    res.json(result.rows);
    return;
  } catch (error) {
    console.error('Error fetching user categories:', error);
    res.status(500).json({ error: 'Error fetching categories' });
    return;
  }
}

/**
 * Retrieve transactions for the logged-in user filtered by transaction type.
 * Accepts a query parameter 'type' (e.g., 'credit' or 'debit').
 */
export async function getTransactionsByType(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).userId;
    const { type } = req.query;

    if (!type) {
      res.status(400).json({ error: 'Transaction type is required as query parameter.' });
      return;
    }
    
    // Validate that the provided type is either 'credit' or 'debit'
    if (type !== 'credit' && type !== 'debit') {
      res.status(400).json({ error: "Invalid transaction type. Expected 'credit' or 'debit'." });
      return;
    }

    const result = await pool.query(
      `SELECT * FROM transactions 
       WHERE user_id = $1 AND transaction_type = $2 
       ORDER BY transaction_date DESC`,
      [userId, type]
    );

    res.json(result.rows);
    return;
  } catch (error) {
    console.error('Error fetching transactions by type:', error);
    res.status(500).json({ error: 'Error fetching transactions by type' });
    return;
  }
}


// ------------------------------------------------------------------------------------------------------------

/**
 * Transaction Data Put
 */

/**
 * Create a new transaction.
 * UC-3: The user submits transaction amount, category, (optional) vendor, note, and optionally a date.
 */
export async function createTransaction(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).userId;
    
    const { amount, category, note, vendor, transactionDate, transaction_type } = req.body;
    if (!amount || !category || !transaction_type) {
      res.status(400).json({ error: 'Amount, category, and transaction type are required.' });
      return;
    }

    // Resolve the category name to its ID (create it if necessary).
    const categoryId = await getCategoryId(category);

    // Use provided transactionDate if available, otherwise default to NOW()
    const tDate = transactionDate ? transactionDate : new Date();

    const result = await pool.query(
      `INSERT INTO transactions (user_id, amount, transaction_type, category_id, vendor, transaction_date, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, amount, transaction_type, categoryId, vendor, tDate, note]
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
 * Update a transaction.
 */
export async function updateTransaction(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;
    const { amount, category, note, vendor, transactionDate, transaction_type } = req.body;
    const categoryId = await getCategoryId(category);

    const result = await pool.query(
      `UPDATE transactions 
       SET amount = $1, transaction_type = $2, category_id = $3, description = $4, vendor = $5, transaction_date = $6
       WHERE transaction_id = $7 AND user_id = $8
       RETURNING *`,
      [amount, transaction_type, categoryId, note, vendor, transactionDate, id, userId]
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

