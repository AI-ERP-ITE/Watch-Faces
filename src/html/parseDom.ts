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
 * If pasted HTML is a full document, extracts body content + head styles.
 */
export function normalizeContainer(html: string): { body: string; styles: string } {
  const trimmed = html.trim();

  // Detect full HTML document
  const isFullDoc = /<html[\s>]/i.test(trimmed);
  if (isFullDoc) {
    // Extract <style> blocks from <head>
    const headStyleMatches = [...trimmed.matchAll(/<style[\s\S]*?<\/style>/gi)];
    const styles = headStyleMatches.map(m => m[0]).join('\n');

    // Extract body content
    const bodyMatch = trimmed.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const bodyContent = bodyMatch ? bodyMatch[1].trim() : trimmed;

    // Wrap body content in 480×480 container if not already
    const hasContainer = /style=["'][^"']*width\s*:\s*480px[^"']*["']/.test(bodyContent);
    const body = hasContainer
      ? bodyContent
      : `<div style="position:relative;width:480px;height:480px;overflow:hidden;">${bodyContent}</div>`;
    return { body, styles };
  }

  // Fragment HTML
  const hasContainer = /style=["'][^"']*width\s*:\s*480px[^"']*["']/.test(trimmed);
  const body = hasContainer
    ? trimmed
    : `<div style="position:relative;width:480px;height:480px;overflow:hidden;">${trimmed}</div>`;
  return { body, styles: '' };
}

/**
 * T013–T016 — Parse DOM nodes from sanitized HTML.
 * Mounts into a hidden off-screen iframe, reads getBoundingClientRect()
 * relative to the 480×480 container, then tears down.
 */
export function parseDom(rawHtml: string): DomElement[] {
  // Sanitize (keep styles for layout) + normalize container
  const clean = sanitizeForParse(rawHtml);
  const { body: wrapped, styles: extractedStyles } = normalizeContainer(clean);

  // Mount in hidden iframe to get accurate layout
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:480px;height:480px;border:none;visibility:hidden;';
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument!;
  doc.open();
  doc.write(`<!DOCTYPE html><html><head><style>*{box-sizing:border-box;margin:0;padding:0;}</style>${extractedStyles}</head><body style="margin:0;padding:0;">${wrapped}</body></html>`);
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
