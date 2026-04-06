# Zepp OS Watchface Widget API Reference
## Source: Official Zepp Watch Faces Reference Document (.docx)
## Extracted & Organized: April 6, 2026
## Audited against V2 generator: ALL MATCH

---

## Table of Contents
1. [app.json Configuration](#appjson-configuration)
2. [Widget: IMG](#img)
3. [Widget: TEXT](#text)
4. [Widget: TEXT_IMG](#text_img)
5. [Widget: ARC_PROGRESS](#arc_progress)
6. [Widget: IMG_LEVEL](#img_level)
7. [Widget: IMG_TIME](#img_time)
8. [Widget: IMG_DATE](#img_date)
9. [Widget: IMG_WEEK](#img_week)
10. [Widget: TIME_POINTER](#time_pointer)
11. [Widget: IMG_POINTER](#img_pointer)
12. [Widget: DATE_POINTER](#date_pointer)
13. [Widget: BUTTON](#button)
14. [Widget: IMG_STATUS](#img_status)
15. [Widget: CIRCLE](#circle)
16. [Widget: IMG_CLICK](#img_click)
17. [Widget: ARC (static)](#arc-static)
18. [Widget: FILL_RECT](#fill_rect)
19. [Widget: STROKE_RECT](#stroke_rect)
20. [Widget: IMG_ANIM](#img_anim)
21. [Widget: IMG_PROGRESS](#img_progress)
22. [Widget: GRADKIENT_POLYLINE](#gradkient_polyline)
23. [Widget: WIDGET_DELEGATE](#widget_delegate)
24. [Widget: Editable Watchface](#editable-watchface)
25. [data_type Reference Table](#data_type-reference)
26. [system_status Reference Table](#system_status-reference)
27. [show_level Reference Table](#show_level-reference)
28. [ALIGN Reference](#align-reference)
29. [Widget API Methods](#widget-api-methods)

---

## app.json Configuration

### Root Structure
| Property | Type | Required | Description |
|----------|------|----------|-------------|
| configVersion | string | YES | `"v2"` for our use. `"v3"` is latest but v2 works for Balance 2 |
| app | object | YES | App metadata (appId, appName, appType, version, vender, description) |
| runtime | object | YES | API version info (compatible, target, minVersion) |
| permissions | Array<string> | YES | Permission list (can be empty `[]`) |
| targets | object | YES | Per-device build config (module, platforms, designWidth) |
| i18n | object | YES | Internationalization |
| defaultLanguage | string | YES | Default language e.g. `"en-US"` |
| debug | boolean | NO | Default false |

### app object
| Property | Type | Required |
|----------|------|----------|
| appId | number | YES |
| appName | string | YES |
| appType | string | YES (`"watchface"` for dials) |
| version | object | YES (`{code: number, name: string}`) |
| icon | string | NO |
| vender | string | YES |
| cover | Array<string> | NO |
| description | string | YES |

### watchface module
| Property | Type | Required | Description |
|----------|------|----------|-------------|
| path | string | YES | Path to watchface entry e.g. `"watchface/index"` |
| main | number | NO | Display on home page (default 1, 0=none) |
| editable | number | NO | Editable watchface (default 0) |
| lockscreen | number | NO | Lock screen support (default 0) |

### platforms
| Property | Type | Required |
|----------|------|----------|
| name | string | NO |
| deviceSource | number | YES (v2) |

**Amazfit Balance 2 deviceSources: `[8519936, 8519937, 8519939]`**

---

## IMG

Static image display with optional rotation.

```js
hmUI.createWidget(hmUI.widget.IMG, {
  x: 125,           // YES - x coordinate
  y: 125,           // YES - y coordinate
  w: 100,           // NO - defaults to image width
  h: 100,           // NO - defaults to image height
  src: 'image.png', // YES - image path in assets/
  pos_x: 0,         // NO - horizontal offset relative to widget
  pos_y: 0,         // NO - vertical offset relative to widget
  angle: 0,         // NO - rotation angle (12 o'clock = 0°)
  center_x: 0,      // NO - rotation center X
  center_y: 0,      // NO - rotation center Y
  alpha: 255,        // NO - opacity [0-255]
  show_level: hmUI.show_level.ONLY_NORMAL
})
```

**Note:** w/h are widget bounds, NOT image scaling. Image displays at native size.

---

## TEXT

Text display with size, color, alignment.

```js
hmUI.createWidget(hmUI.widget.TEXT, {
  x: 96,            // YES
  y: 120,           // YES
  w: 288,           // YES
  h: 46,            // YES
  color: 0xffffff,  // NO - text color (hex)
  text_size: 36,    // NO - font size
  text: 'HELLO',    // NO - text content
  align_h: hmUI.align.CENTER_H,  // NO
  align_v: hmUI.align.CENTER_V,  // NO
  text_style: hmUI.text_style.ELLIPSIS, // NO - overflow handling
  line_space: 0,    // NO - row spacing
  char_space: 0,    // NO - character spacing
  show_level: hmUI.show_level.ONLY_NORMAL
})
```

---

## TEXT_IMG

Display numbers as image fonts. Binds to data_type for auto-updating.

```js
hmUI.createWidget(hmUI.widget.TEXT_IMG, {
  x: 207,           // YES
  y: 340,           // YES
  w: 100,           // YES (auto-calculated if type set)
  h: 40,            // YES (auto-calculated if type set)
  font_array: [     // YES - 10 images sorted 0-9
    '00.png', '01.png', '02.png', '03.png', '04.png',
    '05.png', '06.png', '07.png', '08.png', '09.png'
  ],
  type: hmUI.data_type.BATTERY,  // NO - auto-bind to sensor data
  text: '123',      // NO - manual text (disables type binding)
  h_space: 1,       // NO - spacing between digits
  align_h: hmUI.align.CENTER_H, // NO
  // Unit images (optional):
  unit_sc: 'unit.png',    // Simplified Chinese unit
  unit_en: 'unit.png',    // English unit
  unit_tc: 'unit.png',    // Traditional Chinese unit
  negative_image: 'neg.png', // NO - minus sign image
  dot_image: 'dot.png',     // NO - decimal point image
  show_level: hmUI.show_level.ONLY_NORMAL
})
```

**Special text characters:** `u` → unit image, `-` → negative image, `.` → dot image

---

## ARC_PROGRESS

Arc progress indicator. Binds to data_type for sensor-driven progress.

```js
hmUI.createWidget(hmUI.widget.ARC_PROGRESS, {
  center_x: 100,    // YES - circle center X
  center_y: 100,    // YES - circle center Y
  radius: 200,      // YES
  start_angle: -90,  // YES - 0° = 3 o'clock direction
  end_angle: 90,     // YES
  color: 0x34e073,   // YES
  line_width: 10,    // YES
  level: 50,         // NO - progress [0-100] (auto when type bound)
  src_bg: 'bg.png',  // NO - background image
  type: hmUI.data_type.BATTERY, // NO - auto-bind (firmware manages level)
  show_level: hmUI.show_level.ONLY_NORMAL
})
```

**IMPORTANT:** When `type` is set, firmware auto-manages `level`. Do NOT set both.

---

## IMG_LEVEL

Display one image from array based on level/data binding.

```js
hmUI.createWidget(hmUI.widget.IMG_LEVEL, {
  x: 0,             // YES
  y: 0,             // YES
  w: 480,           // NO - defaults to image size
  h: 480,           // NO - defaults to image size
  image_array: ['1.png', '2.png', '3.png'], // YES
  image_length: 3,  // YES - array size
  level: 2,         // NO - which image [0 to image_length-1]
  type: hmUI.data_type.WEATHER_CURRENT, // NO - auto-bind
  show_level: hmUI.show_level.ONLY_NORMAL
})
```

---

## IMG_TIME

Time display using digit image arrays. Handles hours, minutes, seconds.

```js
hmUI.createWidget(hmUI.widget.IMG_TIME, {
  // HOURS
  hour_zero: 1,       // Whether to pad with zero
  hour_startX: 205,   // X position
  hour_startY: 184,   // Y position
  hour_array: timeArray, // 10 digit images [0-9]
  hour_space: 8,       // Spacing between digits
  hour_align: hmUI.align.LEFT,
  // Hour units (colon separators)
  hour_unit_sc: 'colon.png',
  hour_unit_tc: 'colon.png',
  hour_unit_en: 'colon.png',

  // MINUTES (same pattern, replace hour→minute)
  minute_zero: 1,
  minute_startX: 95,
  minute_startY: 220,
  minute_array: timeArray,
  minute_space: 0,
  minute_align: hmUI.align.LEFT,
  minute_follow: 0,    // 1 = auto-position after hour

  // SECONDS (same pattern, replace hour→second)
  second_follow: 1,

  // AM/PM (optional)
  am_x: 200, am_y: 100,
  am_sc_path: 'am.png',
  am_en_path: 'am_en.png',
  // pm same pattern, prefix pm_

  show_level: hmUI.show_level.ONLY_NORMAL
})
```

---

## IMG_DATE

Date display (year/month/day) using digit or character image arrays.

```js
hmUI.createWidget(hmUI.widget.IMG_DATE, {
  // DAY (prefix: day_)
  day_startX: 92,
  day_startY: 198,
  day_sc_array: fontArray,  // 10 digits OR 31 images if is_character
  day_tc_array: fontArray,
  day_en_array: fontArray,
  day_zero: 1,        // Pad with zero
  day_space: 0,       // Digit spacing
  day_align: hmUI.align.LEFT,
  day_is_character: false, // true = 31 images (one per day)
  day_follow: 0,      // 1 = auto-position after previous

  // MONTH (prefix: month_) - same pattern
  month_startX: 105,
  month_startY: 198,
  month_sc_array: monthArray, // 10 digits OR 12 images if is_character
  month_tc_array: monthArray,
  month_en_array: monthArray,
  month_zero: 0,
  month_space: 0,
  month_is_character: true, // true = 12 month name images
  month_align: hmUI.align.LEFT,

  // YEAR (prefix: year_) - same pattern
  // year_is_character is INVALID (ignored for year)

  show_level: hmUI.show_level.ONLY_NORMAL
})
```

**CRITICAL:** When `xx_is_character: true`, month MUST have 12 images, day MUST have 31 images.

---

## IMG_WEEK

Weekday display from 7-image array.

```js
hmUI.createWidget(hmUI.widget.IMG_WEEK, {
  x: 175,
  y: 113,
  // w,h CANNOT be set - uses actual image dimensions
  week_en: weekArray,  // 7 images [Mon-Sun]
  week_sc: weekArray,  // Simplified Chinese
  week_tc: weekArray,  // Traditional Chinese
  show_level: hmUI.show_level.ONLY_NORMAL
})
```

---

## TIME_POINTER

Analog clock hands (hour/minute/second) — ALL in ONE widget.

```js
hmUI.createWidget(hmUI.widget.TIME_POINTER, {
  // HOUR HAND
  hour_centerX: 240,  // Screen rotation center X
  hour_centerY: 240,  // Screen rotation center Y
  hour_posX: 19,      // Image's own rotation pivot X (from TOP-LEFT)
  hour_posY: 100,     // Image's own rotation pivot Y (from TOP-LEFT)
  hour_path: 'hour_hand.png',
  hour_cover_path: 'cover.png', // Optional center cap
  hour_cover_x: 0,              // Optional cap position
  hour_cover_y: 0,              // Optional cap position

  // MINUTE HAND (same pattern, replace hour→minute)
  minute_centerX: 240,
  minute_centerY: 240,
  minute_posX: 8,
  minute_posY: 100,
  minute_path: 'minute_hand.png',

  // SECOND HAND (same pattern, replace hour→second)
  second_centerX: 240,
  second_centerY: 240,
  second_posX: 3,
  second_posY: 120,
  second_path: 'second_hand.png',

  show_level: hmUI.show_level.ONLY_NORMAL
})
```

### posX/posY Explained (CRITICAL for pointer correctness)
- `posX`, `posY` = the rotation pivot point **within the hand image itself**
- Measured from **TOP-LEFT** corner of the image (Y=0 is top)
- Example: Hand image is 22×140px, shaft hole at bottom-center:
  - `posX = 11` (half of 22px width)
  - `posY = 70` (near bottom, since image height is 140 and pivot is at ~50%)
- `centerX`, `centerY` = where on the SCREEN the rotation axis sits (usually screen center 240,240)

**WARNING:** `xx_cover` is optional. Configure at most ONE cover image. Multiple covers may affect performance.

---

## IMG_POINTER

Data-bound pointer rotation (e.g., battery gauge needle).

```js
hmUI.createWidget(hmUI.widget.IMG_POINTER, {
  src: 'pointer.png', // YES - pointer image
  x: 22,              // YES - image's own rotation pivot X
  y: 121,             // YES - image's own rotation pivot Y
  center_x: 227,      // YES - screen rotation center X
  center_y: 227,      // YES - screen rotation center Y
  angle: 245,          // NO - static angle (0° = 12 o'clock)
  start_angle: 0,      // NO - rotation range start
  end_angle: 360,      // NO - rotation range end
  type: hmUI.data_type.BATTERY, // NO - bind to data for auto-rotation
  invalid_visible: true, // NO - show if data invalid
  show_level: hmUI.show_level.ONLY_NORMAL
})
```

**Note:** Widget area is FULL SCREEN. x/y here are the image's pivot, NOT position.

---

## DATE_POINTER

Pointer that rotates based on date data (month/day/weekday).

```js
hmUI.createWidget(hmUI.widget.DATE_POINTER, {
  center_x: 100,
  center_y: 100,
  src: 'pointer.png',
  posX: 0,
  posY: 0,
  start_angle: 0,
  end_angle: 180,
  type: hmUI.date.WEEK,  // hmUI.date.MONTH | hmUI.date.DAY | hmUI.date.WEEK
  // Optional background
  scale_x: 0, scale_y: 0,
  scale_sc: 'bg.png',
  scale_tc: 'bg.png',
  scale_en: 'bg.png',
  // Optional cover
  cover_x: 0, cover_y: 0,
  cover_path: 'cover.png',
  show_level: hmUI.show_level.ONLY_NORMAL
})
```

---

## BUTTON

Clickable button with normal/pressed states.

```js
hmUI.createWidget(hmUI.widget.BUTTON, {
  x: 192,            // YES
  y: 120,            // YES
  w: 100,            // YES (-1 = use normal_src size)
  h: 35,             // YES (-1 = use normal_src size)
  text: '',           // YES - button text
  color: 0xffffff,    // NO - text color
  text_size: 18,      // NO - font size
  normal_src: 'btn.png',   // NO - normal state image
  press_src: 'btn_p.png',  // NO - pressed state image
  normal_color: 0x000000,  // NO - normal bg color (use with press_color)
  press_color: 0x333333,   // NO - pressed bg color
  radius: 12,         // NO - rounded corners (only with color bg)
  click_func: () => { // NO - click callback
    hmApp.startApp({ url: 'Settings_batteryManagerScreen', native: true })
  },
  show_level: hmUI.show_level.ONLY_NORMAL
})
```

**Notes:**
- Color bg overrides image bg when both set
- normal_color and press_color MUST be set together
- normal_src and press_src MUST be set together
- When modifying via setProperty, MUST pass x, y, w, h

---

## IMG_STATUS

System status indicator (shows/hides image based on system state).

```js
hmUI.createWidget(hmUI.widget.IMG_STATUS, {
  x: 0,
  y: 0,
  // w, h optional - defaults to image size
  src: 'status.png',
  type: hmUI.system_status.DISCONNECT, // See system_status table
  show_level: hmUI.show_level.ONLY_NORMAL
})
```

---

## CIRCLE

Simple filled circle.

```js
hmUI.createWidget(hmUI.widget.CIRCLE, {
  center_x: 240,     // YES
  center_y: 240,     // YES
  radius: 120,       // YES
  color: 0xfc6950,   // YES - hex color
  alpha: 200,        // NO - transparency [0-255], 0=fully transparent
  show_level: hmUI.show_level.ONLY_NORMAL
})
```

---

## IMG_CLICK

Clickable image that launches a specific app/screen based on data_type.

```js
hmUI.createWidget(hmUI.widget.IMG_CLICK, {
  x: 329,
  y: 337,
  w: 40,
  h: 23,
  src: 'click.png',
  type: hmUI.data_type.STRESS  // REQUIRED - determines action
})
```

---

## ARC (Static)

Static arc (no data binding, purely decorative).

```js
hmUI.createWidget(hmUI.widget.ARC, {
  x: 100,             // YES
  y: 100,             // YES
  w: 250,             // YES
  h: 250,             // YES
  radius: 100,        // YES
  start_angle: -90,   // YES - 0° = 3 o'clock
  end_angle: 90,      // YES
  color: 0xfc6950,    // YES
  line_width: 20,     // YES
  show_level: hmUI.show_level.ONLY_NORMAL
})
```

---

## FILL_RECT

Solid color rectangle.

```js
hmUI.createWidget(hmUI.widget.FILL_RECT, {
  x: 125, y: 125, w: 230, h: 150, // ALL YES
  color: 0xfc6950,   // YES
  radius: 20,        // NO - rounded corners
  angle: 0,          // NO - rotation
  show_level: hmUI.show_level.ONLY_NORMAL
})
```

---

## STROKE_RECT

Stroked (outline) rectangle.

```js
hmUI.createWidget(hmUI.widget.STROKE_RECT, {
  x: 125, y: 125, w: 230, h: 150, // ALL YES
  color: 0xfc6950,   // YES
  radius: 20,        // NO
  line_width: 4,     // NO
  angle: 0,          // NO
  show_level: hmUI.show_level.ONLY_NORMAL
})
```

---

## IMG_ANIM

Frame-by-frame animation from numbered image sequence.

```js
hmUI.createWidget(hmUI.widget.IMG_ANIM, {
  x: 208,
  y: 230,
  anim_path: 'anim',           // YES - folder name in assets
  anim_prefix: 'animation',    // YES - filename prefix
  anim_ext: 'png',             // YES - extension
  anim_fps: 60,                // YES - frame rate
  anim_size: 36,               // YES - total frame count
  repeat_count: 1,             // YES - 0=infinite, 1=once
  anim_status: 3,              // YES - see hmUI.anim_status
  anim_complete_call: () => {},  // NO - completion callback
  display_on_restart: false,     // NO - restart on resume
  step: 1,                      // NO - frame skip
  default_frame_index: 0,       // NO - frame for power saving mode
  show_level: hmUI.show_level.ONLY_NORMAL
})
```

---

## IMG_PROGRESS

Sequential image display based on level.

```js
hmUI.createWidget(hmUI.widget.IMG_PROGRESS, {
  x: [100, 200, 300],        // YES - x coords array
  y: [100, 200, 300],        // YES - y coords array
  image_array: ['1.png', '2.png', '3.png'], // YES
  image_length: 3,            // YES
  level: 2,                   // NO - [1 to image_length]
  show_level: hmUI.show_level.ONLY_NORMAL
})
```

---

## GRADKIENT_POLYLINE

Gradient polyline graph (supports HEART and SLEEP data auto-draw).

```js
hmUI.createWidget(hmUI.widget.GRADKIENT_POLYLINE, {
  x: 0, y: 0, w: 480, h: 200,
  type: hmUI.data_type.SLEEP  // Auto-draw if HEART or SLEEP
})
// Manual draw:
widget.clear()
widget.addLine({ data: [{x:0,y:0}, {x:100,y:10}], count: 2 })
widget.addPoint({ data: [{x:0,y:0}], count: 1 })
```

---

## WIDGET_DELEGATE

Virtual widget for watchface lifecycle events. No rendering.

```js
hmUI.createWidget(hmUI.widget.WIDGET_DELEGATE, {
  resume_call: function() {
    // Watchface launched or returned from other screen
  },
  pause_call: function() {
    // Left watchface (notifications, apps, etc.)
  }
})
```

---

## Editable Watchface

### WATCHFACE_EDIT_GROUP
```js
hmUI.createWidget(hmUI.widget.WATCHFACE_EDIT_GROUP, {
  edit_id: 101,
  x: 153, y: 246, w: 148, h: 148,
  select_image: 'mask/select.png',
  un_select_image: 'mask/select.png',
  default_type: hmUI.edit_type.HEART,
  optional_types: [{ type: hmUI.edit_type.HEART, preview: 'preview/bat.png' }],
  count: 1,
  tips_BG: 'mask/text_tag.png',
  tips_x: 19,    // Relative to widget x,y (negative = above)
  tips_y: -36,
  tips_width: 110,
  tips_margin: 10
})
// Get current selection:
const editType = editGroup.getProperty(hmUI.prop.CURRENT_TYPE)
```

### WATCHFACE_EDIT_BG
```js
hmUI.createWidget(hmUI.widget.WATCHFACE_EDIT_BG, {
  edit_id: 103,
  x: 0, y: 0,
  bg_config: [
    { id: 1, preview: 'bg_edit_1.png', path: 'preview_1.png' },
    // ...
  ],
  count: 5,
  default_id: 1,
  fg: 'fg.png',
  tips_x: 178, tips_y: 428,
  tips_bg: 'bg_tips.png'
})
```

### WATCHFACE_EDIT_POINTER
```js
const pointerConfig = [{
  id: 1,
  hour: { centerX: 240, centerY: 240, posX: 12, posY: 172, path: 'hand_h.png' },
  minute: { centerX: 240, centerY: 240, posX: 18, posY: 229, path: 'hand_m.png' },
  second: { centerX: 240, centerY: 240, posX: 13, posY: 245, path: 'hand_s.png' },
  preview: 'preview1.png'
}]
const pointerEdit = hmUI.createWidget(hmUI.widget.WATCHFACE_EDIT_POINTER, {
  edit_id: 120,
  config: pointerConfig,
  count: pointerConfig.length,
  default_id: 1,
  fg: 'pointer/fg.png',
  tips_x: 178, tips_y: 428,
  tips_bg: 'bg_tips.png'
})
// Apply selected pointer to TIME_POINTER:
const pointerProp = pointerEdit.getProperty(hmUI.prop.CURRENT_CONFIG, !aodModel)
hmUI.createWidget(hmUI.widget.TIME_POINTER, pointerProp)
```

### Edit Masks
```js
// 100% mask (required if no editable background)
hmUI.createWidget(hmUI.widget.WATCHFACE_EDIT_MASK, {
  x: 0, y: 0, w: 454, h: 454,
  src: 'mask/mask100.png',
  show_level: hmUI.show_level.ONLY_EDIT
})
// 70% foreground mask
hmUI.createWidget(hmUI.widget.WATCHFACE_EDIT_FG_MASK, {
  x: 0, y: 0, w: 454, h: 454,
  src: 'mask/mask70.png',
  show_level: hmUI.show_level.ONLY_EDIT
})
```

---

## data_type Reference

### Sensor Data Types (for TEXT_IMG, ARC_PROGRESS, IMG_LEVEL, IMG_POINTER)

| Value | Description | Range |
|-------|-------------|-------|
| `hmUI.data_type.BATTERY` | Battery level | [0, 100] |
| `hmUI.data_type.STEP` | Current steps | [0, 99999] |
| `hmUI.data_type.STEP_TARGET` | Step goal | [0, 99999] |
| `hmUI.data_type.CAL` | Calories | [0, 9999] |
| `hmUI.data_type.CAL_TARGET` | Calorie goal | [0, 9999] |
| `hmUI.data_type.HEART` | Heart rate | [min, 220-age] |
| `hmUI.data_type.PAI_DAILY` | PAI today | [0, 75] |
| `hmUI.data_type.PAI_WEEKLY` | PAI weekly total | [0, 525] |
| `hmUI.data_type.DISTANCE` | Distance | [0, 99] |
| `hmUI.data_type.STAND` | Standing count | [0, 12] |
| `hmUI.data_type.STAND_TARGET` | Standing goal | 12 |
| `hmUI.data_type.WEATHER_CURRENT` | Current temp | ≤3 digits |
| `hmUI.data_type.WEATHER_LOW` | Low temp | ≤3 digits |
| `hmUI.data_type.WEATHER_HIGH` | High temp | ≤3 digits |
| `hmUI.data_type.UVI` | UV index | [1, 5] |
| `hmUI.data_type.AQI` | Air quality (China only) | (0, 999] |
| `hmUI.data_type.HUMIDITY` | Humidity | [0, 100] |
| `hmUI.data_type.FAT_BURNING` | Fat burn minutes | [0, 999] |
| `hmUI.data_type.FAT_BURNING_TARGET` | Fat burn goal | [0, 999] |
| `hmUI.data_type.SUN_CURRENT` | Time to sunrise/sunset | HH:MM |
| `hmUI.data_type.SUN_RISE` | Sunrise time | HH:MM |
| `hmUI.data_type.SUN_SET` | Sunset time | HH:MM |
| `hmUI.data_type.WIND` | Wind level | [0, 12] |
| `hmUI.data_type.STRESS` | Stress level | [0, 100] |
| `hmUI.data_type.SPO2` | Blood oxygen | (50, 100] |
| `hmUI.data_type.ALTIMETER` | Air pressure | (0, 1200] |
| `hmUI.data_type.FLOOR` | Floors climbed | [0, 999] |
| `hmUI.data_type.ALARM_CLOCK` | Alarm time | HH:MM |
| `hmUI.data_type.COUNT_DOWN` | Countdown | 2 digits |
| `hmUI.data_type.STOP_WATCH` | Stopwatch | 2 digits |
| `hmUI.data_type.SLEEP` | Sleep time | HH:MM |
| `hmUI.data_type.TRAINING_LOAD` | Training load | ≤3 digits |
| `hmUI.data_type.VO2MAX` | Max oxygen uptake | [15, 65] |
| `hmUI.data_type.RECOVERY_TIME` | Recovery time | [0, 97] |
| `hmUI.data_type.MONTH_RUN_TIMES` | Monthly run count | [0, 100] |
| `hmUI.data_type.MONTH_RUN_DISTANCE` | Monthly run distance | ≤4 int + 2 dec |
| `hmUI.data_type.ALTITUDE` | Altitude | ≤5 digits |
| `hmUI.data_type.READINESS` | Readiness score | [0, 100] |

### IMG_CLICK Only (jump action, not data display)

| Value | Description |
|-------|-------------|
| `hmUI.data_type.MOON` | Moon phase |
| `hmUI.data_type.OUTDOOR_RUNNING` | Outdoor running |
| `hmUI.data_type.WALKING` | Walking |
| `hmUI.data_type.OUTDOOR_CYCLING` | Outdoor cycling |
| `hmUI.data_type.FREE_TRAINING` | Free training |
| `hmUI.data_type.POOL_SWIMMING` | Pool swimming |
| `hmUI.data_type.OPEN_WATER_SWIMMING` | Open water swimming |
| `hmUI.data_type.PHN` | Sports coach |
| `hmUI.data_type.BREATH_TRAIN` | Breath training |

---

## system_status Reference

| Value | Description |
|-------|-------------|
| `hmUI.system_status.CLOCK` | Alarm clock is ON |
| `hmUI.system_status.DISCONNECT` | Bluetooth disconnected |
| `hmUI.system_status.DISTURB` | Do Not Disturb ON |
| `hmUI.system_status.LOCK` | Screen lock ON |

---

## show_level Reference

| State | Property |
|-------|----------|
| Normal Display | `hmUI.show_level.ONLY_NORMAL` |
| Screen Off (AOD) | `hmUI.show_level.ONAL_AOD` |
| Edit Mode | `hmUI.show_level.ONLY_EDIT` |

Can be combined: `hmUI.show_level.ONLY_NORMAL | hmUI.show_level.ONAL_AOD`

---

## ALIGN Reference

| Value | Description |
|-------|-------------|
| `hmUI.align.LEFT` | Horizontal left |
| `hmUI.align.RIGHT` | Horizontal right |
| `hmUI.align.CENTER_H` | Horizontal center |
| `hmUI.align.TOP` | Vertical top |
| `hmUI.align.BOTTOM` | Vertical bottom |
| `hmUI.align.CENTER_V` | Vertical center |

---

## Widget API Methods

### createWidget
```js
const widget = hmUI.createWidget(hmUI.widget.IMG, { x: 0, y: 0, src: 'a.png' })
```

### setProperty
```js
widget.setProperty(hmUI.prop.MORE, { x: 100, y: 200 })
widget.setProperty(hmUI.prop.VISIBLE, false)
widget.setProperty(hmUI.prop.TEXT, 'new text')
```

### getProperty
```js
const props = widget.getProperty(hmUI.prop.MORE, {})
const height = widget.getProperty(hmUI.prop.H)
```

### deleteWidget
```js
hmUI.deleteWidget(widget)
```

### addEventListener
```js
widget.addEventListener(hmUI.event.CLICK_DOWN, (info) => { ... })
```
