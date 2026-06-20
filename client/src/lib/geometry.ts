
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
  offset: [number, number, number];
}

export function tableEuler(table: SolarTable): [number, number, number] {
  const tiltX = -(Math.PI / 2 - PANEL_TILT_RAD);
  return [tiltX, table.azimuth ?? 0, 0];
}

export function tablePosition(table: SolarTable): [number, number, number] {
  return [table.x, TABLE_MOUNT_Y, table.y];
}

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

export function tableGroupMatrix(table: SolarTable): THREE.Matrix4 {
  const [px, py, pz] = tablePosition(table);
  const [rx, ry, rz] = tableEuler(table);
  const m = new THREE.Matrix4();
  const quat = new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'XYZ'));
  m.compose(new THREE.Vector3(px, py, pz), quat, new THREE.Vector3(1, 1, 1));
  return m;
}

export interface PanelSample {
  point: THREE.Vector3;
  u: number;
  v: number;
}

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
    const v = (r + 0.5) / sampleRows;
    const localY = offY + (v - 0.5) * PANEL_H;
    for (let c = 0; c < sampleCols; c++) {
      const u = (c + 0.5) / sampleCols;
      const localX = offX + (u - 0.5) * PANEL_W;
      const p = new THREE.Vector3(localX, localY, 0).applyMatrix4(groupM);
      samples.push({ point: p, u, v });
    }
  }

  const normalM = new THREE.Matrix3().setFromMatrix4(groupM);
  const normal = new THREE.Vector3(0, 0, 1).applyMatrix3(normalM).normalize();
  return { samples, normal };
}
