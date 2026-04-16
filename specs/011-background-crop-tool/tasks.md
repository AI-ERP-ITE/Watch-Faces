# specs/011-background-crop-tool/tasks.md

## Phase 1 — Component Setup

* [ ] T001 Create BackgroundCropTool.tsx component
* [ ] T002 Add 480×480 canvas element
* [ ] T003 Load uploaded image onto canvas

---

## Phase 2 — Default Fit

* [ ] T004 Compute min scale so image fills circle
* [ ] T005 Center image by default

---

## Phase 3 — Circular Mask

* [ ] T006 Draw circular clip path (480×480 circle)
* [ ] T007 Draw darkened overlay outside circle

---

## Phase 4 — Pan

* [ ] T008 Handle mousedown / mousemove / mouseup
* [ ] T009 Handle touchstart / touchmove / touchend
* [ ] T010 Apply offset to image draw position
* [ ] T011 Constrain pan so circle stays covered

---

## Phase 5 — Scale

* [ ] T012 Add scale slider (min: fill, max: 4×)
* [ ] T013 Apply scale to image draw size
* [ ] T014 Re-center on scale change
* [ ] T015 Update min scale constraint on image load

---

## Phase 6 — Export

* [ ] T016 On confirm: draw image to offscreen 480×480 canvas
* [ ] T017 Apply circular clip to offscreen canvas
* [ ] T018 Export as PNG data URL via toDataURL()

---

## Phase 7 — Reset & UX

* [ ] T019 Add Reset button (re-center + reset scale)
* [ ] T020 Add Confirm and Cancel buttons
* [ ] T021 Show crop tool in a modal/dialog

---

## Phase 8 — Integration

* [ ] T022 Trigger crop tool on background image upload (AI mode)
* [ ] T023 Trigger crop tool on background image upload (HTML mode)
* [ ] T024 On confirm dispatch setBackgroundImage with cropped data URL
* [ ] T025 Pass background File to crop tool for both modes

---

## Completion Criteria

* Any image size loads correctly
* Circular mask always visible
* Pan and scale work on mouse and touch
* Confirm exports exactly 480×480 PNG
* Background renders correctly on watch face preview
