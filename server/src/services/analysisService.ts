import { parseJson } from '../config/db';
import { badRequest } from '../utils/http';
import { resolveSun } from '../utils/resolveSun';
import { validateSceneObjects } from '../utils/validateScene';
import { analyseScene } from '../analysis/shadowAnalysis';
import { sunAnglesFromDateTime, sunDirection, isSunUp } from '../analysis/sun';
import { DEFAULT_LATITUDE, DEFAULT_LONGITUDE } from '../analysis/constants';
import { AnalysisResult } from '../analysis/types';
import { loadOwnedScene, sceneObjects } from './sceneService';
import { createAnalysis, listAnalysesByScene } from '../models/analysisModel';

type Body = Record<string, unknown>;

export function runStateless(body: Body) {
  const objects = validateSceneObjects(body.objects);
  const sun = resolveSun(body);
  const result = analyseScene(objects, sun.dir, sun.up, sun.minutes);
  return { sun: { azimuth: sun.azimuth, elevation: sun.elevation }, result };
}

export async function storeSnapshot(userId: number | undefined, sceneId: string, body: Body) {
  const scene = await loadOwnedScene(userId, sceneId);
  const objects = sceneObjects(scene);
  const sun = resolveSun(body);
  const result = analyseScene(objects, sun.dir, sun.up, sun.minutes);
  const id = await createAnalysis({
    sceneId: scene.id,
    kind: 'snapshot',
    azimuth: sun.azimuth,
    elevation: sun.elevation,
    resultJson: JSON.stringify(result),
  });
  return { id, sun: { azimuth: sun.azimuth, elevation: sun.elevation }, result };
}

export async function listForScene(userId: number | undefined, sceneId: string) {
  await loadOwnedScene(userId, sceneId);
  const rows = await listAnalysesByScene(sceneId);
  return rows.map((r) => ({
    id: r.id,
    kind: r.kind,
    sunAzimuth: r.sun_azimuth,
    sunElevation: r.sun_elevation,
    result: parseJson(r.result),
    createdAt: r.created_at,
  }));
}

export async function runDaily(userId: number | undefined, sceneId: string, body: Body) {
  const scene = await loadOwnedScene(userId, sceneId);
  const objects = sceneObjects(scene);

  const date = String(body.date ?? '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw badRequest('`date` (yyyy-mm-dd) is required');
  const latitude = typeof body.latitude === 'number' ? body.latitude : DEFAULT_LATITUDE;
  const longitude = typeof body.longitude === 'number' ? body.longitude : DEFAULT_LONGITUDE;
  const step = typeof body.stepMinutes === 'number' ? Math.max(5, body.stepMinutes) : 30;

  const series: { minutes: number; avgEff: number }[] = [];
  let sumEff = 0;
  let best = { minutes: 0, avgEff: -1 };

  for (let m = 0; m < 24 * 60; m += step) {
    const a = sunAnglesFromDateTime(date, m, latitude, longitude);
    if (!isSunUp(a.elevation)) continue;
    const result = analyseScene(objects, sunDirection(a.azimuth, a.elevation), true, m);
    const avgEff =
      result.tables.reduce((s, t) => s + t.avgEffFactor, 0) / (result.tables.length || 1);
    series.push({ minutes: m, avgEff });
    sumEff += avgEff;
    if (avgEff > best.avgEff) best = { minutes: m, avgEff };
  }

  const summary = {
    date,
    latitude,
    longitude,
    stepMinutes: step,
    daylightSamples: series.length,
    avgEff: series.length ? sumEff / series.length : 0,
    peak: best.avgEff < 0 ? { minutes: 0, avgEff: 0 } : best,
    series,
  };

  await createAnalysis({ sceneId: scene.id, kind: 'daily', resultJson: JSON.stringify(summary) });
  return summary;
}

export async function buildCsv(
  userId: number | undefined,
  sceneId: string,
  query: Record<string, unknown>
): Promise<{ filename: string; csv: string }> {
  const scene = await loadOwnedScene(userId, sceneId);
  const objects = sceneObjects(scene);

  const num = (v: unknown) => (v === undefined ? undefined : Number(v));
  const sun = resolveSun({
    azimuth: num(query.azimuth),
    elevation: num(query.elevation),
    date: query.date,
    minutes: num(query.minutes),
    latitude: num(query.latitude),
    longitude: num(query.longitude),
  });
  const result: AnalysisResult = analyseScene(objects, sun.dir, sun.up, sun.minutes);

  const lines: string[] = [
    'table_index,panel_index,row,col,shaded_pct,eof_pct,string_penalty_pct,efficiency_pct,score,classification',
  ];
  result.tables.forEach((t, ti) => {
    [...t.panels]
      .sort((a, b) => a.panelIndex - b.panelIndex)
      .forEach((p) => {
        lines.push(
          [
            ti + 1,
            p.panelIndex + 1,
            p.row,
            p.col,
            (p.shadedFraction * 100).toFixed(1),
            (p.eof * 100).toFixed(1),
            (p.stringPenalty * 100).toFixed(1),
            (p.effFactor * 100).toFixed(1),
            p.score,
            p.classification,
          ].join(',')
        );
      });
  });

  return { filename: `scene-${scene.id}-report.csv`, csv: lines.join('\n') };
}
