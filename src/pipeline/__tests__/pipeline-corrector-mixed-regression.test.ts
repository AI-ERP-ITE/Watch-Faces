// T020: Regression — mixed design produces mixed widgets after correction

import { describe, it, expect } from 'vitest';
import type { AIElement } from '@/types/pipeline';
import { correctRepresentation } from '../representationCorrector';
import { normalize } from '../normalizer';

// Mixed design: 2 arcs + 3 text rows — already correct, should pass through
const MIXED_CORRECT_INPUT: AIElement[] = [
  { id: 'battery_arc', type: 'battery', representation: 'arc', layout: 'arc', group: 'center', importance: 'primary', confidence: 0.95 },
  { id: 'steps_arc', type: 'steps', representation: 'arc', layout: 'arc', group: 'center', importance: 'primary', confidence: 0.9 },
  { id: 'heart_text', type: 'heart_rate', representation: 'text', layout: 'row', group: 'right_panel', importance: 'secondary', confidence: 0.85 },
  { id: 'spo2_text', type: 'spo2', representation: 'text', layout: 'row', group: 'right_panel', importance: 'secondary', confidence: 0.8 },
  { id: 'calories_text', type: 'calories', representation: 'text', layout: 'row', group: 'right_panel', importance: 'secondary', confidence: 0.75 },
];

describe('T020: Mixed design produces mixed widgets', () => {
  it('no corrections applied (design is already mixed)', () => {
    const corrected = correctRepresentation(MIXED_CORRECT_INPUT);
    expect(corrected).toEqual(MIXED_CORRECT_INPUT);
  });

  it('after normalize: both ARC_PROGRESS and TEXT_IMG present', () => {
    const corrected = correctRepresentation(MIXED_CORRECT_INPUT);
    const normalized = normalize(corrected);
    const widgetTypes = new Set(normalized.map(e => e.widget));

    expect(widgetTypes.has('ARC_PROGRESS')).toBe(true);
    expect(widgetTypes.has('TEXT_IMG')).toBe(true);
  });

  it('exactly 2 ARC_PROGRESS + 3 TEXT_IMG', () => {
    const corrected = correctRepresentation(MIXED_CORRECT_INPUT);
    const normalized = normalize(corrected);

    const arcs = normalized.filter(e => e.widget === 'ARC_PROGRESS');
    const texts = normalized.filter(e => e.widget === 'TEXT_IMG');

    expect(arcs).toHaveLength(2);
    expect(texts).toHaveLength(3);
  });
});
