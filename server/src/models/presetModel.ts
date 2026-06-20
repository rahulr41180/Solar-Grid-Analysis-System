import { RowDataPacket } from 'mysql2';
import { pool } from '../config/db';

export interface PresetRow extends RowDataPacket {
  id: number;
  name: string;
  description: string | null;
  data: unknown; 
}

export async function listPresets(): Promise<PresetRow[]> {
  const [rows] = await pool.query<PresetRow[]>(
    'SELECT id, name, description, data FROM presets ORDER BY id'
  );
  return rows;
}
