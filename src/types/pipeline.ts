// Pipeline Types — Strict contracts for geometry-preserving deterministic pipeline.
// AI extracts EXACT geometry from the design image. Pipeline normalizes, maps, and reconstructs.

// ─── Stage 0: AI Geometry Extraction ────────────────────────────────────────────

export type AIElementType =
  | 'time'
  | 'date'
  | 'steps'
  | 'battery'
  | 'heart_rate'
  | 'arc'
  | 'text'
  | 'weather'
  | 'spo2'
  | 'calories'
  | 'distance'
  | 'weekday'
  | 'month';

export type AIShape = 'text' | 'arc' | 'icon' | 'number';

export type AIStyle = 'analog' | 'digital' | 'minimal' | 'bold';

/**
 * Output from AI vision model — includes GEOMETRY extracted from the design image.
 * bbox for rectangular elements, center/radius/angles for arcs.
 */
export interface AIElement {
  id: string;
  type: AIElementType;
  shape: AIShape;
  /** Bounding box [x, y, width, height] in pixels (480×480 space) for rectangular elements */
  bbox?: [number, number, number, number];
  /** Center point [cx, cy] in pixels for arcs / clock center */
  center?: [number, number];
  /** Radius in pixels for arcs */
  radius?: number;
  /** [startAngle, endAngle] in degrees for arcs */
  angles?: [number, number];
  /** Stroke thickness in pixels for arcs */
  thickness?: number;
  /** Visible text content (for time/date/text elements) */
  text?: string;
  style?: AIStyle;
  confidence?: number;
}

/** Wrapper for the full AI response payload. */
export interface AIExtractionResult {
  elements: AIElement[];
}

// ─── Stage 1: Normalized Elements (0–1 space) ──────────────────────────────────

export type ZeppWidget =
  | 'TIME_POINTER'
  | 'IMG_TIME'
  | 'IMG_DATE'
  | 'IMG_WEEK'
  | 'ARC_PROGRESS'
  | 'TEXT'
  | 'TEXT_IMG'
  | 'IMG'
  | 'IMG_STATUS'
  | 'IMG_LEVEL';

/**
 * Normalized element in [0, 1] space with widget assignment.
 * All spatial values are normalized: value / SCREEN_SIZE.
 * Angles remain in degrees.
 */
export interface NormalizedElement {
  id: string;
  widget: ZeppWidget;
  /** Original AI type preserved for downstream logic */
  sourceType: AIElementType;
  /** Original shape from AI */
  shape: AIShape;
  /** Data binding type (e.g. BATTERY, STEP, HEART) */
  dataType?: string;
  style?: AIStyle;
  // Bbox normalized [0, 1]
  nx?: number;
  ny?: number;
  nw?: number;
  nh?: number;
  // Arc center normalized [0, 1]
  ncx?: number;
  ncy?: number;
  // Arc radius normalized [0, 1]
  nr?: number;
  // Arc thickness normalized [0, 1]
  nt?: number;
  // Angles in degrees (not normalized)
  startAngle?: number;
  endAngle?: number;
}

// ─── Stage 2: Geometry (absolute pixels, constraint-solved) ─────────────────────

export interface GeometryElement {
  id: string;
  widget: ZeppWidget;
  sourceType: AIElementType;
  shape: AIShape;
  dataType?: string;
  style?: AIStyle;

  /** Screen-space center (used by bridge for center field) */
  centerX: number;
  centerY: number;

  // TIME_POINTER
  hourPosX?: number;
  hourPosY?: number;
  minutePosX?: number;
  minutePosY?: number;
  secondPosX?: number;
  secondPosY?: number;

  // ARC_PROGRESS
  radius?: number;
  startAngle?: number;
  endAngle?: number;
  lineWidth?: number;

  // Rectangular widgets (IMG_TIME, IMG_DATE, TEXT, etc.)
  x?: number;
  y?: number;
  w?: number;
  h?: number;
}

// ─── Stage 3: Asset-Resolved (Final before code gen) ────────────────────────────

export interface ResolvedElement extends GeometryElement {
  assets: ResolvedAssets;
}

export interface ResolvedAssets {
  /** Primary image source (for IMG, IMG_STATUS, etc.) */
  src?: string;
  /** Digit image arrays (for IMG_TIME, IMG_DATE, TEXT_IMG) */
  fontArray?: string[];
  /** Clock hand sources (for TIME_POINTER) */
  hourHandSrc?: string;
  minuteHandSrc?: string;
  secondHandSrc?: string;
  coverSrc?: string;
  /** Week/month image arrays */
  weekArray?: string[];
  monthArray?: string[];
  /** IMG_LEVEL image array */
  imageArray?: string[];
}

// ─── Validation Error ───────────────────────────────────────────────────────────

export class PipelineValidationError extends Error {
  stage: string;
  violations: string[];

  constructor(stage: string, violations: string[]) {
    super(`[Pipeline:${stage}] Validation failed:\n${violations.map(v => `  - ${v}`).join('\n')}`);
    this.name = 'PipelineValidationError';
    this.stage = stage;
    this.violations = violations;
  }
}
