# Spec 015 — ZPK Fidelity Fixes

## Fix 1 — Crop result not used in ZPK
`handleCropConfirm` sets `backgroundImage` (data URL) but never creates a File from it.
`buildZPK` uses `state.backgroundFile` — the raw uncropped upload.
**Fix:** Convert cropped data URL to File and dispatch `setBackgroundFile`.

## Fix 2 — V2 TEXT_IMG font_array filename mismatch
V2 generator builds font names from `element.name` (e.g. `battery_0.png`).
Asset generator creates files with DATA_TYPE_PREFIXES (e.g. `batt_digit_0.png`).
**Fix:** V2 `generateTextImgWidget` should use same prefix convention as asset generator.

## Fix 3 — V3 generator assets/ double-path
`generateImgWidget` and `generateTimePointerWidget` prepend `assets/` to paths.
ZeppOS resolves from assets/ automatically → double-path `assets/assets/file.png`.
**Fix:** Remove `assets/` prefix in V3 IMG and TIME_POINTER widget generators.

## Fix 4 — QR display preview image
Verify preview snapshot is captured and passed to QRDisplay component.
