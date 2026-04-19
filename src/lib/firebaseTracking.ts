/**
 * Thin wrapper for calling the trackDownload Cloud Function.
 *
 * The function URL is set via VITE_FIREBASE_TRACK_URL environment variable.
 * Add to your .env.local:
 *
 *   VITE_FIREBASE_TRACK_URL=https://us-central1-<project-id>.cloudfunctions.net/trackDownload
 *
 * If the env var is not set the call is silently skipped — download still works.
 */

const TRACK_URL = import.meta.env.VITE_FIREBASE_TRACK_URL as string | undefined;

/**
 * Increment download count for a watchface.
 * Non-throwing — never blocks the download on failure.
 */
export async function trackDownload(watchfaceId: string): Promise<number | null> {
  if (!TRACK_URL) return null;

  try {
    const res = await fetch(`${TRACK_URL}?id=${encodeURIComponent(watchfaceId)}`);
    if (!res.ok) return null;
    const data = (await res.json()) as { id: string; count: number };
    return data.count ?? null;
  } catch {
    return null;
  }
}
