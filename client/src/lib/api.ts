// ---------------------------------------------------------------------------
// Thin client for the optional Express + MySQL backend.
//
// Enabled only when NEXT_PUBLIC_API_URL is set (e.g. http://localhost:4000).
// When unset, the app runs fully frontend-only and persistence falls back to
// localStorage (see lib/persistence.ts).
// ---------------------------------------------------------------------------

import { SceneObject } from '@/types';

const BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || '';
const TOKEN_KEY = 'solargrid.token';

export function apiEnabled(): boolean {
  return BASE.length > 0;
}

function authHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = window.localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ---- Types mirrored from the backend responses ----------------------------

export interface ApiScene {
  id: number;
  userId: number | null;
  name: string;
  objects: SceneObject[];
  shareToken: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiPreset {
  id: number;
  name: string;
  description: string | null;
  objects: SceneObject[];
}

// ---- Auth ------------------------------------------------------------------

export async function register(email: string, password: string) {
  const out = await request<{ token: string; user: { id: number; email: string } }>(
    '/api/auth/register',
    { method: 'POST', body: JSON.stringify({ email, password }) }
  );
  window.localStorage.setItem(TOKEN_KEY, out.token);
  return out.user;
}

export async function login(email: string, password: string) {
  const out = await request<{ token: string; user: { id: number; email: string } }>(
    '/api/auth/login',
    { method: 'POST', body: JSON.stringify({ email, password }) }
  );
  window.localStorage.setItem(TOKEN_KEY, out.token);
  return out.user;
}

export function logout() {
  window.localStorage.removeItem(TOKEN_KEY);
}

export function isLoggedIn(): boolean {
  return typeof window !== 'undefined' && !!window.localStorage.getItem(TOKEN_KEY);
}

// ---- Scenes ----------------------------------------------------------------

export async function apiListScenes(): Promise<ApiScene[]> {
  const out = await request<{ scenes: ApiScene[] }>('/api/scenes');
  return out.scenes;
}

export async function apiCreateScene(name: string, objects: SceneObject[]): Promise<ApiScene> {
  const out = await request<{ scene: ApiScene }>('/api/scenes', {
    method: 'POST',
    body: JSON.stringify({ name, objects }),
  });
  return out.scene;
}

export async function apiUpdateScene(
  id: number,
  patch: { name?: string; objects?: SceneObject[] }
): Promise<ApiScene> {
  const out = await request<{ scene: ApiScene }>(`/api/scenes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(patch),
  });
  return out.scene;
}

export async function apiDeleteScene(id: number): Promise<void> {
  await request<void>(`/api/scenes/${id}`, { method: 'DELETE' });
}

export async function apiShareScene(id: number): Promise<{ shareToken: string; url: string }> {
  return request(`/api/scenes/${id}/share`, { method: 'POST' });
}

// ---- Presets ---------------------------------------------------------------

export async function apiListPresets(): Promise<ApiPreset[]> {
  const out = await request<{ presets: ApiPreset[] }>('/api/presets');
  return out.presets;
}

// ---- Analysis --------------------------------------------------------------

export interface SunInput {
  azimuth?: number;
  elevation?: number;
  date?: string;
  minutes?: number;
  latitude?: number;
  longitude?: number;
}

export async function apiStoreSnapshot(sceneId: number, sun: SunInput) {
  return request(`/api/scenes/${sceneId}/analyses`, {
    method: 'POST',
    body: JSON.stringify(sun),
  });
}

export async function apiDailyAnalysis(
  sceneId: number,
  body: { date: string; latitude?: number; longitude?: number; stepMinutes?: number }
) {
  return request<{ summary: unknown }>(`/api/scenes/${sceneId}/daily-analysis`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function reportCsvUrl(sceneId: number, sun: SunInput): string {
  const params = new URLSearchParams();
  Object.entries(sun).forEach(([k, v]) => {
    if (v !== undefined) params.set(k, String(v));
  });
  return `${BASE}/api/scenes/${sceneId}/report.csv?${params.toString()}`;
}
