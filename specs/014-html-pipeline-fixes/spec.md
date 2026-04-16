# Spec 014 — HTML Pipeline Fixes

## Fix 1 — Background placeholder text
`handleLoadLayout` in App.tsx adds a background element with `src: 'background.png'` — file doesn't exist → canvas draws "Background" as placeholder text.
**Fix:** Set `src: state.backgroundImage` (the actual cropped data URL).

## Fix 2 — SVG inner nodes classified as ARC_PROGRESS
Leaf-node strategy descends into `<svg>` and finds `<circle>`, `<path>` children → classified as ARC_PROGRESS instead of the intended widget.
**Fix:** In `parseDom`, treat the whole `<svg>` element as a single leaf — do not descend into it.

## Fix 3 — Compound elements split (icon + value)
`<div class="heart-rate"><svg>❤</svg><span>72</span></div>` → parent skipped because it has children → icon and number processed separately → wrong types.
**Fix:** Two-pass strategy in `parseDom`:
- Pass 1: collect all elements whose className matches a known keyword → use as single unit, mark children as claimed
- Pass 2: remaining nodes → leaf strategy (skip claimed children)

## Fix 4 — Crop tool bypassed (raw image set before confirm)
`UploadZone onChange` fires immediately on file selection and sets `state.backgroundImage` to the raw file. Crop tool result overwrites it later only if user confirms — but if they don't, raw image is used.
**Fix:** Remove `onChange` from background UploadZone. Only `handleCropConfirm` sets `state.backgroundImage`. UploadZone only triggers file picker → `onFileChange` → opens crop modal.

## Files Changed
- `src/html/parseDom.ts` — SVG as single leaf, two-pass class-match strategy, expose `matchedByClass` flag
- `src/html/mapDomToElements.ts` — handle `matchedByClass` flag on DomElement
- `src/App.tsx` — Fix 1 (background src), Fix 4 (remove onChange from bg UploadZone)
