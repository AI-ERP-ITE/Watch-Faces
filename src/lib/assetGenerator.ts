// Asset Generation Service
// Generates PNG image assets for the watchface based on AI analysis
// Two strategies: (1) extract regions from uploaded design, (2) Canvas drawing

import type { ElementImage } from '../types';
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

function drawDigit(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  digit: string,
  color: string,
  fontFamily: string = 'Arial',
) {
  ctx.fillStyle = color;
  ctx.font = `bold ${Math.floor(h * 0.7)}px ${fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(digit, w / 2, h / 2);
}

// ==================== ASSET GENERATORS BY TYPE ====================

function generateDigitImages(
  prefix: string,
  count: number,
  width: number,
  height: number,
  color: string,
): ElementImage[] {
  const images: ElementImage[] = [];
  for (let i = 0; i < count; i++) {
    const name = `${prefix}_${i}.png`;
    const dataUrl = createCanvasImage(width, height, (ctx, w, h) => {
      drawDigit(ctx, w, h, String(i), color);
    });
    images.push({
      name,
      dataUrl,
      bounds: { x: 0, y: 0, width, height },
      type: 'IMG',
    });
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
  const images: ElementImage[] = [];
  for (let i = 0; i < labels.length; i++) {
    const name = `${prefix}_${i}.png`;
    const dataUrl = createCanvasImage(width, height, (ctx, w, h) => {
      ctx.fillStyle = color;
      ctx.font = `bold ${Math.floor(h * 0.6)}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(labels[i], w / 2, h / 2);
    });
    images.push({
      name,
      dataUrl,
      bounds: { x: 0, y: 0, width, height },
      type: 'IMG',
    });
  }
  return images;
}

function generateClockHands(dominantColors: string[]): ElementImage[] {
  const handColor = dominantColors[0] || '#CCCCCC';
  const secondColor = '#FF3333';
  const images: ElementImage[] = [];

  // Hour hand (22×140)
  images.push({
    name: 'hour_hand.png',
    dataUrl: createCanvasImage(22, 140, (ctx, w, h) => {
      ctx.fillStyle = handColor;
      ctx.beginPath();
      ctx.moveTo(w / 2 - 4, h);
      ctx.lineTo(w / 2 - 1, 10);
      ctx.lineTo(w / 2, 0);
      ctx.lineTo(w / 2 + 1, 10);
      ctx.lineTo(w / 2 + 4, h);
      ctx.closePath();
      ctx.fill();
    }),
    bounds: { x: 0, y: 0, width: 22, height: 140 },
    type: 'TIME_POINTER',
  });

  // Minute hand (16×200)
  images.push({
    name: 'minute_hand.png',
    dataUrl: createCanvasImage(16, 200, (ctx, w, h) => {
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(w / 2 - 3, h);
      ctx.lineTo(w / 2 - 1, 10);
      ctx.lineTo(w / 2, 0);
      ctx.lineTo(w / 2 + 1, 10);
      ctx.lineTo(w / 2 + 3, h);
      ctx.closePath();
      ctx.fill();
    }),
    bounds: { x: 0, y: 0, width: 16, height: 200 },
    type: 'TIME_POINTER',
  });

  // Second hand (6×240)
  images.push({
    name: 'second_hand.png',
    dataUrl: createCanvasImage(6, 240, (ctx, w, h) => {
      ctx.fillStyle = secondColor;
      ctx.fillRect(w / 2 - 1, 0, 2, h);
      ctx.beginPath();
      ctx.arc(w / 2, 120, 3, 0, Math.PI * 2);
      ctx.fill();
    }),
    bounds: { x: 0, y: 0, width: 6, height: 240 },
    type: 'TIME_POINTER',
  });

  // Cover (30×30)
  images.push({
    name: 'hand_cover.png',
    dataUrl: createCanvasImage(30, 30, (ctx, w, h) => {
      ctx.fillStyle = '#888888';
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#AAAAAA';
      ctx.lineWidth = 2;
      ctx.stroke();
    }),
    bounds: { x: 0, y: 0, width: 30, height: 30 },
    type: 'TIME_POINTER',
  });

  return images;
}

function generateStatusIcon(name: string, color: string, drawFn: (ctx: CanvasRenderingContext2D, w: number) => void): ElementImage {
  const size = 30;
  return {
    name,
    dataUrl: createCanvasImage(size, size, (ctx, w) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      drawFn(ctx, w);
    }),
    bounds: { x: 0, y: 0, width: size, height: size },
    type: 'IMG_STATUS',
  };
}

function generateWeatherIcons(count: number = 29): ElementImage[] {
  const symbols = ['☀', '⛅', '☁', '🌧', '🌩', '❄', '🌫'];
  const images: ElementImage[] = [];
  for (let i = 0; i < count; i++) {
    const symbol = symbols[i % symbols.length];
    images.push({
      name: `weather_${i}.png`,
      dataUrl: createCanvasImage(40, 40, (ctx, w, h) => {
        ctx.fillStyle = '#FFD700';
        ctx.font = `${Math.floor(h * 0.6)}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(symbol, w / 2, h / 2);
      }),
      bounds: { x: 0, y: 0, width: 40, height: 40 },
      type: 'IMG_LEVEL',
    });
  }
  return images;
}

// ==================== IMAGE EXTRACTION FROM DESIGN ====================

// Extract a region from the uploaded design image
async function extractRegion(
  designImageDataUrl: string,
  bounds: { x: number; y: number; width: number; height: number },
  outputWidth?: number,
  outputHeight?: number,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const w = outputWidth || bounds.width;
      const h = outputHeight || bounds.height;
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(
        img,
        bounds.x, bounds.y, bounds.width, bounds.height,
        0, 0, w, h,
      );
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error('Failed to load design image for extraction'));
    img.src = designImageDataUrl;
  });
}

// ==================== FILE TO DATA URL ====================

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

// ==================== MAIN ASSET GENERATION ====================

export async function generateAssets(
  analysis: WatchfaceAnalysisResult,
  designFile: File,
): Promise<ElementImage[]> {
  const images: ElementImage[] = [];
  const colors = analysis.dominantColors;
  const primaryColor = colors[0] || '#FFFFFF';

  // Convert design file to data URL for canvas extraction operations
  // Note: background is NOT generated here — zpkBuilder adds the original uploaded file directly
  const designDataUrl = await fileToDataUrl(designFile);

  // 1. Time digits (0-9) for IMG_TIME
  const hasTime = analysis.elements.some(el => el.name.toLowerCase().includes('time') && el.type === 'IMG');
  if (hasTime || analysis.hasDigitalTime) {
    images.push(...generateDigitImages('time_digit', 10, 30, 50, primaryColor));
  }

  // 3. Date digits (0-9) for IMG_DATE
  const hasDate = analysis.elements.some(el => el.name.toLowerCase().includes('date'));
  if (hasDate) {
    images.push(...generateDigitImages('date_digit', 10, 20, 30, '#CCCCCC'));
  }

  // 4. Month images (12) for IMG_DATE month
  const hasMonth = analysis.elements.some(el => el.name.toLowerCase().includes('month'));
  if (hasMonth) {
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    images.push(...generateTextImages('month', monthNames, 40, 20, '#AAAAAA'));
  }

  // 5. Week images (7) for IMG_WEEK
  const hasWeek = analysis.elements.some(el => el.name.toLowerCase().includes('week'));
  if (hasWeek) {
    const weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    images.push(...generateTextImages('week', weekDays, 40, 20, '#FFD700'));
  }

  // 6. Clock hands for TIME_POINTER
  if (analysis.hasAnalogHands) {
    images.push(...generateClockHands(colors));
  }

  // 7. Data digit sets for each TEXT_IMG element
  const dataDigitPrefixes: Record<string, { prefix: string; color: string }> = {
    'BATTERY': { prefix: 'batt_digit', color: '#00CC88' },
    'HEART': { prefix: 'heart_digit', color: '#FF6B6B' },
    'STEP': { prefix: 'step_digit', color: '#FFD93D' },
    'CAL': { prefix: 'cal_digit', color: '#FF9F43' },
    'DIST': { prefix: 'dist_digit', color: '#54A0FF' },
    'DISTANCE': { prefix: 'dist_digit', color: '#54A0FF' },
    'PAI_DAILY': { prefix: 'pai_digit', color: '#5F27CD' },
    'PAI_WEEKLY': { prefix: 'pai_digit', color: '#5F27CD' },
    'SPO2': { prefix: 'spo2_digit', color: '#EE5A24' },
    'HUMIDITY': { prefix: 'hum_digit', color: '#0ABDE3' },
    'UVI': { prefix: 'uvi_digit', color: '#FFC312' },
    'STRESS': { prefix: 'stress_digit', color: '#FF9FF3' },
    'WEATHER_CURRENT': { prefix: 'temp_digit', color: '#FFD700' },
    'WEATHER_HIGH': { prefix: 'temp_digit', color: '#FFD700' },
    'WEATHER_LOW': { prefix: 'temp_digit', color: '#87CEEB' },
  };

  const generatedPrefixes = new Set<string>();
  for (const el of analysis.elements) {
    if (el.type === 'TEXT_IMG' && el.dataType) {
      const config = dataDigitPrefixes[el.dataType];
      if (config && !generatedPrefixes.has(config.prefix)) {
        generatedPrefixes.add(config.prefix);
        images.push(...generateDigitImages(config.prefix, 10, 16, 25, config.color));
        // Also set the fontArray on the element if not already set
        if (!el.fontArray || el.fontArray.length === 0) {
          el.fontArray = Array.from({ length: 10 }, (_, i) => `${config.prefix}_${i}.png`);
        }
      }
    }
  }

  // 8. Status icons
  const statusElements = analysis.elements.filter(el => el.type === 'IMG_STATUS');
  for (const el of statusElements) {
    switch (el.statusType) {
      case 'DISCONNECT':
        images.push(generateStatusIcon('bluetooth_30x30.png', '#4488FF', (ctx, w) => {
          ctx.beginPath();
          ctx.moveTo(w * 0.35, w * 0.2);
          ctx.lineTo(w * 0.65, w * 0.4);
          ctx.lineTo(w * 0.5, w * 0.5);
          ctx.lineTo(w * 0.65, w * 0.6);
          ctx.lineTo(w * 0.35, w * 0.8);
          ctx.moveTo(w * 0.5, w * 0.2);
          ctx.lineTo(w * 0.5, w * 0.8);
          ctx.stroke();
        }));
        if (!el.src) el.src = 'bluetooth_30x30.png';
        break;
      case 'DISTURB':
        images.push(generateStatusIcon('dnd_30x30.png', '#FF6B6B', (ctx, w) => {
          ctx.beginPath();
          ctx.arc(w / 2, w / 2, w * 0.35, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(w * 0.25, w / 2);
          ctx.lineTo(w * 0.75, w / 2);
          ctx.stroke();
        }));
        if (!el.src) el.src = 'dnd_30x30.png';
        break;
      case 'CLOCK':
        images.push(generateStatusIcon('alarm_30x30.png', '#FFD93D', (ctx, w) => {
          ctx.beginPath();
          ctx.arc(w / 2, w * 0.55, w * 0.3, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(w * 0.35, w * 0.25);
          ctx.lineTo(w / 2, w * 0.1);
          ctx.lineTo(w * 0.65, w * 0.25);
          ctx.stroke();
        }));
        if (!el.src) el.src = 'alarm_30x30.png';
        break;
    }
  }

  // 9. Weather icons for IMG_LEVEL
  const weatherElement = analysis.elements.find(el => el.type === 'IMG_LEVEL' && el.dataType === 'WEATHER_CURRENT');
  if (weatherElement) {
    const count = weatherElement.images?.length || 29;
    images.push(...generateWeatherIcons(count));
    // Ensure element has the right image array
    if (!weatherElement.images || weatherElement.images.length === 0) {
      weatherElement.images = Array.from({ length: 29 }, (_, i) => `weather_${i}.png`);
    }
  }

  // 10. Transparent button image
  images.push({
    name: 'trasparente.png',
    dataUrl: createCanvasImage(1, 1, () => {}),
    bounds: { x: 0, y: 0, width: 1, height: 1 },
    type: 'BUTTON',
  });

  // 11. Try to extract small icons/decorations from the actual design image
  const staticImgElements = analysis.elements.filter(
    el => el.type === 'IMG' && el.src && el.name !== 'Background' &&
    !el.name.toLowerCase().includes('time') &&
    !el.name.toLowerCase().includes('date') &&
    !el.name.toLowerCase().includes('month') &&
    !el.name.toLowerCase().includes('week'),
  );

  for (const el of staticImgElements) {
    try {
      const extracted = await extractRegion(designDataUrl, el.bounds);
      images.push({
        name: el.src!,
        dataUrl: extracted,
        bounds: el.bounds,
        type: 'IMG',
      });
    } catch {
      // Fallback: generate a colored placeholder
      images.push({
        name: el.src!,
        dataUrl: createCanvasImage(
          el.bounds.width || 24,
          el.bounds.height || 24,
          (ctx, w, h) => {
            ctx.fillStyle = el.color || '#555555';
            ctx.fillRect(0, 0, w, h);
          },
        ),
        bounds: el.bounds,
        type: 'IMG',
      });
    }
  }

  console.log(`[AssetGen] Generated ${images.length} asset images`);
  return images;
}
