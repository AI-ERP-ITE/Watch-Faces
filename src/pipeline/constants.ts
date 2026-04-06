// Shared dimension constants — Single source of truth for asset sizes.
// Used by: assetImageGenerator, geometrySolver, layoutEngine, jsCodeGeneratorV2.
// When you change a digit size here, ALL pipeline stages pick up the change.

export const SCREEN = { W: 480, H: 480, CX: 240, CY: 240 } as const;

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

export const ARC_BASE_RADIUS = 200;
export const ARC_SPACING = 30;
export const ARC_LINE_WIDTH = 12;
export const ARC_START_ANGLE = 135;
export const ARC_END_ANGLE = 405;
