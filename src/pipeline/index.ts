// Pipeline Orchestrator — Multi-stage pipeline with AI calls + deterministic stages.
// Stage A (AI) → Validate → Stage B (AI) → Validate → Layout → Geometry → Assets → V2 Bridge
// Stage B uses cheaper text-only AI. Falls back to code-only normalizer if AI fails.
// Call 3 resolves remaining ambiguities (only if needed).

import type { AIElement, NormalizedElement, ResolvedElement } from '@/types/pipeline';
import type { WatchFaceConfig, WatchFaceElement, GeneratedCode } from '@/types';

import { validateAIOutput, validateNormalized, validateLayout, validateGeometry } from './validators';
import { normalize } from './normalizer';
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

  // ─── Stage 0: Validate AI output (reject coordinates, unknown types) ─────
  validateAIOutput(aiOutput);
  console.log('[Pipeline] Stage A validated:', aiOutput.length, 'elements');

  // ─── Stage B: Normalize AI types → Zepp widgets (AI call or code fallback) ─
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

  // ─── Stage C: Layout (deterministic region map) ──────────────────────────
  log('Stage C: Computing layout...');
  const layouted = applyLayout(normalized);
  validateLayout(layouted);
  console.log('[Pipeline] Stage C layout:', layouted.length, 'elements');

  // ─── Stage D: Geometry (deterministic) ──────────────────────────────────
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
    bounds: {
      x: el.x ?? el.centerX,
      y: el.y ?? el.centerY,
      width: el.w ?? 100,
      height: el.h ?? 100,
    },
    visible: true,
    zIndex: idx + 1,
  };

  // Center (for ARC_PROGRESS, CIRCLE, TIME_POINTER)
  base.center = { x: el.centerX, y: el.centerY };

  // TIME_POINTER specifics
  if (el.widget === 'TIME_POINTER') {
    base.hourHandSrc = el.assets.hourHandSrc;
    base.minuteHandSrc = el.assets.minuteHandSrc;
    base.secondHandSrc = el.assets.secondHandSrc;
    base.coverSrc = el.assets.coverSrc;
    base.hourPos = { x: el.hourPosX!, y: el.hourPosY! };
    base.minutePos = { x: el.minutePosX!, y: el.minutePosY! };
    base.secondPos = { x: el.secondPosX!, y: el.secondPosY! };
    base.pointerCenter = { x: el.centerX, y: el.centerY };
  }

  // ARC_PROGRESS specifics
  if (el.widget === 'ARC_PROGRESS') {
    base.radius = el.radius;
    base.startAngle = el.startAngle;
    base.endAngle = el.endAngle;
    base.lineWidth = el.lineWidth;
    base.dataType = el.dataType;
    base.color = ARC_COLORS[el.dataType || ''] || '0x00FF00';
  }

  // TEXT_IMG specifics
  if (el.widget === 'TEXT_IMG') {
    base.fontArray = el.assets.fontArray;
    base.dataType = el.dataType;
  }

  // IMG_TIME specifics
  if (el.widget === 'IMG_TIME') {
    base.images = el.assets.fontArray;
  }

  // IMG_DATE specifics
  if (el.widget === 'IMG_DATE') {
    if (el.sourceType === 'month') {
      base.images = el.assets.monthArray;
    } else {
      base.images = el.assets.fontArray;
    }
  }

  // IMG_WEEK specifics
  if (el.widget === 'IMG_WEEK') {
    base.images = el.assets.weekArray;
  }

  // IMG_LEVEL specifics
  if (el.widget === 'IMG_LEVEL') {
    base.images = el.assets.imageArray;
    base.dataType = el.dataType;
  }

  // IMG_STATUS specifics
  if (el.widget === 'IMG_STATUS') {
    base.src = el.assets.src;
    base.statusType = 'DISCONNECT';
  }

  // TEXT specifics
  if (el.widget === 'TEXT') {
    base.text = '';
    base.fontSize = 20;
    base.color = '0xFFFFFFFF';
  }

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
function mapWidgetToName(
  widget: string,
  sourceType: string,
  idx: number,
): string {
  switch (widget) {
    case 'TIME_POINTER': return `Clock Hands ${idx}`;
    case 'IMG_TIME':     return `Digital Time ${idx}`;
    case 'IMG_DATE':     return sourceType === 'month' ? `Month ${idx}` : `Date ${idx}`;
    case 'IMG_WEEK':     return `Weekday ${idx}`;
    case 'ARC_PROGRESS': return `Arc ${sourceType} ${idx}`;
    case 'TEXT_IMG':     return `Value ${sourceType} ${idx}`;
    case 'TEXT':         return `Text ${sourceType} ${idx}`;
    case 'IMG_STATUS':   return `Status ${idx}`;
    case 'IMG_LEVEL':    return `Level ${sourceType} ${idx}`;
    default:             return `Element ${idx}`;
  }
}

// ─── Re-exports for convenience ─────────────────────────────────────────────────

export { validateAIOutput } from './validators';
export { normalize } from './normalizer';
export { applyLayout } from './layoutEngine';
export { solveGeometry } from './geometrySolver';
export { resolveAssets } from './assetResolver';
export type { AIElement, AIExtractionResult, ResolvedElement } from '@/types/pipeline';
export type { PipelineAIConfig } from './pipelineAIService';
