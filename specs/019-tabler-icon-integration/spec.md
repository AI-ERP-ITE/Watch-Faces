# Spec 019 — Tabler Icon Integration

## Status: PLANNED

## Goal
Integrate the Tabler Icons library (6149 MIT-licensed SVG icons) into the watchface icon picker, alongside the existing hand-drawn icons. The user can browse and pick from both sources; the selected icon renders on the canvas preview and gets exported as a PNG asset into the ZPK.

---

## Background

### Current System
- `iconLibrary.ts` — 51 hand-drawn canvas icons, 5 categories
- Each icon is a `draw(ctx)` function → 48×48 PNG dataURL → used by canvas renderer and ZPK asset generator
- `PropertyPanel.tsx` renders a grid of icons per category
- `getIconByKey(key)` used in `InteractiveCanvas.tsx`, `App.tsx`, `assetImageGenerator.ts`

### Installed Package
- `@tabler/icons-react` v3.x — 6149 icons, MIT license
- Each icon exports as a React component with an `svg` prop structure
- Icons are vector (SVG paths) — can be rendered to canvas via `Image` + SVG blob

---

## Design Decisions

### D1 — Naming convention
Tabler icon keys are prefixed: `tabler:heart`, `tabler:battery-3` etc.
Custom hand-drawn keys stay unchanged: `heart_rate`, `battery` etc.
No key collision possible.

### D2 — How Tabler SVG → Canvas PNG
Tabler exports raw SVG path data. To render to canvas:
1. Build an SVG string from the icon's paths with desired color and size (48×48)
2. Create a Blob URL → `new Image()` → draw onto canvas → `toDataURL('image/png')`
3. Cache the result (same as existing hand-drawn icons)

### D3 — Category mapping
Tabler icons will be grouped into the same 5 categories using a curated mapping file (`tablerIconMap.ts`). Only relevant watchface icons are mapped — NOT all 6149. Starting with ~100 high-value ones.

### D4 — UI: unified picker
`PropertyPanel.tsx` icon picker shows:
- Section A: "Custom" (existing hand-drawn icons, 51 icons)
- Section B: "Tabler — Health", "Tabler — Fitness", etc. (curated mapped icons)
- Search box at top filters by label across both sources

### D5 — `IconEntry` interface
Add optional `source: 'custom' | 'tabler'` field. Backward compatible (defaults to 'custom').

### D6 — Canvas rendering
`InteractiveCanvas.tsx` and `assetImageGenerator.ts` both call `getIconByKey(key)` which returns `dataUrl`. No change needed there — the Tabler icon just needs a valid `dataUrl` in its `IconEntry`.

---

## Tasks

### Task 1 — Create `tablerIconMap.ts`
File: `src/lib/tablerIconMap.ts`
- Import ~100 curated Tabler icon components
- Define array of `{ key: string, label: string, category, tablerName: IconComponent }`
- Categories: health, fitness, system, time, weather (no draw function — different path)

### Task 2 — Create `tablerIconRenderer.ts`
File: `src/lib/tablerIconRenderer.ts`
- Function: `renderTablerIcon(IconComponent, color: string, size: number): Promise<string>`
  - Gets SVG string from Tabler component (using `@tabler/icons-react`'s SVG props)
  - Renders to canvas → returns dataURL
- Function: `buildTablerLibrary(): Promise<IconEntry[]>`
  - Runs all Tabler icons through renderer
  - Returns `IconEntry[]` with `source: 'tabler'`

### Task 3 — Extend `iconLibrary.ts`
- Add `source?: 'custom' | 'tabler'` to `IconEntry` interface
- Export `getFullIconLibrary(): Promise<IconEntry[]>` that merges custom + Tabler
- Keep `getIconLibrary()` sync for backward compat (returns custom only)
- Keep `getIconByKey()` — extend to search both sources

### Task 4 — Update `PropertyPanel.tsx`
- Replace sync `getIconLibrary()` call with async `getFullIconLibrary()`
- Add search/filter input above icon grid
- Show source badge ("Custom" vs "Tabler") on hover or in label
- Fix the hardcoded category list `['health', 'activity', 'environment', 'system', 'time']` → use `['health', 'fitness', 'weather', 'system', 'time']` (already renamed in 018 but the UI list wasn't updated)

### Task 5 — Update `InteractiveCanvas.tsx` & `assetImageGenerator.ts`
- `getIconByKey` must search full library (custom + Tabler)
- Since Tabler rendering is async, ensure canvas re-renders after promise resolves (same pattern already used for image loading)

### Task 6 — Curate icon list (content task)
Map ~100 Tabler icons to categories:

**Health (30)**
IconHeart, IconHeartbeat, IconActivity, IconLungs, IconBrain, IconEye, IconDroplet, IconThermometer, IconStethoscope, IconPill, IconBandage, IconFlame, IconScale, IconRun, IconYoga, IconMoodSmile, IconSleep, IconWoman, IconMale, IconDental, IconEar, IconAccessible, IconMedicalCross, IconVaccine, IconMicroscope, IconDna, IconClover, IconLeaf, IconSalad, IconApple

**Fitness (25)**
IconBike, IconSwimming, IconTreadmill, IconBarbell, IconMountain, IconWalk, IconSkating, IconSki, IconBallBasketball, IconBallFootball, IconBallTennis, IconBallVolleyball, IconBoxingGlove, IconClimbing, IconKarate, IconRowing, IconGolf, IconHorseToy, IconRacket, IconRollerSkating, IconSkateboard, IconSnowflake, IconSword, IconTrophy, IconMedal

**System (20)**
IconBattery, IconBatteryCharging, IconWifi, IconBluetooth, IconBell, IconBellOff, IconSettings, IconLock, IconUnlock, IconVolume, IconVolumeOff, IconBrightness, IconMoon, IconSun, IconPhone, IconMessage, IconMail, IconCalendar, IconClock, IconAlarm

**Time (15)**
IconClock, IconAlarm, IconHourglass, IconCalendar, IconCalendarEvent, IconCalendarStats, IconWatch, IconSandTimer, IconSunrise, IconSunset, IconMoonStars, IconSunHigh, IconUvIndex, IconClockHour3, IconTimeline

**Weather (10 — placeholders only, full IMG_LEVEL sets in Spec 020)**
IconCloud, IconCloudRain, IconSnowflake, IconSun, IconCloudStorm, IconFog, IconWind, IconCloudSnow, IconDroplets, IconTemperature

---

## Acceptance Criteria

- [ ] All 51 existing hand-drawn icons still work unchanged
- [ ] ~100 Tabler icons available in picker, grouped by category
- [ ] Search box filters icons by label across both sources
- [ ] Selected Tabler icon renders on canvas in correct position/size
- [ ] Selected Tabler icon exports as PNG into ZPK (same as custom icons)
- [ ] No TypeScript errors
- [ ] Build succeeds

---

## Future
- Spec 020: Weather IMG_LEVEL sets (29-image per weather style)
- Spec 021: Font embedding in ZPK (.ttf in assets/, TEXT widget font param)
