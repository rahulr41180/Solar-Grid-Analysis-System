// ---------------------------------------------------------------------------
// Fixed physical constants for the solar installation.
// ---------------------------------------------------------------------------

/** Fixed panel tilt from horizontal, in degrees (assignment requirement). */
export const PANEL_TILT_DEG = 15;
export const PANEL_TILT_RAD = (PANEL_TILT_DEG * Math.PI) / 180;

/** Single panel dimensions (metres), portrait orientation. */
export const PANEL_W = 1.0; // width  (along table local X / East-West)
export const PANEL_H = 1.7; // height (along table local up-slope axis)

/** Gap between adjacent panels (metres). */
export const PANEL_GAP = 0.03;

/** 2 rows x 3 columns = 6 panels per table. */
export const PANEL_ROWS = 2;
export const PANEL_COLS = 3;

/** Height of the table's mounting (centre of array above ground), metres. */
export const TABLE_MOUNT_Y = 0.8;

/** Sampling grid resolution per panel for the shadow raycast. */
export const SAMPLE_ROWS = 6; // along the slope (series-string direction)
export const SAMPLE_COLS = 8; // across the panel

/** Efficiency model coefficient: weight of shading concentration loss. */
export const CONCENTRATION_ALPHA = 0.6;
/** Efficiency model coefficient: weight of edge-occlusion contribution. */
export const EOF_BETA = 0.15;

/** Classification thresholds on the 0..100 performance score. */
export const CLASS_THRESHOLDS = {
  Optimal: 85,
  Good: 60,
  Moderate: 30,
} as const;

/** Default location (New Delhi, India) for date/time -> sun position. */
export const DEFAULT_LATITUDE = 28.6139;
export const DEFAULT_LONGITUDE = 77.209;

export const GROUND_SIZE = 60;
