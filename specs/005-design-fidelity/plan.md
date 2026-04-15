# Plan: Close the 4-Watchface Gap

## Summary

Fix the pipeline so user-uploaded design → AI extraction → preview → device all produce visually consistent output. The core problem is that the geometry solver overwrites AI-extracted coordinates with hardcoded constants.

## Approach: "Preserve First, Fallback Second"

Every pipeline stage must follow this rule:
> If the AI provided a value, USE IT. Only compute a fallback if the value is missing.

## Phase 1 — AI Prompt Rewrite
- Rewrite `aiPrompt.ts` to demand exact coordinates
- Add color extraction per element
- Add size/thickness for arcs
- Add font size estimates for text
- Test: AI output includes coords + colors

## Phase 2 — Geometry Solver Passthrough
- Modify `geometrySolver.ts`: check for existing values before computing
- Remove hardcoded `TIME_CENTER_X = 140`
- Remove `ARC_BASE_RADIUS - (priority * SPACING)` when AI provided radius
- Remove preset text dimensions when AI provided bounds
- Test: config coordinates = AI coordinates

## Phase 3 — Asset Color Match
- Pass AI-reported colors to `assetImageGenerator.ts`
- Replace hardcoded color palette with per-element colors
- Generate hand/digit/arc images in user's design colors
- Test: generated PNGs match design intent

## Phase 4 — Preview Alignment
- Fix `CanvasWatchPreview` to render asset images (not primitives)
- OR: remove canvas preview, keep only WatchPreview
- Test: preview matches ZPK output visually

## Phase 5 — ZPK Filename Fix
- Replace name-substring matching with ID-based filename map
- Guarantee every element has a filename before build
- Test: all assets present in extracted ZPK

## Risks

| Risk | Mitigation |
|------|-----------|
| AI returns bad coordinates | Validate ranges, fall back to solver if out of bounds |
| Removing solver breaks edge cases | Solver becomes fallback-only, still available |
| Color extraction unreliable | Default to current palette if AI can't extract |
| Build size increases | Colors add minimal data to AIElement |

## Testing Strategy

1. Upload a known design (e.g. a reference watchface screenshot)
2. Extract AIElement[] — verify coords match visible positions
3. Check WatchFaceConfig — verify solver didn't override
4. Extract ZPK — verify index.js uses same coords
5. Compare preview screenshot with ZPK code positions
