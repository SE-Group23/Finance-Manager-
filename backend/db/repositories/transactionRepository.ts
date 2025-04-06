// db/repositories/transactionRepository.ts
import { query } from '../query';
import { Transaction } from '../models/transaction';

export async function createTransaction(transaction: Transaction): Promise<Transaction> {
  const { user_id, amount, category_id, transaction_date, description } = transaction;
  const result = await query<Transaction>(
    `INSERT INTO transactions (user_id, amount, category_id, transaction_date, description)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [user_id, amount, category_id || null, transaction_date, description || null]
  );
  return result.rows[0];
}

export async function getTransactionsByUser(userId: number): Promise<Transaction[]> {
  const result = await query<Transaction>(
    `SELECT * FROM transactions WHERE user_id = $1 ORDER BY transaction_date DESC`,
    [userId]
  );
  return result.rows;
}
