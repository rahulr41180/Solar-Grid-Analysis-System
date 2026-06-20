'use client';

import { useState } from 'react';
import ObjectControls from './ObjectControls';
import SunControls from './SunControls';
import AnalysisPanel from './AnalysisPanel';
import SettingsBar from './SettingsBar';
import SceneIO from './SceneIO';

type Tab = 'objects' | 'sun' | 'analysis';

const TABS: { id: Tab; label: string }[] = [
  { id: 'objects', label: 'Objects' },
  { id: 'sun', label: 'Sun' },
  { id: 'analysis', label: 'Analysis' },
];

export default function ControlPanel() {
  const [tab, setTab] = useState<Tab>('objects');

  return (
    <aside className="w-[340px] shrink-0 h-full bg-panel border-l border-slate-700 flex flex-col">
      <header className="px-4 py-3 border-b border-slate-700">
        <h1 className="text-lg font-bold text-slate-100">Solar Shadow Analysis</h1>
        <p className="text-xs text-slate-400">3D shading &amp; efficiency simulator</p>
      </header>

      <div className="px-4 pt-3">
        <SettingsBar />
        <div className="flex gap-1 mb-3">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 px-2 py-1.5 text-sm rounded ${
                tab === t.id ? 'bg-slate-700 text-accent' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 pb-4">
        {tab === 'objects' && (
          <>
            <ObjectControls />
            <SceneIO />
          </>
        )}
        {tab === 'sun' && <SunControls />}
        {tab === 'analysis' && <AnalysisPanel />}
      </div>
    </aside>
  );
}
