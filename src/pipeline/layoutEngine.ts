// Layout Engine — Deterministic region → screen-coordinate mapping.
// No AI. No randomness. Hardcoded for 480×480 round display.

import type { NormalizedElement, LayoutElement, Region } from '@/types/pipeline';

// ─── Screen Constants ───────────────────────────────────────────────────────────

const SCREEN_W = 480;
const SCREEN_H = 480;

// ─── Region → Center-Point Map ──────────────────────────────────────────────────

const REGION_MAP: Record<Region, { x: number; y: number }> = {
  center: { x: 240, y: 240 },
  top:    { x: 240, y: 80 },
  bottom: { x: 240, y: 400 },
  left:   { x: 80,  y: 240 },
  right:  { x: 400, y: 240 },
};

// ─── Collision avoidance ────────────────────────────────────────────────────────
// When multiple elements share a region, offset them so they don't stack.

const REGION_OFFSETS: Record<Region, { dx: number; dy: number }> = {
  center: { dx: 0,   dy: 50 },
  top:    { dx: 60,  dy: 0 },
  bottom: { dx: 60,  dy: 0 },
  left:   { dx: 0,   dy: 50 },
  right:  { dx: 0,   dy: 50 },
};

// ─── Layout Engine ──────────────────────────────────────────────────────────────

export function applyLayout(elements: NormalizedElement[]): LayoutElement[] {
  // Track how many elements have been placed per region for offset calculation
  const regionCount: Record<Region, number> = {
    center: 0,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  };

  return elements.map((el) => {
    const base = REGION_MAP[el.region];
    const offset = REGION_OFFSETS[el.region];
    const idx = regionCount[el.region];

    // First element in region gets exact center; subsequent elements are offset
    // Spread evenly: subtract half the total offset, then add per-element
    let centerX = base.x + offset.dx * idx;
    let centerY = base.y + offset.dy * idx;

    // Clamp to screen bounds
    centerX = Math.max(0, Math.min(SCREEN_W, centerX));
    centerY = Math.max(0, Math.min(SCREEN_H, centerY));

    regionCount[el.region]++;

    return {
      ...el,
      centerX,
      centerY,
    };
  });
}
