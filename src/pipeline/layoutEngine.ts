// Layout Engine — Polar/radial layout for 480×480 round watchface.
// Watchfaces are NOT grid UIs. They are radial, layered, concentric systems.
//
// Rules:
// 1. ARC_PROGRESS — always centered at (240,240), differ only by radius (concentric stacking)
// 2. TIME_POINTER — always centered at (240,240), hands rotate around screen center
// 3. IMG_TIME (digital) — offset from center (left-biased for typical watchface layouts)
// 4. Center-region elements share the SAME center, they do NOT spread
// 5. Peripheral elements (top/bottom/left/right) get fixed anchor positions

import type { NormalizedElement, LayoutElement, Region } from '@/types/pipeline';

// ─── Screen Constants ───────────────────────────────────────────────────────────

const CX = 240; // screen center X
const CY = 240; // screen center Y

// ─── Peripheral anchors (for non-center, non-arc elements) ─────────────────────

interface Anchor { x: number; y: number }

const PERIPHERAL_ANCHORS: Record<Region, Anchor> = {
  center: { x: CX,  y: CY },
  top:    { x: CX,  y: 70 },
  bottom: { x: CX,  y: 410 },
  left:   { x: 100, y: CY },
  right:  { x: 380, y: CY },
};

// When multiple peripheral (non-arc) elements share a region, spread them.
const PERIPHERAL_SPACING: Record<Region, { dx: number; dy: number }> = {
  center: { dx: 0,  dy: 0 },   // center never spreads
  top:    { dx: 70, dy: 0 },
  bottom: { dx: 70, dy: 0 },
  left:   { dx: 0,  dy: 50 },
  right:  { dx: 0,  dy: 50 },
};

// ─── Layout Engine ──────────────────────────────────────────────────────────────

export function applyLayout(elements: NormalizedElement[]): LayoutElement[] {
  const results: LayoutElement[] = [];

  // --- Pass 1: Arcs — always at screen center, no spreading ---
  for (const el of elements) {
    if (el.widget === 'ARC_PROGRESS') {
      results.push({ ...el, centerX: CX, centerY: CY });
    }
  }

  // --- Pass 2: Time — always at screen center ---
  for (const el of elements) {
    if (el.widget === 'TIME_POINTER') {
      results.push({ ...el, centerX: CX, centerY: CY });
    }
    if (el.widget === 'IMG_TIME') {
      // Digital time: slightly above center
      results.push({ ...el, centerX: CX, centerY: CY - 30 });
    }
  }

  // --- Pass 3: Everything else — peripheral placement ---
  const peripheralBuckets: Record<Region, NormalizedElement[]> = {
    center: [], top: [], bottom: [], left: [], right: [],
  };

  for (const el of elements) {
    if (el.widget === 'ARC_PROGRESS' || el.widget === 'TIME_POINTER' || el.widget === 'IMG_TIME') {
      continue; // already handled
    }
    peripheralBuckets[el.region].push(el);
  }

  for (const region of Object.keys(peripheralBuckets) as Region[]) {
    const bucket = peripheralBuckets[region];
    if (bucket.length === 0) continue;

    const anchor = PERIPHERAL_ANCHORS[region];
    const spacing = PERIPHERAL_SPACING[region];
    const n = bucket.length;

    for (let i = 0; i < n; i++) {
      const offset = -((n - 1) / 2) + i;
      const cx = Math.round(anchor.x + spacing.dx * offset);
      const cy = Math.round(anchor.y + spacing.dy * offset);

      // Clamp to safe bounds (30px margin for round screen)
      results.push({
        ...bucket[i],
        centerX: Math.max(30, Math.min(450, cx)),
        centerY: Math.max(30, Math.min(450, cy)),
      });
    }
  }

  return results;
}
