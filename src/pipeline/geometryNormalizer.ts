// Geometry Normalizer — Converts AI-extracted absolute pixel coordinates to [0, 1] normalized space.
// Single Source of Truth: all spatial values are divided by screen size.
// Angles stay in degrees (not spatial, no normalization needed).

import type { AIElement } from '@/types/pipeline';

export const SCREEN_SIZE = 480;

export interface NormalizedGeometry {
  id: string;
  type: string;
  shape: 'text' | 'arc' | 'icon' | 'number';
  style?: string;
  confidence?: number;
  text?: string;
  // Bbox normalized [0, 1]
  nx?: number;
  ny?: number;
  nw?: number;
  nh?: number;
  // Arc center normalized [0, 1]
  ncx?: number;
  ncy?: number;
  // Arc radius normalized [0, 1]
  nr?: number;
  // Arc thickness normalized [0, 1]
  nt?: number;
  // Angles in degrees (preserved as-is)
  startAngle?: number;
  endAngle?: number;
}

/**
 * Normalize all spatial AI output to [0, 1] space.
 * bbox, center, radius, thickness → divide by SCREEN_SIZE.
 * angles → kept as degrees.
 */
export function normalizeGeometry(elements: AIElement[]): NormalizedGeometry[] {
  return elements.map((el) => {
    const norm: NormalizedGeometry = {
      id: el.id,
      type: el.type,
      shape: el.shape,
      style: el.style,
      confidence: el.confidence,
      text: el.text,
    };

    // Bbox [x, y, w, h] → normalized
    if (el.bbox) {
      norm.nx = el.bbox[0] / SCREEN_SIZE;
      norm.ny = el.bbox[1] / SCREEN_SIZE;
      norm.nw = el.bbox[2] / SCREEN_SIZE;
      norm.nh = el.bbox[3] / SCREEN_SIZE;
    }

    // Arc center [cx, cy] → normalized
    if (el.center) {
      norm.ncx = el.center[0] / SCREEN_SIZE;
      norm.ncy = el.center[1] / SCREEN_SIZE;
    }

    // Radius → normalized
    if (el.radius !== undefined) {
      norm.nr = el.radius / SCREEN_SIZE;
    }

    // Thickness → normalized
    if (el.thickness !== undefined) {
      norm.nt = el.thickness / SCREEN_SIZE;
    }

    // Angles → degrees (no normalization)
    if (el.angles) {
      norm.startAngle = el.angles[0];
      norm.endAngle = el.angles[1];
    }

    return norm;
  });
}
