// Spec 013/014 — Async DOM parser: two-pass strategy, SVG as leaf
import { sanitizeForParse } from './sanitizeHtml';

export interface DomElement {
  tagName: string;
  textContent: string;
  className: string;
  dataWidget: string;
  dataType: string;
  /** Value of the data-icon-key attribute, e.g. 'heart_rate' or 'tabler:heart' */
  iconKey: string;
  matchedByClass: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  transform: string;
  style: Record<string, string>;
}

// Class keyword patterns (mirrors mapDomToElements CLASS_KEYWORDS)
const CLASS_MATCH_PATTERNS: RegExp[] = [
  /\b(time|clock|hour|minute|second)\b/i,
  /\b(date|day|month|calendar)\b/i,
  /\b(week|weekday)\b/i,
  /\b(battery|batt|charge)\b/i,
  /\b(step|walk|pedometer)\b/i,
  /\b(heart|hr|bpm|pulse)\b/i,
  /\b(weather|temp|temperature)\b/i,
  /\b(arc|ring|progress|gauge)\b/i,
  /\b(hand|pointer|analog)\b/i,
];

function matchesClassKeyword(className: string): boolean {
  return CLASS_MATCH_PATTERNS.some(p => p.test(className));
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

          const claimedNodes = new Set<HTMLElement>();
          const pass1: DomElement[] = [];
          const pass2: DomElement[] = [];

          // ── Pass 1: class-matched containers → single unit ──────────────────
          for (const el of allNodes) {
            const rect = rectMap.get(el)!;
            if (rect.width === 0 || rect.height === 0) continue;
            const className = typeof el.className === 'string' ? el.className : '';
            if (!matchesClassKeyword(className)) continue;

            // Claim this element and all its descendants
            claimedNodes.add(el);
            for (const d of Array.from(el.querySelectorAll('*')) as HTMLElement[]) {
              claimedNodes.add(d);
            }

            const x = Math.round(rect.left - containerRect.left);
            const y = Math.round(rect.top - containerRect.top);
            if (x >= CONTAINER_SIZE || y >= CONTAINER_SIZE) continue;

            const cs = window.getComputedStyle(el);
            pass1.push({
              tagName: el.tagName.toLowerCase(),
              textContent: el.textContent?.trim() ?? '',
              className,
              dataWidget: el.dataset?.widget ?? '',
              dataType: el.dataset?.type ?? '',
              iconKey: el.dataset?.iconKey ?? '',
              matchedByClass: true,
              x, y,
              width: Math.round(rect.width),
              height: Math.round(rect.height),
              transform: cs.transform ?? '',
              style: {
                color: cs.color,
                fontSize: cs.fontSize,
                fontFamily: cs.fontFamily,
                backgroundColor: cs.backgroundColor,
              },
            });
          }

          // ── Pass 2: unclaimed leaf nodes (SVG treated as leaf) ──────────────
          for (const el of allNodes) {
            if (claimedNodes.has(el)) continue;

            const rect = rectMap.get(el)!;
            if (rect.width === 0 || rect.height === 0) continue;

            const isSvg = el.tagName.toLowerCase() === 'svg';

            if (!isSvg) {
              // Standard leaf check: skip if any unclaimed child is visible
              const children = Array.from(el.querySelectorAll('*')) as HTMLElement[];
              const hasVisibleChild = children.some(child => {
                if (claimedNodes.has(child)) return false;
                const cr = rectMap.get(child) ?? child.getBoundingClientRect();
                return cr.width > 0 && cr.height > 0;
              });
              if (hasVisibleChild) continue;
            } else {
              // Claim all SVG children so they are not processed individually
              for (const d of Array.from(el.querySelectorAll('*')) as HTMLElement[]) {
                claimedNodes.add(d);
              }
            }

            const x = Math.round(rect.left - containerRect.left);
            const y = Math.round(rect.top - containerRect.top);
            if (x >= CONTAINER_SIZE || y >= CONTAINER_SIZE) continue;

            const cs = window.getComputedStyle(el);
            pass2.push({
              tagName: el.tagName.toLowerCase(),
              textContent: el.textContent?.trim() ?? '',
              className: typeof el.className === 'string' ? el.className : '',
              dataWidget: el.dataset?.widget ?? '',
              dataType: el.dataset?.type ?? '',
              iconKey: el.dataset?.iconKey ?? '',
              matchedByClass: false,
              x, y,
              width: Math.round(rect.width),
              height: Math.round(rect.height),
              transform: cs.transform ?? '',
              style: {
                color: cs.color,
                fontSize: cs.fontSize,
                fontFamily: cs.fontFamily,
                backgroundColor: cs.backgroundColor,
              },
            });
          }

          elements.push(...pass1, ...pass2);
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
