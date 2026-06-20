import { useMemo } from 'react';
import { useAppSelector } from '@/store/hooks';
import { analyseScene, scoreColor } from '@/lib/shadowAnalysis';
import { sunDirection, isSunUp } from '@/lib/sun';
import { AnalysisResult } from '@/types';

/** Derive sun direction + full scene analysis, memoised on the relevant state. */
export function useSunDirection(): { dir: [number, number, number]; up: boolean } {
  const { azimuth, elevation } = useAppSelector((s) => s.sun);
  return useMemo(
    () => ({ dir: sunDirection(azimuth, elevation), up: isSunUp(elevation) }),
    [azimuth, elevation]
  );
}

export function useAnalysis(): AnalysisResult {
  const objects = useAppSelector((s) => s.scene.objects);
  const minutes = useAppSelector((s) => s.sun.minutes);
  const { dir, up } = useSunDirection();

  return useMemo(
    () => analyseScene(objects, dir, up, minutes),
    [objects, dir, up, minutes]
  );
}

/** Map of tableId -> panelIndex -> score, for fast heatmap lookups. */
export function useScoreMap(result: AnalysisResult) {
  return useMemo(() => {
    const map = new Map<string, number[]>();
    for (const t of result.tables) {
      const arr: number[] = [];
      for (const p of t.panels) arr[p.panelIndex] = p.score;
      map.set(t.tableId, arr);
    }
    return map;
  }, [result]);
}

export { scoreColor };
