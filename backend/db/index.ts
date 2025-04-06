// This file is responsible for connecting to the PostgreSQL database using the pg library.
// It was previously db.ts in the backend folder

import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export default pool;
