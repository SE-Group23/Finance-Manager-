// AUTH CONTROLLER
import { Request, Response, NextFunction, RequestHandler } from 'express';
import bcrypt from "bcrypt";
import { pool } from "../db";
import { generateToken } from "../auth";
import {sendPasswordResetEmail} from "../utils/mailer"
import crypto from 'crypto';
// import validator from 'validator';

/**
 * UC-1: Register
 * Inputs: fullName, email, password
 * Process: Validate inputs, check if email exists, hash password, insert user, simulate sending confirmation email.
 */
export const registerUser: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { fullName, email, password } = req.body;
    const missingFields: string[] = [];
    if (!fullName) missingFields.push("full name");
    if (!email) missingFields.push("email");
    if (!password) missingFields.push("password");

    if (missingFields.length > 0) {
      const errorMessage = `Please provide ${missingFields.join(", ")}`;
      res.status(400).json({ error: errorMessage });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: "Please provide a valid email address" });
      return;
    }
    // Password strength checks
    const passwordIssues: string[] = [];

    if (password.length < 8) {
      passwordIssues.push("be at least 8 characters long");
    }
    if (!/\d/.test(password)) {
      passwordIssues.push("include at least one number");
    }
    if (!/[A-Z]/.test(password)) {
      passwordIssues.push("include at least one uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      passwordIssues.push("include at least one lowercase letter");
    }

    if (passwordIssues.length > 0) {
      const errorMessage = `Password must ${passwordIssues.join(", ")}`;
      res.status(400).json({ error: errorMessage });
      return;
    }

    // Check if the email already exists
    const existing = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (existing.rows.length > 0) {
      res.status(409).json({ error: "Email already in use" });
      return;
    }
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // Insert the new user
    const result = await pool.query(
      `INSERT INTO users (user_name, email, password_hash) 
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
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration error" });
  }
};

/**
 * UC-2: Login
 * Inputs: email, password
 * Process: Verify credentials and return JWT token.
 */
export const loginUser: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Check for missing fields
    const missingFields: string[] = [];
    if (!email) missingFields.push("email");
    if (!password) missingFields.push("password");

    if (missingFields.length > 0) {
      const errorMessage = `Please provide ${missingFields.join(", ")}`;
      res.status(400).json({ error: errorMessage });
      return;
    }

    // Lookup user
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (result.rows.length === 0) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const user = result.rows[0];

    // Check password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // Update last_login
    await pool.query("UPDATE users SET last_login = NOW() WHERE user_id = $1", [
      user.user_id,
    ]);

    // Generate token
    const token = generateToken(user.user_id);
    res.json({ token, userId: user.user_id });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login error" });
  }
};

// Updated forgotPassword and new resetPassword functions for authController.ts


/**
 * UC-3: Forgot Password
 * Inputs: email
 * Process: Generate reset token, store it, and send reset link.
 */
export const forgotPassword: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // console.log("Fuck you!")
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Please provide your email' });
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Please provide a valid email address' });
      return;
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      // Don't reveal that email doesn't exist (for security reasons)
      res.status(200).json({ message: 'If this email exists, a reset link has been sent.' });
      return;
    }

    const user = result.rows[0];

    // Generate random reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash the token for security
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    // Set token expiration (1 hour from now)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    
    // Save to database
    await pool.query(
      'UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE user_id = $3',
      [hashedToken, expiresAt, user.user_id]
    );
    console.log(process.env.CLIENT_URL)
    // Build the reset URL (frontend will handle this route)
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${user.user_id}/${resetToken}`;

    // For development - log the URL (remove in production)
    console.log(`Password reset link: ${resetUrl}`);
    
    // TODO: Send actual email with resetUrl when email functionality is integrated
    await sendPasswordResetEmail(email, resetUrl);
    console.log(`Password reset link sent to ${email} for user_id=${user.user_id}`);

    res.status(200).json({ message: 'If this email exists, a reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Forgot password error' });
  }
};

/**
 * UC-4: Reset Password
 * Inputs: userId, token, newPassword
 * Process: Verify token, update password if valid.
 */
export const resetPassword: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  console.log("I am here")
  try {
    const { userId, token, newPassword } = req.body;
    
    // Basic validation
    if (!userId || !token || !newPassword) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Password strength checks (reusing from register)
    const passwordIssues: string[] = [];

    if (newPassword.length < 8) {
      passwordIssues.push("be at least 8 characters long");
    }
    if (!/\d/.test(newPassword)) {
      passwordIssues.push("include at least one number");
    }
    if (!/[A-Z]/.test(newPassword)) {
      passwordIssues.push("include at least one uppercase letter");
    }
    if (!/[a-z]/.test(newPassword)) {
      passwordIssues.push("include at least one lowercase letter");
    }

    if (passwordIssues.length > 0) {
      const errorMessage = `Password must ${passwordIssues.join(", ")}`;
      res.status(400).json({ error: errorMessage });
      return;
    }
    
    // Hash the received token to compare with stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    // Find user with the token and check if token is still valid
    const userResult = await pool.query(
      'SELECT * FROM users WHERE user_id = $1 AND reset_password_token = $2 AND reset_password_expires > $3',
      [userId, hashedToken, new Date()]
    );
    
    if (userResult.rows.length === 0) {
      res.status(400).json({ error: 'Invalid or expired reset token' });
      return;
    }
    
    const user = userResult.rows[0];
    
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update user's password and clear reset token fields
    await pool.query(
      'UPDATE users SET password_hash = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE user_id = $2',
      [hashedPassword, user.user_id]
    );
    
    res.status(200).json({ message: 'Password has been reset successfully' });
    
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};