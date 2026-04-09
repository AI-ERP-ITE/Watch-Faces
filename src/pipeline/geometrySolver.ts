// Geometry Solver — THE layer that controls SIZE, SHAPE, and SPATIAL INTELLIGENCE.
// Deterministic. No AI. No randomness.
//
// OWNERSHIP (5-layer model):
//   Layout Engine → WHERE (anchor point only)
//   Geometry Solver → HOW (radius, sweep, thickness, offsets, visual weight)
//
// Steps:
//   A – Extract arcs
//   B – Assign semantic priority (via semanticPriority module)
//   C – Radius from priority (NOT region)
//   D – Arc sweep (data-driven, mock values)
//   E – Thickness scaling
//   F – Time offset (calibrated override, NOT Layout Engine)

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

// ─── Calibrated time offset (from real watchface analysis) ──────────────────────
// TIME_POINTER and IMG_TIME anchor left of center for visual balance.

const TIME_CENTER_X = 140;
const TIME_CENTER_Y = CY;   // 240

// ─── Rectangular widget bounding boxes ──────────────────────────────────────────

const DEFAULT_SIZES: Record<string, { w: number; h: number }> = {
  TEXT:       { w: 200, h: 40 },
  TEXT_IMG:   { w: 160, h: 50 },
  IMG:        { w: 60,  h: 60 },
  IMG_STATUS: { w: 30,  h: 30 },
};

// ─── Geometry Solver ────────────────────────────────────────────────────────────

export function solveGeometry(elements: LayoutElement[]): GeometryElement[] {
  // ── STEP A: Extract arcs ──────────────────────────────────────────────────
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

  // ── STEPS B-E: Priority-based concentric arc stacking ─────────────────────
  // Elements arrive pre-sorted by semantic priority (sortArcsByPriority in orchestrator).
  // STEP B: Priority comes from semanticPriority module (getPriority).
  // STEP C: Radius = BASE_RADIUS - (priority * SPACING). NOT region-based.
  // STEP D: Sweep = mockValue * MAX_SWEEP. Data-driven, not fixed.
  // STEP E: Thickness = base lineWidth - (priority * step). Outer = thicker.
  for (const el of arcElements) {
    const priority = getPriority(el.dataType);       // Step B
    const mockValue = getMockValue(el.dataType);

    const radius = ARC_BASE_RADIUS - (priority * ARC_SPACING);      // Step C
    const sweep = mockValue * ARC_MAX_SWEEP;                         // Step D
    const lineWidth = Math.max(                                      // Step E
      ARC_LINE_WIDTH - (priority * ARC_LINE_WIDTH_STEP), 4,
    );

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

  // ── STEP F + widget-specific solvers ──────────────────────────────────────
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

// ─── TIME_POINTER (STEP F: calibrated offset) ──────────────────────────────────
// Geometry Solver intentionally overrides Layout Engine's anchor.
// TIME_CENTER_X = 140 (calibrated from real watchface), not screen center.

function solveTimePointer(el: LayoutElement): GeometryElement {
  return {
    ...el,
    centerX: TIME_CENTER_X,   // Step F override
    centerY: TIME_CENTER_Y,
    hourPosX:   Math.round(HAND_DIMENSIONS.hour.w / 2),
    hourPosY:   Math.round(HAND_DIMENSIONS.hour.h / 2),
    minutePosX: Math.round(HAND_DIMENSIONS.minute.w / 2),
    minutePosY: Math.round(HAND_DIMENSIONS.minute.h / 2),
    secondPosX: Math.round(HAND_DIMENSIONS.second.w / 2),
    secondPosY: Math.round(HAND_DIMENSIONS.second.h / 2),
  };
}

// ─── IMG_TIME (STEP F: calibrated offset) ───────────────────────────────────────
// Same calibrated offset as TIME_POINTER for visual alignment.

function solveImgTime(el: LayoutElement): GeometryElement {
  return {
    ...el,
    x: TIME_CENTER_X,        // Step F override — hour_startX
    y: TIME_CENTER_Y,        // hour_startY
    w: HOUR_CONTENT_W + TIME_COLON_GAP + HOUR_CONTENT_W,
    h: TIME_DIGIT.h,
  };
}

// ─── IMG_DATE ───────────────────────────────────────────────────────────────────

function solveImgDate(el: LayoutElement): GeometryElement {
  const w = el.sourceType === 'month' ? MONTH_LABEL.w : DATE_DIGIT.w * 2;
  const h = el.sourceType === 'month' ? MONTH_LABEL.h : DATE_DIGIT.h;
  return {
    ...el,
    x: Math.round(el.centerX - w / 2),
    y: Math.round(el.centerY - h / 2),
    w,
    h,
  };
}

// ─── IMG_WEEK ───────────────────────────────────────────────────────────────────

function solveImgWeek(el: LayoutElement): GeometryElement {
  return {
    ...el,
    x: Math.round(el.centerX - WEEK_LABEL.w / 2),
    y: Math.round(el.centerY - WEEK_LABEL.h / 2),
    w: WEEK_LABEL.w,
    h: WEEK_LABEL.h,
  };
}

// ─── IMG_LEVEL ──────────────────────────────────────────────────────────────────

function solveImgLevel(el: LayoutElement): GeometryElement {
  return {
    ...el,
    x: Math.round(el.centerX - WEATHER_ICON.w / 2),
    y: Math.round(el.centerY - WEATHER_ICON.h / 2),
    w: WEATHER_ICON.w,
    h: WEATHER_ICON.h,
  };
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
