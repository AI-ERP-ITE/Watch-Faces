# Tasks: Full Project Audit & Structural Recovery

## Phase 1 — Structure
- [ ] T001 List all folders and entry points
- [ ] T002 Identify duplicate or unused directories
- [ ] T003 Remove invalid/unused folders

## Phase 2 — Build Fix
- [ ] T004 Run build locally
- [ ] T005 Verify dist/ output
- [ ] T006 Copy dist/ → docs/
- [ ] T007 Fix GitHub Pages settings

## Phase 3 — Pipeline
- [ ] T008 Trace runPipeline() usage
- [ ] T009 Remove duplicate pipeline paths
- [ ] T010 Ensure single orchestrator

## Phase 4 — ZPK Generation
- [ ] T011 Locate ZPK creation logic
- [ ] T012 Fix output directory
- [ ] T013 Ensure download works in UI

## Phase 5 — Preview
- [ ] T014 Identify all preview components
- [ ] T015 Remove conflicting ones
- [ ] T016 Keep single rendering source

## Phase 6 — Asset Validation
- [ ] T017 Ensure all PNGs generated
- [ ] T018 Validate asset paths

## Phase 7 — Cleanup
- [ ] T019 Remove dead code
- [ ] T020 Fix imports
- [ ] T021 Standardize file roles

## Phase 8 — End-to-End Test
- [ ] T022 Upload design → generate ZPK
- [ ] T023 Install on device
- [ ] T024 Compare with preview

## Completion Criteria
- Website functional
- ZPK generated and downloadable
- Pipeline consistent
- No duplicate logic
- Clean structure
