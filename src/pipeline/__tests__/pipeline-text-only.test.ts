// T017: Text-only design test
// Verify: all-text input → ZERO ARC_PROGRESS, all TEXT_IMG widgets, row layout geometry

import { describe, it, expect } from 'vitest';
import type { AIElement } from '@/types/pipeline';
import { normalize } from '../normalizer';
import { sortArcsByPriority } from '../semanticPriority';
import { applyLayout } from '../layoutEngine';
import { solveGeometry } from '../geometrySolver';
import { validateNormalized, validateLayout, validateGeometry } from '../validators';

const TEXT_ONLY_INPUT: AIElement[] = [
  { id: 'steps_text', type: 'steps', representation: 'text', layout: 'row', group: 'right_panel', importance: 'secondary', confidence: 0.9 },
  { id: 'battery_text', type: 'battery', representation: 'text', layout: 'row', group: 'right_panel', importance: 'secondary', confidence: 0.85 },
  { id: 'heart_text', type: 'heart_rate', representation: 'text', layout: 'row', group: 'right_panel', importance: 'secondary', confidence: 0.8 },
  { id: 'spo2_text', type: 'spo2', representation: 'text', layout: 'row', group: 'right_panel', importance: 'secondary', confidence: 0.75 },
  { id: 'calories_text', type: 'calories', representation: 'text', layout: 'row', group: 'right_panel', importance: 'secondary', confidence: 0.7 },
];

describe('T017: Text-only design — zero arcs', () => {
  it('normalize → all TEXT_IMG, zero ARC_PROGRESS', () => {
    const normalized = normalize(TEXT_ONLY_INPUT);

    expect(normalized).toHaveLength(5);
    for (const el of normalized) {
      expect(el.widget).toBe('TEXT_IMG');
      expect(el.widget).not.toBe('ARC_PROGRESS');
      expect(el.group).toBe('right_panel');
      expect(el.layout).toBe('row');
    }

    // Correct dataTypes assigned
    const dataTypes = normalized.map(e => e.dataType);
    expect(dataTypes).toContain('STEP');
    expect(dataTypes).toContain('BATTERY');
    expect(dataTypes).toContain('HEART');
    expect(dataTypes).toContain('SPO2');
    expect(dataTypes).toContain('CAL');
  });

  it('validation passes', () => {
    const normalized = normalize(TEXT_ONLY_INPUT);
    expect(() => validateNormalized(normalized)).not.toThrow();
  });

  it('layout → vertical row stack, NOT center-locked', () => {
    const normalized = sortArcsByPriority(normalize(TEXT_ONLY_INPUT));
    const layouted = applyLayout(normalized);

    expect(() => validateLayout(layouted)).not.toThrow();

    // Row elements should NOT be center-locked at (240, 240)
    // They should be stacked vertically in the right_panel zone
    const centerYValues = layouted.map(e => e.centerY);

    // Each subsequent element should be further down (increasing centerY)
    for (let i = 1; i < centerYValues.length; i++) {
      expect(centerYValues[i]).toBeGreaterThan(centerYValues[i - 1]);
    }

    // None should be at the screen center (240) — that's arc territory
    for (const el of layouted) {
      expect(el.centerX).not.toBe(240);
    }
  });

  it('geometry → bbox (x, y, w, h), NO arc properties', () => {
    const normalized = sortArcsByPriority(normalize(TEXT_ONLY_INPUT));
    const layouted = applyLayout(normalized);
    const geometry = solveGeometry(layouted);

    expect(() => validateGeometry(geometry)).not.toThrow();

    for (const el of geometry) {
      // Must have rectangular bbox
      expect(el.x).toBeDefined();
      expect(el.y).toBeDefined();
      expect(el.w).toBeGreaterThan(0);
      expect(el.h).toBeGreaterThan(0);

      // Must NOT have arc-specific properties
      expect(el.radius).toBeUndefined();
      expect(el.startAngle).toBeUndefined();
      expect(el.endAngle).toBeUndefined();
      expect(el.lineWidth).toBeUndefined();
    }
  });
});
