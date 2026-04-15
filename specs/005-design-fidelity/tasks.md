# Tasks: Close the 4-Watchface Gap

## Phase 1 — AI Prompt Precision
- [ ] T001 Rewrite aiPrompt.ts: require exact coordinates (not approximate)
- [ ] T002 Add color extraction per element to prompt
- [ ] T003 Add arc thickness/radius to prompt output schema
- [ ] T004 Add text size estimates to prompt output schema
- [ ] T005 Test: verify AI returns precise coords + colors

## Phase 2 — Geometry Solver Passthrough
- [ ] T006 geometrySolver.ts: ARC — use AI radius/sweep if provided, fallback only if missing
- [ ] T007 geometrySolver.ts: TIME_POINTER — use AI center if provided, fallback to (240,240)
- [ ] T008 geometrySolver.ts: TEXT — use AI bounds if provided, fallback to preset sizes
- [ ] T009 layoutEngine.ts: never override AI-provided positions
- [ ] T010 geometryExtractor.ts: pass through AI geometry unchanged
- [ ] T011 Test: config coordinates = AI coordinates (no overwrites)

## Phase 3 — Asset Colors
- [ ] T012 Extend AIElement type with color field
- [ ] T013 Pass colors through pipeline to assetImageGenerator
- [ ] T014 assetImageGenerator: use per-element colors instead of hardcoded palette
- [ ] T015 Test: generated PNGs use design-faithful colors

## Phase 4 — Preview Fix
- [ ] T016 Decide: fix CanvasWatchPreview or remove it
- [ ] T017 Implement: single accurate preview that matches ZPK output
- [ ] T018 Test: preview layout matches extracted ZPK positions

## Phase 5 — ZPK Filename Fix
- [ ] T019 zpkBuilder.ts: replace name-substring matching with ID-based map
- [ ] T020 Validate all assets present before ZPK packaging
- [ ] T021 Test: extracted ZPK has all referenced assets

## Phase 6 — End-to-End Validation
- [ ] T022 Upload reference design → full pipeline → extract ZPK
- [ ] T023 Compare: upload positions vs config positions vs ZPK code positions
- [ ] T024 Verify preview matches device output

## Completion Criteria
- Upload design → Preview shows same layout
- Preview → Device shows same layout
- No hardcoded coordinate overrides when AI provided values
- Colors from user design, not hardcoded palette
- All assets present in ZPK with correct filenames
