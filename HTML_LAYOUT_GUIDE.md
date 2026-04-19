# Zepp Watchface Generator — HTML Layout Specification

**For any AI tool generating layouts for this system.**  
This is not a suggestion — it is the exact format the parser requires.

---

## Core Rule: Standard HTML + CSS Only

The parser renders your HTML in a real browser iframe (480×480 px) and reads computed positions via `getBoundingClientRect()`. This means:

- **Position must come from CSS**, not custom attributes
- **Only standard HTML elements** — `<div>`, `<span>`, `<img>`, `<svg>`, etc.
- No custom tags (`<screen>`, `<text>`, `<arc>`, `<image>`) — the browser renders these as 0×0 invisible elements and they are silently skipped

---

## Container Requirements

The outermost wrapper **must be a single `<div>`** with exactly this inline style:

```html
<div style="position:relative; width:480px; height:480px; overflow:hidden; background:#000;">
  <!-- all elements inside here -->
</div>
```

**Why:** The parser checks for `width:480px` in the inline style. If not found, it auto-wraps — but any CSS `position:absolute` inside won't resolve correctly unless the parent is `position:relative`.

---

## Element Positioning

Every element inside the container must use **absolute CSS positioning**:

```html
<div style="position:absolute; left:Xpx; top:Ypx; width:Wpx; height:Hpx;">
```

The parser reads `rect.left - containerRect.left` for x, `rect.top - containerRect.top` for y.

**Do NOT use:**
- `transform: translate()`
- Flexbox/grid centering (produces unpredictable rect values)
- `margin: auto`
- Any attribute-based positioning (`x=`, `y=`, `cx=`, `cy=`)

---

## How Elements Are Classified — 5-Priority System

### Priority 1 (Most Reliable): `data-widget` attribute

Set `data-widget` to the exact Zepp widget type. The pipeline maps it directly — no guessing.

```html
<div data-widget="ARC_PROGRESS" data-type="BATTERY"
     style="position:absolute; left:40px; top:40px; width:400px; height:400px;">
</div>
```

**Supported `data-widget` values:**

| Value | What it creates |
|---|---|
| `TIME_POINTER` | Analog clock hands (hour/min/sec) |
| `IMG_TIME` | Digital time display |
| `IMG_DATE` | Date digits |
| `IMG_WEEK` | Weekday images |
| `ARC_PROGRESS` | Arc/ring progress bar |
| `TEXT_IMG` | Digit-image number readout |
| `TEXT` | Static text label |
| `IMG` | Static image |
| `IMG_LEVEL` | Tiered icon (weather) |
| `IMG_STATUS` | Status icon (bluetooth, etc.) |
| `CIRCLE` | Filled circle shape |
| `BUTTON` | Tappable shortcut button |

**Supported `data-type` values (for `ARC_PROGRESS` / `TEXT_IMG`):**

`BATTERY` · `STEP` · `HEART` · `SPO2` · `CAL` · `DISTANCE` · `STRESS` · `PAI` · `SLEEP` · `STAND` · `FAT_BURN` · `UVI` · `AQI` · `HUMIDITY` · `SUN_RISE` · `SUN_SET` · `WIND` · `ALARM` · `NOTIFICATION` · `MOON` · `WEATHER_CURRENT`

---

### Priority 2 (Reliable): CSS class name keywords

If no `data-widget`, the parser checks the `class` attribute for these keywords:

| Keyword in class | Creates |
|---|---|
| `time` / `clock` / `hour` / `minute` / `second` | `IMG_TIME` |
| `date` / `day` / `month` / `calendar` | `IMG_DATE` |
| `week` / `weekday` | `IMG_WEEK` |
| `battery` / `batt` / `charge` | `TEXT_IMG` (BATTERY) |
| `step` / `walk` / `pedometer` | `TEXT_IMG` (STEP) |
| `heart` / `hr` / `bpm` / `pulse` | `TEXT_IMG` (HEART) |
| `weather` / `temp` / `temperature` | `TEXT_IMG` (WEATHER) |
| `arc` / `ring` / `progress` / `gauge` | `ARC_PROGRESS` |
| `hand` / `pointer` / `analog` | `TIME_POINTER` |

**The element must have a non-zero CSS size** (width > 0, height > 0) for the class to be detected.

---

### Priority 3: Text content patterns

If no class keyword matches and the element has visible text, the content is matched:

| Text content | Creates |
|---|---|
| `12:34` or `12:34:56` | `IMG_TIME` |
| `MON` `TUE` … `SUN` | `IMG_WEEK` |
| `JAN` `FEB` … `DEC` | `IMG_DATE` |
| `72%` (short string with %) | `TEXT_IMG` (BATTERY) |
| `8542` (4+ digit number) | `TEXT_IMG` (STEP) |
| `72` (1–2 digit number) | `IMG_DATE` |
| Any other number | `TEXT_IMG` |

---

### Priority 4: Tag type

| HTML tag | Creates |
|---|---|
| `<img>` | `IMG` |
| `<svg>` | `ARC_PROGRESS` |
| `<circle>` or `<path>` (direct HTML) | `ARC_PROGRESS` |

---

### Priority 5 (Fallback): Any element with visible text

Creates a `TEXT` element using the literal text content and `font-size` from computed style.

---

## Color

Colors must be **CSS color values** on the element's `style` attribute — the parser reads `window.getComputedStyle(el).color`.

```html
style="color: #FF4D4D;"
style="color: rgb(255, 77, 77);"
```

Both work. `#RRGGBB` hex is preferred.

---

## The Proven Template

Copy this exactly and fill in your elements:

```html
<div style="position:relative; width:480px; height:480px; overflow:hidden; background:#111;">

  <!-- BACKGROUND IMAGE -->
  <img src="bg.png"
       style="position:absolute; left:0; top:0; width:480px; height:480px;" />

  <!-- ANALOG CLOCK HANDS -->
  <div class="analog-hand-pointer"
       style="position:absolute; left:0; top:0; width:480px; height:480px;">
  </div>

  <!-- DIGITAL TIME (if not using analog) -->
  <div class="time-display"
       style="position:absolute; left:140px; top:180px; width:200px; height:90px; color:#FFFFFF;">
    12:34
  </div>

  <!-- DATE -->
  <div class="date-display"
       style="position:absolute; left:160px; top:110px; width:160px; height:50px; color:#9A9A9A;">
    15
  </div>

  <!-- WEEKDAY -->
  <div class="weekday-display"
       style="position:absolute; left:160px; top:320px; width:160px; height:40px; color:#9A9A9A;">
    MON
  </div>

  <!-- BATTERY ARC (most reliable method) -->
  <div data-widget="ARC_PROGRESS" data-type="BATTERY"
       style="position:absolute; left:40px; top:40px; width:400px; height:400px; color:#00FFC6;">
  </div>

  <!-- STEPS -->
  <div data-widget="TEXT_IMG" data-type="STEP"
       style="position:absolute; left:160px; top:360px; width:160px; height:50px; color:#A8A8A8;">
  </div>

  <!-- HEART RATE -->
  <div data-widget="TEXT_IMG" data-type="HEART"
       style="position:absolute; left:160px; top:395px; width:140px; height:40px; color:#FF4D4D;">
  </div>

  <!-- WEATHER -->
  <div data-widget="IMG_LEVEL" data-type="WEATHER_CURRENT"
       style="position:absolute; left:210px; top:50px; width:60px; height:60px;">
  </div>

  <!-- STATUS ICON (bluetooth) -->
  <div data-widget="IMG_STATUS"
       style="position:absolute; left:225px; top:20px; width:30px; height:30px;">
  </div>

</div>
```

---

## What Is Silently Ignored (Never Use)

| ❌ Do NOT use | Reason |
|---|---|
| `<screen>`, `<text>`, `<arc>`, `<image>` | Unknown tags → 0×0 → filtered |
| `x="240" y="200"` attributes | No CSS effect → 0×0 rect |
| `format="%H"` / `value="%BATTERY%"` | Attributes not read |
| `font="..."` attribute | Parser reads `font-family` CSS only |
| `cx`, `cy`, `radius`, `stroke_width` | SVG attributes inside HTML → no layout |
| `transform: translate()` | Parsed but position not used by classifier |
| Flexbox/grid layout without absolute fallback | Rects may land at unexpected positions |
| Elements placed outside 0–480 range | Filtered: `if (x >= 480 \|\| y >= 480) continue` |
| More than 20 elements total | Hard-capped at 20 |

---

## Maximum Limits

- **Max elements:** 20 (hard cap in `mapDomToElements`)
- **Canvas:** 480×480 px — coordinates outside this range are discarded
- **One `TIME_POINTER`** — duplicates are ignored

---

## Checklist Before Submitting HTML

- [ ] Outer wrapper is a single `<div>` with `position:relative; width:480px; height:480px`
- [ ] Every element uses `position:absolute; left:Xpx; top:Ypx; width:Wpx; height:Hpx`
- [ ] All important data elements have `data-widget` + `data-type` attributes
- [ ] Colors set via CSS `color:` property (not custom attributes)
- [ ] No custom/XML tags (`<screen>`, `<text>`, `<arc>`, `<image>`)
- [ ] Total elements ≤ 20
- [ ] No element has left/top that places it at ≥ 480px
