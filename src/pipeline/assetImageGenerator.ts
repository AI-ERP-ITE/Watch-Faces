// Pipeline Asset Generator — Creates Canvas-drawn PNG images for all widgets.
// Produces the same images that the V2 code generator references.
// No AI. Deterministic. Reuses drawing patterns from the legacy assetGenerator.

import type { ElementImage } from '@/types';
import type { ResolvedElement } from '@/types/pipeline';
import { TIME_DIGIT, DATE_DIGIT, MONTH_LABEL, WEEK_LABEL, WEATHER_ICON, TEXT_IMG_DIGIT } from './constants';

// ─── Canvas Utility ─────────────────────────────────────────────────────────────

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

// ─── Digit Generator ────────────────────────────────────────────────────────────

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

// ─── Text Label Generator ───────────────────────────────────────────────────────

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

// ─── Clock Hand Generator ───────────────────────────────────────────────────────

function generateClockHands(): ElementImage[] {
  return [
    {
      name: 'hour_hand.png',
      dataUrl: createCanvasImage(22, 140, (ctx, w, h) => {
        ctx.fillStyle = '#CCCCCC';
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
        ctx.fillStyle = '#FFFFFF';
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
        ctx.fillStyle = '#FF4444';
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

// ─── Weather Icons ──────────────────────────────────────────────────────────────

function generateWeatherIcons(): ElementImage[] {
  const symbols = ['☀', '⛅', '☁', '🌧', '🌩', '❄', '🌫'];
  return Array.from({ length: 29 }, (_, i) => ({
    name: `weather_${i}.png`,
    dataUrl: createCanvasImage(WEATHER_ICON.w, WEATHER_ICON.h, (ctx, w, h) => {
      ctx.fillStyle = '#FFD700';
      ctx.font = `${Math.floor(h * 0.55)}px serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(symbols[i % symbols.length], w / 2, h / 2);
    }),
    bounds: { x: 0, y: 0, width: WEATHER_ICON.w, height: WEATHER_ICON.h },
    type: 'IMG_LEVEL' as const,
  }));
}

// ─── Status Icons ───────────────────────────────────────────────────────────────

function generateStatusIcons(): ElementImage[] {
  return [
    {
      name: 'bluetooth_5_b_30x30.png',
      dataUrl: createCanvasImage(30, 30, (ctx, w) => {
        ctx.strokeStyle = '#4A9EFF'; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(w * 0.3, w * 0.25); ctx.lineTo(w * 0.65, w * 0.5);
        ctx.lineTo(w * 0.3, w * 0.75);
        ctx.moveTo(w * 0.65, w * 0.5); ctx.lineTo(w * 0.4, w * 0.7);
        ctx.lineTo(w * 0.6, w * 0.85); ctx.lineTo(w * 0.6, w * 0.15);
        ctx.lineTo(w * 0.4, w * 0.3); ctx.lineTo(w * 0.65, w * 0.5);
        ctx.stroke();
      }),
      bounds: { x: 0, y: 0, width: 30, height: 30 },
      type: 'IMG_STATUS',
    },
  ];
}

// ─── Transparent Button Image ───────────────────────────────────────────────────

function generateTransparentImage(): ElementImage {
  return {
    name: 'trasparente.png',
    dataUrl: createCanvasImage(1, 1, () => {}),
    bounds: { x: 0, y: 0, width: 1, height: 1 },
    type: 'BUTTON' as const,
  };
}

// ─── Data Type → Fallback Color (used when AI didn't provide color) ─────────────

const DATA_TYPE_COLORS: Record<string, string> = {
  BATTERY:  '#00CC88',
  HEART:    '#FF6B6B',
  STEP:     '#FFD93D',
  CAL:      '#FF9F43',
  DISTANCE: '#54A0FF',
  SPO2:     '#EE5A24',
  WEATHER_CURRENT: '#FFD700',
};

/** Get the color for an element: prefer AI-extracted color, fallback to data type palette. */
function getElementColor(el: ResolvedElement): string {
  if (el.color) return el.color;
  if (el.dataType && DATA_TYPE_COLORS[el.dataType]) return DATA_TYPE_COLORS[el.dataType];
  return '#FFFFFF';
}

const DATA_TYPE_PREFIXES: Record<string, string> = {
  BATTERY:  'batt_digit',
  STEP:     'step_digit',
  HEART:    'heart_digit',
  SPO2:     'spo2_digit',
  CAL:      'cal_digit',
  DISTANCE: 'dist_digit',
};

// ─── Main: Generate All Assets for Pipeline Elements ────────────────────────────

export function generatePipelineAssets(elements: ResolvedElement[]): ElementImage[] {
  const images: ElementImage[] = [];
  const generatedSets = new Set<string>();

  for (const el of elements) {
    switch (el.widget) {
      case 'TIME_POINTER': {
        if (!generatedSets.has('clock_hands')) {
          images.push(...generateClockHands());
          generatedSets.add('clock_hands');
        }
        break;
      }

      case 'IMG_TIME': {
        if (!generatedSets.has('time_digits')) {
          const color = getElementColor(el);
          images.push(...generateDigitImages('time_digit', TIME_DIGIT.w, TIME_DIGIT.h, color));
          generatedSets.add('time_digits');
        }
        break;
      }

      case 'IMG_DATE': {
        if (el.sourceType === 'month') {
          if (!generatedSets.has('month_images')) {
            const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
                            'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
            const monthColor = getElementColor(el);
            images.push(...generateTextImages('month', months, MONTH_LABEL.w, MONTH_LABEL.h, monthColor));
            generatedSets.add('month_images');
          }
        } else {
          if (!generatedSets.has('date_digits')) {
            const dateColor = getElementColor(el);
            images.push(...generateDigitImages('date_digit', DATE_DIGIT.w, DATE_DIGIT.h, dateColor));
            generatedSets.add('date_digits');
          }
        }
        break;
      }

      case 'IMG_WEEK': {
        if (!generatedSets.has('week_images')) {
          const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
          const weekColor = getElementColor(el);
          images.push(...generateTextImages('week', days, WEEK_LABEL.w, WEEK_LABEL.h, weekColor));
          generatedSets.add('week_images');
        }
        break;
      }

      case 'ARC_PROGRESS': {
        // ARC_PROGRESS uses color only — no image assets needed
        break;
      }

      case 'TEXT_IMG': {
        const prefix = el.dataType ? DATA_TYPE_PREFIXES[el.dataType] || 'digit' : 'digit';
        if (!generatedSets.has(`textimg_${prefix}`)) {
          const color = getElementColor(el);
          images.push(...generateDigitImages(prefix, TEXT_IMG_DIGIT.w, TEXT_IMG_DIGIT.h, color));
          generatedSets.add(`textimg_${prefix}`);
        }
        break;
      }

      case 'IMG_LEVEL': {
        if (el.sourceType === 'weather') {
          if (!generatedSets.has('weather_icons')) {
            images.push(...generateWeatherIcons());
            generatedSets.add('weather_icons');
          }
        }
        break;
      }

      case 'IMG_STATUS': {
        if (!generatedSets.has('status_icons')) {
          images.push(...generateStatusIcons());
          generatedSets.add('status_icons');
        }
        break;
      }

      case 'TEXT':
      case 'IMG':
        // No image assets needed for plain text or generic IMG
        break;
    }
  }

  // Always include transparent image (used for buttons, backgrounds)
  if (!generatedSets.has('transparent')) {
    images.push(generateTransparentImage());
    generatedSets.add('transparent');
  }

  return images;
}
