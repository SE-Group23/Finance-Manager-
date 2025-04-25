// // backend/src/controllers/transactionController.ts
import { Request, Response } from "express"
import { pool } from "../db"

// GET /transactions
export const getTransactions = async (_req: Request, res: Response) => {
  try {
    const query = `
      SELECT 
        t.transaction_id,
        t.user_id,
        t.amount,
        t.transaction_type,
        t.transaction_date,
        t.vendor,
        t.description,
        t.category_id,
        c.category_name
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.category_id
      ORDER BY t.transaction_date DESC
    `
    const result = await pool.query(query)
    res.status(200).json(result.rows)
  } catch (error) {
    console.error("Error fetching transactions:", error)
    res.status(500).json({ error: "Failed to fetch transactions" })
  }
}

// POST /transactions
export const createTransaction = async (req: Request, res: Response) => {
  try {
    const {
      user_id,
      amount,
      transaction_type,
      category_id,
      vendor,
      transaction_date,
      description,
      payment_method,
    } = req.body

    if (
      !user_id ||
      !amount ||
      !transaction_type ||
      !category_id ||
      !transaction_date
    ) {
      res.status(400).json({ error: "Missing required fields" })
    }

    const result = await pool.query(
      `
      INSERT INTO transactions (
        user_id, amount, transaction_type, category_id, vendor, transaction_date, description, payment_method
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
      `,
      [user_id, amount, transaction_type, category_id, vendor, transaction_date, description, payment_method]
    )

    //res.status(201).json(result.rows[0])

    const created = result.rows[0]

    const categoryRes = await pool.query(`
      SELECT category_name 
      FROM categories 
      WHERE category_id = $1
    `, [created.category_id])

    const category_name = categoryRes.rows[0]?.category_name || "Unknown"

    //res.status(201).json({ ...created, category_name })

    res.status(201).json({
      transaction_id: created.transaction_id,
      user_id: created.user_id,
      amount: created.amount,
      transaction_type: created.transaction_type,
      vendor: created.vendor,
      description: created.description,
      transaction_date: created.transaction_date,
      category_id: created.category_id,
      payment_method: created.payment_method, // ✅ explicitly add it
      category_name, // ✅ from second query
    })
    


  } catch (error) {
    console.error("Error creating transaction:", error)
    res.status(500).json({ error: "Failed to create transaction" })
  }
}

// PUT /transactions/:id
export const updateTransaction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const {
      amount,
      transaction_type,
      category_id,
      vendor,
      transaction_date,
      description,
      payment_method,
    } = req.body

    if (!amount || !transaction_type || !category_id || !transaction_date) {
      res.status(400).json({ error: "Missing required fields" })
    }

    const result = await pool.query(
      `
      UPDATE transactions
      SET amount = $1,
          transaction_type = $2,
          category_id = $3,
          vendor = $4,
          transaction_date = $5,
          description = $6
          payment_method = $7
      WHERE transaction_id = $8
      RETURNING *
      `,
      [amount, transaction_type, category_id, vendor, transaction_date, description, payment_method, id]
    )

    //res.status(200).json(result.rows[0])

    const updated = result.rows[0]

    const categoryRes = await pool.query(
      `SELECT category_name FROM categories WHERE category_id = $1`,
      [updated.category_id]
    )

    const category_name = categoryRes.rows[0]?.category_name || "Unknown"

    res.status(200).json({ ...updated, category_name })

  } catch (error) {
    console.error("Error updating transaction:", error)
    res.status(500).json({ error: "Failed to update transaction" })
  }
}

// DELETE /transactions/:id
export const deleteTransaction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await pool.query("DELETE FROM transactions WHERE transaction_id = $1", [id])
    res.status(204).send()
  } catch (error) {
    console.error("Error deleting transaction:", error)
    res.status(500).json({ error: "Failed to delete transaction" })
  }
}

export const getSummary = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.query.user_id || req.body.user_id || 1) // get from session in real use

    // Get income and expenses
    const txnQuery = `
      SELECT
        COALESCE(SUM(CASE WHEN t.transaction_type = 'credit' AND c.category_name = 'Income' THEN t.amount ELSE 0 END), 0) AS income,
        COALESCE(SUM(CASE WHEN t.transaction_type = 'debit' THEN t.amount ELSE 0 END), 0) AS expenses
      FROM transactions t
      JOIN categories c ON t.category_id = c.category_id
      WHERE t.user_id = $1
    `
    const txnResult = await pool.query(txnQuery, [userId])
    const { income, expenses } = txnResult.rows[0]

    // Get asset value
    const assetResult = await pool.query(
      `SELECT COALESCE(SUM(current_value), 0) AS asset_total FROM assets WHERE user_id = $1`,
      [userId]
    )
    const { asset_total } = assetResult.rows[0]

    const netWorth = Number(income) - Number(expenses) + Number(asset_total)

    res.json({
      income: Number(income),
      expenses: Number(expenses),
      netWorth,
    })
  } catch (error) {
    console.error("Error fetching summary:", error)
    res.status(500).json({ error: "Failed to load summary" })
  }
}

