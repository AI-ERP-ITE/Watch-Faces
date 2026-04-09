// T018: Mixed design test
// Verify: 2 arcs + 3 text rows → exactly 2 ARC_PROGRESS + 3 TEXT_IMG

import { describe, it, expect } from 'vitest';
import type { AIElement } from '@/types/pipeline';
import { normalize } from '../normalizer';
import { sortArcsByPriority } from '../semanticPriority';
import { applyLayout } from '../layoutEngine';
import { solveGeometry } from '../geometrySolver';
import { validateNormalized, validateLayout, validateGeometry } from '../validators';

const MIXED_INPUT: AIElement[] = [
  // 2 arc elements — center group
  { id: 'battery_arc', type: 'battery', representation: 'arc', layout: 'arc', group: 'center', importance: 'primary', confidence: 0.95 },
  { id: 'steps_arc', type: 'steps', representation: 'arc', layout: 'arc', group: 'center', importance: 'secondary', confidence: 0.9 },
  // 3 text elements — right_panel group
  { id: 'heart_text', type: 'heart_rate', representation: 'text', layout: 'row', group: 'right_panel', importance: 'secondary', confidence: 0.85 },
  { id: 'spo2_text', type: 'spo2', representation: 'text', layout: 'row', group: 'right_panel', importance: 'secondary', confidence: 0.8 },
  { id: 'calories_text', type: 'calories', representation: 'text', layout: 'row', group: 'right_panel', importance: 'secondary', confidence: 0.75 },
];

describe('T018: Mixed design — 2 arcs + 3 text rows', () => {
  it('normalize → exactly 2 ARC_PROGRESS + 3 TEXT_IMG', () => {
    const normalized = normalize(MIXED_INPUT);

    expect(normalized).toHaveLength(5);

    const arcs = normalized.filter(e => e.widget === 'ARC_PROGRESS');
    const texts = normalized.filter(e => e.widget === 'TEXT_IMG');

    expect(arcs).toHaveLength(2);
    expect(texts).toHaveLength(3);

    // Arc elements in center group
    for (const el of arcs) {
      expect(el.group).toBe('center');
      expect(el.layout).toBe('arc');
    }

    // Text elements in right_panel group
    for (const el of texts) {
      expect(el.group).toBe('right_panel');
      expect(el.layout).toBe('row');
    }
  });

  it('dataTypes correctly assigned across both widget types', () => {
    const normalized = normalize(MIXED_INPUT);
    const dataTypes = normalized.map(e => e.dataType);

    expect(dataTypes).toContain('BATTERY');
    expect(dataTypes).toContain('STEP');
    expect(dataTypes).toContain('HEART');
    expect(dataTypes).toContain('SPO2');
    expect(dataTypes).toContain('CAL');
  });

  it('validation passes', () => {
    const normalized = normalize(MIXED_INPUT);
    expect(() => validateNormalized(normalized)).not.toThrow();
  });

  it('layout → arcs center-locked, texts row-stacked', () => {
    const normalized = sortArcsByPriority(normalize(MIXED_INPUT));
    const layouted = applyLayout(normalized);

    expect(() => validateLayout(layouted)).not.toThrow();

    const arcs = layouted.filter(e => e.widget === 'ARC_PROGRESS');
    const texts = layouted.filter(e => e.widget === 'TEXT_IMG');

    // Arcs center-locked at (240, 240)
    for (const el of arcs) {
      expect(el.centerX).toBe(240);
      expect(el.centerY).toBe(240);
    }

    // Texts NOT at screen center, stacked vertically
    const textYs = texts.map(e => e.centerY);
    for (let i = 1; i < textYs.length; i++) {
      expect(textYs[i]).toBeGreaterThan(textYs[i - 1]);
    }
    for (const el of texts) {
      expect(el.centerX).not.toBe(240);
    }
  });

  it('geometry → arcs get radius/angles, texts get bbox', () => {
    const normalized = sortArcsByPriority(normalize(MIXED_INPUT));
    const layouted = applyLayout(normalized);
    const geometry = solveGeometry(layouted);

    expect(() => validateGeometry(geometry)).not.toThrow();

    const arcs = geometry.filter(e => e.widget === 'ARC_PROGRESS');
    const texts = geometry.filter(e => e.widget === 'TEXT_IMG');

    // Arcs have arc-specific properties
    for (const el of arcs) {
      expect(el.radius).toBeGreaterThan(0);
      expect(el.startAngle).toBeDefined();
      expect(el.endAngle).toBeDefined();
      expect(el.lineWidth).toBeGreaterThan(0);
    }

    // Texts have rectangular bbox, NO arc properties
    for (const el of texts) {
      expect(el.x).toBeDefined();
      expect(el.y).toBeDefined();
      expect(el.w).toBeGreaterThan(0);
      expect(el.h).toBeGreaterThan(0);
      expect(el.radius).toBeUndefined();
      expect(el.startAngle).toBeUndefined();
      expect(el.endAngle).toBeUndefined();
      expect(el.lineWidth).toBeUndefined();
    }
  });
});
