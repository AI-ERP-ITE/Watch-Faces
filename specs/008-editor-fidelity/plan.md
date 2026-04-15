# Plan 008: Editor Fidelity — Position Accuracy, Grid, Icons, Fonts, Type Switching

## Approach

8 phases. Each produces a working, deployable state. Earlier phases fix critical bugs (arc position, size accuracy), later phases add new capabilities (icons, fonts).

---

## Phase 1: Fix Arc Position in PropertyPanel

**Goal:** PropertyPanel shows/edits `center.x/y` for ARC_PROGRESS elements instead of `bounds.x/y`.

**What changes:**
- `PropertyPanel.tsx`: When `element.type === 'ARC_PROGRESS'`, Position section shows `center.x/y`. Setters dispatch `update({ center: {...} })`.
- `PropertyPanel.tsx`: When `element.type === 'TIME_POINTER'`, Position section shows `center.x/y` too.
- For non-center elements (IMG, TEXT, etc.): keep showing `bounds.x/y` (no change).

**Why first:** This is the #1 user confusion. Quick fix, immediate impact.

**Risk:** LOW — only changes what PropertyPanel reads/writes. Canvas and code gen already handle center correctly.

**Verification:** Select ARC on canvas → panel shows center values (e.g., CX:240, CY:240). Drag arc → values update. Type new CX → arc moves on canvas AND in generated code.

---

## Phase 2: Grid Overlay Toggle

**Goal:** Toggle button to show/hide alignment grid on canvas.

**What changes:**
- `App.tsx`: Add `showGrid` state boolean.
- `InteractiveCanvas.tsx`: Accept `showGrid` prop. Draw grid lines (48px spacing = 10 divisions of 480px) before drawing elements. Lines: semi-transparent white (rgba 255,255,255,0.1). Center crosshair slightly brighter.
- `App.tsx`: Add toggle button in preview section header (grid icon).

**Why second:** Quick win. Helps user align elements for all subsequent testing.

**Risk:** LOW — purely visual overlay, no interaction effect.

**Verification:** Click grid toggle → grid appears. Click again → grid disappears. Grid does not affect click/drag.

---

## Phase 3: DataType Dropdown for ALL Elements

**Goal:** Move DataType dropdown out of ARC-only section so all element types can have a DataType.

**What changes:**
- `PropertyPanel.tsx`: Show DataType dropdown for ALL elements that have a `dataType` field or could have one (ARC_PROGRESS, TEXT_IMG, IMG, IMG_LEVEL, TEXT).
- Full list of data types in dropdown: BATTERY, STEP, HEART, SPO2, CAL, DISTANCE, STRESS, PAI, SLEEP, STAND, FAT_BURN, UVI, AQI, HUMIDITY, SUN_RISE, SUN_SET, WIND, ALARM, NOTIFICATION, MOON.

**Why third:** Needed before icon library (icons are mapped by dataType).

**Risk:** LOW — additive UI change.

**Verification:** Select IMG element → dataType dropdown visible. Change to HEART → element.dataType updated in state.

---

## Phase 4: Widget Type Dropdown

**Goal:** Allow changing an element's widget type (e.g., ARC_PROGRESS → TEXT_IMG, IMG → CIRCLE).

**What changes:**
- `PropertyPanel.tsx`: Add "Widget Type" dropdown at top of panel. Options: ARC_PROGRESS, TIME_POINTER, TEXT_IMG, IMG, IMG_TIME, IMG_DATE, IMG_WEEK, IMG_LEVEL, IMG_STATUS, TEXT, CIRCLE, BUTTON.
- On type change: dispatch `UPDATE_ELEMENT` with `{ type: newType }`. Also initialize type-specific defaults:
  - Switching TO `ARC_PROGRESS`: set `center`, `radius: 100`, `startAngle: 135`, `endAngle: 345`, `lineWidth: 8`
  - Switching TO `TIME_POINTER`: set `center: {x:240,y:240}`, `hourPos`, `minutePos`, `secondPos` defaults
  - Switching TO `TEXT`: set `fontSize: 20`, `text: ''`
  - Others: just change type, keep bounds

**Risk:** MEDIUM — type change + default initialization must be correct. Incomplete defaults = broken code gen.

**Verification:** Select heart_rate ARC → change type to TEXT_IMG → element re-renders as text placeholder. Generated code uses TEXT_IMG widget. Change type back to ARC → arc reappears with defaults.

---

## Phase 5: Icon Library + Icon Picker

**Goal:** Built-in icon library with ~20 canvas-drawn icons. Picker UI in PropertyPanel for IMG elements.

**What changes:**
- NEW `src/lib/iconLibrary.ts`:
  - `generateIconLibrary(): IconEntry[]` — canvas-draws 20 icons at 48×48px:
    - battery (green bar in outline), heart (red heart shape), steps (shoe icon), calories (flame), spo2 (O₂ text), distance (pin), stress (brain), sleep (moon+zzz), alarm (bell), bluetooth (B rune), weather_sun (☀), weather_cloud (☁), notification (bell+dot), moon (crescent), pai (P badge), stand (person), fat_burn (flame+sweat), uvi (UV text), aqi (leaf), humidity (droplet)
  - `getIconByKey(key: string): IconEntry | undefined`
  - `ICON_KEYS: string[]` — list of all available keys
- MODIFY `src/types/index.ts`: Add `iconKey?: string` to `WatchFaceElement`
- MODIFY `PropertyPanel.tsx`: For IMG elements, show icon picker grid (thumbnails). Click icon → `update({ iconKey: key, src: iconEntry.dataUrl })`. Show "No icon" option to clear.
- MODIFY `InteractiveCanvas.tsx`: For IMG elements with `iconKey`, load and draw the icon image at element bounds instead of placeholder rectangle.
- MODIFY `assetImageGenerator.ts`: When element has `iconKey`, include the icon PNG in generated assets with deterministic filename (e.g., `icon_battery.png`).
- MODIFY `assetResolver.ts`: When element has `iconKey`, assign `src: 'icon_{key}.png'`.

**Risk:** MEDIUM — icon drawing quality, image loading in canvas. But icons are simple shapes, canvas drawing is proven.

**Verification:** Select IMG element → icon picker shows 20 icons. Click heart → canvas shows heart icon at element position. Regenerate ZPK → `icon_heart.png` in assets. Device shows heart icon.

---

## Phase 6: Font Style Library + Font Picker

**Goal:** Multiple pre-rendered digit styles selectable per text/digit element. Each style = different font family, weight, color for digit PNGs.

**What changes:**
- NEW `src/lib/fontLibrary.ts`:
  - `FONT_STYLES: FontStyle[]` — 8 styles:
    1. `bold-white` — Bold Arial, #FFFFFF (current default)
    2. `thin-cyan` — 300-weight Arial, #00D4FF
    3. `pixel-green` — Courier New, #00FF88
    4. `serif-gold` — Georgia, #FFD700
    5. `mono-red` — Consolas, #FF4444
    6. `rounded-blue` — Verdana, #4A9EFF
    7. `condensed-silver` — Arial Narrow, #C0C0C0
    8. `digital-green` — Lucida Console, #33FF33
  - Each style: `{ key, label, fontFamily, fontWeight, color, preview }` where `preview` = canvas-rendered "12:34" thumbnail
  - `getFontStyle(key: string): FontStyle`
  - `generateFontPreview(style: FontStyle): string` — returns data URL of preview image
  - User can upload custom fonts in future (extensible design)
- MODIFY `src/types/index.ts`: Add `fontStyle?: string` to `WatchFaceElement`
- MODIFY `PropertyPanel.tsx`: For IMG_TIME, TEXT_IMG, TEXT elements, show font style picker (horizontal scroll of preview thumbnails). Click → `update({ fontStyle: key })`.
- MODIFY `assetImageGenerator.ts`:
  - `generateDigitImages()`: Accept `FontStyle` parameter. Use `fontFamily`, `fontWeight`, `color` from style.
  - When element has `fontStyle`, lookup style → generate digits in that style.
  - Font style is per-element, so different time/date elements can use different styles.
- MODIFY `InteractiveCanvas.tsx`: For text/digit elements with `fontStyle`, use the style's font/color when rendering preview text.

**Risk:** MEDIUM — font availability varies across browsers. Must use web-safe fonts only (Arial, Georgia, Courier New, Consolas, Verdana, Lucida Console). Canvas `measureText` needed for accurate sizing.

**Verification:** Select IMG_TIME → font picker shows 8 styles. Click "pixel-green" → canvas re-renders time digits in green Courier. Regenerate ZPK → digit PNGs use green Courier font. Device shows green pixel-style numbers.

---

## Phase 7: IMG_TIME Size Lock + Realistic Canvas Preview

**Goal:** Lock IMG_TIME/IMG_DATE/IMG_WEEK bounds to calculated size. Render actual asset appearances on canvas.

**What changes:**

### 7A: IMG_TIME Size Lock
- `InteractiveCanvas.tsx`: When rendering IMG_TIME/IMG_DATE/IMG_WEEK, skip resize handles. Show info badge "Size = NxN (from digit images)".
- `PropertyPanel.tsx`: For IMG_TIME/IMG_DATE/IMG_WEEK, disable W/H inputs (read-only). Show note: "Size determined by digit images".
- These elements still support drag-to-reposition (X/Y changes).

### 7B: Realistic Canvas Preview
- `InteractiveCanvas.tsx` rendering overhaul per widget type:
  - **ARC_PROGRESS**: Already renders arc with color — ADD: label text (e.g., "75%" or dataType name) near arc midpoint.
  - **IMG with iconKey**: Draw icon image from library instead of placeholder rect.
  - **IMG_TIME/TEXT_IMG with fontStyle**: Draw sample digits "10:28" in the selected font style at element bounds.
  - **TEXT**: Draw text content with `fontSize` and `color`.
  - **IMG with src (asset image)**: If element has `src` that is a data URL, load + draw the image.
  - **Fallback**: Keep labeled rectangle for unknown types.

**Risk:** MEDIUM — image loading is async. Need image cache. But patterns are proven from background image loading.

**Verification:**
- ARC shows colored arc + "BATTERY" label.
- IMG element with heart icon shows heart shape.
- IMG_TIME shows "10:28" in selected font style.
- IMG_TIME cannot be resized (handles hidden, W/H inputs disabled).
- Drag still works on all elements.

---

## Phase 8: Build + Deploy

**Goal:** Final build, copy to docs, deploy.

**What changes:**
- `npm run build` → verify no errors
- Copy dist → docs
- `git add -A && git commit && git push`
- Hard refresh + test on live site

**Verification:** Visit site. Upload design. AI generates elements. Select arc → position shows center. Toggle grid. Change dataType. Change element type. Pick icon. Pick font. Regenerate → download ZPK. Install on device → matches preview.
