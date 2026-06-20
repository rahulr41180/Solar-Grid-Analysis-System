// Business logic for scenes (validation, ownership, serialisation).
import crypto from 'crypto';
import { parseJson } from '../config/db';
import { badRequest, forbidden, notFound } from '../utils/http';
import { validateSceneObjects } from '../utils/validateScene';
import { SceneObject } from '../analysis/types';
import {
  SceneRow,
  createScene as createSceneRow,
  deleteScene as deleteSceneRow,
  findSceneById,
  findSceneByShareToken,
  listAnonymousScenes,
  listScenesByUser,
  setShareToken,
  updateScene as updateSceneRow,
} from '../models/sceneModel';

export interface SceneDto {
  id: number;
  userId: number | null;
  name: string;
  objects: SceneObject[];
  shareToken: string | null;
  createdAt: string;
  updatedAt: string;
}

function toDto(row: SceneRow): SceneDto {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    objects: parseJson<SceneObject[]>(row.data),
    shareToken: row.share_token,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Load a scene and enforce ownership. Anonymous scenes (null user) are open. */
export async function loadOwnedScene(
  userId: number | undefined,
  id: string | number
): Promise<SceneRow> {
  const row = await findSceneById(id);
  if (!row) throw notFound('Scene not found');
  if (row.user_id !== null && row.user_id !== userId)
    throw forbidden('You do not own this scene');
  return row;
}

/** Scene objects for a loaded row (used by the analysis service). */
export function sceneObjects(row: SceneRow): SceneObject[] {
  return parseJson<SceneObject[]>(row.data);
}

export async function listScenes(userId?: number): Promise<SceneDto[]> {
  const rows = userId ? await listScenesByUser(userId) : await listAnonymousScenes();
  return rows.map(toDto);
}

export async function createScene(
  userId: number | undefined,
  name: string,
  objects: unknown
): Promise<SceneDto> {
  if (!name || typeof name !== 'string') throw badRequest('`name` is required');
  const validated = validateSceneObjects(objects);
  const id = await createSceneRow(userId ?? null, name, JSON.stringify(validated));
  const row = await findSceneById(id);
  return toDto(row!);
}

export async function getScene(userId: number | undefined, id: string): Promise<SceneDto> {
  const row = await loadOwnedScene(userId, id);
  return toDto(row);
}

export async function updateScene(
  userId: number | undefined,
  id: string,
  fields: { name?: unknown; objects?: unknown }
): Promise<SceneDto> {
  await loadOwnedScene(userId, id);
  const update: { name?: string; dataJson?: string } = {};
  if (typeof fields.name === 'string') update.name = fields.name;
  if (fields.objects !== undefined)
    update.dataJson = JSON.stringify(validateSceneObjects(fields.objects));
  if (update.name === undefined && update.dataJson === undefined)
    throw badRequest('Nothing to update');
  await updateSceneRow(Number(id), update);
  const row = await findSceneById(id);
  return toDto(row!);
}

export async function removeScene(userId: number | undefined, id: string): Promise<void> {
  await loadOwnedScene(userId, id);
  await deleteSceneRow(Number(id));
}

export async function shareScene(
  userId: number | undefined,
  id: string
): Promise<{ shareToken: string; url: string }> {
  const row = await loadOwnedScene(userId, id);
  let token = row.share_token;
  if (!token) {
    token = crypto.randomBytes(12).toString('hex');
    await setShareToken(row.id, token);
  }
  return { shareToken: token, url: `/api/share/${token}` };
}

export async function getSharedScene(token: string) {
  const row = await findSceneByShareToken(token);
  if (!row) throw notFound('Shared scene not found');
  return {
    id: row.id,
    name: row.name,
    objects: parseJson<SceneObject[]>(row.data),
    readOnly: true,
  };
}
