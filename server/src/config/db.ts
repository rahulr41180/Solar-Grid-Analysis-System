import mysql from 'mysql2/promise';
import { env } from './env';

// A shared connection pool. JSON columns are returned already parsed by mysql2.
export const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Ensure DATETIME values come back as JS strings we can serialise directly.
  dateStrings: true,
});

/** Pool that is NOT bound to a database, for creating the schema the first time. */
export function rootPool() {
  return mysql.createPool({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    waitForConnections: true,
    connectionLimit: 2,
    multipleStatements: true,
  });
}

/** mysql2 may return JSON columns as objects OR strings depending on version. */
export function parseJson<T>(value: unknown): T {
  if (value && typeof value === 'object') return value as T;
  try {
    return JSON.parse(String(value)) as T;
  } catch {
    return value as T;
  }
}
