// Geometry Solver — Computes all spatial properties for each widget type.
// Deterministic. No AI. No randomness.
//
// KEY DESIGN: Polar/radial model for watchfaces.
// - Arcs are concentric: share same center, differ by radius (layer index)
// - Time hands share screen center
// - Rectangular widgets use bounding-box from center point

import type { LayoutElement, GeometryElement } from '@/types/pipeline';

// ─── Screen center ──────────────────────────────────────────────────────────────

const CX = 240;
const CY = 240;

// ─── Clock hand dimensions ──────────────────────────────────────────────────────

const HAND_DIMENSIONS = {
  hour:   { w: 22, h: 140 },
  minute: { w: 16, h: 200 },
  second: { w: 6,  h: 240 },
};

// ─── Arc stacking — concentric radii ────────────────────────────────────────────
// All arcs share (240,240). Each arc gets a smaller radius.

const ARC_BASE_RADIUS = 200;
const ARC_SPACING = 30;
const ARC_LINE_WIDTH = 12;

// Standardized arc sweep: 270° partial circle (135° to 405°)
// This is the most common watchface arc style — gap at bottom-left
const ARC_START_ANGLE = 135;
const ARC_END_ANGLE = 405;

// ─── Rectangular widget bounding boxes ──────────────────────────────────────────

const WIDGET_SIZES: Record<string, { w: number; h: number }> = {
  TEXT:       { w: 150, h: 40 },
  TEXT_IMG:   { w: 120, h: 40 },
  IMG_DATE:   { w: 100, h: 30 },
  IMG_WEEK:   { w: 120, h: 30 },
  IMG_TIME:   { w: 200, h: 60 },
  IMG:        { w: 50,  h: 50 },
  IMG_STATUS: { w: 30,  h: 30 },
  IMG_LEVEL:  { w: 50,  h: 50 },
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

  // --- Arcs: concentric stacking ---
  for (let i = 0; i < arcElements.length; i++) {
    const el = arcElements[i];
    const radius = ARC_BASE_RADIUS - (i * ARC_SPACING);

    results.push({
      ...el,
      centerX: CX,  // enforce shared center (override layout engine, belt-and-suspenders)
      centerY: CY,
      radius: Math.max(radius, 40), // floor at 40px
      startAngle: ARC_START_ANGLE,
      endAngle: ARC_END_ANGLE,
      lineWidth: ARC_LINE_WIDTH,
    });
  }

  // --- Everything else ---
  for (const el of otherElements) {
    switch (el.widget) {
      case 'TIME_POINTER':
        results.push(solveTimePointer(el));
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

// ─── Rectangular widgets ────────────────────────────────────────────────────────

function solveRectangular(el: LayoutElement): GeometryElement {
  const size = WIDGET_SIZES[el.widget] || { w: 100, h: 40 };

  return {
    ...el,
    x: Math.round(el.centerX - size.w / 2),
    y: Math.round(el.centerY - size.h / 2),
    w: size.w,
    h: size.h,
  };
}
