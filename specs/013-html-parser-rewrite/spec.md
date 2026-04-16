# Spec 013 — HTML Parser Rewrite

## Problem
Current `parseDom` + `mapDomToElements` pipeline fails with "No elements detected" because:
1. `doc.write()` is synchronous but CSS class-based layouts aren't ready — `getBoundingClientRect()` returns 0×0
2. Container-skip heuristic filters too aggressively — nested divs kill everything
3. Text classification applied to every element including ancestors (double-detection, wrong bounds)

## Goals
1. **Async iframe loading** — wait for `load` event before reading rects
2. **Leaf-node strategy** — only process elements with no visible children (innermost content nodes)
3. **Multi-signal classification** — use text content + CSS class names + tag type + `data-widget` attributes
4. **Arc detection** — detect `<svg>` arc paths → `ARC_PROGRESS`
5. **Fallback gracefully** — unknown elements → `TEXT`, user fixes in editor

---

## Classification Signal Priority
| Priority | Signal | Example |
|---|---|---|
| 1 | `data-widget` attribute | `data-widget="ARC_PROGRESS" data-type="BATTERY"` |
| 2 | CSS class name keywords | `class="battery-arc"`, `class="step-count"` |
| 3 | Text content pattern | `"12:34"` → IMG_TIME, `"WED"` → IMG_WEEK |
| 4 | Tag type | `<svg>` → ARC_PROGRESS or IMG, `<img>` → IMG |
| 5 | Fallback | → TEXT |

## Class Name Keywords
- **time**: `time`, `clock`, `hour`, `minute`, `second` → `IMG_TIME`
- **date**: `date`, `day`, `month`, `calendar` → `IMG_DATE`
- **week**: `week`, `weekday` → `IMG_WEEK`
- **battery**: `battery`, `batt`, `charge` → `TEXT_IMG` / `ARC_PROGRESS` + BATTERY
- **steps**: `step`, `walk`, `pedometer` → `TEXT_IMG` + STEP
- **heart**: `heart`, `hr`, `bpm`, `pulse` → `TEXT_IMG` + HEART
- **weather**: `weather`, `temp`, `temperature` → `TEXT_IMG` + WEATHER
- **analog**: `hand`, `pointer`, `analog` → `TIME_POINTER`
- **arc**: `arc`, `ring`, `progress`, `gauge` → `ARC_PROGRESS`

## Leaf Node Definition
An element is a "leaf" if none of its DOM children have a non-zero bounding rect.
This ensures we get the innermost visible element, not its wrappers.

## Files Changed
- `src/html/parseDom.ts` — rewrite to async, iframe `load` event, leaf-node extraction, pass className
- `src/html/mapDomToElements.ts` — rewrite classifier to use multi-signal priority
- `src/App.tsx` — `handleLoadLayout` must `await parseDom()`
