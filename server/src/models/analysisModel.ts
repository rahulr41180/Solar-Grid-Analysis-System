import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../config/db';

export interface AnalysisRow extends RowDataPacket {
  id: number;
  scene_id: number;
  kind: string;
  sun_azimuth: number | null;
  sun_elevation: number | null;
  result: unknown; // JSON column
  created_at: string;
}

export async function createAnalysis(params: {
  sceneId: number;
  kind: 'snapshot' | 'daily';
  azimuth?: number | null;
  elevation?: number | null;
  resultJson: string;
}): Promise<number> {
  const [res] = await pool.query<ResultSetHeader>(
    `INSERT INTO analyses (scene_id, kind, sun_azimuth, sun_elevation, result)
     VALUES (?, ?, ?, ?, CAST(? AS JSON))`,
    [
      params.sceneId,
      params.kind,
      params.azimuth ?? null,
      params.elevation ?? null,
      params.resultJson,
    ]
  );
  return res.insertId;
}

export async function listAnalysesByScene(sceneId: number | string): Promise<AnalysisRow[]> {
  const [rows] = await pool.query<AnalysisRow[]>(
    `SELECT id, scene_id, kind, sun_azimuth, sun_elevation, result, created_at
     FROM analyses WHERE scene_id = ? ORDER BY created_at DESC`,
    [sceneId]
  );
  return rows;
}
