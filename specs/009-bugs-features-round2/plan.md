# Plan 009: Bugs + Features Round 2 — Arc Fix, AI Enrichment, Shortcuts, Export UX, Curved Text, Undo, Libraries

## What This Spec Covers

12 items reported from real-world usage. Mix of bugs, enhancements, and new features.

| # | Area | Type | Summary |
|---|------|------|---------|
| 1 | ARC Widget | Bug | Arc positions broken on installed watch — invisible |
| 2 | IMG_TIME Preview | Bug | Time widget ignores rect dimensions in canvas — renders too large |
| 3 | AI Response | Enhancement | AI doesn't return font, size, color for text elements OR widget dataType |
| 4 | Widget Interaction | Feature | Clickable app shortcut assignment per widget |
| 5 | QR / Export | Feature | Preview image + QR + ZPK filename shown together on export |
| 6 | Icon ZPK | Bug | Some icons missing in installed watch (overlap/missing from ZPK) |
| 7 | Text Effects | Feature | Curved/arc text rendering option |
| 8 | Editor UX | Feature | Undo/Redo for canvas adjustments |
| 9 | Font Library | Feature | Download and bundle all available free fonts |
| 10 | Font Picker UX | Feature | Font dropdown auto-previews text on hover |
| 11 | Icon Library | Feature | Add all available free icons, organized by category |
| 12 | Time/Date Preview | Bug+Enhancement | Render actual digit images at correct size in canvas |

---

## Root Cause Analysis (Bugs)

### Bug #1: ARC_PROGRESS invisible on watch
**Where it breaks:** `jsCodeGeneratorV2.ts` → `generateArcProgressWidget()`
**What happens:** Code gen emits `center_x`, `center_y`, `radius`, `start_angle`, `end_angle` — but does NOT wrap them in `px()`. Zepp OS V2 firmware **requires** `px()` for ALL coordinate/dimension values. Without `px()`, values default to 0 or get ignored → arc renders at (0,0) with 0 radius → invisible.
**Current code (line ~584-590):**
```js
center_x: ${centerX},
center_y: ${centerY},
radius: ${radius},
start_angle: ${startAngle},
end_angle: ${endAngle},
line_width: ${lineWidth},
```
**Missing:** Every value needs `px(${value})`.

### Bug #2: IMG_TIME too large in preview
**Where it breaks:** `InteractiveCanvas.tsx` → draw function for IMG_TIME/IMG_DATE/IMG_WEEK
**What happens:** Canvas draws text at a font size derived from element name or hardcoded, NOT from `bounds.width/height`. The element's bounds say "150×60" but canvas draws "12:34" at 48px font spanning 200+ px. Preview ≠ device.
**Fix:** Canvas must render digit images (from fontLibrary/assetImageGenerator) at the actual size specified in bounds, then clip to bounds rect.

### Bug #3: AI missing font/size/color/dataType
**Where it breaks:** `aiPrompt.ts` → `AI_SYSTEM_PROMPT`
**What happens:** The AI prompt schema has `color` field but no `fontSize`, `fontFamily`, or explicit `dataType` mapping instruction. AI returns color but code gen can't use font info because it was never asked for. The `dataType` field exists in pipeline types but the AI prompt doesn't instruct the model to map type→dataType (e.g., "battery"→"BATTERY"). This mapping currently happens in `normalizer.ts` as a code fallback, but it'd be more accurate if AI did it.

### Bug #6: Icons missing from ZPK
**Where it breaks:** `assetImageGenerator.ts` → `generatePipelineAssets()` + `zpkBuilder.ts`
**What happens:** When AI returns `representation: "icon"` or `"text+icon"`, normalizer creates an IMG element. Asset resolver assigns a `src` path like `battery_icon.png`. But asset image generator doesn't have a path for generating standalone icon PNGs at the correct size — it only generates digit arrays, clock hands, and weather icons. The icon file is referenced in code but never created → missing from ZPK → invisible on watch.
**Also:** If two elements overlap (same position), one may cover the other.

### Bug #12: Time/Date digit preview wrong size
**Same root cause as #2.** Canvas draws text placeholders instead of actual digit images. Fix: render the digit PNG assets (from `generateDigitImages()`) into canvas at the element's bounds.

---

## Dependency Graph

```
#3 (AI enrichment) → feeds better data to → #1 (arc fix), #6 (icon fix), #12 (preview fix)
#1 (arc px() fix) → standalone, no deps
#2 + #12 (preview fix) → depends on font/digit assets being available at preview time
#6 (icon ZPK fix) → depends on icon library (#11) for icon source images
#4 (shortcuts) → standalone, needs code gen + property panel changes
#5 (export UX) → standalone, QRDisplay.tsx only
#7 (curved text) → standalone, canvas + code gen
#8 (undo/redo) → standalone, AppContext reducer
#9 (font library) → standalone, new file + build
#10 (font preview) → depends on #9 (font library)
#11 (icon library) → extends existing iconLibrary.ts
```

---

## Implementation Phases

### Phase 1: Critical Bug Fixes (items #1, #6)
- Fix ARC px() wrapping in code gen
- Fix icon asset generation → ensure icons included in ZPK

### Phase 2: AI Enrichment (item #3)
- Add fontSize, fontFamily, dataType instructions to AI prompt
- Update AI response schema
- Wire new fields through pipeline

### Phase 3: Canvas Preview Fidelity (items #2, #12)
- Render digit images at correct bounds in InteractiveCanvas
- IMG_TIME/IMG_DATE/IMG_WEEK show real digit images clipped to bounds

### Phase 4: Export UX (item #5)
- Redesign QRDisplay to show preview thumbnail + QR + filename together

### Phase 5: Widget Shortcuts (item #4)
- Add clickAction field to WatchFaceElement
- Property panel: app shortcut dropdown
- Code gen: emit click_func for buttons

### Phase 6: Undo/Redo (item #8)
- History stack in AppContext
- Ctrl+Z / Ctrl+Y keybindings
- Max 30 snapshots

### Phase 7: Icon Library Expansion (item #11)
- Add all free watchface icons (~50+) organized by category
- Update icon picker in PropertyPanel

### Phase 8: Font Library Expansion (items #9, #10)
- Bundle free fonts (Google Fonts subset)
- Font picker with hover preview

### Phase 9: Curved Text (item #7)
- Canvas arc text renderer
- Code gen: emit arc text as pre-rendered image asset

---

## Risk Summary

| Risk | Mitigation |
|------|------------|
| px() fix breaks existing watchfaces | Test with 3 existing ZPKs before deploy |
| AI prompt changes break extraction | Keep code fallback in normalizer, add validation |
| Font bundling bloats build | Use subset (digits 0-9 + colon only) |
| Undo/redo state size grows | Cap at 30 snapshots, deep-diff to skip no-ops |
| Curved text can't be done in Zepp OS natively | Pre-render as image asset, include in ZPK |

---

## Estimated File Changes

| File | Changes |
|------|---------|
| `src/lib/jsCodeGeneratorV2.ts` | px() wrapping for ARC, shortcut click_func |
| `src/pipeline/aiPrompt.ts` | Add fontSize/fontFamily/dataType to prompt + schema |
| `src/components/InteractiveCanvas.tsx` | Digit image rendering, curved text, undo keybindings |
| `src/components/PropertyPanel.tsx` | Shortcut dropdown, font hover preview |
| `src/components/QRDisplay.tsx` | Preview image + filename display |
| `src/pipeline/assetImageGenerator.ts` | Icon PNG generation, curved text assets |
| `src/lib/iconLibrary.ts` | Expand to ~50+ icons with categories |
| `src/lib/fontLibrary.ts` | Expand with Google Fonts subset |
| `src/context/AppContext.tsx` | Undo/redo history stack |
| `src/types/index.ts` | clickAction field, curvedText field |
| `src/pipeline/assetResolver.ts` | Wire icon filenames from expanded library |
