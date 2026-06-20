// ---------------------------------------------------------------------------
// Scene persistence.
//
// WRITE strategy: every save is written to BOTH localStorage and (when the
// backend is configured) the Express + MySQL API. The DB write is best-effort —
// if it fails, the localStorage save still succeeds, so the app keeps working.
//
// READ strategy: controlled by `sceneReadSource()`.
//   - Default 'local'  → lists/loads come from localStorage (current behaviour).
//   - Set NEXT_PUBLIC_SCENE_SOURCE=db (once DB credentials are configured) to
//     read from the database instead. Writes still go to both sides regardless.
// ---------------------------------------------------------------------------

import { SceneObject } from '@/types';
import {
  apiEnabled,
  apiListScenes,
  apiCreateScene,
  apiUpdateScene,
  apiDeleteScene,
} from './api';

const KEY = 'solargrid.scenes';

export interface SavedScene {
  name: string;
  objects: SceneObject[];
  savedAt: number;
}

/** Where list/load reads come from right now. */
export function sceneReadSource(): 'local' | 'db' {
  const wantsDb = process.env.NEXT_PUBLIC_SCENE_SOURCE === 'db';
  return wantsDb && apiEnabled() ? 'db' : 'local';
}

/** Whether the backend is reachable (used to decide DB dual-writes). */
export function isBackendActive(): boolean {
  return apiEnabled();
}

// ---- localStorage helpers --------------------------------------------------

function readAll(): SavedScene[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(window.localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

function writeAll(scenes: SavedScene[]) {
  window.localStorage.setItem(KEY, JSON.stringify(scenes));
}

// ---- DB (best-effort) ------------------------------------------------------

async function dbSave(name: string, objects: SceneObject[]) {
  const existing = (await apiListScenes()).find((s) => s.name === name);
  if (existing) await apiUpdateScene(existing.id, { objects });
  else await apiCreateScene(name, objects);
}

async function dbDelete(name: string) {
  const found = (await apiListScenes()).find((s) => s.name === name);
  if (found) await apiDeleteScene(found.id);
}

// ---- Public async interface ------------------------------------------------

export async function saveScene(name: string, objects: SceneObject[]): Promise<void> {
  // 1) localStorage (source of truth for now)
  const scenes = readAll().filter((s) => s.name !== name);
  scenes.push({ name, objects, savedAt: Date.now() });
  writeAll(scenes);

  // 2) database (best-effort — never blocks the local save)
  if (apiEnabled()) {
    try {
      await dbSave(name, objects);
    } catch (e) {
      console.warn('Scene saved to localStorage but DB save failed:', e);
    }
  }
}

export async function listScenes(): Promise<SavedScene[]> {
  if (sceneReadSource() === 'db') {
    const scenes = await apiListScenes();
    return scenes.map((s) => ({
      name: s.name,
      objects: s.objects,
      savedAt: new Date(s.updatedAt).getTime() || 0,
    }));
  }
  return readAll().sort((a, b) => b.savedAt - a.savedAt);
}

export async function loadSceneByName(name: string): Promise<SceneObject[] | null> {
  if (sceneReadSource() === 'db') {
    const found = (await apiListScenes()).find((s) => s.name === name);
    return found ? found.objects : null;
  }
  const found = readAll().find((s) => s.name === name);
  return found ? found.objects : null;
}

export async function deleteScene(name: string): Promise<void> {
  // remove locally
  writeAll(readAll().filter((s) => s.name !== name));
  // and from the database (best-effort)
  if (apiEnabled()) {
    try {
      await dbDelete(name);
    } catch (e) {
      console.warn('Scene removed from localStorage but DB delete failed:', e);
    }
  }
}
