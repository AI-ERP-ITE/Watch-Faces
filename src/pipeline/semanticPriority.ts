// Semantic Priority Engine — Maps data types to visual hierarchy.
// Deterministic. No AI.
//
// Sits between Normalizer output and Geometry Solver.
// Priority determines: arc ordering, radius, sweep angle, thickness.
// Priority 0 = outermost, thickest, longest sweep = most prominent.

import type { NormalizedElement } from '@/types/pipeline';

// ─── Priority Map ───────────────────────────────────────────────────────────────
// Lower number = higher visual priority = outermost ring, thicker line, longer sweep.

const PRIORITY_MAP: Record<string, number> = {
  STEP:     0,
  BATTERY:  1,
  HEART:    2,
  CAL:      3,
  SPO2:     4,
  DISTANCE: 5,
};

// ─── Mock Data Values (0–1 range) ───────────────────────────────────────────────
// Used for sweep angle computation. Provides realistic visual fill at design time.

const MOCK_VALUES: Record<string, number> = {
  STEP:     0.70,
  BATTERY:  0.50,
  HEART:    0.65,
  CAL:      0.40,
  SPO2:     0.95,
  DISTANCE: 0.30,
};

const DEFAULT_PRIORITY = 5;
const DEFAULT_MOCK_VALUE = 0.50;

// ─── Public API ─────────────────────────────────────────────────────────────────

/** Get visual priority for a data type (lower = more prominent). */
export function getPriority(dataType: string | undefined): number {
  return PRIORITY_MAP[dataType || ''] ?? DEFAULT_PRIORITY;
}

/** Get mock data value (0–1) for sweep computation. */
export function getMockValue(dataType: string | undefined): number {
  return MOCK_VALUES[dataType || ''] ?? DEFAULT_MOCK_VALUE;
}

/** Sort arc elements by semantic priority (highest priority first = lowest number).
 *  Non-arc elements remain in original order, appended after arcs. */
export function sortArcsByPriority<T extends NormalizedElement>(elements: T[]): T[] {
  const arcs: T[] = [];
  const rest: T[] = [];

  for (const el of elements) {
    if (el.widget === 'ARC_PROGRESS') {
      arcs.push(el);
    } else {
      rest.push(el);
    }
  }

  arcs.sort((a, b) => getPriority(a.dataType) - getPriority(b.dataType));

  return [...arcs, ...rest];
}
