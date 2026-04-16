# Spec 017 — Arch Text Render Fix

## Problem

When user enables **Arch** toggle on a TEXT element:

1. **Preview canvas** — element disappears entirely
2. **ZPK** — arch text missing from generated watchface

## Root Causes

### Bug 1 — Preview: empty string passes `??` guard

In `InteractiveCanvas.tsx` and `App.tsx`:
```js
el.text ?? el.name   // BUG: el.text = '' is falsy but passes ?? check
```
Empty string `''` is not `null`/`undefined`, so `??` returns `''`.  
`drawCurvedText` renders empty string → nothing visible.

**Fix:** Use `||` instead of `??`:
```js
el.text || el.name   // '' is falsy → falls back to el.name
```

### Bug 2 — ZPK: arch TEXT generates regular TEXT widget, not IMG

`jsCodeGenerator.ts` `generateTextWidget` ignores `element.curvedText`.  
It emits `hmUI.widget.TEXT` with static text `'-'`.

The pre-rendered arch PNG `curved_text_${el.id}.png` IS added to `elementFiles`
in `App.tsx` but no widget in the generated JS references it → PNG included in
ZPK but invisible.

**Fix:** In `generateTextWidget`, when `element.curvedText` is set, emit
`hmUI.widget.IMG` pointing to `curved_text_${element.id}.png`, positioned so
the image center aligns with the element's center point.

## Image sizing / positioning

`generateCurvedTextImage` creates a square canvas:
```
size = (radius + fontSize) * 2 + 20
center = (size/2, size/2)
```

IMG widget must be placed so image center = element center:
```
cx = element.center?.x ?? (element.bounds.x + element.bounds.width / 2)
cy = element.center?.y ?? (element.bounds.y + element.bounds.height / 2)
x  = cx - size / 2
y  = cy - size / 2
```

## Acceptance

- [ ] Enable Arch on a TEXT element → element still visible in preview canvas
- [ ] Generate watchface → ZPK contains `curved_text_*.png`
- [ ] JS code references that PNG via `hmUI.widget.IMG`
- [ ] Text renders along arc path on device
