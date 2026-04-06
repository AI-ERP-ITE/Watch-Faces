// Normalizer — Maps AI semantic types to concrete Zepp OS widget types.
// Pure mapping. No spatial logic. No AI calls.

import type { AIElement, AIElementType, NormalizedElement, ZeppWidget } from '@/types/pipeline';

// ─── Type → Widget Mapping ──────────────────────────────────────────────────────

const TYPE_TO_WIDGET: Record<AIElementType, ZeppWidget> = {
  time:       'TIME_POINTER',   // default; overridden to IMG_TIME for digital style
  date:       'IMG_DATE',
  weekday:    'IMG_WEEK',
  month:      'IMG_DATE',       // uses month sub-fields of IMG_DATE
  steps:      'ARC_PROGRESS',
  battery:    'ARC_PROGRESS',
  heart_rate: 'ARC_PROGRESS',
  spo2:       'ARC_PROGRESS',
  calories:   'ARC_PROGRESS',
  distance:   'TEXT_IMG',
  weather:    'IMG_LEVEL',
  arc:        'ARC_PROGRESS',
  text:       'TEXT',
};

// ─── Type → Data-binding Type ───────────────────────────────────────────────────

const TYPE_TO_DATA_TYPE: Partial<Record<AIElementType, string>> = {
  steps:      'STEP',
  battery:    'BATTERY',
  heart_rate: 'HEART',
  spo2:       'SPO2',
  calories:   'CAL',
  distance:   'DISTANCE',
  weather:    'WEATHER_CURRENT',
};

// ─── Normalizer ─────────────────────────────────────────────────────────────────

export function normalize(elements: AIElement[]): NormalizedElement[] {
  return elements.map((el) => {
    let widget = TYPE_TO_WIDGET[el.type];

    // Style override: digital time → IMG_TIME instead of TIME_POINTER
    if (el.type === 'time' && el.style === 'digital') {
      widget = 'IMG_TIME';
    }

    const normalized: NormalizedElement = {
      id: el.id,
      widget,
      region: el.region,
      sourceType: el.type,
    };

    const dataType = TYPE_TO_DATA_TYPE[el.type];
    if (dataType) {
      normalized.dataType = dataType;
    }

    return normalized;
  });
}
