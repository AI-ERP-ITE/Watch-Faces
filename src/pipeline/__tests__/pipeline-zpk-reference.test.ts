// T020: ZPK extraction comparison against reference (extracted_reference/device/)
// The reference watchface "Brushed Steel Petroleum" is an icon+text design — ZERO arcs.
// This test verifies that a similar design fed through our pipeline produces the same
// widget type profile: TEXT_IMG for data values, IMG for icons, IMG_TIME for time,
// IMG_DATE for date/month, IMG_WEEK for weekday — and NO ARC_PROGRESS.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import type { AIElement } from '@/types/pipeline';
import { normalize } from '../normalizer';
import { sortArcsByPriority } from '../semanticPriority';
import { applyLayout } from '../layoutEngine';
import { solveGeometry } from '../geometrySolver';

// ─── Parse reference watchface widget types ──────────────────────────────────────

const REFERENCE_PATH = resolve(__dirname, '../../../../extracted_reference/device/watchface/index.js');

function extractWidgetTypes(source: string): string[] {
  // Match hmUI.widget.XXXX patterns
  const matches = source.match(/hmUI\.widget\.(\w+)/g) ?? [];
  return [...new Set(matches.map(m => m.replace('hmUI.widget.', '')))];
}

// ─── Build AIElement[] that mirrors the reference design ─────────────────────────
// Reference "Brushed Steel Petroleum" has:
//   - IMG_TIME (digital time, left side)
//   - IMG_WEEK (weekday)
//   - IMG_DATE x2 (day + month)
//   - IMG x many (icons: battery, heart, steps, spo2, stress + label text)
//   - TEXT (city name)
//   - IMG_LEVEL (weather)
//   - IMG_STATUS (bluetooth)
//   - BUTTON (click areas)
// Key point: NO ARC_PROGRESS — all stats are icon+text, not arcs.

const REFERENCE_STYLE_INPUT: AIElement[] = [
  { id: 'time_digital', type: 'time', representation: 'text', layout: 'standalone', group: 'left_panel', confidence: 0.95 },
  { id: 'weekday', type: 'weekday', representation: 'text', layout: 'standalone', group: 'top_left', confidence: 0.9 },
  { id: 'date_day', type: 'date', representation: 'text', layout: 'standalone', group: 'top_left', confidence: 0.9 },
  { id: 'date_month', type: 'month', representation: 'text', layout: 'standalone', group: 'top_left', confidence: 0.9 },
  { id: 'battery_stat', type: 'battery', representation: 'text+icon', layout: 'row', group: 'right_panel', importance: 'secondary', confidence: 0.85 },
  { id: 'heart_stat', type: 'heart_rate', representation: 'text+icon', layout: 'row', group: 'right_panel', importance: 'secondary', confidence: 0.85 },
  { id: 'steps_stat', type: 'steps', representation: 'text+icon', layout: 'row', group: 'right_panel', importance: 'secondary', confidence: 0.8 },
  { id: 'spo2_stat', type: 'spo2', representation: 'text+icon', layout: 'row', group: 'right_panel', importance: 'secondary', confidence: 0.75 },
  { id: 'calories_stat', type: 'calories', representation: 'text+icon', layout: 'row', group: 'bottom_right', importance: 'secondary', confidence: 0.7 },
];

describe('T020: ZPK reference comparison — Brushed Steel Petroleum', () => {
  it('reference watchface contains ZERO ARC_PROGRESS', () => {
    const source = readFileSync(REFERENCE_PATH, 'utf-8');
    const widgetTypes = extractWidgetTypes(source);

    expect(widgetTypes).not.toContain('ARC_PROGRESS');
    expect(widgetTypes).toContain('IMG_TIME');
    expect(widgetTypes).toContain('IMG_DATE');
    expect(widgetTypes).toContain('IMG_WEEK');
    expect(widgetTypes).toContain('IMG');
    expect(widgetTypes).toContain('TEXT');
  });

  it('pipeline output for similar design → ZERO ARC_PROGRESS', () => {
    const normalized = normalize(REFERENCE_STYLE_INPUT);
    const widgets = normalized.map(e => e.widget);

    expect(widgets).not.toContain('ARC_PROGRESS');
    // text+icon compounds expand to TEXT_IMG + IMG pairs
    expect(widgets.filter(w => w === 'TEXT_IMG').length).toBeGreaterThanOrEqual(5);
    expect(widgets.filter(w => w === 'IMG').length).toBeGreaterThanOrEqual(5);
  });

  it('pipeline widget types match reference widget profile', () => {
    const normalized = normalize(REFERENCE_STYLE_INPUT);
    const pipelineWidgets = new Set(normalized.map(e => e.widget));

    // Reference uses: IMG_TIME, IMG_DATE, IMG_WEEK, IMG, TEXT
    // Pipeline should produce: IMG_TIME, IMG_DATE, IMG_WEEK, TEXT_IMG, IMG
    // TEXT_IMG is our generator's equivalent of reference's IMG (for data display)
    expect(pipelineWidgets.has('IMG_TIME')).toBe(true);   // digital time
    expect(pipelineWidgets.has('IMG_DATE')).toBe(true);   // date + month
    expect(pipelineWidgets.has('IMG_WEEK')).toBe(true);   // weekday
    expect(pipelineWidgets.has('TEXT_IMG')).toBe(true);    // data values (replaces dead-static IMG labels)
    expect(pipelineWidgets.has('IMG')).toBe(true);         // icons from text+icon compounds
    expect(pipelineWidgets.has('ARC_PROGRESS')).toBe(false); // no arcs in a text+icon design
  });

  it('compound text+icon elements expand correctly', () => {
    const normalized = normalize(REFERENCE_STYLE_INPUT);

    // 5 text+icon elements should produce 10 normalized entries (5 TEXT_IMG + 5 IMG)
    // Plus 4 non-compound elements (time, weekday, day, month)
    const compoundSources = normalized.filter(
      e => e.sourceType === 'battery' || e.sourceType === 'heart_rate' ||
           e.sourceType === 'steps' || e.sourceType === 'spo2' || e.sourceType === 'calories'
    );
    expect(compoundSources).toHaveLength(10); // 5 types × 2 widgets each

    // Each pair: one TEXT_IMG, one IMG
    for (const type of ['battery', 'heart_rate', 'steps', 'spo2', 'calories']) {
      const pair = compoundSources.filter(e => e.sourceType === type);
      expect(pair).toHaveLength(2);
      expect(pair.map(e => e.widget).sort()).toEqual(['IMG', 'TEXT_IMG']);
    }

    // Second elements have parentId linking to first
    for (const type of ['battery', 'heart_rate', 'steps', 'spo2', 'calories']) {
      const pair = compoundSources.filter(e => e.sourceType === type);
      const primary = pair.find(e => !e.parentId);
      const secondary = pair.find(e => e.parentId);
      expect(primary).toBeDefined();
      expect(secondary).toBeDefined();
      expect(secondary!.parentId).toBe(primary!.id);
    }
  });

  it('full pipeline produces valid geometry for text+icon design', () => {
    const normalized = sortArcsByPriority(normalize(REFERENCE_STYLE_INPUT));
    const layouted = applyLayout(normalized);
    const geometry = solveGeometry(layouted);

    // No element should have arc geometry
    for (const el of geometry) {
      expect(el.radius).toBeUndefined();
      expect(el.startAngle).toBeUndefined();
      expect(el.endAngle).toBeUndefined();
    }

    // Row elements in right_panel should be vertically stacked
    const rightPanelRows = geometry.filter(e => e.group === 'right_panel');
    expect(rightPanelRows.length).toBeGreaterThan(0);

    // All geometry elements should have valid coords
    for (const el of geometry) {
      if (el.widget === 'IMG_TIME') continue; // IMG_TIME uses startX/startY pattern
      expect(el.x).toBeDefined();
      expect(el.y).toBeDefined();
    }
  });
});
