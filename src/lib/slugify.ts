/**
 * Convert a display name to a URL-safe slug.
 * e.g. "Gothic Dark 2!" → "gothic-dark-2"
 */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')                   // decompose accented chars
    .replace(/[\u0300-\u036f]/g, '')    // strip diacritic marks
    .replace(/[^a-z0-9\s-]/g, '')      // remove remaining non-alphanum
    .trim()
    .replace(/\s+/g, '-')              // spaces → hyphens
    .replace(/-+/g, '-');              // collapse consecutive hyphens
}

/**
 * Return a collision-free slug given an existing catalog array.
 * If "gothic-dark" exists, returns "gothic-dark-2", etc.
 */
export function uniqueSlug(name: string, existingIds: string[]): string {
  const base = slugify(name);
  if (!existingIds.includes(base)) return base;

  let n = 2;
  while (existingIds.includes(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}
