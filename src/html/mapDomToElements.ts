// Spec 010 — T017/T018/T019: Map DOM elements → WatchFaceElement[]
// Deterministic mapping: no AI involved.

import type { WatchFaceElement } from '@/types';
import type { DomElement } from './parseDom';
import { generateId } from '@/lib/utils';

const CANVAS = 480;
const CENTER = CANVAS / 2; // 240

/**
 * T018 — Detect analog clock hand from a DOM element.
 * Criteria: thin vertical rectangle, near center, has CSS transform.
 */
function isAnalogHand(el: DomElement): boolean {
  const nearCenter = Math.abs(el.x + el.width / 2 - CENTER) < 40 && Math.abs(el.y + el.height / 2 - CENTER) < 40;
  const thin = (el.width < 20 && el.height > 40) || (el.height < 20 && el.width > 40);
  const hasTransform = el.transform !== '' && el.transform !== 'none';
  return nearCenter && thin && hasTransform;
}

/**
 * T017 — Map text content to widget type.
 */
function classifyText(text: string): {
  type: WatchFaceElement['type'];
  name: string;
  dataType?: string;
} {
  const t = text.trim();

  // HH:MM or H:MM pattern → IMG_TIME
  if (/^\d{1,2}:\d{2}$/.test(t)) return { type: 'IMG_TIME', name: 'Digital Time' };

  // Two digits only (day) → IMG_DATE
  if (/^\d{1,2}$/.test(t)) return { type: 'IMG_DATE', name: 'Date' };

  // Month abbreviation → IMG_DATE (month)
  if (/^(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)$/i.test(t))
    return { type: 'IMG_DATE', name: 'Month' };

  // Weekday abbreviation → IMG_WEEK
  if (/^(MON|TUE|WED|THU|FRI|SAT|SUN)$/i.test(t))
    return { type: 'IMG_WEEK', name: 'Weekday' };

  // Battery: ⚡ 82% or "82%"
  if (/battery|batt|⚡/i.test(t) || (/\d+%/.test(t) && t.length < 8))
    return { type: 'TEXT_IMG', name: 'Battery', dataType: 'BATTERY' };

  // Steps: 👟 or numeric >1000
  if (/step|walk|👟/i.test(t) || /\d{4,}/.test(t))
    return { type: 'TEXT_IMG', name: 'Steps', dataType: 'STEP' };

  // Heart rate: ❤ or "bpm"
  if (/heart|bpm|❤|♥/i.test(t))
    return { type: 'TEXT_IMG', name: 'Heart Rate', dataType: 'HEART' };

  // Weather: ☁ or °
  if (/weather|☁|🌤|°/i.test(t))
    return { type: 'TEXT_IMG', name: 'Weather', dataType: 'WEATHER' };

  // Numeric → generic TEXT_IMG
  if (/^\d+$/.test(t))
    return { type: 'TEXT_IMG', name: 'Value' };

  // Fallback: TEXT
  return { type: 'TEXT', name: t.slice(0, 20) || 'Text' };
}

/**
 * T023/T024 — Clamp and validate bounds inside 480×480.
 */
function clampBounds(x: number, y: number, w: number, h: number) {
  const cx = Math.max(0, Math.min(x, CANVAS - 1));
  const cy = Math.max(0, Math.min(y, CANVAS - 1));
  const cw = Math.max(1, Math.min(w, CANVAS - cx));
  const ch = Math.max(1, Math.min(h, CANVAS - cy));
  return { x: cx, y: cy, width: cw, height: ch };
}

/**
 * T017–T019, T023/T024 — Map parsed DOM elements → WatchFaceElement[].
 * Analog hands are merged into a single TIME_POINTER widget.
 */
export function mapDomToElements(domEls: DomElement[]): WatchFaceElement[] {
  const result: WatchFaceElement[] = [];
  let zIndex = 1;
  let hasTimePointer = false;
  let maxElements = 20;

  for (const el of domEls) {
    if (result.length >= maxElements) break;

    // T018 — Detect analog hand → TIME_POINTER (only one widget)
    if (isAnalogHand(el)) {
      if (!hasTimePointer) {
        hasTimePointer = true;
        result.push({
          id: generateId(),
          type: 'TIME_POINTER',
          name: 'Analog Clock',
          bounds: { x: 0, y: 0, width: CANVAS, height: CANVAS },
          center: { x: CENTER, y: CENTER },
          visible: true,
          zIndex: zIndex++,
        });
      }
      continue;
    }

    // Skip elements with no useful text or too large (likely containers)
    const text = el.textContent.trim();
    const bounds = clampBounds(el.x, el.y, el.width, el.height);

    // Skip near-full-screen elements that have no text (likely background containers)
    if (bounds.width >= 460 && bounds.height >= 460 && !text) continue;

    // Handle <img> tags — treat as generic image element
    if (el.tagName === 'img') {
      result.push({
        id: generateId(),
        type: 'IMG',
        name: 'Image',
        bounds,
        src: 'asset.png',
        visible: true,
        zIndex: zIndex++,
      });
      continue;
    }

    // Skip container divs/sections that have child elements and no direct text
    if (!text && (el.tagName === 'div' || el.tagName === 'section' || el.tagName === 'main' || el.tagName === 'body')) {
      const hasChildEls = domEls.some(
        other => other !== el &&
          other.x >= el.x && other.y >= el.y &&
          other.x + other.width <= el.x + el.width &&
          other.y + other.height <= el.y + el.height
      );
      if (hasChildEls) continue;
    }

    // T017/T019 — Classify by text content
    const { type, name, dataType } = classifyText(text);

    const watchEl: WatchFaceElement = {
      id: generateId(),
      type,
      name,
      bounds,
      visible: true,
      zIndex: zIndex++,
    };

    if (dataType) watchEl.dataType = dataType;
    if (el.style.color) watchEl.color = rgbToHex(el.style.color);

    result.push(watchEl);
  }

  return result;
}

/** Convert rgb(r, g, b) string to #rrggbb hex */
function rgbToHex(rgb: string): string {
  const match = rgb.match(/\d+/g);
  if (!match || match.length < 3) return '#FFFFFF';
  return '#' + match.slice(0, 3).map(n => parseInt(n).toString(16).padStart(2, '0')).join('');
}
