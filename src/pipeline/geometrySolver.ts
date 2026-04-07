// Geometry Solver — Computes all spatial properties for each widget type.
// Deterministic. No AI. No randomness.
//
// KEY DESIGN: Polar/radial model for watchfaces.
// - Arcs are concentric: share same center, differ by radius (layer index)
// - Time hands share screen center
// - Rectangular widgets use positions from layout engine (which already accounts for content size)

import type { LayoutElement, GeometryElement } from '@/types/pipeline';
import {
  SCREEN, ARC_BASE_RADIUS, ARC_SPACING, ARC_LINE_WIDTH,
  ARC_LINE_WIDTH_STEP, ARC_START_ANGLE, ARC_MAX_SWEEP,
  TIME_DIGIT, HOUR_CONTENT_W, TIME_COLON_GAP,
  DATE_DIGIT, MONTH_LABEL, WEEK_LABEL, WEATHER_ICON,
} from './constants';
import { getPriority, getMockValue } from './semanticPriority';

const { CX, CY } = SCREEN;

// ─── Clock hand dimensions ──────────────────────────────────────────────────────

const HAND_DIMENSIONS = {
  hour:   { w: 22, h: 140 },
  minute: { w: 16, h: 200 },
  second: { w: 6,  h: 240 },
};

// ─── Rectangular widget bounding boxes ──────────────────────────────────────────
// These are used ONLY for widget types that don't have specific solvers below.

const DEFAULT_SIZES: Record<string, { w: number; h: number }> = {
  TEXT:       { w: 200, h: 40 },
  TEXT_IMG:   { w: 160, h: 50 },
  IMG:        { w: 60,  h: 60 },
  IMG_STATUS: { w: 30,  h: 30 },
};

// ─── Geometry Solver ────────────────────────────────────────────────────────────

export function solveGeometry(elements: LayoutElement[]): GeometryElement[] {
  // Collect arcs for concentric stacking (order = layer index)
  const arcElements: LayoutElement[] = [];
  const otherElements: LayoutElement[] = [];

  for (const el of elements) {
    if (el.widget === 'ARC_PROGRESS') {
      arcElements.push(el);
    } else {
      otherElements.push(el);
    }
  }

  const results: GeometryElement[] = [];

  // --- Arcs: priority-based concentric stacking ---
  // Elements arrive pre-sorted by semantic priority (sortArcsByPriority in orchestrator).
  // Each arc's radius, sweep, and thickness derive from its dataType priority.
  for (const el of arcElements) {
    const priority = getPriority(el.dataType);
    const mockValue = getMockValue(el.dataType);

    const radius = ARC_BASE_RADIUS - (priority * ARC_SPACING);
    const sweep = mockValue * ARC_MAX_SWEEP;
    const lineWidth = Math.max(ARC_LINE_WIDTH - (priority * ARC_LINE_WIDTH_STEP), 4);

    results.push({
      ...el,
      centerX: CX,
      centerY: CY,
      radius: Math.max(radius, 40),
      startAngle: ARC_START_ANGLE,
      endAngle: ARC_START_ANGLE + sweep,
      lineWidth,
    });
  }

  // --- Everything else ---
  for (const el of otherElements) {
    switch (el.widget) {
      case 'TIME_POINTER':
        results.push(solveTimePointer(el));
        break;
      case 'IMG_TIME':
        results.push(solveImgTime(el));
        break;
      case 'IMG_DATE':
        results.push(solveImgDate(el));
        break;
      case 'IMG_WEEK':
        results.push(solveImgWeek(el));
        break;
      case 'IMG_LEVEL':
        results.push(solveImgLevel(el));
        break;
      default:
        results.push(solveRectangular(el));
        break;
    }
  }

  return results;
}

// ─── TIME_POINTER ───────────────────────────────────────────────────────────────

function solveTimePointer(el: LayoutElement): GeometryElement {
  return {
    ...el,
    centerX: CX,  // enforce screen center
    centerY: CY,
    hourPosX:   Math.round(HAND_DIMENSIONS.hour.w / 2),
    hourPosY:   Math.round(HAND_DIMENSIONS.hour.h / 2),
    minutePosX: Math.round(HAND_DIMENSIONS.minute.w / 2),
    minutePosY: Math.round(HAND_DIMENSIONS.minute.h / 2),
    secondPosX: Math.round(HAND_DIMENSIONS.second.w / 2),
    secondPosY: Math.round(HAND_DIMENSIONS.second.h / 2),
  };
}

// ─── IMG_TIME ───────────────────────────────────────────────────────────────────
// Layout engine provides (centerX, centerY) as the top-left of the hour group.
// We pass these through directly — the V2 generator uses them as hour_startX/Y
// and computes minute_startX from shared constants.

function solveImgTime(el: LayoutElement): GeometryElement {
  return {
    ...el,
    x: el.centerX,   // hour_startX (already computed by layout engine)
    y: el.centerY,   // hour_startY
    w: HOUR_CONTENT_W + TIME_COLON_GAP + HOUR_CONTENT_W,  // total content width
    h: TIME_DIGIT.h,
  };
}

// ─── IMG_DATE ───────────────────────────────────────────────────────────────────
// Layout engine provides top-left corner for day or month.

function solveImgDate(el: LayoutElement): GeometryElement {
  if (el.sourceType === 'month') {
    return { ...el, x: el.centerX, y: el.centerY, w: MONTH_LABEL.w, h: MONTH_LABEL.h };
  }
  // Day digits — 2 digits side by side
  return { ...el, x: el.centerX, y: el.centerY, w: DATE_DIGIT.w * 2, h: DATE_DIGIT.h };
}

// ─── IMG_WEEK ───────────────────────────────────────────────────────────────────

function solveImgWeek(el: LayoutElement): GeometryElement {
  return { ...el, x: el.centerX, y: el.centerY, w: WEEK_LABEL.w, h: WEEK_LABEL.h };
}

// ─── IMG_LEVEL ──────────────────────────────────────────────────────────────────

function solveImgLevel(el: LayoutElement): GeometryElement {
  return { ...el, x: el.centerX, y: el.centerY, w: WEATHER_ICON.w, h: WEATHER_ICON.h };
}

// ─── Rectangular widgets ────────────────────────────────────────────────────────

function solveRectangular(el: LayoutElement): GeometryElement {
  const size = DEFAULT_SIZES[el.widget] || { w: 100, h: 40 };

  return {
    ...el,
    x: Math.round(el.centerX - size.w / 2),
    y: Math.round(el.centerY - size.h / 2),
    w: size.w,
    h: size.h,
  };
}
