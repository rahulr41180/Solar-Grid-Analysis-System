// ---------------------------------------------------------------------------
// Solar position helpers.
//
// We support two modes:
//   1. manual   - the user sets compass azimuth + elevation directly.
//   2. datetime - we derive azimuth + elevation from a date/time and a
//                 latitude/longitude using the `suncalc` library.
//
// `suncalc` returns:
//   azimuth  - radians, measured from SOUTH, positive towards WEST.
//   altitude - radians, elevation above the horizon.
//
// We normalise everything to a COMPASS azimuth (degrees, 0 = North, clockwise)
// + elevation (degrees), then convert to a world-space direction vector.
// ---------------------------------------------------------------------------

import SunCalc from 'suncalc';

const RAD2DEG = 180 / Math.PI;
const DEG2RAD = Math.PI / 180;

export interface SunAngles {
  /** Compass azimuth, degrees: 0 = N, 90 = E, 180 = S, 270 = W. */
  azimuth: number;
  /** Elevation above horizon, degrees. */
  elevation: number;
}

/**
 * Compute compass azimuth + elevation for a given instant and location.
 */
export function sunAnglesFromDateTime(
  date: string,
  minutes: number,
  latitude: number,
  longitude: number
): SunAngles {
  const [y, m, d] = date.split('-').map(Number);
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  const when = new Date(y, (m || 1) - 1, d || 1, hours, mins, 0);

  const pos = SunCalc.getPosition(when, latitude, longitude);
  // suncalc azimuth is measured from south, +ve toward west.
  // Compass azimuth (from north, clockwise) = 180 + suncalcAzimuthDeg.
  let azimuth = 180 + pos.azimuth * RAD2DEG;
  azimuth = ((azimuth % 360) + 360) % 360;
  const elevation = pos.altitude * RAD2DEG;
  return { azimuth, elevation };
}

/**
 * Convert compass azimuth + elevation to a unit vector pointing from the
 * ground TOWARD the sun, in world coordinates (X=E, Y=Up, Z=South).
 */
export function sunDirection(azimuthDeg: number, elevationDeg: number): [number, number, number] {
  const az = azimuthDeg * DEG2RAD;
  const el = elevationDeg * DEG2RAD;
  const cosEl = Math.cos(el);
  // East component:  +X at azimuth 90 (East).
  const x = Math.sin(az) * cosEl;
  // Up component.
  const y = Math.sin(el);
  // North = -Z, so the Z component is -cos(az) (azimuth 0 = North = -Z).
  const z = -Math.cos(az) * cosEl;
  const len = Math.hypot(x, y, z) || 1;
  return [x / len, y / len, z / len];
}

/** Whether the sun is above the horizon. */
export function isSunUp(elevationDeg: number): boolean {
  return elevationDeg > 0.5;
}

/** Format minutes-since-midnight as a HH:MM 24h label. */
export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.floor(minutes % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export { RAD2DEG, DEG2RAD };
