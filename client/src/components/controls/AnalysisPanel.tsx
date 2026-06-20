'use client';

import { useMemo, useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { useAnalysis } from '@/hooks/useAnalysis';
import { analyseScene, scoreColor } from '@/lib/shadowAnalysis';
import { sunAnglesFromDateTime, sunDirection, isSunUp } from '@/lib/sun';
import { PanelAnalysis, PanelClass, TableAnalysis } from '@/types';

const CLASS_COLOR: Record<PanelClass, string> = {
  Optimal: 'text-emerald-400',
  Good: 'text-lime-400',
  Moderate: 'text-amber-400',
  Critical: 'text-red-400',
};

function PanelCell({ p }: { p: PanelAnalysis }) {
  return (
    <div
      className="rounded p-1.5 text-[10px] leading-tight text-slate-900 font-medium"
      style={{ backgroundColor: scoreColor(p.score) }}
      title={`Panel ${p.panelIndex + 1}
Score: ${p.score}/100 (${p.classification})
Shaded: ${(p.shadedFraction * 100).toFixed(0)}%
EOF: ${(p.eof * 100).toFixed(0)}%
String penalty: ${(p.stringPenalty * 100).toFixed(0)}%`}
    >
      <div className="font-bold">{p.score}</div>
      <div>EOF {(p.eof * 100).toFixed(0)}%</div>
    </div>
  );
}

function TableCard({ t, index }: { t: TableAnalysis; index: number }) {
  // panels are ordered row-major (row 0 cols 0..2, row 1 cols 0..2)
  return (
    <div className="bg-slate-800/60 rounded-lg p-3 mb-3">
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold text-slate-100">Solar Table {index + 1}</span>
        <span className={`text-sm font-bold ${CLASS_COLOR[t.classification]}`}>
          {t.score}/100 · {t.classification}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-1 mb-2">
        {[...t.panels]
          .sort((a, b) => a.panelIndex - b.panelIndex)
          .map((p) => (
            <PanelCell key={p.panelIndex} p={p} />
          ))}
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs text-slate-300">
        <Metric label="Avg shaded" value={`${(t.avgShadedFraction * 100).toFixed(0)}%`} />
        <Metric label="Avg EOF" value={`${(t.avgEof * 100).toFixed(0)}%`} />
        <Metric label="Efficiency" value={`${(t.avgEffFactor * 100).toFixed(0)}%`} />
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-900/60 rounded px-2 py-1">
      <div className="text-slate-400 text-[10px]">{label}</div>
      <div className="font-mono text-slate-100">{value}</div>
    </div>
  );
}

/** Bonus: average efficiency across the daylight hours of the selected date. */
function useDailySummary() {
  const objects = useAppSelector((s) => s.scene.objects);
  const { date, latitude, longitude } = useAppSelector((s) => s.sun);
  return useMemo(() => {
    let sumEff = 0;
    let count = 0;
    let bestEff = -1;
    let bestMin = 0;
    for (let m = 0; m < 24 * 60; m += 30) {
      const a = sunAnglesFromDateTime(date, m, latitude, longitude);
      if (!isSunUp(a.elevation)) continue;
      const dir = sunDirection(a.azimuth, a.elevation);
      const res = analyseScene(objects, dir, true, m);
      const eff =
        res.tables.reduce((s, t) => s + t.avgEffFactor, 0) / (res.tables.length || 1);
      sumEff += eff;
      count++;
      if (eff > bestEff) {
        bestEff = eff;
        bestMin = m;
      }
    }
    return {
      avgEff: count ? sumEff / count : 0,
      daylightSamples: count,
      bestMin,
      bestEff: bestEff < 0 ? 0 : bestEff,
    };
  }, [objects, date, latitude, longitude]);
}

export default function AnalysisPanel() {
  const result = useAnalysis();
  const [showDaily, setShowDaily] = useState(false);

  return (
    <div>
      {!result.sunUp && (
        <div className="text-amber-400 text-sm mb-2">
          Sun is below the horizon — panels receive no direct irradiance.
        </div>
      )}

      {result.tables.map((t, i) => (
        <TableCard key={t.tableId} t={t} index={i} />
      ))}

      <button onClick={() => setShowDaily((v) => !v)} className="btn-ghost w-full">
        {showDaily ? 'Hide' : 'Show'} daily summary (bonus)
      </button>
      {showDaily && <DailySummary />}

      <div className="mt-3 text-[11px] text-slate-400 leading-relaxed border-t border-slate-700 pt-2">
        <p className="mb-1 font-semibold text-slate-300">Legend</p>
        Colour = panel performance score (green = optimal, red = critical).
        <br />
        <b>EOF</b> (Edge Occlusion Factor): shaded fraction on the panel&apos;s perimeter —
        used as a shading/efficiency factor that flags occlusion creeping in from
        adjacent structures.
      </div>
    </div>
  );
}

function DailySummary() {
  const { avgEff, daylightSamples, bestMin, bestEff } = useDailySummary();
  const fmt = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
  return (
    <div className="bg-slate-800/60 rounded-lg p-3 mt-2 text-xs text-slate-300 grid grid-cols-3 gap-2">
      <Metric label="Daylight avg eff." value={`${(avgEff * 100).toFixed(0)}%`} />
      <Metric label="Peak eff." value={`${(bestEff * 100).toFixed(0)}% @ ${fmt(bestMin)}`} />
      <Metric label="Samples" value={`${daylightSamples}`} />
    </div>
  );
}
