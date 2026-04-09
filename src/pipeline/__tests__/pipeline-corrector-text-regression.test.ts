// T019: Regression — text-only design remains text after correction

import { describe, it, expect } from 'vitest';
import type { AIElement } from '@/types/pipeline';
import { correctRepresentation } from '../representationCorrector';

const TEXT_ONLY_INPUT: AIElement[] = [
  { id: 'steps_text', type: 'steps', representation: 'text', layout: 'row', group: 'right_panel', importance: 'secondary', confidence: 0.9 },
  { id: 'battery_text', type: 'battery', representation: 'text', layout: 'row', group: 'right_panel', importance: 'secondary', confidence: 0.85 },
  { id: 'heart_text', type: 'heart_rate', representation: 'text', layout: 'row', group: 'right_panel', importance: 'secondary', confidence: 0.8 },
];

describe('T019: Text-only design remains text', () => {
  it('no arcs before or after correction', () => {
    const corrected = correctRepresentation(TEXT_ONLY_INPUT);
    const arcs = corrected.filter(e => e.representation === 'arc');
    expect(arcs).toHaveLength(0);
  });

  it('no corrections applied (no collapse detected)', () => {
    const corrected = correctRepresentation(TEXT_ONLY_INPUT);
    expect(corrected).toEqual(TEXT_ONLY_INPUT);
  });

  it('layout and group unchanged', () => {
    const corrected = correctRepresentation(TEXT_ONLY_INPUT);
    for (const el of corrected) {
      expect(el.layout).toBe('row');
      expect(el.group).toBe('right_panel');
    }
  });
});
