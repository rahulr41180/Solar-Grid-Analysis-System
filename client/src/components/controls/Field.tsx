'use client';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
}

export function Slider({ label, value, min, max, step = 0.1, unit, onChange }: SliderProps) {
  return (
    <label className="block mb-2 text-sm">
      <div className="flex justify-between text-slate-300">
        <span>{label}</span>
        <span className="text-accent font-mono">
          {value.toFixed(step < 1 ? 1 : 0)}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-sky-400"
      />
    </label>
  );
}

interface NumberFieldProps {
  label: string;
  value: number;
  step?: number;
  min?: number;
  onChange: (v: number) => void;
}

export function NumberField({ label, value, step = 0.5, min, onChange }: NumberFieldProps) {
  return (
    <label className="block mb-2 text-sm">
      <div className="text-slate-300 mb-1">{label}</div>
      <input
        type="number"
        value={value}
        step={step}
        min={min}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-full rounded bg-slate-800 border border-slate-600 px-2 py-1 text-slate-100 focus:border-accent outline-none"
      />
    </label>
  );
}
