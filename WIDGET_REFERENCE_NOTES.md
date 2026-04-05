# Zepp OS V2 Widget Reference Notes (Balance 2)
## Collected from: Official Docs, Working Reference (Brushed Steel), Extracted Watchfaces

---

## CORE PATTERN — Every Widget

```javascript
hmUI.createWidget(hmUI.widget.WIDGET_TYPE, {
    // All properties in ONE declarative object
    // Order of createWidget calls = z-order (first = bottom layer)
});
```

**Lifecycle wrapper (V2 — PROVEN WORKING):**
```javascript
const h = new DeviceRuntimeCore.WidgetFactory(new DeviceRuntimeCore.HmDomApi(__$$app$$__, __$$module$$__));
const {px} = __$$app$$__.__globals__;

__$$module$$__.module = DeviceRuntimeCore.WatchFace({
    init_view() {
        // ALL widgets created here
    },
    onInit() { },
    build() { this.init_view(); },
    onDestroy() { }
});
```

**Show levels:**
- `hmUI.show_level.ONLY_NORMAL` — Active/interactive mode only
- `hmUI.show_level.ONLY_AOD` — Always-On Display only
- `hmUI.show_level.ALL` — Both modes

---

## 1. IMG — Static Image

**Source:** Working reference (Brushed Steel), Official docs
**Use:** Background, icons, decorations, any static PNG

```javascript
hmUI.createWidget(hmUI.widget.IMG, {
    x: 0,
    y: 0,
    w: 480,
    h: 480,
    src: 'background_ed15585c.png',
    alpha: 255,                              // 0=transparent, 255=opaque
    show_level: hmUI.show_level.ONLY_NORMAL
});
```

**Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| x, y | number | Position (top-left corner) |
| w, h | number | Width, height |
| src | string | Image filename in assets/ folder |
| alpha | number | Opacity 0-255 |
| angle | number | Rotation angle (degrees) |
| center_x, center_y | number | Rotation center point |
| pos_x, pos_y | number | Rotation pivot offset |
| show_level | const | Display mode |

---

## 2. IMG_TIME — Time Digit Display (Hours/Minutes/Seconds)

**Source:** Working reference
**Use:** Show time as image-based digits (each digit is a PNG)

```javascript
// Hours tens digit
hmUI.createWidget(hmUI.widget.IMG_TIME, {
    hour_startX: 119,
    hour_startY: 216,
    hour_array: [
        "set_1_62x80_h0s0b255_0.png",
        "set_1_62x80_h0s0b255_1.png",
        "set_1_62x80_h0s0b255_2.png",
        "set_1_62x80_h0s0b255_3.png",
        "set_1_62x80_h0s0b255_4.png",
        "set_1_62x80_h0s0b255_5.png",
        "set_1_62x80_h0s0b255_6.png",
        "set_1_62x80_h0s0b255_7.png",
        "set_1_62x80_h0s0b255_8.png",
        "set_1_62x80_h0s0b255_9.png"
    ],
    hour_space: 0,
    hour_align: hmUI.align.CENTER_H,
    hour_zero: 1,                          // Show leading zero
    // Can also include minute_ and second_ variants:
    // minute_startX, minute_startY, minute_array, minute_space, minute_align, minute_zero
    // second_startX, second_startY, second_array, second_space, second_align, second_zero
    show_level: hmUI.show_level.ONLY_NORMAL
});
```

**Key params:**
- `hour_array` / `minute_array` / `second_array` — 10-element arrays (digits 0-9)
- `hour_startX/Y` — Position
- `hour_space` — Spacing between digits
- `hour_zero` — 1=show leading zero, 0=hide
- `hour_align` — Alignment

---

## 3. IMG_DATE — Date Digit Display (Day/Month)

**Source:** Working reference
**Use:** Show day or month as image-based digits

```javascript
// Day of month
hmUI.createWidget(hmUI.widget.IMG_DATE, {
    day_startX: 331,
    day_startY: 243,
    day_en_array: [
        "set_3_27x32_h0s0b255_0.png",
        // ... 10 digit images (0-9)
    ],
    day_space: 0,
    day_align: hmUI.align.CENTER_H,
    day_zero: 0,
    day_follow: 0,
    show_level: hmUI.show_level.ONLY_NORMAL
});

// Month (separate widget)
hmUI.createWidget(hmUI.widget.IMG_DATE, {
    month_startX: 355,
    month_startY: 216,
    month_en_array: [
        "set_2_27x32_h0s0b255_0.png",
        // ... 10 digit images (0-9)
    ],
    month_space: 0,
    month_align: hmUI.align.CENTER_H,
    month_zero: 0,
    month_follow: 0,
    show_level: hmUI.show_level.ONLY_NORMAL
});
```

**Key params:**
- `day_en_array` / `month_en_array` — 10-element arrays (digits 0-9)
- `day_startX/Y` / `month_startX/Y` — Position
- `day_zero` / `month_zero` — Leading zero toggle
- `day_follow` / `month_follow` — Follow previous element position

---

## 4. IMG_WEEK — Weekday Display

**Source:** Working reference
**Use:** Show weekday as image (7 images, one per day)

```javascript
hmUI.createWidget(hmUI.widget.IMG_WEEK, {
    x: 162,
    y: 310,
    week_en: [
        "set_5_86x25_h0s0b80_Mon.png",
        "set_5_86x25_h0s0b80_Tue.png",
        "set_5_86x25_h0s0b80_Wed.png",
        "set_5_86x25_h0s0b80_Thu.png",
        "set_5_86x25_h0s0b80_Fri.png",
        "set_5_86x25_h0s0b80_Sat.png",
        "set_5_86x25_h0s0b80_Sun.png"
    ],
    show_level: hmUI.show_level.ONLY_NORMAL
});
```

**Key params:**
- `week_en` — 7-element array (Mon-Sun)
- `week_tc` — Traditional Chinese variant
- `week_sc` — Simplified Chinese variant

---

## 5. IMG_LEVEL — Image Array Bound to Data

**Source:** Working reference (weather icons)
**Use:** Show one image from an array based on sensor data level (weather conditions, battery states)

```javascript
hmUI.createWidget(hmUI.widget.IMG_LEVEL, {
    x: 136,
    y: 153,
    image_array: [
        "meteo_1.png",
        "meteo_2.png",
        // ... up to 29 images for weather conditions
        "meteo_29.png"
    ],
    image_length: 29,
    type: hmUI.data_type.WEATHER_CURRENT,
    show_level: hmUI.show_level.ONLY_NORMAL
});
```

**Key params:**
- `image_array` — Array of images (one shown based on level)
- `image_length` — Number of images
- `type` — Data binding: `hmUI.data_type.BATTERY`, `WEATHER_CURRENT`, `STEP`, etc.

---

## 6. IMG_STATUS — Status Icon (On/Off)

**Source:** Working reference (Bluetooth disconnect icon)
**Use:** Show/hide icon based on boolean status (BT connected, alarm set, DND on)

```javascript
hmUI.createWidget(hmUI.widget.IMG_STATUS, {
    x: 228,
    y: 110,
    src: 'set_8_24x24_h0s0b217_bluetooth.png',
    type: hmUI.data_type.DISCONNECT,
    show_level: hmUI.show_level.ONLY_NORMAL
});
```

**Key params:**
- `src` — Image path
- `type` — `hmUI.data_type.DISCONNECT` (BT), `hmUI.data_type.ALARM_CLOCK`, `hmUI.data_type.DND`, etc.

---

## 7. TEXT — Dynamic Text Display

**Source:** Working reference (city name)
**Use:** Display text string, can be updated via WIDGET_DELEGATE

```javascript
hmUI.createWidget(hmUI.widget.TEXT, {
    x: 34,
    y: 143,
    w: 102,
    h: 60,
    text_size: 20,
    color: 0xFFFFFFFF,
    text: '',
    align_h: hmUI.align.CENTER_H,
    align_v: hmUI.align.CENTER_V,
    show_level: hmUI.show_level.ONLY_NORMAL
});
```

**Key params:**
| Param | Type | Description |
|-------|------|-------------|
| x, y, w, h | number | Position and size |
| text | string | Content |
| text_size | number | Font size |
| color | hex | Text color (0xAARRGGBB or 0xRRGGBB) |
| align_h | const | `hmUI.align.LEFT`, `CENTER_H`, `RIGHT` |
| align_v | const | `hmUI.align.TOP`, `CENTER_V`, `BOTTOM` |
| text_style | const | `hmUI.text_style.WRAP` for wrapping |

**Dynamic update pattern (from reference — city name via weather sensor):**
```javascript
let cityWidget = hmUI.createWidget(hmUI.widget.TEXT, { ... });

// In WIDGET_DELEGATE resume_call:
const weatherSensor = hmSensor.createSensor(hmSensor.id.WEATHER);
const cityName = weatherSensor.getForecastWeather().cityName;
cityWidget.setProperty(hmUI.prop.TEXT, cityName);
```

---

## 8. BUTTON — Tap to Open Native App

**Source:** Working reference (6 buttons for shortcuts)
**Use:** Invisible/visible tap area that opens native watch apps

```javascript
hmUI.createWidget(hmUI.widget.BUTTON, {
    x: 196,
    y: 111,
    w: 100,
    h: 35,
    text: '',
    press_src: 'trasparente.png',       // Transparent PNG for invisible button
    normal_src: 'trasparente.png',
    click_func: () => {
        hmApp.startApp({ url: 'Settings_batteryManagerScreen', native: true })
    },
    show_level: hmUI.show_level.ONLY_NORMAL
});
```

**Proven native app URLs (from working reference):**
| URL | Opens |
|-----|-------|
| `Settings_batteryManagerScreen` | Battery details |
| `heart_app_Screen` | Heart rate app |
| `BioChargeHomeScreen` | Bio charge / PAI |
| `activityAppScreen` | Steps / Activity |
| `StressHomeScreen` | Stress monitor |
| `WeatherScreen` | Weather app |

---

## 9. ARC_PROGRESS — Circular Arc Progress

**Source:** Official Zepp docs, extracted watchfaces (online12, online17)
**Use:** Circular progress indicator (battery, steps, bio charge)

```javascript
hmUI.createWidget(hmUI.widget.ARC_PROGRESS, {
    center_x: px(240),
    center_y: px(240),
    radius: px(220),
    start_angle: -90,          // 12 o'clock
    end_angle: 90,             // 6 o'clock
    line_width: px(8),
    color: 0x00FF00,           // Green
    level: 75,                 // 0-100 scale (manual)
    // OR
    type: hmUI.data_type.BATTERY,  // Auto-bind to sensor
    show_level: hmUI.show_level.ONLY_NORMAL
});
```

**Angle reference:**
```
         270° / -90° (12 o'clock / top)
              |
180° --------+-------- 0° (3 o'clock / right)
(9 o'clock)  |
              |
          90° (6 o'clock / bottom)
```

**Key params:**
| Param | Type | Description |
|-------|------|-------------|
| center_x, center_y | number | Arc center point |
| radius | number | Arc radius |
| start_angle | number | Start angle in degrees |
| end_angle | number | End angle in degrees |
| line_width | number | Arc stroke thickness |
| color | hex | Arc color |
| level | number | 0-100 fill percentage (manual) |
| type | const | Auto-bind to sensor data |
| src_bg | string | Background image behind arc |

---

## 10. TIME_POINTER — Analog Clock Hands

**Source:** Extracted watchfaces (online17), Official docs
**Use:** Hour/minute/second rotating hands — ALL THREE in ONE widget

```javascript
hmUI.createWidget(hmUI.widget.TIME_POINTER, {
    hour: {
        centerX: px(240),
        centerY: px(240),
        posX: px(220),          // Pivot X within the hand image
        posY: px(100),          // Pivot Y within the hand image
        path: 'assets/hour_hand.png',
    },
    minute: {
        centerX: px(240),
        centerY: px(240),
        posX: px(230),
        posY: px(156),
        path: 'assets/minute_hand.png',
    },
    second: {
        centerX: px(240),
        centerY: px(240),
        posX: px(235),
        posY: px(149),
        path: 'assets/second_hand.png',
    },
    show_level: hmUI.show_level.ALL
});
```

**Important:** ONE widget handles ALL hands. Do NOT create 3 separate TIME_POINTER widgets.

**Key params per hand:**
- `centerX/Y` — Screen rotation center (usually screen center: 240,240)
- `posX/Y` — Where in the hand image the rotation pivot is
- `path` — Hand image filename

---

## 11. TEXT_IMG — Number Display from Sensor Data

**Source:** Official docs
**Use:** Display numeric values (heart rate, steps, calories) using digit images

```javascript
hmUI.createWidget(hmUI.widget.TEXT_IMG, {
    x: px(100),
    y: px(200),
    type: hmUI.data_type.HEART,
    font_array: [
        'num_0.png', 'num_1.png', 'num_2.png', 'num_3.png', 'num_4.png',
        'num_5.png', 'num_6.png', 'num_7.png', 'num_8.png', 'num_9.png'
    ],
    align_h: hmUI.align.CENTER_H,
    show_level: hmUI.show_level.ONLY_NORMAL
});
```

**Key params:**
- `font_array` — 10 digit images (0-9)
- `type` — Data binding (HEART, STEP, CAL, BATTERY, etc.)
- Optional: `unit_en/unit_sc/unit_tc` — Unit suffix image
- Optional: `icon` — Prefix icon image
- Optional: `negative_image` — Minus sign image (for temperature)
- Optional: `dot_image` — Decimal point image

---

## 12. IMG_PROGRESS — Linear/Positioned Progress

**Source:** Official docs
**Use:** Progress bar using positioned images

```javascript
hmUI.createWidget(hmUI.widget.IMG_PROGRESS, {
    x: [px(10), px(30), px(50), px(70), px(90)],  // X positions for each segment
    y: [px(400), px(400), px(400), px(400), px(400)],
    image_array: ['seg_0.png', 'seg_1.png', 'seg_2.png', 'seg_3.png', 'seg_4.png'],
    image_length: 5,
    type: hmUI.data_type.STEP,
    show_level: hmUI.show_level.ONLY_NORMAL
});
```

---

## 13. IMG_POINTER — Rotating Pointer Bound to Data

**Source:** Official docs
**Use:** Single rotating pointer bound to a data value (like a gauge needle)

```javascript
hmUI.createWidget(hmUI.widget.IMG_POINTER, {
    src: 'pointer.png',
    center_x: px(240),
    center_y: px(240),
    pos_x: px(10),
    pos_y: px(100),
    start_angle: -120,
    end_angle: 120,
    type: hmUI.data_type.BATTERY,
    show_level: hmUI.show_level.ONLY_NORMAL
});
```

---

## 14. DATE_POINTER — Date/Week Rotating Pointer

**Source:** Official docs
**Use:** Rotating pointer for day of week, day of month, or month

```javascript
hmUI.createWidget(hmUI.widget.DATE_POINTER, {
    src: 'day_pointer.png',
    center_x: px(240),
    center_y: px(240),
    pos_x: px(10),
    pos_y: px(80),
    start_angle: 0,
    end_angle: 360,
    type: hmUI.date.WEEK,   // or hmUI.date.MONTH, hmUI.date.DAY
    show_level: hmUI.show_level.ONLY_NORMAL
});
```

---

## 15. IMG_ANIM — Frame Animation

**Source:** Official docs
**Use:** Animated image sequence (loading indicators, effects)

```javascript
hmUI.createWidget(hmUI.widget.IMG_ANIM, {
    anim_path: 'anim_frames',           // Folder name in assets
    anim_prefix: 'frame',               // File prefix
    anim_ext: 'png',                    // File extension
    anim_fps: 24,                       // Frames per second
    anim_size: 30,                      // Total frame count
    repeat_count: 0,                    // 0=infinite, N=times
    anim_status: 1,                     // 1=start, 0=stop
    x: px(100),
    y: px(100),
    show_level: hmUI.show_level.ONLY_NORMAL
});
```

---

## 16. ARC — Static Arc Shape

**Source:** Official docs
**Use:** Decorative arc/ring (not data-bound)

```javascript
hmUI.createWidget(hmUI.widget.ARC, {
    x: px(100),
    y: px(100),
    w: px(280),
    h: px(280),
    start_angle: 0,
    end_angle: 360,
    color: 0x333333,
    line_width: px(6),
    show_level: hmUI.show_level.ONLY_NORMAL
});
```

---

## 17. FILL_RECT — Filled Rectangle

**Source:** Official docs
**Use:** Colored rectangle/rounded rectangle

```javascript
hmUI.createWidget(hmUI.widget.FILL_RECT, {
    x: px(50),
    y: px(50),
    w: px(100),
    h: px(100),
    color: 0xFF0000,
    radius: px(10),       // Corner radius
    show_level: hmUI.show_level.ONLY_NORMAL
});
```

---

## 18. STROKE_RECT — Outlined Rectangle

**Source:** Official docs

```javascript
hmUI.createWidget(hmUI.widget.STROKE_RECT, {
    x: px(50),
    y: px(50),
    w: px(100),
    h: px(100),
    color: 0xFFFFFF,
    line_width: px(2),
    radius: px(10),
    show_level: hmUI.show_level.ONLY_NORMAL
});
```

---

## 19. CIRCLE — Circle Shape

**Source:** Official docs

```javascript
hmUI.createWidget(hmUI.widget.CIRCLE, {
    center_x: px(240),
    center_y: px(240),
    radius: px(100),
    color: 0xFF0000,
    show_level: hmUI.show_level.ONLY_NORMAL
});
```

---

## 20. WIDGET_DELEGATE — Lifecycle Hooks

**Source:** Working reference
**Use:** Run code when watchface is resumed/paused (update dynamic data)

```javascript
const widgetDelegate = hmUI.createWidget(hmUI.widget.WIDGET_DELEGATE, {
    resume_call: () => {
        // Runs when watchface becomes active
        // Update dynamic data here (weather city, etc.)
        const weather = hmSensor.createSensor(hmSensor.id.WEATHER);
        const city = weather.getForecastWeather().cityName;
        cityWidget.setProperty(hmUI.prop.TEXT, city);
    },
    pause_call: () => {
        // Runs when watchface goes to background
    }
});
```

---

## 21. IMG_CLICK — Clickable Image

**Source:** Official docs
**Use:** Image that responds to tap (alternative to invisible BUTTON)

```javascript
hmUI.createWidget(hmUI.widget.IMG_CLICK, {
    x: px(100),
    y: px(100),
    w: px(80),
    h: px(80),
    src: 'icon.png',
    type: hmUI.event.CLICK,
    click_func: () => {
        hmApp.startApp({ url: 'heart_app_Screen', native: true });
    },
    show_level: hmUI.show_level.ONLY_NORMAL
});
```

---

## COMPLETE data_type ENUM

**Source:** Official Zepp docs

| data_type | Sensor | Values |
|-----------|--------|--------|
| `hmUI.data_type.BATTERY` | Battery | 0-100% |
| `hmUI.data_type.STEP` | Pedometer | Step count |
| `hmUI.data_type.CAL` | Calories | kcal burned |
| `hmUI.data_type.HEART` | Heart rate | BPM |
| `hmUI.data_type.PAI_DAILY` | PAI/Bio daily | 0-100+ |
| `hmUI.data_type.PAI_WEEKLY` | PAI/Bio weekly | 0-100+ |
| `hmUI.data_type.DIST` | Distance | meters |
| `hmUI.data_type.STAND` | Standing | hours |
| `hmUI.data_type.WEATHER_CURRENT` | Weather | condition code |
| `hmUI.data_type.WEATHER_LOW` | Weather | low temp |
| `hmUI.data_type.WEATHER_HIGH` | Weather | high temp |
| `hmUI.data_type.HUMIDITY` | Weather | humidity % |
| `hmUI.data_type.UVI` | UV Index | 0-12+ |
| `hmUI.data_type.AQI` | Air quality | index |
| `hmUI.data_type.STRESS` | Stress | 0-100 |
| `hmUI.data_type.SPO2` | Blood oxygen | % |
| `hmUI.data_type.FAT_BURN` | Fat burn | minutes |
| `hmUI.data_type.DISCONNECT` | BT status | boolean |
| `hmUI.data_type.ALARM_CLOCK` | Alarm | boolean |
| `hmUI.data_type.DND` | Do Not Disturb | boolean |
| `hmUI.data_type.SUN_RISE` | Sunrise | time |
| `hmUI.data_type.SUN_SET` | Sunset | time |
| `hmUI.data_type.WIND` | Wind speed | |
| `hmUI.data_type.WIND_DIRECTION` | Wind direction | |
| `hmUI.data_type.MOON` | Moon phase | |

---

## hmSensor IDs (for WIDGET_DELEGATE dynamic updates)

```javascript
hmSensor.id.WEATHER    // getForecastWeather().cityName, .forecastData
hmSensor.id.HEART      // .last, .current
hmSensor.id.BATTERY    // .current
hmSensor.id.STEP       // .current
hmSensor.id.CAL        // .current
hmSensor.id.STRESS     // .current
hmSensor.id.SPO2       // .current
hmSensor.id.PAI        // .dailypai, .weeklypai
```

---

## PROVEN APP SHORTCUTS (hmApp.startApp)

```javascript
hmApp.startApp({ url: 'Settings_batteryManagerScreen', native: true })  // Battery
hmApp.startApp({ url: 'heart_app_Screen', native: true })                // Heart Rate
hmApp.startApp({ url: 'BioChargeHomeScreen', native: true })             // Bio Charge/PAI
hmApp.startApp({ url: 'activityAppScreen', native: true })               // Activity/Steps
hmApp.startApp({ url: 'StressHomeScreen', native: true })                // Stress
hmApp.startApp({ url: 'WeatherScreen', native: true })                   // Weather
```

---

## 22. TEXT_FONT — Numeric Data Display (Built-in Font)

**Source:** novvember/amazfit-watchfaces (modular watchface) — NEW DISCOVERY
**Use:** Display numeric sensor data using built-in system font (no image arrays needed!)
**Advantage over TEXT_IMG:** No need to create digit PNGs — uses system font

```javascript
hmUI.createWidget(hmUI.widget.TEXT_FONT, {
    x: px(100),
    y: px(100),
    w: px(80),
    h: px(60),
    type: hmUI.data_type.BATTERY,
    unit_type: 0,                         // 0=no unit, 1=with unit (°C etc.)
    align_h: hmUI.align.CENTER_H,
    color: 0xFFFFFF,
    show_level: hmUI.show_level.ONLY_NORMAL
});
```

**Proven data_type bindings (from modular watchface):**
- `hmUI.data_type.BATTERY` — Battery percentage
- `hmUI.data_type.WEATHER_CURRENT` — Current temperature
- `hmUI.data_type.WEATHER_LOW` — Low temperature
- `hmUI.data_type.WEATHER_HIGH` — High temperature
- `hmUI.data_type.WIND` — Wind speed
- `hmUI.data_type.HUMIDITY` — Humidity percentage
- `hmUI.data_type.AQI` — Air quality index
- `hmUI.data_type.CAL` — Calories
- `hmUI.data_type.RECOVERY_TIME` — Recovery time
- `hmUI.data_type.PAI_WEEKLY` — Weekly PAI/Bio charge
- `hmUI.data_type.ALARM_CLOCK` — Alarm time (with `padding: true` for 00:00 format)

---

## 23. WATCHFACE_EDIT_GROUP — Customizable Widget Slots

**Source:** novvember/amazfit-watchfaces (modular watchface) — NEW DISCOVERY
**Use:** Let user long-press to choose what data to show in a slot (like official watchfaces)

```javascript
const editGroup = hmUI.createWidget(hmUI.widget.WATCHFACE_EDIT_GROUP, {
    edit_id: 0,                           // Unique slot ID
    x: px(100),
    y: px(100),
    w: px(100),
    h: px(100),
    default_type: WIDGET_OPTIONAL_TYPES[0].type,
    tips_y: px(105),                      // Tip text Y position
    show_level: hmUI.show_level.ONLY_NORMAL
});

// Read user's selection:
const selectedType = editGroup.getProperty(hmUI.prop.CURRENT_TYPE);
```

---

## DYNAMIC UPDATE PATTERNS (setProperty)

**Source:** novvember/amazfit-watchfaces — CRITICAL NEW PATTERNS

### Available hmUI.prop setters:
```javascript
widget.setProperty(hmUI.prop.TEXT, 'new text');      // Update text content
widget.setProperty(hmUI.prop.LEVEL, 75);             // Set arc progress 0-100
widget.setProperty(hmUI.prop.ANGLE, 180);            // Rotate IMG widget
widget.setProperty(hmUI.prop.ALPHA, 255);            // Change opacity (0-255)
widget.setProperty(hmUI.prop.SRC, 'new_image.png');  // Change image source
widget.setProperty(hmUI.prop.MORE, { ...allProps });  // Update multiple props at once
widget.setProperty(hmUI.prop.Y, 100);                // Change Y position
widget.setProperty(hmUI.prop.ANIM, { ... });         // Trigger animation
```

### Standard ARC Gauge Pattern (Background + Active):
```javascript
// 1. Gray background arc (static)
hmUI.createWidget(hmUI.widget.ARC_PROGRESS, {
    center_x: centerX,
    center_y: centerY,
    radius: px(40),
    start_angle: -145,
    end_angle: 145,
    line_width: px(6),
    color: 0x333333,          // Gray background
});

// 2. Colored active arc (data-bound)
hmUI.createWidget(hmUI.widget.ARC_PROGRESS, {
    center_x: centerX,
    center_y: centerY,
    radius: px(40),
    start_angle: -145,
    end_angle: 145,
    line_width: px(6),
    color: 0x00FF00,          // Green active
    type: hmUI.data_type.BATTERY,   // Auto-fills based on data
});
```

### Activity Rings Pattern (Multiple Nested Arcs):
```javascript
const dataTypes = [
    hmUI.data_type.CAL,
    hmUI.data_type.FAT_BURNING,
    hmUI.data_type.STAND,
];
const LINE_WIDTH = px(10);
const GAP = px(3);

dataTypes.forEach((dataType, i) => {
    const radius = px(40) - i * (LINE_WIDTH + GAP);
    
    // Background ring
    hmUI.createWidget(hmUI.widget.ARC_PROGRESS, {
        center_x: centerX, center_y: centerY,
        radius, line_width: LINE_WIDTH,
        color: 0x333333, start_angle: 0, end_angle: 360,
    });
    
    // Active ring
    hmUI.createWidget(hmUI.widget.ARC_PROGRESS, {
        center_x: centerX, center_y: centerY,
        radius, line_width: LINE_WIDTH,
        color: [0xFF0000, 0x00FF00, 0x0088FF][i],
        start_angle: 0, end_angle: 360,
        type: dataType,
    });
});
```

### Bar Chart Pattern (PAI Daily with FILL_RECT):
```javascript
// 7-day PAI bar chart using individual FILL_RECT widgets
const paiSensor = hmSensor.createSensor(hmSensor.id.PAI);
const barWidgets = [];

for (let i = 0; i < 7; i++) {
    // Background bar
    hmUI.createWidget(hmUI.widget.FILL_RECT, {
        x: startX + i * (barWidth + gap),
        y: barY,
        w: barWidth,
        h: barHeight,
        color: 0x333333,
        radius: barWidth / 2,
    });
    
    // Active bar (updated via setProperty)
    barWidgets.push(hmUI.createWidget(hmUI.widget.FILL_RECT, {
        x: startX + i * (barWidth + gap),
        y: barY,
        w: barWidth,
        h: 0,                 // Starts empty
        color: 0x00CCFF,
        radius: barWidth / 2,
    }));
}

// Update in WIDGET_DELEGATE:
barWidgets.forEach((widget, i) => {
    const value = paiSensor[`prepai${i}`];  // prepai0 through prepai6
    const height = (value / 100) * barHeight;
    widget.setProperty(hmUI.prop.MORE, {
        h: height,
        y: barY + barHeight - height,
    });
});
```

---

## COMPLETE SENSOR API (hmSensor)

**Source:** novvember/amazfit-watchfaces + official docs

### Sensor Creation & Events:
```javascript
const sensor = hmSensor.createSensor(hmSensor.id.SENSOR_NAME);
sensor.addEventListener(hmSensor.event.CHANGE, callback);    // Generic change
sensor.addEventListener(hmSensor.event.LAST, callback);       // Heart rate last reading
sensor.removeEventListener(hmSensor.event.CHANGE, callback); // Cleanup
```

### All Sensor IDs & Properties:
| Sensor ID | Properties | Notes |
|-----------|-----------|-------|
| `hmSensor.id.TIME` | `.hour`, `.minute`, `.second`, `.day`, `.week`, `.month`, `.year` | Also has `event.MINUTEEND` |
| `hmSensor.id.BATTERY` | `.current` (0-100) | event.CHANGE |
| `hmSensor.id.STEP` | `.current`, `.target` | event.CHANGE |
| `hmSensor.id.HEART` | `.last`, `.current`, `.today[]` | event.LAST; today = array of readings |
| `hmSensor.id.CAL` | `.current` | Calories burned |
| `hmSensor.id.DISTANCE` | `.current` | In meters |
| `hmSensor.id.WEATHER` | `.curAirIconIndex`, requires `.getForecastWeather()` | Returns `{cityName, forecastData}` |
| `hmSensor.id.PAI` | `.dailypai`, `.weeklypai`, `.prepai0` - `.prepai6` | 7-day history |
| `hmSensor.id.STRESS` | `.current` | 0-100 |
| `hmSensor.id.SPO2` | `.current` | Blood oxygen % |
| `hmSensor.id.SLEEP` | Requires `.updateInfo()` first | Complex sleep data |
| `hmSensor.id.STAND` | `.current` | Standing hours |
| `hmSensor.id.FAT_BURNING` | `.current` | Fat burn minutes |
| `hmSensor.id.WORLD_CLOCK` | `.getWorldClockCount()`, `.getWorldClockInfo(i)` | Returns `{hour, minute, city}` |

### Settings API:
```javascript
hmSetting.getScreenType()         // Returns screen_type.WATCHFACE or screen_type.AOD
hmSetting.getTimeFormat()         // 0 = 12-hour, 1 = 24-hour
hmSetting.screen_type.WATCHFACE   // Normal mode constant
hmSetting.screen_type.AOD         // AOD mode constant
```

---

## WIDGET ANIMATION (setProperty ANIM)

**Source:** novvember/amazfit-watchfaces (modular clicker)

```javascript
widget.setProperty(hmUI.prop.ANIM, {
    anim_fps: 25,
    anim_auto_destroy: 1,        // Destroy after complete
    anim_auto_start: 1,          // Start immediately
    anim_steps: [
        {
            anim_prop: hmUI.prop.Y,       // Property to animate
            anim_rate: 'easeout',         // Easing function
            anim_duration: 300,           // Duration in ms
            anim_from: 100,               // Start value
            anim_to: 70,                  // End value
            anim_offset: 0,              // Delay in ms
        },
        {
            anim_prop: hmUI.prop.Y,
            anim_rate: 'easein',
            anim_duration: 100,
            anim_from: 70,
            anim_to: 100,
            anim_offset: 300,             // Starts after first step
        },
    ],
});
```

---

## PERSISTENT STORAGE (hmFS)

**Source:** novvember/amazfit-watchfaces (modular clicker)

```javascript
// Save integer
hmFS.SysProSetInt('key-name', 42);

// Read integer  
const value = hmFS.SysProGetInt('key-name') || 0;
```

---

## IMG_STATUS with system_status

**Source:** novvember/amazfit-watchfaces (modular alarm)
**Note:** IMG_STATUS can use EITHER `hmUI.data_type` OR `hmUI.system_status`

```javascript
// Alarm status (shows icon when alarm is set)
hmUI.createWidget(hmUI.widget.IMG_STATUS, {
    x: px(100),
    y: px(100),
    src: 'alarm/alarm_on.png',
    type: hmUI.system_status.CLOCK,       // ← system_status, not data_type!
    show_level: hmUI.show_level.ONLY_NORMAL
});

// Bluetooth disconnect (shows when disconnected)
hmUI.createWidget(hmUI.widget.IMG_STATUS, {
    x: px(228),
    y: px(110),
    src: 'bluetooth_disconnect.png',
    type: hmUI.data_type.DISCONNECT,
    show_level: hmUI.show_level.ONLY_NORMAL
});
```

---

## CONFIRMED: ARC_PROGRESS ACCEPTS type FOR AUTO-BINDING ✅

**Source:** novvember/amazfit-watchfaces — CONFIRMED across multiple watchfaces
**Verified data_type values that work with ARC_PROGRESS:**
- `hmUI.data_type.BATTERY` ✅
- `hmUI.data_type.HUMIDITY` ✅
- `hmUI.data_type.AQI` ✅
- `hmUI.data_type.CAL` ✅
- `hmUI.data_type.WEATHER_CURRENT` ✅
- `hmUI.data_type.RECOVERY_TIME` ✅
- `hmUI.data_type.FAT_BURNING` ✅
- `hmUI.data_type.STAND` ✅

---

## COMPLETE data_type ENUM (UPDATED)

| data_type | Widget Compatibility | Values |
|-----------|---------------------|--------|
| `hmUI.data_type.BATTERY` | ARC_PROGRESS, TEXT_FONT, IMG_LEVEL, TEXT_IMG | 0-100% |
| `hmUI.data_type.STEP` | ARC_PROGRESS, TEXT_FONT, TEXT_IMG | Step count |
| `hmUI.data_type.CAL` | ARC_PROGRESS, TEXT_FONT, TEXT_IMG | kcal burned |
| `hmUI.data_type.HEART` | TEXT_FONT, TEXT_IMG | BPM |
| `hmUI.data_type.PAI_DAILY` | ARC_PROGRESS, TEXT_FONT | 0-100+ |
| `hmUI.data_type.PAI_WEEKLY` | ARC_PROGRESS, TEXT_FONT | 0-100+ |
| `hmUI.data_type.DIST` | TEXT_FONT | meters |
| `hmUI.data_type.STAND` | ARC_PROGRESS, TEXT_FONT | hours |
| `hmUI.data_type.WEATHER_CURRENT` | ARC_PROGRESS, TEXT_FONT, IMG_LEVEL | condition/temp |
| `hmUI.data_type.WEATHER_LOW` | TEXT_FONT | low temp |
| `hmUI.data_type.WEATHER_HIGH` | TEXT_FONT | high temp |
| `hmUI.data_type.HUMIDITY` | ARC_PROGRESS, TEXT_FONT | % |
| `hmUI.data_type.UVI` | IMG_LEVEL, TEXT_FONT | 0-12+ |
| `hmUI.data_type.AQI` | ARC_PROGRESS, TEXT_FONT | index |
| `hmUI.data_type.STRESS` | ARC_PROGRESS(?), TEXT_FONT | 0-100 |
| `hmUI.data_type.SPO2` | ARC_PROGRESS(?), TEXT_FONT | % |
| `hmUI.data_type.FAT_BURNING` | ARC_PROGRESS | minutes |
| `hmUI.data_type.RECOVERY_TIME` | ARC_PROGRESS, TEXT_FONT | hours |
| `hmUI.data_type.DISCONNECT` | IMG_STATUS | boolean |
| `hmUI.data_type.ALARM_CLOCK` | TEXT_FONT, IMG_STATUS | time |
| `hmUI.data_type.DND` | IMG_STATUS | boolean |
| `hmUI.data_type.WIND` | TEXT_FONT | speed |
| `hmUI.data_type.MOON` | IMG_LEVEL | phase |
| `hmUI.data_type.SUN_RISE` | TEXT_FONT | time |
| `hmUI.data_type.SUN_SET` | TEXT_FONT | time |

---

## OPEN SOURCE REPOS

| Repo | Stars | Relevance | Status |
|------|-------|-----------|--------|
| [novvember/amazfit-watchfaces](https://github.com/novvember/amazfit-watchfaces) | 60 | ⭐⭐⭐ ZeppOS, round, 42 watchfaces, JS source | ✅ MINED — GOLDMINE |
| [v1ack/watchfaceEditor](https://github.com/v1ack/watchfaceEditor) | 181 | Bip/Cor editor, older format | Skipped — different API |
| [GreatApo/GreatFit](https://github.com/GreatApo/GreatFit) | 119 | Java APK, different API | Skipped |
| [Official Zepp Watchface Maker](https://watchface.zepp.com/create) | — | Official web tool | TODO: investigate |
| [mmk.pw Zepp Explorer](https://mmk.pw/en/zepp_explorer/) | — | Unofficial watchface store | TODO: investigate |

---

## VERIFIED ANSWERS TO PREVIOUS UNKNOWNS

- [x] ✅ ARC_PROGRESS accepts `type` for auto-binding — CONFIRMED in 8+ real watchfaces
- [x] ✅ TEXT_FONT discovered — system font numeric display with data_type binding  
- [x] ✅ TEXT_IMG with unit/icon — TEXT_FONT with `unit_type` is the preferred pattern
- [x] ✅ WATCHFACE_EDIT_GROUP — user-customizable widget slots
- [x] ✅ Widget animation via setProperty(hmUI.prop.ANIM, {...})
- [x] ✅ Persistent storage via hmFS.SysProGetInt/SetInt
- [ ] Additional shortcut URLs beyond the 6 proven ones — still need to find
- [ ] Official Zepp Watchface Maker tool — may have useful patterns

---

## ADDITIONAL PROPERTIES DISCOVERED

### corner_flag (ARC_PROGRESS)
```javascript
corner_flag: 0    // Sharp corners (default)
corner_flag: 3    // Rounded corners on both ends
```

### show_level.ONLY_EDIT
```javascript
hmUI.show_level.ONLY_EDIT    // Only visible in edit/customization mode
```

### Custom Fonts (ZeppOS 2+)
```javascript
hmUI.createWidget(hmUI.widget.TEXT, {
    font: 'fonts/MyFont-Regular.ttf',    // Custom .ttf file in assets
    text_size: px(36),
    // ...
});
```
**Note:** Custom fonts only work on ZeppOS 2+ devices. Use `getHasCustomFontSupport()` to check.

### WIND_DIRECTION (IMG_LEVEL)
```javascript
hmUI.createWidget(hmUI.widget.IMG_LEVEL, {
    image_array: ['wind_0.png', 'wind_1.png', ... 'wind_7.png'],  // 8 directions
    image_length: 8,
    type: hmUI.data_type.WIND_DIRECTION,    // ← Separate from WIND (speed)
});
```

### TIME_POINTER — Second Hand with Cover
```javascript
hmUI.createWidget(hmUI.widget.TIME_POINTER, {
    second_centerX: centerX,
    second_centerY: centerY,
    second_posX: px(45),              // Pivot X in hand image
    second_posY: px(45),              // Pivot Y in hand image
    second_path: 'seconds/pointer.png',
    second_cover_path: 'seconds/top.png',   // Cover image on top of pivot
    second_cover_x: x,
    second_cover_y: y,
    show_level: hmUI.show_level.ONLY_NORMAL
});
```

### Language Detection
```javascript
const lang = DeviceRuntimeCore.HmUtils.getLanguage();  // e.g. 'en-US', 'ru-RU'
```

### Device Screen Size Detection
```javascript
const { width, height } = hmSetting.getDeviceInfo();
// Balance 2: 480 x 480
```

### start_angle / end_angle for TEXT (Curved Text)
```javascript
hmUI.createWidget(hmUI.widget.TEXT, {
    start_angle: -45,    // Text curves along arc starting at -45°
    end_angle: 0,
    // ...
});
```

---

## COMPLETE WATCHFACE EDIT GROUP SYSTEM

**Source:** novvember/modular — Full editable watchface slots

### 19 Possible Widget Types for Edit Slots:
| ID | Name | Widget Code |
|----|------|-------------|
| Temperature | Current/High/Low temp | ARC_PROGRESS + TEXT_FONT |
| UV Index | UV level | IMG_LEVEL (5 images) |
| Sun | Sunrise/sunset time | ARC_PROGRESS + TEXT + IMG |
| Wind | Speed + Direction | TEXT_FONT + IMG_LEVEL (8 directions) |
| Date | Day + Weekday | TEXT + TIME sensor |
| Battery | Percentage | ARC_PROGRESS + TEXT_FONT |
| Seconds | Second hand | TIME_POINTER (second only) |
| Humidity | Percentage | ARC_PROGRESS + TEXT_FONT + IMG icon |
| World Time | City + Time | TEXT + WORLD_CLOCK sensor |
| Weather | Icon + Temp | IMG + TEXT_FONT |
| Moon | Phase image | IMG_LEVEL (29 images) |
| Activity Rings | CAL/FAT/STAND | 3 nested ARC_PROGRESS |
| Air Pressure | Barometer | IMG + TEXT + IMG (rotating dot) |
| Air Quality | AQI index | ARC_PROGRESS + TEXT_FONT |
| PAI | Weekly bars | 7 FILL_RECT bars + TEXT_FONT |
| Calories | Count | ARC_PROGRESS + TEXT_FONT |
| Recovery Time | Hours | ARC_PROGRESS + TEXT_FONT |
| Alarm | Next alarm time | IMG_STATUS + TEXT_FONT |
| Clicker | Tap counter | BUTTON + TEXT + IMG + ANIM |

---

## ZEPPPLAYER v1.7.2 — OPEN SOURCE EMULATOR (ADDED TO PROJECT)

**Location:** `ZeppPlayer_v1.7.2_win32/`
**Source:** MelianMiko — full Zepp OS emulator with widget rendering engine
**Value:** Contains the ACTUAL implementation of every widget type — confirms exact parameter names and rendering behavior

### Complete Widget Registry (from ZeppPlayer source):
```
IMG, IMG_POINTER, IMG_STATUS, TEXT_IMG, IMG_PROGRESS, IMG_LEVEL,
IMG_ANIM, GROUP, FILL_RECT, STROKE_RECT, IMG_WEEK, IMG_TIME, IMG_DATE,
ARC_PROGRESS, ARC, WATCHFACE_EDIT_MASK, WATCHFACE_EDIT_FG_MASK,
WATCHFACE_EDIT_BG, WATCHFACE_EDIT_GROUP, WATCHFACE_EDIT_POINTER,
GRADKIENT_POLYLINE, TIME_POINTER, DATE_POINTER, IMG_CLICK,
WIDGET_DELEGATE, TEXT, CIRCLE, BUTTON, HISTOGRAM, SCROLL_LIST,
RADIO_GROUP, STATE_BUTTON
```
**Total: 31 widget types** (more than the 22 from official docs!)

### NEW Widgets Discovered (not in official docs):
- `HISTOGRAM` — Bar chart widget
- `SCROLL_LIST` — Scrollable list
- `RADIO_GROUP` — Radio button group
- `STATE_BUTTON` — Toggle/state button
- `GRADKIENT_POLYLINE` — Gradient polyline chart
- `WATCHFACE_EDIT_MASK/FG_MASK/BG/POINTER` — Advanced edit mode widgets

### CONFIRMED: Complete data_type Enum (from ZeppPlayer):
```javascript
data_type = {
    BATTERY, STEP, STEP_TARGET, CAL, CAL_TARGET,
    HEART, PAI_DAILY, PAI_WEEKLY, DISTANCE,
    STAND, STAND_TARGET,
    WEATHER, WEATHER_CURRENT, WEATHER_LOW, WEATHER_HIGH,
    UVI, AQI, HUMIDITY,
    ACTIVITY, ACTIVITY_TARGET,
    FAT_BURNING, FAT_BURNING_TARGET,
    SUN_CURRENT, SUN_RISE, SUN_SET,
    WIND, WIND_DIRECTION, STRESS, SPO2,
    ALTIMETER, MOON, FLOOR,
    ALARM_CLOCK, COUNT_DOWN, STOP_WATCH, SLEEP
}
```

### CONFIRMED: system_status Values:
```javascript
system_status = {
    CLOCK: "ALARM_CLOCK",     // Alarm on/off
    DISCONNECT: "DISCONNECT",  // Bluetooth
    DISTURB: "DISTURB",       // DND mode  
    LOCK: "LOCK"              // Screen lock
}
```

### CONFIRMED: anim_status:
```javascript
anim_status = { START: 1, PAUSE: 0, RESUME: 1, STOP: 0 }
```

### TEXT_IMG — Complete Parameter Spec (from ZeppPlayer rendering code):
```javascript
hmUI.createWidget(hmUI.widget.TEXT_IMG, {
    x: px(40),
    y: px(200),
    w: px(150),
    type: hmUI.data_type.HEART,           // Auto data binding
    font_array: ['0.png','1.png',...,'9.png'], // 10 digit images
    h_space: 2,                            // Horizontal space between digits
    icon: 'icons/heart.png',               // Prefix icon image
    icon_space: 12,                        // Space between icon and digits
    dot_image: 'font/dot.png',             // Decimal point image
    negative_image: 'font/neg.png',        // Minus sign image
    invalid_image: 'font/invalid.png',     // Shown when no data
    unit_en: 'font/perc.png',              // Unit suffix (English)
    unit_sc: 'font/perc.png',              // Unit suffix (Simplified Chinese)
    unit_tc: 'font/perc.png',              // Unit suffix (Traditional Chinese)
    align_h: hmUI.align.CENTER_H,         // Alignment
    text: '',                              // Manual text (instead of type)
    padding: true,                         // Pad with leading zeros
    show_level: hmUI.show_level.ONLY_NORMAL
});
```

### TEXT_IMG — Demo Watchface Patterns (PROVEN WORKING):
```javascript
// Battery with % sign
hmUI.createWidget(hmUI.widget.TEXT_IMG, {
    x: 40, y: 440,
    icon: "icons/battery.png",
    w: 150,
    type: hmUI.data_type.BATTERY,
    font_array: mkFontArrayAt("font_activity/{}.png"),
    h_space: 2,
    unit_en: "font_activity/perc.png",
    unit_tc: "font_activity/perc.png",
    unit_sc: "font_activity/perc.png",
    icon_space: 12,
    alpha: 180
});

// Steps with icon
hmUI.createWidget(hmUI.widget.TEXT_IMG, {
    x: 40, y: y,
    icon: 'icons/steps.png',
    w: 150,
    icon_space: 12,
    h_space: 2,
    font_array: activityFont,
    type: hmUI.data_type.STEP,
    show_level: hmUI.show_level.ONLY_NORMAL
});

// Heart rate with icon
hmUI.createWidget(hmUI.widget.TEXT_IMG, {
    x: 40, y: y,
    icon: 'icons/heart.png',
    type: hmUI.data_type.HEART,
    font_array: activityFont,
    // ...same pattern
});

// Calories with icon
hmUI.createWidget(hmUI.widget.TEXT_IMG, {
    x: 40, y: y,
    icon: 'icons/calories.png',
    type: hmUI.data_type.CAL,
    font_array: activityFont,
    // ...same pattern
});

// PAI with icon
hmUI.createWidget(hmUI.widget.TEXT_IMG, {
    x: 40, y: y,
    icon: 'icons/pai.png',
    type: hmUI.data_type.PAI_DAILY,
    font_array: activityFont,
    // ...same pattern
});
```

### CONFIRMED: ARC_PROGRESS Rendering Logic:
```javascript
// ZeppPlayer source confirms:
// - level: manual 0-100 → converted to 0-1 internally
// - type: auto-reads progress (0-1) from device state
// - start_angle: shifted by -90° internally (so 0° = 12 o'clock in rendering)
// - corner_flag: 0=butt caps, 1=round start, 2=round end, 3=round both
// - end_angle < start_angle → counter-clockwise drawing
```

### CONFIRMED: TIME_POINTER Internal Logic:
```javascript
// ZeppPlayer confirms the prefix pattern:
// hour_path, hour_centerX, hour_centerY, hour_posX, hour_posY
// minute_path, minute_centerX, minute_centerY, minute_posX, minute_posY  
// second_path, second_centerX, second_centerY, second_posX, second_posY
// Also supports: hour_cover_path, hour_cover_x, hour_cover_y (cover image on top)
// Rotation angle = 360 * progress (hour includes minute sub-progress, minute includes second)
```

### All Sensor Classes (confirmed from ZeppPlayer):
| Sensor ID | Class | Properties |
|-----------|-------|-----------|
| `TIME` | TimeSensor | `.hour`, `.minute`, `.second`, `.day`, `.week`, `.month`, `.year`, `.utc` |
| `BATTERY` | BatterySensor | `.current` |
| `STEP` | StepSensor | `.current`, `.target` |
| `CAL` | CalorieSensor | `.current`, `.target` |
| `HEART` | HeartSensor | `.current`, `.last`, `.today[]` |
| `PAI` | PaiSensor | `.totalpai`, `.dailypai`, `.prepai0`-`.prepai6` |
| `DISTANCE` | DistanceSensor | `.current` (meters) |
| `STAND` | StandSensor | `.current`, `.target` |
| `WEATHER` | WeatherSensor | `.getForecastWeather()` → `{cityName, forecastData, tideData}` |
| `FAT_BURNING` | FatBurningSensor | `.current`, `.target` |
| `SPO2` | SPO2Sensor | `.current`, `.hourAvgofDay[]` |
| `STRESS` | StressSensor | `.current` |
| `BODY_TEMP` | BodyTempSensor | `.current` |
| `VIBRATE` | VibrateSensor | `.start()`, `.stop()` |
| `WEAR` | WearSensor | `.current` |
| `WORLD_CLOCK` | WorldClockSensor | `.getWorldClockCount()`, `.getWorldClockInfo(i)` → `{city, hour, minute}` |
| `SLEEP` | SleepSensor | `.updateInfo()`, `.getSleepStageData()`, `.getSleepStageModel()` |
| `MUSIC` | MusicSensor | `.title`, `.artist`, `.isPlaying`, `.audPlay()`, `.audPause()`, `.audPrev()`, `.audNext()` |
| `ACTIVITY` | ActivitySensor | `.getActivityInfo()` |

### NEW data_types Not Previously Known:
- `hmUI.data_type.STEP_TARGET` — Step goal
- `hmUI.data_type.CAL_TARGET` — Calorie goal
- `hmUI.data_type.STAND_TARGET` — Standing goal
- `hmUI.data_type.ACTIVITY` / `ACTIVITY_TARGET` — Activity ring
- `hmUI.data_type.FAT_BURNING_TARGET` — Fat burning goal
- `hmUI.data_type.ALTIMETER` — Altitude
- `hmUI.data_type.FLOOR` — Floor count
- `hmUI.data_type.COUNT_DOWN` — Countdown timer
- `hmUI.data_type.STOP_WATCH` — Stopwatch
- `hmUI.data_type.SLEEP` — Sleep data
- `hmUI.data_type.BODY_TEMP` — Body temperature

### Default Device State Values (for testing):
| State | Default | Max |
|-------|---------|-----|
| BATTERY | 60 | 100 |
| STEP | 4500 | 9000 (target) |
| CAL | 320 | 500 (target) |
| HEART | 99 | 180 |
| PAI_WEEKLY | 55 | 100 |
| PAI_DAILY | 80 | 100 |
| STRESS | 50 | 100 |
| SPO2 | 30 | 100 |
| WEATHER_CURRENT | 12 | - |
| WEATHER_HIGH | 24 | - |
| WEATHER_LOW | 14 | - |
| HUMIDITY | 10 | 100 |
| AQI | 20 | 100 |
| UVI | 10 | 100 |
| WIND | 2 | 16 |
| DISTANCE | 1.5 | 20 |
| STAND | 12 | 13 (target) |
