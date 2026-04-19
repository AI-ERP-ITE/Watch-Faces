# specs/023-background-photo-editor/plan.md

## Summary

Add a non-destructive photo editor that opens on top of the already-cropped
background image. The user adjusts slider-based parameters (brightness,
contrast, highlights, shadows, sharpness, hue, saturation, temperature, tint,
exposure, vignette) with a live circular canvas preview, then clicks **Save**
to replace `backgroundImage` in state with the edited version. All downstream
pipeline steps automatically use the new image.

---

## Architecture

### New Component

```
src/components/BackgroundPhotoEditor.tsx
```

Self-contained modal component. Props:

```ts
interface Props {
  sourceDataUrl: string;          // the cropped 480×480 PNG from BackgroundCropTool
  onSave: (dataUrl: string) => void;
  onCancel: () => void;
}
```

### Edit Parameter Model

```ts
interface EditParams {
  exposure:    number;   // –100 … +100  (default 0)
  brightness:  number;   // –100 … +100  (default 0)
  contrast:    number;   // –100 … +100  (default 0)
  highlights:  number;   // –100 … +100  (default 0)
  shadows:     number;   // –100 … +100  (default 0)
  saturation:  number;   // –100 … +100  (default 0)
  hue:         number;   //    0 … 360   (default 0)
  temperature: number;   // –100 … +100  (default 0, cool → warm)
  tint:        number;   // –100 … +100  (default 0, green → magenta)
  sharpness:   number;   //    0 … 100   (default 0)
  vignette:    number;   //    0 … 100   (default 0)
}
```

---

## Rendering Strategy

### Live Preview (fast path)

Map all parameters to a **CSS filter string** and apply it to a `<canvas>` or
`<img>` element via `style.filter` for instant visual feedback:

```
brightness(b) contrast(c) saturate(s) hue-rotate(h) blur(sharpness-inverse)
```

Parameters not directly in CSS (highlights, shadows, temperature, tint,
vignette, exposure) are rendered by drawing the source image to an offscreen
canvas and applying pixel-level manipulation via `ImageData`. This offscreen
result feeds the preview canvas so every slider triggers a redraw.

### Export (save path)

On **Save**, run the full pixel pipeline on an offscreen 480×480 canvas:

1. Draw source image
2. Apply exposure + brightness + contrast (CSS filter baked via `drawImage`)
3. Apply highlights / shadows (per-pixel luminance mapping)
4. Apply temperature / tint (per-pixel RGB channel shift)
5. Apply hue / saturation (per-pixel HSL conversion)
6. Apply sharpness (3×3 unsharp-mask convolution kernel)
7. Apply vignette (radial gradient overlay)
8. `canvas.toDataURL('image/png')` → returned to caller

---

## Implementation Phases

1. **Modal scaffold** — Dialog shell, two-column layout (canvas left, sliders right)
2. **Image load** — Load `sourceDataUrl` into an `HTMLImageElement`
3. **Live preview renderer** — Offscreen canvas pipeline, draw to visible canvas
4. **Slider panel** — Grouped sliders for each parameter with labels and value display
5. **Pixel processors** — `applyHighlightsShadows`, `applyTemperatureTint`,
   `applyHueSaturation`, `applySharpness`, `applyVignette`
6. **Export / Save** — Full-quality offscreen render → `toDataURL` → `onSave`
7. **Reset All** — Restore all params to 0
8. **Integration** — "Edit" button in `DesignInput` / `UploadZone` preview area;
   wire `onSave` → `dispatch(actions.setBackgroundImage(dataUrl))`

---

## Data Flow

```
User uploads + crops image (Spec 011, existing)
  → backgroundImage (480×480 PNG data URL) stored in state

Edit button visible next to background thumbnail (DesignInput / UploadZone)
  → BackgroundPhotoEditor modal opens (receives backgroundImage as sourceDataUrl)
  → User moves sliders → requestAnimationFrame pixel pipeline → canvas preview updates live
  → User clicks Save
      → full-quality offscreen render
      → dispatch(actions.setBackgroundImage(editedDataUrl))
      → modal closes
  → All downstream steps (CanvasWatchPreview, ZPK builder, AI pipeline)
    automatically read the new backgroundImage from state
```

---

## Files Changed / Created

| File | Action |
|------|--------|
| `src/components/BackgroundPhotoEditor.tsx` | **Create** — new modal component |
| `src/components/DesignInput.tsx` | **Edit** — add Edit button next to bg thumbnail |
| `src/App.tsx` | **Edit** — add `showPhotoEditor` state flag, wire open/close/save |

No changes required to the pipeline, ZPK builder, or code generator — they
all read from `state.backgroundImage` which is already the integration point.
