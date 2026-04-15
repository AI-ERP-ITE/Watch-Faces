# Tasks 007: Geometry-Driven Pipeline + Live Canvas Preview + Manual Editor

---

## Phase 1: State Foundation

### T001 — Add UPDATE_ELEMENT action to AppContext reducer

**File:** `src/context/AppContext.tsx`

**Add to Action union type:**
```typescript
| { type: 'UPDATE_ELEMENT'; payload: { id: string; changes: Partial<WatchFaceElement> } }
```

**Add to reducer switch:**
```typescript
case 'UPDATE_ELEMENT': {
  if (!state.watchFaceConfig) return state;
  const updatedElements = state.watchFaceConfig.elements.map(el =>
    el.id === action.payload.id ? { ...el, ...action.payload.changes } : el
  );
  return {
    ...state,
    watchFaceConfig: { ...state.watchFaceConfig, elements: updatedElements },
  };
}
```

**Add dispatch helper to actions object:**
```typescript
updateElement: (id: string, changes: Partial<WatchFaceElement>) =>
  dispatch({ type: 'UPDATE_ELEMENT', payload: { id, changes } }),
```

**Verify:** Import `WatchFaceElement` type if not already imported. Build must pass.

---

### T002 — Add UPDATE_ELEMENTS_BATCH action (for drag performance)

**File:** `src/context/AppContext.tsx`

During drag, we may need to update center AND bounds simultaneously. A batch action avoids double renders.

**Add to Action union type:**
```typescript
| { type: 'UPDATE_ELEMENTS_BATCH'; payload: Array<{ id: string; changes: Partial<WatchFaceElement> }> }
```

**Add to reducer:**
```typescript
case 'UPDATE_ELEMENTS_BATCH': {
  if (!state.watchFaceConfig) return state;
  const changeMap = new Map(action.payload.map(p => [p.id, p.changes]));
  const updatedElements = state.watchFaceConfig.elements.map(el => {
    const changes = changeMap.get(el.id);
    return changes ? { ...el, ...changes } : el;
  });
  return {
    ...state,
    watchFaceConfig: { ...state.watchFaceConfig, elements: updatedElements },
  };
}
```

**Verify:** Build passes.

---

## Phase 2: Interactive Canvas Component

### T003 — Create InteractiveCanvas.tsx with basic rendering

**File:** `src/components/InteractiveCanvas.tsx` (NEW)

**Copy rendering logic from `CanvasWatchPreview.tsx`:**
- `drawBackground()` — background image clipped to circle
- `drawBlackCircle()` — fallback when no background
- `drawArc()` — ARC_PROGRESS rendering (center, radius, angles, color, lineWidth)
- `drawTimePointer()` — clock hands at 10:10:30
- `drawPlaceholder()` — text/img bounding box rectangles with labels
- Helper functions: `degToRad()`, `parseZeppColor()`, `hexToRgba()`, `formatLabel()`

**Props:**
```typescript
interface InteractiveCanvasProps {
  backgroundImage?: string;
  elements: WatchFaceElement[];
  selectedElementId?: string | null;
  onSelectElement?: (id: string | null) => void;
  onUpdateElement?: (id: string, changes: Partial<WatchFaceElement>) => void;
  className?: string;
}
```

**Initial implementation:** Render only (no interaction yet). Must produce identical visual output to CanvasWatchPreview.

**Verify:** Place InteractiveCanvas next to CanvasWatchPreview in App.tsx temporarily. Visual output must match pixel-for-pixel.

---

### T004 — Add hit testing (click to select element)

**File:** `src/components/InteractiveCanvas.tsx`

**Implement `hitTest(x: number, y: number): string | null`:**

For rectangular elements (TEXT_IMG, IMG, IMG_TIME, IMG_DATE, IMG_WEEK, TEXT, IMG_LEVEL, IMG_STATUS):
```typescript
// Point-in-rect: x >= bounds.x && x <= bounds.x + bounds.width && ...
```

For ARC_PROGRESS:
```typescript
// 1. Compute distance from click point to element center
// 2. Check: |distance - radius| <= lineWidth / 2 + tolerance (8px)
// 3. Check: click angle is between startAngle and endAngle
```

For TIME_POINTER:
```typescript
// Hit test on the full bounding box (bounds or 480×480 container)
```

**Event handler:**
```typescript
const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = CANVAS_SIZE / rect.width;
  const scaleY = CANVAS_SIZE / rect.height;
  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top) * scaleY;
  
  // Test elements in reverse zIndex order (topmost first)
  const hit = hitTest(x, y);
  onSelectElement?.(hit);
};
```

**Verify:** Click on an arc → logs element id. Click on empty space → deselects.

---

### T005 — Draw selection highlight and handles

**File:** `src/components/InteractiveCanvas.tsx`

**When `selectedElementId` is set, draw after all elements:**

For rectangular elements:
```
- Dashed border around bounds (2px, cyan)
- 8 small squares at corners + edge midpoints (8×8px, white fill, cyan stroke)
```

For ARC_PROGRESS:
```
- Highlight the arc with increased lineWidth + 50% opacity overlay
- Radial handle: small circle on the arc at midpoint angle
- Angle handle: small circle at startAngle point on the arc
```

For TIME_POINTER:
```
- Dashed circle around the pointer center
- Center crosshair
```

**Verify:** Select an element → handles appear. Deselect → handles disappear.

---

### T006 — Implement drag to reposition

**File:** `src/components/InteractiveCanvas.tsx`

**State:**
```typescript
const [isDragging, setIsDragging] = useState(false);
const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
const [dragElementSnapshot, setDragElementSnapshot] = useState<WatchFaceElement | null>(null);
```

**Mouse events:**

`onMouseDown`:
1. Hit test at click position
2. If hit → set selected, start drag, snapshot element
3. If hit on handle → start resize (Phase 4)

`onMouseMove` (when dragging):
1. Compute delta: `dx = currentX - dragStart.x`, `dy = currentY - dragStart.y`
2. Compute new bounds: `{ x: snapshot.bounds.x + dx, y: snapshot.bounds.y + dy }`
3. If element has center: `{ x: snapshot.center.x + dx, y: snapshot.center.y + dy }`
4. Clamp to 0–480
5. Call `onUpdateElement(id, { bounds: newBounds, center: newCenter })`

`onMouseUp`:
1. Stop drag, clear snapshot

**Performance:**
- Use `requestAnimationFrame` to throttle re-renders during drag
- Canvas redraw on every animation frame, not every mouse event

**Verify:** Drag an arc → center moves. Drag a text placeholder → bounds move. Both persist after release.

---

### T007 — Add touch support for mobile

**File:** `src/components/InteractiveCanvas.tsx`

**Map touch events to mouse equivalents:**
- `onTouchStart` → same as `onMouseDown` (use `e.touches[0]`)
- `onTouchMove` → same as `onMouseMove` (use `e.touches[0]`, call `e.preventDefault()`)
- `onTouchEnd` → same as `onMouseUp`

**Add `touch-action: none` CSS** to canvas to prevent browser scroll during drag.

**Verify:** On mobile viewport, drag works without page scrolling.

---

## Phase 3: Property Panel

### T008 — Create PropertyPanel.tsx with basic fields

**File:** `src/components/PropertyPanel.tsx` (NEW)

**Props:**
```typescript
interface PropertyPanelProps {
  element: WatchFaceElement | null;
  onUpdateElement?: (id: string, changes: Partial<WatchFaceElement>) => void;
  className?: string;
}
```

**When `element` is null:** Show "No element selected" message.

**When element selected, show:**
- **Header:** Element name + type icon + type label
- **Position section:**
  - X: `<input type="number">` bound to `element.bounds.x`
  - Y: `<input type="number">` bound to `element.bounds.y`
- **Size section:**
  - Width: `<input type="number">` bound to `element.bounds.width`
  - Height: `<input type="number">` bound to `element.bounds.height`
- **Color:** `<input type="color">` + hex text input bound to `element.color`
- **Visible:** Toggle switch bound to `element.visible`
- **zIndex:** Number input bound to `element.zIndex`

**On change:** Each input calls `onUpdateElement(element.id, { bounds: { ...element.bounds, x: newValue } })`.

**Use existing shadcn/ui components:** Input, Label, Switch from `src/components/ui/`.

**Verify:** Select element → panel shows values. Change X → element moves on canvas.

---

### T009 — Add arc-specific fields to PropertyPanel

**File:** `src/components/PropertyPanel.tsx`

**Show only when `element.type === 'ARC_PROGRESS'`:**

- **Center X/Y:** Number inputs for `element.center.x`, `element.center.y`
- **Radius:** Number input + slider (range 20–240) for `element.radius`
- **Start Angle:** Number input + slider (range 0–360) for `element.startAngle`
- **End Angle:** Number input + slider (range 0–720) for `element.endAngle`
- **Line Width:** Number input + slider (range 2–30) for `element.lineWidth`
- **Data Type:** Dropdown select with options: BATTERY, STEP, HEART, SPO2, CAL, DISTANCE, STRESS, PAI, SLEEP, STAND, FAT_BURN

**Use shadcn/ui Slider** component for sliders.

**Verify:** Select an arc → arc fields appear. Change radius slider → arc grows/shrinks live on canvas.

---

### T010 — Add TIME_POINTER-specific fields to PropertyPanel

**File:** `src/components/PropertyPanel.tsx`

**Show only when `element.type === 'TIME_POINTER'`:**

- **Center X/Y:** Number inputs for center position
- **Info text:** "Hand dimensions are auto-computed from assets"

**TIME_POINTER is mostly auto-configured.** Only center position is user-adjustable.

**Verify:** Select time pointer → center fields shown. Adjust → hands move.

---

## Phase 4: Resize Handles

### T011 — Implement rectangular element resize

**File:** `src/components/InteractiveCanvas.tsx`

**Handle positions (relative to element bounds):**
```
TL ─── TC ─── TR
│                │
ML              MR
│                │
BL ─── BC ─── BR
```

Each handle: 10×10px square centered at the point.

**Hit test handles:** In `onMouseDown`, before general hit test, check if click is on a handle of the selected element.

**Resize logic per handle:**
| Handle | What changes |
|--------|-------------|
| TR (top-right) | bounds.y ↑, bounds.width →, bounds.height shrinks from top |
| BR (bottom-right) | bounds.width →, bounds.height ↓ |
| BL (bottom-left) | bounds.x ←, bounds.width grows, bounds.height ↓ |
| TL (top-left) | bounds.x ←, bounds.y ↑, both grow |
| TC (top-center) | bounds.y ↑, bounds.height shrinks from top |
| BC (bottom-center) | bounds.height ↓ |
| ML (middle-left) | bounds.x ←, bounds.width grows |
| MR (middle-right) | bounds.width → |

**Clamp:** min 20×20, max within 0–480 screen bounds.

**Verify:** Select text element → drag corner → element resizes.

---

### T012 — Implement arc radius resize handle

**File:** `src/components/InteractiveCanvas.tsx`

**Radial handle:** Small circle (r=6) drawn at the midpoint of the arc (midAngle, at radius distance from center).

**Drag behavior:**
1. On drag, compute distance from current mouse position to arc center
2. New radius = that distance
3. Clamp: min 20, max 240
4. Dispatch: `onUpdateElement(id, { radius: newRadius })`
5. Also update `bounds` to match: `{ x: center.x - radius, y: center.y - radius, w: radius * 2, h: radius * 2 }`

**Verify:** Select arc → drag radial handle outward → arc grows.

---

### T013 — Implement arc angle handles

**File:** `src/components/InteractiveCanvas.tsx`

**Start angle handle:** Small circle drawn at (center.x + radius * cos(startAngle), center.y + radius * sin(startAngle)).

**End angle handle:** Same but at endAngle.

**Drag behavior:**
1. Compute angle from center to current mouse position: `atan2(dy, dx)` → degrees
2. Update startAngle or endAngle
3. Clamp: startAngle < endAngle

**Verify:** Drag start handle → arc start point moves. Drag end handle → arc end moves.

---

## Phase 5: Swap Previews

### T014 — Replace dual preview with InteractiveCanvas + PropertyPanel in App.tsx

**File:** `src/App.tsx`

**In the `'preview'` step rendering (around lines 1417-1450):**

**BEFORE:**
```tsx
{/* Left: WatchPreview */}
<WatchPreview ... />
{/* Right: CanvasWatchPreview */}
<CanvasWatchPreview ... />
{/* ElementList */}
<ElementList ... />
```

**AFTER:**
```tsx
<div className="flex gap-6">
  {/* Left: Interactive Canvas (large) */}
  <InteractiveCanvas
    backgroundImage={state.backgroundImage}
    elements={state.watchFaceConfig.elements}
    selectedElementId={selectedElementId}
    onSelectElement={setSelectedElementId}
    onUpdateElement={(id, changes) => actions.updateElement(id, changes)}
    className="flex-shrink-0"
  />
  
  {/* Right: Property Panel + Element List */}
  <div className="flex-1 space-y-4">
    <PropertyPanel
      element={selectedElement}
      onUpdateElement={(id, changes) => actions.updateElement(id, changes)}
    />
    <ElementList
      elements={state.watchFaceConfig.elements}
      selectedElementId={selectedElementId}
      onSelectElement={setSelectedElementId}
      onToggleVisibility={handleToggleElement}
    />
  </div>
</div>
```

**Add local state in App.tsx:**
```typescript
const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
const selectedElement = state.watchFaceConfig?.elements.find(el => el.id === selectedElementId) ?? null;
```

**Verify:** Preview step shows single interactive canvas + property panel sidebar. Click element → shows in panel. Drag → repositions.

---

### T015 — Update ElementList to support selection highlighting

**File:** `src/components/ElementList.tsx`

**Add props:**
```typescript
selectedElementId?: string | null;
onSelectElement?: (id: string) => void;
```

**Add to list item:**
- If `element.id === selectedElementId`: highlight with cyan border / brighter background
- On click: call `onSelectElement(element.id)` instead of (or in addition to) toggle visibility

**Verify:** Click element in list → highlights in list AND selects on canvas.

---

## Phase 6: Re-generate from Edited State

### T016 — Add "Regenerate ZPK" button in preview step

**File:** `src/App.tsx`

**Add button in preview step (near existing "Generate" button):**
```tsx
<Button onClick={handleRegenerate} variant="outline">
  🔄 Regenerate ZPK
</Button>
```

**Handler:**
```typescript
const handleRegenerate = async () => {
  if (!state.watchFaceConfig) return;
  actions.setLoading(true);
  actions.setLoadingMessage('Regenerating watchface...');
  try {
    const code = generateWatchFaceCode(state.watchFaceConfig);
    actions.setGeneratedCode(code);
    // Build ZPK from code + assets
    // ... (reuse existing ZPK build logic)
  } catch (err) {
    actions.setError(err instanceof Error ? err.message : 'Regeneration failed');
  } finally {
    actions.setLoading(false);
  }
};
```

**Key:** Does NOT call `runPipeline()`. Does NOT call AI. Takes current `watchFaceConfig` as-is.

**Verify:** Edit an arc radius → click Regenerate → download ZPK → extract → verify radius matches edited value.

---

### T017 — Verify code generator handles edited geometry correctly

**Manual testing task — no code change expected.**

Test cases:
1. Move an arc center to (100, 100) → verify generated code has `center_x: px(100), center_y: px(100)`
2. Change arc radius to 50 → verify `radius: px(50)`
3. Move a TIME_POINTER to (200, 200) → verify generated code uses those coordinates
4. Resize a TEXT_IMG bounds to (50, 50, 100, 30) → verify `x: px(50), y: px(50), w: px(100), h: px(30)`
5. Change arc startAngle to 0 → verify `start_angle: 0`

**If any test fails:** Fix coordinate mapping in `jsCodeGeneratorV2.ts` (or add adapter in bridge function).

---

## Phase 7: Cleanup

### T018 — Remove old preview components

**Delete files:**
- `src/components/WatchPreview.tsx`
- `src/components/CanvasWatchPreview.tsx`

**Remove imports from App.tsx:**
- `import { WatchPreview } from '@/components/WatchPreview';`
- `import { CanvasWatchPreview } from '@/components/CanvasWatchPreview';`

**Verify:** Build passes. No dead imports.

---

### T019 — Final build and deploy

**Commands:**
```bash
npm run build
Copy-Item dist/* docs/ -Recurse -Force
git add -A
git commit -m "007: Interactive canvas editor with property panel"
git push
```

**Verify:**
1. Build succeeds
2. Test on live site: upload design → preview shows interactive canvas
3. Drag element → position changes
4. Edit property → canvas updates
5. Regenerate → ZPK matches edits

---

## Task Dependency Matrix

```
T001 ─┐
T002 ─┤
      ↓
T003 (canvas rendering)
      ↓
T004 (hit testing)
      ↓
T005 (selection highlight)
      ↓
T006 (drag) ───────────────────────────┐
      ↓                                 ↓
T007 (touch)                     T008 (property panel basic)
      ↓                                 ↓
T011 (rect resize) ←── T005      T009 (arc fields)
      ↓                                 ↓
T012 (arc radius resize)        T010 (pointer fields)
      ↓                                 ↓
T013 (arc angle handles)               ↓
      ↓                                 ↓
      └────────────→ T014 (swap previews) ←─────┘
                          ↓
                     T015 (element list selection)
                          ↓
                     T016 (regenerate button)
                          ↓
                     T017 (verify code gen)
                          ↓
                     T018 (cleanup)
                          ↓
                     T019 (build + deploy)
```

---

## Summary

| Phase | Tasks | New Files | Modified Files |
|-------|-------|-----------|----------------|
| 1 | T001-T002 | — | AppContext.tsx |
| 2 | T003-T007 | InteractiveCanvas.tsx | — |
| 3 | T008-T010 | PropertyPanel.tsx | — |
| 4 | T011-T013 | — | InteractiveCanvas.tsx |
| 5 | T014-T015 | — | App.tsx, ElementList.tsx |
| 6 | T016-T017 | — | App.tsx |
| 7 | T018-T019 | — | App.tsx (remove imports) |

**Total: 19 tasks, 2 new files, 3 modified files, 2 deleted files.**
