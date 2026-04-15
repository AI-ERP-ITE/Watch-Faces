# Spec 009: Bugs + Features Round 2 — Arc Fix, AI Enrichment, Shortcuts, Export UX, Curved Text, Undo, Libraries

## Status

**Prerequisite completed:** Specs 007 + 008 delivered InteractiveCanvas, PropertyPanel, ElementList, icon library (20 icons), font library (8 styles), grid overlay, widget type switching, dataType dropdown for all elements.

---

## Problem Statements

### P1: ARC_PROGRESS Invisible on Installed Watch [BUG — CRITICAL]

**Symptom:** User generates watchface with arc widgets (battery ring, steps ring). Preview shows arcs correctly. After installing ZPK on Amazfit Balance 2, arcs are completely invisible.

**Root cause:** `jsCodeGeneratorV2.ts` → `generateArcProgressWidget()` emits raw numbers for `center_x`, `center_y`, `radius`, `start_angle`, `end_angle`, `line_width` without wrapping in `px()`. Zepp OS V2 firmware requires ALL coordinate/dimension values wrapped in `px()` function. Without `px()`, the values silently default to 0 on device.

**Current broken output:**
```javascript
hmUI.createWidget(hmUI.widget.ARC_PROGRESS, {
    center_x: 240,
    center_y: 240,
    radius: 180,
    start_angle: 135,
    end_angle: 405,
    line_width: 12,
    color: 0x00CC88,
    type: hmUI.data_type.BATTERY,
    show_level: hmUI.show_level.ALL
});
```

**Required output:**
```javascript
hmUI.createWidget(hmUI.widget.ARC_PROGRESS, {
    center_x: px(240),
    center_y: px(240),
    radius: px(180),
    start_angle: 135,
    end_angle: 405,
    line_width: px(12),
    color: 0x00CC88,
    type: hmUI.data_type.BATTERY,
    show_level: hmUI.show_level.ALL
});
```

**Note:** `start_angle` and `end_angle` are degree values, NOT pixel values — they must NOT be wrapped in `px()`. Only spatial/dimension values get `px()`.

**Files:** `src/lib/jsCodeGeneratorV2.ts` (function `generateArcProgressWidget`, lines ~570-596)

---

### P2: IMG_TIME Preview Ignores Bounds Dimensions [BUG]

**Symptom:** In InteractiveCanvas, time widget (IMG_TIME) renders at much larger size than the bounds rectangle set by the user. User sets bounds to 150×60, but canvas draws "12:34" spanning 200+ pixels.

**Root cause:** `InteractiveCanvas.tsx` draw function renders text strings for IMG_TIME using `ctx.fillText()` with a hardcoded or name-derived font size. It does not use `bounds.width` / `bounds.height` to constrain the rendering. The actual Zepp OS widget sizes itself from digit image dimensions × character count — but the canvas preview should still respect the user's bounds to show an accurate representation.

**Fix approach:** 
1. Pre-generate digit images using `generateDigitImages()` from `assetImageGenerator.ts`
2. Draw those digit images scaled to fit within `bounds` on canvas
3. If digit images aren't available yet, draw placeholder text SCALED to fit bounds

**Files:** `src/components/InteractiveCanvas.tsx` (draw dispatcher section)

---

### P3: AI Doesn't Return Font, Size, Color for Text Elements OR DataType [ENHANCEMENT]

**Symptom:** AI vision extraction returns `color` for elements (as instructed), but returns NO `fontSize`, `fontFamily`, or mapped `dataType`. Downstream, code generator defaults all text to same size. DataType mapping happens in code normalizer as fallback, but AI could do it more accurately from visual context.

**Root cause:** The AI prompt (`aiPrompt.ts`) schema doesn't include `fontSize`, `fontFamily`, or `dataType` fields. The AI was never asked to estimate these values.

**What to add to AI schema:**
```json
{
  "fontSize": "number — estimated font size in pixels (measure from image)",
  "fontFamily": "'sans-serif' | 'serif' | 'monospace' | 'digital' — closest match to visible font style",
  "dataType": "'BATTERY' | 'STEP' | 'HEART' | 'SPO2' | 'CAL' | 'DISTANCE' | 'STRESS' | 'PAI' | 'SLEEP' | ... — Zepp OS data binding type for this element"
}
```

**Mapping rule for AI:** type "battery" → dataType "BATTERY", type "steps" → dataType "STEP", type "heart_rate" → dataType "HEART", etc.

**Files:** `src/pipeline/aiPrompt.ts` (AI_SYSTEM_PROMPT, AI_RESPONSE_SCHEMA)

---

### P4: Widget App Shortcut Assignment [FEATURE]

**Symptom:** User wants to tap a heart rate widget on the watch and have it open the heart rate app. Currently no way to assign click actions to widgets.

**Zepp OS API:** Widgets support `click_func` callback:
```javascript
hmUI.createWidget(hmUI.widget.IMG, {
    ...props,
    click_func: () => { hmApp.startApp({ url: 'HeartRate', native: true }) }
});
```

**Available native app shortcuts:**
- `HeartRate` — Heart rate monitor
- `Sport` — Exercise/workout
- `Weather` — Weather forecast  
- `Alarm` — Alarm clock
- `Settings` — Watch settings
- `Music` — Music control
- `Notification` — Notification center
- `StopWatch` — Stopwatch
- `Timer` — Countdown timer
- `Compass` — Compass
- `Barometer` — Barometer/altitude
- `WorldClock` — World clock

**Implementation:**
1. Add `clickAction?: string` to `WatchFaceElement` type
2. Add shortcut dropdown in PropertyPanel (under all elements)
3. Code gen: if `clickAction` is set, emit `click_func` callback in widget code

**Files:** `src/types/index.ts`, `src/components/PropertyPanel.tsx`, `src/lib/jsCodeGeneratorV2.ts`

---

### P5: Preview Image + QR + ZPK Filename Together [FEATURE]

**Symptom:** After generation, user sees QR code but no preview of the actual watchface. Can't tell which watchface this QR belongs to. No filename shown.

**Fix:** Redesign `QRDisplay.tsx` to show:
1. **Left column:** Canvas preview thumbnail (240×240 scaled from 480×480 canvas)
2. **Center column:** QR code (256×256)
3. **Bottom row:** ZPK filename, file size, download + share buttons

**Files:** `src/components/QRDisplay.tsx`, `src/App.tsx` (pass preview image to QRDisplay)

---

### P6: Icons Missing from Installed Watch ZPK [BUG]

**Symptom:** Some icon elements appear in editor preview but are invisible on installed watch. The icon file is referenced in generated code but not packaged in the ZPK.

**Root cause chain:**
1. AI returns element with `representation: "icon"` or `"text+icon"`
2. Normalizer maps it to `IMG` widget
3. Asset resolver assigns `src: 'battery_icon.png'` or similar
4. `assetImageGenerator.ts` → `generatePipelineAssets()` only generates: digit arrays, clock hands, weather icons, bluetooth icon
5. **No generation path for data-type-specific icons** (battery icon, heart icon, steps icon, etc.)
6. ZPK builder tries to find the file → gets `undefined` → skips it → icon missing

**Fix:**
1. In `assetImageGenerator.ts`, add icon generation using `iconLibrary.ts` 
2. For any element with `representation: "icon"` or `"text+icon"`, generate the icon at the element's specified size
3. Ensure the generated icon filename matches what `assetResolver.ts` assigns

**Files:** `src/pipeline/assetImageGenerator.ts`, `src/pipeline/assetResolver.ts`, `src/lib/iconLibrary.ts`

---

### P7: Curved/Arc Text Rendering [FEATURE]

**Symptom:** User wants text to follow a curved path (common watchface design pattern — e.g., "BATTERY" label along an arc).

**Zepp OS limitation:** No native curved text widget. Must pre-render as image asset.

**Implementation:**
1. Add `curvedText?: { radius: number; startAngle: number; endAngle: number }` to `WatchFaceElement`
2. InteractiveCanvas: draw text along arc path using `ctx.translate/rotate` per character
3. Asset image generator: render curved text to PNG
4. Code gen: emit as `IMG` widget with the pre-rendered PNG

**Files:** `src/types/index.ts`, `src/components/InteractiveCanvas.tsx`, `src/pipeline/assetImageGenerator.ts`, `src/lib/jsCodeGeneratorV2.ts`, `src/components/PropertyPanel.tsx`

---

### P8: Undo/Redo for Canvas Adjustments [FEATURE]

**Symptom:** User drags element to wrong position. No way to undo. Must manually re-enter coordinates.

**Implementation:** History stack pattern in AppContext:
1. On every `UPDATE_ELEMENT` / `UPDATE_ELEMENTS_BATCH` dispatch, push previous `elements[]` snapshot to undo stack
2. Ctrl+Z → pop undo stack → restore elements → push current to redo stack
3. Ctrl+Y → pop redo stack → restore elements → push current to undo stack
4. Max 30 history entries (oldest dropped)
5. Any new edit clears redo stack

**State additions:**
```typescript
undoStack: WatchFaceElement[][];  // max 30
redoStack: WatchFaceElement[][];  // cleared on new edit
```

**New actions:** `UNDO`, `REDO`

**Files:** `src/context/AppContext.tsx`, `src/App.tsx` (keybinding listener)

---

### P9: Font Library Expansion — All Free Fonts [FEATURE]

**Symptom:** Only 8 font styles available. User wants more variety.

**Approach:** Include popular free fonts usable for digit rendering. Since Zepp OS uses image-based fonts (digit PNGs), we don't bundle TTF files — we render digits via canvas using CSS fonts available in the browser.

**Fonts to add (browser-safe + Google Fonts loaded via CSS):**
- All current 8 styles kept
- Add ~12 more: Roboto, Roboto Mono, Orbitron, Oswald, Bebas Neue, Rajdhani, Share Tech Mono, Goldman, Russo One, Audiowide, Rationale, Black Ops One

**Implementation:**
1. Add Google Fonts CSS import to `index.html` for the new families
2. Expand `FONT_STYLES` array in `fontLibrary.ts`
3. Each new font: key, label, fontFamily, fontWeight, color, preview

**Files:** `index.html`, `src/lib/fontLibrary.ts`

---

### P10: Font Picker Hover Preview [FEATURE]

**Symptom:** User must click each font to see how it looks. Wants Word-style hover preview.

**Implementation:**
1. Property panel font picker → on mouse enter over font option, temporarily render the current text value in that font on canvas
2. On mouse leave, revert to selected font
3. Use a floating preview tooltip showing "12:34" in the hovered font

**Files:** `src/components/PropertyPanel.tsx`

---

### P11: Icon Library Expansion — All Free Icons by Category [FEATURE]

**Symptom:** Only 20 procedural icons. User wants more icons, organized by category.

**Expand to ~50+ icons in categories:**
- **Health:** heart, spo2, stress, sleep, pai, fat_burn, stand (existing + refined)
- **Activity:** steps, calories, distance, running, cycling, swimming
- **Environment:** weather_sun, weather_cloud, weather_rain, weather_snow, temperature, humidity, uvi, aqi, wind, barometer
- **System:** battery, battery_low, bluetooth, wifi, alarm, notification, settings, dnd, airplane
- **Time:** moon, sunrise, sunset, stopwatch, timer, world_clock

**Implementation:**
1. Add new icon draw functions in `iconLibrary.ts`
2. Add `category` field to `IconEntry`
3. Property panel icon picker: group by category with headers

**Files:** `src/lib/iconLibrary.ts`, `src/components/PropertyPanel.tsx`

---

### P12: Time/Date Digit Preview at Correct Size [BUG + ENHANCEMENT]

**Symptom:** Canvas preview shows text labels "12:34" or "24" for time/date elements instead of actual digit images at the correct size. User can't see what the final watchface will look like.

**Root cause:** Same as P2. InteractiveCanvas draws text strings, not digit image assets.

**Fix:** Unified approach for all image-font widgets:
1. At pipeline completion, digit images are already generated by `generatePipelineAssets()`
2. Store generated digit image data URLs in element state (extend `WatchFaceElement.images`)
3. InteractiveCanvas: for IMG_TIME/IMG_DATE/IMG_WEEK/TEXT_IMG, draw the actual digit images from `images[]` array, each image at `(bounds.width / charCount) × bounds.height`
4. Fallback: if images not yet generated, draw styled placeholder text scaled to bounds

**Files:** `src/components/InteractiveCanvas.tsx`, `src/pipeline/index.ts` (bridge function to store images on elements), `src/context/AppContext.tsx` (ensure images propagate to elements)

---

## Goals Summary

| # | Goal | Success Metric |
|---|------|---------------|
| 1 | ARC visible on device | Install ZPK → battery/steps arcs render at correct position/size |
| 2 | IMG_TIME preview correct | Canvas shows digits within bounds rect, not overflowing |
| 3 | AI returns richer data | AI response includes fontSize, fontFamily, dataType fields |
| 4 | Widget shortcuts work | Tap widget on watch → opens correct native app |
| 5 | Export shows full info | QR screen shows preview + QR + filename + file size |
| 6 | All icons in ZPK | Every icon element visible on installed watch |
| 7 | Curved text renders | Text follows arc path on canvas + in ZPK output |
| 8 | Undo/Redo works | Ctrl+Z undoes drag, Ctrl+Y redoes. 30 levels deep. |
| 9 | More fonts available | 20 font styles in picker |
| 10 | Font hover preview | Hovering font option shows live preview |
| 11 | More icons available | 50+ icons in categorized picker |
| 12 | Digit preview accurate | IMG_TIME shows real digit images at correct bounds |

---

## Data Model Changes

### `WatchFaceElement` additions (`types/index.ts`)

```typescript
// Add to existing interface:
clickAction?: string;      // Native app shortcut: 'HeartRate', 'Weather', etc.
curvedText?: {
  radius: number;          // Arc radius for text path
  startAngle: number;      // Start angle in degrees
  endAngle: number;        // End angle in degrees
};
```

### `AppState` additions (`types/index.ts`)

```typescript
// Add to existing interface:
undoStack: WatchFaceElement[][];   // max 30 entries
redoStack: WatchFaceElement[][];   // cleared on new edit
```

### `IconEntry` additions (`lib/iconLibrary.ts`)

```typescript
// Add to existing interface:
category: 'health' | 'activity' | 'environment' | 'system' | 'time';
```

---

## Architecture Changes

### Undo/Redo Flow
```
User edits element
  → dispatch(UPDATE_ELEMENT)
  → reducer: push current elements[] to undoStack, clear redoStack
  → apply changes to elements[]
  → canvas re-renders

Ctrl+Z pressed
  → dispatch(UNDO)
  → reducer: pop undoStack → set as current elements[]
  → push old elements[] to redoStack

Ctrl+Y pressed
  → dispatch(REDO)
  → reducer: pop redoStack → set as current elements[]
  → push old elements[] to undoStack
```

### Icon Asset Generation Flow
```
Pipeline generates elements
  → assetResolver assigns icon src paths (e.g., 'battery_icon.png')
  → assetImageGenerator: for each element with icon src:
    1. Look up icon in iconLibrary by dataType/name
    2. Render icon at element's bounds size using canvas
    3. Return PNG data URL
  → zpkBuilder: include icon PNG in ZPK package
```

### Curved Text Flow
```
User enables curvedText on text element (PropertyPanel toggle)
  → sets curvedText: { radius, startAngle, endAngle }
  → InteractiveCanvas: draws text along arc path
  → On generate:
    → assetImageGenerator renders curved text to PNG
    → code gen emits IMG widget with pre-rendered PNG
    → ZPK includes the curved text image
```

---

## File Inventory

| File | Action | Items Addressed |
|------|--------|----------------|
| `src/lib/jsCodeGeneratorV2.ts` | MODIFY | #1 (px() fix), #4 (click_func) |
| `src/pipeline/aiPrompt.ts` | MODIFY | #3 (fontSize, fontFamily, dataType) |
| `src/components/InteractiveCanvas.tsx` | MODIFY | #2, #7, #12 (digit preview, curved text) |
| `src/components/PropertyPanel.tsx` | MODIFY | #4, #7, #10, #11 (shortcuts, curved text, font hover, icon categories) |
| `src/components/QRDisplay.tsx` | MODIFY | #5 (export UX) |
| `src/pipeline/assetImageGenerator.ts` | MODIFY | #6, #7 (icon generation, curved text PNG) |
| `src/pipeline/assetResolver.ts` | MODIFY | #6 (icon filename wiring) |
| `src/lib/iconLibrary.ts` | MODIFY | #6, #11 (expand icons, add categories) |
| `src/lib/fontLibrary.ts` | MODIFY | #9 (expand fonts) |
| `src/context/AppContext.tsx` | MODIFY | #8 (undo/redo stack) |
| `src/types/index.ts` | MODIFY | #4, #7, #8 (clickAction, curvedText, undo state) |
| `src/App.tsx` | MODIFY | #5, #8 (pass preview to QR, undo keybindings) |
| `index.html` | MODIFY | #9 (Google Fonts CSS link) |

---

## Acceptance Criteria

### Bug Fixes
1. **ARC on device:** Generate ZPK with ARC_PROGRESS → install on Balance 2 → arc visible at correct position, correct radius, correct color. Generated code has `px()` on center_x, center_y, radius, line_width. NO `px()` on start_angle/end_angle.
2. **IMG_TIME preview:** Select time element → resize bounds to 150×60 → canvas shows digits fitting within 150×60 rect, not overflowing.
3. **Icons in ZPK:** Generate watchface with icon elements → install → all icons visible. Extract ZPK → every referenced `*_icon.png` file exists and has >0 bytes.
4. **Digit preview:** IMG_TIME/IMG_DATE/TEXT_IMG elements show actual digit images in canvas at the element's bounds size.

### Enhancements
5. **AI response:** AI now returns `fontSize` (number), `fontFamily` (string), and `dataType` (string) for each element. Pipeline passes these through to WatchFaceElement.
6. **Export UX:** After generation, screen shows: preview thumbnail (left), QR code (center), filename + file size + buttons (bottom).

### Features
7. **Shortcuts:** PropertyPanel shows "App Shortcut" dropdown under any element. Select "Heart Rate" → generated code includes `click_func` that opens HeartRate app.
8. **Undo/Redo:** Ctrl+Z undoes last canvas edit. Ctrl+Y redoes. Works for drag, resize, property panel edits. 30 levels.
9. **Font library:** 20 font styles available in picker. Google Fonts loaded.
10. **Font hover:** Hovering a font option in picker shows live preview.
11. **Icon library:** 50+ icons in 5 categories. Icon picker shows category headers.
12. **Curved text:** Toggle curved text on text element → text renders along arc path on canvas. Generated ZPK includes pre-rendered curved text image.

---

## Constraints

- Keep all existing pipeline stages unchanged (extend, don't replace)
- ARC fix must not break existing non-arc widget generation
- AI prompt changes must be backward-compatible (new fields optional in response)
- Undo/redo must not cause memory leaks (cap stack size)
- Google Fonts loaded from CDN — requires internet. Fallback to browser fonts if offline.
- Curved text images must be reasonable size (<50KB per image) for ZPK file size
