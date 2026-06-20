'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { loadScene } from '@/store/sceneSlice';
import {
  deleteScene,
  isBackendActive,
  listScenes,
  loadSceneByName,
  sceneReadSource,
  SavedScene,
} from '@/lib/persistence';
import { analyseScene, scoreColor } from '@/lib/shadowAnalysis';
import { sunAnglesFromDateTime, sunDirection, isSunUp } from '@/lib/sun';
import { DEFAULT_LATITUDE, DEFAULT_LONGITUDE } from '@/lib/constants';
import { SceneObject } from '@/types';

const REF = sunAnglesFromDateTime('2026-06-21', 13 * 60, DEFAULT_LATITUDE, DEFAULT_LONGITUDE);

function composition(objs: SceneObject[]) {
  return {
    buildings: objs.filter((o) => o.type === 'building').length,
    tanks: objs.filter((o) => o.type === 'tank').length,
    tables: objs.filter((o) => o.type === 'table').length,
  };
}

function referenceScore(objs: SceneObject[]): number | null {
  const dir = sunDirection(REF.azimuth, REF.elevation);
  const res = analyseScene(objs, dir, isSunUp(REF.elevation), 13 * 60);
  if (res.tables.length === 0) return null;
  return Math.round(res.tables.reduce((s, t) => s + t.score, 0) / res.tables.length);
}

export default function SavedScenesPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [scenes, setScenes] = useState<SavedScene[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setScenes(await listScenes());
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleLoad = async (name: string) => {
    const objs = await loadSceneByName(name);
    if (objs) {
      dispatch(loadScene(objs));
      router.push('/');
    }
  };

  const handleDelete = async (name: string) => {
    await deleteScene(name);
    await refresh();
  };

  return (
    <main className="min-h-screen w-screen overflow-auto bg-slate-950 text-slate-100">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Saved Scenes</h1>
            <p className="text-sm text-slate-400">
              Reading from <b>{sceneReadSource()}</b>
              {isBackendActive() ? ' · backend connected' : ' · backend not configured'} · saves are
              written to localStorage{isBackendActive() ? ' and the database' : ''}.
            </p>
          </div>
          <Link href="/" className="btn">
            ← Back to app
          </Link>
        </div>

        {error && <p className="text-red-400 mb-4">{error}</p>}
        {loading ? (
          <p className="text-slate-400">Loading…</p>
        ) : scenes.length === 0 ? (
          <div className="text-slate-400 border border-slate-800 rounded-lg p-8 text-center">
            No saved scenes yet. Go back, build a scene, and click <b>Save</b>.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-sm">
              <thead className="bg-slate-900 text-slate-300">
                <tr>
                  <th className="text-left px-4 py-2">Name</th>
                  <th className="text-center px-3 py-2">Buildings</th>
                  <th className="text-center px-3 py-2">Tanks</th>
                  <th className="text-center px-3 py-2">Tables</th>
                  <th className="text-center px-3 py-2" title="Average table score at 21 Jun 13:00">
                    Report score
                  </th>
                  <th className="text-left px-3 py-2">Saved</th>
                  <th className="text-right px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {scenes.map((s) => {
                  const c = composition(s.objects);
                  const score = referenceScore(s.objects);
                  return (
                    <tr key={s.name} className="border-t border-slate-800 hover:bg-slate-900/50">
                      <td className="px-4 py-2 font-medium">{s.name}</td>
                      <td className="text-center px-3 py-2">{c.buildings}</td>
                      <td className="text-center px-3 py-2">{c.tanks}</td>
                      <td className="text-center px-3 py-2">{c.tables}</td>
                      <td className="text-center px-3 py-2">
                        {score === null ? (
                          <span className="text-slate-500">—</span>
                        ) : (
                          <span
                            className="inline-block rounded px-2 py-0.5 text-slate-900 font-semibold"
                            style={{ backgroundColor: scoreColor(score) }}
                          >
                            {score}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-slate-400">
                        {s.savedAt ? new Date(s.savedAt).toLocaleString() : '—'}
                      </td>
                      <td className="px-4 py-2 text-right whitespace-nowrap">
                        <button onClick={() => handleLoad(s.name)} className="btn mr-2">
                          Load
                        </button>
                        <button
                          onClick={() => handleDelete(s.name)}
                          className="btn-ghost text-red-300 hover:text-red-400"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-xs text-slate-500 mt-4">
          “Report score” is the average panel-table performance at a reference sun position
          (21 June, 13:00). Load a scene to explore its full shadow &amp; efficiency report
          (including EOF) in the app’s Analysis panel.
        </p>
      </div>
    </main>
  );
}
