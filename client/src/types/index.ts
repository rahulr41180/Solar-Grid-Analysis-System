// ---------------------------------------------------------------------------
// Domain types for the Solar Shadow Analysis application.
//
// Coordinate convention (matches Three.js, Y-up):
//   +X = East,  -X = West
//   +Z = South, -Z = North
//   +Y = Up
// The assignment's "Position (X, Y)" refers to the horizontal ground plane and
// maps to world (x, z). Object "Height" is the world +Y extent.
// ---------------------------------------------------------------------------

export type ObjectType = 'building' | 'tank' | 'table';

export interface BaseObject {
  id: string;
  type: ObjectType;
  /** Ground-plane position. x -> world X (E/W), y -> world Z (N/S). */
  x: number;
  y: number;
}

/** Building rendered as an axis-aligned cuboid sitting on the ground. */
export interface Building extends BaseObject {
  type: 'building';
  width: number; // extent along world X
  length: number; // extent along world Z
  height: number; // extent along world Y
}

/** Water tank rendered as a vertical cylinder sitting on the ground. */
export interface Tank extends BaseObject {
  type: 'tank';
  radius: number;
  height: number;
}

/** Solar table: a fixed 2x3 panel array tilted at a fixed angle. */
export interface SolarTable extends BaseObject {
  type: 'table';
  /** Azimuth rotation of the whole table about world Y (radians). Default 0. */
  azimuth: number;
}

export type SceneObject = Building | Tank | SolarTable;

/** How the sun position is being driven. */
export type SunMode = 'manual' | 'datetime';

export interface SunState {
  mode: SunMode;
  /** Compass azimuth in degrees, 0 = North, 90 = East, 180 = South, 270 = West. */
  azimuth: number;
  /** Elevation above the horizon in degrees (0 = horizon, 90 = zenith). */
  elevation: number;
  // datetime mode inputs
  /** ISO date string (yyyy-mm-dd). */
  date: string;
  /** Minutes since local midnight. */
  minutes: number;
  latitude: number;
  longitude: number;
  // playback
  playing: boolean;
}

/** Per-sample efficiency / shading breakdown for one panel. */
export interface PanelAnalysis {
  tableId: string;
  panelIndex: number; // 0..5
  row: number; // 0..1
  col: number; // 0..2
  shadedFraction: number; // 0..1 fraction of sample points in shadow
  /** Edge Occlusion Factor: shaded fraction within the panel's perimeter band. */
  eof: number; // 0..1
  /** Concentration of shading along series strings (rows). 0 = uniform. */
  stringPenalty: number; // 0..1
  /** Effective irradiance factor after geometric + concentration losses. */
  effFactor: number; // 0..1
  score: number; // 0..100
  classification: PanelClass;
}

export type PanelClass = 'Optimal' | 'Good' | 'Moderate' | 'Critical';

export interface TableAnalysis {
  tableId: string;
  panels: PanelAnalysis[];
  avgShadedFraction: number;
  avgEof: number;
  avgEffFactor: number;
  score: number;
  classification: PanelClass;
}

export interface AnalysisResult {
  tables: TableAnalysis[];
  /** Sun direction unit vector (pointing from ground toward the sun). */
  sunDir: [number, number, number];
  sunUp: boolean;
  computedAtMinutes: number;
}
