# Zepp Watchface Generator — Complete Pipeline Specification

> **Purpose:** Self-contained document to reproduce the ENTIRE pipeline from scratch using any AI agent.
> **Target:** Amazfit Balance 2 (480×480 round screen, Zepp OS V2)
> **Stack:** TypeScript 5.x, React, Vite, vitest

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Type System](#2-type-system)
3. [Pipeline Stages](#3-pipeline-stages)
4. [Stage 0: AI Vision Extraction](#4-stage-0-ai-vision-extraction)
5. [Stage 0.5: Representation Corrector](#5-stage-05-representation-corrector)
6. [Stage 1: Normalizer](#6-stage-1-normalizer)
7. [Stage 1.5: Semantic Priority](#7-stage-15-semantic-priority)
8. [Stage 2: Layout Engine](#8-stage-2-layout-engine)
9. [Stage 3: Geometry Solver](#9-stage-3-geometry-solver)
10. [Stage 4: Asset Resolver](#10-stage-4-asset-resolver)
11. [Stage 5: V2 Bridge & Code Generation](#11-stage-5-v2-bridge--code-generation)
12. [Validators](#12-validators)
13. [Constants (Single Source of Truth)](#13-constants-single-source-of-truth)
14. [Pipeline Orchestrator](#14-pipeline-orchestrator)
15. [ZPK Packaging](#15-zpk-packaging)
16. [Test Patterns](#16-test-patterns)
17. [Known Pitfalls](#17-known-pitfalls)

---

## 1. Architecture Overview

```
User uploads watchface design image
         ↓
Stage 0: AI Vision API → AIElement[] (semantic + representation, NO coordinates)
         ↓
Stage 0.5: correctRepresentation() — fix AI arc collapse (deterministic, <5ms)
         ↓
Validate: validateAIOutput()
         ↓
Stage 1: normalize() — representation → ZeppWidget mapping (code) or normalizeWithAI()
         ↓
Validate: validateNormalized()
         ↓
Stage 1.5: sortArcsByPriority() — semantic visual hierarchy
         ↓
Stage 2: applyLayout() — group zones + layout mode → anchor points (centerX, centerY)
         ↓
Validate: validateLayout()
         ↓
Stage 3: solveGeometry() — SIZE, SHAPE, SPATIAL INTELLIGENCE (radius, sweep, bbox)
         ↓
Validate: validateGeometry()
         ↓
Stage 4: resolveAssets() — widget → asset file paths
         ↓
Stage 5: bridgeToWatchFaceConfig() → generateWatchFaceCodeV2() → {app.json, app.js, watchface/index.js}
         ↓
buildZPK() → downloadable .zpk file
```

**Key Design Principles:**
- Each stage validates input before passing downstream
- AI is optional: code fallbacks always available
- No stage combines two responsibilities
- Coordinates are NEVER in AI output — only computed in Layout + Geometry
- **Representation drives widget selection**, not type alone
- Maximum 2 ARC_PROGRESS widgets (hardware/layout constraint)

---

## 2. Type System

File: `src/types/pipeline.ts`

### Enums/Unions

```typescript
type Representation = 'text' | 'arc' | 'icon' | 'text+icon' | 'text+arc' | 'number';

type LayoutMode = 'row' | 'arc' | 'standalone' | 'grid';

type Group =
  | 'center' | 'top' | 'bottom'
  | 'left_panel' | 'right_panel'
  | 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right';

type AIElementType =
  | 'time' | 'date' | 'steps' | 'battery' | 'heart_rate'
  | 'arc' | 'text' | 'weather' | 'spo2' | 'calories' | 'distance'
  | 'weekday' | 'month';

type ZeppWidget =
  | 'TIME_POINTER' | 'IMG_TIME' | 'IMG_DATE' | 'IMG_WEEK'
  | 'ARC_PROGRESS' | 'TEXT' | 'TEXT_IMG' | 'IMG' | 'IMG_STATUS' | 'IMG_LEVEL';
```

### Stage Interfaces (Progressive Enhancement)

```typescript
// Stage 0: AI output — semantic only, NO coordinates
interface AIElement {
  id: string;
  type: AIElementType;
  representation: Representation;
  layout: LayoutMode;
  group: Group;
  importance?: 'primary' | 'secondary';
  confidence?: number;
}

// Stage 1: Widget type assigned
interface NormalizedElement {
  id: string;
  widget: ZeppWidget;
  group: Group;
  layout: LayoutMode;
  sourceType: AIElementType;
  dataType?: string;          // e.g. 'BATTERY', 'STEP', 'HEART'
  parentId?: string;          // for compound-expanded elements
}

// Stage 2: Anchor point computed
interface LayoutElement extends NormalizedElement {
  centerX: number;
  centerY: number;
}

// Stage 3: Full spatial data
interface GeometryElement extends LayoutElement {
  // TIME_POINTER
  posX?: number; posY?: number;
  hourPosX?: number; hourPosY?: number;
  minutePosX?: number; minutePosY?: number;
  secondPosX?: number; secondPosY?: number;
  // ARC_PROGRESS
  radius?: number; startAngle?: number; endAngle?: number; lineWidth?: number;
  // Rectangular widgets
  x?: number; y?: number; w?: number; h?: number;
}

// Stage 4: Asset paths added
interface ResolvedElement extends GeometryElement {
  assets: ResolvedAssets;
}

interface ResolvedAssets {
  src?: string;
  fontArray?: string[];
  hourHandSrc?: string; minuteHandSrc?: string; secondHandSrc?: string; coverSrc?: string;
  weekArray?: string[];
  monthArray?: string[];
  imageArray?: string[];
}
```

### Validation Error

```typescript
class PipelineValidationError extends Error {
  stage: string;
  violations: string[];
  constructor(stage: string, violations: string[]) {
    super(`[Pipeline:${stage}] Validation failed:\n${violations.map(v => `  - ${v}`).join('\n')}`);
    this.name = 'PipelineValidationError';
    this.stage = stage;
    this.violations = violations;
  }
}
```

---

## 3. Pipeline Stages

| Stage | Function | Input | Output | Deterministic? |
|-------|----------|-------|--------|----------------|
| 0 | `extractElementsFromImage()` | Image + API key | `AIElement[]` | No (AI) |
| 0.5 | `correctRepresentation()` | `AIElement[]` | `AIElement[]` | Yes |
| Validate | `validateAIOutput()` | `AIElement[]` | throws or void | Yes |
| 1 | `normalize()` or `normalizeWithAI()` | `AIElement[]` | `NormalizedElement[]` | Yes (code) / No (AI) |
| Validate | `validateNormalized()` | `NormalizedElement[]` | throws or void | Yes |
| 1.5 | `sortArcsByPriority()` | `NormalizedElement[]` | `NormalizedElement[]` | Yes |
| 2 | `applyLayout()` | `NormalizedElement[]` | `LayoutElement[]` | Yes |
| Validate | `validateLayout()` | `LayoutElement[]` | throws or void | Yes |
| 3 | `solveGeometry()` | `LayoutElement[]` | `GeometryElement[]` | Yes |
| Validate | `validateGeometry()` | `GeometryElement[]` | throws or void | Yes |
| 4 | `resolveAssets()` | `GeometryElement[]` | `ResolvedElement[]` | Yes |
| 5 | `bridgeToWatchFaceConfig()` + `generateWatchFaceCodeV2()` | `ResolvedElement[]` | Code files | Yes |

---

## 4. Stage 0: AI Vision Extraction

File: `src/pipeline/pipelineAIService.ts`

**What it does:** Sends watchface design image to Gemini/OpenAI vision API. Returns semantic element list.

**Key contract:** AI outputs `{id, type, representation, layout, group, importance, confidence}` — **NO coordinates, NO sizes**.

**Retry logic:**
- `MAX_RETRIES = 3`
- `RETRY_BASE_MS = 1000` (1s → 2s → 4s exponential backoff)
- `RETRYABLE_STATUS = [429, 503]` (rate limit + unavailable)

**API call:** `POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`

**Functions:**
- `extractElementsFromImage(provider, apiKey, image)` → `AIElement[]`
- `normalizeWithAI(config, elements)` → `NormalizedElement[]` (optional Stage 1 AI path)
- `resolveAmbiguities(config, elements)` → assigns `dataType` to unresolved arcs

---

## 5. Stage 0.5: Representation Corrector

File: `src/pipeline/representationCorrector.ts`

**Problem solved:** AI frequently collapses ALL elements to `representation: 'arc'`, producing 10 ARC_PROGRESS widgets (unusable on 480px screen).

**Constants:**
```typescript
MAX_ARCS = 2;                    // Hardware/layout constraint
ARC_LAYOUT_THRESHOLD = 3;        // Layout fix trigger

TYPE_DEFAULT_REPRESENTATION = {
  steps:      'text+icon',
  battery:    'text+icon',
  heart_rate: 'text+icon',
  spo2:       'text',
  calories:   'text',
};

CENTER_TYPES = Set(['time']);
TOP_TYPES = Set(['date', 'weekday', 'month']);
```

**5 Rules (applied in order):**

| Rule | Name | Always? | Logic |
|------|------|---------|-------|
| 1 | Arc Limit | ✅ Yes | Count arcs. Keep first 2, downgrade rest to `text`/`row` |
| 2 | Layout Feasibility | ✅ Yes | If arc-layout count > 3, keep up to 2 primary as arc, convert rest to `row` |
| 3 | Group Redistribution | Only if collapsed | If all `center`, reassign: time→center, date/weekday/month→top, data→right_panel |
| 4 | Type Overrides | Only if collapsed | Known data types get correct representation from `TYPE_DEFAULT_REPRESENTATION` |
| 5 | Decorative Detection | Only if collapsed | Non-data-type arcs → `icon`/`standalone` |

**"Collapsed" detection:** `isCollapsed = originalArcCount > MAX_ARCS`

Rules 1-2 always run. Rules 3-5 only run when collapse is detected (prevents over-correcting legitimate designs).

**Complete implementation:**

```typescript
export function correctRepresentation(elements: AIElement[]): AIElement[] {
  let corrected = elements.map(el => ({ ...el }));   // deep copy

  const originalArcCount = elements.filter(el => el.representation === 'arc').length;
  const isCollapsed = originalArcCount > MAX_ARCS;

  corrected = applyArcLimit(corrected);            // Rule 1: always
  corrected = applyLayoutFix(corrected);           // Rule 2: always

  if (isCollapsed) {
    corrected = applyGroupRedistribution(corrected); // Rule 3
    corrected = applyTypeOverrides(corrected);       // Rule 4
    corrected = applyDecorativeDetection(corrected); // Rule 5
  }

  return corrected;
}
```

---

## 6. Stage 1: Normalizer

File: `src/pipeline/normalizer.ts`

**Key rule: Representation drives widget selection, NOT type alone.**

### Core Mapping Function

```typescript
function mapByRepresentation(type: AIElementType, representation: Representation): ZeppWidget | ZeppWidget[] {
  // Time: analog vs digital
  if (type === 'time') return representation === 'arc' ? 'TIME_POINTER' : 'IMG_TIME';

  // Date/weekday/month: always image-based
  if (type === 'date') return 'IMG_DATE';
  if (type === 'weekday') return 'IMG_WEEK';
  if (type === 'month') return 'IMG_DATE';

  // Data elements: BRANCH ON REPRESENTATION
  if (representation === 'arc') return 'ARC_PROGRESS';
  if (representation === 'text') return 'TEXT_IMG';
  if (representation === 'number') return 'TEXT_IMG';
  if (representation === 'icon') return 'IMG';
  if (representation === 'text+icon') return ['TEXT_IMG', 'IMG'];       // compound → 2 widgets
  if (representation === 'text+arc') return ['ARC_PROGRESS', 'TEXT_IMG']; // compound → 2 widgets

  return 'TEXT'; // fallback
}
```

### Data Type Binding

```typescript
const TYPE_TO_DATA_TYPE = {
  steps:      'STEP',
  battery:    'BATTERY',
  heart_rate: 'HEART',
  spo2:       'SPO2',
  calories:   'CAL',
  distance:   'DISTANCE',
  weather:    'WEATHER_CURRENT',
};
```

### Compound Expansion
- `text+icon` → produces 2 elements: `[TEXT_IMG, IMG]`
- `text+arc` → produces 2 elements: `[ARC_PROGRESS, TEXT_IMG]`
- Second element gets `parentId` pointing to first
- IDs: `{originalId}_0`, `{originalId}_1`
- Cap: `COMPOUND_CAP = 2`

### Arc Fallback
Generic `type: 'arc'` elements get dataType from: `['BATTERY', 'STEP', 'HEART', 'SPO2', 'CAL']` (first unused).

---

## 7. Stage 1.5: Semantic Priority

File: `src/pipeline/semanticPriority.ts`

**Purpose:** Controls visual hierarchy for concentric arc stacking.

```typescript
// Lower number = more prominent (outermost, thickest, longest sweep)
PRIORITY_MAP = {
  STEP: 0, BATTERY: 1, HEART: 2, CAL: 3, SPO2: 4, DISTANCE: 5
};

// Mock fill values (0–1) for design-time sweep
MOCK_VALUES = {
  STEP: 0.70, BATTERY: 0.50, HEART: 0.65, CAL: 0.40, SPO2: 0.95, DISTANCE: 0.30
};
```

`sortArcsByPriority()` moves ARC_PROGRESS elements to front, sorted by priority. Non-arc elements keep original order, appended after.

---

## 8. Stage 2: Layout Engine

File: `src/pipeline/layoutEngine.ts`

**Purpose:** Assigns `centerX` and `centerY` based on group zone + layout mode.

### Group Zones (480×480 screen)

```typescript
GROUP_ZONES = {
  center:       { x: 140, y: 140, w: 200, h: 200 },
  top:          { x: 140, y: 20,  w: 200, h: 120 },
  bottom:       { x: 140, y: 340, w: 200, h: 120 },
  left_panel:   { x: 20,  y: 100, w: 200, h: 280 },
  right_panel:  { x: 260, y: 100, w: 200, h: 280 },
  top_left:     { x: 20,  y: 20,  w: 200, h: 200 },
  top_right:    { x: 260, y: 20,  w: 200, h: 200 },
  bottom_left:  { x: 20,  y: 260, w: 200, h: 200 },
  bottom_right: { x: 260, y: 260, w: 200, h: 200 },
};
```

### Layout Rules by Mode

| Mode | Positioning |
|------|-------------|
| `arc` | Center-lock at screen center (240, 240) |
| `row` | Vertical stack within zone. Auto-compresses spacing when too many elements. Clamps to [0, 480]. |
| `standalone` | Center of zone |
| `grid` | (Future) Treated as standalone |

### Row Layout — Overflow Protection

```typescript
const ROW_HEIGHT = 48;
const ROW_PADDING = 8;

// Compress spacing if elements overflow zone
const availableH = zone.h - ROW_PADDING * 2;
const idealTotal = rowEls.length * ROW_HEIGHT;
const rowStep = idealTotal <= availableH
  ? ROW_HEIGHT
  : Math.max(20, Math.floor(availableH / rowEls.length));

// Clamp Y to screen bounds
const clampedY = Math.min(Math.max(rawY, 0), 480);
```

---

## 9. Stage 3: Geometry Solver

File: `src/pipeline/geometrySolver.ts`

**Ownership:** Controls SIZE, SHAPE, and SPATIAL INTELLIGENCE. Layout Engine only controls WHERE (anchor).

### Arc Stacking (Concentric Rings)

Elements arrive pre-sorted by semantic priority.

```typescript
// Per-arc:
const priority = getPriority(el.dataType);       // 0=outermost
const mockValue = getMockValue(el.dataType);      // 0–1 fill

const radius = ARC_BASE_RADIUS - (priority * ARC_SPACING);    // 180 - (p * 25)
const sweep = mockValue * ARC_MAX_SWEEP;                       // fill * 300°
const lineWidth = max(ARC_LINE_WIDTH - (priority * ARC_LINE_WIDTH_STEP), 4); // 12 - (p * 2)
const startAngle = 135;
```

### Constants

```typescript
ARC_BASE_RADIUS = 180;
ARC_SPACING = 25;           // px between rings
ARC_LINE_WIDTH = 12;        // base thickness (priority 0)
ARC_LINE_WIDTH_STEP = 2;    // decrease per priority level
ARC_START_ANGLE = 135;      // degrees
ARC_MAX_SWEEP = 300;        // max sweep angle
```

### TIME_POINTER / IMG_TIME — Calibrated Offset

```typescript
TIME_CENTER_X = 140;   // NOT screen center — calibrated from real watchfaces
TIME_CENTER_Y = 240;

HAND_DIMENSIONS = {
  hour:   { w: 22, h: 140 },
  minute: { w: 16, h: 200 },
  second: { w: 6,  h: 240 },
};
```

### Widget-Specific Solvers

| Widget | Solver | Key Logic |
|--------|--------|-----------|
| `ARC_PROGRESS` | Priority stacking | radius/sweep/thickness from priority |
| `TIME_POINTER` | Calibrated override | centerX=140, hand pivot from dimensions |
| `IMG_TIME` | Calibrated override | x=140, w=250 (HH:gap:MM) |
| `IMG_DATE` | Center in zone | w=72 (2 digits) or 100 (month label) |
| `IMG_WEEK` | Center in zone | w=100, h=36 |
| `IMG_LEVEL` | Center in zone | w=60, h=60 (weather icon) |
| `TEXT_IMG` | Rectangular | w=160, h=50 |
| `TEXT` | Rectangular | w=200, h=40 |
| `IMG` | Rectangular | w=60, h=60 |

### Asset Dimensions (from constants.ts)

```typescript
TIME_DIGIT     = { w: 60, h: 90 };    // time_digit_N.png
DATE_DIGIT     = { w: 36, h: 54 };    // date_digit_N.png
MONTH_LABEL    = { w: 100, h: 36 };   // month_N.png
WEEK_LABEL     = { w: 100, h: 36 };   // week_N.png
WEATHER_ICON   = { w: 60, h: 60 };    // weather_N.png
TEXT_IMG_DIGIT  = { w: 28, h: 44 };   // *_digit_N.png
```

---

## 10. Stage 4: Asset Resolver

File: `src/pipeline/assetResolver.ts`

Maps widget types to file path arrays. NO dynamic generation — fixed, known assets.

### Asset Mapping

| Widget | Assets |
|--------|--------|
| `TIME_POINTER` | `hour_hand.png`, `minute_hand.png`, `second_hand.png`, `hand_cover.png` |
| `IMG_TIME` | `time_digit_0.png` … `time_digit_9.png` |
| `IMG_DATE` | `date_digit_0.png` … `date_digit_9.png` |
| `IMG_DATE` (month) | `month_0.png` … `month_11.png` |
| `IMG_WEEK` | `week_0.png` … `week_6.png` |
| `TEXT_IMG` | `{prefix}_digit_0.png` … `{prefix}_digit_9.png` |
| `IMG_LEVEL` (weather) | `weather_0.png` … `weather_28.png` |
| `ARC_PROGRESS` | No image assets (uses color) |

### Data Type → Digit Prefix

```typescript
DATA_TYPE_DIGIT_PREFIX = {
  BATTERY: 'batt_digit', STEP: 'step_digit', HEART: 'heart_digit',
  SPO2: 'spo2_digit', CAL: 'cal_digit', DISTANCE: 'dist_digit'
};
```

---

## 11. Stage 5: V2 Bridge & Code Generation

### Bridge: ResolvedElement[] → WatchFaceConfig

File: `src/pipeline/index.ts` (bridgeToWatchFaceConfig function)

Converts pipeline output to `WatchFaceConfig` shape expected by V2 code generator.

**Key mappings:**
- `TIME_POINTER` → center-based, full-screen bounds, hand sources + pivot points
- `ARC_PROGRESS` → center-based, full-screen bounds, radius/angles/lineWidth/color
- `IMG_TIME/IMG_DATE/IMG_WEEK` → bbox from geometry, font/image arrays
- `TEXT_IMG` → bbox from geometry, font array + dataType
- `IMG/IMG_STATUS/IMG_LEVEL` → bbox from geometry, src or image array

**Arc Colors:**
```typescript
ARC_COLORS = {
  BATTERY: '0x00CC88', STEP: '0xFFD93D', HEART: '0xFF6B6B',
  SPO2: '0xEE5A24', CAL: '0xFF9F43', DISTANCE: '0x54A0FF'
};
```

**Name routing:** V2 generator uses `name.includes('time')`, `name.includes('date')`, etc. Names MUST contain these keywords for routing but TEXT_IMG/IMG names must NOT contain them.

### V2 Code Generator

File: `src/lib/jsCodeGeneratorV2.ts`

Generates 3 files:
1. **app.json** — V2 manifest (`configVersion: "v3"`, `targets.default.module.watchface.path`)
2. **app.js** — Boilerplate runtime
3. **watchface/index.js** — Widget instantiation with NORMAL and AOD modes

**Output format:** Zepp OS V2 for Amazfit Balance 2 (480×480 round).

All coordinates wrapped in `px()` function. `show_level: hmUI.show_level.ALL` for AOD support.

---

## 12. Validators

File: `src/pipeline/validators.ts`

### Allowed Values

```typescript
VALID_AI_TYPES = ['time','date','steps','battery','heart_rate','arc','text','weather','spo2','calories','distance','weekday','month'];
VALID_REPRESENTATIONS = ['text','arc','icon','text+icon','text+arc','number'];
VALID_LAYOUT_MODES = ['row','arc','standalone','grid'];
VALID_GROUPS = ['center','top','bottom','left_panel','right_panel','top_left','top_right','bottom_left','bottom_right'];
VALID_WIDGETS = ['TIME_POINTER','IMG_TIME','IMG_DATE','IMG_WEEK','ARC_PROGRESS','TEXT','TEXT_IMG','IMG','IMG_STATUS','IMG_LEVEL'];
MAX_ELEMENTS = 20;
```

### Stage Validators

| Validator | Checks |
|-----------|--------|
| `validateAIOutput()` | Array not empty, ≤20 elements, unique IDs, valid type/representation/layout/group, confidence 0–1 |
| `validateNormalized()` | Valid widget, valid group, valid layout |
| `validateLayout()` | centerX/centerY are numbers, within [0, 480] |
| `validateGeometry()` | TIME_POINTER has all 3 hand positions, ARC has radius+angles, rect widgets have x/y |

---

## 13. Constants (Single Source of Truth)

File: `src/pipeline/constants.ts`

```typescript
export const SCREEN = { W: 480, H: 480, CX: 240, CY: 240 };

// Group Zones — 9 regions on 480×480 screen
export const GROUP_ZONES = {
  center:       { x: 140, y: 140, w: 200, h: 200 },
  top:          { x: 140, y: 20,  w: 200, h: 120 },
  bottom:       { x: 140, y: 340, w: 200, h: 120 },
  left_panel:   { x: 20,  y: 100, w: 200, h: 280 },
  right_panel:  { x: 260, y: 100, w: 200, h: 280 },
  top_left:     { x: 20,  y: 20,  w: 200, h: 200 },
  top_right:    { x: 260, y: 20,  w: 200, h: 200 },
  bottom_left:  { x: 20,  y: 260, w: 200, h: 200 },
  bottom_right: { x: 260, y: 260, w: 200, h: 200 },
};

// Asset dimensions
export const TIME_DIGIT     = { w: 60, h: 90 };
export const DATE_DIGIT     = { w: 36, h: 54 };
export const MONTH_LABEL    = { w: 100, h: 36 };
export const WEEK_LABEL     = { w: 100, h: 36 };
export const WEATHER_ICON   = { w: 60, h: 60 };
export const TEXT_IMG_DIGIT  = { w: 28, h: 44 };

// Derived
export const HOUR_CONTENT_W   = 120;   // TIME_DIGIT.w * 2
export const MINUTE_CONTENT_W = 120;
export const TIME_COLON_GAP   = 10;
export const TIME_TOTAL_W     = 250;   // 120 + 10 + 120
export const DAY_CONTENT_W    = 72;    // DATE_DIGIT.w * 2
export const DATE_MONTH_GAP   = 10;

// Arc config
export const ARC_BASE_RADIUS     = 180;
export const ARC_SPACING         = 25;
export const ARC_LINE_WIDTH      = 12;
export const ARC_LINE_WIDTH_STEP = 2;
export const ARC_START_ANGLE     = 135;
export const ARC_MAX_SWEEP       = 300;
```

---

## 14. Pipeline Orchestrator

File: `src/pipeline/index.ts`

```typescript
async function runPipeline(aiOutput: AIElement[], options: PipelineOptions): Promise<PipelineResult> {
  // Stage A: Validate
  validateAIOutput(aiOutput);

  // Stage 0.5: Fix arc collapse
  const corrected = correctRepresentation(aiOutput);

  // Stage 1: Normalize (AI or code fallback)
  let normalized: NormalizedElement[];
  if (options.aiConfig) {
    try { normalized = await normalizeWithAI(options.aiConfig, corrected); }
    catch { normalized = normalize(corrected); }
  } else {
    normalized = normalize(corrected);
  }
  validateNormalized(normalized);

  // Call 3: Resolve unresolved arc dataTypes
  // ... (same pattern: AI attempt → code fallback)

  // Stage 1.5: Sort arcs by priority
  normalized = sortArcsByPriority(normalized);

  // Stage 2: Layout
  const layouted = applyLayout(normalized);
  validateLayout(layouted);

  // Stage 3: Geometry
  const geometry = solveGeometry(layouted);
  validateGeometry(geometry);

  // Stage 4: Assets
  const resolved = resolveAssets(geometry);

  // Stage 5: Bridge + Code Gen
  const config = bridgeToWatchFaceConfig(resolved, options);
  const code = generateWatchFaceCodeV2(config);

  return { config, code, resolved };
}
```

**Pipeline Options:**
```typescript
interface PipelineOptions {
  watchfaceName?: string;      // default: 'AI Watchface'
  watchModel?: string;         // default: 'Balance 2'
  backgroundSrc?: string;      // default: 'background.png'
  aiConfig?: { provider: 'gemini' | 'openai'; apiKey: string };
  onProgress?: (message: string) => void;
}
```

---

## 15. ZPK Packaging

File: `src/lib/zpkBuilder.ts`

Packages code + assets into `.zpk` (Zepp Package Kit):
- Creates `device.zip` containing: `app.js`, `app.json`, `watchface/index.js`, `assets/*`
- Creates `app-side.zip` with companion app
- Nests both in outer `.zpk` file
- Uses JSZip library

---

## 16. Test Patterns

All tests use `vitest`. File location: `src/pipeline/__tests__/`

### Test Suites

| Test File | Elements | What it verifies |
|-----------|----------|------------------|
| `pipeline-corrector-zpk60.test.ts` | 10 all-arc elements | Corrector fixes collapse: not all arcs, groups redistributed, mixed widgets |
| `pipeline-corrector-arc-regression.test.ts` | 2 arcs (legitimate) | No corrections applied, arcs stay as arcs |
| `pipeline-corrector-text-regression.test.ts` | 3 text elements | No corrections applied, layout/group unchanged |
| `pipeline-corrector-mixed-regression.test.ts` | 2 arcs + 3 texts | No corrections, produces 2 ARC_PROGRESS + 3 TEXT_IMG |
| `pipeline-arc-only.test.ts` | 2 arc elements | Full pipeline: ARC_PROGRESS with correct priority stacking |
| `pipeline-text-only.test.ts` | 3 text elements | Full pipeline: TEXT_IMG with row layout |
| `pipeline-mixed.test.ts` | Mix of types | Full pipeline: produces correct mixed widget types |
| `pipeline-zpk-reference.test.ts` | Real ZPK reference data | Full pipeline matches reference output |

### Test Pattern

```typescript
import { describe, it, expect } from 'vitest';
import type { AIElement } from '@/types/pipeline';
import { correctRepresentation } from '../representationCorrector';
import { normalize } from '../normalizer';

const TEST_INPUT: AIElement[] = [
  { id: 'battery_arc', type: 'battery', representation: 'arc', layout: 'arc', group: 'center', importance: 'primary', confidence: 0.95 },
  // ... more elements
];

describe('Test name', () => {
  it('specific assertion', () => {
    const corrected = correctRepresentation(TEST_INPUT);
    const normalized = normalize(corrected);
    expect(normalized.some(e => e.widget === 'ARC_PROGRESS')).toBe(true);
  });
});
```

---

## 17. Known Pitfalls

### Critical Bugs Fixed

| Bug | Root Cause | Fix |
|-----|-----------|------|
| AI collapses all to arcs | AI model bias toward arc representation | Representation Corrector (5 rules) |
| Row overflow (centerY > 480) | Fixed 48px spacing × 8+ elements | Auto-compress spacing + clamp to screen |
| Rule 4 too aggressive | `applyTypeOverrides` fired on legitimate designs | `isCollapsed` guard (Rules 3-5 conditional) |
| TIME_POINTER split to 3 widgets | Implemented as separate hour/minute/second | ONE widget handles all 3 hands |

### Design Decisions

1. **MAX_ARCS = 2** — More than 2 concentric arcs become illegible on 480px
2. **Representation > Type** — `type: 'battery'` can be arc OR text+icon depending on design
3. **Calibrated time offset** — TIME_CENTER_X=140, not screen center (matches real watchfaces)
4. **Compound expansion cap = 2** — `text+icon` → max 2 widgets, prevents explosion
5. **Code fallback always available** — Every AI stage has deterministic fallback

### File Structure

```
src/
  types/
    pipeline.ts          # All type definitions
    index.ts             # WatchFaceConfig, WatchFaceElement, etc.
  pipeline/
    index.ts             # Orchestrator (runPipeline)
    constants.ts         # Screen/zone/dimension constants
    validators.ts        # Stage gate-keepers
    representationCorrector.ts  # Fix AI arc collapse
    normalizer.ts        # Representation → widget mapping
    semanticPriority.ts  # Arc visual hierarchy
    layoutEngine.ts      # Group zone positioning
    geometrySolver.ts    # Size/shape/spatial intelligence
    assetResolver.ts     # Widget → asset file paths
    pipelineAIService.ts # AI API integration
    aiPrompt.ts          # AI prompt schemas
    assetImageGenerator.ts # Canvas-drawn PNG assets
    __tests__/           # All test files
  lib/
    jsCodeGeneratorV2.ts # Zepp OS V2 code generation
    jsCodeGenerator.ts   # V2/V3 router
    zpkBuilder.ts        # ZPK packaging
    assetGenerator.ts    # Legacy asset generator
    aiService.ts         # Legacy AI wrapper
```

---

## How to Reproduce This Pipeline

1. **Create type system first** (`types/pipeline.ts`) — all interfaces, unions, error class
2. **Create constants** (`pipeline/constants.ts`) — single source of truth
3. **Create validators** (`pipeline/validators.ts`) — stage contracts
4. **Create normalizer** (`pipeline/normalizer.ts`) — `mapByRepresentation()` function
5. **Create representation corrector** (`pipeline/representationCorrector.ts`) — 5 rules
6. **Create semantic priority** (`pipeline/semanticPriority.ts`) — priority map + sort
7. **Create layout engine** (`pipeline/layoutEngine.ts`) — group zones + layout modes
8. **Create geometry solver** (`pipeline/geometrySolver.ts`) — arc stacking + widget solvers
9. **Create asset resolver** (`pipeline/assetResolver.ts`) — widget → file paths
10. **Create pipeline orchestrator** (`pipeline/index.ts`) — chains all stages
11. **Create V2 code generator** (`lib/jsCodeGeneratorV2.ts`) — Zepp OS output
12. **Create ZPK builder** (`lib/zpkBuilder.ts`) — package for download
13. **Write tests** — one per stage, plus regression tests

Each step depends only on previous steps. Build bottom-up: types → constants → validators → individual stages → orchestrator → code gen → packaging.
