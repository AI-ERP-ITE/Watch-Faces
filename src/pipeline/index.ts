// Pipeline Orchestrator — Runs all stages in sequence with validation between each.
// AI → Validate → Normalize → Validate → Layout → Geometry → Assets → V2 Bridge

import type { AIElement, ResolvedElement } from '@/types/pipeline';
import type { WatchFaceConfig, WatchFaceElement, GeneratedCode } from '@/types';

import { validateAIOutput, validateNormalized, validateLayout, validateGeometry } from './validators';
import { normalize } from './normalizer';
import { applyLayout } from './layoutEngine';
import { solveGeometry } from './geometrySolver';
import { resolveAssets } from './assetResolver';
import { generateWatchFaceCodeV2 } from '@/lib/jsCodeGeneratorV2';

// ─── Pipeline Orchestrator ──────────────────────────────────────────────────────

export interface PipelineOptions {
  watchfaceName?: string;
  watchModel?: string;
  backgroundSrc?: string;
}

export interface PipelineResult {
  config: WatchFaceConfig;
  code: GeneratedCode;
}

export function runPipeline(
  aiOutput: AIElement[],
  options: PipelineOptions = {},
): PipelineResult {
  // Stage 0: Validate AI output (reject coordinates, unknown types, etc.)
  validateAIOutput(aiOutput);

  // Stage 1: Normalize AI types → Zepp widgets
  const normalized = normalize(aiOutput);
  validateNormalized(normalized);

  // Stage 2: Compute layout positions (deterministic, per-region)
  const layouted = applyLayout(normalized);
  validateLayout(layouted);

  // Stage 3: Solve geometry (pivots, radii, angles, bounding boxes)
  const geometry = solveGeometry(layouted);
  validateGeometry(geometry);

  // Stage 4: Resolve asset paths
  const resolved = resolveAssets(geometry);

  // Stage 5: Bridge to existing V2 code generator
  const config = bridgeToWatchFaceConfig(resolved, options);
  const code = generateWatchFaceCodeV2(config);
  return { config, code };
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
    name: `${el.widget}_${el.sourceType}_${idx}`,
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
    base.color = '0x00FF00';
  }

  // TEXT_IMG specifics
  if (el.widget === 'TEXT_IMG') {
    base.fontArray = el.assets.fontArray;
    base.dataType = el.dataType;
  }

  // IMG_TIME specifics — set as time with the expected naming pattern
  if (el.widget === 'IMG_TIME') {
    base.name = `Digital Time ${idx}`;
    base.images = el.assets.fontArray;
  }

  // IMG_DATE specifics
  if (el.widget === 'IMG_DATE') {
    if (el.sourceType === 'month') {
      base.name = `Month ${idx}`;
      base.images = el.assets.monthArray;
    } else {
      base.name = `Date ${idx}`;
      base.images = el.assets.fontArray;
    }
  }

  // IMG_WEEK specifics
  if (el.widget === 'IMG_WEEK') {
    base.name = `Weekday ${idx}`;
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

// Map pipeline widget names back to WatchFaceElement.type
function mapWidgetToElementType(
  widget: string,
): WatchFaceElement['type'] {
  const map: Record<string, WatchFaceElement['type']> = {
    TIME_POINTER: 'TIME_POINTER',
    IMG_TIME:     'IMG',       // IMG_TIME uses the IMG handler path with time name
    IMG_DATE:     'IMG',       // IMG_DATE uses the IMG handler path with date name
    IMG_WEEK:     'IMG',       // IMG_WEEK uses the IMG handler path with week name
    ARC_PROGRESS: 'ARC_PROGRESS',
    TEXT:         'TEXT',
    TEXT_IMG:     'TEXT_IMG',
    IMG:          'IMG',
    IMG_STATUS:   'IMG_STATUS',
    IMG_LEVEL:    'IMG_LEVEL',
  };
  return map[widget] || 'IMG';
}

// ─── Re-exports for convenience ─────────────────────────────────────────────────

export { validateAIOutput } from './validators';
export { normalize } from './normalizer';
export { applyLayout } from './layoutEngine';
export { solveGeometry } from './geometrySolver';
export { resolveAssets } from './assetResolver';
export type { AIElement, AIExtractionResult, ResolvedElement } from '@/types/pipeline';
