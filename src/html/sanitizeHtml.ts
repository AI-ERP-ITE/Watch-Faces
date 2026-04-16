// Spec 010 — T005/T006/T007: HTML Sanitization
// Strips markdown wrappers, removes script/style tags, normalizes whitespace.

/**
 * Sanitize raw HTML input from user:
 * 1. Strip markdown code fences (```html ... ```)
 * 2. Remove <script> and <style> blocks
 * 3. Remove event handler attributes (onclick, onload, etc.)
 * 4. Trim outer whitespace
 */
export function sanitizeHtml(raw: string): string {
  let html = raw;

  // T005 — Strip markdown code fences
  html = html.replace(/^```[\w]*\n?/gm, '').replace(/^```\s*$/gm, '');

  // T006 — Remove <script> blocks (including content)
  html = html.replace(/<script[\s\S]*?<\/script>/gi, '');

  // T006 — Remove <style> blocks (including content)
  html = html.replace(/<style[\s\S]*?<\/style>/gi, '');

  // T006 — Remove event handler attributes (security)
  html = html.replace(/\s+on\w+="[^"]*"/gi, '');
  html = html.replace(/\s+on\w+='[^']*'/gi, '');

  // T007 — Trim outer whitespace
  html = html.trim();

  return html;
}
