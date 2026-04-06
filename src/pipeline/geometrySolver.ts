// Geometry Solver — Computes all spatial properties for each widget type.
// Deterministic. No AI. No randomness.

import type { LayoutElement, GeometryElement, Region } from '@/types/pipeline';

// ─── Fixed Dimensions for Known Assets ──────────────────────────────────────────

const HAND_DIMENSIONS = {
  hour:   { w: 22, h: 140 },
  minute: { w: 16, h: 200 },
  second: { w: 6,  h: 240 },
};

const ARC_RADIUS: Record<Region, number> = {
  center: 180,
  top:    80,
  bottom: 80,
  left:   80,
  right:  80,
};

const ARC_ANGLES: Record<Region, { start: number; end: number }> = {
  center: { start: -90,  end: 270 },
  top:    { start: 0,    end: 180 },
  bottom: { start: 180,  end: 360 },
  left:   { start: 90,   end: 270 },
  right:  { start: -90,  end: 90 },
};

const ARC_LINE_WIDTH = 8;

// Widget default bounding box sizes (for TEXT, TEXT_IMG, IMG_DATE, etc.)
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
  return elements.map((el) => {
    switch (el.widget) {
      case 'TIME_POINTER':
        return solveTimePointer(el);
      case 'ARC_PROGRESS':
        return solveArcProgress(el);
      default:
        return solveRectangular(el);
    }
  });
}

// ─── TIME_POINTER ───────────────────────────────────────────────────────────────
// posX/posY = rotation pivot within image from TOP-LEFT corner = center of image

function solveTimePointer(el: LayoutElement): GeometryElement {
  return {
    ...el,
    // Pivot points: center of each hand image
    hourPosX:   Math.round(HAND_DIMENSIONS.hour.w / 2),
    hourPosY:   Math.round(HAND_DIMENSIONS.hour.h / 2),
    minutePosX: Math.round(HAND_DIMENSIONS.minute.w / 2),
    minutePosY: Math.round(HAND_DIMENSIONS.minute.h / 2),
    secondPosX: Math.round(HAND_DIMENSIONS.second.w / 2),
    secondPosY: Math.round(HAND_DIMENSIONS.second.h / 2),
    // centerX/centerY already set by layout engine (screen-space rotation center)
  };
}

// ─── ARC_PROGRESS ───────────────────────────────────────────────────────────────

function solveArcProgress(el: LayoutElement): GeometryElement {
  const radius = ARC_RADIUS[el.region];
  const angles = ARC_ANGLES[el.region];

  return {
    ...el,
    radius,
    startAngle: angles.start,
    endAngle:   angles.end,
    lineWidth:  ARC_LINE_WIDTH,
  };
}

// ─── Rectangular widgets (TEXT, TEXT_IMG, IMG_DATE, IMG_WEEK, IMG_TIME, etc.) ───
// Convert centerX/centerY → top-left x/y using known widget sizes

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
