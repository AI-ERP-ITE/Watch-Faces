// T016: Run pipeline with the failing design (ZPK 60 — all-arc collapse)
// Verify the representation corrector fixes it: not all arcs, mixed widget types

import { describe, it, expect } from 'vitest';
import type { AIElement } from '@/types/pipeline';
import { correctRepresentation } from '../representationCorrector';
import { normalize } from '../normalizer';

// This is what the AI produced for ZPK 60 — everything collapsed to arc/center
const ZPK60_AI_OUTPUT: AIElement[] = [
  { id: 'time_digital', type: 'time', representation: 'arc', layout: 'arc', group: 'center', confidence: 0.95 },
  { id: 'date_day', type: 'date', representation: 'arc', layout: 'arc', group: 'center', confidence: 0.9 },
  { id: 'weekday', type: 'weekday', representation: 'arc', layout: 'arc', group: 'center', confidence: 0.9 },
  { id: 'month', type: 'month', representation: 'arc', layout: 'arc', group: 'center', confidence: 0.9 },
  { id: 'steps_arc', type: 'steps', representation: 'arc', layout: 'arc', group: 'center', importance: 'secondary', confidence: 0.85 },
  { id: 'battery_arc', type: 'battery', representation: 'arc', layout: 'arc', group: 'center', importance: 'secondary', confidence: 0.8 },
  { id: 'heart_arc', type: 'heart_rate', representation: 'arc', layout: 'arc', group: 'center', importance: 'secondary', confidence: 0.8 },
  { id: 'weather', type: 'weather', representation: 'arc', layout: 'arc', group: 'center', confidence: 0.75 },
  { id: 'spo2_arc', type: 'spo2', representation: 'arc', layout: 'arc', group: 'center', importance: 'secondary', confidence: 0.7 },
  { id: 'calories_arc', type: 'calories', representation: 'arc', layout: 'arc', group: 'center', importance: 'secondary', confidence: 0.7 },
];

describe('T016: Failing design (ZPK 60 all-arc collapse) → corrector fixes it', () => {
  it('before correction: all arcs', () => {
    const arcCount = ZPK60_AI_OUTPUT.filter(e => e.representation === 'arc').length;
    expect(arcCount).toBe(10); // everything collapsed
  });

  it('after correction: NOT all arcs', () => {
    const corrected = correctRepresentation(ZPK60_AI_OUTPUT);
    const arcCount = corrected.filter(e => e.representation === 'arc').length;
    expect(arcCount).toBeLessThanOrEqual(2); // max 2 arcs enforced
  });

  it('after correction: groups redistributed (not all center)', () => {
    const corrected = correctRepresentation(ZPK60_AI_OUTPUT);
    const groups = new Set(corrected.map(e => e.group));
    expect(groups.size).toBeGreaterThan(1); // not all center anymore
  });

  it('after correction: data types get text/text+icon representation', () => {
    const corrected = correctRepresentation(ZPK60_AI_OUTPUT);
    const steps = corrected.find(e => e.type === 'steps');
    const battery = corrected.find(e => e.type === 'battery');
    const heart = corrected.find(e => e.type === 'heart_rate');
    const spo2 = corrected.find(e => e.type === 'spo2');
    const calories = corrected.find(e => e.type === 'calories');

    expect(steps!.representation).toBe('text+icon');
    expect(battery!.representation).toBe('text+icon');
    expect(heart!.representation).toBe('text+icon');
    expect(spo2!.representation).toBe('text');
    expect(calories!.representation).toBe('text');
  });

  it('after correction + normalize: mixed widget types', () => {
    const corrected = correctRepresentation(ZPK60_AI_OUTPUT);
    const normalized = normalize(corrected);
    const widgetTypes = new Set(normalized.map(e => e.widget));

    expect(widgetTypes.size).toBeGreaterThanOrEqual(2); // SC-003
    expect(widgetTypes.has('ARC_PROGRESS')).toBe(false); // no arcs left after type overrides
    expect(widgetTypes.has('TEXT_IMG')).toBe(true);
  });

  it('corrector does not mutate input', () => {
    const copy = ZPK60_AI_OUTPUT.map(e => ({ ...e }));
    correctRepresentation(ZPK60_AI_OUTPUT);
    expect(ZPK60_AI_OUTPUT).toEqual(copy);
  });
});
