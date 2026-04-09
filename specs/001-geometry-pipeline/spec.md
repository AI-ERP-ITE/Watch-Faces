# Feature Specification: Representation-Aware Pipeline (Break the Arc Monoculture)

**Feature Branch**: `001-geometry-pipeline`  
**Created**: 2026-04-09  
**Status**: Draft  
**Input**: Refactor the pipeline to break the `type → ARC_PROGRESS` monoculture. Add a **representation layer** so the AI describes HOW each element appears (text, arc, icon, row), not just WHAT it is. The normalizer then branches on representation, producing diverse widget types instead of funneling everything into arcs.

## Root Cause Analysis

The current pipeline has a fatal design flaw:

```
steps → ARC_PROGRESS
battery → ARC_PROGRESS
heart_rate → ARC_PROGRESS
spo2 → ARC_PROGRESS
calories → ARC_PROGRESS
```

The AI outputs only `type + region`. The normalizer maps type → widget with a hardcoded table. The geometry solver is optimized for multi-arc radial layouts (`radius = 180 - n*25`). Result: **every design becomes arcs by design**, regardless of the input image.

**What's actually missing**: representation diversity — the system cannot express "steps shown as text", "battery as an icon", or "heart rate in a row layout". It only knows arcs.

**What NOT to do**: Don't try pixel-perfect geometry extraction (already failed), don't tweak arc math, don't change AI models. These don't fix the root issue.

**What to do**: Add a **representation + layout** layer between AI and normalizer.

## User Scenarios & Testing

### User Story 1 — AI Outputs Representation, Not Just Type (Priority: P1)

A designer uploads a watchface image where steps are shown as text with an icon (not an arc). The AI vision stage returns `representation: "text+icon"` and `layout: "row"` instead of just `type: "steps"`.

**Why this priority**: The entire fix depends on the AI providing representation data. Without it, the normalizer has no signal to branch on.

**Independent Test**: Upload an image where battery is a text percentage (not an arc). Verify AI returns `{type: "battery", representation: "text", layout: "standalone"}`. NOT `{type: "battery", region: "top"}`.

**Acceptance Scenarios**:

1. **Given** a watchface image with steps shown as a number+icon in a right panel, **When** AI extraction runs, **Then** output contains `{type: "steps", representation: "text+icon", layout: "row", group: "right_panel"}`.
2. **Given** a watchface image with battery shown as a circular arc, **When** AI extraction runs, **Then** output contains `{type: "battery", representation: "arc", layout: "arc"}`.
3. **Given** a watchface image with heart rate shown as bold text, **When** AI extraction runs, **Then** output contains `{type: "heart_rate", representation: "text", layout: "standalone"}` — NOT `ARC_PROGRESS`.
4. **Given** any AI output, **When** validated, **Then** every element MUST have a `representation` field. Missing representation is a validation error.

---

### User Story 2 — Normalizer Branches on Representation (Priority: P1)

The normalizer stops forcing everything to ARC_PROGRESS. Instead, it uses **representation** to choose the widget:

| type + representation | Widget |
|---|---|
| steps + arc | ARC_PROGRESS |
| steps + text | TEXT_IMG |
| steps + text+icon | TEXT + IMG |
| battery + arc | ARC_PROGRESS |
| battery + text | TEXT_IMG |
| heart_rate + arc | ARC_PROGRESS |
| heart_rate + text | TEXT_IMG |
| heart_rate + text+icon | TEXT + IMG |

**Why this priority**: This is the core fix — breaking the `type → ARC_PROGRESS` mapping.

**Independent Test**: Pass `{type: "steps", representation: "text"}` to the normalizer. Verify output widget is `TEXT_IMG`, NOT `ARC_PROGRESS`.

**Acceptance Scenarios**:

1. **Given** element `{type: "steps", representation: "text"}`, **When** normalizer runs, **Then** output widget is `TEXT_IMG` with `dataType: "STEP"`.
2. **Given** element `{type: "battery", representation: "arc"}`, **When** normalizer runs, **Then** output widget is `ARC_PROGRESS` with `dataType: "BATTERY"`.
3. **Given** element `{type: "heart_rate", representation: "text+icon"}`, **When** normalizer runs, **Then** output produces TWO widgets: `TEXT_IMG` (heart value) + `IMG` (heart icon).
4. **Given** a design with 5 data elements and ZERO arcs, **When** pipeline runs, **Then** output contains ZERO `ARC_PROGRESS` widgets.

---

### User Story 3 — Geometry Solver Supports Multiple Layout Modes (Priority: P1)

The geometry solver stops assuming everything is a radial arc stack. It branches on the element's `layout` and `group`:

- `layout: "arc"` → use existing arc stacking logic (center/radius/angles)
- `layout: "row"` → vertical list in a panel (compute x, y from group position + index)
- `layout: "standalone"` → positioned by group region
- `layout: "grid"` → tile-based placement

**Why this priority**: Without layout branching, even correctly-typed TEXT_IMG widgets get no sensible position.

**Independent Test**: Create 3 elements in `group: "right_panel"` with `layout: "row"`. Verify they get vertically stacked coordinates (same x, increasing y), not radial arc positions.

**Acceptance Scenarios**:

1. **Given** 3 elements with `group: "right_panel", layout: "row"`, **When** geometry solver runs, **Then** elements get `x ≈ 260, y = baseY + index * spacing` — vertically stacked.
2. **Given** 2 elements with `layout: "arc"`, **When** geometry solver runs, **Then** elements get `center`, `radius`, `angles` — existing arc logic.
3. **Given** 1 element with `layout: "standalone", group: "bottom"`, **When** geometry solver runs, **Then** element gets a position in the bottom region.
4. **Given** a mixed design (1 arc + 3 text rows + 1 standalone), **When** geometry solver runs, **Then** each element uses its own layout mode — no contamination.

---

### User Story 4 — Group-Based Positioning (Priority: P2)

Elements with the same `group` are positioned together as a visual unit. Groups map to screen zones:

| Group | Approximate Zone |
|---|---|
| `center` | Screen center (240, 240) |
| `top` | Upper area |
| `bottom` | Lower area |
| `left_panel` | Left column (x ≈ 40–200) |
| `right_panel` | Right column (x ≈ 260–440) |
| `top_left` | Top-left quadrant |
| `top_right` | Top-right quadrant |
| `bottom_left` | Bottom-left quadrant |
| `bottom_right` | Bottom-right quadrant |

**Why this priority**: Groups eliminate the hardcoded `REGION_POSITIONS` map while still providing spatial structure.

**Independent Test**: Place 3 elements in `group: "right_panel"`. Verify all get x coordinates in the 260–440 range.

**Acceptance Scenarios**:

1. **Given** elements in `group: "right_panel"`, **When** positioned, **Then** all have `x >= 260`.
2. **Given** elements in `group: "center"`, **When** positioned, **Then** all are centered around (240, 240).
3. **Given** elements in two different groups, **When** positioned, **Then** groups don't overlap.

---

### User Story 5 — Compound Widget Expansion (Priority: P2)

When `representation` is compound (e.g., `text+icon`, `text+arc`), the normalizer expands a single AI element into multiple Zepp widgets that are grouped together.

**Why this priority**: Many real watchface designs show data as "icon + value" pairs, which requires two widgets per data point.

**Independent Test**: Pass `{type: "steps", representation: "text+icon"}` to the normalizer. Verify output is 2 elements: one `TEXT_IMG` for the number and one `IMG` for the icon, both sharing the same `group`.

**Acceptance Scenarios**:

1. **Given** element `{type: "steps", representation: "text+icon", group: "right_panel"}`, **When** normalized, **Then** output is 2 elements: `IMG` (steps icon) + `TEXT_IMG` (steps value), both in `group: "right_panel"`.
2. **Given** element `{type: "battery", representation: "text+arc"}`, **When** normalized, **Then** output is 2 elements: `ARC_PROGRESS` (battery arc) + `TEXT_IMG` (battery percentage).

---

### User Story 6 — Canvas Preview Matches Device Output (Priority: P3)

The design preview canvas uses the same resolved geometry as the V2 code generator.

**Why this priority**: If preview diverges from device, users can't trust the tool.

**Independent Test**: Generate a watchface with mixed widgets (text + arc + icon). Compare preview positions to extracted .zpk positions — must match within ±2px.

**Acceptance Scenarios**:

1. **Given** a generated watchface with 5+ mixed-type elements, **When** compared between preview and ZeppPlayer, **Then** all positions match within ±2px.

---

### Edge Cases

- What if AI returns no `representation` for an element? → Reject, require re-extraction. Do NOT fall back to hardcoded mapping.
- What if `representation: "arc"` but the design shows text? → AI error; the fix is in the prompt, not the normalizer.
- What if a `group` has only 1 element? → Still position it according to group zone; no special case.
- What if compound expansion produces too many widgets? → Cap at 2 widgets per AI element (icon + value).
- What if the design has no data elements (pure decorative)? → Pipeline produces only IMG widgets; no arcs or text.

## Requirements

### Functional Requirements

- **FR-001**: AI MUST output `representation` field for every element: `"text" | "arc" | "icon" | "text+icon" | "text+arc" | "number"`.
- **FR-002**: AI MUST output `layout` field: `"row" | "arc" | "standalone" | "grid"`.
- **FR-003**: AI MUST output `group` field: `"center" | "top" | "bottom" | "left_panel" | "right_panel" | "top_left" | "top_right" | "bottom_left" | "bottom_right"`.
- **FR-004**: AI MUST NOT output bare `region`. The `region` field is replaced by `group`.
- **FR-005**: Normalizer MUST branch on `representation` to choose widget type — NOT on `type` alone.
- **FR-006**: Normalizer MUST expand compound representations (`text+icon`, `text+arc`) into multiple widgets.
- **FR-007**: Geometry solver MUST branch on `layout` to choose positioning strategy.
- **FR-008**: Geometry solver MUST support at minimum: arc stacking, vertical row, and standalone positioning.
- **FR-009**: Geometry solver MUST NOT use hardcoded position constants (140, 180, etc.) for non-arc layouts.
- **FR-010**: Group positioning MUST keep elements within their zone without overlapping other groups.
- **FR-011**: Existing V2 generator (`jsCodeGeneratorV2.ts`) MUST NOT be modified.
- **FR-012**: Pipeline MUST be deterministic — same input always produces same output.
- **FR-013**: Bridge layer MUST NOT inject bounds for ARC_PROGRESS or center for TEXT widgets.

### Key Entities

- **AIElement**: `id`, `type`, `representation`, `layout`, `group`, `importance`, `style?`, `confidence?`
- **NormalizedElement**: AIElement + resolved `widget` type + `dataType` + `parentId?` (for expanded compounds)
- **LayoutElement**: NormalizedElement + computed `centerX`/`centerY` or `x`/`y`/`w`/`h` depending on layout mode
- **GeometryElement**: Full absolute pixel coordinates per widget type
- **ResolvedElement**: GeometryElement + asset paths

## Success Criteria

### Measurable Outcomes

- **SC-001**: A design with 5 data elements shown as TEXT produces ZERO `ARC_PROGRESS` widgets (the arc monoculture is broken).
- **SC-002**: A design with mixed representations (2 arcs + 3 text rows) produces exactly 2 `ARC_PROGRESS` + 3 `TEXT_IMG` widgets.
- **SC-003**: Elements in the same `group` are visually clustered in the output.
- **SC-004**: Canvas preview ≈ device output (±2px).
- **SC-005**: No hardcoded position constants in geometry solver for non-arc layouts.
- **SC-006**: V2 generator unchanged (zero diff).

## Assumptions

- AI vision model (Gemini/OpenAI) can distinguish between arc vs text vs icon representations when properly prompted with examples.
- The `representation` field is more reliable than bbox extraction (it's categorical, not spatial).
- Group-based positioning is sufficient for visual fidelity without pixel-perfect geometry extraction.
- Compound expansion (text+icon → 2 widgets) covers the most common watchface patterns.
- The existing arc stacking logic is correct and reusable for `representation: "arc"` elements.
