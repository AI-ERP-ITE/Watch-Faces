# Spec 006: Pipeline Simplification — Remove Redundant Steps

## Problem Statement

The current pipeline has **12 steps and 3 AI calls** to convert a watchface image into a `.zpk` file. Several steps are redundant, contradictory, or actively harmful to design fidelity:

1. **AI Call 2 (Stage B)** and **AI Call 3** duplicate work that `normalizer.ts` already handles with a 50-line deterministic code fallback. They cost money, add latency (2-3s each), and can fail — at which point the pipeline falls back to the code normalizer anyway.

2. **Representation Corrector** overrides what the AI actually saw with hardcoded rules (e.g., `MAX_ARCS = 2`, "steps must be text+icon"). This destroys user designs that intentionally have 3+ arcs or show steps as arcs.

3. **Semantic Priority Sort** reorders arcs by a fixed importance hierarchy, ignoring the AI's actual radius/position data. If the user's design has heart rate as the outermost ring, the sort moves it inward.

4. **Layout Engine** is 100+ lines but already bypasses itself when AI provides bounds (which it always does now). It's a complex dead-code fallback.

## Root Cause

These steps were added when AI Call 1's prompt was weaker and didn't return geometry (bounds, radius, angles). They compensated for missing data. Now that AI Call 1 returns full geometry + bounds for every element, the compensation layers are redundant.

## Proposed Change: Remove 4 Steps, Simplify 2

### Current Pipeline (12 steps, 3 AI calls)
```
AI Call 1 → Validate → Correct → Geometry Extract → AI Call 2 → AI Call 3
→ Priority Sort → Layout → Geometry Solve → Assets → Code Gen → ZPK
```

### Proposed Pipeline (7 steps, 1 AI call)
```
AI Call 1 → Validate → Geometry Clamp → Normalize (code) → Geometry Solve → Assets → Code Gen → ZPK
```

---

## Detailed Change List

### REMOVE: Representation Corrector (`representationCorrector.ts`)

**What it does:** 5 rules that override AI output:
- Rule 1: `MAX_ARCS = 2` — caps arcs, downgrades extras to text
- Rule 2: Layout feasibility — converts arc layouts to row  
- Rule 3: Group redistribution — reassigns groups if all center
- Rule 4: Type overrides — forces steps/battery/heart to text+icon
- Rule 5: Decorative arc detection — converts weak arcs to icons

**Why remove:** Every rule contradicts the goal of reproducing the user's design:
- If the design has 5 arcs, the user wants 5 arcs
- If the design shows steps as an arc, steps should be an arc
- AI Call 1 already distinguishes decorative vs data arcs (prompt says: "Decorative background arcs are NOT elements — do NOT report them unless they display data")

**Risk if removed:** AI might report too many arcs. **Mitigation:** Already handled — `geometrySolver.ts` stacks arcs by priority only when AI didn't provide geometry. If AI gives radius/angles, they're used as-is. No limit needed.

**Files affected:**
- Remove import + call in `pipeline/index.ts`
- File `representationCorrector.ts` becomes unused (don't delete yet, keep for rollback)

---

### REMOVE: AI Call 2 — Stage B Normalization (`normalizeWithAI()`)

**What it does:** Sends element list (text only, no image) to Gemini 2.0 Flash asking it to map elements → Zepp widgets + dataTypes.

**Why remove:** The code fallback `normalizer.ts` → `normalize()` does the identical job:
- `mapByRepresentation(type, representation)` → ZeppWidget (15 lines of if/else)
- `TYPE_TO_DATA_TYPE[type]` → dataType (15-line lookup table)
- Already handles compound expansion (text+icon → TEXT_IMG + IMG)
- Already carries geometry forward (bounds, center, radius, angles, color)

This code fallback already runs when AI Call 2 fails. Making it the primary path removes: 1 API call, 2-3s latency, and a failure mode.

**Risk if removed:** None. The code normalizer produces identical output. It was designed as a fallback for exactly this purpose.

**Files affected:**
- `pipeline/index.ts`: Remove Stage B AI branch, always call `normalize()`
- `pipeline/pipelineAIService.ts`: `normalizeWithAI()` becomes unused

---

### REMOVE: AI Call 3 — Ambiguity Resolution (`resolveAmbiguities()`)

**What it does:** When Stage B output has ARC_PROGRESS widgets with no `dataType`, sends them to AI to ask "what metric should this arc show?"

**Why remove:** Two layers already handle this:
1. `normalizer.ts` → `TYPE_TO_DATA_TYPE` maps known types (battery→BATTERY, steps→STEP, etc.)
2. `normalizer.ts` → `ARC_FALLBACK_PRIORITY` assigns remaining metrics to generic "arc" type elements

The only arcs that lack dataType are generic `type: "arc"` entries. The fallback list (BATTERY → STEP → HEART → SPO2 → CAL) handles them deterministically.

**Risk if removed:** Generic arcs get fallback dataTypes instead of AI-guessed dataTypes. **Mitigation:** Acceptable trade-off. The fallback is deterministic and predictable. If AI Call 1 properly identified the element type (e.g., "battery" not "arc"), the dataType maps correctly. The fallback only applies to truly ambiguous elements.

**Files affected:**
- `pipeline/index.ts`: Remove Call 3 block
- `pipeline/pipelineAIService.ts`: `resolveAmbiguities()` becomes unused
- `pipeline/aiPrompt.ts`: `CALL_3_*` constants become unused

---

### REMOVE: Semantic Priority Sort (`semanticPriority.ts`)

**What it does:** Reorders ARC_PROGRESS elements by a fixed priority (STEP=0, BATTERY=1, HEART=2...) to determine outermost/innermost ring position.

**Why remove:** This reordering is meaningful ONLY when the geometry solver computes arc positions from scratch (fallback mode). When AI provides geometry (radius, startAngle, endAngle, center), the arcs already have their spatial positions. Reordering them changes nothing about their rendered position — the geometry solver uses AI values first ("preserve first, fallback second").

**Risk if removed:** In the rare case an arc has NO AI geometry AND the solver computes position from priority, the ordering matters. **Mitigation:** The `getPriority()` and `getMockValue()` functions in `semanticPriority.ts` are still used by `geometrySolver.ts` for fallback computation. Keep those exports intact; only remove the `sortArcsByPriority()` call from the orchestrator.

**Files affected:**
- `pipeline/index.ts`: Remove `sortArcsByPriority()` call
- `semanticPriority.ts`: Keep file (exports still used by geometrySolver), just stop calling `sortArcsByPriority` from orchestrator

---

### SIMPLIFY: Layout Engine (`layoutEngine.ts`)

**What it does:** 100+ lines of zone-based positioning. But line 28-33 already say: "If element has AI-extracted bounds → SKIP layout engine, use AI coordinates directly."

**Current behavior:** When bounds exist, it computes `centerX`/`centerY` from bounds and returns. The entire zone/row/grid system only runs for elements WITHOUT bounds.

**Change:** No code change needed in `layoutEngine.ts` itself. The layout engine already self-bypasses. Just keep it as-is — it's a valid fallback for the (now rare) case of missing bounds.

**Files affected:** None. Layout engine stays as-is.

---

### SIMPLIFY: Geometry Solver (`geometrySolver.ts`)

**What it does:** Fills in missing geometry. Already follows "preserve first, fallback second" — if AI gave values, use them.

**Change:** No code change needed. The solver already prioritizes AI geometry. With full bounds/geometry from AI, the fallback math rarely runs. TIME_POINTER hand pivot math (`solveTimePointer`) is still needed since AI can't know hand image dimensions.

**Files affected:** None. Geometry solver stays as-is.

---

## Prompt Changes

**NONE REQUIRED.** This is the critical verification:

| Removed Step | Needs prompt change? | Why not? |
|---|---|---|
| Representation Corrector | NO | Just stop overriding AI output. Prompt already says "report what you see." |
| AI Call 2 (Stage B) | NO | `normalizer.ts` code fallback already does the same mapping. |
| AI Call 3 (Ambiguity) | NO | `normalizer.ts` fallback + `TYPE_TO_DATA_TYPE` already handles this. |
| Semantic Priority Sort | NO | Trust AI geometry. Sort was only for computed fallback positions. |

The AI Call 1 prompt is NOT made longer. It stays exactly as it is.

---

## Expected Outcome

| Metric | Before | After |
|--------|--------|-------|
| AI API calls per generation | 3 | 1 |
| Pipeline steps | 12 | 7 |
| Generation latency (AI portion) | ~8-12s | ~3-5s |
| API cost per generation | 3x | 1x |
| Failure points (API errors) | 3 | 1 |
| Design fidelity | Corrected/overridden | Faithful to AI vision |
| Code in orchestrator (`index.ts`) | ~120 lines | ~60 lines |

---

## Rollback Strategy

All removed files are kept in place (not deleted). If the simplified pipeline produces worse results:
1. Re-add the `correctRepresentation()` call in `index.ts`
2. Re-add the Stage B AI branch in `index.ts`
3. Re-add the Call 3 block in `index.ts`
4. Re-add `sortArcsByPriority()` call in `index.ts`

All changes are confined to `pipeline/index.ts`. No type changes, no file deletions.

---

## Out of Scope

- AI Call 1 prompt changes (not needed, not touched)
- Code generator changes (`jsCodeGeneratorV2.ts`)
- Asset resolver changes (`assetResolver.ts`)
- ZPK builder changes (`zpkBuilder.ts`)
- Type definition changes (`types/pipeline.ts`)
- UI changes (`App.tsx`, `AppContext.tsx`, components)
