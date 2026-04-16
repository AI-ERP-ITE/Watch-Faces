# specs/011-background-crop-tool/plan.md

## Summary

Replace the flat background `UploadZone` with an interactive
canvas-based crop tool that lets the user pan and scale any image
inside a fixed 480×480 circular mask.

---

## Architecture

### New Component

```
src/components/BackgroundCropTool.tsx
```

Self-contained canvas component. Props:

```ts
interface Props {
  file: File | null;
  onConfirm: (dataUrl: string) => void;
  onCancel: () => void;
}
```

### Modal Trigger

Open `BackgroundCropTool` in a modal/sheet when user uploads a background image in either AI or HTML mode.
On confirm → store cropped data URL as `backgroundImage`.

---

## Implementation Phases

1. Canvas setup (480×480, circular clip mask)
2. Image load + default fit (scale to fill circle)
3. Mouse/touch drag pan
4. Scale slider
5. Mask overlay (darken outside circle)
6. Export (crop to 480×480 PNG)
7. Reset button
8. Wire into App.tsx upload flow

---

## Data Flow

```
User uploads image
  → open BackgroundCropTool modal
  → user pans/scales
  → confirm
  → canvas.toDataURL() → 480×480 PNG
  → dispatch setBackgroundImage(dataUrl)
  → modal closes
```

---

## Risks

| Risk | Mitigation |
|---|---|
| Image smaller than circle | Enforce min scale = circle fill |
| Touch not working | Use pointer events API |
| Performance lag | requestAnimationFrame for redraw |
