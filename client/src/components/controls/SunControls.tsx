'use client';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setAzimuth,
  setDate,
  setElevation,
  setLatitude,
  setLongitude,
  setMinutes,
  setMode,
  setPlaying,
} from '@/store/sunSlice';
import { formatMinutes } from '@/lib/sun';
import { Slider, NumberField } from './Field';

const PRESETS: { label: string; date: string; minutes: number }[] = [
  { label: '21 Jun · 9:00', date: '2026-06-21', minutes: 9 * 60 },
  { label: '21 Jun · 13:00', date: '2026-06-21', minutes: 13 * 60 },
  { label: '21 Dec · 16:00', date: '2026-12-21', minutes: 16 * 60 },
];

export default function SunControls() {
  const dispatch = useAppDispatch();
  const sun = useAppSelector((s) => s.sun);

  return (
    <div>
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => dispatch(setMode('datetime'))}
          className={sun.mode === 'datetime' ? 'btn-active' : 'btn'}
        >
          Date / Time
        </button>
        <button
          onClick={() => dispatch(setMode('manual'))}
          className={sun.mode === 'manual' ? 'btn-active' : 'btn'}
        >
          Manual
        </button>
      </div>

      {sun.mode === 'manual' ? (
        <>
          <Slider label="Azimuth (0=N, 90=E, 180=S)" value={sun.azimuth} min={0} max={360} step={1} unit="°" onChange={(v) => dispatch(setAzimuth(v))} />
          <Slider label="Elevation" value={sun.elevation} min={-10} max={90} step={1} unit="°" onChange={(v) => dispatch(setElevation(v))} />
        </>
      ) : (
        <>
          <label className="block mb-2 text-sm">
            <div className="text-slate-300 mb-1">Date</div>
            <input
              type="date"
              value={sun.date}
              onChange={(e) => dispatch(setDate(e.target.value))}
              className="w-full rounded bg-slate-800 border border-slate-600 px-2 py-1 text-slate-100"
            />
          </label>
          <Slider
            label={`Time · ${formatMinutes(sun.minutes)}`}
            value={sun.minutes}
            min={0}
            max={24 * 60 - 1}
            step={5}
            onChange={(v) => dispatch(setMinutes(v))}
          />
          <div className="grid grid-cols-2 gap-2">
            <NumberField label="Latitude" value={sun.latitude} step={0.5} onChange={(v) => dispatch(setLatitude(v))} />
            <NumberField label="Longitude" value={sun.longitude} step={0.5} onChange={(v) => dispatch(setLongitude(v))} />
          </div>

          <div className="flex items-center gap-2 my-2">
            <button
              onClick={() => dispatch(setPlaying(!sun.playing))}
              className={sun.playing ? 'btn-active' : 'btn'}
            >
              {sun.playing ? '❚❚ Pause' : '▶ Play day'}
            </button>
            <span className="text-xs text-slate-400">Animate sun across the day</span>
          </div>

          <div className="flex flex-wrap gap-1 mt-1">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  dispatch(setDate(p.date));
                  dispatch(setMinutes(p.minutes));
                }}
                className="text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                {p.label}
              </button>
            ))}
          </div>
        </>
      )}

      <div className="mt-3 text-xs text-slate-400 font-mono">
        az {sun.azimuth.toFixed(1)}° · el {sun.elevation.toFixed(1)}°
        {sun.elevation <= 0.5 && <span className="text-amber-400"> · sun below horizon</span>}
      </div>
    </div>
  );
}
