// AI Prompt Contract — Defines the exact prompt and expected schema for the AI vision model.
// The AI MUST extract geometry (bounding boxes, arc parameters) from the design image.

export const AI_SYSTEM_PROMPT = `You are a watchface design geometry extractor. You will receive an image of a smartwatch face design (480×480 pixels, round display).

Your job is to identify ALL visible UI elements AND extract their EXACT geometry from the image.

You must return ONLY a JSON object following the exact schema below. No extra text, no markdown.

STRICT RULES:
- MUST include bbox [x, y, width, height] for ALL text/number/icon elements
- MUST include center, radius, angles, thickness for ALL arc/ring elements
- MUST NOT include "region" fields (no "center", "top", "bottom", etc.)
- MUST NOT invent positions — extract them from what you SEE in the image
- ALL coordinates are in pixel space (0–480)
- bbox origin is top-left corner: [x, y, width, height]
- Angles are in degrees, 0 = 3 o'clock, clockwise

Schema:
{
  "elements": [
    {
      "id": "unique_string_id",
      "type": "time" | "date" | "steps" | "battery" | "heart_rate" | "spo2" | "calories" | "distance" | "weather" | "weekday" | "month" | "arc" | "text",
      "shape": "text" | "arc" | "icon" | "number",
      "bbox": [x, y, width, height],
      "center": [cx, cy],
      "radius": number,
      "angles": [startAngle, endAngle],
      "thickness": number,
      "text": "visible text content",
      "style": "analog" | "digital" | "minimal" | "bold",
      "confidence": 0.0 to 1.0
    }
  ]
}

ELEMENT RULES:

For text/number/icon elements (time digits, date, labels, icons):
- MUST include "bbox": [x, y, width, height] — the bounding rectangle in pixels
- "shape" should be "text", "number", or "icon"
- Include "text" if you can read the text content

For arc/ring elements (progress rings, circular indicators):
- MUST include "center": [cx, cy] — center of the arc in pixels
- MUST include "radius" — radius in pixels from center to arc midline
- MUST include "angles": [startAngle, endAngle] — the FULL arc range in degrees (including unfilled portion)
- MUST include "thickness" — stroke width in pixels
- "shape" must be "arc"

For analog clock hands:
- Return ONE element with type "time", shape "icon"
- "center" = rotation center of the hands
- "bbox" can approximate the hand reach area

Type definitions:
- "time": Clock display (analog hands or digital numbers)
- "date": Day-of-month number display
- "month": Month name or number
- "weekday": Day-of-week name
- "steps": Step counter / pedometer
- "battery": Battery level indicator
- "heart_rate": Heart rate monitor
- "spo2": Blood oxygen level
- "calories": Calorie counter
- "distance": Distance traveled
- "weather": Weather icon or temperature
- "arc": Any circular progress indicator (use specific type like steps/battery if identifiable)
- "text": Any other text label

Shape definitions:
- "text": Rendered text characters (digits, labels)
- "number": Numeric display (counts, percentages)
- "arc": Circular ring or progress arc
- "icon": Icon, image, or analog clock hands

EXAMPLES:

Example 1 — Digital time with progress arcs:
{
  "elements": [
    { "id": "time_main", "type": "time", "shape": "text", "bbox": [115, 195, 250, 90], "text": "10:09", "style": "digital", "confidence": 0.95 },
    { "id": "date_day", "type": "date", "shape": "number", "bbox": [200, 310, 80, 40], "text": "08", "confidence": 0.90 },
    { "id": "steps_ring", "type": "steps", "shape": "arc", "center": [240, 240], "radius": 200, "angles": [135, 405], "thickness": 10, "confidence": 0.88 },
    { "id": "battery_ring", "type": "battery", "shape": "arc", "center": [240, 240], "radius": 175, "angles": [135, 405], "thickness": 8, "confidence": 0.85 },
    { "id": "heart_ring", "type": "heart_rate", "shape": "arc", "center": [240, 240], "radius": 150, "angles": [135, 405], "thickness": 8, "confidence": 0.80 }
  ]
}

Example 2 — Analog watch with complications:
{
  "elements": [
    { "id": "time_analog", "type": "time", "shape": "icon", "center": [240, 240], "bbox": [120, 120, 240, 240], "style": "analog", "confidence": 0.95 },
    { "id": "date_display", "type": "date", "shape": "number", "bbox": [340, 220, 60, 40], "text": "15", "confidence": 0.90 },
    { "id": "weekday_display", "type": "weekday", "shape": "text", "bbox": [190, 120, 100, 30], "text": "TUE", "confidence": 0.85 },
    { "id": "battery_arc", "type": "battery", "shape": "arc", "center": [240, 240], "radius": 220, "angles": [180, 360], "thickness": 6, "confidence": 0.80 }
  ]
}
`;

export const AI_USER_PROMPT = `Analyze this watchface design image for Amazfit Balance 2 (480×480 round display).

Extract ALL visible UI elements with their EXACT geometry:
- For text/numbers/icons: provide bbox [x, y, width, height] in pixels
- For arcs/rings: provide center [cx, cy], radius, angles [start, end], and thickness in pixels

ALL positions must come from the image. Do not guess or invent positions.

Return ONLY the JSON object. No explanation, no markdown fences.`;

/**
 * JSON Schema for validating AI response before it enters the pipeline.
 * Used with Gemini's response_schema parameter for structured output.
 */
export const AI_RESPONSE_SCHEMA = {
  type: 'object' as const,
  properties: {
    elements: {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        properties: {
          id:         { type: 'string' as const },
          type:       { type: 'string' as const, enum: ['time', 'date', 'steps', 'battery', 'heart_rate', 'spo2', 'calories', 'distance', 'weather', 'weekday', 'month', 'arc', 'text'] },
          shape:      { type: 'string' as const, enum: ['text', 'arc', 'icon', 'number'] },
          bbox:       { type: 'array' as const, items: { type: 'number' as const } },
          center:     { type: 'array' as const, items: { type: 'number' as const } },
          radius:     { type: 'number' as const },
          angles:     { type: 'array' as const, items: { type: 'number' as const } },
          thickness:  { type: 'number' as const },
          text:       { type: 'string' as const },
          style:      { type: 'string' as const, enum: ['analog', 'digital', 'minimal', 'bold'] },
          confidence: { type: 'number' as const },
        },
        required: ['id', 'type', 'shape'],
      },
    },
  },
  required: ['elements'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// Stage B: AI Normalization — Maps fuzzy AI types → concrete Zepp OS widgets.
// Text-only call (no image). Uses cheaper model.
// ═══════════════════════════════════════════════════════════════════════════════

export const STAGE_B_SYSTEM_PROMPT = `You are a Zepp OS watchface element normalizer. You receive a JSON array of elements identified by a vision model and map each to a concrete Zepp OS widget with data bindings.

RULES:
- Map each element to the EXACT Zepp OS widget type
- Assign dataType for ALL data-bound widgets
- Preserve original id — do NOT change it
- DO NOT add coordinates, sizes, or geometry — those are handled separately
- Resolve ALL ambiguities: every "arc" MUST get a specific metric, every "text" MUST get a purpose

WIDGET MAPPING:
| AI type    | style   | widget        | dataType        |
|------------|---------|---------------|-----------------|
| time       | analog  | TIME_POINTER  | (none)          |
| time       | digital | IMG_TIME      | (none)          |
| date       | any     | IMG_DATE      | (none)          |
| month      | any     | IMG_DATE      | (none)          |
| weekday    | any     | IMG_WEEK      | (none)          |
| steps      | any     | ARC_PROGRESS  | STEP            |
| battery    | any     | ARC_PROGRESS  | BATTERY         |
| heart_rate | any     | ARC_PROGRESS  | HEART           |
| spo2       | any     | ARC_PROGRESS  | SPO2            |
| calories   | any     | ARC_PROGRESS  | CAL             |
| distance   | any     | TEXT_IMG      | DISTANCE        |
| weather    | any     | IMG_LEVEL     | WEATHER_CURRENT |

AMBIGUITY RESOLUTION for "arc" type:
- Look at ALL elements. Identify which metrics are ALREADY assigned.
- Assign the MISSING common metric. Priority order: BATTERY > STEP > HEART > SPO2 > CAL.
- Each ARC_PROGRESS MUST have a UNIQUE dataType. No duplicates allowed.

AMBIGUITY RESOLUTION for "text" type:
- If it appears near data metrics (steps, battery, etc.), use TEXT_IMG with the nearest metric's dataType.
- If it is a label, decoration, or data value, use TEXT with no dataType.

Return ONLY a JSON object. No explanation. No markdown fences.

{
  "elements": [
    {
      "id": "original_id_from_input",
      "widget": "WIDGET_NAME",
      "sourceType": "original_type_from_input",
      "dataType": "DATA_TYPE_OR_OMIT_IF_NONE"
    }
  ]
}`;

export const STAGE_B_USER_PROMPT_TEMPLATE = (inputJson: string): string =>
  `Normalize these watchface elements into Zepp OS widgets. Resolve ALL ambiguities.\n\n${inputJson}`;

export const STAGE_B_RESPONSE_SCHEMA = {
  type: 'object' as const,
  properties: {
    elements: {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        properties: {
          id:         { type: 'string' as const },
          widget:     { type: 'string' as const, enum: ['TIME_POINTER', 'IMG_TIME', 'IMG_DATE', 'IMG_WEEK', 'ARC_PROGRESS', 'TEXT', 'TEXT_IMG', 'IMG', 'IMG_STATUS', 'IMG_LEVEL'] },
          sourceType: { type: 'string' as const, enum: ['time', 'date', 'steps', 'battery', 'heart_rate', 'spo2', 'calories', 'distance', 'weather', 'weekday', 'month', 'arc', 'text'] },
          dataType:   { type: 'string' as const },
        },
        required: ['id', 'widget', 'sourceType'],
      },
    },
  },
  required: ['elements'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// Call 3: Ambiguity Resolution — Resolves remaining unresolved ARC data types.
// Only invoked when Stage B output still has ARC_PROGRESS without dataType.
// ═══════════════════════════════════════════════════════════════════════════════

export const CALL_3_SYSTEM_PROMPT = `You are a watchface metric resolver. You receive normalized Zepp OS watchface elements where some ARC_PROGRESS widgets have no dataType assigned. Your job is to assign the correct metric to each unresolved arc.

RULES:
- ONLY modify elements that have widget "ARC_PROGRESS" and no dataType
- Assign from these values ONLY: BATTERY, STEP, HEART, SPO2, CAL
- Each dataType must be UNIQUE — no duplicates across the full list
- Common priority for unknown arcs: BATTERY > STEP > HEART
- Consider region hints: top often = battery, bottom often = steps, left/right = heart/spo2
- Do NOT modify elements that already have a dataType
- Do NOT add any fields beyond what's in the input

Return the COMPLETE elements array with ALL dataTypes resolved. Return ONLY JSON.`;

export const CALL_3_USER_PROMPT_TEMPLATE = (inputJson: string): string =>
  `Resolve the missing dataTypes for ARC_PROGRESS elements:\n\n${inputJson}`;
