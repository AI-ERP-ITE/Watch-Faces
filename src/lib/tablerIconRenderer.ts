import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { IconEntry } from './iconLibrary';
import { TABLER_ICON_MAP } from './tablerIconMap';

// Default stroke color for Tabler icons on the dark watchface UI
const ICON_COLOR = '#ffffff';
const ICON_SIZE = 48;
const ICON_STROKE = 1.5;

/** Render a Tabler icon component to a PNG data URL. */
function renderTablerIconToDataUrl(
  component: React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: number; stroke?: number; color?: string }>,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const svgString = renderToStaticMarkup(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      createElement(component as any, { size: ICON_SIZE, color: ICON_COLOR, stroke: ICON_STROKE })
    );

    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = ICON_SIZE;
      canvas.height = ICON_SIZE;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, ICON_SIZE, ICON_SIZE);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to render Tabler icon`));
    };
    img.src = url;
  });
}

// Module-level cache: key → rendered IconEntry
const _tablerCache = new Map<string, IconEntry>();
let _buildPromise: Promise<IconEntry[]> | null = null;

/** Get a Tabler icon entry synchronously from cache (undefined if not yet rendered). */
export function getTablerIconByKey(key: string): IconEntry | undefined {
  return _tablerCache.get(key);
}

/** Render a single Tabler icon and cache it. Returns the entry. */
export async function renderAndCacheTablerIcon(key: string): Promise<IconEntry | undefined> {
  const cached = _tablerCache.get(key);
  if (cached) return cached;

  const def = TABLER_ICON_MAP.find(d => d.key === key);
  if (!def) return undefined;

  try {
    const dataUrl = await renderTablerIconToDataUrl(def.component as React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: number; stroke?: number; color?: string }>);
    const entry: IconEntry = {
      key: def.key,
      label: def.label,
      category: def.category,
      source: 'tabler',
      dataUrl,
      width: ICON_SIZE,
      height: ICON_SIZE,
    };
    _tablerCache.set(key, entry);
    return entry;
  } catch {
    return undefined;
  }
}

/** Build the full Tabler icon library (all curated icons). Cached after first call. */
export function buildTablerLibrary(): Promise<IconEntry[]> {
  if (_buildPromise) return _buildPromise;

  _buildPromise = Promise.all(
    TABLER_ICON_MAP.map(def => renderAndCacheTablerIcon(def.key))
  ).then(entries => entries.filter((e): e is IconEntry => e !== undefined));

  return _buildPromise;
}
