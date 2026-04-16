# Spec 022 — HTML Icon Testing & End-to-End Icon Pipeline

## Status: PLANNED
## Priority: HIGH (blocks verifying Spec 019 works in real ZPK)

## Goal
Test that icons selected in the UI (both custom hand-drawn and Tabler icons) correctly:
1. Render on the canvas preview
2. Get exported as PNG assets into the ZPK
3. Appear in the final watchface (verified by extracting ZPK and inspecting files)

Also: test the HTML-driven pipeline path to confirm icons flow through correctly when a watchface is built from an HTML input design.

---

## Background

### What Was Built (Specs 018–019)
- 53 custom drawn icons + 83 Tabler icons = 136 total
- Icons stored as `dataUrl` in `IconEntry`
- `assetImageGenerator.ts` uses `getIconByKey(iconKey)` to generate `icon_<key>.png`
- `jsCodeGeneratorV2.ts` references `assets/icon_<key>.png` in `IMG` widget

### What Has Not Been Verified
- Does a Tabler icon (`tabler:heart`) actually get packed into the ZPK?
- Does `getIconByKey('tabler:heart')` work during ZPK generation (requires Tabler cache to be populated)?
- Does the HTML pipeline pass `iconKey` through correctly?

### Known Risk: Tabler Cache Timing
`getIconByKey` for Tabler icons returns synchronously from cache only if it was previously rendered.
The icon picker renders all 83 Tabler icons when an IMG element is selected → they get cached.
BUT: if a user selects a Tabler icon and generates ZPK immediately without opening the picker
for that element → cache might be empty → icon missing from ZPK.

**Solution (Task 2)**: Pre-warm the Tabler cache before ZPK generation starts.

---

## Tasks

### Task 1 — Manual Test Protocol
Verify end-to-end for custom icons:
1. Open the watchface editor
2. Add an IMG element
3. Select a custom icon (e.g. `heart_rate`)
4. Click "Generate ZPK"
5. Extract ZPK → check `assets/icon_heart_rate.png` exists
6. Verify `watchface/index.js` references `assets/icon_heart_rate.png`

Verify end-to-end for Tabler icons:
1. Select a Tabler icon (e.g. `tabler:heart`)
2. Generate ZPK
3. Extract ZPK → check `assets/icon_tabler:heart.png` exists (or sanitized filename)
4. Verify `watchface/index.js` references correct path

### Task 2 — Fix: Sanitize Tabler Icon Filenames
Current: `iconKey = 'tabler:heart'` → filename becomes `icon_tabler:heart.png`
Problem: `:` is an INVALID character in filenames on Windows and ZeppOS filesystem.

Fix in `assetResolver.ts` and `jsCodeGeneratorV2.ts`:
```typescript
// Sanitize icon key for use as filename
function sanitizeIconKey(key: string): string {
  return key.replace(/[^a-zA-Z0-9_-]/g, '_');  // 'tabler:heart' → 'tabler_heart'
}
// filename: icon_tabler_heart.png
```

### Task 3 — Fix: Pre-warm Tabler Cache Before ZPK Generation
In `zpkBuilder.ts` or the pipeline orchestrator, before generating assets:
```typescript
// Ensure all Tabler icons are rendered before ZPK generation
import { buildTablerLibrary } from '@/lib/tablerIconRenderer';
await buildTablerLibrary();  // no-op if already cached
// Now getIconByKey('tabler:*') will work synchronously
```

### Task 4 — HTML Pipeline Icon Pass-through
Verify that when a watchface is built via the HTML input path:
1. HTML-parsed elements with `iconKey` set pass through to the pipeline
2. `assetResolver.ts` assigns the correct icon filename
3. `assetImageGenerator.ts` generates the icon PNG
4. The icon appears in `watchface/index.js`

Check file: `src/html/` (HTML pipeline entry point) — confirm iconKey is preserved.

### Task 5 — Add Icon Key to Asset Name Map
In `assetResolver.ts`, document the icon asset naming convention:
```typescript
// Icon assets: icon_<sanitized_key>.png
// e.g. 'heart_rate'   → 'icon_heart_rate.png'
// e.g. 'tabler:heart' → 'icon_tabler_heart.png'
```

### Task 6 — End-to-End Screenshot Test
After all fixes:
1. Build watchface with 3 different icon types (health, system, Tabler)
2. Generate ZPK
3. Attach screenshot of canvas preview showing icons
4. List ZPK contents confirming all icon PNGs present

---

## Acceptance Criteria
- [ ] Custom icon → ZPK PNG → watchface/index.js reference: all correct
- [ ] Tabler icon filename sanitized (no `:` character)
- [ ] Tabler cache pre-warmed before ZPK generation
- [ ] ZPK contains all expected icon PNG files
- [ ] watchface/index.js references correct asset paths
- [ ] HTML pipeline preserves iconKey through all stages
- [ ] No TypeScript errors, build succeeds
