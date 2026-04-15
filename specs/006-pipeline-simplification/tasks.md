# Tasks 006: Pipeline Simplification

All tasks modify ONE file: `src/pipeline/index.ts`  
All other files remain untouched for rollback safety.

---

## Task 1: Remove Representation Corrector Import and Call

**File:** `src/pipeline/index.ts`

**Remove import (line 10):**
```typescript
// DELETE THIS LINE:
import { correctRepresentation } from './representationCorrector';
```

**Remove call and variable (approx lines 55-57):**
```typescript
// DELETE THESE LINES:
  const corrected = correctRepresentation(aiOutput);
  console.log('[Pipeline] Representation corrected:', corrected.length, 'elements');
```

**Update geometry extraction input (approx line 60):**
```typescript
// BEFORE:
  let geometryEnriched = extractGeometry(corrected);

// AFTER:
  let geometryEnriched = extractGeometry(aiOutput);
```

**Update fallback reference (approx line 67):**
```typescript
// BEFORE:
    geometryEnriched = corrected;

// AFTER:
    geometryEnriched = aiOutput;
```

**Verify:** `aiOutput` (type `AIElement[]`) flows directly into `extractGeometry()` which accepts `AIElement[]`. Type-safe.

---

## Task 2: Remove AI Call 2 (Stage B) — Always Use Code Normalizer

**File:** `src/pipeline/index.ts`

**Remove import of `normalizeWithAI` (line 17):**
```typescript
// BEFORE:
import { normalizeWithAI, resolveAmbiguities, type PipelineAIConfig } from './pipelineAIService';

// AFTER:
// (entire import removed — or keep only `type PipelineAIConfig` if still needed by PipelineOptions)
```

**Replace the entire Stage B block (approx lines 72-88) with direct call:**
```typescript
// DELETE THIS ENTIRE BLOCK:
  let normalized: NormalizedElement[];

  if (options.aiConfig) {
    log('Stage B: Normalizing elements with AI...');
    try {
      normalized = await normalizeWithAI(options.aiConfig, geometryEnriched);
      console.log('[Pipeline] Stage B (AI) normalized:', normalized.length, 'elements');
    } catch (err) {
      console.warn('[Pipeline] Stage B AI failed, falling back to code normalizer:', err);
      log('Stage B: AI failed, using code fallback...');
      normalized = normalize(geometryEnriched);
      console.log('[Pipeline] Stage B (code fallback) normalized:', normalized.length, 'elements');
    }
  } else {
    normalized = normalize(geometryEnriched);
    console.log('[Pipeline] Stage B (code-only) normalized:', normalized.length, 'elements');
  }

// REPLACE WITH:
  log('Normalizing elements...');
  let normalized: NormalizedElement[] = normalize(geometryEnriched);
  console.log('[Pipeline] Normalized:', normalized.length, 'elements');
```

**Verify:** `normalize()` returns `NormalizedElement[]`. Same type as before. All downstream code unchanged.

---

## Task 3: Remove AI Call 3 (Ambiguity Resolution) — Keep Code Fallback Only

**File:** `src/pipeline/index.ts`

**Replace the entire Call 3 block (approx lines 93-112) with simplified fallback:**
```typescript
// DELETE THIS ENTIRE BLOCK:
  const unresolvedArcs = normalized.filter(
    el => el.widget === 'ARC_PROGRESS' && !el.dataType,
  );

  if (unresolvedArcs.length > 0 && options.aiConfig) {
    log('Call 3: Resolving arc ambiguities with AI...');
    try {
      normalized = await resolveAmbiguities(options.aiConfig, normalized);
      console.log('[Pipeline] Call 3 resolved ambiguities');
    } catch (err) {
      console.warn('[Pipeline] Call 3 failed, assigning fallback data types:', err);
      normalized = assignFallbackDataTypes(normalized);
    }
    validateNormalized(normalized);
  } else if (unresolvedArcs.length > 0) {
    normalized = assignFallbackDataTypes(normalized);
    validateNormalized(normalized);
  }

// REPLACE WITH:
  // Assign fallback dataTypes to any ARC_PROGRESS missing them
  normalized = assignFallbackDataTypes(normalized);
```

**Verify:** `assignFallbackDataTypes()` is a local function in `index.ts` (approx line 135). It accepts and returns `NormalizedElement[]`. No external dependency.

---

## Task 4: Remove Semantic Priority Sort Call

**File:** `src/pipeline/index.ts`

**Remove import (line 13):**
```typescript
// DELETE THIS LINE:
import { sortArcsByPriority } from './semanticPriority';
```

**Remove the sort call (approx lines 115-118):**
```typescript
// DELETE THESE LINES:
  log('Applying semantic priority...');
  normalized = sortArcsByPriority(normalized);
  console.log('[Pipeline] Semantic priority applied — arcs sorted by data type');
```

**Verify:** `semanticPriority.ts` still exists. Its exports `getPriority()` and `getMockValue()` are still imported by `geometrySolver.ts`. Only the `sortArcsByPriority` import from `index.ts` is removed.

---

## Task 5: Update Module Comment and Remove `resolveAmbiguities` Import

**File:** `src/pipeline/index.ts`

**Update top comment (lines 1-4):**
```typescript
// BEFORE:
// Pipeline Orchestrator — Multi-stage pipeline with AI + deterministic stages.
// Stage A (AI vision) → Validate (representation/layout/group) → Normalize (representation → widget)
// → Resolve ambiguities → Priority sort → Layout (group + mode) → Geometry → Assets → V2 Bridge
// Normalizer branches on representation, not type. Code fallback if AI normalization fails.

// AFTER:
// Pipeline Orchestrator — Deterministic pipeline. AI vision done upstream (AppContext).
// Validate → Geometry Clamp → Normalize (code) → Layout → Geometry → Assets → Code Gen → Bridge
```

**Clean up remaining imports:**
Ensure `normalizeWithAI`, `resolveAmbiguities` are no longer imported. If `PipelineAIConfig` is still used by `PipelineOptions.aiConfig`, keep the type import. If `aiConfig` is no longer consumed in the function body, consider keeping it in the interface anyway (it's consumed by `AppContext.tsx` to pass to AI Call 1).

---

## Task 6: Remove `onProgress` Calls for Deleted Steps

**File:** `src/pipeline/index.ts`

Remove or update `log()` calls that referenced deleted stages:
- ~~`log('Stage B: Normalizing elements with AI...')`~~ → replaced in Task 2
- ~~`log('Call 3: Resolving arc ambiguities with AI...')`~~ → removed in Task 3
- ~~`log('Applying semantic priority...')`~~ → removed in Task 4

Remaining valid `log()` calls:
- `log('Geometry extraction: validating spatial data...')` ✅
- `log('Normalizing elements...')` ✅ (added in Task 2)
- `log('Stage C: Computing layout...')` ✅
- `log('Stage D: Solving geometry...')` ✅
- `log('Stage E: Resolving assets...')` ✅
- `log('Stage F: Generating code...')` ✅

---

## Task 7: Build and Verify

**Commands:**
```bash
cd "d:\Zepp Watchface maker website\Kimi_Agent_Untitled Chat\app"
npm run build
```

**Verify:**
1. Build succeeds (exit code 0)
2. No TypeScript errors
3. New `dist/assets/index-*.js` generated
4. Search compiled output for `[Pipeline] Normalized:` string to confirm new flow is in build

---

## Task 8: Verify No Broken Imports Across Codebase

**Check that no other file imports the removed functions from `index.ts`:**

Files to check:
- `src/context/AppContext.tsx` — imports `runPipeline` from `pipeline/index.ts`. This is fine; `runPipeline` signature unchanged.
- No other file imports `correctRepresentation`, `normalizeWithAI`, `resolveAmbiguities`, or `sortArcsByPriority` from `index.ts` — those were internal to the orchestrator.

**Verify:** `pipelineAIService.ts` exports are still valid (used by `AppContext.tsx` for AI Call 1). Only the Stage B + Call 3 exports become unused dead code, which is fine.

---

## Summary: Exact Lines Changed in `index.ts`

| Action | What | Lines (approx) |
|--------|------|-----------------|
| Remove import | `correctRepresentation` | line 10 |
| Remove import | `sortArcsByPriority` | line 13 |
| Remove import | `normalizeWithAI, resolveAmbiguities` | line 17 |
| Remove call | `correctRepresentation(aiOutput)` | lines 55-57 |
| Change input | `extractGeometry(corrected)` → `extractGeometry(aiOutput)` | line 60 |
| Change fallback | `geometryEnriched = corrected` → `geometryEnriched = aiOutput` | line 67 |
| Replace block | Stage B AI branch → `normalize(geometryEnriched)` | lines 72-88 |
| Replace block | Call 3 AI branch → `assignFallbackDataTypes(normalized)` | lines 93-112 |
| Remove call | `sortArcsByPriority(normalized)` | lines 115-118 |
| Update comment | Module header | lines 1-4 |

**Total: ~50 lines removed, ~10 lines added/modified. One file.**

---

## Post-Implementation: What to Watch

After deploying, generate a few test watchfaces and check:
1. Arcs render at AI-specified positions (not reordered)
2. Designs with 3+ arcs produce 3+ arcs (not capped at 2)
3. Steps shown as arcs render as arcs (not forced to text+icon)
4. Generation is noticeably faster (~5s fewer API calls)
5. No TypeScript errors in build
