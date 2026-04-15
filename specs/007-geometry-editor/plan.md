# Plan 007: Geometry-Driven Pipeline + Live Canvas Preview + Manual Editor

## Approach

Build incrementally. Each phase produces a working, deployable state. Never break the existing flow — add new components alongside, then swap.

---

## Phase 1: State Foundation (UPDATE_ELEMENT action)

**Goal:** Enable element mutation in global state.

**What changes:**
- Add `UPDATE_ELEMENT` action to `AppContext.tsx` reducer
- Add dispatch helper: `updateElement(id, changes)`
- No UI changes yet — just the plumbing

**Why first:** Every subsequent phase needs to write element changes to state. Without this, nothing else works.

**Risk:** LOW — additive change to reducer, zero impact on existing flow.

**Deliverable:** `dispatch({ type: 'UPDATE_ELEMENT', payload: { id, changes } })` works.

---

## Phase 2: Interactive Canvas Component

**Goal:** Build `InteractiveCanvas.tsx` — a canvas that renders elements AND supports selection/dragging.

**What changes:**
- New component: `src/components/InteractiveCanvas.tsx`
- Fork rendering logic from existing `CanvasWatchPreview.tsx` (same draw functions)
- Add: mouse/touch event handlers for hit testing, selection, dragging
- Add: selection highlight (handles drawn on selected element)
- Add: drag-to-reposition (updates element via `UPDATE_ELEMENT` dispatch)

**Does NOT replace existing previews yet.** Built alongside them.

**Sub-steps:**
1. Canvas rendering (copy from CanvasWatchPreview — same draw functions)
2. Hit testing (click → detect which element was clicked)
3. Selection state (highlight selected element with handles)
4. Drag handler (mousedown → mousemove → mouseup updates bounds/center)
5. Touch support (same logic, touchstart/touchmove/touchend)

**Risk:** MEDIUM — canvas interaction is fiddly. Hit testing for arcs needs angle math. But rendering is already proven (CanvasWatchPreview works).

**Deliverable:** Interactive canvas where user can click to select and drag to reposition elements. Changes persist in state.

---

## Phase 3: Property Panel

**Goal:** Build `PropertyPanel.tsx` — a sidebar that shows and lets user edit properties of the selected element.

**What changes:**
- New component: `src/components/PropertyPanel.tsx`
- Shows: name, type, position (x/y inputs), size (w/h inputs), color picker
- Arc-specific: radius slider, startAngle/endAngle sliders, lineWidth slider, dataType dropdown
- Each input change dispatches `UPDATE_ELEMENT`

**Sub-steps:**
1. Basic panel layout with position/size number inputs
2. Arc-specific fields (radius, angles, lineWidth)
3. Color picker (hex input or native color picker)
4. DataType dropdown for ARC_PROGRESS

**Risk:** LOW — standard form inputs. Main challenge is making sliders responsive during canvas drag.

**Deliverable:** Property panel that shows selected element details and allows inline editing.

---

## Phase 4: Resize Handles

**Goal:** Add resize handles to selected elements on the canvas.

**What changes:**
- Draw 8 handles (4 corners + 4 edges) on selected rectangular elements
- Draw radial handle for arc elements (drag to change radius)
- Handle drag updates `bounds.width`/`bounds.height` or `radius`

**Sub-steps:**
1. Draw handles on selection
2. Hit test handles (small square regions at corners/edges)
3. Handle drag → resize logic (preserve aspect ratio option)
4. Arc radial handle → radius change
5. Clamp to minimum size (20×20) and screen bounds

**Risk:** MEDIUM — resize math needs care, especially for arc radial handles. But well-known patterns.

**Deliverable:** User can resize elements by dragging handles.

---

## Phase 5: Swap Previews

**Goal:** Replace both existing preview components with `InteractiveCanvas` in App.tsx.

**What changes:**
- In App.tsx preview step: replace `WatchPreview` + `CanvasWatchPreview` side-by-side with single `InteractiveCanvas` + `PropertyPanel`
- Layout: canvas on left (large), property panel on right (sidebar)
- `ElementList` stays below property panel (shows all elements, click to select)
- Update `ElementList` to highlight selected element and allow click-to-select

**Risk:** LOW — component swap. All logic already built in Phases 2-4.

**Deliverable:** Single interactive preview replaces dual static previews.

---

## Phase 6: Re-generate from Edited State

**Goal:** "Generate ZPK" uses current element state (with edits) without re-running AI.

**What changes:**
- Add "Regenerate" button in preview step
- Button calls `generateWatchFaceCode(state.watchFaceConfig)` directly
- Then rebuilds ZPK and uploads
- Skips the entire AI → pipeline flow

**Why separate phase:** Need to verify that edited geometry produces valid Zepp JS code. The code generator may have assumptions about data shapes that user edits could violate.

**Risk:** LOW-MEDIUM — code generator should handle any valid `WatchFaceConfig`. Need to test edge cases (very small arcs, overlapping elements, elements at screen edges).

**Deliverable:** User can edit elements → click "Regenerate" → get updated ZPK.

---

## Phase 7: Cleanup

**Goal:** Remove dead code and old preview components.

**What changes:**
- Delete `WatchPreview.tsx` (DOM-based, replaced)
- Delete `CanvasWatchPreview.tsx` (read-only canvas, replaced)
- Remove their imports from App.tsx
- Clean up any unused props/handlers

**Risk:** NONE — components already swapped out in Phase 5.

---

## Phase Dependency Graph

```
Phase 1 (State)
    ↓
Phase 2 (Interactive Canvas)
    ↓
Phase 3 (Property Panel)  ←── Can run parallel with Phase 4
    ↓
Phase 4 (Resize Handles)
    ↓
Phase 5 (Swap Previews)
    ↓
Phase 6 (Re-generate)
    ↓
Phase 7 (Cleanup)
```

Phases 3 and 4 are independent of each other — can be done in any order.

---

## Files Created

| File | Phase | Purpose |
|------|-------|---------|
| `src/components/InteractiveCanvas.tsx` | 2 | Main interactive canvas component |
| `src/components/PropertyPanel.tsx` | 3 | Element property editing sidebar |

## Files Modified

| File | Phase | Change |
|------|-------|--------|
| `src/context/AppContext.tsx` | 1 | Add `UPDATE_ELEMENT` action |
| `src/App.tsx` | 5, 6 | Swap previews, add regenerate |
| `src/components/ElementList.tsx` | 5 | Add selected highlight + click-to-select |

## Files Deleted (Phase 7)

| File | Replaced by |
|------|-------------|
| `src/components/WatchPreview.tsx` | InteractiveCanvas |
| `src/components/CanvasWatchPreview.tsx` | InteractiveCanvas |

---

## Estimated Scope

| Phase | Components touched | Complexity |
|-------|-------------------|------------|
| 1 | AppContext.tsx | Small (10 lines) |
| 2 | InteractiveCanvas.tsx (new) | Large (300-400 lines) |
| 3 | PropertyPanel.tsx (new) | Medium (150-200 lines) |
| 4 | InteractiveCanvas.tsx (extend) | Medium (100-150 lines) |
| 5 | App.tsx, ElementList.tsx | Small (30 lines changed) |
| 6 | App.tsx | Small (20 lines added) |
| 7 | Delete 2 files, clean imports | Small |
