import type { SpecGroup } from '@/context/CatalogContext';

/**
 * Given canvas dimensions + API version, find the matching spec group key.
 * Returns null if no match found.
 */
export function detectSpecGroup(
  width: number,
  height: number,
  apiVersion: 'v2' | 'v3',
  specGroups: Record<string, SpecGroup>
): string | null {
  const resolution = `${width}x${height}`;
  const shape: 'round' | 'square' = width === height ? 'round' : 'square';

  for (const [key, sg] of Object.entries(specGroups)) {
    if (
      sg.resolution === resolution &&
      sg.shape === shape &&
      sg.apiVersion === apiVersion
    ) {
      return key;
    }
  }

  return null;
}

/**
 * Describe a spec group key in human-readable form for UI display.
 */
export function describeSpecGroup(_key: string, sg: SpecGroup): string {
  return `${sg.resolution} · ${sg.shape} · API ${sg.apiVersion.toUpperCase()}`;
}
