// T016: Arc-only regression test
// Verify: all-arc input → all ARC_PROGRESS widgets, correct geometry

import { describe, it, expect } from 'vitest';
import type { AIElement } from '@/types/pipeline';
import { normalize } from '../normalizer';
import { sortArcsByPriority } from '../semanticPriority';
import { applyLayout } from '../layoutEngine';
import { solveGeometry } from '../geometrySolver';
import { validateNormalized, validateLayout, validateGeometry } from '../validators';

const ARC_ONLY_INPUT: AIElement[] = [
  { id: 'battery_arc', type: 'battery', representation: 'arc', layout: 'arc', group: 'center', importance: 'secondary', confidence: 0.9 },
  { id: 'steps_arc', type: 'steps', representation: 'arc', layout: 'arc', group: 'center', importance: 'secondary', confidence: 0.85 },
  { id: 'heart_arc', type: 'heart_rate', representation: 'arc', layout: 'arc', group: 'center', importance: 'secondary', confidence: 0.8 },
  { id: 'spo2_arc', type: 'spo2', representation: 'arc', layout: 'arc', group: 'center', importance: 'secondary', confidence: 0.75 },
];

describe('T016: Arc-only design regression', () => {
  it('normalize → all ARC_PROGRESS', () => {
    const normalized = normalize(ARC_ONLY_INPUT);

    expect(normalized).toHaveLength(4);
    for (const el of normalized) {
      expect(el.widget).toBe('ARC_PROGRESS');
      expect(el.group).toBe('center');
      expect(el.layout).toBe('arc');
    }

    // All dataTypes assigned
    const dataTypes = normalized.map(e => e.dataType);
    expect(dataTypes).toContain('BATTERY');
    expect(dataTypes).toContain('STEP');
    expect(dataTypes).toContain('HEART');
    expect(dataTypes).toContain('SPO2');
  });

  it('validation passes', () => {
    const normalized = normalize(ARC_ONLY_INPUT);
    expect(() => validateNormalized(normalized)).not.toThrow();
  });

  it('layout → all center-locked at 240,240', () => {
    const normalized = sortArcsByPriority(normalize(ARC_ONLY_INPUT));
    const layouted = applyLayout(normalized);

    expect(() => validateLayout(layouted)).not.toThrow();

    for (const el of layouted) {
      expect(el.centerX).toBe(240);
      expect(el.centerY).toBe(240);
    }
  });

  it('geometry → concentric arcs with decreasing radius', () => {
    const normalized = sortArcsByPriority(normalize(ARC_ONLY_INPUT));
    const layouted = applyLayout(normalized);
    const geometry = solveGeometry(layouted);

    expect(() => validateGeometry(geometry)).not.toThrow();

    // All arcs should have radius, startAngle, endAngle, lineWidth
    for (const el of geometry) {
      expect(el.radius).toBeGreaterThan(0);
      expect(el.startAngle).toBeDefined();
      expect(el.endAngle).toBeDefined();
      expect(el.lineWidth).toBeGreaterThan(0);
    }

    // Radii should decrease (concentric stacking)
    const radii = geometry.map(e => e.radius!);
    for (let i = 1; i < radii.length; i++) {
      expect(radii[i]).toBeLessThan(radii[i - 1]);
    }
  });
});
