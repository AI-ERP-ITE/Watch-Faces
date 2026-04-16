// Spec 013 — Async DOM parser: leaf-node strategy, multi-signal data
import { sanitizeForParse } from './sanitizeHtml';

export interface DomElement {
  tagName: string;
  textContent: string;
  className: string;
  dataWidget: string;
  dataType: string;
  x: number;
  y: number;
  width: number;
  height: number;
  transform: string;
  style: Record<string, string>;
}

const CONTAINER_SIZE = 480;

function normalizeContainer(html: string): { body: string; styles: string } {
  const trimmed = html.trim();
  const isFullDoc = /<html[\s>]/i.test(trimmed);
  if (isFullDoc) {
    const headStyleMatches = [...trimmed.matchAll(/<style[\s\S]*?<\/style>/gi)];
    const styles = headStyleMatches.map(m => m[0]).join('\n');
    const bodyMatch = trimmed.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const bodyContent = bodyMatch ? bodyMatch[1].trim() : trimmed;
    const hasContainer = /style=["'][^"']*width\s*:\s*480px[^"']*["']/.test(bodyContent);
    const body = hasContainer
      ? bodyContent
      : `<div style="position:relative;width:480px;height:480px;overflow:hidden;">${bodyContent}</div>`;
    return { body, styles };
  }
  const hasContainer = /style=["'][^"']*width\s*:\s*480px[^"']*["']/.test(trimmed);
  const body = hasContainer
    ? trimmed
    : `<div style="position:relative;width:480px;height:480px;overflow:hidden;">${trimmed}</div>`;
  return { body, styles: '' };
}

export function parseDom(rawHtml: string): Promise<DomElement[]> {
  return new Promise((resolve) => {
    const clean = sanitizeForParse(rawHtml);
    const { body: wrapped, styles: extractedStyles } = normalizeContainer(clean);

    const iframe = document.createElement('iframe');
    iframe.style.cssText =
      'position:fixed;top:-9999px;left:-9999px;width:480px;height:480px;border:none;visibility:hidden;';
    document.body.appendChild(iframe);

    const teardown = () => {
      try { document.body.removeChild(iframe); } catch { /* already removed */ }
    };

    iframe.onload = () => {
      try {
        const doc = iframe.contentDocument!;
        const container = doc.body.firstElementChild as HTMLElement | null;
        const elements: DomElement[] = [];

        if (container) {
          const containerRect = container.getBoundingClientRect();
          const allNodes = Array.from(container.querySelectorAll('*')) as HTMLElement[];

          const rectMap = new Map<HTMLElement, DOMRect>();
          for (const node of allNodes) {
            rectMap.set(node, node.getBoundingClientRect());
          }

          for (const el of allNodes) {
            const rect = rectMap.get(el)!;
            if (rect.width === 0 || rect.height === 0) continue;

            const children = Array.from(el.querySelectorAll('*')) as HTMLElement[];
            const hasVisibleChild = children.some(child => {
              const cr = rectMap.get(child) ?? child.getBoundingClientRect();
              return cr.width > 0 && cr.height > 0;
            });
            if (hasVisibleChild) continue;

            const x = Math.round(rect.left - containerRect.left);
            const y = Math.round(rect.top - containerRect.top);
            const width = Math.round(rect.width);
            const height = Math.round(rect.height);
            if (x >= CONTAINER_SIZE || y >= CONTAINER_SIZE) continue;

            const cs = window.getComputedStyle(el);
            elements.push({
              tagName: el.tagName.toLowerCase(),
              textContent: el.textContent?.trim() ?? '',
              className: typeof el.className === 'string' ? el.className : '',
              dataWidget: el.dataset?.widget ?? '',
              dataType: el.dataset?.type ?? '',
              x, y, width, height,
              transform: cs.transform ?? '',
              style: {
                color: cs.color,
                fontSize: cs.fontSize,
                fontFamily: cs.fontFamily,
                backgroundColor: cs.backgroundColor,
              },
            });
          }
        }

        teardown();
        resolve(elements);
      } catch (err) {
        console.error('[parseDom] Error reading iframe:', err);
        teardown();
        resolve([]);
      }
    };

    const doc = iframe.contentDocument!;
    doc.open();
    doc.write(
      `<!DOCTYPE html><html><head>` +
      `<style>*{box-sizing:border-box;margin:0;padding:0;}</style>` +
      `${extractedStyles}</head>` +
      `<body style="margin:0;padding:0;">${wrapped}</body></html>`
    );
    doc.close();
  });
}
