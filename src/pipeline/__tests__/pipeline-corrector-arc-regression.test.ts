// T018: Regression — arc-only design remains arc after correction
// A legitimate 2-arc design should NOT be overcorrected

import { describe, it, expect } from 'vitest';
import type { AIElement } from '@/types/pipeline';
import { correctRepresentation } from '../representationCorrector';

const ARC_ONLY_INPUT: AIElement[] = [
  { id: 'battery_arc', type: 'battery', representation: 'arc', layout: 'arc', group: 'center', importance: 'primary', confidence: 0.95 },
  { id: 'steps_arc', type: 'steps', representation: 'arc', layout: 'arc', group: 'center', importance: 'primary', confidence: 0.9 },
];

describe('T018: Arc-only design (2 arcs) remains arc', () => {
  it('2 arcs stay as arcs (within MAX_ARCS limit)', () => {
    const corrected = correctRepresentation(ARC_ONLY_INPUT);
    const arcs = corrected.filter(e => e.representation === 'arc');
    expect(arcs).toHaveLength(2);
  });

  it('layout stays arc for both', () => {
    const corrected = correctRepresentation(ARC_ONLY_INPUT);
    for (const el of corrected) {
      expect(el.layout).toBe('arc');
    }
  });

  it('group stays center for both', () => {
    const corrected = correctRepresentation(ARC_ONLY_INPUT);
    for (const el of corrected) {
      expect(el.group).toBe('center');
    }
  });

  it('no corrections applied (design is legitimate)', () => {
    const corrected = correctRepresentation(ARC_ONLY_INPUT);
    expect(corrected).toEqual(ARC_ONLY_INPUT);
  });
});
