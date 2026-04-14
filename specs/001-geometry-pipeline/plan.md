# Implementation Plan: Representation-Aware Pipeline (Break the Arc Monoculture)

**Branch**: `001-geometry-pipeline` | **Date**: 2026-04-09 | **Spec**: `specs/001-geometry-pipeline/spec.md`

## Summary

The current pipeline funnels every data element into `ARC_PROGRESS` because the AI outputs only `type + region` and the normalizer maps `type → widget` with a hardcoded table. The fix is NOT geometry extraction (already tried and failed). The fix is adding a **representation layer**: the AI describes HOW each element appears (text, arc, icon, row), the normalizer branches on representation instead of type, and the geometry solver supports multiple layout modes (arc stacking, vertical rows, standalone placement).

## Root Cause Chain (from existing code)

```
normalizer.ts line 10:  TYPE_TO_WIDGET = { steps: 'ARC_PROGRESS', battery: 'ARC_PROGRESS', ... }
→ semanticPriority.ts:  sorts arcs by data type
→ geometrySolver.ts:    stacks arcs at radius = 180 - n*25
→ RESULT: everything becomes arcs regardless of input design
```

The system has **no way to express**: vertical list, left panel, icon+text row, mixed compositions. It falls back to arcs because that's its only expressive structure.

## Technical Context

**Language/Version**: TypeScript 5.x  
**Primary Dependencies**: React, Vite 7, Gemini/OpenAI vision APIs  
**Testing**: Manual ZPK extraction + ZeppPlayer comparison  
**Target Platform**: Web (React app) generating ZeppOS v2 `.zpk` for Amazfit Balance 2 (480×480)  
**Constraints**: Must not modify `jsCodeGeneratorV2.ts` or `zpkBuilder.ts`

## Constitution Check

| Principle | Status |
|-----------|--------|
| Reference-First | ✅ V2 generator and ZPK builder untouched |
| Spec-Driven | ✅ Widget types match ZEPP_WATCHFACE_API_REFERENCE.md |
| Suggest Before Executing | ✅ Plan reviewed before implementation |
| Verify Against Reference | ✅ Success criteria include ZPK extraction and comparison |
| Deploy Completely | ✅ Deployment protocol unchanged |
| Simplicity | ✅ Adding one concept (representation), not a coordinate system |

## Architecture: Before vs After

### BEFORE (broken)

```
Image → AI (type + region) → Normalizer (type → ARC_PROGRESS) → Layout (region → anchor) → Geometry (stack arcs) → Assets → V2
```

### AFTER (fixed)

```
Image → AI (type + representation + layout + group) → Normalizer (representation → widget) → Layout (group + layout mode → position) → Geometry (per-layout-mode coords) → Assets → V2
```

## Project Structure

### Source Code Changes

```text
src/
├── types/
│   └── pipeline.ts              ← MODIFY: Add representation, layout, group to AIElement; add layout mode to NormalizedElement
├── pipeline/
│   ├── index.ts                 ← MODIFY: Update orchestrator for new stage flow + bridge fix
│   ├── aiPrompt.ts              ← REWRITE: New prompt demanding representation/layout/group
│   ├── normalizer.ts            ← REWRITE: Branch on representation, not just type; compound expansion
│   ├── layoutEngine.ts          ← REWRITE: Group-based + layout-mode positioning (replaces region map)
│   ├── geometrySolver.ts        ← MODIFY: Add row/standalone layout branches alongside existing arc logic
│   ├── semanticPriority.ts      ← KEEP: Arc sorting still needed for representation="arc" elements
│   ├── assetResolver.ts         ← KEEP: Unchanged
│   ├── constants.ts             ← MODIFY: Add group zone definitions, remove REGION_POSITIONS
│   ├── validators.ts            ← MODIFY: Require representation field, validate group values
│   └── pipelineAIService.ts     ← MODIFY: Update response parsing for new AIElement shape
```

### Files NOT Modified

```text
src/lib/jsCodeGeneratorV2.ts     ← Untouched
src/lib/jsCodeGenerator.ts       ← Untouched (router)
src/lib/zpkBuilder.ts            ← Untouched (packager)
```

## Detailed Stage Design

### Stage 1 — AI Extraction: New Schema (`aiPrompt.ts`)

**Current prompt** demands: `type + region + style + confidence`  
**New prompt** demands: `type + representation + layout + group + importance`

New AI output schema:
```json
{
  "elements": [
    {
      "id": "steps_text",
      "type": "steps",
      "representation": "text+icon",
      "layout": "row",
      "group": "right_panel",
      "importance": "secondary",
      "confidence": 0.9
    },
    {
      "id": "battery_arc",
      "type": "battery",
      "representation": "arc",
      "layout": "arc",
      "group": "center",
      "importance": "primary",
      "confidence": 0.85
    }
  ]
}
```

**Key fields**:
- `representation`: `"text" | "arc" | "icon" | "text+icon" | "text+arc" | "number"` — HOW the element visually appears
- `layout`: `"row" | "arc" | "standalone" | "grid"` — spatial arrangement pattern
- `group`: `"center" | "top" | "bottom" | "left_panel" | "right_panel" | "top_left" | "top_right" | "bottom_left" | "bottom_right"` — which zone of the watch face
- `importance`: `"primary" | "secondary"` — visual weight hint

The `region` field is **removed entirely**.

### Stage 2 — Validation (`validators.ts`)

- Every element MUST have `representation` (non-empty string from allowed set)
- Every element MUST have `layout` and `group`
- The old `FORBIDDEN_SPATIAL_KEYS` check is removed (we're not injecting coords from AI)
- Bounds checking: `group` must be from the allowed set

### Stage 3 — Normalizer: Representation Branching (`normalizer.ts`)

**This is the core fix.** Replace the hardcoded `TYPE_TO_WIDGET` map with a representation-based decision table:

```ts
function mapWidget(type: AIElementType, representation: Representation): ZeppWidget | ZeppWidget[] {
  // Time is special — analog vs digital
  if (type === 'time') {
    return representation === 'arc' ? 'TIME_POINTER' : 'IMG_TIME';
  }
  
  // Date/weekday/month — always image-based
  if (type === 'date') return 'IMG_DATE';
  if (type === 'weekday') return 'IMG_WEEK';
  if (type === 'month') return 'IMG_DATE';
  
  // Data elements — BRANCH ON REPRESENTATION
  if (representation === 'arc') return 'ARC_PROGRESS';
  if (representation === 'text') return 'TEXT_IMG';
  if (representation === 'number') return 'TEXT_IMG';
  if (representation === 'icon') return 'IMG';
  if (representation === 'text+icon') return ['TEXT_IMG', 'IMG'];  // compound → 2 widgets
  if (representation === 'text+arc') return ['ARC_PROGRESS', 'TEXT_IMG'];  // compound → 2 widgets
  
  return 'TEXT';  // fallback
}
```

**Compound expansion**: When representation is `text+icon` or `text+arc`, the normalizer produces 2 `NormalizedElement` entries (with shared `parentId` for grouping). This is how "steps shown as icon + number" becomes `IMG` + `TEXT_IMG` instead of one `ARC_PROGRESS`.

### Stage 4 — Layout Engine: Group + Mode Based (`layoutEngine.ts`)

**Replace** the current `REGION_POSITIONS` map with group zones:

```ts
const GROUP_ZONES: Record<string, {x: number, y: number, w: number, h: number}> = {
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

**Per-layout-mode positioning**:
- `layout: "arc"` → Existing center-locked logic: `centerX = 240, centerY = 240`
- `layout: "row"` → Vertical stack within group zone: `x = zone.x + padding, y = zone.y + index * rowHeight`
- `layout: "standalone"` → Centered within group zone: `x = zone.x + zone.w/2, y = zone.y + zone.h/2`
- `layout: "grid"` → Grid within group zone (for future use)

### Stage 5 — Geometry Solver: Layout Branching (`geometrySolver.ts`)

**Keep** existing arc logic for `layout: "arc"` elements (center/radius/angles/lineWidth).

**Add** new branches:

```ts
if (el.layout === 'row') {
  // TEXT_IMG / TEXT / IMG positioned from layout engine's x, y
  el.x = layoutX;
  el.y = layoutY;
  el.w = widgetDefaultWidth;
  el.h = widgetDefaultHeight;
}

if (el.layout === 'standalone') {
  el.x = layoutX - widgetDefaultWidth / 2;
  el.y = layoutY - widgetDefaultHeight / 2;
  el.w = widgetDefaultWidth;
  el.h = widgetDefaultHeight;
}
```

Arc branch stays **exactly the same** as current code (`radius = ARC_BASE_RADIUS - priority * ARC_SPACING`).

### Stage 6 — Bridge Fix (`index.ts`)

Fix `resolvedToWatchFaceElement()`:

```ts
// REMOVE THIS LINE (the root bug):
// bounds.x = el.x ?? el.centerX

// REPLACE WITH:
if (el.widget === 'ARC_PROGRESS') {
  base.center = { x: el.centerX, y: el.centerY };
  base.radius = el.radius;
  // NO bounds
}
if (el.widget === 'TEXT_IMG' || el.widget === 'TEXT' || el.widget === 'IMG') {
  base.bounds = { x: el.x!, y: el.y!, width: el.w!, height: el.h! };
  // NO center
}
```

## Migration Strategy

1. Update types first (additive — new fields are optional initially)
2. Rewrite AI prompt and normalizer (the core fix)
3. Update layout engine (group zones replace region map)
4. Add geometry solver branches (additive — existing arc logic untouched)
5. Fix bridge (small targeted change)
6. Test end-to-end with mixed-representation designs
7. Delete dead code (old region constants) after validation

## Risk Analysis

| Risk | Mitigation |
|------|------------|
| AI may not reliably detect representation type | Provide 5+ few-shot examples covering text, arc, icon, row, standalone patterns |
| Group detection may be imprecise | Groups are coarser than regions — easier for AI to get right |
| Compound expansion may create too many widgets | Cap at 2 widgets per AI element |
| Existing arc-heavy designs may regress | Arc logic is kept intact; only new representation paths are added |
| Layout engine group zones may overlap | Zones are pre-defined as non-overlapping rectangles |
