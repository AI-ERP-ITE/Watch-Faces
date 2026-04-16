// Spec 010 — T008/T009: Container Handling + T013–T016: DOM Parsing
// Detects/wraps root container, traverses DOM, extracts geometry.

import { sanitizeForParse } from './sanitizeHtml';

export interface DomElement {
  tagName: string;
  textContent: string;
  x: number;
  y: number;
  width: number;
  height: number;
  transform: string;
  style: Record<string, string>;
}

const CONTAINER_SIZE = 480;

/**
 * T008/T009 — Detect root container and wrap if missing.
 * Ensures HTML is inside a 480×480 relative div.
 */
export function normalizeContainer(html: string): string {
  const trimmed = html.trim();

  // T008 — Check if root element is already a 480×480 container
  const hasContainer = /style=["'][^"']*width\s*:\s*480px[^"']*["']/.test(trimmed);
  if (hasContainer) return trimmed;

  // T009 — Wrap in 480×480 container
  return `<div style="position:relative;width:480px;height:480px;overflow:hidden;">${trimmed}</div>`;
}

/**
 * T013–T016 — Parse DOM nodes from sanitized HTML.
 * Mounts into a hidden off-screen iframe, reads getBoundingClientRect()
 * relative to the 480×480 container, then tears down.
 */
export function parseDom(rawHtml: string): DomElement[] {
  // Sanitize (keep styles for layout) + normalize container
  const clean = sanitizeForParse(rawHtml);
  const wrapped = normalizeContainer(clean);

  // Mount in hidden iframe to get accurate layout
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:480px;height:480px;border:none;visibility:hidden;';
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument!;
  doc.open();
  doc.write(`<!DOCTYPE html><html><head><style>*{box-sizing:border-box;margin:0;padding:0;}</style></head><body style="margin:0;padding:0;">${wrapped}</body></html>`);
  doc.close();

  const container = doc.body.firstElementChild as HTMLElement | null;
  const elements: DomElement[] = [];

  if (container) {
    const containerRect = container.getBoundingClientRect();

    // T013 — Traverse all descendant elements (skip the container itself)
    const nodes = container.querySelectorAll('*');
    nodes.forEach((node) => {
      const el = node as HTMLElement;

      // T014 — Extract bounding rect
      const rect = el.getBoundingClientRect();

      // Skip zero-size or invisible nodes
      if (rect.width === 0 || rect.height === 0) return;

      // T015 — Normalize coordinates relative to container
      const x = Math.round(rect.left - containerRect.left);
      const y = Math.round(rect.top - containerRect.top);
      const width = Math.round(rect.width);
      const height = Math.round(rect.height);

      // Clamp to 480×480 bounds
      if (x >= CONTAINER_SIZE || y >= CONTAINER_SIZE) return;

      const computedStyle = window.getComputedStyle(el);

      // T016 — Build element record
      elements.push({
        tagName: el.tagName.toLowerCase(),
        textContent: el.textContent?.trim() ?? '',
        x,
        y,
        width,
        height,
        transform: computedStyle.transform ?? '',
        style: {
          color: computedStyle.color,
          fontSize: computedStyle.fontSize,
          fontFamily: computedStyle.fontFamily,
          backgroundColor: computedStyle.backgroundColor,
        },
      });
    });
  }

  // Teardown
  document.body.removeChild(iframe);

  return elements;
}
