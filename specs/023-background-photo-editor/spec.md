# specs/023-background-photo-editor/spec.md

## Feature: Background Photo Editor

---

## Problem

After a user uploads and crops their watch face background image (Spec 011),
there is no way to adjust its appearance. Many photos need brightness/contrast
correction, colour grading, or sharpening before they look good inside the
circular watch face frame. The user must currently edit the photo in an
external tool, re-upload, and re-crop — a slow and frustrating loop.

---

## Goal

Provide an in-app, non-destructive photo editor that:

* opens directly from the background thumbnail (one click)
* shows a live circular 480×480 preview of all adjustments
* exposes the full set of common photo-editing parameters
* exports a pixel-perfect 480×480 PNG that replaces the background image in
  state, so every downstream step (canvas preview, ZPK packaging, AI analysis)
  uses the edited version automatically

---

## Scope

In scope:
- Exposure, Brightness, Contrast
- Highlights, Shadows
- Saturation, Hue
- Temperature (cool/warm), Tint (green/magenta)
- Sharpness (unsharp mask)
- Vignette (radial darkening)
- Live circular preview (matching the Zepp watch face shape)
- Reset All
- Save → replaces `backgroundImage` in state
- Cancel → no change

Out of scope (future specs):
- Crop/pan changes (covered by Spec 011)
- Layers, masks, or selections
- LUT / colour profile import
- History / undo per parameter

---

## Functional Requirements

### FR-001 — Edit Button

* An **Edit** button appears next to the cropped background thumbnail in the
  design input area whenever `backgroundImage` is not null.
* Clicking it opens the `BackgroundPhotoEditor` modal.
* Button label: `✏ Edit Photo` (or pencil icon + "Edit").

---

### FR-002 — Modal Layout

* Full-screen or large-centered modal overlay (dark backdrop).
* **Left panel**: 480×480 live canvas preview, clipped to a circle (identical
  mask to the crop tool).
* **Right panel**: scrollable slider controls grouped into sections:
  - **Light**: Exposure, Brightness, Contrast, Highlights, Shadows
  - **Colour**: Saturation, Hue, Temperature, Tint
  - **Detail**: Sharpness
  - **Effects**: Vignette
* **Footer**: Reset All | Cancel | Save buttons.

---

### FR-003 — Slider Controls

Each parameter is represented by:
* A labelled row: `[Label]   [Slider ←————●————→]   [±value]`
* Range and default:

| Parameter   | Min  | Max  | Default | Unit  |
|-------------|------|------|---------|-------|
| Exposure    | –100 | +100 | 0       | —     |
| Brightness  | –100 | +100 | 0       | —     |
| Contrast    | –100 | +100 | 0       | —     |
| Highlights  | –100 | +100 | 0       | —     |
| Shadows     | –100 | +100 | 0       | —     |
| Saturation  | –100 | +100 | 0       | —     |
| Hue         |    0 |  360 | 0       | °     |
| Temperature | –100 | +100 | 0       | —     |
| Tint        | –100 | +100 | 0       | —     |
| Sharpness   |    0 |  100 | 0       | —     |
| Vignette    |    0 |  100 | 0       | —     |

* Double-clicking the value label resets that single parameter to its default.

---

### FR-004 — Live Preview

* Every slider move triggers a preview redraw (debounced to next animation
  frame to avoid jank).
* Preview pipeline order:
  1. Draw source image to offscreen 480×480 canvas
  2. Apply exposure + brightness + contrast via CSS filter baked with
     `CanvasRenderingContext2D.filter`
  3. Apply highlights / shadows via per-pixel luminance curve
  4. Apply temperature / tint via per-pixel RGB channel shift
  5. Apply hue / saturation via per-pixel HSL conversion
  6. Apply sharpness via 3×3 unsharp-mask convolution
  7. Draw result to visible canvas, clipped to the 480-px circle
  8. Apply vignette as a radial-gradient canvas overlay
* If all parameters are at default, skip pixel processing and draw source
  image directly (fast path).

---

### FR-005 — Pixel Processing Algorithms

#### Exposure
Map value (–100…+100) → EV multiplier: `factor = 2^(value/100)`
Multiply all RGB channels by `factor` (clamp 0–255).

#### Brightness
Map (–100…+100) → offset: `offset = value * 1.28` (–128…+128)
Add `offset` to all RGB channels (clamp).

#### Contrast
Map (–100…+100) → factor: `factor = (259*(value+255))/(255*(259-value))`
Per-pixel: `out = factor*(in - 128) + 128` (clamp).

#### Highlights
Target only pixels with luminance L > 0.5.
Map (–100…+100) → strength in [–1…+1].
For each pixel: `delta = strength * max(0, (L - 0.5) * 2)` → add to RGB.

#### Shadows
Target only pixels with luminance L < 0.5.
Map (–100…+100) → strength in [–1…+1].
For each pixel: `delta = strength * max(0, (0.5 - L) * 2)` → add to RGB.

#### Temperature
Map (–100…+100): negative → cooler (boost B, reduce R), positive → warmer
(boost R, reduce B). Magnitude = `abs(value) * 0.8` max channel shift.

#### Tint
Map (–100…+100): negative → green boost (reduce R+B, boost G),
positive → magenta boost (boost R+B, reduce G).

#### Hue
Convert each pixel RGB → HSL, shift H by `value` degrees (mod 360), convert back.

#### Saturation
Convert RGB → HSL, multiply S by `1 + value/100` (clamp 0–1), convert back.

#### Sharpness (Unsharp Mask)
Run a 3×3 sharpen convolution kernel:
```
[ 0, -1,  0]
[-1,  5, -1]
[ 0, -1,  0]
```
Blend between source and convolved result by `amount = value / 100`.

#### Vignette
Draw a radial gradient over the canvas:
`center → transparent`, `edge → rgba(0,0,0, strength)`
where `strength = value / 100 * 0.85` (max 85% opacity at edge).

---

### FR-006 — Save

* Clicking **Save**:
  1. Runs the full pixel pipeline at 480×480 resolution on an offscreen canvas.
  2. Calls `canvas.toDataURL('image/png')`.
  3. Dispatches `setBackgroundImage(dataUrl)` to app state.
  4. Closes the modal.
* All downstream consumers of `state.backgroundImage` automatically use the
  edited version — no other changes required.

---

### FR-007 — Reset All

* Resets all 11 parameters to their defaults (0 or 0°).
* Preview updates immediately.

---

### FR-008 — Cancel

* Closes the modal with no state change.
* `backgroundImage` in state remains unchanged.

---

### FR-009 — No External Dependencies

* Implementation uses only the browser's built-in Canvas 2D API and
  `CanvasRenderingContext2D.filter`.
* No image-processing library is added to `package.json`.

---

## Non-Functional Requirements

### NFR-001 — Performance
Preview redraw must complete in < 100 ms on a mid-range laptop (Chrome 120+)
for a 480×480 canvas. Use `requestAnimationFrame` batching to skip redundant
frames when sliders are dragged rapidly.

### NFR-002 — Visual Consistency
The circular mask and dark background in the editor match the existing crop
tool (Spec 011) exactly — same `RADIUS = 240`, same overlay style, same
cyan border.

### NFR-003 — Responsive Layout
On small viewports (< 900 px wide), the layout switches to a stacked
single-column view: preview on top, sliders below (scrollable).

---

## Acceptance Criteria

| # | Criterion |
|---|-----------|
| AC-01 | Edit button visible next to background thumbnail when an image is loaded |
| AC-02 | Clicking Edit opens the modal with the current cropped image loaded |
| AC-03 | Moving any slider updates the preview within one animation frame |
| AC-04 | All 11 parameters are present and functional |
| AC-05 | Preview is clipped to a 480-px circle matching the watch face shape |
| AC-06 | Save closes the modal and the new edited image appears in all previews |
| AC-07 | Cancel closes the modal with no visible change |
| AC-08 | Reset All restores all sliders to zero and resets the preview |
| AC-09 | Generated ZPK uses the edited image as `assets/bg.png` |
| AC-10 | No new npm packages required |
