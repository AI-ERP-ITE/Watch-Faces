# Spec 007: Geometry-Driven Pipeline + Live Canvas Preview + Manual Editor

## Status

**Prerequisite completed:** Spec 006 (pipeline simplification) removed redundant steps.  
Current pipeline: Validate → Geometry Clamp → Normalize (code) → Layout → Geometry → Assets → Code Gen → ZPK.  
Current AI calls: **1** (vision extraction only).

---

## Problem Statement

After spec 006, the pipeline is lean. But three core problems remain:

### P1: Preview ≠ Generated Output
The canvas preview (`CanvasWatchPreview.tsx`) draws arcs, hands, and text placeholders using `WatchFaceElement` data. But the **code generator** (`jsCodeGeneratorV2.ts`) interprets the same data differently — different coordinate derivations, different rounding, different defaults. What the user sees in preview is NOT what ends up in the ZPK.

### P2: User Cannot Fix AI Mistakes
AI gets coordinates wrong ~30% of the time. An arc radius might be 20px off, a text block might be misplaced, or the AI might misidentify "stress" as "spo2". The user currently has **no way to adjust** these before generation. The only option is to regenerate and hope for better AI output.

### P3: Two Divergent Preview Systems
Two preview components exist:
- `WatchPreview.tsx` — DOM-based, uses div positioning. Cannot render arcs or hands.
- `CanvasWatchPreview.tsx` — Canvas-based, renders arcs and hands. Cannot be interacted with.

Neither matches the final output. Neither supports editing.

---

## Goal

Build a single geometry-driven system where:

1. AI extracts geometry (already done — spec 006)
2. Canvas preview renders **exact same geometry** that the code generator uses
3. User can **drag, resize, and adjust** elements on the canvas
4. Edited geometry flows to code generation **without re-running AI**
5. Final ZPK output matches what the user saw in preview

---

## Core Principle

```
ONE SOURCE OF TRUTH = elements[] state
```

The same `WatchFaceElement[]` array is read by:
- Canvas preview (renders what user sees)
- Manual editor (writes user changes back)
- Code generator (produces ZPK output)

No copies. No derived state. No intermediate transforms that diverge.

---

## Data Model

Already exists in `types/index.ts` as `WatchFaceElement`. Key fields:

```typescript
WatchFaceElement = {
  id: string;
  type: string;              // TIME_POINTER, ARC_PROGRESS, TEXT_IMG, etc.
  name: string;
  bounds: { x, y, width, height };  // All elements
  center?: { x, y };         // Arc + pointer elements
  radius?: number;            // Arc elements
  startAngle?: number;        // Arc elements
  endAngle?: number;          // Arc elements
  lineWidth?: number;         // Arc elements
  color?: string;             // AI-extracted dominant color
  visible: boolean;
  zIndex: number;
  dataType?: string;          // BATTERY, STEP, HEART, etc.

  // TIME_POINTER specific
  hourPos?: { x, y };
  minutePos?: { x, y };
  secondPos?: { x, y };
}
```

All values in **480×480 coordinate space**. No changes to the type needed.

---

## Functional Requirements

### FR-001 — Single Canvas Preview (replace both existing previews)

**What:** One `<InteractiveCanvas>` component replaces both `WatchPreview.tsx` (DOM) and `CanvasWatchPreview.tsx` (read-only canvas).

**Renders:**
- Background image (clipped to circle)
- ARC_PROGRESS: arc stroke using center/radius/startAngle/endAngle/lineWidth/color
- TIME_POINTER: clock hands at mock time (10:10:30)
- TEXT_IMG / IMG_TIME / IMG_DATE: text/number placeholders with bounds rectangle
- IMG / IMG_LEVEL: icon placeholder with bounds rectangle

**Constraint:** Must use **exactly the same coordinate interpretation** as the code generator. If the code generator computes `startX` from `bounds.x`, the canvas must draw at `bounds.x`.

### FR-002 — Element Selection

**What:** Click/tap an element on the canvas to select it.

**Behavior:**
- Selected element shows handles (resize corners + drag area)
- Selected element info appears in sidebar panel
- Only ONE element selected at a time
- Click empty space to deselect
- Selection state: `selectedElementId: string | null` in component state (not global)

**Hit testing:**
- Rectangular elements: point-in-rect test on bounds
- Arc elements: distance-from-center within ±lineWidth/2 of radius, within angle range
- TIME_POINTER: point-in-rect on full 480×480 container (hands are part of one widget)

### FR-003 — Element Dragging

**What:** Drag a selected element to reposition it.

**Behavior:**
- Mouse/touch drag moves the element
- Updates `bounds.x`, `bounds.y` (and `center.x`, `center.y` if present) by the delta
- Coordinates clamped to 0–480 range
- Canvas re-renders on every move (requestAnimationFrame)
- Drag updates `WatchFaceElement[]` in global state via dispatch

**For arc elements:**
- Dragging moves `center.x`, `center.y`
- `bounds` re-derived from center + radius

**For TIME_POINTER:**
- Dragging moves `center.x`, `center.y`
- `pointerCenter` also updated

### FR-004 — Element Resizing

**What:** Drag resize handles to change element size.

**Behavior for rectangular elements:**
- 4 corner handles + 4 edge handles
- Dragging a handle updates `bounds.width` and `bounds.height`
- Minimum size: 20×20 pixels
- Bounds clamped to screen

**Behavior for arc elements:**
- Radial handle: drag outward/inward to change `radius`
- Angle handles: drag along arc to change `startAngle`/`endAngle`
- Thickness handle: drag to change `lineWidth`

### FR-005 — Property Panel (Sidebar)

**What:** When an element is selected, show its editable properties in a sidebar panel.

**Fields shown (all elements):**
- Name (read-only display)
- Type (read-only display)
- Position: x, y (number inputs, editable)
- Size: width, height (number inputs, editable)
- Visible: toggle
- Color: color picker (hex input)

**Additional fields for ARC_PROGRESS:**
- Center: x, y
- Radius (number input)
- Start Angle (number input or slider 0–360)
- End Angle (number input or slider 0–360)
- Line Width (number input)
- Data Type (dropdown: BATTERY, STEP, HEART, SPO2, CAL, etc.)

**Additional fields for TIME_POINTER:**
- Center: x, y
- (Hands are auto-computed — no individual hand editing)

**Constraint:** Every property change dispatches to global state → canvas re-renders → code generator uses updated values.

### FR-006 — State Sync (Single Source of Truth)

**What:** One `elements[]` array flows everywhere.

**Flow:**
```
AI extraction → pipeline → elements[] (state)
                                ↓
                    ┌───────────┼───────────┐
                    ↓           ↓           ↓
              Canvas Preview  Property Panel  Code Generator
                    ↑           ↑
                    └───────────┘
                  User edits write back
```

**Implementation:** Add `UPDATE_ELEMENT` action to AppContext reducer:
```typescript
| { type: 'UPDATE_ELEMENT'; payload: { id: string; changes: Partial<WatchFaceElement> } }
```

When user drags/resizes/edits a property:
1. Dispatch `UPDATE_ELEMENT` with element id + changed fields
2. Reducer merges changes into the element in `watchFaceConfig.elements`
3. Canvas re-renders (React re-render)
4. Code generator uses latest state when "Generate" is clicked

### FR-007 — Re-generate Without Re-analyzing

**What:** "Generate ZPK" button uses current element state directly. Does NOT re-run AI. Does NOT re-run pipeline.

**Flow:**
1. User clicks "Generate"
2. Take `state.watchFaceConfig` as-is (with all user edits)
3. Call `generateWatchFaceCode(config)` directly
4. Build ZPK from generated code
5. Upload to GitHub

**Why:** User edits are already in the geometry. No need to re-extract or re-normalize.

### FR-008 — Preview = Output Guarantee

**What:** The canvas preview must produce a visual result that matches the ZPK output within ±2px.

**Implementation approach:**
- Extract coordinate computation from `jsCodeGeneratorV2.ts` into shared utility functions
- Canvas renderer and code generator both call the same functions
- No independent coordinate math in either place

### FR-009 — Undo/Redo (Optional, P2)

**What:** Ctrl+Z / Ctrl+Y to undo/redo element edits.

**Implementation:** Store element state snapshots in a history stack. Max 20 entries.

---

## What Gets Removed

| Component | Status |
|-----------|--------|
| `WatchPreview.tsx` (DOM-based) | **Replaced** by InteractiveCanvas |
| `CanvasWatchPreview.tsx` (read-only canvas) | **Replaced** by InteractiveCanvas |
| Side-by-side preview layout | **Replaced** by single canvas + property panel |

---

## What Stays Unchanged

| Component | Why |
|-----------|-----|
| `pipeline/index.ts` | Already simplified (spec 006). Still runs after AI extraction. |
| `pipeline/normalizer.ts` | Still maps AI elements → Zepp widgets |
| `pipeline/geometrySolver.ts` | Still fills missing geometry |
| `pipeline/assetResolver.ts` | Still assigns asset paths |
| `lib/jsCodeGeneratorV2.ts` | Still generates Zepp JS code |
| `lib/zpkBuilder.ts` | Still builds .zpk file |
| `pipeline/pipelineAIService.ts` | AI Call 1 still used for extraction |
| `context/AppContext.tsx` | Extended (new action), not replaced |
| `types/index.ts` | No type changes needed |

---

## Success Criteria

- **SC-001:** Single canvas preview replaces both existing previews
- **SC-002:** User can drag elements and see position update live
- **SC-003:** User can resize elements
- **SC-004:** User can edit arc radius/angles via property panel
- **SC-005:** Edited geometry produces correct ZPK output
- **SC-006:** Preview matches generated watchface (±2px)
- **SC-007:** No layout shifts between preview and final output
- **SC-008:** Generation works without re-running AI after edits

---

## Constraints

- Keep V2 code generator unchanged (only extract shared utilities if needed)
- Keep asset pipeline unchanged
- Keep all existing types unchanged (extend only)
- Max 1 AI vision call (already achieved in spec 006)
- Interactive canvas must work on both desktop (mouse) and mobile (touch)
- Canvas must maintain 60fps during drag operations
