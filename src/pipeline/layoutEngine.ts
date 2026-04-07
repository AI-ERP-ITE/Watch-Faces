// Layout Engine — ANCHOR ONLY. Provides WHERE the system is anchored.
// NO AI. Deterministic. Minimal.
//
// Responsibility: region → anchor point. That's it.
// Geometry Solver owns: size, radius, angles, offsets, visual weight.
// Widgets that share a center (ARC_PROGRESS, TIME_POINTER, IMG_TIME) go to dead center;
// everything else spreads vertically from their region anchor.

import type { NormalizedElement, LayoutElement, Region } from '@/types/pipeline';
import { SCREEN } from './constants';

const { CX, CY } = SCREEN;

// ─── Region → Anchor Positions ──────────────────────────────────────────────────

const REGION_POSITIONS: Record<Region, { x: number; y: number }> = {
  center: { x: CX, y: CY },     // 240, 240
  top:    { x: CX, y: 80 },     // 240, 80
  bottom: { x: CX, y: 400 },    // 240, 400
  left:   { x: 80, y: CY },     // 80, 240
  right:  { x: 400, y: CY },    // 400, 240
};

// Widgets that always stay at the exact anchor (geometry solver controls everything else)
const CENTER_LOCKED_WIDGETS = new Set(['ARC_PROGRESS', 'TIME_POINTER', 'IMG_TIME']);

// Vertical spread (px) between sibling elements in the same region
const SPREAD_PX = 40;

// ─── Layout Engine ──────────────────────────────────────────────────────────────

export function applyLayout(elements: NormalizedElement[]): LayoutElement[] {
  const results: LayoutElement[] = [];

  // Group by region for within-region spreading
  const byRegion: Record<string, NormalizedElement[]> = {};
  for (const el of elements) {
    (byRegion[el.region] ??= []).push(el);
  }

  for (const [region, els] of Object.entries(byRegion)) {
    const anchor = REGION_POSITIONS[region as Region] ?? REGION_POSITIONS.center;

    // Separate center-locked (arc/pointer) from spreadable widgets
    const locked = els.filter(e => CENTER_LOCKED_WIDGETS.has(e.widget));
    const spreadable = els.filter(e => !CENTER_LOCKED_WIDGETS.has(e.widget));

    // Center-locked: exact anchor, no offset
    for (const el of locked) {
      results.push({ ...el, centerX: anchor.x, centerY: anchor.y });
    }

    // Spreadable: fan out vertically from anchor
    for (let i = 0; i < spreadable.length; i++) {
      const offset = (i - (spreadable.length - 1) / 2) * SPREAD_PX;
      results.push({
        ...spreadable[i],
        centerX: anchor.x,
        centerY: Math.round(anchor.y + offset),
      });
    }
  }

  return results;
}
