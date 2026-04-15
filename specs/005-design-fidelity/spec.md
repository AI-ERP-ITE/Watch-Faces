# Feature 005: Design Fidelity — Close the 4-Watchface Gap

## Problem

The user sees **4 different watchfaces** through the pipeline:

| Stage | What User Sees | Why It's Different |
|-------|---------------|-------------------|
| 1. **Upload** | Their original design | Ground truth |
| 2. **AI output** | Rough approximation | Prompt says "approximate is fine" |
| 3. **Preview** | Repositioned/resized elements | Geometry solver overrides everything |
| 4. **Device** | Same as preview (wrong) | Faithfully renders the wrong config |

**Root cause:** The geometry solver (`geometrySolver.ts`) **discards user coordinates** and replaces them with hardcoded constants. The asset generator (`assetImageGenerator.ts`) **replaces user visuals** with generic Canvas-drawn images.

## Discrepancy Map (10 identified)

| # | Location | What Happens | Impact |
|---|----------|-------------|--------|
| D1 | `aiPrompt.ts` | Prompt says "approximate is fine" | Positions are rough estimates |
| D2 | `geometryExtractor.ts` | Infers center/radius from bounds if missing | Synthetic geometry |
| D3 | `normalizer.ts` | Splits compound elements into 2 widgets | Visual grouping lost |
| D4 | `layoutEngine.ts` | Elements without bounds → zone-based layout | Original position discarded |
| D5 | `geometrySolver.ts` | ARC radius = `BASE - (priority * SPACING)` | User's arc size ignored |
| D6 | `geometrySolver.ts` | TIME_CENTER_X = 140 (hardcoded left) | User's time position ignored |
| D7 | `geometrySolver.ts` | TEXT sizes = preset constants | User's text size ignored |
| D8 | `CanvasWatchPreview.tsx` | Draws primitives, not assets | Preview ≠ device output |
| D9 | `assetImageGenerator.ts` | All assets Canvas-drawn from scratch | User's design completely replaced |
| D10 | `zpkBuilder.ts` | Fragile name-matching for filenames | Assets may be mismatched |

## Goal

Make the pipeline produce a watchface that **looks like the user's uploaded design**, not a generic reconstruction.

Priority order:
1. Preserve AI-extracted coordinates (don't override in geometry solver)
2. Make assets match user's design (colors, layout intent)
3. Ensure preview matches device output exactly

## Non-Goals

- Pixel-perfect reproduction (Zepp widgets have constraints)
- Supporting every possible design element
- Changing the Zepp OS widget API

## Functional Requirements

### FR-001 — AI Prompt Precision
- Change prompt to require exact coordinates (not "approximate is fine")
- Ask AI to report colors, font sizes, arc thickness from the image
- Ask AI to report element z-order from visual layering

### FR-002 — Geometry Solver: Preserve AI Coordinates
- If AI provides `bounds`, use them directly — don't recalculate
- If AI provides `center`/`radius`, use them directly — don't override
- If AI provides `startAngle`/`endAngle`, use them — don't use priority-based sweep
- Geometry solver only fills in MISSING values, never overwrites existing ones

### FR-003 — Time Position: User's Choice
- Remove hardcoded `TIME_CENTER_X = 140`
- Use AI-extracted center for TIME_POINTER
- Fallback to screen center (240, 240) only if AI didn't provide position

### FR-004 — Arc Dimensions: User's Design
- Remove `ARC_BASE_RADIUS - (priority * ARC_SPACING)` formula
- Use AI-extracted radius if available
- Use AI-extracted line width if available
- Fallback formula only when AI provides no arc geometry

### FR-005 — Text Dimensions: From AI
- Remove hardcoded `TIME_DIGIT = {w:30, h:50}`
- Use AI-extracted text bounds for sizing
- Derive digit image size from AI-reported element dimensions

### FR-006 — Asset Color Fidelity
- AI prompt must extract dominant color for each element
- `assetImageGenerator.ts` must use AI-reported colors, not hardcoded palette
- Clock hand colors from user design, not gray/white/red defaults

### FR-007 — Single Preview Source of Truth
- `CanvasWatchPreview` must render actual asset images, not primitives
- Both previews must look identical at same scale
- OR: remove one preview, keep only the accurate one

### FR-008 — Asset Filename Robustness
- `zpkBuilder.ts` filename matching must be deterministic
- Use element ID → filename mapping, not name substring matching
- Every element must have guaranteed filename before ZPK build

## Where to Fix (file map)

| File | Change |
|------|--------|
| `src/pipeline/aiPrompt.ts` | Rewrite prompt: require coordinates, colors, sizes |
| `src/pipeline/geometrySolver.ts` | Preserve AI values, only fill gaps |
| `src/pipeline/geometryExtractor.ts` | Pass through AI geometry unchanged |
| `src/pipeline/layoutEngine.ts` | Respect all AI-provided positions |
| `src/pipeline/assetImageGenerator.ts` | Use AI-reported colors |
| `src/components/CanvasWatchPreview.tsx` | Render actual asset images |
| `src/lib/zpkBuilder.ts` | Deterministic filename mapping |

## Success Criteria

- SC-001: Arc elements appear at same position and size as user's uploaded design
- SC-002: Time display appears at same position as user's design
- SC-003: Text elements sized proportionally to user's design
- SC-004: Colors in generated watchface match user's design colors
- SC-005: Preview on website matches device output
- SC-006: No element position reset to hardcoded constants when AI provided coordinates
