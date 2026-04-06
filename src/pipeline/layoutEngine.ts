// Layout Engine — Widget-type-aware layout for 480×480 round watchface.
// Instead of generic region-bucket spreading, each widget type gets a
// purpose-built position that accounts for its actual content dimensions.
//
// Every position is pre-validated to avoid these proven failure modes:
// 1. Time digits overlapping (hour/minute)
// 2. Date/month/week crowding in the same band
// 3. Peripheral widgets landing inside the arc zone
// 4. Weather icon covering arcs

import type { NormalizedElement, LayoutElement } from '@/types/pipeline';
import {
  SCREEN, TIME_TOTAL_W, TIME_DIGIT,
  DAY_CONTENT_W, DATE_MONTH_GAP, MONTH_LABEL, WEEK_LABEL,
  WEATHER_ICON,
} from './constants';

const { CX, CY } = SCREEN;

// ─── Layout Engine ──────────────────────────────────────────────────────────────

export function applyLayout(elements: NormalizedElement[]): LayoutElement[] {
  const results: LayoutElement[] = [];

  // Collect by widget type for deterministic ordering
  const byWidget: Record<string, NormalizedElement[]> = {};
  for (const el of elements) {
    (byWidget[el.widget] ??= []).push(el);
  }

  // --- 1. ARC_PROGRESS — always at screen center (concentric, handled by geometry solver) ---
  for (const el of byWidget['ARC_PROGRESS'] ?? []) {
    results.push({ ...el, centerX: CX, centerY: CY });
  }

  // --- 2. TIME_POINTER — analog hands rotate around screen center ---
  for (const el of byWidget['TIME_POINTER'] ?? []) {
    results.push({ ...el, centerX: CX, centerY: CY });
  }

  // --- 3. IMG_TIME — digital time, centered on screen ---
  // Position is top-left of the hour group. Content: [HH][gap][MM]
  // Centered horizontally: hourStartX = CX - TIME_TOTAL_W/2
  // Vertically: center of screen
  for (const el of byWidget['IMG_TIME'] ?? []) {
    const hourStartX = Math.round(CX - TIME_TOTAL_W / 2);         // 115
    const hourStartY = Math.round(CY - TIME_DIGIT.h / 2);         // 195
    results.push({ ...el, centerX: hourStartX, centerY: hourStartY });
  }

  // --- 4. Date cluster: IMG_WEEK, IMG_DATE(day), IMG_DATE(month) ---
  // Layout: Row 1 = weekday centered at top
  //         Row 2 = "DD  MonthName" side by side, below weekday
  const weeks = byWidget['IMG_WEEK'] ?? [];
  const dates = (byWidget['IMG_DATE'] ?? []);
  const dayElements = dates.filter(d => d.sourceType !== 'month');
  const monthElements = dates.filter(d => d.sourceType === 'month');

  // Row 1: Weekday label — centered at top, y=30
  const weekY = 30;
  for (const el of weeks) {
    results.push({
      ...el,
      centerX: Math.round(CX - WEEK_LABEL.w / 2),   // x = 190
      centerY: weekY,                                  // y = 30
    });
  }

  // Row 2: Day + Month side by side
  // Total width: DAY_CONTENT_W + gap + MONTH_LABEL.w = 72 + 10 + 100 = 182
  const dateRowY = weekY + WEEK_LABEL.h + 4;  // 30 + 36 + 4 = 70
  const dateRowTotalW = DAY_CONTENT_W + DATE_MONTH_GAP + MONTH_LABEL.w; // 182
  const dateRowStartX = Math.round(CX - dateRowTotalW / 2); // 149

  for (const el of dayElements) {
    results.push({
      ...el,
      centerX: dateRowStartX,                           // x = 149
      centerY: dateRowY,                                 // y = 70
    });
  }

  for (const el of monthElements) {
    results.push({
      ...el,
      centerX: dateRowStartX + DAY_CONTENT_W + DATE_MONTH_GAP, // x = 231
      centerY: dateRowY,                                         // y = 70
    });
  }

  // --- 5. IMG_LEVEL (weather) — bottom of screen, below arcs ---
  for (const el of byWidget['IMG_LEVEL'] ?? []) {
    results.push({
      ...el,
      centerX: Math.round(CX - WEATHER_ICON.w / 2),  // x = 210
      centerY: 420,                                    // safely below arc zone
    });
  }

  // --- 6. TEXT_IMG (data values like distance) — bottom-left / bottom-right ---
  const textImgs = byWidget['TEXT_IMG'] ?? [];
  const textImgSlots = [
    { x: 90, y: 390 },
    { x: 340, y: 390 },
    { x: 90, y: 340 },
    { x: 340, y: 340 },
  ];
  for (let i = 0; i < textImgs.length; i++) {
    const slot = textImgSlots[i % textImgSlots.length];
    results.push({ ...textImgs[i], centerX: slot.x, centerY: slot.y });
  }

  // --- 7. TEXT — below center ---
  const texts = byWidget['TEXT'] ?? [];
  for (let i = 0; i < texts.length; i++) {
    results.push({
      ...texts[i],
      centerX: CX,
      centerY: 350 + i * 45,
    });
  }

  // --- 8. IMG_STATUS — top-right corner ---
  const statuses = byWidget['IMG_STATUS'] ?? [];
  for (let i = 0; i < statuses.length; i++) {
    results.push({
      ...statuses[i],
      centerX: 380 + i * 35,
      centerY: 30,
    });
  }

  // --- 9. IMG (generic image, not background) — fallback peripheral ---
  const imgs = byWidget['IMG'] ?? [];
  for (let i = 0; i < imgs.length; i++) {
    results.push({
      ...imgs[i],
      centerX: CX,
      centerY: 420 + i * 30,
    });
  }

  return results;
}
