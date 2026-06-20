'use client';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleHeatmap, toggleShadows } from '@/store/settingsSlice';

function Toggle({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 text-xs px-2 py-1 rounded border ${
        on
          ? 'bg-sky-500/20 border-sky-400 text-accent'
          : 'bg-slate-800 border-slate-600 text-slate-400'
      }`}
    >
      {label}: {on ? 'On' : 'Off'}
    </button>
  );
}

export default function SettingsBar() {
  const dispatch = useAppDispatch();
  const { heatmap, showShadows } = useAppSelector((s) => s.settings);
  return (
    <div className="flex gap-2 mb-3">
      <Toggle on={heatmap} label="Heatmap" onClick={() => dispatch(toggleHeatmap())} />
      <Toggle on={showShadows} label="Shadows" onClick={() => dispatch(toggleShadows())} />
    </div>
  );
}
