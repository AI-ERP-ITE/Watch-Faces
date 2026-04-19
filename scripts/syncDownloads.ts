#!/usr/bin/env tsx
/**
 * syncDownloads.ts — pull Firestore download counts into catalog.json on GitHub
 *
 * Prerequisites:
 *   1. Set GOOGLE_APPLICATION_CREDENTIALS to your Firebase service-account JSON path
 *   2. Set GITHUB_TOKEN to a PAT with repo write access
 *   3. Set GITHUB_REPO to "owner/repo" (e.g. "AI-ERP-ITE/Watch-Faces")
 *
 * Run:
 *   npm run sync-downloads
 * or:
 *   npx tsx scripts/syncDownloads.ts
 */

import * as admin from 'firebase-admin';

// ── Config from environment ────────────────────────────────────────────────

const GITHUB_TOKEN = process.env['GITHUB_TOKEN'];
const GITHUB_REPO  = process.env['GITHUB_REPO'] ?? 'AI-ERP-ITE/Watch-Faces';
const GITHUB_BRANCH = process.env['GITHUB_BRANCH'] ?? 'main';
const CATALOG_PATH = 'docs/catalog.json';

if (!GITHUB_TOKEN) {
  console.error('Error: GITHUB_TOKEN environment variable is required.');
  process.exit(1);
}

const [owner, repo] = GITHUB_REPO.split('/');
if (!owner || !repo) {
  console.error(`Error: GITHUB_REPO must be "owner/repo", got: "${GITHUB_REPO}"`);
  process.exit(1);
}

// ── Firebase Admin init ────────────────────────────────────────────────────

admin.initializeApp();
const db = admin.firestore();

// ── Types ──────────────────────────────────────────────────────────────────

interface CatalogEntry {
  id: string;
  downloads: number;
  [key: string]: unknown;
}

// ── GitHub helpers ─────────────────────────────────────────────────────────

const GH_HEADERS = {
  Authorization: `token ${GITHUB_TOKEN}`,
  Accept: 'application/vnd.github.v3+json',
  'Content-Type': 'application/json',
};

async function fetchCatalog(): Promise<{ entries: CatalogEntry[]; sha: string }> {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${CATALOG_PATH}?ref=${GITHUB_BRANCH}`,
    { headers: GH_HEADERS }
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch catalog.json: HTTP ${res.status}`);
  }
  const data = (await res.json()) as { content: string; sha: string };
  const decoded = Buffer.from(data.content, 'base64').toString('utf-8');
  return { entries: JSON.parse(decoded) as CatalogEntry[], sha: data.sha };
}

async function writeCatalog(entries: CatalogEntry[], sha: string): Promise<void> {
  const content = Buffer.from(JSON.stringify(entries, null, 2)).toString('base64');
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${CATALOG_PATH}`,
    {
      method: 'PUT',
      headers: GH_HEADERS,
      body: JSON.stringify({
        message: `chore: sync download counts [${new Date().toISOString()}]`,
        content,
        sha,
        branch: GITHUB_BRANCH,
      }),
    }
  );
  if (!res.ok) {
    const err = (await res.json().catch(() => ({ message: res.statusText }))) as { message: string };
    throw new Error(`Failed to write catalog.json: ${err.message}`);
  }
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log(`Syncing download counts → ${owner}/${repo} (${GITHUB_BRANCH})`);

  // 1. Pull all download counts from Firestore
  console.log('Fetching Firestore downloads collection…');
  const snapshot = await db.collection('downloads').get();
  const counts = new Map<string, number>();
  snapshot.forEach((doc) => {
    const data = doc.data() as { count?: number };
    counts.set(doc.id, data.count ?? 0);
  });
  console.log(`  Found ${counts.size} entries in Firestore.`);

  // 2. Fetch current catalog.json from GitHub
  console.log('Fetching catalog.json from GitHub…');
  const { entries, sha } = await fetchCatalog();
  console.log(`  Found ${entries.length} catalog entries.`);

  // 3. Merge counts into catalog
  let updated = 0;
  const patched = entries.map((entry) => {
    const firestoreCount = counts.get(entry.id);
    if (firestoreCount !== undefined && firestoreCount !== entry.downloads) {
      updated++;
      return { ...entry, downloads: firestoreCount };
    }
    return entry;
  });

  if (updated === 0) {
    console.log('No download counts changed. Nothing to write.');
    return;
  }

  console.log(`  ${updated} entries updated.`);

  // 4. Write updated catalog back to GitHub
  console.log('Writing updated catalog.json to GitHub…');
  await writeCatalog(patched, sha);
  console.log('Done ✓');
}

main().catch((err: unknown) => {
  console.error('syncDownloads failed:', err);
  process.exit(1);
});
