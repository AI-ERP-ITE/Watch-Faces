// Layout Engine — PASS-THROUGH.
// In the geometry-preserving pipeline, all positions come from AI extraction.
// This module is retained as a no-op for backward compatibility.
// The constraint solver (geometrySolver.ts) handles all spatial intelligence.

import type { NormalizedElement } from '@/types/pipeline';

// ─── Layout Engine (No-Op) ──────────────────────────────────────────────────────
// All spatial data is already encoded in normalized coordinates.
// No region-based placement. No spreading logic. Pass through unchanged.

export function applyLayout(elements: NormalizedElement[]): NormalizedElement[] {
  return elements;
}
