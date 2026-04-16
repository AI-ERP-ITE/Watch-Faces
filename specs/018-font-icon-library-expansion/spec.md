# Spec 018 — Font & Icon Library Expansion

## Overview

Two-part improvement to the watchface creator's asset libraries:

1. **Font Library** — expand from 20 to 50+ fonts, with Windows/Office system fonts and local-font priority so no unnecessary network download if font already installed.
2. **Icon Library** — expand from 38 to 80+ icons, with categories renamed to match Amazfit watchface data types exactly.

---

## Part A — Font Library

### Current State
- `fontLibrary.ts`: 20 font entries
- `index.html`: 12 Google Fonts loaded via single URL
- Some system fonts (Arial, Courier New, Georgia, etc.) listed in fontLibrary.ts but loaded without explicit `local()` priority

### Goal
- 50+ fonts total organized by category
- **Local-first priority**: browser checks `local('FontName')` before fetching from Google
- **Google Fonts**: used for display/watchface fonts not on most systems
- **System fonts**: Windows / Microsoft Office fonts — already on user's machine, zero download
- New font categories in the UI: `watchface` | `display` | `system` | `monospace`

---

### Font Categories

#### Category 1 — Watchface / Futuristic (Google Fonts, already partially in project)
| Font Name | Google Fonts Key |
|---|---|
| Orbitron | Orbitron |
| Bebas Neue | Bebas+Neue |
| Oswald | Oswald |
| Rajdhani | Rajdhani |
| Share Tech Mono | Share+Tech+Mono |
| Goldman | Goldman |
| Russo One | Russo+One |
| Audiowide | Audiowide |
| Rationale | Rationale |
| Black Ops One | Black+Ops+One |
| **NEW** Michroma | Michroma |
| **NEW** Exo 2 | Exo+2 |
| **NEW** Syncopate | Syncopate |
| **NEW** Nova Mono | Nova+Mono |
| **NEW** VT323 | VT323 |
| **NEW** Press Start 2P | Press+Start+2P |
| **NEW** Chakra Petch | Chakra+Petch |
| **NEW** Quantico | Quantico |
| **NEW** Oxanium | Oxanium |
| **NEW** Wallpoet | Wallpoet |

#### Category 2 — Clean / UI (Google Fonts)
| Font Name | Google Fonts Key |
|---|---|
| Roboto | Roboto ✅ already loaded |
| Roboto Mono | Roboto+Mono ✅ already loaded |
| **NEW** Open Sans | Open+Sans |
| **NEW** Lato | Lato |
| **NEW** Montserrat | Montserrat |
| **NEW** Poppins | Poppins |
| **NEW** Nunito | Nunito |
| **NEW** Raleway | Raleway |
| **NEW** Josefin Sans | Josefin+Sans |
| **NEW** Righteous | Righteous |
| **NEW** Ubuntu | Ubuntu |
| **NEW** Oxygen Mono | Oxygen+Mono |

#### Category 3 — Windows / Microsoft Office System Fonts
> These fonts are already installed on any Windows machine. NO download needed. Browser uses local copy automatically when referenced by name.

| Font Name | Office / Windows |
|---|---|
| Arial | Windows built-in |
| Arial Black | Windows built-in |
| Arial Narrow | Windows built-in |
| Calibri | Microsoft Office |
| Calibri Light | Microsoft Office |
| Cambria | Microsoft Office |
| Candara | Microsoft Office |
| Consolas | Microsoft Office |
| Constantia | Microsoft Office |
| Corbel | Microsoft Office |
| Courier New | Windows built-in |
| Franklin Gothic Medium | Windows built-in |
| Georgia | Windows built-in |
| Impact | Windows built-in |
| Lucida Console | Windows built-in |
| Lucida Sans Unicode | Windows built-in |
| Microsoft Sans Serif | Windows built-in |
| Palatino Linotype | Windows built-in |
| Segoe UI | Windows built-in |
| Segoe UI Light | Windows built-in |
| Tahoma | Windows built-in |
| Times New Roman | Windows built-in |
| Trebuchet MS | Windows built-in |
| Verdana | Windows built-in |

> **License Note**: Windows/Office fonts (Calibri, Segoe UI, etc.) are licensed for use on the licensed machine. They are fine for personal watchface creation. Do NOT redistribute the .ttf files publicly. Our project doesn't include the files, just references them by name.

---

### Local Priority Logic

**For Google Fonts**: append `local('FontName')` inside Google Fonts `@font-face` by adding each font twice: once local, then remote. Google's CDN CSS already does this automatically for most fonts when you use their `?display=swap` URL.

**For system fonts**: simply use the font name in CSS/Canvas — the browser resolves local automatically. No `@font-face` needed.

**For fonts you want offline AND online** (optional advanced step): copy `.ttf` to `public/fonts/` and add:
```css
@font-face {
  font-family: 'Calibri';
  src: local('Calibri'), url('/fonts/Calibri.ttf') format('truetype');
  font-weight: normal;
}
```

---

### Windows Font Copy Walk-Through (TASK 3)

If user wants fonts to work on GitHub Pages (where visitors may not have Windows fonts):

1. Open `C:\Windows\Fonts\` in File Explorer
2. Find font file (e.g. `calibri.ttf`, `segoeui.ttf`)
3. Copy file to `d:\Zepp Watchface maker website\Kimi_Agent_Untitled Chat\app\public\fonts\`
4. Agent adds `@font-face` rule to `index.html` for that font with `local()` first:
   ```css
   @font-face {
     font-family: 'Calibri';
     src: local('Calibri'), url('/fonts/Calibri.ttf') format('truetype');
   }
   ```
5. Agent adds entry to `fontLibrary.ts`

> This is an optional step. For LOCAL use only (testing on your own PC), system fonts work without copying anything.

---

## Part B — Icon Library

### Current State
- 38 icons in 5 categories: `health | activity | environment | system | time`
- Categories do NOT align with Amazfit data type names

### Goal
- 80+ icons
- Categories renamed to match Amazfit data types exactly

### New Category Map (aligned with Amazfit data types)

| New Category | Replaces | Amazfit Data Types Covered |
|---|---|---|
| `health` | health | HEART, SPO2, STRESS, SLEEP, PAI, STAND, BODY_TEMP, HYDRATION, BREATH_RATE, ECG, MENSTRUAL |
| `fitness` | activity | STEP, CAL, DISTANCE, FAT_BURN, WORKOUT, RUNNING, CYCLING, SWIMMING, YOGA, HIKING, GYM |
| `weather` | environment | WEATHER_CURRENT, TEMPERATURE, HUMIDITY, WIND, UVI, AQI, MOON_PHASE, BAROMETER, SUNRISE, SUNSET, PRESSURE |
| `system` | system | BATTERY, BLUETOOTH, WIFI, NOTIFICATION, DND, AIRPLANE, SETTINGS, CHARGING, LOCK, GPS, NFC, VOLUME, PHONE |
| `time` | time | TIME, DATE, ALARM, STOPWATCH, TIMER, WORLD_CLOCK, CALENDAR, COUNTDOWN |

> Note: `environment` → `weather`, `activity` → `fitness`. All keys stay the same, only category string changes. This is non-breaking.

### New Icons to Add

#### Health (5 new)
| Key | Label | Color |
|---|---|---|
| `body_temp` | Body Temperature | #ff6655 |
| `hydration` | Hydration | #33aaff |
| `breath_rate` | Breathing Rate | #aaddff |
| `ecg` | ECG / Heart Wave | #ff3366 |
| `menstrual` | Menstrual Cycle | #ff6699 |

#### Fitness (3 new)
| Key | Label | Color |
|---|---|---|
| `gym` | Gym / Strength | #ffaa33 |
| `yoga` | Yoga | #aa66ff |
| `hiking` | Hiking | #88bb44 |

#### Weather (4 new)
| Key | Label | Color |
|---|---|---|
| `weather_thunder` | Thunder / Lightning | #ffdd00 |
| `weather_fog` | Fog / Mist | #aabbbb |
| `weather_hail` | Hail | #88ccff |
| `weather_partly_cloudy` | Partly Cloudy | #ffcc55 |

#### System (5 new)
| Key | Label | Color |
|---|---|---|
| `charging` | Charging | #44ff88 |
| `lock` | Lock / Security | #ffaa55 |
| `gps` | GPS | #44ddff |
| `nfc` | NFC | #aa88ff |
| `volume` | Volume | #cccccc |

#### Time (2 new)
| Key | Label | Color |
|---|---|---|
| `calendar` | Calendar | #55aaff |
| `countdown` | Countdown | #ff9944 |

---

## Tasks

### TASK 1 — Expand Google Fonts URL in `index.html`
- Add 20 new fonts to the existing Google Fonts `<link>` tag
- Fonts: Michroma, Exo 2, Syncopate, Nova Mono, VT323, Press Start 2P, Chakra Petch, Quantico, Oxanium, Wallpoet, Open Sans, Lato, Montserrat, Poppins, Nunito, Raleway, Josefin Sans, Righteous, Ubuntu, Oxygen Mono
- Keep existing 12 fonts unchanged
- File: `app/index.html`

### TASK 2 — Add all fonts to `fontLibrary.ts`
- Add new Google Fonts entries (from Task 1)
- Add all Windows/Office system font entries (no loading needed, just list)
- Organize with `category` field: `'watchface' | 'display' | 'system' | 'monospace'`
- Keep all existing 20 fonts unchanged
- File: `app/src/lib/fontLibrary.ts`

### TASK 3 — Windows Font Walk-Through (NO CODE)
- Agent explains step-by-step how user copies .ttf from `C:\Windows\Fonts\`
- Agent shows exactly which files to copy and what names to use
- Agent shows the `@font-face` CSS snippet to paste into `index.html`
- NO automatic file copying (user must do it manually — files have license restrictions)

### TASK 4 — Rename icon categories in `iconLibrary.ts`
- Change `'environment'` → `'weather'`
- Change `'activity'` → `'fitness'`
- Update TypeScript union type to: `'health' | 'fitness' | 'weather' | 'system' | 'time'`
- All existing icon keys and draw functions stay the same
- File: `app/src/lib/iconLibrary.ts`

### TASK 5 — Add new health icons
- Add 5 new icons: body_temp, hydration, breath_rate, ecg, menstrual
- Draw functions via canvas (48×48, same pattern as existing)
- File: `app/src/lib/iconLibrary.ts`

### TASK 6 — Add new fitness icons
- Add 3 new icons: gym, yoga, hiking
- File: `app/src/lib/iconLibrary.ts`

### TASK 7 — Add new weather icons
- Add 4 new icons: weather_thunder, weather_fog, weather_hail, weather_partly_cloudy
- File: `app/src/lib/iconLibrary.ts`

### TASK 8 — Add new system icons
- Add 5 new icons: charging, lock, gps, nfc, volume
- File: `app/src/lib/iconLibrary.ts`

### TASK 9 — Add new time icons
- Add 2 new icons: calendar, countdown
- File: `app/src/lib/iconLibrary.ts`

---

## Acceptance Criteria
- [ ] `index.html` loads 30+ fonts from Google Fonts
- [ ] `fontLibrary.ts` has 50+ entries including Windows/Office system fonts
- [ ] Icon categories match Amazfit data type names
- [ ] 80+ icons total in iconLibrary.ts
- [ ] All icons render correctly in the canvas (48×48)
- [ ] No TypeScript errors
- [ ] Build passes: `npm run build`
