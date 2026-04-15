// Geometry Solver — THE layer that controls SIZE, SHAPE, and SPATIAL INTELLIGENCE.
// Deterministic. No AI. No randomness.
//
// RULE: "Preserve first, fallback second"
//   If the AI provided a value (bounds, radius, center, angles), USE IT.
//   Only compute a fallback if the value is missing.
//
// OWNERSHIP (5-layer model):
//   Layout Engine → WHERE (anchor point only)
//   Geometry Solver → HOW (fills in missing radius, sweep, thickness, offsets)

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

// ─── Fallback positions (only used when AI didn't provide coordinates) ──────────

const FALLBACK_TIME_CENTER_X = CX;  // 240 — screen center (was hardcoded 140)
const FALLBACK_TIME_CENTER_Y = CY;  // 240

// ─── Rectangular widget bounding boxes ──────────────────────────────────────────

const DEFAULT_SIZES: Record<string, { w: number; h: number }> = {
  TEXT:       { w: 200, h: 40 },
  TEXT_IMG:   { w: 160, h: 50 },
  IMG:        { w: 60,  h: 60 },
  IMG_STATUS: { w: 30,  h: 30 },
};

// ─── Geometry Solver ────────────────────────────────────────────────────────────

export function solveGeometry(elements: LayoutElement[]): GeometryElement[] {
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

  // ── ARC: Preserve AI geometry, fallback to priority-based stacking ────────
  for (const el of arcElements) {
    // If AI provided arc geometry, USE IT (preserve first)
    if (el.radius !== undefined && el.startAngle !== undefined && el.endAngle !== undefined) {
      results.push({
        ...el,
        centerX: el.center?.x ?? el.centerX,
        centerY: el.center?.y ?? el.centerY,
        radius: el.radius,
        startAngle: el.startAngle,
        endAngle: el.endAngle,
        lineWidth: el.lineWidth ?? ARC_LINE_WIDTH,
      });
      continue;
    }

    // Fallback: compute from priority (only when AI didn't provide)
    const priority = getPriority(el.dataType);
    const mockValue = getMockValue(el.dataType);

    const radius = ARC_BASE_RADIUS - (priority * ARC_SPACING);
    const sweep = mockValue * ARC_MAX_SWEEP;
    const lineWidth = Math.max(
      ARC_LINE_WIDTH - (priority * ARC_LINE_WIDTH_STEP), 4,
    );

    results.push({
      ...el,
      centerX: el.center?.x ?? CX,
      centerY: el.center?.y ?? CY,
      radius: Math.max(radius, 40),
      startAngle: ARC_START_ANGLE,
      endAngle: ARC_START_ANGLE + sweep,
      lineWidth,
    });
  }

  // ── Non-ARC: Preserve AI bounds, fallback to widget-specific solvers ──────
  for (const el of otherElements) {
    // If element has AI-extracted bounds, use them directly
    if (el.bounds) {
      results.push(solveWithExtractedBounds(el));
      continue;
    }

    // Fallback: widget-specific solver (only when no AI bounds)
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

// ─── TIME_POINTER fallback (only when AI didn't provide bounds) ─────────────────

function solveTimePointer(el: LayoutElement): GeometryElement {
  return {
    ...el,
    centerX: FALLBACK_TIME_CENTER_X,
    centerY: FALLBACK_TIME_CENTER_Y,
    hourPosX:   Math.round(HAND_DIMENSIONS.hour.w / 2),
    hourPosY:   Math.round(HAND_DIMENSIONS.hour.h / 2),
    minutePosX: Math.round(HAND_DIMENSIONS.minute.w / 2),
    minutePosY: Math.round(HAND_DIMENSIONS.minute.h / 2),
    secondPosX: Math.round(HAND_DIMENSIONS.second.w / 2),
    secondPosY: Math.round(HAND_DIMENSIONS.second.h / 2),
  };
}

// ─── IMG_TIME fallback (only when AI didn't provide bounds) ─────────────────────

function solveImgTime(el: LayoutElement): GeometryElement {
  return {
    ...el,
    x: FALLBACK_TIME_CENTER_X,
    y: FALLBACK_TIME_CENTER_Y,
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

// ─── FR-005: Pass-through for elements with AI-extracted bounds ─────────────────
// Uses extracted bounds directly. For TIME_POINTER, still computes hand positions.

function solveWithExtractedBounds(el: LayoutElement): GeometryElement {
  const b = el.bounds!;

  // TIME_POINTER: use extracted center but still need hand pivot positions
  if (el.widget === 'TIME_POINTER') {
    return {
      ...el,
      centerX: el.center?.x ?? el.centerX,
      centerY: el.center?.y ?? el.centerY,
      hourPosX:   Math.round(HAND_DIMENSIONS.hour.w / 2),
      hourPosY:   Math.round(HAND_DIMENSIONS.hour.h / 2),
      minutePosX: Math.round(HAND_DIMENSIONS.minute.w / 2),
      minutePosY: Math.round(HAND_DIMENSIONS.minute.h / 2),
      secondPosX: Math.round(HAND_DIMENSIONS.second.w / 2),
      secondPosY: Math.round(HAND_DIMENSIONS.second.h / 2),
    };
  }

  // All other widgets: use bounds as x/y/w/h directly
  return {
    ...el,
    x: b.x,
    y: b.y,
    w: b.w,
    h: b.h,
  };
}
