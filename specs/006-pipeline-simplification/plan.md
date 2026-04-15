# Plan 006: Pipeline Simplification

## Approach: Single-File Orchestrator Edit

All changes are confined to ONE file: `pipeline/index.ts`. This is the orchestrator that chains the steps together. We modify what it calls, not the underlying modules.

The removed modules stay in the codebase untouched (not deleted) as rollback insurance.

## Phases

### Phase 1: Remove Representation Corrector Call
**Risk: LOW** — The corrector only modifies AI output; removing it lets AI output pass through unmodified.

1. In `pipeline/index.ts`, remove the `correctRepresentation()` call
2. Wire geometry extraction to receive `aiOutput` directly (after validation) instead of `corrected`
3. Build and verify: no compile errors, types still align

**Verification:** `AIElement[]` flows from validate → geometry extraction unchanged. Types are compatible because corrector returned `AIElement[]` (same type as input).

### Phase 2: Remove AI Call 2 (Stage B) — Use Code Normalizer Only  
**Risk: LOW** — Code normalizer is the existing fallback that already works.

1. In `pipeline/index.ts`, remove the `if (options.aiConfig)` branch for Stage B
2. Always call `normalize(geometryEnriched)` directly
3. Remove the `normalizeWithAI` import

**Verification:** `normalize()` returns `NormalizedElement[]` — same type that Stage B AI call returned. All downstream consumers expect `NormalizedElement[]`. No type mismatch.

### Phase 3: Remove AI Call 3 (Ambiguity Resolution)
**Risk: LOW** — Fallback already handles this.

1. In `pipeline/index.ts`, remove the `if (unresolvedArcs.length > 0 && options.aiConfig)` branch
2. Keep only the code fallback: `assignFallbackDataTypes(normalized)`
3. Remove the `resolveAmbiguities` import

**Verification:** The code fallback `assignFallbackDataTypes()` is already defined locally in `index.ts`. It assigns dataTypes from `ARC_FALLBACK_PRIORITY`. Same output type.

### Phase 4: Remove Semantic Priority Sort Call
**Risk: LOW** — Sort only reorders elements; removing it preserves AI's original order.

1. In `pipeline/index.ts`, remove the `sortArcsByPriority()` call
2. Remove the import for `sortArcsByPriority`
3. Keep `semanticPriority.ts` file intact (its `getPriority`/`getMockValue` exports are still used by `geometrySolver.ts`)

**Verification:** `NormalizedElement[]` passes directly to layout without reordering. Type unchanged.

### Phase 5: Clean Up Pipeline Options
**Risk: NONE** — Cosmetic.

1. The `aiConfig` field in `PipelineOptions` is no longer consumed by the orchestrator for Calls 2 and 3
2. Keep it in the interface (it's still needed for AI Call 1 which happens BEFORE the pipeline, in `AppContext.tsx`)
3. Remove the `log()` calls for removed stages
4. Update console.log messages to reflect simplified flow

### Phase 6: Build + Test
1. `npm run build` — must succeed
2. Verify no TypeScript errors
3. Test with existing zpk files to confirm output is valid

## What We Do NOT Touch

- `representationCorrector.ts` — stays in repo, just not imported
- `pipelineAIService.ts` — stays in repo; `extractElementsFromImage()` (AI Call 1) is still used by `AppContext.tsx`
- `semanticPriority.ts` — stays in repo; `getPriority()`/`getMockValue()` still used by `geometrySolver.ts`
- `aiPrompt.ts` — stays as-is; AI Call 1 prompt unchanged
- `normalizer.ts` — stays as-is; now the primary (not fallback) normalizer
- `layoutEngine.ts` — stays as-is; self-bypasses when bounds present
- `geometrySolver.ts` — stays as-is; preserves AI geometry first
- `assetResolver.ts` — stays as-is
- All type definitions — unchanged
- All UI components — unchanged

## Dependency Graph (what calls what)

### Before:
```
index.ts imports:
  ├── validators.ts ✅ (keep)
  ├── representationCorrector.ts ❌ (remove import)
  ├── geometryExtractor.ts ✅ (keep)
  ├── normalizer.ts ✅ (keep — now primary)
  ├── semanticPriority.ts ❌ (remove sortArcsByPriority import)
  ├── layoutEngine.ts ✅ (keep)
  ├── geometrySolver.ts ✅ (keep)
  ├── assetResolver.ts ✅ (keep)
  ├── jsCodeGenerator.ts ✅ (keep)
  └── pipelineAIService.ts ❌ (remove normalizeWithAI + resolveAmbiguities imports)
```

### After:
```
index.ts imports:
  ├── validators.ts
  ├── geometryExtractor.ts
  ├── normalizer.ts
  ├── layoutEngine.ts
  ├── geometrySolver.ts
  ├── assetResolver.ts
  └── jsCodeGenerator.ts
```

## Estimated Impact

- `pipeline/index.ts`: ~50 lines removed, ~10 lines modified
- 0 files deleted
- 0 type changes
- 0 prompt changes
- 0 UI changes
