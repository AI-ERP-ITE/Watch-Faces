# Spec 016 — Canvas Preview Screenshot

## Problem
The success screen shows only the raw background image as the preview. The user wants the actual rendered watchface canvas (with all elements drawn: digits, hands, icons, etc.) to be captured the moment "Generate ZPK & Upload" is clicked and displayed as the preview.

## Goal
1. Capture a PNG screenshot of the `InteractiveCanvas` at the moment the user clicks Generate.
2. Upload that PNG to GitHub as `{watchfaceId}/preview.png` alongside the ZPK and QR.
3. Display it as the preview image in the success screen (QRDisplay).

## Tasks

### T001 — Expose canvas ref from InteractiveCanvas
- Add `React.forwardRef<HTMLCanvasElement, InteractiveCanvasProps>` to `InteractiveCanvas`
- Forward the inner `canvasRef` to the exposed ref

### T002 — Capture canvas in App.tsx handleGenerate
- Create `canvasRef = useRef<HTMLCanvasElement>(null)` in App.tsx
- Wire it to `<InteractiveCanvas ref={canvasRef} ...>`
- At the START of `handleGenerate` (before `dispatch(setStep('generating'))`), capture: `canvasRef.current?.toDataURL('image/png')`
- Store in a local variable `previewDataUrl`
- Call `setPreviewImageUrl(previewDataUrl)` immediately (for local display)

### T003 — Upload preview.png to GitHub
- In `uploadZPKWithQR` in `githubApi.ts`, add optional `previewDataUrl?: string` parameter
- If provided, convert to Blob via `fetch(previewDataUrl).then(r => r.blob())`
- Upload as `{watchfaceId}/preview.png` (Step 4)
- Return `previewUrl` in result

### T004 — Wire preview URL in App.tsx
- Pass `previewDataUrl` to `uploadZPKWithQR`
- `setPreviewImageUrl` is already called before upload; no change needed unless we want to use the uploaded URL instead (keep local data URL — simpler, no network round-trip)

## Acceptance Criteria
- Screenshot is taken at click time — shows exactly what the user sees (background + all elements)
- `preview.png` appears in the GitHub repo folder next to `face.zpk` and `qr.png`
- Success screen shows the canvas screenshot (not raw background)
- Works even if canvas is tainted (toDataURL may throw — must catch and fall back to backgroundImage)
