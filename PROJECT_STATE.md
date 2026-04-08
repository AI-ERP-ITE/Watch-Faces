# Zepp Watchface Generator — Complete Project State

## Architecture
- **Stack**: Vite + TypeScript + React + Tailwind CSS
- **Source**: `app/src/`
- **Build**: `app/dist/` → copied to `app/docs/` for GitHub Pages
- **URL**: https://ai-erp-ite.github.io/Watch-Faces/
- **Latest commit**: `51877dc` (April 8, 2026)

## Target Device
- **Amazfit Balance 2**: 480×480 round, ZeppOS 4.2
- **deviceSource**: [8519936, 8519937, 8519939]
- **configVersion**: "v2"
- **Lifecycle**: `DeviceRuntimeCore.WatchFace({ init_view(), build() { this.init_view() } })`

---

## Solution Architecture: 5-Layer Deterministic Pipeline

```
User Image → [AI Vision] → [Normalizer] → [Semantic Priority] → [Layout Engine] → [Geometry Solver] → [Asset Resolver] → [V2 Code Generator] → .zpk
                 API           API/Code         Code                  Code               Code                Code                Code
```

### Layer Responsibilities (STRICT OWNERSHIP)

| Layer | File | API/Code | Owns |
|-------|------|----------|------|
| 1. Vision | `pipelineAIService.ts` | Gemini 2.5-flash (image) | Detects elements: type, region, style |
| 2. Normalizer | `normalizer.ts` or AI call | Gemini 2.0-flash (text) or code | Maps AI types → Zepp widgets + dataType |
| 3. Semantic Priority | `semanticPriority.ts` | Code only | Sorts arcs by visual hierarchy |
| 4. Layout Engine | `layoutEngine.ts` | Code only | WHERE — anchor point ONLY (trivial) |
| 5. Geometry Solver | `geometrySolver.ts` | Code only | HOW — radius, sweep, thickness, offsets |
| 6. Asset Resolver | `assetResolver.ts` | Code only | Assigns image filenames per widget |
| 7. Code Generator | `jsCodeGeneratorV2.ts` | Code only | Produces final watchface/index.js |

### Critical Rule: Layout Engine is DUMB, Geometry Solver is SMART
- Layout Engine: region → anchor coordinate. Nothing more.
- Geometry Solver: ALL spatial intelligence — concentric arcs, hand pivots, calibrated offsets.

---

## Pipeline Orchestrator Flow (`pipeline/index.ts`)

```
Stage 0: validateAIOutput(aiElements)        — reject coordinates/spatial data from AI
Stage B: normalizeWithAI() or normalize()    — AI type → Zepp widget + dataType
Call 3:  resolveAmbiguities()                — fix arcs missing dataType (only if needed)
         sortArcsByPriority()                — semantic priority ordering
Stage C: applyLayout()                       — region → anchor position
Stage D: solveGeometry()                     — compute all spatial properties
Stage E: resolveAssets()                     — assign image filenames
Stage F: bridgeToWatchFaceConfig()           — convert to WatchFaceElement[]
         generateWatchFaceCodeV2()           — produce JS code
```

---

## Key Files and Their Code

### `pipeline/constants.ts` — Single Source of Truth
```typescript
SCREEN = { W: 480, H: 480, CX: 240, CY: 240 }
TIME_DIGIT = { w: 60, h: 90 }       // time_digit_N.png
DATE_DIGIT = { w: 36, h: 54 }       // date_digit_N.png
MONTH_LABEL = { w: 100, h: 36 }     // month_N.png
WEEK_LABEL = { w: 100, h: 36 }      // week_N.png
WEATHER_ICON = { w: 60, h: 60 }     // weather_N.png
HOUR_CONTENT_W = 120                 // 2 digits × 60px
TIME_COLON_GAP = 10                  // gap between HH and MM
TIME_TOTAL_W = 250                   // HH + gap + MM
ARC_BASE_RADIUS = 180
ARC_SPACING = 25                     // each arc layer 25px inward
ARC_LINE_WIDTH = 12                  // base thickness
ARC_LINE_WIDTH_STEP = 2              // decreases per priority
ARC_START_ANGLE = 135
ARC_MAX_SWEEP = 300                  // max sweep angle
```

### `pipeline/semanticPriority.ts` — Arc Visual Hierarchy
```typescript
PRIORITY_MAP = { STEP:0, BATTERY:1, HEART:2, CAL:3, SPO2:4, DISTANCE:5 }
MOCK_VALUES = { STEP:0.70, BATTERY:0.50, HEART:0.65, CAL:0.40, SPO2:0.95, DISTANCE:0.30 }
// Exports: getPriority(dataType), getMockValue(dataType), sortArcsByPriority(elements)
```

### `pipeline/layoutEngine.ts` — Anchor Only
```typescript
REGION_POSITIONS = {
  center: { x:240, y:240 },
  top:    { x:240, y:80 },
  bottom: { x:240, y:400 },
  left:   { x:80,  y:240 },
  right:  { x:400, y:240 },
}
CENTER_LOCKED_WIDGETS = ['ARC_PROGRESS', 'TIME_POINTER', 'IMG_TIME']
// Center-locked: exact anchor, no offset
// Spreadable (TEXT, IMG, etc.): fan out vertically ±40px from anchor
```

### `pipeline/geometrySolver.ts` — Full Spatial Intelligence
```typescript
// Steps A-F:
// A: Extract arcs from elements
// B: Priority from semanticPriority module
// C: radius = ARC_BASE_RADIUS - (priority * ARC_SPACING)
// D: sweep = mockValue * ARC_MAX_SWEEP (data-driven)
// E: lineWidth = max(12 - priority*2, 4) (thickness scaling)
// F: TIME_POINTER/IMG_TIME → calibrated offset centerX=140, centerY=240

TIME_CENTER_X = 140   // calibrated from real watchface
TIME_CENTER_Y = 240

// TIME_POINTER hand pivots:
hour:   posX=11, posY=70   (22×140 image, pivot at center)
minute: posX=8,  posY=100  (16×200 image)
second: posX=3,  posY=120  (6×240 image)
```

### `pipeline/normalizer.ts` — AI Type → Zepp Widget
```typescript
TYPE_TO_WIDGET = {
  time: 'TIME_POINTER',  // overridden to IMG_TIME if style=digital
  date: 'IMG_DATE', weekday: 'IMG_WEEK', month: 'IMG_DATE',
  steps: 'ARC_PROGRESS', battery: 'ARC_PROGRESS',
  heart_rate: 'ARC_PROGRESS', spo2: 'ARC_PROGRESS',
  calories: 'ARC_PROGRESS', distance: 'TEXT_IMG',
  weather: 'IMG_LEVEL', arc: 'ARC_PROGRESS', text: 'TEXT',
}
TYPE_TO_DATA_TYPE = {
  steps: 'STEP', battery: 'BATTERY', heart_rate: 'HEART',
  spo2: 'SPO2', calories: 'CAL', distance: 'DISTANCE',
  weather: 'WEATHER_CURRENT',
}
```

### `pipeline/assetResolver.ts` — Widget → Image Files
```
TIME_POINTER → hour_hand.png, minute_hand.png, second_hand.png, hand_cover.png
IMG_TIME     → time_digit_0..9.png (10 images)
IMG_DATE     → date_digit_0..9.png (10 images)
IMG_DATE(mo) → month_0..11.png (12 images)
IMG_WEEK     → week_0..6.png (7 images)
ARC_PROGRESS → none (color only)
IMG_LEVEL    → weather_0..28.png (29 images)
TEXT_IMG     → {prefix}_digit_0..9.png (10 per type)
```

### `pipelineAIService.ts` — 3 Sequential AI Calls
```
Call 1: extractElementsFromImage()  → Gemini 2.5-flash + image → AIElement[]
Call 2: normalizeWithAI()           → Gemini 2.0-flash text    → NormalizedElement[]
Call 3: resolveAmbiguities()        → Gemini 2.0-flash text    → NormalizedElement[] (only if arcs unresolved)
```
- Each call sequential, validated before next
- Retry: 3 attempts with 1s/2s/4s exponential backoff on 429/503
- Falls back to code normalizer if AI fails

### `pipeline/index.ts` — Bridge Function (KNOWN ISSUE)
```typescript
// Bridge creates WatchFaceElement from ResolvedElement:
bounds: {
  x: el.x ?? el.centerX,    // For ARC: no x → uses centerX=240
  y: el.y ?? el.centerY,    // For ARC: no y → uses centerY=240
  width: el.w ?? 100,       // For ARC: no w → defaults 100
  height: el.h ?? 100,      // For ARC: no h → defaults 100
}
// ALSO sets: center, radius, startAngle, endAngle, lineWidth separately
// → Design Preview reads bounds (wrong for arcs)
// → Canvas Preview reads center/radius (correct)
// → V2 Code Gen reads center/radius (correct)
```

### ARC_PROGRESS Colors
```typescript
ARC_COLORS = {
  BATTERY: '0x00CC88', STEP: '0xFFD93D', HEART: '0xFF6B6B',
  SPO2: '0xEE5A24', CAL: '0xFF9F43', DISTANCE: '0x54A0FF',
}
```

---

## V2 Code Generator (`lib/jsCodeGeneratorV2.ts`)

### Widget Routing (name-based)
```
elements.find(e.name.includes('time'))  → generateIMGTimeWidget()
elements.find(e.name.includes('date'))  → generateIMGDateWidget()
elements.find(e.name.includes('month')) → generateIMGMonthWidget()
elements.find(e.name.includes('week'))  → generateIMGWeekWidget()
Everything else → generateWidgetCodeV2() switch on element.type
```

### IMG_TIME Code Output
```typescript
x = element.bounds.x || 25     // reads from bounds, NOT center
y = element.bounds.y || 220
// Output:
hmUI.createWidget(hmUI.widget.IMG_TIME, {
  hour_startX: x, hour_startY: y,
  hour_array: [time_digit_0..9],
  minute_startX: x + 120 + 10,  // HOUR_CONTENT_W + TIME_COLON_GAP
  minute_startY: y,
  minute_array: [time_digit_0..9],
})
```

### ARC_PROGRESS Code Output
```typescript
centerX = element.center?.x ?? fallback
centerY = element.center?.y ?? fallback
radius = element.radius ?? fallback
// Output:
hmUI.createWidget(hmUI.widget.ARC_PROGRESS, {
  center_x, center_y, radius, start_angle, end_angle,
  color, line_width, type: hmUI.data_type.STEP,
})
```

### TIME_POINTER Code Output
```typescript
// ONE widget for ALL 3 hands:
hmUI.createWidget(hmUI.widget.TIME_POINTER, {
  hour_centerX, hour_centerY, hour_posX, hour_posY, hour_path,
  minute_centerX, minute_centerY, minute_posX, minute_posY, minute_path,
  second_centerX, second_centerY, second_posX, second_posY, second_path,
})
```

---

## UI Components

### Preview Step (App.tsx case 'preview')
Two side-by-side views:
1. **Design Preview** (`WatchPreview.tsx`) — div-based, uses bounds → misleading for arcs
2. **Generated Layout** (`CanvasWatchPreview.tsx`) — canvas, uses geometry fields → accurate

### Canvas Preview Renders
- ARC_PROGRESS: actual arcs with radius/sweep/color/thickness + data type labels
- TIME_POINTER: clock hands at mock 10:10:30 with calibrated offset
- IMG_TIME/DATE/WEEK: labeled placeholder rectangles
- Background: uploaded image clipped to circle

---

## Type System (`types/pipeline.ts`)

```
AIElement        → { id, type, region, style?, confidence? }
NormalizedElement → { id, widget, region, sourceType, dataType? }
LayoutElement    → extends Normalized + { centerX, centerY }
GeometryElement  → extends Layout + { radius?, startAngle?, endAngle?, lineWidth?,
                    hourPosX/Y?, minutePosX/Y?, secondPosX/Y?, x?, y?, w?, h? }
ResolvedElement  → extends Geometry + { assets: ResolvedAssets }
```

```
WatchFaceElement → { id, type, name, bounds, center?, color?, radius?,
                     startAngle?, endAngle?, lineWidth?, dataType?,
                     hourHandSrc?, minuteHandSrc?, secondHandSrc?,
                     hourPos?, minutePos?, secondPos?, pointerCenter?,
                     images?, fontArray?, ... }
```

---

## Known Issues (Current)

1. **Design Preview misleading for arcs**: reads bounds (100×100 box) instead of arc geometry
2. **IMG_TIME x=140**: may need per-watchface calibration — currently hardcoded in geometrySolver
3. **Bridge function creates redundant bounds for arcs**: center/radius duplicate in both bounds and dedicated fields

## Critical Rules
1. ONE TIME_POINTER widget handles ALL 3 hands (hour/minute/second)
2. posX/posY = rotation pivot within image from TOP-LEFT corner
3. centerX/centerY = screen-space rotation center
4. When ARC_PROGRESS has `type` bound, firmware manages `level` — don't set both
5. IMG_WEEK cannot set w/h — uses actual image dimensions
6. month_is_character:true requires exactly 12 images
7. ALWAYS copy dist/ to docs/ after build (deployment protocol)
8. All coordinates: Raw values, NO px() wrapper (confirmed working on hardware)

## Hardware-Verified Watchfaces
- online35: First working (v1.0-first-working tag)
- online40: All widget types verified
- online54-56: Pipeline-generated with canvas preview

## Deployment Protocol
```bash
npm run build                           # must succeed
Copy-Item dist/* docs/ -Recurse -Force  # MANDATORY
git add -A; git commit; git push        # push to GitHub Pages
Ctrl+F5 hard refresh to verify
```
