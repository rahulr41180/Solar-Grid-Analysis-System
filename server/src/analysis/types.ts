export type ObjectType = 'building' | 'tank' | 'table';

export interface BaseObject {
  id: string;
  type: ObjectType;
  x: number;
  y: number;
}

export interface Building extends BaseObject {
  type: 'building';
  width: number;
  length: number;
  height: number;
}

export interface Tank extends BaseObject {
  type: 'tank';
  radius: number;
  height: number;
}

export interface SolarTable extends BaseObject {
  type: 'table';
  azimuth: number;
}

export type SceneObject = Building | Tank | SolarTable;

export type PanelClass = 'Optimal' | 'Good' | 'Moderate' | 'Critical';

export interface PanelAnalysis {
  tableId: string;
  panelIndex: number;
  row: number;
  col: number;
  shadedFraction: number;
  eof: number;
  stringPenalty: number;
  effFactor: number;
  score: number;
  classification: PanelClass;
}

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
  sunDir: [number, number, number];
  sunUp: boolean;
  computedAtMinutes: number;
}
