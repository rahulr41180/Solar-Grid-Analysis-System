
import * as THREE from 'three';
import {
  AnalysisResult,
  Building,
  PanelAnalysis,
  PanelClass,
  SceneObject,
  SolarTable,
  TableAnalysis,
  Tank,
} from '@/types';
import {
  CLASS_THRESHOLDS,
  CONCENTRATION_ALPHA,
  EOF_BETA,
  SAMPLE_COLS,
  SAMPLE_ROWS,
} from './constants';
import { panelLayouts, panelSamplePoints } from './geometry';

const EPS = 1e-3;
const RAY_MAX = 1e4;

function rayHitsBuilding(
  origin: THREE.Vector3,
  dir: THREE.Vector3,
  b: Building
): boolean {
  const minX = b.x - b.width / 2;
  const maxX = b.x + b.width / 2;
  const minY = 0;
  const maxY = b.height;
  const minZ = b.y - b.length / 2;
  const maxZ = b.y + b.length / 2;

  let tmin = EPS;
  let tmax = RAY_MAX;

  const slab = (o: number, d: number, lo: number, hi: number): boolean => {
    if (Math.abs(d) < 1e-9) return o >= lo && o <= hi; // parallel
    let t1 = (lo - o) / d;
    let t2 = (hi - o) / d;
    if (t1 > t2) [t1, t2] = [t2, t1];
    tmin = Math.max(tmin, t1);
    tmax = Math.min(tmax, t2);
    return tmax >= tmin;
  };

  if (!slab(origin.x, dir.x, minX, maxX)) return false;
  if (!slab(origin.y, dir.y, minY, maxY)) return false;
  if (!slab(origin.z, dir.z, minZ, maxZ)) return false;
  return tmax >= tmin && tmax > EPS;
}

function rayHitsTank(origin: THREE.Vector3, dir: THREE.Vector3, t: Tank): boolean {
  const cx = t.x;
  const cz = t.y;
  const r = t.radius;
  const yBot = 0;
  const yTop = t.height;

  const ox = origin.x - cx;
  const oz = origin.z - cz;
  const a = dir.x * dir.x + dir.z * dir.z;
  if (a > 1e-9) {
    const b = 2 * (ox * dir.x + oz * dir.z);
    const c = ox * ox + oz * oz - r * r;
    const disc = b * b - 4 * a * c;
    if (disc >= 0) {
      const sq = Math.sqrt(disc);
      for (const tt of [(-b - sq) / (2 * a), (-b + sq) / (2 * a)]) {
        if (tt > EPS && tt < RAY_MAX) {
          const y = origin.y + tt * dir.y;
          if (y >= yBot && y <= yTop) return true;
        }
      }
    }
  }

  if (Math.abs(dir.y) > 1e-9) {
    for (const capY of [yBot, yTop]) {
      const tt = (capY - origin.y) / dir.y;
      if (tt > EPS && tt < RAY_MAX) {
        const hx = origin.x + tt * dir.x - cx;
        const hz = origin.z + tt * dir.z - cz;
        if (hx * hx + hz * hz <= r * r) return true;
      }
    }
  }
  return false;
}

function isShaded(
  origin: THREE.Vector3,
  dir: THREE.Vector3,
  buildings: Building[],
  tanks: Tank[]
): boolean {
  for (const b of buildings) if (rayHitsBuilding(origin, dir, b)) return true;
  for (const t of tanks) if (rayHitsTank(origin, dir, t)) return true;
  return false;
}

function classify(score: number): PanelClass {
  if (score >= CLASS_THRESHOLDS.Optimal) return 'Optimal';
  if (score >= CLASS_THRESHOLDS.Good) return 'Good';
  if (score >= CLASS_THRESHOLDS.Moderate) return 'Moderate';
  return 'Critical';
}

function analysePanel(
  table: SolarTable,
  layout: { panelIndex: number; row: number; col: number },
  grid: boolean[][]
): PanelAnalysis {
  const rows = grid.length;
  const cols = grid[0].length;
  const total = rows * cols;

  let shaded = 0;
  const rowShaded: number[] = [];
  let edgeShaded = 0;
  let edgeTotal = 0;

  for (let r = 0; r < rows; r++) {
    let rowCount = 0;
    for (let c = 0; c < cols; c++) {
      const s = grid[r][c];
      if (s) {
        shaded++;
        rowCount++;
      }
      const isEdge = r === 0 || r === rows - 1 || c === 0 || c === cols - 1;
      if (isEdge) {
        edgeTotal++;
        if (s) edgeShaded++;
      }
    }
    rowShaded.push(rowCount / cols);
  }

  const shadedFraction = shaded / total;
  const eof = edgeTotal > 0 ? edgeShaded / edgeTotal : 0;

  const worstRow = rowShaded.reduce((m, v) => Math.max(m, v), 0);
  const stringPenalty = Math.max(0, worstRow - shadedFraction);

  const loss =
    shadedFraction +
    CONCENTRATION_ALPHA * stringPenalty +
    EOF_BETA * eof * shadedFraction;
  const effFactor = Math.max(0, Math.min(1, 1 - loss));
  const score = Math.round(effFactor * 100);

  return {
    tableId: table.id,
    panelIndex: layout.panelIndex,
    row: layout.row,
    col: layout.col,
    shadedFraction,
    eof,
    stringPenalty,
    effFactor,
    score,
    classification: classify(score),
  };
}

function aggregateTable(tableId: string, panels: PanelAnalysis[]): TableAnalysis {
  const n = panels.length || 1;
  const avgShadedFraction = panels.reduce((s, p) => s + p.shadedFraction, 0) / n;
  const avgEof = panels.reduce((s, p) => s + p.eof, 0) / n;
  const avgEffFactor = panels.reduce((s, p) => s + p.effFactor, 0) / n;
  const score = Math.round(avgEffFactor * 100);
  return {
    tableId,
    panels,
    avgShadedFraction,
    avgEof,
    avgEffFactor,
    score,
    classification: classify(score),
  };
}

export function analyseScene(
  objects: SceneObject[],
  sunDir: [number, number, number],
  sunUp: boolean,
  computedAtMinutes: number
): AnalysisResult {
  const buildings = objects.filter((o): o is Building => o.type === 'building');
  const tanks = objects.filter((o): o is Tank => o.type === 'tank');
  const tables = objects.filter((o): o is SolarTable => o.type === 'table');
  const layouts = panelLayouts();
  const dir = new THREE.Vector3(sunDir[0], sunDir[1], sunDir[2]).normalize();

  const tableResults: TableAnalysis[] = tables.map((table) => {
    const panelResults: PanelAnalysis[] = layouts.map((layout) => {
      const { samples, normal } = panelSamplePoints(
        table,
        layout,
        SAMPLE_ROWS,
        SAMPLE_COLS
      );
      const grid: boolean[][] = [];
      for (let r = 0; r < SAMPLE_ROWS; r++) grid.push(new Array(SAMPLE_COLS).fill(false));

      for (let i = 0; i < samples.length; i++) {
        const r = Math.floor(i / SAMPLE_COLS);
        const c = i % SAMPLE_COLS;
        if (!sunUp) {
          grid[r][c] = true;
          continue;
        }
        if (samples[i].point && normal.dot(dir) <= 0) {
          grid[r][c] = true;
          continue;
        }
        const origin = samples[i].point.clone().addScaledVector(normal, EPS * 5);
        grid[r][c] = isShaded(origin, dir, buildings, tanks);
      }
      return analysePanel(table, layout, grid);
    });
    return aggregateTable(table.id, panelResults);
  });

  return {
    tables: tableResults,
    sunDir,
    sunUp,
    computedAtMinutes,
  };
}

export function scoreColor(score: number): string {
  const t = Math.max(0, Math.min(1, score / 100));
  let r: number;
  let g: number;
  if (t < 0.5) {
    r = 220;
    g = Math.round(40 + (t / 0.5) * 180);
  } else {
    r = Math.round(220 - ((t - 0.5) / 0.5) * 180);
    g = 220;
  }
  const b = 50;
  return `rgb(${r}, ${g}, ${b})`;
}
