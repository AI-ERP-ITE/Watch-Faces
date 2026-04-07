// Normalizer — Code-only fallback for mapping AI types to Zepp widgets.
// Used when Stage B AI call is unavailable or fails.
// IMPORTANT: Never drop element types. All types get mapped to a widget.

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
  arc:        'ARC_PROGRESS',   // generic arc → ARC_PROGRESS, dataType assigned below
  text:       'TEXT',           // generic text → TEXT widget
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

// Fallback priority for assigning dataType to generic "arc" elements
const ARC_FALLBACK_PRIORITY = ['BATTERY', 'STEP', 'HEART', 'SPO2', 'CAL'];

// ─── Normalizer (Code-Only Fallback) ────────────────────────────────────────────

export function normalize(elements: AIElement[]): NormalizedElement[] {
  // Track which dataTypes are already assigned to avoid duplicates
  const usedDataTypes = new Set<string>();

  // First pass: collect explicitly assigned data types
  for (const el of elements) {
    const dt = TYPE_TO_DATA_TYPE[el.type];
    if (dt) usedDataTypes.add(dt);
  }

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

    // Explicit data type from known types
    const dataType = TYPE_TO_DATA_TYPE[el.type];
    if (dataType) {
      normalized.dataType = dataType;
    }
    // For generic "arc" type: assign next available metric from fallback priority
    else if (el.type === 'arc') {
      const fallback = ARC_FALLBACK_PRIORITY.find(dt => !usedDataTypes.has(dt));
      if (fallback) {
        normalized.dataType = fallback;
        usedDataTypes.add(fallback);
      }
    }

    return normalized;
  });
}
