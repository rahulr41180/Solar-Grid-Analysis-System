'use client';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addBuilding,
  addTable,
  addTank,
  removeObject,
  selectObject,
  updateObject,
  resetScene,
} from '@/store/sceneSlice';
import { Building, SolarTable, Tank } from '@/types';
import { Slider } from './Field';

function BuildingEditor({ b }: { b: Building }) {
  const dispatch = useAppDispatch();
  const set = (changes: Partial<Building>) => dispatch(updateObject({ id: b.id, changes }));
  return (
    <>
      <Slider label="Position X" value={b.x} min={-25} max={25} step={0.5} unit="m" onChange={(x) => set({ x })} />
      <Slider label="Position Y" value={b.y} min={-25} max={25} step={0.5} unit="m" onChange={(y) => set({ y })} />
      <Slider label="Width" value={b.width} min={0.5} max={15} step={0.5} unit="m" onChange={(width) => set({ width })} />
      <Slider label="Length" value={b.length} min={0.5} max={15} step={0.5} unit="m" onChange={(length) => set({ length })} />
      <Slider label="Height" value={b.height} min={0.5} max={20} step={0.5} unit="m" onChange={(height) => set({ height })} />
    </>
  );
}

function TankEditor({ t }: { t: Tank }) {
  const dispatch = useAppDispatch();
  const set = (changes: Partial<Tank>) => dispatch(updateObject({ id: t.id, changes }));
  return (
    <>
      <Slider label="Position X" value={t.x} min={-25} max={25} step={0.5} unit="m" onChange={(x) => set({ x })} />
      <Slider label="Position Y" value={t.y} min={-25} max={25} step={0.5} unit="m" onChange={(y) => set({ y })} />
      <Slider label="Radius" value={t.radius} min={0.3} max={6} step={0.1} unit="m" onChange={(radius) => set({ radius })} />
      <Slider label="Height" value={t.height} min={0.5} max={15} step={0.5} unit="m" onChange={(height) => set({ height })} />
    </>
  );
}

function TableEditor({ t }: { t: SolarTable }) {
  const dispatch = useAppDispatch();
  const set = (changes: Partial<SolarTable>) => dispatch(updateObject({ id: t.id, changes }));
  return (
    <>
      <Slider label="Position X" value={t.x} min={-25} max={25} step={0.5} unit="m" onChange={(x) => set({ x })} />
      <Slider label="Position Y" value={t.y} min={-25} max={25} step={0.5} unit="m" onChange={(y) => set({ y })} />
      <Slider
        label="Orientation"
        value={(t.azimuth * 180) / Math.PI}
        min={-90}
        max={90}
        step={5}
        unit="°"
        onChange={(deg) => set({ azimuth: (deg * Math.PI) / 180 })}
      />
      <p className="text-xs text-slate-400 mt-1">
        2×3 array &amp; 15° tilt are fixed and preserved while moving.
      </p>
    </>
  );
}

export default function ObjectControls() {
  const dispatch = useAppDispatch();
  const objects = useAppSelector((s) => s.scene.objects);
  const selectedId = useAppSelector((s) => s.scene.selectedId);
  const selected = objects.find((o) => o.id === selectedId);

  const label = (o: (typeof objects)[number], i: number) => {
    const sameType = objects.filter((x) => x.type === o.type);
    const n = sameType.indexOf(o) + 1;
    const name = o.type === 'table' ? 'Solar Table' : o.type === 'tank' ? 'Water Tank' : 'Building';
    return `${name} ${n}`;
  };

  return (
    <div>
      <div className="flex gap-2 mb-3 flex-wrap">
        <button onClick={() => dispatch(addBuilding())} className="btn">+ Building</button>
        <button onClick={() => dispatch(addTank())} className="btn">+ Tank</button>
        <button onClick={() => dispatch(addTable())} className="btn">+ Table</button>
        <button onClick={() => dispatch(resetScene())} className="btn-ghost">Reset</button>
      </div>

      <div className="mb-3">
        <div className="text-xs uppercase tracking-wide text-slate-400 mb-1">Objects</div>
        <ul className="space-y-1 max-h-32 overflow-auto pr-1">
          {objects.map((o, i) => (
            <li key={o.id}>
              <button
                onClick={() => dispatch(selectObject(o.id))}
                className={`w-full text-left px-2 py-1 rounded text-sm flex justify-between items-center ${
                  o.id === selectedId ? 'bg-slate-700 text-accent' : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <span>{label(o, i)}</span>
                <span
                  role="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch(removeObject(o.id));
                  }}
                  className="text-slate-500 hover:text-red-400 px-1"
                >
                  ✕
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {selected ? (
        <div className="border-t border-slate-700 pt-3">
          <div className="text-sm font-semibold text-slate-200 mb-2">Edit {selected.type}</div>
          {selected.type === 'building' && <BuildingEditor b={selected as Building} />}
          {selected.type === 'tank' && <TankEditor t={selected as Tank} />}
          {selected.type === 'table' && <TableEditor t={selected as SolarTable} />}
        </div>
      ) : (
        <p className="text-xs text-slate-400 border-t border-slate-700 pt-3">
          Select an object (list or 3D click) to edit it.
        </p>
      )}
    </div>
  );
}
