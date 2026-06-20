
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

export function sceneReadSource(): 'local' | 'db' {
  const wantsDb = process.env.NEXT_PUBLIC_SCENE_SOURCE === 'db';
  return wantsDb && apiEnabled() ? 'db' : 'local';
}

export function isBackendActive(): boolean {
  return apiEnabled();
}

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

async function dbSave(name: string, objects: SceneObject[]) {
  const existing = (await apiListScenes()).find((s) => s.name === name);
  if (existing) await apiUpdateScene(existing.id, { objects });
  else await apiCreateScene(name, objects);
}

async function dbDelete(name: string) {
  const found = (await apiListScenes()).find((s) => s.name === name);
  if (found) await apiDeleteScene(found.id);
}

export async function saveScene(name: string, objects: SceneObject[]): Promise<void> {
  const scenes = readAll().filter((s) => s.name !== name);
  scenes.push({ name, objects, savedAt: Date.now() });
  writeAll(scenes);

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
  writeAll(readAll().filter((s) => s.name !== name));
  if (apiEnabled()) {
    try {
      await dbDelete(name);
    } catch (e) {
      console.warn('Scene removed from localStorage but DB delete failed:', e);
    }
  }
}
