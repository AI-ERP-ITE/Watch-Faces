# Spec 021 — Font Embedding in ZPK

## Status: PLANNED
## Priority: MEDIUM

## Goal
Embed font files (.ttf/.otf) directly inside the `.zpk` archive so that watchface text elements use custom fonts ON THE DEVICE — not just in the browser canvas preview. This matches how other watchface creators embed fonts.

---

## Background

### Current State
- Font picker in UI changes canvas preview font (browser uses Google Fonts / local @font-face)
- ZPK builder (`zpkBuilder.ts`) packs: `app.json`, `app.js`, `watchface/index.js`, `assets/` (PNGs only)
- **No font files are included in the ZPK** — device uses its default system font
- Result: custom font selection has zero effect on the actual watchface hardware behavior

### How Font Embedding Works (ZeppOS)
ZeppOS `TEXT` widget supports a `font:` property:
```js
hmUI.createWidget(hmUI.widget.TEXT, {
  x: px(100), y: px(200), w: px(200), h: px(40),
  text: 'Hello',
  text_size: px(32),
  color: 0xFFFFFF,
  font: 'assets/fonts/MyFont.ttf',   // ← path inside ZPK
})
```
The font file must be present at that path inside the ZPK archive.

### Which Fonts Can Be Embedded
**LEGAL to embed** (open-source, redistribution allowed):
| Font | License | Source |
|---|---|---|
| Montserrat | OFL (SIL Open Font License) | Google Fonts / bundled |
| Cascadia Code | MIT | Microsoft open-source |
| Cascadia Mono | MIT | Microsoft open-source |
| TeX Gyre Termes | GUST Font License (OFL-compatible) | Bundled |
| THEBOLDFONT | Freeware | Bundled |
| All Google Fonts | OFL | CDN (need download) |

**NOT safe to embed** (restricted redistribution):
- Arial, Calibri, Segoe UI, Times New Roman, etc. (Windows/Office fonts)
- These are licensed for use only — not for embedding in distributed files

---

## Design Decisions

### D1 — Font Storage in Project
Embeddable fonts should be in `public/fonts/` (already done for 10 files in Spec 018).
Font files served to browser for preview AND copied into ZPK.

### D2 — fontLibrary.ts: Add `embeddable` flag
```typescript
interface FontStyle {
  key: string;
  label: string;
  fontFamily: string;
  category: 'watchface' | 'display' | 'system' | 'monospace';
  embeddable?: boolean;       // ← NEW: can be embedded in ZPK
  fontFile?: string;          // ← NEW: path in public/fonts/ e.g. 'Montserrat-Medium.ttf'
}
```

### D3 — Asset Path in ZPK
Font file will be embedded at: `assets/fonts/<filename>.ttf`
`TEXT` widget `font:` param → `'assets/fonts/Montserrat-Medium.ttf'`

### D4 — ZPK Builder Changes (`zpkBuilder.ts`)
When packing ZPK:
1. Scan all `WatchFaceElement` with `type === 'TEXT'`
2. If element has `fontStyle` that maps to an embeddable font with a `fontFile`
3. Fetch the font file from `/fonts/<fontFile>` (local URL)
4. Add to zip at `assets/fonts/<fontFile>`
5. De-duplicate (same font used multiple times → one file)

### D5 — Code Generator Changes (`jsCodeGeneratorV2.ts`)
For `TEXT` widgets, when font is embeddable:
```js
hmUI.createWidget(hmUI.widget.TEXT, {
  // ... existing props ...
  font: 'assets/fonts/Montserrat-Medium.ttf',
})
```
When font is NOT embeddable (system font): omit `font:` property entirely (device uses default).

### D6 — UI: Embeddable Badge
In `PropertyPanel.tsx` font picker:
- Show green lock icon or "✓ Embeds" label next to embeddable fonts
- Tooltip: "This font will be embedded in the ZPK file"

---

## Tasks

### Task 1 — Update `fontLibrary.ts`
- Add `embeddable: boolean` and `fontFile?: string` fields to `FontStyle` interface
- Mark Montserrat, Cascadia Code/Mono, TeX Gyre Termes, THEBOLDFONT as embeddable with their file paths

### Task 2 — Update `jsCodeGeneratorV2.ts`
- In `TEXT` widget generation, check if `element.fontStyle` maps to embeddable font
- If yes: add `font: 'assets/fonts/<file>'` property to widget
- If no: omit font property

### Task 3 — Update `zpkBuilder.ts`
- After collecting all PNGs, scan for TEXT elements with embeddable fonts
- Fetch each font file from `/fonts/<file>` URL
- Add to zip at `assets/fonts/<file>`
- De-duplicate entries

### Task 4 — Update `PropertyPanel.tsx`
- Show embeddable badge next to eligible fonts in font picker
- Non-embeddable fonts show "(preview only)" annotation

### Task 5 — Integration Test
- Generate watchface with Montserrat font on a TEXT element
- Extract ZPK → verify `assets/fonts/Montserrat-Medium.ttf` is present
- Check `watchface/index.js` → verify `font:` property is set

---

## Acceptance Criteria
- [ ] Embeddable fonts have `embeddable: true` + `fontFile` in fontLibrary.ts
- [ ] TEXT widgets with embeddable fonts emit `font:` param in generated JS
- [ ] Font file is packed into ZPK at `assets/fonts/<file>`
- [ ] Non-embeddable (system) fonts: no change to generated code
- [ ] PropertyPanel shows "(preview only)" for non-embeddable fonts
- [ ] No TypeScript errors, build succeeds
