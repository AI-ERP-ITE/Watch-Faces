# Tasks 008: Editor Fidelity — Position Accuracy, Grid, Icons, Fonts, Type Switching

---

## Phase 1: Fix Arc Position in PropertyPanel

### T001 — PropertyPanel: Show center.x/y for ARC_PROGRESS elements

**File:** `src/components/PropertyPanel.tsx`

**Current code (Position section, lines ~56-58):**
```tsx
<NumField label="X" value={element.bounds.x} onChange={setX} />
<NumField label="Y" value={element.bounds.y} onChange={setY} />
```

**Change:** For ARC_PROGRESS and TIME_POINTER, Position section edits `center` instead of `bounds`:

```tsx
// Before the Position section, add conditional logic:
const isCentered = element.type === 'ARC_PROGRESS' || element.type === 'TIME_POINTER';

// Position section:
{isCentered ? (
  <FieldRow>
    <NumField label="CX" value={element.center?.x ?? 240} onChange={v => update({ center: { x: clamp(v, 0, 480), y: element.center?.y ?? 240 } })} />
    <NumField label="CY" value={element.center?.y ?? 240} onChange={v => update({ center: { x: element.center?.x ?? 240, y: clamp(v, 0, 480) } })} />
  </FieldRow>
) : (
  <FieldRow>
    <NumField label="X" value={element.bounds.x} onChange={setX} />
    <NumField label="Y" value={element.bounds.y} onChange={setY} />
  </FieldRow>
)}
```

**Also:** Remove the duplicate "Arc Center" section (CX/CY) that currently exists under `{element.type === 'ARC_PROGRESS' && ...}`. The main Position section now handles it.

**Verify:** Build passes. Select ARC → Position shows CX/CY with correct values. Edit CX → arc moves on canvas.

---

### T002 — PropertyPanel: Hide W/H for ARC_PROGRESS elements

**File:** `src/components/PropertyPanel.tsx`

ARC bounds are always 480×480 (full screen container). W/H editing makes no sense for arcs.

**Change:** Hide Size section when `isCentered`:

```tsx
{!isCentered && (
  <Section label="Size">
    <FieldRow>
      <NumField label="W" value={element.bounds.width} onChange={setW} />
      <NumField label="H" value={element.bounds.height} onChange={setH} />
    </FieldRow>
  </Section>
)}
```

**Verify:** ARC selected → no W/H fields. IMG selected → W/H fields visible.

---

## Phase 2: Grid Overlay Toggle

### T003 — Add showGrid state to App.tsx

**File:** `src/App.tsx`

**Add state** (near other useState declarations inside App function):
```tsx
const [showGrid, setShowGrid] = useState(false);
```

**Add toggle button** in the preview case, before the `<InteractiveCanvas>`:
```tsx
<button
  onClick={() => setShowGrid(g => !g)}
  className={cn(
    'p-2 rounded-lg border text-xs transition-colors',
    showGrid ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-white/5 border-white/10 text-white/40'
  )}
  title="Toggle grid"
>
  <Grid3x3 className="h-4 w-4" />
</button>
```

**Import:** Add `Grid3x3` from lucide-react.

**Pass to InteractiveCanvas:**
```tsx
<InteractiveCanvas
  ...existing props...
  showGrid={showGrid}
/>
```

**Verify:** Button renders. Clicking toggles state.

---

### T004 — Draw grid overlay on InteractiveCanvas

**File:** `src/components/InteractiveCanvas.tsx`

**Add prop:**
```tsx
showGrid?: boolean;
```

**Add drawGrid function** (call after drawBackground, before drawElements):
```tsx
function drawGrid(ctx: CanvasRenderingContext2D) {
  const STEP = 48; // 480/10 = 48px per division
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  for (let i = STEP; i < CANVAS_SIZE; i += STEP) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, CANVAS_SIZE); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(CANVAS_SIZE, i); ctx.stroke();
  }
  // Center crosshair slightly brighter
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.beginPath(); ctx.moveTo(CX, 0); ctx.lineTo(CX, CANVAS_SIZE); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, CY); ctx.lineTo(CX_SIZE, CY); ctx.stroke(); // fix: CANVAS_SIZE not CX_SIZE
  ctx.restore();
}
```

**In draw() function:** After background, before elements:
```tsx
if (showGridRef.current) drawGrid(ctx);
```

**Use ref** for showGrid to avoid dependency in draw callback:
```tsx
const showGridRef = useRef(showGrid);
useEffect(() => { showGridRef.current = showGrid; draw(); }, [showGrid, draw]);
```

**Verify:** Toggle grid → lines appear/disappear. Grid does not affect click/drag hit testing. Grid lines are subtle (0.08 opacity).

---

## Phase 3: DataType Dropdown for All Elements

### T005 — Show DataType dropdown for all element types

**File:** `src/components/PropertyPanel.tsx`

**Current:** DataType dropdown only inside `{element.type === 'ARC_PROGRESS' && ...}` block.

**Move:** Extract DataType dropdown into a standalone section shown for all elements that could have a dataType.

```tsx
{/* DataType — shown for all data-bindable elements */}
{['ARC_PROGRESS', 'TEXT_IMG', 'IMG', 'IMG_LEVEL', 'TEXT', 'CIRCLE', 'IMG_STATUS'].includes(element.type) && (
  <Section label="Data Type">
    <select
      value={element.dataType ?? ''}
      onChange={e => update({ dataType: e.target.value || undefined })}
      className="w-full h-7 rounded-md text-xs bg-white/5 border border-white/10 text-white px-2 cursor-pointer"
    >
      <option value="">— none —</option>
      {DATA_TYPES.map(dt => (
        <option key={dt} value={dt}>{dt}</option>
      ))}
    </select>
  </Section>
)}
```

**Add constant** at top of file:
```tsx
const DATA_TYPES = [
  'BATTERY', 'STEP', 'HEART', 'SPO2', 'CAL', 'DISTANCE',
  'STRESS', 'PAI', 'SLEEP', 'STAND', 'FAT_BURN',
  'UVI', 'AQI', 'HUMIDITY', 'SUN_RISE', 'SUN_SET',
  'WIND', 'ALARM', 'NOTIFICATION', 'MOON',
  'WEATHER_CURRENT',
];
```

**Remove:** The old DataType `<Section>` from the ARC-specific block (avoid duplicate).

**Verify:** Select TEXT_IMG → dataType dropdown visible with 21 options. Select IMG → same. ARC still shows it too.

---

## Phase 4: Widget Type Dropdown

### T006 — Add widget type dropdown to PropertyPanel

**File:** `src/components/PropertyPanel.tsx`

**Add** as FIRST section in the panel (above Position):

```tsx
<Section label="Widget Type">
  <select
    value={element.type}
    onChange={e => handleTypeChange(e.target.value as WatchFaceElement['type'])}
    className="w-full h-7 rounded-md text-xs bg-white/5 border border-white/10 text-white px-2 cursor-pointer"
  >
    {WIDGET_TYPES.map(wt => (
      <option key={wt} value={wt}>{TYPE_LABELS[wt] ?? wt}</option>
    ))}
  </select>
</Section>
```

**Add constant:**
```tsx
const WIDGET_TYPES: WatchFaceElement['type'][] = [
  'ARC_PROGRESS', 'TIME_POINTER', 'TEXT_IMG', 'IMG', 'TEXT',
  'IMG_LEVEL', 'IMG_STATUS', 'CIRCLE', 'BUTTON',
];
```

**Note:** Exclude `IMG_TIME`, `IMG_DATE`, `IMG_WEEK` from manual switching — these are time-specific and handled by pipeline only.

### T007 — Implement handleTypeChange with defaults

**File:** `src/components/PropertyPanel.tsx`

```tsx
const handleTypeChange = (newType: WatchFaceElement['type']) => {
  if (newType === element.type) return;
  const changes: Partial<WatchFaceElement> = { type: newType };

  // Initialize type-specific defaults
  switch (newType) {
    case 'ARC_PROGRESS':
      changes.center = element.center ?? { x: 240, y: 240 };
      changes.radius = element.radius ?? 100;
      changes.startAngle = element.startAngle ?? 135;
      changes.endAngle = element.endAngle ?? 345;
      changes.lineWidth = element.lineWidth ?? 8;
      changes.color = element.color ?? '0x00FF00';
      break;
    case 'TIME_POINTER':
      changes.center = { x: 240, y: 240 };
      changes.hourPos = { x: 11, y: 70 };
      changes.minutePos = { x: 8, y: 100 };
      changes.secondPos = { x: 3, y: 120 };
      break;
    case 'TEXT':
      changes.fontSize = element.fontSize ?? 20;
      changes.color = element.color ?? '0xFFFFFFFF';
      changes.text = element.text ?? '';
      break;
    case 'CIRCLE':
      changes.center = element.center ?? { x: element.bounds.x + element.bounds.width / 2, y: element.bounds.y + element.bounds.height / 2 };
      changes.radius = element.radius ?? Math.min(element.bounds.width, element.bounds.height) / 2;
      changes.color = element.color ?? '0xFFFFFF';
      break;
    // IMG, TEXT_IMG, IMG_LEVEL, IMG_STATUS, BUTTON — no extra defaults needed
  }

  update(changes);
};
```

**Verify:** Change ARC to TEXT → type updates in state. Change back → arc defaults restored. Code gen routes to correct widget function.

---

## Phase 5: Icon Library + Icon Picker

### T008 — Create icon library

**File:** `src/lib/iconLibrary.ts` (NEW)

Create 20 canvas-drawn icons at 48×48px. Each icon is a simple canvas shape.

```typescript
export interface IconEntry {
  key: string;
  label: string;
  dataUrl: string;
  width: number;
  height: number;
}

function drawIcon(draw: (ctx: CanvasRenderingContext2D, s: number) => void): string {
  const s = 48;
  const canvas = document.createElement('canvas');
  canvas.width = s; canvas.height = s;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, s, s);
  draw(ctx, s);
  return canvas.toDataURL('image/png');
}
```

**Icons to draw (key → shape):**

| Key | Shape Description |
|-----|-------------------|
| `battery` | Green rounded rect with fill level |
| `heart` | Red heart (bezier curves) |
| `steps` | Orange shoe/footprint |
| `calories` | Orange flame |
| `spo2` | Cyan "O₂" text |
| `distance` | Blue map pin |
| `stress` | Purple wave line |
| `sleep` | Indigo moon + Zzz |
| `alarm` | Yellow bell |
| `bluetooth` | Blue bluetooth rune |
| `weather_sun` | Yellow circle + rays |
| `weather_cloud` | Gray cloud shape |
| `notification` | Red bell + dot |
| `moon` | Silver crescent |
| `pai` | Red "P" circle badge |
| `stand` | Green standing person |
| `fat_burn` | Orange flame + droplet |
| `uvi` | Yellow "UV" text |
| `aqi` | Green leaf |
| `humidity` | Blue water droplet |

**Export:**
```typescript
let _cache: IconEntry[] | null = null;
export function getIconLibrary(): IconEntry[] {
  if (!_cache) _cache = generateAllIcons();
  return _cache;
}
export function getIconByKey(key: string): IconEntry | undefined {
  return getIconLibrary().find(i => i.key === key);
}
export const ICON_KEYS = [ ... ]; // all 20 keys
```

**Verify:** Import in test → `getIconLibrary()` returns 20 entries. Each has valid data URL.

---

### T009 — Add iconKey to WatchFaceElement type

**File:** `src/types/index.ts`

**Add to WatchFaceElement interface:**
```typescript
iconKey?: string;        // key into icon library, e.g. 'battery', 'heart'
```

**Verify:** Build passes. No usage yet — just type addition.

---

### T010 — Icon picker in PropertyPanel

**File:** `src/components/PropertyPanel.tsx`

**Add section** for IMG elements:

```tsx
{element.type === 'IMG' && (
  <Section label="Icon">
    <div className="grid grid-cols-5 gap-1.5">
      <button
        onClick={() => update({ iconKey: undefined })}
        className={cn('w-9 h-9 rounded border text-[8px] text-white/40',
          !element.iconKey ? 'border-cyan-500 bg-cyan-500/20' : 'border-white/10 bg-white/5'
        )}
      >
        None
      </button>
      {getIconLibrary().map(icon => (
        <button
          key={icon.key}
          onClick={() => update({ iconKey: icon.key })}
          className={cn('w-9 h-9 rounded border overflow-hidden',
            element.iconKey === icon.key ? 'border-cyan-500 bg-cyan-500/20' : 'border-white/10 bg-white/5'
          )}
          title={icon.label}
        >
          <img src={icon.dataUrl} alt={icon.label} className="w-full h-full object-contain" />
        </button>
      ))}
    </div>
  </Section>
)}
```

**Import:** `import { getIconLibrary } from '@/lib/iconLibrary';`

**Verify:** Select IMG element → grid of 20 icons + "None". Click heart → `iconKey` set. Cyan border on selected.

---

### T011 — Render icons on InteractiveCanvas

**File:** `src/components/InteractiveCanvas.tsx`

**In the element rendering section**, when drawing IMG element:

```tsx
// Inside drawElements(), for IMG elements:
if (el.type === 'IMG' && el.iconKey) {
  // Draw icon from library
  const iconImg = iconImageCache.current.get(el.iconKey);
  if (iconImg) {
    ctx.drawImage(iconImg, el.bounds.x, el.bounds.y, el.bounds.width, el.bounds.height);
  } else {
    // Load icon image and cache
    const iconEntry = getIconByKey(el.iconKey);
    if (iconEntry) {
      const img = new Image();
      img.onload = () => { iconImageCache.current.set(el.iconKey!, img); draw(); };
      img.src = iconEntry.dataUrl;
    }
  }
  return; // skip placeholder rectangle
}
```

**Add ref:**
```tsx
const iconImageCache = useRef(new Map<string, HTMLImageElement>());
```

**Import:** `import { getIconByKey } from '@/lib/iconLibrary';`

**Verify:** Select IMG → pick heart icon → canvas shows heart at element bounds. Resize → icon scales.

---

### T012 — Wire icon assets into ZPK generation

**File:** `src/pipeline/assetImageGenerator.ts`

**In `generatePipelineAssets()`**, add case for elements with `iconKey`:

```typescript
// After existing widget cases, before returning:
// Check all elements for iconKey — add icon PNGs to asset bundle
for (const el of elements) {
  // Find matching WatchFaceElement to check iconKey
  // iconKey is on WatchFaceElement, not ResolvedElement — need to pass through
}
```

**Problem:** `ResolvedElement` doesn't have `iconKey`. Need to pass through from `WatchFaceElement`.

**Alternative approach (simpler):** In `handleRegenerateDownload` (App.tsx), after building ZPK from current config, the `buildZPK` already reads `config.elements`. The `generateWatchFaceCode` reads each element. For IMG elements with `iconKey`:
- Code gen outputs `hmUI.widget.IMG` with `src: 'icon_{iconKey}.png'`
- Asset bundle needs the matching PNG

**Solution:** In `handleRegenerateDownload` and `handleGenerate`, before calling `buildZPK`, inject icon images into `elementFiles`:

```typescript
// After existing elementFiles construction:
for (const el of state.watchFaceConfig.elements) {
  if (el.iconKey) {
    const iconEntry = getIconByKey(el.iconKey);
    if (iconEntry) {
      const filename = `icon_${el.iconKey}.png`;
      // Convert data URL to File
      const parts = iconEntry.dataUrl.split(',');
      const bstr = atob(parts[1]);
      const u8 = new Uint8Array(bstr.length);
      for (let i = 0; i < bstr.length; i++) u8[i] = bstr.charCodeAt(i);
      elementFiles.push({ src: filename, file: new File([u8], filename, { type: 'image/png' }) });
    }
  }
}
```

**Also modify** `jsCodeGeneratorV2.ts` to use `icon_{iconKey}.png` as src for IMG elements with iconKey:

In `generateWidgetCodeV2()` IMG handling section:
```typescript
// When element has iconKey, use deterministic icon filename
const imgSrc = element.iconKey ? `icon_${element.iconKey}.png` : (element.src || 'placeholder.png');
```

**Verify:** Generate ZPK → extract → `assets/icon_heart.png` exists. `watchface/index.js` references `icon_heart.png`.

---

## Phase 6: Font Style Library + Font Picker

### T013 — Create font style library

**File:** `src/lib/fontLibrary.ts` (NEW)

```typescript
export interface FontStyle {
  key: string;
  label: string;
  fontFamily: string;
  fontWeight: string;
  color: string;
  preview?: string;       // lazy — generated on first access
}

export const FONT_STYLES: FontStyle[] = [
  { key: 'bold-white',       label: 'Bold White',       fontFamily: 'Arial',          fontWeight: 'bold',   color: '#FFFFFF' },
  { key: 'thin-cyan',        label: 'Thin Cyan',        fontFamily: 'Arial',          fontWeight: '300',    color: '#00D4FF' },
  { key: 'pixel-green',      label: 'Pixel Green',      fontFamily: 'Courier New',    fontWeight: 'bold',   color: '#00FF88' },
  { key: 'serif-gold',       label: 'Serif Gold',       fontFamily: 'Georgia',        fontWeight: 'bold',   color: '#FFD700' },
  { key: 'mono-red',         label: 'Mono Red',         fontFamily: 'Consolas',       fontWeight: 'normal', color: '#FF4444' },
  { key: 'rounded-blue',     label: 'Rounded Blue',     fontFamily: 'Verdana',        fontWeight: 'bold',   color: '#4A9EFF' },
  { key: 'condensed-silver', label: 'Condensed Silver', fontFamily: 'Arial Narrow',   fontWeight: 'bold',   color: '#C0C0C0' },
  { key: 'digital-green',    label: 'Digital Green',    fontFamily: 'Lucida Console', fontWeight: 'normal', color: '#33FF33' },
];

export function getFontStyle(key: string): FontStyle {
  return FONT_STYLES.find(f => f.key === key) ?? FONT_STYLES[0];
}

export function generateFontPreview(style: FontStyle): string {
  const w = 80, h = 28;
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = style.color;
  ctx.font = `${style.fontWeight} ${Math.floor(h * 0.7)}px ${style.fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('12:34', w / 2, h / 2);
  return canvas.toDataURL('image/png');
}
```

**Verify:** Import → `FONT_STYLES.length === 8`. `generateFontPreview(FONT_STYLES[0])` returns data URL.

---

### T014 — Add fontStyle to WatchFaceElement type

**File:** `src/types/index.ts`

**Add to WatchFaceElement interface:**
```typescript
fontStyle?: string;      // key into font library, e.g. 'bold-white', 'pixel-green'
```

**Verify:** Build passes.

---

### T015 — Font picker in PropertyPanel

**File:** `src/components/PropertyPanel.tsx`

**Add section** for digit/text elements:

```tsx
{['IMG_TIME', 'TEXT_IMG', 'TEXT', 'IMG_DATE'].includes(element.type) && (
  <Section label="Font Style">
    <div className="flex gap-1 overflow-x-auto pb-1">
      {FONT_STYLES.map(style => (
        <button
          key={style.key}
          onClick={() => update({ fontStyle: style.key, color: style.color })}
          className={cn('shrink-0 rounded border overflow-hidden',
            (element.fontStyle ?? 'bold-white') === style.key
              ? 'border-cyan-500 ring-1 ring-cyan-500/50'
              : 'border-white/10'
          )}
          title={style.label}
        >
          <img
            src={style.preview ?? generateFontPreview(style)}
            alt={style.label}
            className="h-7 w-auto"
          />
        </button>
      ))}
    </div>
  </Section>
)}
```

**Import:** `import { FONT_STYLES, generateFontPreview } from '@/lib/fontLibrary';`

**Verify:** Select IMG_TIME → horizontal scroll of 8 font preview thumbnails. Click "Pixel Green" → fontStyle and color updated.

---

### T016 — Use fontStyle in asset generation

**File:** `src/pipeline/assetImageGenerator.ts`

**Modify `generateDigitImages()`:** Accept optional `FontStyle` parameter:

```typescript
function generateDigitImages(
  prefix: string,
  width: number,
  height: number,
  color: string,
  style?: { fontFamily: string; fontWeight: string },
): ElementImage[] {
  const fontFamily = style?.fontFamily ?? 'Arial';
  const fontWeight = style?.fontWeight ?? 'bold';
  // ... use `${fontWeight} ${Math.floor(h * 0.75)}px ${fontFamily}` in ctx.font
}
```

**In `handleRegenerateDownload` (App.tsx):** Before calling buildZPK, regenerate digit images using each element's fontStyle:

```typescript
// For each text/digit element with fontStyle, regenerate its digit PNGs
for (const el of state.watchFaceConfig.elements) {
  if (el.fontStyle && ['IMG_TIME', 'TEXT_IMG', 'IMG_DATE'].includes(el.type)) {
    const style = getFontStyle(el.fontStyle);
    // Generate digit images with this style and inject into elementFiles
    // ... (use generateDigitImages with style params)
  }
}
```

**Note:** This is the most complex wiring. The existing pipeline generates digits once. With per-element fontStyle, digits need per-element prefixes or the element must reference a specific digit set. Simplest approach: time digits always use the IMG_TIME element's fontStyle.

**Verify:** Change font style to pixel-green → regenerate ZPK → extract → time_digit_0.png uses green Courier (visually verify).

---

## Phase 7: IMG_TIME Size Lock + Realistic Canvas Preview

### T017 — Lock IMG_TIME/IMG_DATE/IMG_WEEK resize

**File:** `src/components/InteractiveCanvas.tsx`

**In handleMouseDown:** When selected element is IMG_TIME/IMG_DATE/IMG_WEEK, do NOT check for resize handles:

```typescript
// After getting selected element:
const isTimeLocked = ['IMG_TIME', 'IMG_DATE', 'IMG_WEEK'].includes(selectedEl.type);

// Skip resize handle check for locked types:
if (!isTimeLocked) {
  const rh = hitTestRectHandle(x, y, selectedEl.bounds);
  if (rh) { resizeHandleRef.current = rh; return; }
}
```

**In drawSelection:** For locked types, draw selection border but NO handle squares:

```typescript
function drawRectSelection(ctx: CanvasRenderingContext2D, el: WatchFaceElement) {
  const isLocked = ['IMG_TIME', 'IMG_DATE', 'IMG_WEEK'].includes(el.type);
  // ... draw dashed border (always)
  if (!isLocked) {
    // draw 8 handles
  } else {
    // draw info badge: "Size locked (digit images)"
    ctx.fillStyle = 'rgba(0, 212, 255, 0.8)';
    ctx.font = '10px Arial';
    ctx.fillText('Size: digit images', el.bounds.x, el.bounds.y - 4);
  }
}
```

**Verify:** Select IMG_TIME → no resize handles. Drag works. Cannot resize.

---

### T018 — Disable W/H inputs in PropertyPanel for locked types

**File:** `src/components/PropertyPanel.tsx`

```tsx
const isSizeLocked = ['IMG_TIME', 'IMG_DATE', 'IMG_WEEK'].includes(element.type);

// In Size section:
{!isCentered && (
  <Section label="Size">
    <FieldRow>
      <NumField label="W" value={element.bounds.width} onChange={setW} disabled={isSizeLocked} />
      <NumField label="H" value={element.bounds.height} onChange={setH} disabled={isSizeLocked} />
    </FieldRow>
    {isSizeLocked && (
      <p className="text-[10px] text-white/30 mt-1">Size determined by digit images</p>
    )}
  </Section>
)}
```

**Modify NumField** to accept `disabled?` prop:
```tsx
function NumField({ label, value, onChange, disabled }: { label: string; value: number; onChange: (v: number) => void; disabled?: boolean }) {
  return (
    <div className="flex items-center gap-1 flex-1">
      <span className="text-[10px] text-white/40 w-4 shrink-0">{label}</span>
      <Input
        type="number"
        value={Math.round(value)}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        disabled={disabled}
        className={cn("h-6 text-xs bg-white/5 border-white/10 text-white px-1.5 [appearance:textfield]", disabled && "opacity-50 cursor-not-allowed")}
      />
    </div>
  );
}
```

**Verify:** Select IMG_TIME → W/H inputs grayed out, not editable. Note text shown.

---

### T019 — Realistic canvas rendering for IMG elements with iconKey

**File:** `src/components/InteractiveCanvas.tsx`

**In the drawElements function**, replace placeholder rectangle with icon rendering for IMG elements that have `iconKey`:

Current placeholder drawing typically shows a labeled rectangle. Replace with:

```tsx
// For IMG elements:
if (el.type === 'IMG') {
  if (el.iconKey) {
    // Try cached icon image
    const cached = iconImageCache.current.get(el.iconKey);
    if (cached) {
      ctx.drawImage(cached, el.bounds.x, el.bounds.y, el.bounds.width, el.bounds.height);
    } else {
      // Load and cache
      const entry = getIconByKey(el.iconKey);
      if (entry) {
        const img = new Image();
        img.onload = () => { iconImageCache.current.set(el.iconKey!, img); draw(); };
        img.src = entry.dataUrl;
      }
      // Draw placeholder while loading
      drawPlaceholder(ctx, el);
    }
  } else {
    drawPlaceholder(ctx, el);
  }
  return;
}
```

**Verify:** IMG element with iconKey=heart → canvas shows heart. Without iconKey → labeled placeholder.

---

### T020 — Realistic canvas rendering for text/digit elements with fontStyle

**File:** `src/components/InteractiveCanvas.tsx`

**For IMG_TIME/TEXT_IMG elements:** Draw sample text in the selected font style:

```tsx
if (el.type === 'IMG_TIME' || el.type === 'TEXT_IMG') {
  const style = el.fontStyle ? getFontStyle(el.fontStyle) : undefined;
  const font = style ? `${style.fontWeight} ${Math.floor(el.bounds.height * 0.75)}px ${style.fontFamily}` : `bold ${Math.floor(el.bounds.height * 0.75)}px Arial`;
  const color = el.color ? toCssColor(el.color) : (style?.color ?? '#FFFFFF');
  const sampleText = el.type === 'IMG_TIME' ? '10:28' : (el.dataType ?? el.name);

  ctx.save();
  ctx.fillStyle = color;
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(sampleText, el.bounds.x + el.bounds.width / 2, el.bounds.y + el.bounds.height / 2);
  ctx.restore();
  return;
}
```

**Import:** `import { getFontStyle } from '@/lib/fontLibrary';`

**Verify:** IMG_TIME with fontStyle=pixel-green → canvas shows "10:28" in green Courier. Change style → re-renders.

---

## Phase 8: Build + Deploy

### T021 — Final build

```bash
cd app
npm run build
```

**Verify:** Exit code 0. No TypeScript errors.

---

### T022 — Deploy to GitHub Pages

```bash
Copy-Item dist/* docs/ -Recurse -Force
git add -A
git commit -m "feat: spec-008 editor fidelity — arc fix, grid, icons, fonts, type switching"
git push
```

**Verify:** Push succeeds.

---

### T023 — End-to-end verification

1. Hard refresh site (Ctrl+F5)
2. Upload design image
3. AI generates elements
4. Verify:
   - [ ] Select ARC → Position shows CX/CY (not 0,0)
   - [ ] Toggle grid → grid lines appear/disappear
   - [ ] Change ARC dataType → STRESS
   - [ ] Change element type → TEXT
   - [ ] Select IMG → pick heart icon → canvas shows heart
   - [ ] Select IMG_TIME → pick pixel-green font → canvas shows green time
   - [ ] IMG_TIME → no resize handles, W/H disabled
   - [ ] Regenerate & Download ZPK
   - [ ] Extract ZPK → verify icon_heart.png in assets
   - [ ] Verify watchface/index.js references correct data types
5. Install on device → verify match

---

## Task Summary

| Task | Phase | Description | Files |
|------|-------|-------------|-------|
| T001 | 1 | PropertyPanel: center.x/y for ARC/POINTER | PropertyPanel.tsx |
| T002 | 1 | PropertyPanel: hide W/H for ARC | PropertyPanel.tsx |
| T003 | 2 | App.tsx: showGrid state + toggle button | App.tsx |
| T004 | 2 | InteractiveCanvas: drawGrid overlay | InteractiveCanvas.tsx |
| T005 | 3 | DataType dropdown for all elements | PropertyPanel.tsx |
| T006 | 4 | Widget type dropdown UI | PropertyPanel.tsx |
| T007 | 4 | handleTypeChange with defaults | PropertyPanel.tsx |
| T008 | 5 | Create iconLibrary.ts (20 icons) | iconLibrary.ts (NEW) |
| T009 | 5 | Add iconKey to WatchFaceElement | types/index.ts |
| T010 | 5 | Icon picker in PropertyPanel | PropertyPanel.tsx |
| T011 | 5 | Render icons on InteractiveCanvas | InteractiveCanvas.tsx |
| T012 | 5 | Wire icon assets into ZPK generation | App.tsx, jsCodeGeneratorV2.ts |
| T013 | 6 | Create fontLibrary.ts (8 styles) | fontLibrary.ts (NEW) |
| T014 | 6 | Add fontStyle to WatchFaceElement | types/index.ts |
| T015 | 6 | Font picker in PropertyPanel | PropertyPanel.tsx |
| T016 | 6 | Use fontStyle in asset generation | assetImageGenerator.ts, App.tsx |
| T017 | 7 | Lock IMG_TIME resize on canvas | InteractiveCanvas.tsx |
| T018 | 7 | Disable W/H inputs for locked types | PropertyPanel.tsx |
| T019 | 7 | Realistic canvas: icon rendering | InteractiveCanvas.tsx |
| T020 | 7 | Realistic canvas: font style rendering | InteractiveCanvas.tsx |
| T021 | 8 | Final build | — |
| T022 | 8 | Deploy to GitHub Pages | — |
| T023 | 8 | End-to-end verification | — |
