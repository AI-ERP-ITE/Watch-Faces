// Constraint Solver — Converts normalized [0, 1] geometry → absolute pixel coordinates.
// Deterministic. No AI. No hardcoded layout positions.
//
// All positions originate from AI-extracted geometry (via normalization).
// This stage ONLY:
//   1. Scales normalized coords back to pixel space
//   2. Derives widget-specific positions (e.g. IMG_TIME minute offset)
//   3. Applies circular boundary constraints
//   4. Computes TIME_POINTER hand pivots from asset dimensions

import type { NormalizedElement, GeometryElement } from '@/types/pipeline';
import { SCREEN, TIME_DIGIT, HOUR_CONTENT_W, TIME_COLON_GAP } from './constants';

const S = SCREEN.W; // 480

// ─── Clock hand ASSET dimensions (intrinsic to generated PNGs, not layout) ──────

const HAND_DIMENSIONS = {
  hour:   { w: 22, h: 140 },
  minute: { w: 16, h: 200 },
  second: { w: 6,  h: 240 },
};

// ─── Constraint Solver ──────────────────────────────────────────────────────────

export function solveGeometry(elements: NormalizedElement[]): GeometryElement[] {
  return elements.map(el => {
    switch (el.widget) {
      case 'ARC_PROGRESS':
        return solveArc(el);
      case 'TIME_POINTER':
        return solveTimePointer(el);
      case 'IMG_TIME':
        return solveImgTime(el);
      default:
        return solveRectangular(el);
    }
  });
}

// ─── ARC_PROGRESS: denormalize center, radius, angles, thickness ────────────────

function solveArc(el: NormalizedElement): GeometryElement {
  const centerX = (el.ncx ?? 0.5) * S;
  const centerY = (el.ncy ?? 0.5) * S;
  const radius = (el.nr ?? 0.375) * S;          // fallback ~180px
  const lineWidth = (el.nt ?? 0.025) * S;       // fallback ~12px
  const startAngle = el.startAngle ?? 135;
  const endAngle = el.endAngle ?? 435;

  // Constrain radius to stay inside the circular display
  const maxRadius = Math.min(centerX, centerY, S - centerX, S - centerY) - lineWidth / 2;
  const constrainedRadius = Math.min(radius, Math.max(maxRadius, 20));

  return {
    id: el.id,
    widget: el.widget,
    sourceType: el.sourceType,
    shape: el.shape,
    dataType: el.dataType,
    style: el.style,
    centerX: Math.round(centerX),
    centerY: Math.round(centerY),
    radius: Math.round(constrainedRadius),
    startAngle,
    endAngle,
    lineWidth: Math.max(Math.round(lineWidth), 2),
  };
}

// ─── TIME_POINTER: denormalize center, compute hand pivots from asset dims ──────

function solveTimePointer(el: NormalizedElement): GeometryElement {
  // Center: from AI (center of analog hands), or from bbox center
  let centerX: number;
  let centerY: number;

  if (el.ncx !== undefined && el.ncy !== undefined) {
    centerX = el.ncx * S;
    centerY = el.ncy * S;
  } else if (el.nx !== undefined && el.ny !== undefined) {
    // Derive center from bbox
    centerX = (el.nx + (el.nw ?? 0) / 2) * S;
    centerY = (el.ny + (el.nh ?? 0) / 2) * S;
  } else {
    // Last resort: screen center
    centerX = SCREEN.CX;
    centerY = SCREEN.CY;
  }

  // Hand pivot offsets: derived from asset image dimensions
  return {
    id: el.id,
    widget: el.widget,
    sourceType: el.sourceType,
    shape: el.shape,
    dataType: el.dataType,
    style: el.style,
    centerX: Math.round(centerX),
    centerY: Math.round(centerY),
    hourPosX:   Math.round(HAND_DIMENSIONS.hour.w / 2),
    hourPosY:   Math.round(HAND_DIMENSIONS.hour.h / 2),
    minutePosX: Math.round(HAND_DIMENSIONS.minute.w / 2),
    minutePosY: Math.round(HAND_DIMENSIONS.minute.h / 2),
    secondPosX: Math.round(HAND_DIMENSIONS.second.w / 2),
    secondPosY: Math.round(HAND_DIMENSIONS.second.h / 2),
  };
}

// ─── IMG_TIME: denormalize bbox, derive minute offset from asset dimensions ─────

function solveImgTime(el: NormalizedElement): GeometryElement {
  const x = (el.nx ?? 0.24) * S;
  const y = (el.ny ?? 0.41) * S;
  const w = (el.nw ?? 0.52) * S;
  const h = (el.nh ?? 0.19) * S;

  // Center derived from bbox
  const centerX = x + w / 2;
  const centerY = y + h / 2;

  return {
    id: el.id,
    widget: el.widget,
    sourceType: el.sourceType,
    shape: el.shape,
    dataType: el.dataType,
    style: el.style,
    centerX: Math.round(centerX),
    centerY: Math.round(centerY),
    x: Math.round(x),
    y: Math.round(y),
    w: Math.round(HOUR_CONTENT_W + TIME_COLON_GAP + HOUR_CONTENT_W),
    h: TIME_DIGIT.h,
  };
}

// ─── Rectangular widgets: denormalize bbox ──────────────────────────────────────

function solveRectangular(el: NormalizedElement): GeometryElement {
  let x: number, y: number, w: number, h: number;

  if (el.nx !== undefined && el.ny !== undefined) {
    x = el.nx * S;
    y = el.ny * S;
    w = (el.nw ?? 0.2) * S;
    h = (el.nh ?? 0.08) * S;
  } else if (el.ncx !== undefined && el.ncy !== undefined) {
    // Arc-like element placed as rectangular: use center
    const cw = (el.nw ?? 0.2) * S;
    const ch = (el.nh ?? 0.08) * S;
    x = el.ncx * S - cw / 2;
    y = el.ncy * S - ch / 2;
    w = cw;
    h = ch;
  } else {
    // No geometry at all: center on screen with default size
    w = 100;
    h = 40;
    x = SCREEN.CX - w / 2;
    y = SCREEN.CY - h / 2;
  }

  // Constrain to stay within the circular display
  const constrained = constrainToCircle(x, y, w, h);

  return {
    id: el.id,
    widget: el.widget,
    sourceType: el.sourceType,
    shape: el.shape,
    dataType: el.dataType,
    style: el.style,
    centerX: Math.round(constrained.x + constrained.w / 2),
    centerY: Math.round(constrained.y + constrained.h / 2),
    x: Math.round(constrained.x),
    y: Math.round(constrained.y),
    w: Math.round(constrained.w),
    h: Math.round(constrained.h),
  };
}

// ─── Circular boundary constraint ───────────────────────────────────────────────
// Ensures the element bbox stays within the 480×480 circular display.

function constrainToCircle(
  x: number, y: number, w: number, h: number,
): { x: number; y: number; w: number; h: number } {
  const cx = SCREEN.CX;
  const cy = SCREEN.CY;
  const R = SCREEN.CX; // 240

  // Clamp center of element to be within the circle
  let mx = x + w / 2;
  let my = y + h / 2;
  const dx = mx - cx;
  const dy = my - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // If center is outside the circle, pull it in
  const maxDist = R - Math.max(w, h) / 2;
  if (dist > maxDist && maxDist > 0) {
    const scale = maxDist / dist;
    mx = cx + dx * scale;
    my = cy + dy * scale;
    x = mx - w / 2;
    y = my - h / 2;
  }

  // Clamp to screen bounds
  x = Math.max(0, Math.min(x, S - w));
  y = Math.max(0, Math.min(y, S - h));

  return { x, y, w, h };
}
