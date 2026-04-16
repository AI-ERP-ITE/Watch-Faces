# specs/011-background-crop-tool/spec.md

## Feature: Background Image Crop & Position Tool

---

## Problem

Current background upload accepts only exactly 480×480 images.
Users have larger or differently-sized images and need to select
the exact region to use as the watch face background.

---

## Goal

Provide an interactive crop tool that:

* accepts any image size
* shows a 480×480 circular mask
* allows pan (move) and scale
* exports the masked region as the final background

---

## Functional Requirements

### FR-001 — Accept Any Image Size

* No size restriction on upload
* Load image at natural dimensions

---

### FR-002 — Circular Mask Overlay

* Render a 480×480 circle mask over the image
* Outside the circle = darkened (overlay)
* Inside the circle = clear (shows image)
* Mask is fixed — image moves beneath it

---

### FR-003 — Pan (Move)

* User can drag image with mouse or touch
* Image moves freely in all directions
* Constrained: circle must always be fully covered by image

---

### FR-004 — Scale (Zoom)

* Slider or pinch-to-zoom
* Min scale: circle fits exactly (no empty space inside mask)
* Max scale: 4×

---

### FR-005 — Real-time Preview

* Canvas updates live as user pans/scales
* Shows final circular result as live feedback

---

### FR-006 — Export

* On confirm, crop the 480×480 circle region to a PNG data URL
* Store as `backgroundImage` in app state
* Replace current background upload flow

---

### FR-007 — Reset

* Button to reset pan and scale to default (image centered, fill circle)

---

## Success Criteria

* SC-001: Any image loads without error
* SC-002: Circular mask always visible
* SC-003: Drag moves image, mask stays fixed
* SC-004: Scale slider adjusts zoom smoothly
* SC-005: Confirm exports exactly the masked region as 480×480 PNG
* SC-006: Exported image renders correctly as watch face background

---

## Constraints

* Pure canvas — no external crop libraries
* Must work in browser
* Must work on touch (mobile)
