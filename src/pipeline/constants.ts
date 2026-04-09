// Shared dimension constants — Single source of truth for asset sizes.
// Used by: assetImageGenerator, geometrySolver, layoutEngine, jsCodeGeneratorV2.
// When you change a digit size here, ALL pipeline stages pick up the change.

import type { Group } from '@/types/pipeline';

export const SCREEN = { W: 480, H: 480, CX: 240, CY: 240 } as const;

// ─── Group Zones (replaces REGION_POSITIONS in layoutEngine) ────────────────────
// Each group maps to a bounding rectangle on the 480×480 screen.
// Layout modes position elements within these zones.

export const GROUP_ZONES: Record<Group, { x: number; y: number; w: number; h: number }> = {
  center:       { x: 140, y: 140, w: 200, h: 200 },
  top:          { x: 140, y: 20,  w: 200, h: 120 },
  bottom:       { x: 140, y: 340, w: 200, h: 120 },
  left_panel:   { x: 20,  y: 100, w: 200, h: 280 },
  right_panel:  { x: 260, y: 100, w: 200, h: 280 },
  top_left:     { x: 20,  y: 20,  w: 200, h: 200 },
  top_right:    { x: 260, y: 20,  w: 200, h: 200 },
  bottom_left:  { x: 20,  y: 260, w: 200, h: 200 },
  bottom_right: { x: 260, y: 260, w: 200, h: 200 },
} as const;

// ─── Asset Dimensions (matches what assetImageGenerator produces) ───────────────

export const TIME_DIGIT   = { w: 60, h: 90 } as const;   // time_digit_N.png
export const DATE_DIGIT   = { w: 36, h: 54 } as const;   // date_digit_N.png
export const MONTH_LABEL  = { w: 100, h: 36 } as const;  // month_N.png
export const WEEK_LABEL   = { w: 100, h: 36 } as const;  // week_N.png
export const WEATHER_ICON = { w: 60, h: 60 } as const;   // weather_N.png
export const TEXT_IMG_DIGIT = { w: 28, h: 44 } as const;  // *_digit_N.png

// ─── Derived: Content widths for multi-digit displays ──────────────────────────

/** Hours = 2 digits side-by-side */
export const HOUR_CONTENT_W = TIME_DIGIT.w * 2;           // 120px
/** Minutes = 2 digits side-by-side */
export const MINUTE_CONTENT_W = TIME_DIGIT.w * 2;         // 120px
/** Gap between hour and minute groups */
export const TIME_COLON_GAP = 10;
/** Total time display width: HH + gap + MM */
export const TIME_TOTAL_W = HOUR_CONTENT_W + TIME_COLON_GAP + MINUTE_CONTENT_W; // 250px

/** Day = 2 digits */
export const DAY_CONTENT_W = DATE_DIGIT.w * 2;            // 72px
/** Gap between day and month */
export const DATE_MONTH_GAP = 10;

// ─── Arc Configuration ─────────────────────────────────────────────────────────

export const ARC_BASE_RADIUS = 180;
export const ARC_SPACING = 25;
export const ARC_LINE_WIDTH = 12;       // base thickness for priority 0
export const ARC_LINE_WIDTH_STEP = 2;   // thickness decreases per priority level
export const ARC_START_ANGLE = 135;
export const ARC_MAX_SWEEP = 300;       // maximum sweep angle (data-driven)
