# Tasks — Visual Geometry Extraction Layer

## Phase 1 — Geometry Extraction

- [ ] **T001** Create `geometryExtractor.ts`
- [ ] **T002** Implement `extractGeometry(elements, image)`

## Phase 2 — AI Prompt Update

- [ ] **T003** Update vision prompt to request:
  - `bounds`
  - `center`
  - `radius`
  - `angles`

## Phase 3 — Validation

- [ ] **T004** Add `validateGeometryExtraction()`
- [ ] **T005** Reject elements without `bounds`

## Phase 4 — Pipeline Integration

- [ ] **T006** Insert extraction stage after AI
- [ ] **T007** Pass enriched elements forward

## Phase 5 — Layout Bypass

- [ ] **T008** Modify `layoutEngine.ts`
- [ ] **T009** Skip positioning when `bounds` exist

## Phase 6 — Geometry Pass-Through

- [ ] **T010** Modify `geometrySolver.ts`
- [ ] **T011** Preserve existing `radius`/`angles`

## Phase 7 — Representation Adjustment

- [ ] **T012** Update normalizer to consider geometry
- [ ] **T013** Prioritize shape over representation

## Phase 8 — Preview Fix

- [ ] **T014** Unify preview rendering source
- [ ] **T015** Remove bounds/center mismatch

## Phase 9 — Testing

- [ ] **T016** Test circular designs
- [ ] **T017** Test list layouts
- [ ] **T018** Compare with original images

## Phase 10 — Regression

- [ ] **T019** Ensure fallback works without geometry
- [ ] **T020** Ensure old pipeline still functional

---

## Completion Criteria

- Visual output matches input design structure
- No artificial layout shifts
- Arcs/text/icons align with original positions
- Preview matches installed watchface
