# Plan: Full Project Audit & Structural Recovery

## Summary

Perform controlled audit in phases: Structure → Build → Pipeline → Output

## Phase 1 — Structure Audit
- Verify folder layout: /app/src/, /app/dist/, /app/docs/
- Ensure no duplicate entry points

## Phase 2 — Build & Deploy Fix
- Run: npm run build
- Copy: dist → docs
- Verify GitHub Pages config

## Phase 3 — Pipeline Audit
Trace full flow: UI → runPipeline() → generator → assets → ZPK
Check: single execution path, no branching duplicates, no abandoned logic

## Phase 4 — Output Validation
Verify: ZPK structure, index.js correctness, assets presence, install success

## Phase 5 — Cleanup
- Remove duplicates
- Remove dead code
- Standardize naming

## Risks

| Risk | Mitigation |
|---|---|
| Breaking working parts | Isolate changes |
| Removing required code | Audit before delete |
| Build mismatch | Test after each phase |

## Testing Strategy
- Local build test
- GitHub Pages test
- ZPK install test
- Preview vs output comparison
