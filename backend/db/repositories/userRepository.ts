// db/repositories/userRepository.ts
import { query } from '../query';
import { User } from '../models/user';

export async function createUser(user: User): Promise<User> {
  const { user_name, email, password_hash } = user;
  const result = await query<User>(
    `INSERT INTO users (user_name, email, password_hash) 
     VALUES ($1, $2, $3) RETURNING *`,
    [user_name, email, password_hash]
  );
  return result.rows[0];
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await query<User>(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  );
  return result.rows.length ? result.rows[0] : null;
}

export async function updateLastLogin(userId: number): Promise<void> {
  await query(
    `UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1`,
    [userId]
  );
}
