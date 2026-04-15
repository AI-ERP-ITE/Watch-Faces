# Feature 004: Full Project Audit & Structural Recovery

## Problem

The repository is in an inconsistent and partially broken state:
- ZPK output not stored in correct location
- Website (GitHub Pages) not loading or broken
- Build artifacts (dist/docs) possibly misaligned
- Pipeline files modified inconsistently
- Duplicate/removed logic causing regressions
- Preview vs generated output mismatch
- Unknown side effects from automated refactors

Root issue: Project structure and build flow integrity has been compromised.

## Goal

Perform a full deterministic audit and recovery to:
- Restore correct build → deploy → preview flow
- Ensure ZPK generation works end-to-end
- Re-align folder structure with expected architecture
- Remove broken/duplicate logic safely
- Establish single source of truth for pipeline and output

## Non-Goals

- No feature additions
- No architecture redesign
- No geometry/AI improvements
- No refactoring beyond structural correction

## Functional Requirements

### FR-001 — Build Output Integrity
- `app/dist/` must contain valid production build
- `app/docs/` must mirror `dist/` exactly
- GitHub Pages must serve from `/docs`

### FR-002 — ZPK Output Location
ZPK must be: generated → downloadable → consistent path
No duplicates.

### FR-003 — Pipeline Consistency
- Only ONE pipeline flow must exist
- Remove duplicate or abandoned implementations
- Ensure: runPipeline() → V2 generator → ZPK is the ONLY path

### FR-004 — Preview Consistency
- Only ONE preview system allowed
- Must use same data source as generator
- Remove conflicting renderers

### FR-005 — File Responsibility Clarity

| File | Responsibility |
|---|---|
| pipelineAIService.ts | AI calls only |
| geometryExtractor.ts | geometry enrichment |
| normalizer.ts | mapping |
| layoutEngine.ts | fallback only |
| geometrySolver.ts | transformation only |
| index.ts | orchestration |

No overlapping logic.

### FR-006 — Remove Dead Code
- Remove unused functions
- Remove duplicate pipelines
- Remove commented legacy logic
- Ensure no orphan imports

### FR-007 — Asset Pipeline Integrity
- Ensure generated images exist before packaging
- Validate: /assets/*.png present in ZPK

### FR-008 — ZPK Packaging Flow
Ensure: config → assets → index.js → zip → .zpk
All steps executed in order.

### FR-009 — Error Handling
Fail fast on: missing assets, invalid config, broken pipeline output

## Success Criteria

- SC-001: Website loads correctly from GitHub Pages
- SC-002: ZPK downloads successfully
- SC-003: Installed watchface matches preview (structure-wise)
- SC-004: No duplicate pipelines or conflicting logic
- SC-005: Clean, readable project structure

## Constraints

- No breaking working generator logic
- No changes to external APIs
- Maintain current framework (Vite + React)
