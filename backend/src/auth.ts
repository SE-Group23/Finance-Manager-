import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import pool from "../db";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/signup", async (req: Request, res: Response) => {
  const { user_name, email, password } = req.body;

  if (!user_name || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    //  Check if user already exists
    const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: "Email already registered." });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Insert new user
    const result = await pool.query(
      `INSERT INTO users (user_name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING user_id, user_name, email`,
      [user_name, email, password_hash]
    );

    const user = result.rows[0];

    // Generate JWT
    const token = jwt.sign({ user_id: user.user_id }, process.env.JWT_SECRET as string, {
      expiresIn: "1h",
    });

    // Send response
    return res.status(201).json({
      message: "User registered successfully.",
      token,
      user,
    });
  } catch (err: any) {
    console.error(err.message);
    return res.status(500).json({ message: "Server error." });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Input validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    // Check if user exists
    const userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = userResult.rows[0];

    //  Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Update last_login timestamp
    await pool.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1',
      [user.user_id]
    );

    // Generate JWT
    const token = jwt.sign({ user_id: user.user_id }, process.env.JWT_SECRET as string, {
      expiresIn: '1h',
    });

    // Respond with token and basic user info
    res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        user_id: user.user_id,
        user_name: user.user_name,
        email: user.email,
        last_login: new Date(), // optional: send it back
      },
    });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error.' });
  }
});

router.get("/test-db", async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ message: "DB connected ✅", time: result.rows[0].now });
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ message: "DB connection failed ❌" });
  }
});



export default router;