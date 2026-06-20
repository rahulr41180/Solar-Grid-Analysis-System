'use client';

import dynamic from 'next/dynamic';
import ControlPanel from '@/components/controls/ControlPanel';
import PlaybackDriver from '@/components/PlaybackDriver';

const SceneCanvas = dynamic(() => import('@/components/scene/SceneCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center text-slate-400">Loading 3D scene…</div>
  ),
});

export default function Home() {
  return (
    <main className="flex h-screen w-screen">
      <PlaybackDriver />
      <div className="flex-1 relative">
        <SceneCanvas />
        <div className="absolute top-3 left-3 text-xs text-slate-300/80 bg-slate-900/50 rounded px-2 py-1 pointer-events-none">
          Drag to orbit · scroll to zoom · click an object to select
        </div>
      </div>
      <ControlPanel />
    </main>
  );
}
