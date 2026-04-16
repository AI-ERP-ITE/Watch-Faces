# Spec 020 — Weather Icon Sets (IMG_LEVEL)

## Status: PLANNED
## Priority: HIGH

## Goal
Generate complete 29-image weather icon sets for the `IMG_LEVEL` widget. Each set covers all 29 Amazfit weather condition codes. User selects a visual style; all 29 PNGs are embedded in the ZPK as `weather_0.png … weather_28.png`.

---

## Background

### Why 29 images, not 1
`IMG_LEVEL` widget works like this in ZeppOS:
```js
hmUI.createWidget(hmUI.widget.IMG_LEVEL, {
  src: ['weather_0.png', 'weather_1.png', ..., 'weather_28.png'],
  type: hmUI.data_type.WEATHER_CURRENT,
})
```
Firmware picks the image at index matching current weather code. So you MUST provide all 29.

### Current State
- `assetImageGenerator.ts` has `generateWeatherIcons()` that produces a single placeholder set
- No styles, no real weather iconography
- `iconLibrary.ts` has individual weather icons (cloud, rain, etc.) but these are UI icons, not ZPK assets

### Weather Codes (0–28)
| Code | Condition | Code | Condition |
|---|---|---|---|
| 0 | Sunny | 15 | Fog |
| 1 | Mostly Sunny | 16 | Freezing Rain |
| 2 | Partly Cloudy | 17 | Sandstorm |
| 3 | Mostly Cloudy | 18 | Overcast |
| 4 | Cloudy | 19 | Hail |
| 5 | Light Showers | 20 | Windy |
| 6 | Showers | 21 | Hurricane |
| 7 | Heavy Showers | 22 | Tornado |
| 8 | Thunderstorm | 23 | Extreme Cold |
| 9 | Heavy Thunder | 24 | Extreme Heat |
| 10 | Sleet | 25 | Icy Roads |
| 11 | Light Snow | 26 | Light Freezing Rain |
| 12 | Snow | 27 | Moderate Snow |
| 13 | Heavy Snow | 28 | Unknown / Clear Night |
| 14 | Blizzard | | |

---

## Design Decisions

### D1 — Visual Styles (3 sets to start)
| Style Key | Description | Color Palette |
|---|---|---|
| `neon` | Glowing outlines on dark | Cyan/magenta/yellow neons |
| `flat` | Solid filled shapes, minimal | Flat material colors |
| `outline` | Thin strokes, no fill | White outlines on transparent |

### D2 — Canvas Drawing
Each image: 60×60px canvas, same pattern as `iconLibrary.ts` draw functions.
File: `src/lib/weatherIconSets.ts`
Structure:
```typescript
type WeatherStyle = 'neon' | 'flat' | 'outline';
function drawWeatherIcon(ctx, code: number, style: WeatherStyle): void
function generateWeatherSet(style: WeatherStyle): string[]  // returns 29 dataUrls
```

### D3 — UI: Style Picker
In `PropertyPanel.tsx`, when `element.type === 'IMG_LEVEL'` and `element.dataType === 'WEATHER_CURRENT'`:
- Show a dropdown: "Neon", "Flat", "Outline"
- Preview row shows all 29 mini icons for selected style
- Selection stored in `element.weatherStyle?: string`

### D4 — ZPK Asset Generation
`assetImageGenerator.ts` `generateWeatherIcons()` currently returns a placeholder.
Replace with: call `generateWeatherSet(element.weatherStyle ?? 'flat')` → 29 real PNGs.

### D5 — Shared Icon Shapes
Weather conditions group into visual families. Define once, reuse:
- `drawSun(ctx, x, y, r, style)` — used by codes 0, 1, 24
- `drawCloud(ctx, x, y, style)` — used by codes 2, 3, 4, 18
- `drawRain(ctx, x, y, drops, style)` — used by 5, 6, 7
- `drawSnow(ctx, x, y, flakes, style)` — used by 11, 12, 13, 14, 27
- `drawThunder(ctx, x, y, style)` — used by 8, 9
- `drawWind(ctx, x, y, style)` — used by 20, 21, 22
- `drawSpecial(ctx, code, style)` — 10, 15-17, 19, 23, 25, 26, 28

---

## Tasks

### Task 1 — Create `weatherIconSets.ts`
- Define 3 styles × 29 draw functions
- Use shared primitive helpers (`drawSun`, `drawCloud`, etc.)
- Export `generateWeatherSet(style)` → `string[]` (29 dataUrls)
- Export `WEATHER_STYLES: { key, label }[]`

### Task 2 — Update `PropertyPanel.tsx`
- Add weather style picker for `IMG_LEVEL` + `WEATHER_CURRENT` elements
- Show mini preview strip of all 29 icons for the selected style
- Persist selection to `element.weatherStyle`

### Task 3 — Update `WatchFaceElement` type
- Add optional `weatherStyle?: string` to `WatchFaceElement`

### Task 4 — Update `assetImageGenerator.ts`
- Replace placeholder `generateWeatherIcons()` with real `generateWeatherSet(style)`
- Read `element.weatherStyle ?? 'flat'` to determine which style

### Task 5 — Update `InteractiveCanvas.tsx`
- Canvas preview of IMG_LEVEL weather should show code=2 (partly cloudy) as preview image
- Use `generateWeatherSet` to get preview image for the selected style

---

## Acceptance Criteria
- [ ] 3 styles × 29 icons = 87 weather icons drawn in code
- [ ] Style picker shown in PropertyPanel for weather IMG_LEVEL elements
- [ ] All 29 PNGs embedded in ZPK when style is selected
- [ ] Canvas preview shows correct style icon
- [ ] No TypeScript errors, build succeeds
