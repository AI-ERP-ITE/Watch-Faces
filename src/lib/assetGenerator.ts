// Asset Generation Service
// Generates PNG image assets for the watchface using Canvas drawing only
// NO image extraction from design — all assets are Canvas-drawn vectors

import type { ElementImage } from '../types';
import type { WatchFaceElement } from '../types';
import type { WatchfaceAnalysisResult } from './watchfacePrompt';

// ==================== CANVAS DRAWING HELPERS ====================

function createCanvasImage(
  width: number,
  height: number,
  drawFn: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, width, height);
  drawFn(ctx, width, height);
  return canvas.toDataURL('image/png');
}

// ==================== DIGIT IMAGE GENERATORS ====================

function generateDigitImages(
  prefix: string,
  width: number,
  height: number,
  color: string,
): ElementImage[] {
  const images: ElementImage[] = [];
  for (let i = 0; i < 10; i++) {
    const name = `${prefix}_${i}.png`;
    const dataUrl = createCanvasImage(width, height, (ctx, w, h) => {
      ctx.fillStyle = color;
      ctx.font = `bold ${Math.floor(h * 0.75)}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(i), w / 2, h / 2);
    });
    images.push({ name, dataUrl, bounds: { x: 0, y: 0, width, height }, type: 'IMG' });
  }
  return images;
}

function generateTextImages(
  prefix: string,
  labels: string[],
  width: number,
  height: number,
  color: string,
): ElementImage[] {
  return labels.map((label, i) => ({
    name: `${prefix}_${i}.png`,
    dataUrl: createCanvasImage(width, height, (ctx, w, h) => {
      ctx.fillStyle = color;
      ctx.font = `bold ${Math.floor(h * 0.6)}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, w / 2, h / 2);
    }),
    bounds: { x: 0, y: 0, width, height },
    type: 'IMG' as const,
  }));
}

// ==================== COMPLICATION ICON DRAWERS ====================

const ICON_DRAWERS: Record<string, (ctx: CanvasRenderingContext2D, w: number, h: number, color: string) => void> = {
  BATTERY: (ctx, w, h, color) => {
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.fillStyle = color;
    ctx.strokeRect(w * 0.15, h * 0.25, w * 0.6, h * 0.5);
    ctx.fillRect(w * 0.75, h * 0.35, w * 0.1, h * 0.3);
    ctx.fillRect(w * 0.2, h * 0.3, w * 0.35, h * 0.4);
  },
  HEART: (ctx, w, h, color) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    const cx = w / 2, top = h * 0.3, bot = h * 0.8;
    ctx.moveTo(cx, bot);
    ctx.bezierCurveTo(cx - w * 0.45, h * 0.55, cx - w * 0.4, top - h * 0.05, cx, top + h * 0.12);
    ctx.bezierCurveTo(cx + w * 0.4, top - h * 0.05, cx + w * 0.45, h * 0.55, cx, bot);
    ctx.fill();
  },
  STEP: (ctx, w, h, color) => {
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(w * 0.35, h * 0.35, w * 0.1, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(w * 0.55, h * 0.25, w * 0.08, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(w * 0.68, h * 0.35, w * 0.07, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath();
    ctx.ellipse(w * 0.45, h * 0.6, w * 0.2, h * 0.2, -0.2, 0, Math.PI * 2);
    ctx.fill();
  },
  CAL: (ctx, w, h, color) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(w * 0.5, h * 0.15);
    ctx.quadraticCurveTo(w * 0.75, h * 0.4, w * 0.65, h * 0.65);
    ctx.quadraticCurveTo(w * 0.5, h * 0.9, w * 0.35, h * 0.65);
    ctx.quadraticCurveTo(w * 0.25, h * 0.4, w * 0.5, h * 0.15);
    ctx.fill();
  },
  STRESS: (ctx, w, h, color) => {
    ctx.strokeStyle = color; ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(w * 0.15, h * 0.5);
    ctx.bezierCurveTo(w * 0.3, h * 0.2, w * 0.4, h * 0.8, w * 0.55, h * 0.4);
    ctx.bezierCurveTo(w * 0.65, h * 0.15, w * 0.75, h * 0.7, w * 0.85, h * 0.5);
    ctx.stroke();
  },
  SPO2: (ctx, w, h, color) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(w * 0.5, h * 0.1);
    ctx.quadraticCurveTo(w * 0.8, h * 0.5, w * 0.5, h * 0.85);
    ctx.quadraticCurveTo(w * 0.2, h * 0.5, w * 0.5, h * 0.1);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.font = `bold ${Math.floor(h * 0.2)}px Arial`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('O₂', w * 0.5, h * 0.55);
  },
  WEATHER_CURRENT: (ctx, w, h, color) => {
    ctx.fillStyle = color; ctx.strokeStyle = color; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(w * 0.45, h * 0.4, w * 0.18, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(w * 0.45 + Math.cos(angle) * w * 0.22, h * 0.4 + Math.sin(angle) * w * 0.22);
      ctx.lineTo(w * 0.45 + Math.cos(angle) * w * 0.3, h * 0.4 + Math.sin(angle) * w * 0.3);
      ctx.stroke();
    }
  },
  DISTANCE: (ctx, w, h, color) => {
    ctx.strokeStyle = color; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.35, w * 0.2, Math.PI, 0);
    ctx.lineTo(w * 0.5, h * 0.8);
    ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.arc(w * 0.5, h * 0.35, w * 0.08, 0, Math.PI * 2); ctx.stroke();
  },
  PAI_DAILY: (ctx, w, h, color) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(w * 0.55, h * 0.1);
    ctx.lineTo(w * 0.3, h * 0.5); ctx.lineTo(w * 0.5, h * 0.5);
    ctx.lineTo(w * 0.45, h * 0.9); ctx.lineTo(w * 0.7, h * 0.4);
    ctx.lineTo(w * 0.5, h * 0.4);
    ctx.closePath(); ctx.fill();
  },
  HUMIDITY: (ctx, w, h, color) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(w * 0.5, h * 0.1);
    ctx.quadraticCurveTo(w * 0.85, h * 0.55, w * 0.5, h * 0.85);
    ctx.quadraticCurveTo(w * 0.15, h * 0.55, w * 0.5, h * 0.1);
    ctx.fill();
  },
  UVI: (ctx, w, h, color) => {
    ctx.fillStyle = color; ctx.strokeStyle = color; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(w * 0.5, h * 0.4, w * 0.18, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      ctx.beginPath();
      ctx.moveTo(w * 0.5 + Math.cos(angle) * w * 0.22, h * 0.4 + Math.sin(angle) * h * 0.22);
      ctx.lineTo(w * 0.5 + Math.cos(angle) * w * 0.32, h * 0.4 + Math.sin(angle) * h * 0.32);
      ctx.stroke();
    }
  },
  STAND: (ctx, w, h, color) => {
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(w * 0.5, h * 0.2, w * 0.1, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(w * 0.45, h * 0.32, w * 0.1, h * 0.3);
    ctx.fillRect(w * 0.3, h * 0.35, w * 0.4, h * 0.06);
    ctx.fillRect(w * 0.42, h * 0.62, w * 0.06, h * 0.25);
    ctx.fillRect(w * 0.52, h * 0.62, w * 0.06, h * 0.25);
  },
  SLEEP: (ctx, w, h, color) => {
    ctx.fillStyle = color;
    ctx.font = `bold ${Math.floor(h * 0.3)}px Arial`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('Z', w * 0.35, h * 0.3);
    ctx.font = `bold ${Math.floor(h * 0.4)}px Arial`;
    ctx.fillText('Z', w * 0.55, h * 0.55);
  },
};

function drawDefaultIcon(ctx: CanvasRenderingContext2D, w: number, h: number, color: string) {
  ctx.strokeStyle = color; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(w / 2, h / 2, Math.min(w, h) * 0.35, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(w / 2, h / 2, Math.min(w, h) * 0.1, 0, Math.PI * 2); ctx.fill();
}

function generateComplicationIcon(dataType: string, size: number, color: string): ElementImage {
  const name = `icon_${dataType.toLowerCase()}.png`;
  const drawer = ICON_DRAWERS[dataType] || ICON_DRAWERS[dataType.split('_')[0]] || drawDefaultIcon;
  const dataUrl = createCanvasImage(size, size, (ctx, w, h) => {
    drawer(ctx, w, h, color);
  });
  return { name, dataUrl, bounds: { x: 0, y: 0, width: size, height: size }, type: 'IMG' };
}

// ==================== CLOCK HAND GENERATORS ====================

function generateClockHands(hourColor: string, minuteColor: string, secondColor: string): ElementImage[] {
  return [
    {
      name: 'hour_hand.png',
      dataUrl: createCanvasImage(22, 140, (ctx, w, h) => {
        ctx.fillStyle = hourColor;
        ctx.beginPath();
        ctx.moveTo(w / 2 - 4, h); ctx.lineTo(w / 2 - 1, 10);
        ctx.lineTo(w / 2, 0); ctx.lineTo(w / 2 + 1, 10);
        ctx.lineTo(w / 2 + 4, h); ctx.closePath(); ctx.fill();
      }),
      bounds: { x: 0, y: 0, width: 22, height: 140 }, type: 'TIME_POINTER',
    },
    {
      name: 'minute_hand.png',
      dataUrl: createCanvasImage(16, 200, (ctx, w, h) => {
        ctx.fillStyle = minuteColor;
        ctx.beginPath();
        ctx.moveTo(w / 2 - 3, h); ctx.lineTo(w / 2 - 1, 10);
        ctx.lineTo(w / 2, 0); ctx.lineTo(w / 2 + 1, 10);
        ctx.lineTo(w / 2 + 3, h); ctx.closePath(); ctx.fill();
      }),
      bounds: { x: 0, y: 0, width: 16, height: 200 }, type: 'TIME_POINTER',
    },
    {
      name: 'second_hand.png',
      dataUrl: createCanvasImage(6, 240, (ctx, w, h) => {
        ctx.fillStyle = secondColor;
        ctx.fillRect(w / 2 - 1, 0, 2, h);
        ctx.beginPath(); ctx.arc(w / 2, 120, 3, 0, Math.PI * 2); ctx.fill();
      }),
      bounds: { x: 0, y: 0, width: 6, height: 240 }, type: 'TIME_POINTER',
    },
    {
      name: 'hand_cover.png',
      dataUrl: createCanvasImage(30, 30, (ctx, w, h) => {
        ctx.fillStyle = '#888888';
        ctx.beginPath(); ctx.arc(w / 2, h / 2, 12, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#AAAAAA'; ctx.lineWidth = 2; ctx.stroke();
      }),
      bounds: { x: 0, y: 0, width: 30, height: 30 }, type: 'TIME_POINTER',
    },
  ];
}

// ==================== STATUS ICON GENERATORS ====================

function generateStatusIcon(name: string, color: string, drawFn: (ctx: CanvasRenderingContext2D, w: number) => void): ElementImage {
  const size = 30;
  return {
    name,
    dataUrl: createCanvasImage(size, size, (ctx, w) => {
      ctx.strokeStyle = color; ctx.lineWidth = 2;
      drawFn(ctx, w);
    }),
    bounds: { x: 0, y: 0, width: size, height: size },
    type: 'IMG_STATUS',
  };
}

// ==================== WEATHER ICONS ====================

function generateWeatherIcons(count: number = 29): ElementImage[] {
  const symbols = ['☀', '⛅', '☁', '🌧', '🌩', '❄', '🌫'];
  return Array.from({ length: count }, (_, i) => ({
    name: `weather_${i}.png`,
    dataUrl: createCanvasImage(40, 40, (ctx, w, h) => {
      ctx.fillStyle = '#FFD700';
      ctx.font = `${Math.floor(h * 0.6)}px serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(symbols[i % symbols.length], w / 2, h / 2);
    }),
    bounds: { x: 0, y: 0, width: 40, height: 40 },
    type: 'IMG_LEVEL' as const,
  }));
}

// ==================== DATA TYPE CONFIGS ====================

const DATA_TYPE_CONFIG: Record<string, { prefix: string; defaultColor: string; clickAction: string }> = {
  BATTERY:         { prefix: 'batt',   defaultColor: '#00CC88', clickAction: 'Settings_batteryManagerScreen' },
  HEART:           { prefix: 'heart',  defaultColor: '#FF6B6B', clickAction: 'heart_app_Screen' },
  STEP:            { prefix: 'step',   defaultColor: '#FFD93D', clickAction: 'activityAppScreen' },
  CAL:             { prefix: 'cal',    defaultColor: '#FF9F43', clickAction: 'activityAppScreen' },
  DISTANCE:        { prefix: 'dist',   defaultColor: '#54A0FF', clickAction: 'activityAppScreen' },
  PAI_DAILY:       { prefix: 'pai',    defaultColor: '#5F27CD', clickAction: 'BioChargeHomeScreen' },
  PAI_WEEKLY:      { prefix: 'pai',    defaultColor: '#5F27CD', clickAction: 'BioChargeHomeScreen' },
  SPO2:            { prefix: 'spo2',   defaultColor: '#EE5A24', clickAction: '' },
  HUMIDITY:        { prefix: 'hum',    defaultColor: '#0ABDE3', clickAction: 'WeatherScreen' },
  UVI:             { prefix: 'uvi',    defaultColor: '#FFC312', clickAction: 'WeatherScreen' },
  STRESS:          { prefix: 'stress', defaultColor: '#FF9FF3', clickAction: 'StressHomeScreen' },
  WEATHER_CURRENT: { prefix: 'temp',   defaultColor: '#FFD700', clickAction: 'WeatherScreen' },
  WEATHER_HIGH:    { prefix: 'temp',   defaultColor: '#FFD700', clickAction: 'WeatherScreen' },
  WEATHER_LOW:     { prefix: 'temp',   defaultColor: '#87CEEB', clickAction: 'WeatherScreen' },
  STAND:           { prefix: 'stand',  defaultColor: '#2ECC71', clickAction: 'activityAppScreen' },
  SLEEP:           { prefix: 'sleep',  defaultColor: '#9B59B6', clickAction: '' },
  FAT_BURNING:     { prefix: 'fat',    defaultColor: '#E74C3C', clickAction: 'activityAppScreen' },
};

// ==================== MAIN: CONVERT AI ANALYSIS → ELEMENTS + ASSETS ====================

export interface ExpandedResult {
  elements: WatchFaceElement[];
  images: ElementImage[];
}

export function expandAnalysisToElements(analysis: WatchfaceAnalysisResult): ExpandedResult {
  const elements: WatchFaceElement[] = [];
  const images: ElementImage[] = [];
  let idCounter = 1;
  const generatedDigitPrefixes = new Set<string>();
  const generatedIcons = new Set<string>();
  const ICON_SIZE = 28;
  const VALUE_W = 60;
  const VALUE_H = 25;

  // ---- TIME ----
  if (analysis.time.exists) {
    if (analysis.time.type === 'digital' || analysis.time.type === 'both') {
      const dt = analysis.time.digital;
      if (dt) {
        elements.push({
          id: `el_${idCounter++}`, type: 'IMG', name: 'Time Display', visible: true, zIndex: 5,
          bounds: { x: dt.x, y: dt.y, width: dt.width, height: dt.height },
          color: dt.color,
        });
        const digitW = Math.max(20, Math.floor(dt.height * 0.6));
        const digitH = dt.height;
        images.push(...generateDigitImages('time_digit', digitW, digitH, dt.color));
      }
    }
    if (analysis.time.type === 'analog' || analysis.time.type === 'both') {
      const an = analysis.time.analog;
      if (an) {
        elements.push({
          id: `el_${idCounter++}`, type: 'TIME_POINTER', name: 'Clock Hands', visible: true, zIndex: 15,
          bounds: { x: (an.centerX || 240) - 120, y: (an.centerY || 240) - 120, width: 240, height: 240 },
          center: { x: an.centerX || 240, y: an.centerY || 240 },
          hourHandSrc: 'hour_hand.png', minuteHandSrc: 'minute_hand.png',
          secondHandSrc: an.hasSecondHand ? 'second_hand.png' : undefined,
          coverSrc: 'hand_cover.png',
          hourPos: { x: 11, y: 70 }, minutePos: { x: 8, y: 100 },
          secondPos: an.hasSecondHand ? { x: 3, y: 120 } : undefined,
        });
        images.push(...generateClockHands(
          an.hourColor || '#CCCCCC',
          an.minuteColor || '#FFFFFF',
          an.secondColor || '#FF3333',
        ));
      }
    }
  }

  // ---- DATE ----
  if (analysis.date?.exists) {
    const d = analysis.date;
    elements.push({
      id: `el_${idCounter++}`, type: 'IMG', name: 'Date Display', visible: true, zIndex: 5,
      bounds: { x: d.x, y: d.y, width: d.width, height: d.height },
      color: d.color,
    });
    images.push(...generateDigitImages('date_digit', Math.max(12, Math.floor(d.height * 0.6)), d.height, d.color || '#CCCCCC'));
  }

  // ---- MONTH ----
  if (analysis.month?.exists) {
    const m = analysis.month;
    elements.push({
      id: `el_${idCounter++}`, type: 'IMG', name: 'Month Display', visible: true, zIndex: 5,
      bounds: { x: m.x, y: m.y, width: m.width, height: m.height },
      color: m.color,
    });
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    images.push(...generateTextImages('month', monthNames, Math.floor(m.width), Math.floor(m.height), m.color || '#AAAAAA'));
  }

  // ---- WEEKDAY ----
  if (analysis.weekday?.exists) {
    const w = analysis.weekday;
    elements.push({
      id: `el_${idCounter++}`, type: 'IMG', name: 'Weekday Display', visible: true, zIndex: 5,
      bounds: { x: w.x, y: w.y, width: w.width, height: w.height },
      color: w.color,
    });
    const weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    images.push(...generateTextImages('week', weekDays, Math.floor(w.width), Math.floor(w.height), w.color || '#FFD700'));
  }

  // ---- COMPLICATIONS ----
  for (const comp of analysis.complications) {
    const cfg = DATA_TYPE_CONFIG[comp.dataType];
    if (!cfg) {
      console.warn(`[AssetGen] Unknown dataType: ${comp.dataType}, skipping`);
      continue;
    }

    const cx = comp.centerX;
    const cy = comp.centerY;
    const arcR = comp.arcRadius || 45;
    const arcColor = comp.arcColor || cfg.defaultColor;
    const valColor = comp.valueColor || cfg.defaultColor;
    const iconColor = comp.iconColor || cfg.defaultColor;
    const labelColor = comp.labelColor || '#888888';

    // 1. ARC_PROGRESS (if present)
    if (comp.hasArc) {
      // Decorative background ring
      elements.push({
        id: `el_${idCounter++}`, type: 'CIRCLE', name: `${comp.dataType} Ring`, visible: true,
        zIndex: 1,
        bounds: { x: cx - arcR, y: cy - arcR, width: arcR * 2, height: arcR * 2 },
        center: { x: cx, y: cy },
        radius: arcR,
        color: '0x333333',
      });

      elements.push({
        id: `el_${idCounter++}`, type: 'ARC_PROGRESS', name: `${comp.dataType} Arc`, visible: true,
        zIndex: 2,
        bounds: { x: cx - arcR, y: cy - arcR, width: arcR * 2, height: arcR * 2 },
        center: { x: cx, y: cy },
        radius: arcR,
        startAngle: comp.arcStartAngle ?? -90,
        endAngle: comp.arcEndAngle ?? 270,
        lineWidth: comp.arcLineWidth ?? 6,
        color: arcColor.startsWith('#') ? `0x${arcColor.slice(1)}` : arcColor,
        dataType: comp.dataType,
      });
    }

    // 2. Icon (Canvas-drawn, positioned above center)
    const iconX = cx - ICON_SIZE / 2;
    const iconY = cy - ICON_SIZE - 2;
    const iconKey = comp.dataType;
    if (!generatedIcons.has(iconKey)) {
      generatedIcons.add(iconKey);
      images.push(generateComplicationIcon(comp.dataType, ICON_SIZE, iconColor));
    }
    elements.push({
      id: `el_${idCounter++}`, type: 'IMG', name: `${comp.dataType} Icon`, visible: true,
      zIndex: 5,
      bounds: { x: Math.round(iconX), y: Math.round(iconY), width: ICON_SIZE, height: ICON_SIZE },
      src: `icon_${comp.dataType.toLowerCase()}.png`,
      color: iconColor,
    });

    // 3. Value (TEXT_IMG digits)
    const valX = cx - VALUE_W / 2;
    const valY = cy + 2;

    if (!generatedDigitPrefixes.has(cfg.prefix)) {
      generatedDigitPrefixes.add(cfg.prefix);
      images.push(...generateDigitImages(`${cfg.prefix}_digit`, 14, VALUE_H, valColor));
    }
    const fontArray = Array.from({ length: 10 }, (_, i) => `${cfg.prefix}_digit_${i}.png`);

    elements.push({
      id: `el_${idCounter++}`, type: 'TEXT_IMG', name: `${comp.dataType} Value`, visible: true,
      zIndex: 5,
      bounds: { x: Math.round(valX), y: Math.round(valY), width: VALUE_W, height: VALUE_H },
      fontArray,
      dataType: comp.dataType,
      hSpace: 1,
      alignH: 'CENTER_H',
    });

    // 4. Label
    if (comp.label) {
      const labelY = valY + VALUE_H + 2;
      elements.push({
        id: `el_${idCounter++}`, type: 'TEXT', name: `${comp.dataType} Label`, visible: true,
        zIndex: 5,
        bounds: { x: Math.round(cx - 40), y: Math.round(labelY), width: 80, height: 16 },
        text: comp.label,
        fontSize: 14,
        color: labelColor.startsWith('#') ? `0x${labelColor.slice(1)}FF` : labelColor,
      });
    }

    // 5. BUTTON — exact same area covering icon + value + label
    const btnTop = Math.round(iconY);
    const btnBottom = Math.round(valY + VALUE_H + (comp.label ? 20 : 0));
    const btnLeft = Math.round(Math.min(iconX, valX));
    const btnRight = Math.round(Math.max(iconX + ICON_SIZE, valX + VALUE_W));
    if (cfg.clickAction) {
      elements.push({
        id: `el_${idCounter++}`, type: 'BUTTON', name: `${comp.dataType} Button`, visible: true,
        zIndex: 10,
        bounds: { x: btnLeft, y: btnTop, width: btnRight - btnLeft, height: btnBottom - btnTop },
        normalSrc: 'trasparente.png',
        pressSrc: 'trasparente.png',
        clickAction: cfg.clickAction,
      });
    }

    // 6. IMG_LEVEL for weather
    if (comp.dataType === 'WEATHER_CURRENT') {
      const weatherImgs = Array.from({ length: 29 }, (_, i) => `weather_${i}.png`);
      elements.push({
        id: `el_${idCounter++}`, type: 'IMG_LEVEL', name: 'Weather Icons', visible: true,
        zIndex: 5,
        bounds: { x: Math.round(iconX), y: Math.round(iconY), width: ICON_SIZE, height: ICON_SIZE },
        images: weatherImgs,
        dataType: 'WEATHER_CURRENT',
      });
      images.push(...generateWeatherIcons(29));
    }
  }

  // ---- STATUS ICONS ----
  if (analysis.statusIcons) {
    for (const si of analysis.statusIcons) {
      const statusSize = 30;
      elements.push({
        id: `el_${idCounter++}`, type: 'IMG_STATUS', name: `${si.type} Status`, visible: true,
        zIndex: 5,
        bounds: { x: si.x, y: si.y, width: statusSize, height: statusSize },
        statusType: si.type,
        src: si.type === 'DISCONNECT' ? 'bluetooth_30x30.png' : si.type === 'DISTURB' ? 'dnd_30x30.png' : 'alarm_30x30.png',
      });

      if (si.type === 'DISCONNECT') {
        images.push(generateStatusIcon('bluetooth_30x30.png', '#4488FF', (ctx, w) => {
          ctx.beginPath();
          ctx.moveTo(w * 0.35, w * 0.2); ctx.lineTo(w * 0.65, w * 0.4);
          ctx.lineTo(w * 0.5, w * 0.5); ctx.lineTo(w * 0.65, w * 0.6);
          ctx.lineTo(w * 0.35, w * 0.8);
          ctx.moveTo(w * 0.5, w * 0.2); ctx.lineTo(w * 0.5, w * 0.8);
          ctx.stroke();
        }));
      } else if (si.type === 'DISTURB') {
        images.push(generateStatusIcon('dnd_30x30.png', '#FF6B6B', (ctx, w) => {
          ctx.beginPath(); ctx.arc(w / 2, w / 2, w * 0.35, 0, Math.PI * 2); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(w * 0.25, w / 2); ctx.lineTo(w * 0.75, w / 2); ctx.stroke();
        }));
      } else if (si.type === 'CLOCK') {
        images.push(generateStatusIcon('alarm_30x30.png', '#FFD93D', (ctx, w) => {
          ctx.beginPath(); ctx.arc(w / 2, w * 0.55, w * 0.3, 0, Math.PI * 2); ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(w * 0.35, w * 0.25); ctx.lineTo(w / 2, w * 0.1); ctx.lineTo(w * 0.65, w * 0.25);
          ctx.stroke();
        }));
      }
    }
  }

  // ---- TRANSPARENT BUTTON IMAGE ----
  images.push({
    name: 'trasparente.png',
    dataUrl: createCanvasImage(1, 1, () => {}),
    bounds: { x: 0, y: 0, width: 1, height: 1 },
    type: 'BUTTON',
  });

  console.log(`[AssetGen] Expanded ${analysis.complications.length} complications → ${elements.length} elements, ${images.length} images`);
  return { elements, images };
}
