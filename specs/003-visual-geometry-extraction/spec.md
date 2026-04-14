# Spec 003 — Visual Geometry Extraction Layer (Critical Fix)

## Problem

Current pipeline discards all spatial information at AI stage:

```ts
AIElement = { type, representation, layout, group } // NO geometry
```

This causes:

- Layout engine invents positions (not from design)
- Geometry solver fabricates arcs (not from image)
- Final watchface ≠ uploaded design
- Preview mismatch (3 different coordinate systems)

**Root issue:** System interprets design instead of reconstructing it.

---

## Goal

Introduce a **Visual Geometry Extraction** layer that:

- Extracts real positions, sizes, and shapes from the image
- Preserves layout fidelity
- Eliminates synthetic layout for detected elements
- Enables **80–95% visual match** with input design

---

## Non-Goals

- No pixel-perfect CV accuracy required
- No change to V2 generator
- No change to asset generator
- No redesign of existing pipeline stages

---

## Functional Requirements

### FR-001 — Geometry-Enriched AI Output

AI must output:

```ts
AIElement = {
  id: string
  type: AIElementType
  representation: Representation
  layout: LayoutMode
  group: Group

  // NEW — geometry fields
  bounds: { x: number; y: number; w: number; h: number }

  center?: { x: number; y: number }

  radius?: number
  startAngle?: number
  endAngle?: number
}
```

Coordinates must be:

- Normalized to **480×480** space
- Origin = **top-left**

### FR-002 — Bounds Required for All Elements

- Every element **MUST** include `bounds`
- Reject AI output if missing

### FR-003 — Arc Geometry Extraction

For circular elements:

- Detect:
  - `center` (cx, cy)
  - `radius`
  - `startAngle`
  - `endAngle`

- Angles in degrees:
  - **0° = right**
  - **90° = down**

### FR-004 — Layout Bypass

If `bounds` exists:

- `applyLayout()` **MUST NOT** modify position

Only fallback when `bounds` missing.

### FR-005 — Geometry Solver Pass-Through

If geometry already exists:

- `solveGeometry()` **MUST NOT** recompute:
  - `radius`
  - `angles`
  - `x/y`

- Only compute missing fields.

### FR-006 — Representation Becomes Secondary

Widget selection must consider:

- Geometry shape
- Aspect ratio
- Spatial pattern

**NOT** only `representation`.

### FR-007 — Preview Consistency

All previews must use **SAME** source:

- `GeometryElement` → single rendering model

Remove dependency on bounds vs center mismatch.

---

## Success Criteria

| ID | Criterion |
|----|-----------|
| SC-001 | Generated watchface visually matches input layout |
| SC-002 | No artificial stacking or regrouping |
| SC-003 | Arcs match position and size of original |
| SC-004 | Preview = actual watch output (no divergence) |
| SC-005 | Mixed UI (text + list + arc) preserved |

---

## Constraints

- Must remain deterministic after extraction
- AI call count ≤ 2
- No heavy CV libraries (keep lightweight)
