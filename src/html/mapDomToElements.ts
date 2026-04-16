// Spec 013 — Multi-signal classifier: data-widget → class keywords → text → tag → fallback

import type { WatchFaceElement } from '@/types';
import type { DomElement } from './parseDom';
import { generateId } from '@/lib/utils';

const CANVAS = 480;
const CENTER = CANVAS / 2;

// ── Class keyword lookup ──────────────────────────────────────────────────────
const CLASS_KEYWORDS: Array<{
  pattern: RegExp;
  type: WatchFaceElement['type'];
  name: string;
  dataType?: string;
}> = [
  { pattern: /\b(time|clock|hour|minute|second)\b/i,   type: 'IMG_TIME',      name: 'Digital Time' },
  { pattern: /\b(date|day|month|calendar)\b/i,          type: 'IMG_DATE',      name: 'Date' },
  { pattern: /\b(week|weekday)\b/i,                     type: 'IMG_WEEK',      name: 'Weekday' },
  { pattern: /\b(battery|batt|charge)\b/i,              type: 'TEXT_IMG',      name: 'Battery',    dataType: 'BATTERY' },
  { pattern: /\b(step|walk|pedometer)\b/i,              type: 'TEXT_IMG',      name: 'Steps',      dataType: 'STEP' },
  { pattern: /\b(heart|hr|bpm|pulse)\b/i,               type: 'TEXT_IMG',      name: 'Heart Rate', dataType: 'HEART' },
  { pattern: /\b(weather|temp|temperature)\b/i,         type: 'TEXT_IMG',      name: 'Weather',    dataType: 'WEATHER' },
  { pattern: /\b(arc|ring|progress|gauge)\b/i,          type: 'ARC_PROGRESS',  name: 'Progress' },
  { pattern: /\b(hand|pointer|analog)\b/i,              type: 'TIME_POINTER',  name: 'Analog Clock' },
];

// ── Text pattern classifier ───────────────────────────────────────────────────
function classifyByText(t: string): { type: WatchFaceElement['type']; name: string; dataType?: string } | null {
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(t))                              return { type: 'IMG_TIME',  name: 'Digital Time' };
  if (/^(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)$/i.test(t)) return { type: 'IMG_DATE',  name: 'Month' };
  if (/^(MON|TUE|WED|THU|FRI|SAT|SUN)$/i.test(t))                      return { type: 'IMG_WEEK',  name: 'Weekday' };
  if (/battery|batt|⚡/i.test(t) || (/\d+%/.test(t) && t.length < 8))  return { type: 'TEXT_IMG',  name: 'Battery',    dataType: 'BATTERY' };
  if (/step|walk|👟/i.test(t) || /^\d{4,}$/.test(t))                   return { type: 'TEXT_IMG',  name: 'Steps',      dataType: 'STEP' };
  if (/heart|bpm|❤|♥/i.test(t))                                        return { type: 'TEXT_IMG',  name: 'Heart Rate', dataType: 'HEART' };
  if (/weather|☁|🌤|°/.test(t))                                        return { type: 'TEXT_IMG',  name: 'Weather',    dataType: 'WEATHER' };
  if (/^\d{1,2}$/.test(t))                                              return { type: 'IMG_DATE',  name: 'Date' };
  if (/^\d+$/.test(t))                                                  return { type: 'TEXT_IMG',  name: 'Value' };
  return null;
}

function clampBounds(x: number, y: number, w: number, h: number) {
  const cx = Math.max(0, Math.min(x, CANVAS - 1));
  const cy = Math.max(0, Math.min(y, CANVAS - 1));
  return { x: cx, y: cy, width: Math.max(1, Math.min(w, CANVAS - cx)), height: Math.max(1, Math.min(h, CANVAS - cy)) };
}

/** Convert rgb(r, g, b) string to #rrggbb hex */
function rgbToHex(rgb: string): string {
  const match = rgb.match(/\d+/g);
  if (!match || match.length < 3) return '#FFFFFF';
  return '#' + match.slice(0, 3).map(n => parseInt(n).toString(16).padStart(2, '0')).join('');
}

export function mapDomToElements(domEls: DomElement[]): WatchFaceElement[] {
  const result: WatchFaceElement[] = [];
  let zIndex = 1;
  let hasTimePointer = false;

  for (const el of domEls) {
    if (result.length >= 20) break;

    const bounds = clampBounds(el.x, el.y, el.width, el.height);
    const text = el.textContent.trim();
    const cls = (typeof el.className === 'string' ? el.className : '') + ' ' + el.tagName;

    // ── Priority 1: data-widget attribute ──────────────────────────────────
    if (el.dataWidget) {
      const type = el.dataWidget.toUpperCase() as WatchFaceElement['type'];
      if (type === 'TIME_POINTER' && !hasTimePointer) {
        hasTimePointer = true;
        result.push({ id: generateId(), type, name: 'Analog Clock', bounds: { x: 0, y: 0, width: CANVAS, height: CANVAS }, center: { x: CENTER, y: CENTER }, visible: true, zIndex: zIndex++ });
      } else if (type !== 'TIME_POINTER') {
        const watchEl: WatchFaceElement = { id: generateId(), type, name: el.dataWidget, bounds, visible: true, zIndex: zIndex++ };
        if (el.dataType) watchEl.dataType = el.dataType;
        result.push(watchEl);
      }
      continue;
    }

    // ── Priority 2: CSS class keywords ─────────────────────────────────────
    let classMatch: typeof CLASS_KEYWORDS[0] | undefined;
    for (const kw of CLASS_KEYWORDS) {
      if (kw.pattern.test(cls)) { classMatch = kw; break; }
    }
    if (classMatch) {
      if (classMatch.type === 'TIME_POINTER') {
        if (!hasTimePointer) {
          hasTimePointer = true;
          result.push({ id: generateId(), type: 'TIME_POINTER', name: 'Analog Clock', bounds: { x: 0, y: 0, width: CANVAS, height: CANVAS }, center: { x: CENTER, y: CENTER }, visible: true, zIndex: zIndex++ });
        }
        continue;
      }
      const watchEl: WatchFaceElement = { id: generateId(), type: classMatch.type, name: classMatch.name, bounds, visible: true, zIndex: zIndex++ };
      if (classMatch.dataType) watchEl.dataType = classMatch.dataType;
      if (el.style.color) watchEl.color = rgbToHex(el.style.color);
      result.push(watchEl);
      continue;
    }

    // ── Priority 3: text content pattern ───────────────────────────────────
    if (text) {
      const textMatch = classifyByText(text);
      if (textMatch) {
        const watchEl: WatchFaceElement = { id: generateId(), type: textMatch.type, name: textMatch.name, bounds, visible: true, zIndex: zIndex++ };
        if (textMatch.dataType) watchEl.dataType = textMatch.dataType;
        if (el.style.color) watchEl.color = rgbToHex(el.style.color);
        result.push(watchEl);
        continue;
      }
    }

    // ── Priority 4: tag type ────────────────────────────────────────────────
    if (el.tagName === 'img') {
      result.push({ id: generateId(), type: 'IMG', name: 'Image', bounds, src: 'asset.png', visible: true, zIndex: zIndex++ });
      continue;
    }
    if (el.tagName === 'svg' || el.tagName === 'circle' || el.tagName === 'path') {
      result.push({ id: generateId(), type: 'ARC_PROGRESS', name: 'Progress', bounds, visible: true, zIndex: zIndex++ });
      continue;
    }

    // ── Priority 5: fallback — any element with text ────────────────────────
    if (text) {
      const watchEl: WatchFaceElement = { id: generateId(), type: 'TEXT', name: text.slice(0, 20), bounds, text, visible: true, zIndex: zIndex++ };
      if (el.style.color) watchEl.color = rgbToHex(el.style.color);
      if (el.style.fontSize) watchEl.fontSize = parseInt(el.style.fontSize);
      result.push(watchEl);
    }
  }

  return result;
}

