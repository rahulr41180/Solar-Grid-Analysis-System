
import SunCalc from 'suncalc';

const RAD2DEG = 180 / Math.PI;
const DEG2RAD = Math.PI / 180;

export interface SunAngles {
  azimuth: number;
  elevation: number;
}

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
  let azimuth = 180 + pos.azimuth * RAD2DEG;
  azimuth = ((azimuth % 360) + 360) % 360;
  const elevation = pos.altitude * RAD2DEG;
  return { azimuth, elevation };
}

export function sunDirection(azimuthDeg: number, elevationDeg: number): [number, number, number] {
  const az = azimuthDeg * DEG2RAD;
  const el = elevationDeg * DEG2RAD;
  const cosEl = Math.cos(el);
  const x = Math.sin(az) * cosEl;
  const y = Math.sin(el);
  const z = -Math.cos(az) * cosEl;
  const len = Math.hypot(x, y, z) || 1;
  return [x / len, y / len, z / len];
}

export function isSunUp(elevationDeg: number): boolean {
  return elevationDeg > 0.5;
}

export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.floor(minutes % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export { RAD2DEG, DEG2RAD };
