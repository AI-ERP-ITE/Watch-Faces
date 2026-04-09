# Tasks: Representation-Aware Pipeline (Break the Arc Monoculture)

**Input**: `specs/001-geometry-pipeline/plan.md`, `specs/001-geometry-pipeline/spec.md`  
**Prerequisites**: Plan approved, root cause understood

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1–US6)

---

## Phase 1: Types (Blocking)

**Purpose**: New type fields must exist before any stage can be updated.

- [ ] T001 [US1/US2] Update `src/types/pipeline.ts` — add to `AIElement`: `representation: Representation` (`"text" | "arc" | "icon" | "text+icon" | "text+arc" | "number"`), `layout: LayoutMode` (`"row" | "arc" | "standalone" | "grid"`), `group: Group` (replaces `region` — `"center" | "top" | "bottom" | "left_panel" | "right_panel" | "top_left" | "top_right" | "bottom_left" | "bottom_right"`), `importance?: "primary" | "secondary"`. Remove `region` from `AIElement`. Add `Representation`, `LayoutMode`, `Group` type aliases. Add `layout` and `group` to `NormalizedElement`. Add optional `parentId?: string` to `NormalizedElement` for compound expansion tracking.
- [ ] T002 [US4] Update `src/pipeline/constants.ts` — replace `REGION_POSITIONS` with `GROUP_ZONES: Record<Group, {x, y, w, h}>` mapping each group to its bounding rectangle on the 480×480 screen. Keep `SCREEN`, `TIME_DIGIT`, `DATE_DIGIT`, `ARC_BASE_RADIUS`, `ARC_SPACING`, and all asset dimension constants.

**Checkpoint**: Types compile, existing runtime unchanged.

---

## Phase 2: AI Prompt — Representation Detection (US1)

**Goal**: AI returns representation + layout + group instead of just type + region.

- [ ] T003 [US1] Rewrite `AI_SYSTEM_PROMPT` in `src/pipeline/aiPrompt.ts` — new schema demands `representation`, `layout`, `group`, `importance` per element. Remove `region` and `style` fields. Add 5+ few-shot examples:
  - Example 1: Digital watch with text stats in right panel → steps/battery/heart each with `representation: "text"`, `layout: "row"`, `group: "right_panel"`
  - Example 2: Analog watch with arc complications → battery/steps with `representation: "arc"`, `layout: "arc"`, `group: "center"`
  - Example 3: Mixed design → time center, arcs center, text panel right
  - Example 4: Icon+text rows → steps with `representation: "text+icon"`, `layout: "row"`
  - Example 5: Minimal design → only time + date, standalone layout
- [ ] T004 [P] [US1] Update `src/pipeline/pipelineAIService.ts` — update response parsing to expect new `AIElement` shape (representation/layout/group fields). Retry logic unchanged. `normalizeWithAI()` must pass representation through.

**Checkpoint**: AI extraction returns representation-aware elements.

---

## Phase 3: Validation Update (US1)

**Goal**: Reject elements missing representation; remove forbidden spatial keys.

- [ ] T005 [US1] Update `src/pipeline/validators.ts`:
  - `validateAIOutput()`: require `representation` (from allowed set), `layout` (from allowed set), `group` (from allowed set) on every element. Reject if any missing.
  - Remove `FORBIDDEN_SPATIAL_KEYS` check (no longer relevant — we're not getting coords from AI).
  - Keep type validation (must be from `AIElementType` set).
  - Add `validateRepresentation()` helper.

**Checkpoint**: Validation enforces new schema.

---

## Phase 4: Normalizer Rewrite — The Core Fix (US2, US5)

**Goal**: Break the `type → ARC_PROGRESS` mapping. Branch on representation.

- [ ] T006 [US2] Rewrite `normalize()` in `src/pipeline/normalizer.ts`:
  - **DELETE** the `TYPE_TO_WIDGET` hardcoded map.
  - **REPLACE** with `mapByRepresentation(type, representation)`:
    - `time` → `representation === 'arc' ? 'TIME_POINTER' : 'IMG_TIME'`
    - `date` → `'IMG_DATE'` (always)
    - `weekday` → `'IMG_WEEK'` (always)
    - `month` → `'IMG_DATE'` (always)
    - Any type + `representation === 'arc'` → `'ARC_PROGRESS'`
    - Any type + `representation === 'text'` → `'TEXT_IMG'`
    - Any type + `representation === 'number'` → `'TEXT_IMG'`
    - Any type + `representation === 'icon'` → `'IMG'`
    - Any type + `representation === 'text+icon'` → expand to `['TEXT_IMG', 'IMG']`
    - Any type + `representation === 'text+arc'` → expand to `['ARC_PROGRESS', 'TEXT_IMG']`
  - Keep `TYPE_TO_DATA_TYPE` mapping (dataType binding is still by semantic type).
  - Pass `layout` and `group` through to `NormalizedElement`.
- [ ] T007 [US5] Implement compound expansion in normalizer — when representation is `text+icon` or `text+arc`, produce 2 `NormalizedElement` entries from 1 `AIElement`. Both share same `group` and `layout`. Second element gets `parentId` pointing to first. Cap at 2 widgets per expansion.

**Checkpoint**: `{type: "steps", representation: "text"}` → `TEXT_IMG`. `{type: "battery", representation: "arc"}` → `ARC_PROGRESS`. The arc monoculture is broken.

---

## Phase 5: Layout Engine — Group + Layout Mode (US3, US4)

**Goal**: Position elements by group zone and layout mode, not by region anchor.

- [ ] T008 [US3/US4] Rewrite `applyLayout()` in `src/pipeline/layoutEngine.ts`:
  - **DELETE** `REGION_POSITIONS` map and `CENTER_LOCKED_WIDGETS` list.
  - **REPLACE** with group-zone-based positioning:
    - Group elements by `group` field.
    - For each group, get zone from `GROUP_ZONES` in constants.
    - Within each group, apply layout mode:
      - `layout: "arc"` → center-lock at screen center (240, 240) — same as current behavior for arcs. Assign `centerX = 240, centerY = 240`.
      - `layout: "row"` → vertical stack within zone: `centerX = zone.x + zone.w/2, centerY = zone.y + padding + index * rowHeight`. Use `rowHeight = 44` (TEXT_IMG digit height + 4px gap).
      - `layout: "standalone"` → center within zone: `centerX = zone.x + zone.w/2, centerY = zone.y + zone.h/2`.
      - `layout: "grid"` → (future) grid placement within zone.
  - Output: `LayoutElement[]` with `centerX, centerY` assigned.

**Checkpoint**: Row elements get stacked vertically in their zone. Arc elements still center-lock. No hardcoded region positions.

---

## Phase 6: Geometry Solver — Layout Branching (US3)

**Goal**: Add row/standalone geometry alongside existing arc geometry.

- [ ] T009 [US3] Update `solveGeometry()` in `src/pipeline/geometrySolver.ts`:
  - **KEEP** all existing arc logic intact (`ARC_PROGRESS` → center/radius/angles/lineWidth computed from priority).
  - **ADD** new branch for non-arc widgets:
    ```
    if layout === "row" or layout === "standalone":
      x = centerX - defaultWidth/2
      y = centerY - defaultHeight/2
      w = defaultWidth
      h = defaultHeight
    ```
    Use `DEFAULT_SIZES` from constants for TEXT_IMG (160×50), IMG (60×60), TEXT (200×40).
  - **KEEP** TIME_POINTER and IMG_TIME logic unchanged (they're always center/top positioned).
  - Arc elements continue using `radius = ARC_BASE_RADIUS - priority * ARC_SPACING`.
- [ ] T010 [P] [US3] Keep `src/pipeline/semanticPriority.ts` unchanged — it only runs on `ARC_PROGRESS` elements. Verify it still works (may need import update for new type fields).

**Checkpoint**: Arc elements get arc geometry. Text/icon elements get bbox geometry. Mixed designs produce mixed widget types.

---

## Phase 7: Bridge Fix (US3)

**Goal**: Stop injecting fake bounds for arcs, stop using center as bounds for text.

- [ ] T011 [US3] Fix `resolvedToWatchFaceElement()` in `src/pipeline/index.ts`:
  - **REMOVE** line: `bounds.x = el.x ?? el.centerX` (the root bug)
  - **REPLACE** with widget-specific coordinate assignment:
    - `ARC_PROGRESS`: set `center`, `radius`, `startAngle`, `endAngle`, `lineWidth`, `dataType`, `color`. Set `bounds` to `{x: 0, y: 0, width: 480, height: 480}` as container only.
    - `TEXT_IMG` / `TEXT` / `IMG`: set `bounds` from `{x: el.x, y: el.y, width: el.w, height: el.h}`. Do NOT set `center`.
    - `IMG_TIME`: set `bounds` from computed startX/startY. Do NOT set `center`.
    - `TIME_POINTER`: set `center` from `{x: el.centerX, y: el.centerY}`, set `bounds` to full screen.
- [ ] T012 [P] Update `mapWidgetToName()` — ensure TEXT_IMG elements for data types get descriptive names the V2 generator can route (e.g., `"Steps Value 0"`, `"Battery Value 1"`).

**Checkpoint**: Bridge outputs widget-appropriate fields only. No cross-contamination.

---

## Phase 8: Pipeline Orchestrator Update

**Goal**: Wire updated stages together.

- [ ] T013 Update `runPipeline()` in `src/pipeline/index.ts` — updated flow:
  1. Receive `AIElement[]` (with representation/layout/group)
  2. `validateAIOutput(aiOutput)` — checks representation, layout, group
  3. `normalize(aiOutput)` → `NormalizedElement[]` (branches on representation, expands compounds)
  4. Resolve unresolved arc dataTypes (same as current)
  5. `sortArcsByPriority(normalized)` — only for ARC_PROGRESS elements
  6. `applyLayout(normalized)` → `LayoutElement[]` (group + layout mode)
  7. `solveGeometry(layouted)` → `GeometryElement[]` (per-layout-mode coords)
  8. `resolveAssets(geometry)` → `ResolvedElement[]`
  9. `bridgeToWatchFaceConfig(resolved, options)` → V2 code

**Checkpoint**: End-to-end pipeline compiles and runs with new architecture.

---

## Phase 9: Preview Alignment (US6)

- [ ] T014 [US6] Audit preview component(s) — ensure they consume `ResolvedElement[]` from pipeline output, not a separate geometry path. If preview has its own positioning, replace with pipeline output.

**Checkpoint**: Preview and device output use identical geometry.

---

## Phase 10: Validation & Deployment

- [ ] T015 Build: `npm run build` — must succeed with 0 errors.
- [ ] T016 Test 1 — Arc-only design: Upload a design with all arcs. Verify output still produces ARC_PROGRESS widgets correctly (regression test).
- [ ] T017 Test 2 — Text-only design: Upload a design with all text stats. Verify output produces ZERO ARC_PROGRESS, all TEXT_IMG widgets.
- [ ] T018 Test 3 — Mixed design: Upload a design with 2 arcs + 3 text rows. Verify output has exactly 2 ARC_PROGRESS + 3 TEXT_IMG.
- [ ] T019 Grep verification: `grep -r "ARC_PROGRESS" src/pipeline/normalizer.ts` — must NOT appear as a hardcoded default for data types.
- [ ] T020 Extract .zpk and compare against reference (`extracted_reference/device/`).
- [ ] T021 Deploy per DEPLOYMENT_PROTOCOL.md: build → copy dist→docs → git push → test on live site.

**Checkpoint**: Feature complete, arc monoculture broken, deployed, verified.
