'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loadScene } from '@/store/sceneSlice';
import {
  deleteScene,
  isBackendActive,
  listScenes,
  loadSceneByName,
  saveScene,
  SavedScene,
} from '@/lib/persistence';

export default function SceneIO() {
  const dispatch = useAppDispatch();
  const objects = useAppSelector((s) => s.scene.objects);
  const [name, setName] = useState('');
  const [scenes, setScenes] = useState<SavedScene[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setScenes(await listScenes());
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border-t border-slate-700 pt-3 mt-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-wide text-slate-400">Save / Load</span>
        <span className="text-[10px] text-slate-500">
          {isBackendActive() ? 'localStorage + DB' : 'localStorage'}
        </span>
      </div>
      <div className="flex gap-2 mb-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="scene name"
          className="flex-1 rounded bg-slate-800 border border-slate-600 px-2 py-1 text-sm text-slate-100"
        />
        <button
          disabled={busy}
          onClick={() =>
            run(async () => {
              if (!name.trim()) return;
              await saveScene(name.trim(), objects);
              setName('');
              await refresh();
            })
          }
          className="btn disabled:opacity-50"
        >
          Save
        </button>
      </div>

      {error && <p className="text-xs text-red-400 mb-2">{error}</p>}

      <ul className="space-y-1 max-h-28 overflow-auto">
        {scenes.length === 0 && <li className="text-xs text-slate-500">No saved scenes.</li>}
        {scenes.map((s) => (
          <li key={s.name} className="flex items-center justify-between text-sm">
            <button
              disabled={busy}
              onClick={() =>
                run(async () => {
                  const objs = await loadSceneByName(s.name);
                  if (objs) dispatch(loadScene(objs));
                })
              }
              className="text-accent hover:underline disabled:opacity-50"
            >
              {s.name}
            </button>
            <button
              disabled={busy}
              onClick={() =>
                run(async () => {
                  await deleteScene(s.name);
                  await refresh();
                })
              }
              className="text-slate-500 hover:text-red-400 text-xs disabled:opacity-50"
            >
              delete
            </button>
          </li>
        ))}
      </ul>

      <Link
        href="/saved"
        className="mt-3 block text-center btn-ghost w-full"
      >
        View saved scenes →
      </Link>
    </div>
  );
}
