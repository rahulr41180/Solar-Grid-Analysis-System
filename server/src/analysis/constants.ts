
export const PANEL_TILT_DEG = 15;
export const PANEL_TILT_RAD = (PANEL_TILT_DEG * Math.PI) / 180;

export const PANEL_W = 1.0;
export const PANEL_H = 1.7;
export const PANEL_GAP = 0.03;

export const PANEL_ROWS = 2;
export const PANEL_COLS = 3;

export const TABLE_MOUNT_Y = 0.8;

export const SAMPLE_ROWS = 6;
export const SAMPLE_COLS = 8;

export const CONCENTRATION_ALPHA = 0.6;
export const EOF_BETA = 0.15;

export const CLASS_THRESHOLDS = {
  Optimal: 85,
  Good: 60,
  Moderate: 30,
} as const;

export const DEFAULT_LATITUDE = 28.6139;
export const DEFAULT_LONGITUDE = 77.209;

export const GROUND_SIZE = 60;
