// Geometry Extractor — Validates, normalizes, and attaches geometry from AI output.
// Inserted after AI extraction, before normalization.
//
// Responsibilities:
//   1. Validate that all elements have bounds
//   2. Clamp/normalize coordinates to 480×480 space
//   3. Detect circular shapes and compute center/radius/angles if missing
//   4. Attach validated geometry back to AIElement[]

import type { AIElement, AIBounds, AICenter } from '@/types/pipeline';
import { SCREEN } from './constants';
import { PipelineValidationError } from '@/types/pipeline';

const { W, H } = SCREEN;

// ─── Geometry Extraction ────────────────────────────────────────────────────────

/**
 * Enrich AIElements with validated, normalized geometry.
 * - Clamps all coordinates to 480×480
 * - Computes center from bounds if missing
 * - Detects circular shapes (aspect ratio ~1:1 + arc representation) and computes radius
 */
export function extractGeometry(elements: AIElement[]): AIElement[] {
  return elements.map(el => {
    const result = { ...el };

    // Step 1 — Normalize bounds (clamp to screen)
    if (result.bounds) {
      result.bounds = normalizeBounds(result.bounds);
    }

    // Step 2 — Compute center from bounds if not provided
    if (result.bounds && !result.center) {
      result.center = centerFromBounds(result.bounds);
    }

    // Step 3 — Normalize center (clamp)
    if (result.center) {
      result.center = normalizeCenter(result.center);
    }

    // Step 4 — Detect circular shape and compute radius/angles if missing
    if (result.bounds && isCircularShape(result)) {
      if (result.radius === undefined) {
        result.radius = radiusFromBounds(result.bounds);
      }
      if (result.startAngle === undefined) {
        result.startAngle = 135; // default arc start
      }
      if (result.endAngle === undefined) {
        result.endAngle = 135 + 300; // default full sweep
      }
    }

    // Step 5 — Clamp radius to screen
    if (result.radius !== undefined) {
      result.radius = Math.max(10, Math.min(result.radius, W / 2));
    }

    // Step 6 — Clamp angles to 0–720 range
    if (result.startAngle !== undefined) {
      result.startAngle = clampAngle(result.startAngle);
    }
    if (result.endAngle !== undefined) {
      result.endAngle = clampAngle(result.endAngle);
    }

    return result;
  });
}

// ─── Validation ─────────────────────────────────────────────────────────────────

/**
 * Validate that all elements have bounds after geometry extraction.
 * Rejects the batch if any element is missing bounds (FR-002).
 */
export function validateGeometryExtraction(elements: AIElement[]): void {
  const violations: string[] = [];

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    const prefix = `elements[${i}] (${el.id})`;

    if (!el.bounds) {
      violations.push(`${prefix}: missing bounds`);
    } else {
      if (typeof el.bounds.x !== 'number' || typeof el.bounds.y !== 'number' ||
          typeof el.bounds.w !== 'number' || typeof el.bounds.h !== 'number') {
        violations.push(`${prefix}: bounds has non-numeric fields`);
      }
      if (el.bounds.w <= 0 || el.bounds.h <= 0) {
        violations.push(`${prefix}: bounds has zero/negative size`);
      }
    }

    // Circular elements should have center
    if (isCircularShape(el) && !el.center) {
      violations.push(`${prefix}: circular element missing center`);
    }
  }

  if (violations.length > 0) {
    throw new PipelineValidationError('GeometryExtraction', violations);
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

/** Clamp bounds to 480×480 screen, ensure positive dimensions. */
function normalizeBounds(b: AIBounds): AIBounds {
  const x = clamp(b.x, 0, W);
  const y = clamp(b.y, 0, H);
  const w = clamp(b.w, 1, W - x);
  const h = clamp(b.h, 1, H - y);
  return { x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) };
}

/** Clamp center to screen. */
function normalizeCenter(c: AICenter): AICenter {
  return {
    x: clamp(Math.round(c.x), 0, W),
    y: clamp(Math.round(c.y), 0, H),
  };
}

/** Compute center from bounding box. */
function centerFromBounds(b: AIBounds): AICenter {
  return {
    x: Math.round(b.x + b.w / 2),
    y: Math.round(b.y + b.h / 2),
  };
}

/** Compute radius from bounding box (half the smaller dimension). */
function radiusFromBounds(b: AIBounds): number {
  return Math.round(Math.min(b.w, b.h) / 2);
}

/** Detect if an element is circular (arc representation + roughly square aspect ratio). */
function isCircularShape(el: AIElement): boolean {
  if (el.representation === 'arc' || el.representation === 'text+arc') {
    return true;
  }
  if (el.bounds) {
    const ratio = el.bounds.w / el.bounds.h;
    // Roughly square (0.8–1.2) and layout=arc → treat as circular
    if (ratio >= 0.8 && ratio <= 1.2 && el.layout === 'arc') {
      return true;
    }
  }
  return false;
}

/** Clamp a numeric value to [min, max]. */
function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/** Clamp angle to [0, 720] range. */
function clampAngle(angle: number): number {
  // Allow up to 720° for arcs that wrap past 360
  return Math.max(0, Math.min(720, angle));
}
