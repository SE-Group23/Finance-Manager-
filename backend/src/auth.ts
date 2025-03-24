import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import pool from '../db';

const router = express.Router();

// Signup Route
router.post('/signup', async (req: Request, res: Response) => {
  const { user_name, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const newUser = await pool.query(
      "INSERT INTO users (user_name, email, password_hash) VALUES ($1, $2, $3) RETURNING user_id, user_name, email, created_on",
      [user_name, email, hashedPassword]
    );

    res.status(201).json(newUser.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
