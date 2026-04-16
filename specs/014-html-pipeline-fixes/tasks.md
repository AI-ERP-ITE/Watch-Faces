# Tasks — Spec 014 HTML Pipeline Fixes

## T001 — Fix background src in handleLoadLayout (App.tsx)
- [ ] Change `src: 'background.png'` → `src: state.backgroundImage ?? 'background.png'`

## T002 — Fix crop bypass: remove onChange from background UploadZone (App.tsx)
- [ ] Remove `onChange` prop from background UploadZone
- [ ] State is only set via `handleCropConfirm`

## T003 — Fix parseDom: SVG as single leaf + two-pass class-match strategy
- [ ] Add `matchedByClass: boolean` to DomElement interface
- [ ] Pass 1: for each element, check if className matches known keyword patterns → collect as unit, record all descendant node IDs as claimed
- [ ] Pass 2: remaining unclaimed nodes → existing leaf strategy
- [ ] Treat `<svg>` as a leaf (skip querySelectorAll inside svg)
- [ ] Set `matchedByClass: true` on Pass 1 elements

## T004 — Fix mapDomToElements: trust matchedByClass
- [ ] Add `matchedByClass` to DomElement type usage
- [ ] If `matchedByClass === true`, skip text pattern and tag checks — go straight to class keyword classification

## T005 — Build + deploy
