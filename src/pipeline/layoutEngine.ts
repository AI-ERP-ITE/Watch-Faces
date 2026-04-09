// Layout Engine — Group + Layout Mode based positioning.
// Positions elements by group zone and layout mode.
// Arc elements center-lock at screen center. Row elements stack vertically in their zone.
// Standalone elements center within their zone.

import type { NormalizedElement, LayoutElement, Group } from '@/types/pipeline';
import { SCREEN, GROUP_ZONES } from './constants';

const { CX, CY } = SCREEN;

// Row layout: vertical stack spacing (TEXT_IMG digit height 44 + 4px gap)
const ROW_HEIGHT = 48;
const ROW_PADDING = 8;

// ─── Layout Engine ──────────────────────────────────────────────────────────────

export function applyLayout(elements: NormalizedElement[]): LayoutElement[] {
  const results: LayoutElement[] = [];

  // Group elements by their group field
  const byGroup: Partial<Record<Group, NormalizedElement[]>> = {};
  for (const el of elements) {
    (byGroup[el.group] ??= []).push(el);
  }

  for (const [group, els] of Object.entries(byGroup) as [Group, NormalizedElement[]][]) {
    const zone = GROUP_ZONES[group] ?? GROUP_ZONES.center;

    // Separate by layout mode within each group
    const arcEls: NormalizedElement[] = [];
    const rowEls: NormalizedElement[] = [];
    const standaloneEls: NormalizedElement[] = [];
    const gridEls: NormalizedElement[] = [];

    for (const el of els) {
      switch (el.layout) {
        case 'arc':        arcEls.push(el); break;
        case 'row':        rowEls.push(el); break;
        case 'standalone': standaloneEls.push(el); break;
        case 'grid':       gridEls.push(el); break;
        default:           standaloneEls.push(el); break;
      }
    }

    // Arc: center-lock at screen center (240, 240)
    for (const el of arcEls) {
      results.push({ ...el, centerX: CX, centerY: CY });
    }

    // Row: vertical stack within zone
    const zoneCenterX = Math.round(zone.x + zone.w / 2);
    for (let i = 0; i < rowEls.length; i++) {
      results.push({
        ...rowEls[i],
        centerX: zoneCenterX,
        centerY: Math.round(zone.y + ROW_PADDING + i * ROW_HEIGHT + ROW_HEIGHT / 2),
      });
    }

    // Standalone: center within zone
    const standaloneZoneCX = Math.round(zone.x + zone.w / 2);
    const standaloneZoneCY = Math.round(zone.y + zone.h / 2);
    for (const el of standaloneEls) {
      results.push({ ...el, centerX: standaloneZoneCX, centerY: standaloneZoneCY });
    }

    // Grid: (future) — for now, treat as standalone
    const gridZoneCX = Math.round(zone.x + zone.w / 2);
    const gridZoneCY = Math.round(zone.y + zone.h / 2);
    for (const el of gridEls) {
      results.push({ ...el, centerX: gridZoneCX, centerY: gridZoneCY });
    }
  }

  return results;
}
