# specs/023-background-photo-editor/tasks.md

## Phase 1 — Component Scaffold

* [ ] T001 Create `src/components/BackgroundPhotoEditor.tsx` with Props interface
        (`sourceDataUrl`, `onSave`, `onCancel`)
* [ ] T002 Define `EditParams` interface with all 11 parameters and defaults
* [ ] T003 Add modal shell (full-screen overlay, dark backdrop, close on Escape)
* [ ] T004 Add two-column layout: left canvas panel + right sliders panel
* [ ] T005 Add footer: Reset All | Cancel | Save buttons (styled to match app)

---

## Phase 2 — Image Load

* [ ] T006 Load `sourceDataUrl` into an `HTMLImageElement` on mount via `useEffect`
* [ ] T007 Store loaded `HTMLImageElement` in a `useRef` for use by draw functions
* [ ] T008 Trigger initial preview draw once image has loaded (`img.onload`)

---

## Phase 3 — Live Preview Canvas

* [ ] T009 Add visible 480×480 `<canvas>` ref (displayed at ~400 px via CSS)
* [ ] T010 Apply circular clip path + cyan border (matching Spec 011 style)
* [ ] T011 Implement `drawPreview()` function that orchestrates the full render pipeline
* [ ] T012 Schedule redraws via `requestAnimationFrame` on every `editParams` state change
* [ ] T013 Implement fast-path: if all params are default, draw source image directly (skip pixel ops)

---

## Phase 4 — Pixel Processors

* [ ] T014 `applyExposureBrightnessContrast(ctx, exposure, brightness, contrast)`
        — use `CanvasRenderingContext2D.filter` string: `brightness() contrast()`
        — apply exposure as `2^(val/100)` premultiplied into brightness factor
* [ ] T015 `applyHighlightsShadows(imageData, highlights, shadows)`
        — per-pixel luminance L = 0.299R+0.587G+0.114B
        — highlights: shift pixels where L > 0.5 by `strength*(L-0.5)*2`
        — shadows: shift pixels where L < 0.5 by `strength*(0.5-L)*2`
* [ ] T016 `applyTemperatureTint(imageData, temperature, tint)`
        — temperature: R += temp*0.8, B -= temp*0.8 (scale to –100…+100 → –80…+80)
        — tint: G -= tint*0.4, R/B += tint*0.2 each
* [ ] T017 `applyHueSaturation(imageData, hue, saturation)`
        — RGB → HSL per pixel
        — H += hue (mod 360), S *= (1 + saturation/100)
        — HSL → RGB, clamp, write back
* [ ] T018 `applySharpness(imageData, sharpness)`
        — clone ImageData for source pixels
        — apply 3×3 unsharp-mask kernel `[0,-1,0,-1,5,-1,0,-1,0]`
        — blend: `out = src + (convolved - src) * (sharpness/100)`
        — skip border pixels (1-px margin)
* [ ] T019 `applyVignette(ctx, vignette)`
        — create `createRadialGradient(240,240,0,240,240,240)`
        — inner stop: `rgba(0,0,0,0)`, outer stop: `rgba(0,0,0, vignette/100*0.85)`
        — `fillRect(0,0,480,480)` with this gradient

---

## Phase 5 — Slider Panel

* [ ] T020 Create reusable `<EditorSlider>` sub-component:
        `{ label, min, max, step, value, onChange, unit? }`
        Renders: label + input[type=range] + numeric display
        Double-click on value label → reset to 0 (or 0° for hue)
* [ ] T021 Add **Light** section: Exposure, Brightness, Contrast, Highlights, Shadows
* [ ] T022 Add **Colour** section: Saturation, Hue, Temperature, Tint
* [ ] T023 Add **Detail** section: Sharpness
* [ ] T024 Add **Effects** section: Vignette
* [ ] T025 Connect each slider's `onChange` → `setEditParams(prev => ({...prev, key: val}))`

---

## Phase 6 — Render Pipeline Wiring

* [ ] T026 In `drawPreview()`:
        1. Create offscreen 480×480 canvas
        2. Bake exposure+brightness+contrast via `ctx.filter` + `drawImage`
        3. `getImageData` → run T015 (highlights/shadows)
        4. Run T016 (temperature/tint) on same ImageData
        5. Run T017 (hue/saturation) on same ImageData
        6. Run T018 (sharpness) on same ImageData
        7. `putImageData` back to offscreen canvas
        8. Copy offscreen to visible canvas (with circle clip)
        9. Run T019 (vignette) on top of visible canvas
* [ ] T027 Debounce: wrap `drawPreview` in `useCallback`, call inside
        `useEffect([editParams])` with `requestAnimationFrame` handle stored in ref
* [ ] T028 Cancel pending RAF on unmount / next effect run

---

## Phase 7 — Save & Export

* [ ] T029 Implement `handleSave()`:
        — same pipeline as T026 but on a fresh 480×480 offscreen canvas (no clip)
        — apply circular clip before final draw so exported PNG has transparent corners
          OR export as full square PNG (matching how Spec 011 exports it — full square)
        — call `canvas.toDataURL('image/png')`
        — call `onSave(dataUrl)`
* [ ] T030 Clarify export format: match Spec 011 output — **full 480×480 square PNG
        with pixels outside circle drawn** (the circular mask is only a UI overlay, not
        exported transparency). Clip is only for the visible preview, not the export canvas.

---

## Phase 8 — Reset & UX Polish

* [ ] T031 Implement `handleResetAll()` → `setEditParams(DEFAULT_EDIT_PARAMS)`
* [ ] T032 Implement single-param reset on double-click in `<EditorSlider>`
* [ ] T033 Show current param value next to slider (update live while dragging)
* [ ] T034 Add section headers ("Light", "Colour", "Detail", "Effects") with subtle
        dividers matching app theme (zinc-700 border)
* [ ] T035 Make right panel scrollable on short viewports (`overflow-y: auto`)
* [ ] T036 Responsive: below 900 px → stack canvas above sliders (flex-col)

---

## Phase 9 — Integration into App

* [ ] T037 Add `showPhotoEditor: boolean` state to `App.tsx`
        (or co-locate open/close inside `DesignInput`)
* [ ] T038 In `DesignInput.tsx`: when `imageValue` is not null, render
        **Edit Photo** button next to the thumbnail (`✏` icon + "Edit Photo" text)
* [ ] T039 Edit button `onClick` → set `showPhotoEditor = true`
* [ ] T040 Render `<BackgroundPhotoEditor>` in `App.tsx` (or modal portal) conditionally
        on `showPhotoEditor`
* [ ] T041 Pass `sourceDataUrl={state.backgroundImage}` to editor
* [ ] T042 Wire `onSave={(url) => { dispatch(actions.setBackgroundImage(url)); setShowPhotoEditor(false); }}`
* [ ] T043 Wire `onCancel={() => setShowPhotoEditor(false)}`
* [ ] T044 Verify: after Save, `CanvasWatchPreview` shows edited background without reload
* [ ] T045 Verify: after Save, generated ZPK `assets/bg.png` contains edited image

---

## Phase 10 — Testing & Verification

* [ ] T046 Manual test: open editor with a dark photo → raise brightness → save →
        confirm preview + ZPK background is brighter
* [ ] T047 Manual test: push saturation to –100 → image goes greyscale → save works
* [ ] T048 Manual test: sharpness at 100 on a soft image → visible edge enhancement
* [ ] T049 Manual test: vignette at 80 → strong dark corners visible in circular preview
* [ ] T050 Manual test: Reset All restores all sliders and preview
* [ ] T051 Manual test: Cancel → no change to backgroundImage in state
* [ ] T052 Manual test: Edit → Save → Edit again → previous edits are NOT compounded
        (editor always opens with the last-saved dataUrl, not the original raw upload)
        NOTE: this is the expected behaviour — edits are additive across save cycles.
              If cumulative degradation is observed, store originalCroppedUrl separately.
* [ ] T053 Build: `npm run build` — no TypeScript errors
* [ ] T054 Deploy: Copy-Item dist/* docs/ → git commit → git push
* [ ] T055 Live verify: hard-refresh GitHub Pages, test Edit Photo flow end-to-end
