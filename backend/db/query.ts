/*
A simple query wrapper that uses the pool from index.ts. This function standardizes error handling and parameterized queries.
*/

import pool from './index';

interface QueryResult<T = any> {
  rows: T[];
}

export async function query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
  try {
    const result = await pool.query<T>(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}
