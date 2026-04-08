// Pipeline Orchestrator — Geometry-preserving deterministic pipeline.
// Image → AI Geometry Extraction → Normalize → Map Widgets → Constraint Solve → Assets → V2 Bridge
// All positions originate from the design image. No hardcoded layout.

import type { AIElement, NormalizedElement, ResolvedElement, GeometryElement } from '@/types/pipeline';
import type { WatchFaceConfig, WatchFaceElement, GeneratedCode } from '@/types';

import { validateAIOutput, validateNormalized, validateGeometry } from './validators';
import { normalizeGeometry } from './geometryNormalizer';
import { normalize } from './normalizer';
import { sortArcsByPriority } from './semanticPriority';
import { applyLayout } from './layoutEngine';
import { solveGeometry } from './geometrySolver';
import { resolveAssets } from './assetResolver';
import { generateWatchFaceCodeV2 } from '@/lib/jsCodeGeneratorV2';
import { normalizeWithAI, resolveAmbiguities, type PipelineAIConfig, type WidgetMapping } from './pipelineAIService';

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

  // ─── Stage 0: Validate AI output (require geometry, reject invalid) ──────
  validateAIOutput(aiOutput);
  console.log('[Pipeline] Stage 0 validated:', aiOutput.length, 'elements');

  // ─── Stage 1: Normalize geometry to [0, 1] space ────────────────────────
  log('Stage 1: Normalizing geometry...');
  const normalizedGeometry = normalizeGeometry(aiOutput);
  console.log('[Pipeline] Stage 1 normalized:', normalizedGeometry.length, 'elements');

  // ─── Stage 2: Map AI types → Zepp widgets + dataType ─────────────────────
  let mapped: NormalizedElement[];

  if (options.aiConfig) {
    log('Stage 2: Mapping widgets with AI...');
    try {
      // AI normalization: get widget assignments
      const aiMapped = await normalizeWithAI(options.aiConfig, aiOutput);
      console.log('[Pipeline] Stage 2 (AI) mapped:', aiMapped.length, 'elements');

      // Merge AI widget assignments with normalized geometry
      mapped = mergeWidgetMappingWithGeometry(aiMapped, normalizedGeometry);
    } catch (err) {
      console.warn('[Pipeline] Stage 2 AI failed, falling back to code normalizer:', err);
      log('Stage 2: AI failed, using code fallback...');
      mapped = normalize(normalizedGeometry);
      console.log('[Pipeline] Stage 2 (code fallback) mapped:', mapped.length, 'elements');
    }
  } else {
    mapped = normalize(normalizedGeometry);
    console.log('[Pipeline] Stage 2 (code-only) mapped:', mapped.length, 'elements');
  }

  validateNormalized(mapped);

  // ─── Call 3: Resolve remaining ambiguities (if any ARC missing dataType) ──
  const unresolvedArcs = mapped.filter(
    el => el.widget === 'ARC_PROGRESS' && !el.dataType,
  );

  if (unresolvedArcs.length > 0 && options.aiConfig) {
    log('Call 3: Resolving arc ambiguities with AI...');
    try {
      const aiResolved = await resolveAmbiguities(options.aiConfig, mapped.map(m => ({
        id: m.id, widget: m.widget, sourceType: m.sourceType, dataType: m.dataType,
      })));
      // Merge resolved dataTypes back into mapped elements (preserve geometry)
      mapped = mergeDataTypes(mapped, aiResolved);
      console.log('[Pipeline] Call 3 resolved ambiguities');
    } catch (err) {
      console.warn('[Pipeline] Call 3 failed, assigning fallback data types:', err);
      mapped = assignFallbackDataTypes(mapped);
    }
    validateNormalized(mapped);
  } else if (unresolvedArcs.length > 0) {
    mapped = assignFallbackDataTypes(mapped);
    validateNormalized(mapped);
  }

  // ─── Semantic Priority: Sort arcs by visual hierarchy ──────────────────
  log('Applying semantic priority...');
  mapped = sortArcsByPriority(mapped);
  console.log('[Pipeline] Semantic priority applied — arcs sorted by data type');

  // ─── Layout Engine (pass-through in geometry-preserving pipeline) ────────
  mapped = applyLayout(mapped);

  // ─── Constraint Solver: normalized → absolute pixel coordinates ─────────
  log('Solving geometry constraints...');
  const geometry = solveGeometry(mapped);
  validateGeometry(geometry);
  console.log('[Pipeline] Constraint solver:', geometry.length, 'elements');

  // ─── Asset Resolution ──────────────────────────────────────────────────
  log('Resolving assets...');
  const resolved = resolveAssets(geometry);
  console.log('[Pipeline] Assets resolved');

  // ─── Bridge to V2 Code Generator ──────────────────────────────────────
  log('Generating code...');
  const config = bridgeToWatchFaceConfig(resolved, options);
  const code = generateWatchFaceCodeV2(config);
  console.log('[Pipeline] Code generated');

  return { config, code, resolved };
}

// ─── Merge AI widget mapping with normalized geometry ───────────────────────────
// AI returns {id, widget, sourceType, dataType}. Geometry has {id, nx, ny, ...}.
// Merge by matching id.

function mergeWidgetMappingWithGeometry(
  aiMapped: WidgetMapping[],
  normalizedGeometry: Array<{ id: string; type: string; shape: string; nx?: number; ny?: number; nw?: number; nh?: number; ncx?: number; ncy?: number; nr?: number; nt?: number; startAngle?: number; endAngle?: number; style?: string }>,
): NormalizedElement[] {
  const geoMap = new Map(normalizedGeometry.map(g => [g.id, g]));

  return aiMapped.map(ai => {
    const geo = geoMap.get(ai.id);
    return {
      id: ai.id,
      widget: ai.widget as NormalizedElement['widget'],
      sourceType: ai.sourceType as NormalizedElement['sourceType'],
      shape: (geo?.shape ?? 'text') as NormalizedElement['shape'],
      dataType: ai.dataType,
      style: geo?.style as NormalizedElement['style'],
      nx: geo?.nx,
      ny: geo?.ny,
      nw: geo?.nw,
      nh: geo?.nh,
      ncx: geo?.ncx,
      ncy: geo?.ncy,
      nr: geo?.nr,
      nt: geo?.nt,
      startAngle: geo?.startAngle,
      endAngle: geo?.endAngle,
    };
  });
}

// ─── Merge resolved dataTypes back into mapped elements ─────────────────────────

function mergeDataTypes(
  mapped: NormalizedElement[],
  resolved: Array<{ id: string; dataType?: string }>,
): NormalizedElement[] {
  const dtMap = new Map(resolved.map(r => [r.id, r.dataType]));
  return mapped.map(el => {
    const newDt = dtMap.get(el.id);
    if (newDt && !el.dataType) {
      return { ...el, dataType: newDt };
    }
    return el;
  });
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
    // Only assign real bounds for widgets that USE bounds (not arcs)
    bounds: buildBounds(el),
    visible: true,
    zIndex: idx + 1,
  };

  // Center (for ARC_PROGRESS, TIME_POINTER)
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

  // ARC_PROGRESS specifics — ONLY center/radius/angles, NO fake bounds
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

// ─── Build bounds: real for widgets that use them, minimal for arcs ──────────────

function buildBounds(el: GeometryElement): { x: number; y: number; width: number; height: number } {
  if (el.widget === 'ARC_PROGRESS') {
    // ARC_PROGRESS does NOT use bounds — V2 generator reads center/radius.
    // Set minimal bounds at center for any code that reads bounds as fallback.
    return { x: el.centerX, y: el.centerY, width: 0, height: 0 };
  }

  // All other widgets: use the constraint-solved position
  return {
    x: el.x ?? el.centerX,
    y: el.y ?? el.centerY,
    width: el.w ?? 0,
    height: el.h ?? 0,
  };
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
    // IMG_TIME, IMG_DATE, IMG_WEEK are routed by NAME in V2 generator
    IMG_TIME:     'IMG',
    IMG_DATE:     'IMG',
    IMG_WEEK:     'IMG',
  };
  return map[widget] || 'IMG';
}

// Map widget to a name the V2 generator's name-based routing expects.
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
export { normalizeGeometry } from './geometryNormalizer';
export { sortArcsByPriority } from './semanticPriority';
export { applyLayout } from './layoutEngine';
export { solveGeometry } from './geometrySolver';
export { resolveAssets } from './assetResolver';
export type { AIElement, AIExtractionResult, ResolvedElement } from '@/types/pipeline';
export type { PipelineAIConfig } from './pipelineAIService';
