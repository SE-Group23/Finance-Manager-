import { Request, Response, NextFunction, RequestHandler } from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../db';
import { generateToken } from '../auth';

/**
 * UC-1: Register
 * Inputs: fullName, email, password
 * Process: Validate inputs, check if email exists, hash password, insert user, simulate sending confirmation email.
 */
export const registerUser: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      res.status(400).json({ error: 'Please provide full name, email, and password' });
      return;
    }
    // Check if the email already exists
    const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      res.status(400).json({ error: 'Email already in use' });
      return;
    }
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // Insert the new user
    const result = await pool.query(
      `INSERT INTO users (full_name, email, password_hash) 
       VALUES ($1, $2, $3) 
       RETURNING user_id`,
      [fullName, email, hashedPassword]
    );
    const userId = result.rows[0].user_id;
    // Simulate sending a confirmation email
    console.log(`Confirmation email sent to ${email}`);
    // Generate a JWT token
    const token = generateToken(userId);
    res.status(201).json({ token, userId });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration error' });
  }
};

/**
 * UC-2: Login
 * Inputs: email, password
 * Process: Verify credentials and return JWT token.
 */
export const loginUser: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Please provide email and password' });
      return;
    }
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    // Update last_login timestamp (optional)
    await pool.query('UPDATE users SET last_login = NOW() WHERE user_id = $1', [user.user_id]);
    // Generate JWT token
    const token = generateToken(user.user_id);
    res.json({ token, userId: user.user_id });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login error' });
  }
};
