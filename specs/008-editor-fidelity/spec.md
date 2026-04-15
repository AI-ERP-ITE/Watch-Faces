# Spec 008: Editor Fidelity — Position Accuracy, Grid, Icons, Fonts, Type Switching

## Status

**Prerequisite completed:** Spec 007 delivered InteractiveCanvas + PropertyPanel + ElementList selection + drag/resize + Regenerate button.

---

## Problem Statement

### P1: Arc Position Mismatch
Bridge sets ARC `bounds` to `{x:0, y:0, w:480, h:480}` (full screen). PropertyPanel displays/edits `bounds.x/y` — always shows 0,0 even when arc is visually at x:300, y:100. Users drag arc to a position, see "0,0" in panel, and generated code uses `center.x/y` which IS correct. Confusion: displayed values ≠ visual position. When user types values into X/Y fields, they modify `bounds` which arc ignores — code gen reads `center`.

**Root cause:** PropertyPanel edits `bounds.x/y` for ALL elements. ARC_PROGRESS code gen reads `element.center.x/y`, not `bounds.x/y`.

### P2: Text/IMG Size Mismatch
IMG_TIME widget size depends on digit image dimensions × character count, not on `bounds.width/height`. User resizes the placeholder box in editor, but firmware ignores bounds for IMG_TIME — it auto-layouts from image array. Result: preview shows small box, device shows large text.

**Root cause:** IMG_TIME/IMG_DATE/IMG_WEEK sizes are determined by image assets, not bounds.

### P3: Icons Missing
AI returns `representation: "icon"` → normalizer maps to `IMG` widget → asset resolver returns `{ src: undefined }` → no image generated. The element exists in config but has no visual asset. On device, nothing renders.

**Root cause:** No icon generation in `assetImageGenerator.ts`. No icon library exists.

### P4: No Font System
Zepp OS TEXT widget uses system font only (no custom TTF). Styled numbers use IMG_TIME/TEXT_IMG with pre-rendered digit PNG arrays. AI may suggest a font style, but we have no mechanism to select or swap font styles.

**Root cause:** Only one digit style exists (bold Arial). No font library. No selection UI.

### P5: No Grid Overlay
Users cannot align elements precisely. No grid or snap-to-grid functionality.

### P6: Placeholder Previews Instead of Realistic Rendering
Canvas draws labeled rectangles for most elements. Users cannot see what the actual widget will look like on device. Battery arc is just a colored arc — no associated icon or percentage text.

### P7: No Widget Type or DataType Switching
DataType dropdown only exists for ARC_PROGRESS. Users cannot change an element's widget type (e.g., ARC → TEXT_IMG) or reassign data type for non-arc elements. Users cannot switch a "heart_rate" icon to "stress" icon.

---

## Goals

1. **Arc properties in PropertyPanel show/edit `center.x/y`** — not bounds
2. **IMG_TIME bounds locked** — show calculated size, disable resize
3. **Built-in icon library** — ~20 common Zepp watchface icons, mapped by dataType
4. **Font style library** — multiple digit PNG styles selectable per text element
5. **Grid overlay** — toggle button, drawn on canvas
6. **Realistic canvas preview** — render asset images, arc colors, icon shapes on canvas
7. **Widget type dropdown** — change element type (ARC→TEXT→IMG etc.)
8. **DataType dropdown for ALL elements** — not just ARC_PROGRESS
9. **Icon picker** — select icon from library for any IMG element
10. **Font picker** — select font style for any text/digit element

---

## Data Model Changes

### `WatchFaceElement` additions (`types/index.ts`)

```typescript
// Add to WatchFaceElement interface:
fontStyle?: string;      // key into font library, e.g. 'bold-white', 'pixel-green'
iconKey?: string;        // key into icon library, e.g. 'battery', 'heart', 'steps'
```

### Icon Library Registry (new file: `src/lib/iconLibrary.ts`)

```typescript
export interface IconEntry {
  key: string;           // 'battery', 'heart', 'steps', etc.
  label: string;         // 'Battery', 'Heart Rate', etc.
  dataUrl: string;       // pre-rendered PNG data URL
  width: number;
  height: number;
  defaultSize: { w: number; h: number };
}

export const ICON_LIBRARY: IconEntry[];
// Canvas-drawn icons: battery, heart, steps, calories, spo2, distance,
// stress, sleep, alarm, bluetooth, weather_sun, weather_cloud,
// notification, moon, pai, stand, fat_burn, uvi, aqi, humidity
```

### Font Style Library (new file: `src/lib/fontLibrary.ts`)

```typescript
export interface FontStyle {
  key: string;           // 'bold-white', 'thin-cyan', 'pixel-green'
  label: string;         // 'Bold White', 'Thin Cyan', etc.
  fontFamily: string;    // CSS font for canvas rendering
  fontWeight: string;
  color: string;         // default color
  preview: string;       // data URL of "12:34" preview image
}

export const FONT_STYLES: FontStyle[];
// Pre-configured: bold-white(default), thin-cyan, pixel-green, serif-gold,
// mono-red, rounded-blue, condensed-silver, digital-green
```

---

## Architecture

```
User edits element in InteractiveCanvas / PropertyPanel
  → dispatch(UPDATE_ELEMENT, { id, changes })
  → elements[] state updated
  → InteractiveCanvas re-renders from elements[] (with realistic visuals)
  → Regenerate button → buildZPK reads same elements[]
  → Code gen reads center/radius/startAngle for ARC, bounds for rect elements
  → Asset gen uses fontStyle/iconKey to pick correct PNG set
```

### Key Principle: ONE source of truth

`elements[]` drives everything. No derived state. Canvas renders exactly what code gen produces.

---

## File Inventory

| File | Action | Purpose |
|------|--------|---------|
| `src/lib/iconLibrary.ts` | NEW | Icon registry with canvas-drawn PNGs |
| `src/lib/fontLibrary.ts` | NEW | Font style registry with canvas-drawn digit sets |
| `src/components/PropertyPanel.tsx` | MODIFY | Fix arc fields, add type/dataType dropdowns, icon/font pickers |
| `src/components/InteractiveCanvas.tsx` | MODIFY | Grid overlay, realistic element rendering, lock IMG_TIME resize |
| `src/types/index.ts` | MODIFY | Add `fontStyle`, `iconKey` to WatchFaceElement |
| `src/pipeline/assetImageGenerator.ts` | MODIFY | Use fontStyle/iconKey when generating assets |
| `src/pipeline/assetResolver.ts` | MODIFY | Wire icon filenames from iconKey |
| `src/App.tsx` | MODIFY | Pass grid toggle state, wire new PropertyPanel props |

---

## Acceptance Criteria

1. ARC: PropertyPanel Position section shows/edits `center.x/y`. Drag updates center. Code gen outputs matching `center_x/center_y`.
2. IMG_TIME: Bounds locked to `(count × digitW) × digitH`. Resize handles disabled. Info text shown.
3. Icons: 20 built-in icons selectable via picker. Selected icon renders on canvas. Icon PNG included in ZPK.
4. Fonts: 8 font styles selectable per text/digit element. Digit images regenerated in selected style.
5. Grid: Toggle button shows/hides grid. Grid = 48px divisions (10×10). Does not affect hit testing.
6. Realistic preview: Arcs show color + lineWidth. IMG elements show actual asset thumbnail. Text shows with size/color.
7. Type dropdown: Any element can be changed to any compatible widget type.
8. DataType dropdown: Available on ALL element types (not just ARC).
9. Icon picker: Available on IMG elements. Shows grid of available icons. Click to assign.
10. Font picker: Available on IMG_TIME, TEXT_IMG, TEXT elements. Shows style previews. Click to assign.
