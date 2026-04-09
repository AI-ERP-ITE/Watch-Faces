// Pipeline Types — Strict contracts between every stage of the deterministic pipeline.
// AI outputs semantic data ONLY. All spatial/geometry data is computed in code.

// ─── Stage 0: AI Extraction Output ─────────────────────────────────────────────

export type Region = 'center' | 'top' | 'bottom' | 'left' | 'right';

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

export type AIStyle = 'analog' | 'digital' | 'minimal' | 'bold';

/** Output from AI vision model — semantic ONLY, no coordinates or sizes. */
export interface AIElement {
  id: string;
  type: AIElementType;
  style?: AIStyle;
  region: Region;
  confidence?: number;
}

/** Wrapper for the full AI response payload. */
export interface AIExtractionResult {
  elements: AIElement[];
}

// ─── Stage 1: Normalized Elements ───────────────────────────────────────────────

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

export interface NormalizedElement {
  id: string;
  widget: ZeppWidget;
  region: Region;
  /** Original AI type preserved for downstream logic */
  sourceType: AIElementType;
  /** Data binding type for the widget (e.g. BATTERY, STEP, HEART) */
  dataType?: string;
}

// ─── Stage 2: Layout ────────────────────────────────────────────────────────────

export interface LayoutElement extends NormalizedElement {
  centerX: number;
  centerY: number;
}

// ─── Stage 3: Geometry ──────────────────────────────────────────────────────────

export interface GeometryElement extends LayoutElement {
  // TIME_POINTER
  posX?: number;
  posY?: number;
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

  // TEXT / TEXT_IMG / IMG
  x?: number;
  y?: number;
  w?: number;
  h?: number;
}

// ─── Stage 4: Asset-Resolved (Final before code gen) ────────────────────────────

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
