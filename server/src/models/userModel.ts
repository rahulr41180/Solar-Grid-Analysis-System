import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../config/db';

export interface UserRow extends RowDataPacket {
  id: number;
  email: string;
  password_hash: string;
  created_at: string;
}

export async function createUser(email: string, passwordHash: string): Promise<number> {
  const [res] = await pool.query<ResultSetHeader>(
    'INSERT INTO users (email, password_hash) VALUES (?, ?)',
    [email, passwordHash]
  );
  return res.insertId;
}

export async function findUserByEmail(email: string): Promise<UserRow | undefined> {
  const [rows] = await pool.query<UserRow[]>(
    'SELECT id, email, password_hash, created_at FROM users WHERE email = ? LIMIT 1',
    [email]
  );
  return rows[0];
}
