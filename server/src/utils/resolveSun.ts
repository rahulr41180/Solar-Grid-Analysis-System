import { sunAnglesFromDateTime, sunDirection, isSunUp } from '../analysis/sun';
import { DEFAULT_LATITUDE, DEFAULT_LONGITUDE } from '../analysis/constants';
import { badRequest } from './http';

export interface ResolvedSun {
  azimuth: number;
  elevation: number;
  dir: [number, number, number];
  up: boolean;
  minutes: number;
}

/**
 * Resolve a sun position from a request body. Accepts either:
 *   - manual:   { azimuth, elevation }
 *   - datetime: { date, minutes, latitude?, longitude? }
 */
export function resolveSun(body: Record<string, unknown>): ResolvedSun {
  const hasManual =
    typeof body.azimuth === 'number' && typeof body.elevation === 'number';

  if (hasManual) {
    const azimuth = body.azimuth as number;
    const elevation = body.elevation as number;
    return {
      azimuth,
      elevation,
      dir: sunDirection(azimuth, elevation),
      up: isSunUp(elevation),
      minutes: typeof body.minutes === 'number' ? (body.minutes as number) : 0,
    };
  }

  if (typeof body.date === 'string' && typeof body.minutes === 'number') {
    const latitude = typeof body.latitude === 'number' ? (body.latitude as number) : DEFAULT_LATITUDE;
    const longitude =
      typeof body.longitude === 'number' ? (body.longitude as number) : DEFAULT_LONGITUDE;
    const a = sunAnglesFromDateTime(body.date, body.minutes as number, latitude, longitude);
    return {
      azimuth: a.azimuth,
      elevation: a.elevation,
      dir: sunDirection(a.azimuth, a.elevation),
      up: isSunUp(a.elevation),
      minutes: body.minutes as number,
    };
  }

  throw badRequest(
    'Provide either { azimuth, elevation } or { date, minutes, latitude?, longitude? }'
  );
}
