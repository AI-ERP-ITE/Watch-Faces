# Tasks — Spec 013 HTML Parser Rewrite

## T001 — Rewrite parseDom.ts
- [ ] Make `parseDom` async, returns `Promise<DomElement[]>`
- [ ] Wait for iframe `load` event before reading rects
- [ ] Add `className` and `dataWidget` / `dataType` fields to `DomElement`
- [ ] Implement leaf-node detection: skip element if any child has non-zero rect
- [ ] Pass `className`, `data-widget`, `data-type` attrs through to DomElement
- [ ] Keep full-doc extraction (head styles + body content) from previous fix

## T002 — Rewrite mapDomToElements.ts
- [ ] Multi-signal classifier: data-widget → class keywords → text pattern → tag → fallback
- [ ] Class keyword lookup table (time/date/week/battery/step/heart/weather/arc/analog)
- [ ] SVG element → `ARC_PROGRESS` or `IMG` based on class/data-widget
- [ ] Remove old container-skip heuristic (leaf strategy handles this now)

## T003 — Update App.tsx handleLoadLayout
- [ ] Await `parseDom()` (now async)
- [ ] No other changes needed

## T004 — Build + deploy
