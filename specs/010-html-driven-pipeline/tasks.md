# specs/010-html-driven-pipeline/tasks.md

## Phase 1 — UI

* [ ] T001 Add background upload input
* [ ] T002 Store uploaded image
* [ ] T003 Add HTML textarea
* [ ] T004 Add "Load Layout" button

---

## Phase 2 — Sanitization

* [ ] T005 Remove markdown wrappers
* [ ] T006 Strip script/style tags
* [ ] T007 Normalize string

---

## Phase 3 — Container Handling

* [ ] T008 Detect root container
* [ ] T009 Wrap if missing (480×480)

---

## Phase 4 — Preview

* [ ] T010 Render background image
* [ ] T011 Overlay HTML
* [ ] T012 Apply circular mask

---

## Phase 5 — DOM Parsing

* [ ] T013 Traverse DOM nodes
* [ ] T014 Extract boundingClientRect
* [ ] T015 Normalize coordinates
* [ ] T016 Build element list

---

## Phase 6 — Mapping

* [ ] T017 Map text → time/date/widgets
* [ ] T018 Detect analog hands
* [ ] T019 Assign widget types

---

## Phase 7 — Pipeline Integration

* [ ] T020 Remove API call usage
* [ ] T021 Replace AI input with DOM elements
* [ ] T022 Connect to generator

---

## Phase 8 — Validation

* [ ] T023 Clamp positions
* [ ] T024 Validate sizes

---

## Phase 9 — Testing

* [ ] T025 Paste HTML → preview correct
* [ ] T026 Upload background → visible
* [ ] T027 Generate ZPK → matches preview

---

## Completion Criteria

* No AI API calls remain
* HTML drives layout completely
* preview = final output
* stable deterministic generation
