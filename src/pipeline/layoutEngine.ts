// Layout Engine — Deterministic region → screen-coordinate mapping.
// No AI. No randomness. Hardcoded for 480×480 round display.

import type { NormalizedElement, LayoutElement, Region } from '@/types/pipeline';

// ─── Screen Constants ───────────────────────────────────────────────────────────

const SCREEN_W = 480;
const SCREEN_H = 480;
const SCREEN_CX = SCREEN_W / 2;
const SCREEN_CY = SCREEN_H / 2;
const SAFE_MARGIN = 30; // keep elements away from edges of round screen

// ─── Region definition ──────────────────────────────────────────────────────────
// Each region has an anchor point and a layout axis.
// Multiple elements in the same region spread along that axis, centered on anchor.

interface RegionDef {
  anchorX: number;
  anchorY: number;
  axis: 'horizontal' | 'vertical';
  spacing: number; // gap between element centers
}

const REGION_DEFS: Record<Region, RegionDef> = {
  center: { anchorX: SCREEN_CX, anchorY: SCREEN_CY, axis: 'vertical',   spacing: 50 },
  top:    { anchorX: SCREEN_CX, anchorY: 90,         axis: 'horizontal', spacing: 65 },
  bottom: { anchorX: SCREEN_CX, anchorY: 390,        axis: 'horizontal', spacing: 65 },
  left:   { anchorX: 100,       anchorY: SCREEN_CY,  axis: 'vertical',   spacing: 55 },
  right:  { anchorX: 380,       anchorY: SCREEN_CY,  axis: 'vertical',   spacing: 55 },
};

// ─── Layout Engine ──────────────────────────────────────────────────────────────

export function applyLayout(elements: NormalizedElement[]): LayoutElement[] {
  // Group elements by region first
  const regionBuckets: Record<Region, NormalizedElement[]> = {
    center: [], top: [], bottom: [], left: [], right: [],
  };
  for (const el of elements) {
    regionBuckets[el.region].push(el);
  }

  const results: LayoutElement[] = [];

  for (const region of Object.keys(regionBuckets) as Region[]) {
    const bucket = regionBuckets[region];
    if (bucket.length === 0) continue;

    const def = REGION_DEFS[region];
    const n = bucket.length;

    // Center the group: first element goes at -(n-1)/2 * spacing from anchor
    const startOffset = -((n - 1) / 2) * def.spacing;

    for (let i = 0; i < n; i++) {
      const offset = startOffset + i * def.spacing;
      let cx: number, cy: number;

      if (def.axis === 'horizontal') {
        cx = def.anchorX + offset;
        cy = def.anchorY;
      } else {
        cx = def.anchorX;
        cy = def.anchorY + offset;
      }

      // Clamp to safe screen bounds
      cx = Math.max(SAFE_MARGIN, Math.min(SCREEN_W - SAFE_MARGIN, cx));
      cy = Math.max(SAFE_MARGIN, Math.min(SCREEN_H - SAFE_MARGIN, cy));

      results.push({
        ...bucket[i],
        centerX: Math.round(cx),
        centerY: Math.round(cy),
      });
    }
  }

  return results;
}
