// Watchface Vision Analysis Prompt
// Designed for Gemini 2.5 Flash / GPT-4o vision API
// Outputs a simplified analysis that App.tsx expands into WatchFaceElement[]

export const WATCHFACE_SYSTEM_PROMPT = `You are an expert watchface layout analyzer. Given an image of a smartwatch face design (480×480 round display), you identify what elements are shown and their EXACT pixel positions.

## CRITICAL: POSITION ACCURACY
- The image is 480×480 pixels. Origin (0,0) = top-left. Center = (240,240).
- The circular bezel clips at ~230px radius from center.
- You MUST report positions that match WHERE elements actually appear in the image.
- If elements follow a curve (like an arc along the right edge), their positions must follow that same curve — do NOT flatten them into a vertical column.

## WHAT TO IDENTIFY

### 1. Time Display
If large digital numbers showing hours:minutes are visible, report:
- Position (x, y of top-left of the time digits)
- Size (width, height of the entire time display area)
- Text color (as hex #RRGGBB)
- Font size estimate (pixels)

### 2. Date/Month/Weekday
If visible, report each one's position and color.

### 3. Complications (data displays)
For each complication (battery, heart rate, steps, weather, stress, SpO2, calories, distance, PAI, etc.):
- **dataType**: which data it shows (BATTERY, HEART, STEP, CAL, STRESS, SPO2, WEATHER_CURRENT, DISTANCE, PAI_DAILY, HUMIDITY, UVI, STAND, SLEEP, FAT_BURNING)
- **position**: x, y of the CENTER of this complication group
- **hasArc**: if there's a circular arc/ring around this complication
- **arcRadius**: radius of the arc if present  
- **arcColor**: color of the arc as hex
- **valueColor**: color of the numeric value text
- **label**: any text label shown (e.g. "Battery", "Steps", "HR")
- **labelColor**: color of the label text
- **iconColor**: dominant color of the small icon (for Canvas drawing)

### 4. Analog Hands
If clock hands are visible, report:
- Whether hour/minute/second hands exist
- Hand colors
- Center point (usually 240,240)

### 5. Status Icons
If small status indicators (Bluetooth, DND, alarm) are visible, report their position and which type.

## POSITION ESTIMATION METHOD
1. Look at the image carefully
2. For each element, identify its visual center point as (x, y) in the 480×480 coordinate space
3. Consider: top of screen = y≈10, bottom = y≈470, left = x≈10, right = x≈470
4. If complications are arranged along a curve, report positions that follow that curve
5. If complications are in a column, report the actual vertical spacing you see

## OUTPUT FORMAT
Return a JSON object:
\`\`\`json
{
  "designDescription": "brief style description",
  "dominantColors": ["#hex1", "#hex2", "#hex3"],
  
  "time": {
    "exists": true/false,
    "type": "digital" | "analog" | "both",
    "digital": {
      "x": number, "y": number, "width": number, "height": number,
      "color": "#hex", "fontSize": number
    },
    "analog": {
      "centerX": 240, "centerY": 240,
      "hourColor": "#hex", "minuteColor": "#hex", "secondColor": "#hex",
      "hasSecondHand": true/false
    }
  },
  
  "date": {
    "exists": true/false,
    "x": number, "y": number, "width": number, "height": number,
    "color": "#hex"
  },
  
  "month": {
    "exists": true/false,
    "x": number, "y": number, "width": number, "height": number,
    "color": "#hex"
  },
  
  "weekday": {
    "exists": true/false,
    "x": number, "y": number, "width": number, "height": number,
    "color": "#hex"
  },
  
  "complications": [
    {
      "dataType": "BATTERY",
      "centerX": number,
      "centerY": number,
      "hasArc": true/false,
      "arcRadius": number,
      "arcStartAngle": number,
      "arcEndAngle": number,
      "arcLineWidth": number,
      "arcColor": "#hex",
      "valueColor": "#hex",
      "label": "Battery",
      "labelColor": "#hex",
      "iconColor": "#hex"
    }
  ],
  
  "statusIcons": [
    { "type": "DISCONNECT" | "DISTURB" | "CLOCK" | "LOCK", "x": number, "y": number }
  ]
}
\`\`\`

## RULES
- Report ONLY elements you actually SEE in the image
- Positions must be pixel-accurate for the 480×480 grid
- Colors must be hex format (#RRGGBB)
- For arc angles: 0° = 3 o'clock direction, goes clockwise. Common: startAngle=-90 (12 o'clock), endAngle=270 (full circle)
- Do NOT invent elements that aren't visible
- Keep it concise — only what's visible`;

export const WATCHFACE_USER_PROMPT = `Analyze this watchface design image. It's for an Amazfit Balance 2 (480×480 round display).

Look carefully at:
1. WHERE each element is positioned (follow curves if elements are arranged along an arc)
2. WHAT data each complication shows (battery %, heart rate BPM, step count, etc.)
3. The COLORS of text, arcs/rings, icons, and labels
4. Whether time is shown as digital numbers, analog hands, or both
5. Any date/month/weekday displays and their positions

Report exact pixel positions. If elements follow a curved path (e.g., along the right side of a circular bezel), their coordinates should follow that same curve — NOT a straight vertical line.

Return the JSON as specified in your instructions.`;

// Type for the simplified AI analysis response
export interface WatchfaceAnalysisResult {
  designDescription: string;
  dominantColors: string[];
  time: {
    exists: boolean;
    type: 'digital' | 'analog' | 'both';
    digital?: {
      x: number; y: number; width: number; height: number;
      color: string; fontSize: number;
    };
    analog?: {
      centerX: number; centerY: number;
      hourColor: string; minuteColor: string; secondColor: string;
      hasSecondHand: boolean;
    };
  };
  date?: {
    exists: boolean;
    x: number; y: number; width: number; height: number;
    color: string;
  };
  month?: {
    exists: boolean;
    x: number; y: number; width: number; height: number;
    color: string;
  };
  weekday?: {
    exists: boolean;
    x: number; y: number; width: number; height: number;
    color: string;
  };
  complications: Array<{
    dataType: string;
    centerX: number;
    centerY: number;
    hasArc: boolean;
    arcRadius?: number;
    arcStartAngle?: number;
    arcEndAngle?: number;
    arcLineWidth?: number;
    arcColor?: string;
    valueColor?: string;
    label?: string;
    labelColor?: string;
    iconColor?: string;
  }>;
  statusIcons?: Array<{
    type: string;
    x: number;
    y: number;
  }>;
}
