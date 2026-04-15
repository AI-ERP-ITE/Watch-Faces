# Tasks 009: Bugs + Features Round 2

---

## Phase 1: ARC_PROGRESS px() Fix [BUG #1 — CRITICAL]

### T001 — Wrap ARC spatial values in px()

**File:** `src/lib/jsCodeGeneratorV2.ts`
**Function:** `generateArcProgressWidget()` (line ~570)

**Current broken code:**
```typescript
  return `
                // ${element.name} - ARC_PROGRESS Widget
                let widget_${widgetIndex} = hmUI.createWidget(hmUI.widget.ARC_PROGRESS, {
                    center_x: ${centerX},
                    center_y: ${centerY},
                    radius: ${radius},
                    start_angle: ${startAngle},
                    end_angle: ${endAngle},
                    color: ${colorValue},
                    line_width: ${lineWidth},${typeParam}
                    show_level: hmUI.show_level.${showLevel}
                });`;
```

**Fixed code:**
```typescript
  return `
                // ${element.name} - ARC_PROGRESS Widget
                let widget_${widgetIndex} = hmUI.createWidget(hmUI.widget.ARC_PROGRESS, {
                    center_x: px(${centerX}),
                    center_y: px(${centerY}),
                    radius: px(${radius}),
                    start_angle: ${startAngle},
                    end_angle: ${endAngle},
                    color: ${colorValue},
                    line_width: px(${lineWidth}),${typeParam}
                    show_level: hmUI.show_level.${showLevel}
                });`;
```

**CRITICAL DISTINCTION:**
- `center_x`, `center_y`, `radius`, `line_width` → ARE pixel/spatial values → WRAP in `px()`
- `start_angle`, `end_angle` → are DEGREE values → do NOT wrap in `px()`
- `color` → hex value → do NOT wrap
- `type` → enum → do NOT wrap
- `show_level` → enum → do NOT wrap

**Verify:**
1. `npm run build` succeeds
2. Search `dist/assets/index-*.js` for `px(` near `ARC_PROGRESS` — must appear for center_x, center_y, radius, line_width
3. Search for `start_angle: px(` — must NOT appear (angles are NOT pixels)
4. Generate test ZPK → install on Balance 2 → arcs visible

---

### T002 — Audit all other widget generators for px() compliance

**File:** `src/lib/jsCodeGeneratorV2.ts`

Check every `generate*Widget` function. Per Zepp OS V2 spec, spatial values need `px()`:

| Function | Fields to check | Currently uses px()? | Action |
|----------|----------------|---------------------|--------|
| `generateIMGTimeWidget` | hour_startX, hour_startY, minute_startX, minute_startY | NO | ADD px() |
| `generateIMGDateWidget` | day_startX, day_startY | NO | ADD px() |
| `generateIMGMonthWidget` | month_startX, month_startY | NO | ADD px() |
| `generateIMGWeekWidget` | x, y | NO | ADD px() |
| `generateTextImgWidget` | x, y, w, h | NO | ADD px() |
| `generateTimePointerWidget` | center_x, center_y, posX, posY | NO | ADD px() |
| `generateTextWidget` | x, y, w, h | NO | ADD px() |
| `generateButtonWidget` | x, y, w, h | NO | ADD px() |
| `generateImgStatusWidget` | x, y | NO | ADD px() |
| `generateCircleWidget` | center_x, center_y, radius | NO | ADD px() |
| `generateImgLevelWidget` | x, y, w, h | NO | ADD px() |
| IMG default in `generateWidgetCodeV2` | x, y, w, h | NO | ADD px() |
| Background IMG | x, y, w, h | NO | ADD px() |

**Apply px() to ALL spatial coordinate/dimension values across ALL generators.**

**Do NOT wrap in px():**
- `alpha` (opacity value 0-255)
- `color` (hex)
- `type` / `data_type` (enums)
- `show_level` (enum)
- `font_array` / `src` (strings)
- `h_space` (pixel spacing — actually yes, wrap this too)
- `hour_zero` / `minute_zero` / `minute_follow` (boolean flags)
- `align_h` / align values (enums)
- Angle values (degrees)

**Verify:** Build → generate ZPK → install → ALL widget types render correctly on device.

---

## Phase 2: Icon ZPK Fix [BUG #6]

### T003 — Add icon PNG generation to assetImageGenerator

**File:** `src/pipeline/assetImageGenerator.ts`

**Problem:** When an element has `representation: "icon"` or `"text+icon"`, the normalizer creates an IMG element. Asset resolver assigns a `src` path like `battery_icon.png`. But `generatePipelineAssets()` never creates this file.

**Current `generatePipelineAssets()` handles:**
- ✅ Digit images (IMG_TIME, IMG_DATE, TEXT_IMG)
- ✅ Clock hands (TIME_POINTER)
- ✅ Weather icons (weather type)
- ✅ Status icons (bluetooth)
- ❌ Data-type icons (battery, heart, steps, spo2, etc.) — MISSING

**Add to `generatePipelineAssets()` — after existing generation blocks:**

```typescript
// Generate data-type icons for IMG elements that reference icon files
for (const el of elements) {
  if (el.widget === 'IMG' && el.assets?.src && el.assets.src.includes('_icon.png')) {
    const iconKey = el.assets.src.replace('_icon.png', '').replace('icon_', '');
    const icon = getIconByKey(iconKey);
    if (icon && !generatedSets.has(el.assets.src)) {
      generatedSets.add(el.assets.src);
      // Render icon at element's geometry size (or fallback 48x48)
      const w = el.w ?? 48;
      const h = el.h ?? 48;
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      // Draw icon scaled to element size
      const img = new Image();
      img.src = icon.dataUrl;
      await new Promise<void>((resolve) => {
        img.onload = () => {
          ctx.drawImage(img, 0, 0, w, h);
          resolve();
        };
        img.onerror = () => resolve(); // Skip on error
      });
      assets.push({
        filename: el.assets.src,
        dataUrl: canvas.toDataURL('image/png'),
      });
    }
  }
}
```

**Import:** Add `import { getIconByKey } from '@/lib/iconLibrary';` at top of file.

**Verify:**
1. Generate watchface with icon elements (e.g., battery icon, heart icon)
2. Extract ZPK → check `assets/` folder → `battery_icon.png` exists with >0 bytes
3. Install on watch → icon visible

---

### T004 — Fix assetResolver icon path assignment

**File:** `src/pipeline/assetResolver.ts`

**Check:** When normalizer maps `representation: "icon"` → `IMG` widget, does `resolveAssets()` assign a `src` filename that matches what T003 generates?

**Expected pattern:** `{dataType_lower}_icon.png` or `icon_{iconKey}.png`

**Ensure consistency:**
- If resolver assigns `battery_icon.png`, generator must create `battery_icon.png`
- If resolver assigns `icon_battery.png`, generator must create `icon_battery.png`
- Pick ONE convention and use it everywhere

**Verify:** Search generated code for icon `src` paths → match against generated filenames in ZPK.

---

## Phase 3: AI Response Enrichment [ENHANCEMENT #3]

### T005 — Add fontSize, fontFamily, dataType to AI prompt schema

**File:** `src/pipeline/aiPrompt.ts`

**Add to the schema section inside `AI_SYSTEM_PROMPT` (after the existing field definitions):**

```
"fontSize": number — estimated font/digit size in pixels (measure height of the text/numbers from the image). Required for text/number/text+icon representations.

"fontFamily": "sans-serif" | "serif" | "monospace" | "digital" | "rounded" — closest match to the visible font style in the image. Required for text/number representations.

"dataType": the Zepp OS data binding type. Map from the element type:
  - "time" → omit (handled specially)
  - "date" → omit (handled specially)  
  - "weekday" → omit (handled specially)
  - "month" → omit (handled specially)
  - "battery" → "BATTERY"
  - "steps" → "STEP"
  - "heart_rate" → "HEART"
  - "spo2" → "SPO2"
  - "calories" → "CAL"
  - "distance" → "DISTANCE"
  - "stress" → "STRESS"
  - "pai" → "PAI"
  - "sleep" → "SLEEP"
  - "stand" → "STAND"
  - "fat_burn" → "FAT_BURN"
  - "uvi" → "UVI"
  - "aqi" → "AQI"
  - "humidity" → "HUMIDITY"
  - "weather" → "WEATHER_CURRENT"
  - "sunrise" → "SUN_RISE"
  - "sunset" → "SUN_SET"
  - "wind" → "WIND"
  - "alarm" → "ALARM"
  - "notification" → "NOTIFICATION"
  - "moon" → "MOON"
  - "arc" → infer from context (BATTERY, STEP, etc.)
  - "text" → omit unless clearly bound to data
Required for all data-bound elements.
```

**Add to the schema object definition:**
```json
{
  "fontSize": "number (pixel height of text)",
  "fontFamily": "'sans-serif' | 'serif' | 'monospace' | 'digital' | 'rounded'",
  "dataType": "'BATTERY' | 'STEP' | 'HEART' | 'SPO2' | 'CAL' | 'DISTANCE' | 'STRESS' | 'PAI' | 'SLEEP' | 'STAND' | 'FAT_BURN' | 'UVI' | 'AQI' | 'HUMIDITY' | 'WEATHER_CURRENT' | 'SUN_RISE' | 'SUN_SET' | 'WIND' | 'ALARM' | 'NOTIFICATION' | 'MOON'"
}
```

**Update all 5 examples** to include the new fields. Example:
```json
{ "id": "battery_arc", "type": "battery", "representation": "arc", ..., "fontSize": null, "fontFamily": null, "dataType": "BATTERY" }
{ "id": "steps_text", "type": "steps", "representation": "text", ..., "fontSize": 24, "fontFamily": "sans-serif", "dataType": "STEP" }
```

**Verify:** Build succeeds. AI prompt now instructs model to return fontSize, fontFamily, dataType.

---

### T006 — Update AI_RESPONSE_SCHEMA to include new fields

**File:** `src/pipeline/aiPrompt.ts`

**In `AI_RESPONSE_SCHEMA`** (the JSON schema used for Gemini structured output), add:

```typescript
fontSize: { type: 'NUMBER', nullable: true, description: 'Estimated font size in pixels' },
fontFamily: { type: 'STRING', nullable: true, enum: ['sans-serif', 'serif', 'monospace', 'digital', 'rounded'], description: 'Closest font family match' },
dataType: { type: 'STRING', nullable: true, description: 'Zepp OS data binding type' },
```

**Verify:** Schema validates. AI responses parse correctly with new optional fields.

---

### T007 — Wire new AI fields through pipeline to WatchFaceElement

**File:** `src/pipeline/index.ts` (bridgeToWatchFaceConfig function)

**Currently:** Bridge maps `sourceType` → `dataType` via normalizer. fontSize/fontFamily are lost.

**Add to `resolvedToWatchFaceElement()` mapping:**
```typescript
fontSize: el.fontSize ?? undefined,
font: el.fontFamily ?? undefined,
dataType: el.dataType ?? mapSourceTypeToDataType(el.sourceType),
```

**File:** `src/pipeline/normalizer.ts`

**Pass through** `fontSize`, `fontFamily`, `dataType` from AI element to NormalizedElement if present.

**File:** `src/types/pipeline.ts`

**Add optional fields to `AIElement`:**
```typescript
fontSize?: number;
fontFamily?: string;
dataType?: string;
```

**Add optional fields to `NormalizedElement`:**
```typescript
fontSize?: number;
fontFamily?: string;
```

**Verify:** Generate watchface → check WatchFaceConfig elements have fontSize/font/dataType populated from AI response.

---

## Phase 4: Canvas Preview Fidelity [BUG #2, #12]

### T008 — Render digit images at correct bounds in InteractiveCanvas

**File:** `src/components/InteractiveCanvas.tsx`

**Problem:** IMG_TIME / IMG_DATE / IMG_WEEK / TEXT_IMG draw as text labels ("12:34") at arbitrary font size. Should draw actual digit images scaled to element bounds.

**Approach:** Use the element's `images[]` or `fontArray[]` data URLs. If available, draw image strips. If not, draw placeholder text SCALED TO FIT BOUNDS.

**Find the draw dispatcher** (where element types are switched) and modify IMG_TIME/IMG_DATE/IMG_WEEK/TEXT_IMG cases:

```typescript
// For IMG_TIME, IMG_DATE, IMG_WEEK, TEXT_IMG:
function drawDigitElement(ctx: CanvasRenderingContext2D, el: WatchFaceElement) {
  const { x, y, width: w, height: h } = el.bounds;

  // If digit images available, draw them
  if (el.images && el.images.length > 0) {
    // Determine sample digits to show (e.g., "12:34" for time, "24" for date)
    const sampleDigits = getSampleDigits(el);
    const digitW = Math.floor(w / sampleDigits.length);
    
    sampleDigits.forEach((digitIdx, i) => {
      const imgSrc = el.images![digitIdx];
      if (imgSrc) {
        const img = getCachedImage(imgSrc);
        if (img?.complete) {
          ctx.drawImage(img, x + i * digitW, y, digitW, h);
        }
      }
    });
    return;
  }

  // Fallback: draw placeholder text SCALED to bounds
  const text = getPlaceholderText(el);
  const maxFontSize = Math.min(h * 0.8, w / (text.length * 0.6));
  ctx.font = `bold ${Math.max(10, maxFontSize)}px Arial`;
  ctx.fillStyle = el.color?.startsWith('#') ? el.color : '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + w / 2, y + h / 2, w);
}

function getSampleDigits(el: WatchFaceElement): number[] {
  const name = el.name.toLowerCase();
  if (name.includes('time')) return [1, 2, 3, 4]; // "12:34"
  if (name.includes('date')) return [2, 4];         // "24"
  if (name.includes('month')) return [0, 4];        // "04"
  if (name.includes('week')) return [3];            // "Wed" (index 3)
  return [0, 1, 2];                                 // default
}

function getPlaceholderText(el: WatchFaceElement): string {
  const name = el.name.toLowerCase();
  if (name.includes('time')) return '12:34';
  if (name.includes('date')) return '24';
  if (name.includes('month')) return 'APR';
  if (name.includes('week')) return 'WED';
  if (el.dataType === 'BATTERY') return '85%';
  if (el.dataType === 'STEP') return '8432';
  if (el.dataType === 'HEART') return '72';
  return '123';
}
```

**Key constraint:** Placeholder text MUST fit inside `bounds` rect. Use `ctx.fillText(text, cx, cy, maxWidth)` — the 4th parameter is maxWidth and will compress the text.

**Verify:**
1. Upload design → elements appear in editor
2. Resize IMG_TIME bounds to 150×60 → text "12:34" fits within 150×60, not overflowing
3. If digit images available, they appear at correct size

---

### T009 — Cache digit images for canvas rendering

**File:** `src/components/InteractiveCanvas.tsx`

**Add image cache** (similar to existing icon cache pattern):

```typescript
const digitImageCache = useRef<Map<string, HTMLImageElement>>(new Map());

function getCachedImage(src: string): HTMLImageElement | null {
  const cache = digitImageCache.current;
  if (cache.has(src)) return cache.get(src)!;
  
  const img = new Image();
  img.src = src;
  img.onload = () => requestAnimationFrame(() => draw());
  cache.set(src, img);
  return null; // Will be ready on next frame
}
```

**Verify:** Digit images load asynchronously, canvas re-renders when ready.

---

## Phase 5: Export UX Enhancement [FEATURE #5]

### T010 — Redesign QRDisplay with preview + filename

**File:** `src/components/QRDisplay.tsx`

**Add new props:**
```typescript
interface QRDisplayProps {
  qrCodeDataUrl: string;
  githubUrl: string;
  zpkBlob?: Blob | null;
  filename?: string;
  className?: string;
  previewImageUrl?: string;  // NEW: canvas preview thumbnail
}
```

**New layout structure:**
```tsx
<div className="flex flex-col items-center gap-6">
  {/* Success indicator */}
  ...existing...

  {/* Preview + QR side by side */}
  <div className="flex items-center gap-6">
    {/* Preview thumbnail */}
    {previewImageUrl && (
      <div className="rounded-2xl overflow-hidden border-2 border-white/10">
        <img src={previewImageUrl} alt="Watchface preview" className="w-48 h-48 object-cover" />
      </div>
    )}

    {/* QR Code */}
    <div className="relative">
      ...existing QR code block...
    </div>
  </div>

  {/* File info */}
  <div className="text-center space-y-1">
    <p className="text-white font-medium font-mono text-sm">{filename}</p>
    {zpkBlob && (
      <p className="text-zinc-500 text-xs">{(zpkBlob.size / 1024).toFixed(1)} KB</p>
    )}
  </div>

  {/* Install instructions */}
  ...existing...

  {/* Action buttons */}
  ...existing...
</div>
```

**Verify:** After generation, screen shows preview image (left) + QR (right) + filename below.

---

### T011 — Pass canvas preview to QRDisplay from App.tsx

**File:** `src/App.tsx`

**Add state:**
```typescript
const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
```

**Capture preview** when generation completes (before transitioning to success step):
```typescript
// After ZPK is built, capture canvas preview
const canvas = document.querySelector('canvas') as HTMLCanvasElement;
if (canvas) {
  setPreviewImageUrl(canvas.toDataURL('image/png'));
}
```

**Pass to QRDisplay:**
```tsx
<QRDisplay
  ...existing props...
  previewImageUrl={previewImageUrl ?? undefined}
/>
```

**Verify:** Generate watchface → success screen shows miniature preview of the design.

---

## Phase 6: Widget App Shortcuts [FEATURE #4]

### T012 — Add clickAction to WatchFaceElement type

**File:** `src/types/index.ts`

**Add to `WatchFaceElement` interface:**
```typescript
clickAction?: string;  // Native app shortcut: 'HeartRate', 'Sport', 'Weather', etc.
```

**Verify:** TypeScript compiles. No type errors.

---

### T013 — Add shortcut dropdown to PropertyPanel

**File:** `src/components/PropertyPanel.tsx`

**Add constant:**
```typescript
const APP_SHORTCUTS = [
  { value: '', label: '— none —' },
  { value: 'HeartRate', label: 'Heart Rate' },
  { value: 'Sport', label: 'Exercise' },
  { value: 'Weather', label: 'Weather' },
  { value: 'Alarm', label: 'Alarm' },
  { value: 'Settings', label: 'Settings' },
  { value: 'Music', label: 'Music' },
  { value: 'Notification', label: 'Notifications' },
  { value: 'StopWatch', label: 'Stopwatch' },
  { value: 'Timer', label: 'Timer' },
  { value: 'Compass', label: 'Compass' },
  { value: 'Barometer', label: 'Barometer' },
  { value: 'WorldClock', label: 'World Clock' },
];
```

**Add section** (after DataType section, before Layer section):
```tsx
<Section label="App Shortcut">
  <select
    value={element.clickAction ?? ''}
    onChange={e => update({ clickAction: e.target.value || undefined })}
    className="w-full h-7 rounded-md text-xs bg-white/5 border border-white/10 text-white px-2 cursor-pointer"
  >
    {APP_SHORTCUTS.map(s => (
      <option key={s.value} value={s.value}>{s.label}</option>
    ))}
  </select>
</Section>
```

**Verify:** Select any element → App Shortcut dropdown visible → select "Heart Rate" → element.clickAction = "HeartRate".

---

### T014 — Emit click_func in code generator

**File:** `src/lib/jsCodeGeneratorV2.ts`

**In `generateWidgetCodeV2()`** — after the widget creation code, if `element.clickAction` is set, add click handler:

```typescript
// Add helper function:
function generateClickFunc(element: WatchFaceElement): string {
  if (!element.clickAction) return '';
  return `
                widget_${widgetIndex}.addEventListener(hmUI.event.CLICK_UP, () => {
                    hmApp.startApp({ url: '${element.clickAction}', native: true });
                });`;
}
```

**Apply:** Append `generateClickFunc(element)` result after every widget creation return string.

**Alternative approach — use click_func inline:**
For each widget that supports click_func, add it as a property:
```javascript
hmUI.createWidget(hmUI.widget.IMG, {
    x: px(100), y: px(200), w: px(50), h: px(50),
    src: 'heart_icon.png',
    show_level: hmUI.show_level.ONLY_NORMAL
});
// Then register click event separately (Zepp OS pattern):
widget_N.addEventListener(hmUI.event.CLICK_UP, function() {
    hmApp.startApp({ url: 'HeartRate', native: true });
});
```

**Verify:** Generate ZPK with shortcut → check generated code → `addEventListener` + `hmApp.startApp` present for that widget.

---

## Phase 7: Undo/Redo [FEATURE #8]

### T015 — Add undo/redo state to AppContext

**File:** `src/context/AppContext.tsx`

**Add to `AppState`:**
```typescript
undoStack: WatchFaceElement[][];
redoStack: WatchFaceElement[][];
```

**Initial state:**
```typescript
undoStack: [],
redoStack: [],
```

**Add actions:**
```typescript
| { type: 'UNDO' }
| { type: 'REDO' }
```

**Modify `UPDATE_ELEMENT` / `UPDATE_ELEMENTS_BATCH` handlers in reducer:**
```typescript
case 'UPDATE_ELEMENT': {
  const currentElements = state.watchFaceConfig?.elements ?? [];
  const newUndoStack = [...state.undoStack, structuredClone(currentElements)].slice(-30);
  // ... apply the update as before ...
  return {
    ...newState,
    undoStack: newUndoStack,
    redoStack: [], // Clear redo on new edit
  };
}
```

**Add UNDO handler:**
```typescript
case 'UNDO': {
  if (state.undoStack.length === 0 || !state.watchFaceConfig) return state;
  const previousElements = state.undoStack[state.undoStack.length - 1];
  const currentElements = structuredClone(state.watchFaceConfig.elements);
  return {
    ...state,
    watchFaceConfig: { ...state.watchFaceConfig, elements: previousElements },
    undoStack: state.undoStack.slice(0, -1),
    redoStack: [...state.redoStack, currentElements].slice(-30),
  };
}
```

**Add REDO handler:**
```typescript
case 'REDO': {
  if (state.redoStack.length === 0 || !state.watchFaceConfig) return state;
  const nextElements = state.redoStack[state.redoStack.length - 1];
  const currentElements = structuredClone(state.watchFaceConfig.elements);
  return {
    ...state,
    watchFaceConfig: { ...state.watchFaceConfig, elements: nextElements },
    undoStack: [...state.undoStack, currentElements].slice(-30),
    redoStack: state.redoStack.slice(0, -1),
  };
}
```

**Verify:** Drag element → Ctrl+Z → element returns to original position. Ctrl+Y → moves back.

---

### T016 — Add keyboard listener for Ctrl+Z / Ctrl+Y

**File:** `src/App.tsx`

**Add useEffect:**
```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      dispatch({ type: 'UNDO' });
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
      e.preventDefault();
      dispatch({ type: 'REDO' });
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [dispatch]);
```

**Also add Undo/Redo buttons** in the editor toolbar (near the grid toggle):
```tsx
<button
  onClick={() => dispatch({ type: 'UNDO' })}
  disabled={state.undoStack.length === 0}
  className="p-2 rounded-lg border text-xs bg-white/5 border-white/10 text-white/40 disabled:opacity-30"
  title="Undo (Ctrl+Z)"
>
  <Undo2 className="h-4 w-4" />
</button>
<button
  onClick={() => dispatch({ type: 'REDO' })}
  disabled={state.redoStack.length === 0}
  className="p-2 rounded-lg border text-xs bg-white/5 border-white/10 text-white/40 disabled:opacity-30"
  title="Redo (Ctrl+Y)"
>
  <Redo2 className="h-4 w-4" />
</button>
```

**Import:** `Undo2, Redo2` from lucide-react.

**Verify:** Ctrl+Z undoes. Ctrl+Y redoes. Buttons disable when stack empty.

---

## Phase 8: Icon Library Expansion [FEATURE #11]

### T017 — Add category field and new icons to iconLibrary

**File:** `src/lib/iconLibrary.ts`

**Update `IconEntry` interface:**
```typescript
export interface IconEntry {
  key: string;
  label: string;
  category: 'health' | 'activity' | 'environment' | 'system' | 'time';
  dataUrl: string;
  width: number;
  height: number;
}
```

**Add category to all existing 20 icons.** Then add ~30 new icons:

**Activity category (new):**
- `running` — running person silhouette
- `cycling` — bicycle shape
- `swimming` — swimmer silhouette

**Environment category (new):**
- `weather_rain` — cloud with rain drops
- `weather_snow` — cloud with snowflakes
- `temperature` — thermometer
- `wind` — wind lines
- `barometer` — pressure gauge circle

**System category (new):**
- `battery_low` — battery with exclamation
- `wifi` — wifi signal arcs
- `settings` — gear icon
- `dnd` — do not disturb (moon in circle)
- `airplane` — airplane silhouette

**Time category (new):**
- `sunrise` — sun rising over horizon
- `sunset` — sun setting below horizon
- `stopwatch` — stopwatch circle with hand
- `timer` — hourglass shape
- `world_clock` — globe with clock hands

Each icon: 48×48 canvas-drawn procedural shape, same pattern as existing icons.

**Verify:** `getIconLibrary()` returns 50+ icons. Icons grouped by category.

---

### T018 — Update PropertyPanel icon picker with category grouping

**File:** `src/components/PropertyPanel.tsx`

**Current icon picker:** Flat grid of all icons.

**New layout:** Category headers above grouped icons.

```tsx
{/* Icon Picker */}
{element.type === 'IMG' && (
  <Section label="Icon">
    <div className="space-y-2 max-h-48 overflow-y-auto">
      {['health', 'activity', 'environment', 'system', 'time'].map(cat => {
        const icons = allIcons.filter(i => i.category === cat);
        if (icons.length === 0) return null;
        return (
          <div key={cat}>
            <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">
              {cat}
            </p>
            <div className="grid grid-cols-6 gap-1">
              {icons.map(icon => (
                <button
                  key={icon.key}
                  onClick={() => update({ iconKey: icon.key })}
                  className={cn(
                    'p-1 rounded border',
                    element.iconKey === icon.key
                      ? 'border-cyan-500 bg-cyan-500/20'
                      : 'border-white/10 hover:border-white/30'
                  )}
                  title={icon.label}
                >
                  <img src={icon.dataUrl} alt={icon.label} className="w-6 h-6" />
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  </Section>
)}
```

**Verify:** Open icon picker on IMG element → see categories with headers → icons grouped.

---

## Phase 9: Font Library Expansion [FEATURE #9]

### T019 — Add Google Fonts CSS import

**File:** `index.html`

**Add to `<head>`:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Roboto+Mono:wght@400;700&family=Orbitron:wght@400;700&family=Oswald:wght@400;700&family=Bebas+Neue&family=Rajdhani:wght@400;700&family=Share+Tech+Mono&family=Goldman:wght@400;700&family=Russo+One&family=Audiowide&family=Rationale&family=Black+Ops+One&display=swap" rel="stylesheet">
```

**Verify:** Fonts load. Check Network tab — Google Fonts CSS returns 200.

---

### T020 — Expand FONT_STYLES array

**File:** `src/lib/fontLibrary.ts`

**Add 12 new font styles** (keeping all 8 existing):

```typescript
// NEW entries to add after existing 8:
{ key: 'roboto', label: 'Roboto', fontFamily: 'Roboto', fontWeight: '700', color: '#FFFFFF' },
{ key: 'roboto-mono', label: 'Roboto Mono', fontFamily: 'Roboto Mono', fontWeight: '400', color: '#E0E0E0' },
{ key: 'orbitron', label: 'Orbitron', fontFamily: 'Orbitron', fontWeight: '700', color: '#00D4FF' },
{ key: 'oswald', label: 'Oswald', fontFamily: 'Oswald', fontWeight: '700', color: '#FFFFFF' },
{ key: 'bebas', label: 'Bebas Neue', fontFamily: 'Bebas Neue', fontWeight: '400', color: '#FFD700' },
{ key: 'rajdhani', label: 'Rajdhani', fontFamily: 'Rajdhani', fontWeight: '700', color: '#00FF88' },
{ key: 'share-tech', label: 'Share Tech', fontFamily: 'Share Tech Mono', fontWeight: '400', color: '#33FF33' },
{ key: 'goldman', label: 'Goldman', fontFamily: 'Goldman', fontWeight: '700', color: '#FF9F43' },
{ key: 'russo', label: 'Russo One', fontFamily: 'Russo One', fontWeight: '400', color: '#FFFFFF' },
{ key: 'audiowide', label: 'Audiowide', fontFamily: 'Audiowide', fontWeight: '400', color: '#4A9EFF' },
{ key: 'rationale', label: 'Rationale', fontFamily: 'Rationale', fontWeight: '400', color: '#C0C0C0' },
{ key: 'black-ops', label: 'Black Ops One', fontFamily: 'Black Ops One', fontWeight: '400', color: '#FF4444' },
```

**Total:** 20 font styles.

**Verify:** Font picker shows 20 options. Each renders correctly in preview.

---

## Phase 10: Font Picker Hover Preview [FEATURE #10]

### T021 — Add hover preview to font picker in PropertyPanel

**File:** `src/components/PropertyPanel.tsx`

**Current font picker:** Grid of font style previews. Click to select.

**Add hover behavior:**
```tsx
const [hoveredFont, setHoveredFont] = useState<string | null>(null);

// In the font picker grid:
{fontStyles.map(style => (
  <button
    key={style.key}
    onClick={() => update({ fontStyle: style.key })}
    onMouseEnter={() => setHoveredFont(style.key)}
    onMouseLeave={() => setHoveredFont(null)}
    className={cn(
      'p-1 rounded border text-center',
      element.fontStyle === style.key
        ? 'border-cyan-500 bg-cyan-500/20'
        : hoveredFont === style.key
          ? 'border-yellow-500 bg-yellow-500/10'
          : 'border-white/10 hover:border-white/30'
    )}
    title={style.label}
  >
    <span style={{ fontFamily: style.fontFamily, fontWeight: style.fontWeight, color: style.color, fontSize: '12px' }}>
      12:34
    </span>
    <p className="text-[8px] text-white/40 mt-0.5">{style.label}</p>
  </button>
))}

{/* Hover preview tooltip */}
{hoveredFont && (
  <div className="mt-2 p-3 rounded-lg bg-black/50 border border-yellow-500/30 text-center">
    <span style={{
      fontFamily: getFontStyle(hoveredFont).fontFamily,
      fontWeight: getFontStyle(hoveredFont).fontWeight,
      color: getFontStyle(hoveredFont).color,
      fontSize: '28px',
    }}>
      12:34
    </span>
    <p className="text-[10px] text-white/50 mt-1">{getFontStyle(hoveredFont).label}</p>
  </div>
)}
```

**Verify:** Hover over font → highlighted in yellow border + large preview shown below grid. Move mouse away → reverts.

---

## Phase 11: Curved Text [FEATURE #7]

### T022 — Add curvedText fields to WatchFaceElement

**File:** `src/types/index.ts`

**Add to `WatchFaceElement` interface:**
```typescript
curvedText?: {
  radius: number;      // Arc radius for text path
  startAngle: number;  // Start angle in degrees  
  endAngle: number;    // End angle in degrees
};
```

**Verify:** TypeScript compiles.

---

### T023 — Add curved text toggle to PropertyPanel

**File:** `src/components/PropertyPanel.tsx`

**Show only for TEXT elements:**
```tsx
{element.type === 'TEXT' && (
  <Section label="Curved Text">
    <div className="flex items-center gap-2 mb-2">
      <input
        type="checkbox"
        checked={!!element.curvedText}
        onChange={e => {
          if (e.target.checked) {
            update({ curvedText: { radius: 180, startAngle: -45, endAngle: 45 } });
          } else {
            update({ curvedText: undefined });
          }
        }}
        className="rounded"
      />
      <span className="text-xs text-white/60">Enable arc text</span>
    </div>
    {element.curvedText && (
      <div className="space-y-2">
        <NumField label="Radius" value={element.curvedText.radius} onChange={v => update({ curvedText: { ...element.curvedText!, radius: v } })} />
        <NumField label="Start°" value={element.curvedText.startAngle} onChange={v => update({ curvedText: { ...element.curvedText!, startAngle: v } })} />
        <NumField label="End°" value={element.curvedText.endAngle} onChange={v => update({ curvedText: { ...element.curvedText!, endAngle: v } })} />
      </div>
    )}
  </Section>
)}
```

**Verify:** Select TEXT element → "Curved Text" section appears → check box → radius/angle controls appear.

---

### T024 — Draw curved text on InteractiveCanvas

**File:** `src/components/InteractiveCanvas.tsx`

**Add function:**
```typescript
function drawCurvedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  centerY: number,
  radius: number,
  startAngleDeg: number,
  endAngleDeg: number,
  fontSize: number,
  color: string
) {
  const startAngle = (startAngleDeg * Math.PI) / 180;
  const endAngle = (endAngleDeg * Math.PI) / 180;
  const totalAngle = endAngle - startAngle;
  const anglePerChar = totalAngle / Math.max(text.length - 1, 1);

  ctx.save();
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (let i = 0; i < text.length; i++) {
    const angle = startAngle + i * anglePerChar;
    const charX = centerX + radius * Math.cos(angle);
    const charY = centerY + radius * Math.sin(angle);

    ctx.save();
    ctx.translate(charX, charY);
    ctx.rotate(angle + Math.PI / 2); // Rotate char to follow arc
    ctx.fillText(text[i], 0, 0);
    ctx.restore();
  }

  ctx.restore();
}
```

**In draw dispatcher** — when element is TEXT and has curvedText:
```typescript
if (el.type === 'TEXT' && el.curvedText) {
  const cx = el.center?.x ?? 240;
  const cy = el.center?.y ?? 240;
  drawCurvedText(
    ctx,
    el.text ?? el.name,
    cx, cy,
    el.curvedText.radius,
    el.curvedText.startAngle,
    el.curvedText.endAngle,
    el.fontSize ?? 16,
    el.color?.startsWith('#') ? el.color : '#FFFFFF'
  );
  return; // Skip normal text draw
}
```

**Verify:** Enable curved text on TEXT element → canvas shows text following arc path.

---

### T025 — Generate curved text as PNG asset for ZPK

**File:** `src/pipeline/assetImageGenerator.ts`

**Add function:**
```typescript
function generateCurvedTextImage(
  text: string,
  radius: number,
  startAngleDeg: number,
  endAngleDeg: number,
  fontSize: number,
  color: string
): string {
  const size = (radius + fontSize) * 2 + 20;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const cx = size / 2;
  const cy = size / 2;

  // Draw curved text (same algorithm as InteractiveCanvas)
  const startAngle = (startAngleDeg * Math.PI) / 180;
  const endAngle = (endAngleDeg * Math.PI) / 180;
  const totalAngle = endAngle - startAngle;
  const anglePerChar = totalAngle / Math.max(text.length - 1, 1);

  ctx.font = `bold ${fontSize}px Arial`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (let i = 0; i < text.length; i++) {
    const angle = startAngle + i * anglePerChar;
    const charX = cx + radius * Math.cos(angle);
    const charY = cy + radius * Math.sin(angle);
    ctx.save();
    ctx.translate(charX, charY);
    ctx.rotate(angle + Math.PI / 2);
    ctx.fillText(text[i], 0, 0);
    ctx.restore();
  }

  return canvas.toDataURL('image/png');
}
```

**In `generatePipelineAssets()`** — add curved text generation block:
```typescript
// Generate curved text images
for (const el of elements) {
  if (el.widget === 'TEXT' && el.curvedText) {
    const filename = `curved_text_${el.id}.png`;
    assets.push({
      filename,
      dataUrl: generateCurvedTextImage(
        el.text ?? el.name ?? 'TEXT',
        el.curvedText.radius,
        el.curvedText.startAngle,
        el.curvedText.endAngle,
        el.fontSize ?? 16,
        el.color ?? '#FFFFFF'
      ),
    });
    // Override widget to IMG with this asset
    el.widget = 'IMG' as any;
    el.assets = { ...el.assets, src: filename };
  }
}
```

**Effect:** On device, curved text appears as a pre-rendered image. No native curved text widget needed.

**Verify:** Generate ZPK with curved text → extract → `curved_text_*.png` exists → install → text visible along arc.

---

## Phase 12: Final Verification & Deployment

### T026 — Full integration test

**Steps:**
1. `npm run build` — must succeed with 0 errors
2. Generate test watchface with:
   - At least 2 ARC_PROGRESS elements (battery + steps)
   - At least 1 IMG_TIME element
   - At least 1 icon element (heart icon)
   - At least 1 text element
3. Extract generated ZPK:
   - Check `watchface/index.js` → ARC uses `px()` on center_x, center_y, radius, line_width
   - Check `watchface/index.js` → ARC does NOT use `px()` on start_angle, end_angle
   - Check `assets/` → all icon files present
   - Check `assets/` → digit images present
4. Install on device → arcs visible, icons visible, text positioned correctly
5. Editor test:
   - Ctrl+Z undoes drag
   - Ctrl+Y redoes
   - Font picker shows 20 styles
   - Icon picker shows categories
   - App shortcut dropdown works
   - Export screen shows preview + QR + filename

### T027 — Deploy to GitHub Pages

Follow deployment protocol:
```bash
npm run build
Copy-Item dist/* docs/ -Recurse -Force
git add docs/
git commit -m "Deploy: Spec 009 — arc px fix, icon ZPK, AI enrichment, undo, shortcuts, export UX"
git push
```

**Verify:** Hard refresh → generate test → extract ZPK → all fixes present.

---

## Task Summary

| Task | Phase | Priority | Files Modified |
|------|-------|----------|---------------|
| T001 | 1 | P0-CRITICAL | jsCodeGeneratorV2.ts |
| T002 | 1 | P0-CRITICAL | jsCodeGeneratorV2.ts |
| T003 | 2 | P0-CRITICAL | assetImageGenerator.ts |
| T004 | 2 | P0-CRITICAL | assetResolver.ts |
| T005 | 3 | P1-HIGH | aiPrompt.ts |
| T006 | 3 | P1-HIGH | aiPrompt.ts |
| T007 | 3 | P1-HIGH | pipeline/index.ts, normalizer.ts, types/pipeline.ts |
| T008 | 4 | P1-HIGH | InteractiveCanvas.tsx |
| T009 | 4 | P1-HIGH | InteractiveCanvas.tsx |
| T010 | 5 | P2-MEDIUM | QRDisplay.tsx |
| T011 | 5 | P2-MEDIUM | App.tsx |
| T012 | 6 | P2-MEDIUM | types/index.ts |
| T013 | 6 | P2-MEDIUM | PropertyPanel.tsx |
| T014 | 6 | P2-MEDIUM | jsCodeGeneratorV2.ts |
| T015 | 7 | P2-MEDIUM | AppContext.tsx |
| T016 | 7 | P2-MEDIUM | App.tsx |
| T017 | 8 | P3-LOW | iconLibrary.ts |
| T018 | 8 | P3-LOW | PropertyPanel.tsx |
| T019 | 9 | P3-LOW | index.html |
| T020 | 9 | P3-LOW | fontLibrary.ts |
| T021 | 10 | P3-LOW | PropertyPanel.tsx |
| T022 | 11 | P3-LOW | types/index.ts |
| T023 | 11 | P3-LOW | PropertyPanel.tsx |
| T024 | 11 | P3-LOW | InteractiveCanvas.tsx |
| T025 | 11 | P3-LOW | assetImageGenerator.ts |
| T026 | 12 | P0-CRITICAL | — (testing) |
| T027 | 12 | P0-CRITICAL | — (deployment) |
