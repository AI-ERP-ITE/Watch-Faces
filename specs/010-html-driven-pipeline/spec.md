# specs/010-html-driven-pipeline/spec.md

## Feature: HTML + Background Driven Pipeline (Remove AI API Completely)

---

## Problem

Current pipeline depends on:

```text
AI → element detection → normalization → layout → geometry
```

Issues:

* non-deterministic outputs
* API instability (503, retries)
* incorrect element mapping
* layout drift

---

## Goal

Replace pipeline input with:

```text
background image + HTML layout
```

And make system:

```text
fully deterministic (no AI calls)
```

---

## Core Principle

```text
HTML DOM = SINGLE SOURCE OF TRUTH
```

* geometry comes ONLY from DOM
* element meaning comes from deterministic mapping
* image is visual layer only

---

## Functional Requirements

### FR-001 — Background Upload

* Allow user to upload image file
* Store as `background.png` (or dynamic path)
* Render as base layer in preview

---

### FR-002 — HTML Input

* Provide textarea input
* Accept raw HTML (NOT full page required)
* Must support fragment or full document

---

### FR-003 — HTML Sanitization

System must:

* strip markdown wrappers
* remove scripts/styles (security)
* trim outer noise

---

### FR-004 — Container Normalization

If missing:

Wrap HTML inside:

```html
<div style="position:relative;width:480px;height:480px;"></div>
```

---

### FR-005 — Preview Rendering

Render:

```text
background image (layer 0)
+
HTML overlay (layer 1)
```

Constraints:

* 480×480 fixed
* circular mask
* overflow hidden

---

### FR-006 — DOM Parsing

For each element:

Extract:

```text
x = left
y = top
width
height
textContent
tagName
```

Use:

```text
getBoundingClientRect()
```

relative to container.

---

### FR-007 — Mapping (Reuse Existing Logic)

Replace AI input with DOM input:

```text
DOM → AIElement[] (simulated)
→ existing normalizer / mapping
```

Mapping rules:

* "HH:MM" → IMG_TIME
* "T 26" → IMG_DATE
* "☁ 24°" → WEATHER
* "⚡ 82%" → BATTERY
* numeric blocks → TEXT_IMG or TEXT

---

### FR-008 — TIME_POINTER Detection

Detect analog hands from DOM:

Conditions:

* thin vertical rectangles
* near center (±20px from 240,240)
* rotated (transform present)

Assign:

```text
→ TIME_POINTER (single widget)
```

---

### FR-009 — Geometry Source Override

Disable:

```text
layoutEngine
geometrySolver (partial)
```

Replace with:

```text
DOM geometry → direct mapping
```

---

### FR-010 — Generator Integration

Feed parsed elements into:

```text
bridgeToWatchFaceConfig()
→ generateWatchFaceCodeV2()
```

No structural changes to V2 generator.

---

### FR-011 — Validation

Validate:

* all elements inside 480×480
* width/height > 0
* no NaN
* max elements <= 20

Clamp if needed.

---

### FR-012 — Editor Compatibility

Manual adjustments must:

* update DOM styles
* update internal element model
* remain source of truth

---

## Success Criteria

* SC-001: Uploaded background renders correctly
* SC-002: HTML overlay matches preview exactly
* SC-003: Parsed geometry matches DOM visually
* SC-004: Generated ZPK matches preview
* SC-005: Zero AI API calls in pipeline

---

## Constraints

* No external parsing libraries required
* Must run in browser
* Must support imperfect HTML
