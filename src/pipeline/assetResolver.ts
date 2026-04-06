// Asset Resolver — Maps widget types to predefined asset paths.
// NO dynamic icon generation. Uses fixed, known assets.

import type { GeometryElement, ResolvedElement, ResolvedAssets, ZeppWidget } from '@/types/pipeline';

// ─── Data-type → digit prefix mapping ───────────────────────────────────────────

const DATA_TYPE_DIGIT_PREFIX: Record<string, string> = {
  BATTERY:  'batt_digit',
  STEP:     'step_digit',
  HEART:    'heart_digit',
  SPO2:     'spo2_digit',
  CAL:      'cal_digit',
  DISTANCE: 'dist_digit',
};

// ─── Asset Resolver ─────────────────────────────────────────────────────────────

export function resolveAssets(elements: GeometryElement[]): ResolvedElement[] {
  return elements.map((el) => {
    const assets = resolveForWidget(el.widget, el.dataType, el.sourceType);
    return { ...el, assets };
  });
}

function resolveForWidget(
  widget: ZeppWidget,
  dataType?: string,
  sourceType?: string,
): ResolvedAssets {
  switch (widget) {
    case 'TIME_POINTER':
      return {
        hourHandSrc:   'hour_hand.png',
        minuteHandSrc: 'minute_hand.png',
        secondHandSrc: 'second_hand.png',
        coverSrc:      'hand_cover.png',
      };

    case 'IMG_TIME':
      return {
        fontArray: digitArray('time_digit'),
      };

    case 'IMG_DATE':
      if (sourceType === 'month') {
        return {
          monthArray: monthArray(),
        };
      }
      return {
        fontArray: digitArray('date_digit'),
      };

    case 'IMG_WEEK':
      return {
        weekArray: weekArray(),
      };

    case 'ARC_PROGRESS':
      return {}; // ARC_PROGRESS uses color, no image assets needed

    case 'TEXT_IMG': {
      const prefix = dataType ? DATA_TYPE_DIGIT_PREFIX[dataType] || 'digit' : 'digit';
      return {
        fontArray: digitArray(prefix),
      };
    }

    case 'IMG_LEVEL':
      if (sourceType === 'weather') {
        return {
          imageArray: weatherArray(),
        };
      }
      return {};

    case 'IMG_STATUS':
      return {
        src: 'bluetooth_5_b_30x30.png',
      };

    case 'IMG':
      return {};

    case 'TEXT':
      return {};

    default:
      return {};
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function digitArray(prefix: string): string[] {
  return Array.from({ length: 10 }, (_, i) => `${prefix}_${i}.png`);
}

function weekArray(): string[] {
  return Array.from({ length: 7 }, (_, i) => `week_${i}.png`);
}

function monthArray(): string[] {
  return Array.from({ length: 12 }, (_, i) => `month_${i}.png`);
}

function weatherArray(): string[] {
  return Array.from({ length: 29 }, (_, i) => `weather_${i}.png`);
}
