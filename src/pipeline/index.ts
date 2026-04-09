// Pipeline Orchestrator — Multi-stage pipeline with AI + deterministic stages.
// Stage A (AI vision) → Validate (representation/layout/group) → Normalize (representation → widget)
// → Resolve ambiguities → Priority sort → Layout (group + mode) → Geometry → Assets → V2 Bridge
// Normalizer branches on representation, not type. Code fallback if AI normalization fails.

import type { AIElement, NormalizedElement, ResolvedElement } from '@/types/pipeline';
import type { WatchFaceConfig, WatchFaceElement, GeneratedCode } from '@/types';

import { validateAIOutput, validateNormalized, validateLayout, validateGeometry } from './validators';
import { normalize } from './normalizer';
import { sortArcsByPriority } from './semanticPriority';
import { applyLayout } from './layoutEngine';
import { solveGeometry } from './geometrySolver';
import { resolveAssets } from './assetResolver';
import { generateWatchFaceCodeV2 } from '@/lib/jsCodeGeneratorV2';
import { normalizeWithAI, resolveAmbiguities, type PipelineAIConfig } from './pipelineAIService';

// ─── Pipeline Orchestrator ──────────────────────────────────────────────────────

export interface PipelineOptions {
  watchfaceName?: string;
  watchModel?: string;
  backgroundSrc?: string;
  /** AI config for Stage B normalization + Call 3 ambiguity resolution */
  aiConfig?: PipelineAIConfig;
  /** Progress callback for UI status messages */
  onProgress?: (message: string) => void;
}

export interface PipelineResult {
  config: WatchFaceConfig;
  code: GeneratedCode;
  resolved: ResolvedElement[];
}

export async function runPipeline(
  aiOutput: AIElement[],
  options: PipelineOptions = {},
): Promise<PipelineResult> {
  const log = options.onProgress ?? (() => {});

  // ─── Stage A: Validate AI output (representation, layout, group, type) ────
  validateAIOutput(aiOutput);
  console.log('[Pipeline] Stage A validated:', aiOutput.length, 'elements');

  // ─── Stage B: Normalize representation → Zepp widgets (AI or code fallback) ─
  let normalized: NormalizedElement[];

  if (options.aiConfig) {
    log('Stage B: Normalizing elements with AI...');
    try {
      normalized = await normalizeWithAI(options.aiConfig, aiOutput);
      console.log('[Pipeline] Stage B (AI) normalized:', normalized.length, 'elements');
    } catch (err) {
      console.warn('[Pipeline] Stage B AI failed, falling back to code normalizer:', err);
      log('Stage B: AI failed, using code fallback...');
      normalized = normalize(aiOutput);
      console.log('[Pipeline] Stage B (code fallback) normalized:', normalized.length, 'elements');
    }
  } else {
    normalized = normalize(aiOutput);
    console.log('[Pipeline] Stage B (code-only) normalized:', normalized.length, 'elements');
  }

  validateNormalized(normalized);

  // ─── Call 3: Resolve remaining ambiguities (if any ARC missing dataType) ──
  const unresolvedArcs = normalized.filter(
    el => el.widget === 'ARC_PROGRESS' && !el.dataType,
  );

  if (unresolvedArcs.length > 0 && options.aiConfig) {
    log('Call 3: Resolving arc ambiguities with AI...');
    try {
      normalized = await resolveAmbiguities(options.aiConfig, normalized);
      console.log('[Pipeline] Call 3 resolved ambiguities');
    } catch (err) {
      console.warn('[Pipeline] Call 3 failed, assigning fallback data types:', err);
      // Code fallback: assign remaining metrics deterministically
      normalized = assignFallbackDataTypes(normalized);
    }
    validateNormalized(normalized);
  } else if (unresolvedArcs.length > 0) {
    // No AI config — assign fallbacks in code
    normalized = assignFallbackDataTypes(normalized);
    validateNormalized(normalized);
  }

  // ─── Semantic Priority: Sort arcs by visual hierarchy ──────────────────
  log('Applying semantic priority...');
  normalized = sortArcsByPriority(normalized);
  console.log('[Pipeline] Semantic priority applied — arcs sorted by data type');

  // ─── Stage C: Layout (group zones + layout mode positioning) ──────────────
  log('Stage C: Computing layout...');
  const layouted = applyLayout(normalized);
  validateLayout(layouted);
  console.log('[Pipeline] Stage C layout:', layouted.length, 'elements');

  // ─── Stage D: Geometry (per-layout-mode: arc stacking / row bbox / standalone) ─
  log('Stage D: Solving geometry...');
  const geometry = solveGeometry(layouted);
  validateGeometry(geometry);
  console.log('[Pipeline] Stage D geometry:', geometry.length, 'elements');

  // ─── Stage E: Asset resolution ──────────────────────────────────────────
  log('Stage E: Resolving assets...');
  const resolved = resolveAssets(geometry);
  console.log('[Pipeline] Stage E assets resolved');

  // ─── Stage F: Bridge to V2 code generator ──────────────────────────────
  log('Stage F: Generating code...');
  const config = bridgeToWatchFaceConfig(resolved, options);
  const code = generateWatchFaceCodeV2(config);
  console.log('[Pipeline] Stage F code generated');

  return { config, code, resolved };
}

// ─── Fallback: Assign dataTypes to unresolved ARC_PROGRESS elements ────────────

const ARC_FALLBACK_PRIORITY = ['BATTERY', 'STEP', 'HEART', 'SPO2', 'CAL'];

function assignFallbackDataTypes(elements: NormalizedElement[]): NormalizedElement[] {
  const used = new Set(elements.map(e => e.dataType).filter(Boolean));

  return elements.map(el => {
    if (el.widget === 'ARC_PROGRESS' && !el.dataType) {
      const fallback = ARC_FALLBACK_PRIORITY.find(dt => !used.has(dt));
      if (fallback) {
        used.add(fallback);
        return { ...el, dataType: fallback };
      }
    }
    return el;
  });
}

// ─── Bridge: ResolvedElement[] → WatchFaceConfig ────────────────────────────────
// Converts pipeline output into the WatchFaceConfig shape that jsCodeGeneratorV2 expects.

function bridgeToWatchFaceConfig(
  elements: ResolvedElement[],
  options: PipelineOptions,
): WatchFaceConfig {
  const watchElements: WatchFaceElement[] = elements.map((el, idx) =>
    resolvedToWatchFaceElement(el, idx),
  );

  return {
    name: options.watchfaceName || 'AI Watchface',
    resolution: { width: 480, height: 480 },
    background: {
      src: options.backgroundSrc || 'background.png',
      format: 'TGA-RLP',
    },
    elements: watchElements,
    watchModel: options.watchModel || 'Balance 2',
  };
}

function resolvedToWatchFaceElement(el: ResolvedElement, idx: number): WatchFaceElement {
  const base: WatchFaceElement = {
    id: el.id,
    type: mapWidgetToElementType(el.widget),
    name: mapWidgetToName(el.widget, el.sourceType, idx),
    bounds: { x: 0, y: 0, width: 480, height: 480 }, // overridden per widget below
    visible: true,
    zIndex: idx + 1,
  };

  // ── Widget-specific coordinate assignment ─────────────────────────────────

  // TIME_POINTER: center-based, bounds = full screen container
  if (el.widget === 'TIME_POINTER') {
    base.center = { x: el.centerX, y: el.centerY };
    base.bounds = { x: 0, y: 0, width: 480, height: 480 };
    base.hourHandSrc = el.assets.hourHandSrc;
    base.minuteHandSrc = el.assets.minuteHandSrc;
    base.secondHandSrc = el.assets.secondHandSrc;
    base.coverSrc = el.assets.coverSrc;
    base.hourPos = { x: el.hourPosX!, y: el.hourPosY! };
    base.minutePos = { x: el.minutePosX!, y: el.minutePosY! };
    base.secondPos = { x: el.secondPosX!, y: el.secondPosY! };
    base.pointerCenter = { x: el.centerX, y: el.centerY };
    return base;
  }

  // ARC_PROGRESS: center-based, bounds = full screen container
  if (el.widget === 'ARC_PROGRESS') {
    base.center = { x: el.centerX, y: el.centerY };
    base.bounds = { x: 0, y: 0, width: 480, height: 480 };
    base.radius = el.radius;
    base.startAngle = el.startAngle;
    base.endAngle = el.endAngle;
    base.lineWidth = el.lineWidth;
    base.dataType = el.dataType;
    base.color = ARC_COLORS[el.dataType || ''] || '0x00FF00';
    return base;
  }

  // IMG_TIME: bounds from computed geometry (no center)
  if (el.widget === 'IMG_TIME') {
    base.bounds = { x: el.x!, y: el.y!, width: el.w!, height: el.h! };
    base.images = el.assets.fontArray;
    return base;
  }

  // IMG_DATE: bounds from computed geometry
  if (el.widget === 'IMG_DATE') {
    base.bounds = { x: el.x!, y: el.y!, width: el.w!, height: el.h! };
    if (el.sourceType === 'month') {
      base.images = el.assets.monthArray;
    } else {
      base.images = el.assets.fontArray;
    }
    return base;
  }

  // IMG_WEEK: bounds from computed geometry
  if (el.widget === 'IMG_WEEK') {
    base.bounds = { x: el.x!, y: el.y!, width: el.w!, height: el.h! };
    base.images = el.assets.weekArray;
    return base;
  }

  // TEXT_IMG: bounds from computed geometry
  if (el.widget === 'TEXT_IMG') {
    base.bounds = { x: el.x!, y: el.y!, width: el.w!, height: el.h! };
    base.fontArray = el.assets.fontArray;
    base.dataType = el.dataType;
    return base;
  }

  // IMG_LEVEL: bounds from computed geometry
  if (el.widget === 'IMG_LEVEL') {
    base.bounds = { x: el.x!, y: el.y!, width: el.w!, height: el.h! };
    base.images = el.assets.imageArray;
    base.dataType = el.dataType;
    return base;
  }

  // IMG_STATUS: bounds from computed geometry
  if (el.widget === 'IMG_STATUS') {
    base.bounds = { x: el.x!, y: el.y!, width: el.w!, height: el.h! };
    base.src = el.assets.src;
    base.statusType = 'DISCONNECT';
    return base;
  }

  // IMG: bounds from computed geometry
  if (el.widget === 'IMG') {
    base.bounds = { x: el.x!, y: el.y!, width: el.w!, height: el.h! };
    base.src = el.assets.src;
    return base;
  }

  // TEXT: bounds from computed geometry
  if (el.widget === 'TEXT') {
    base.bounds = { x: el.x!, y: el.y!, width: el.w!, height: el.h! };
    base.text = '';
    base.fontSize = 20;
    base.color = '0xFFFFFFFF';
    return base;
  }

  // Fallback: use geometry x/y if available, else centerX/centerY
  base.bounds = {
    x: el.x ?? el.centerX,
    y: el.y ?? el.centerY,
    width: el.w ?? 100,
    height: el.h ?? 100,
  };
  return base;
}

// ─── Per-data-type arc colors (hex for Zepp OS) ────────────────────────────────

const ARC_COLORS: Record<string, string> = {
  BATTERY:  '0x00CC88',
  STEP:     '0xFFD93D',
  HEART:    '0xFF6B6B',
  SPO2:     '0xEE5A24',
  CAL:      '0xFF9F43',
  DISTANCE: '0x54A0FF',
};

// Map pipeline widget names back to WatchFaceElement.type
// V2 generator uses element.type in the switch/case in generateWidgetCodeV2
function mapWidgetToElementType(
  widget: string,
): WatchFaceElement['type'] {
  const map: Record<string, WatchFaceElement['type']> = {
    TIME_POINTER: 'TIME_POINTER',
    ARC_PROGRESS: 'ARC_PROGRESS',
    TEXT:         'TEXT',
    TEXT_IMG:     'TEXT_IMG',
    IMG:          'IMG',
    IMG_STATUS:   'IMG_STATUS',
    IMG_LEVEL:    'IMG_LEVEL',
    // IMG_TIME, IMG_DATE, IMG_WEEK are routed by NAME in V2 generator,
    // so their type doesn't matter for the switch/case. Set to IMG as fallback.
    IMG_TIME:     'IMG',
    IMG_DATE:     'IMG',
    IMG_WEEK:     'IMG',
  };
  return map[widget] || 'IMG';
}

// Map widget to a name the V2 generator's name-based routing expects.
// V2 generator checks: name.includes('time'), name.includes('date'),
// name.includes('week'), name.includes('month')
// TEXT_IMG names use descriptive format: "Steps Value 0", "Battery Value 1"
// IMPORTANT: TEXT_IMG/IMG names must NOT contain 'time','date','week','month'
// to avoid accidentally triggering V2 generator's name-based routing.

/** Capitalize first letter of source type for readable names. */
function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Map data source types to safe display names (avoid V2 routing keywords). */
const SOURCE_DISPLAY_NAME: Record<string, string> = {
  steps:      'Steps',
  battery:    'Battery',
  heart_rate: 'Heart Rate',
  spo2:       'SpO2',
  calories:   'Calories',
  distance:   'Distance',
  weather:    'Weather',
  arc:        'Arc',
  text:       'Text',
};

function mapWidgetToName(
  widget: string,
  sourceType: string,
  idx: number,
): string {
  const displayName = SOURCE_DISPLAY_NAME[sourceType] || capitalize(sourceType);

  switch (widget) {
    case 'TIME_POINTER': return `Clock Hands ${idx}`;
    case 'IMG_TIME':     return `Digital Time ${idx}`;
    case 'IMG_DATE':     return sourceType === 'month' ? `Month ${idx}` : `Date ${idx}`;
    case 'IMG_WEEK':     return `Weekday ${idx}`;
    case 'ARC_PROGRESS': return `Arc ${displayName} ${idx}`;
    case 'TEXT_IMG':     return `${displayName} Value ${idx}`;
    case 'TEXT':         return `${displayName} Label ${idx}`;
    case 'IMG':          return `${displayName} Icon ${idx}`;
    case 'IMG_STATUS':   return `Status ${idx}`;
    case 'IMG_LEVEL':    return `Level ${displayName} ${idx}`;
    default:             return `Element ${idx}`;
  }
}

// ─── Re-exports for convenience ─────────────────────────────────────────────────

export { validateAIOutput } from './validators';
export { normalize } from './normalizer';
export { sortArcsByPriority } from './semanticPriority';
export { applyLayout } from './layoutEngine';
export { solveGeometry } from './geometrySolver';
export { resolveAssets } from './assetResolver';
export type { AIElement, AIExtractionResult, ResolvedElement } from '@/types/pipeline';
export type { PipelineAIConfig } from './pipelineAIService';
