import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../config/db';

export interface SceneRow extends RowDataPacket {
  id: number;
  user_id: number | null;
  name: string;
  data: unknown; 
  share_token: string | null;
  created_at: string;
  updated_at: string;
}

export async function createScene(
  userId: number | null,
  name: string,
  dataJson: string
): Promise<number> {
  const [res] = await pool.query<ResultSetHeader>(
    'INSERT INTO scenes (user_id, name, data) VALUES (?, ?, CAST(? AS JSON))',
    [userId, name, dataJson]
  );
  return res.insertId;
}

export async function findSceneById(id: number | string): Promise<SceneRow | undefined> {
  const [rows] = await pool.query<SceneRow[]>('SELECT * FROM scenes WHERE id = ? LIMIT 1', [id]);
  return rows[0];
}

export async function listScenesByUser(userId: number): Promise<SceneRow[]> {
  const [rows] = await pool.query<SceneRow[]>(
    'SELECT * FROM scenes WHERE user_id = ? ORDER BY updated_at DESC',
    [userId]
  );
  return rows;
}

export async function listAnonymousScenes(): Promise<SceneRow[]> {
  const [rows] = await pool.query<SceneRow[]>(
    'SELECT * FROM scenes WHERE user_id IS NULL ORDER BY updated_at DESC'
  );
  return rows;
}

export async function updateScene(
  id: number,
  fields: { name?: string; dataJson?: string }
): Promise<void> {
  const sets: string[] = [];
  const params: unknown[] = [];
  if (fields.name !== undefined) {
    sets.push('name = ?');
    params.push(fields.name);
  }
  if (fields.dataJson !== undefined) {
    sets.push('data = CAST(? AS JSON)');
    params.push(fields.dataJson);
  }
  if (sets.length === 0) return;
  params.push(id);
  await pool.query(`UPDATE scenes SET ${sets.join(', ')} WHERE id = ?`, params);
}

export async function deleteScene(id: number): Promise<void> {
  await pool.query('DELETE FROM scenes WHERE id = ?', [id]);
}

export async function setShareToken(id: number, token: string): Promise<void> {
  await pool.query('UPDATE scenes SET share_token = ? WHERE id = ?', [token, id]);
}

export async function findSceneByShareToken(token: string): Promise<SceneRow | undefined> {
  const [rows] = await pool.query<SceneRow[]>(
    'SELECT * FROM scenes WHERE share_token = ? LIMIT 1',
    [token]
  );
  return rows[0];
}
