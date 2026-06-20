// ---------------------------------------------------------------------------
// Solar table geometry.
//
// A table is a group of 6 panels (2 rows x 3 cols) tilted PANEL_TILT_DEG from
// horizontal. The same transform is used for BOTH rendering (React Three Fiber)
// and analysis (sampling panel surface points for raycasting), guaranteeing the
// visualised geometry and the analysed geometry are identical.
//
// Local plane convention: a panel is a PlaneGeometry in its local XY plane with
// its normal along +Z. The table group rotates this plane:
//   - rotation.x = -(90deg - tilt)  -> lays panels near-horizontal, tilted
//     `tilt` degrees up toward the South (+Z), facing the sky.
//   - rotation.y = azimuth          -> optional whole-table yaw.
// ---------------------------------------------------------------------------

import * as THREE from 'three';
import { SolarTable } from '@/types';
import {
  PANEL_W,
  PANEL_H,
  PANEL_GAP,
  PANEL_ROWS,
  PANEL_COLS,
  PANEL_TILT_RAD,
  TABLE_MOUNT_Y,
} from './constants';

export interface PanelLayout {
  panelIndex: number;
  row: number;
  col: number;
  /** Local offset of the panel centre within the (untilted) table group. */
  offset: [number, number, number];
}

/** Group-level Euler rotation applied to the whole table. */
export function tableEuler(table: SolarTable): [number, number, number] {
  // Lay flat (-90deg) then tilt back up by PANEL_TILT.
  const tiltX = -(Math.PI / 2 - PANEL_TILT_RAD);
  return [tiltX, table.azimuth ?? 0, 0];
}

export function tablePosition(table: SolarTable): [number, number, number] {
  return [table.x, TABLE_MOUNT_Y, table.y];
}

/** The 6 panel layouts (local offsets) within a table. */
export function panelLayouts(): PanelLayout[] {
  const layouts: PanelLayout[] = [];
  const colSpan = PANEL_W + PANEL_GAP;
  const rowSpan = PANEL_H + PANEL_GAP;
  let idx = 0;
  for (let row = 0; row < PANEL_ROWS; row++) {
    for (let col = 0; col < PANEL_COLS; col++) {
      const offX = (col - (PANEL_COLS - 1) / 2) * colSpan;
      const offY = (row - (PANEL_ROWS - 1) / 2) * rowSpan;
      layouts.push({ panelIndex: idx, row, col, offset: [offX, offY, 0] });
      idx++;
    }
  }
  return layouts;
}

/** Build the world matrix for a table's group (position + tilt rotation). */
export function tableGroupMatrix(table: SolarTable): THREE.Matrix4 {
  const [px, py, pz] = tablePosition(table);
  const [rx, ry, rz] = tableEuler(table);
  const m = new THREE.Matrix4();
  const quat = new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'XYZ'));
  m.compose(new THREE.Vector3(px, py, pz), quat, new THREE.Vector3(1, 1, 1));
  return m;
}

export interface PanelSample {
  /** World-space sample point on the panel surface. */
  point: THREE.Vector3;
  /** Normalised position across the panel: u in [0,1] (col dir), v in [0,1] (row dir). */
  u: number;
  v: number;
}

/**
 * Generate a grid of surface sample points for one panel, in world space.
 * `sampleRows` runs along the slope (series-string direction), `sampleCols`
 * across the panel.
 */
export function panelSamplePoints(
  table: SolarTable,
  layout: PanelLayout,
  sampleRows: number,
  sampleCols: number
): { samples: PanelSample[]; normal: THREE.Vector3 } {
  const groupM = tableGroupMatrix(table);
  const [offX, offY] = layout.offset;
  const samples: PanelSample[] = [];

  for (let r = 0; r < sampleRows; r++) {
    // centre samples inside cells: (r + 0.5)/rows
    const v = (r + 0.5) / sampleRows;
    const localY = offY + (v - 0.5) * PANEL_H;
    for (let c = 0; c < sampleCols; c++) {
      const u = (c + 0.5) / sampleCols;
      const localX = offX + (u - 0.5) * PANEL_W;
      const p = new THREE.Vector3(localX, localY, 0).applyMatrix4(groupM);
      samples.push({ point: p, u, v });
    }
  }

  // Panel normal in world space (local +Z through the rotation only).
  const normalM = new THREE.Matrix3().setFromMatrix4(groupM);
  const normal = new THREE.Vector3(0, 0, 1).applyMatrix3(normalM).normalize();
  return { samples, normal };
}
