#!/usr/bin/env tsx
/**
 * rollback.ts — restore face.zpk from face.zpk.bak for a specGroup (or all entries)
 *
 * Run this after a failed regeneration to undo changes made by regenerate.ts.
 * It copies the .bak file back over face.zpk and optionally deletes the .bak.
 *
 * Usage:
 *   GITHUB_TOKEN=ghp_... GITHUB_REPO=owner/repo npm run rollback -- --specGroup=480-round-v2
 *   npm run rollback -- --specGroup=all
 *   npm run rollback -- --id=my-watch-slug-001
 *   npm run rollback -- --specGroup=all --delete-bak
 */

import JSZip from 'jszip';

// ── Env / args ──────────────────────────────────────────────────────────────

const GITHUB_TOKEN  = process.env['GITHUB_TOKEN'];
const GITHUB_REPO   = process.env['GITHUB_REPO'] ?? 'AI-ERP-ITE/Watch-Faces';
const GITHUB_BRANCH = process.env['GITHUB_BRANCH'] ?? 'main';

if (!GITHUB_TOKEN) {
  console.error('Error: GITHUB_TOKEN environment variable is required.');
  process.exit(1);
}

const targetSpecGroup = (() => {
  const arg = process.argv.find((a) => a.startsWith('--specGroup='));
  return arg ? arg.replace('--specGroup=', '').trim() : null;
})();

const targetId = (() => {
  const arg = process.argv.find((a) => a.startsWith('--id='));
  return arg ? arg.replace('--id=', '').trim() : null;
})();

const deleteBak = process.argv.includes('--delete-bak');

if (!targetSpecGroup && !targetId) {
  console.error('Error: --specGroup=<key|all> or --id=<watchface-id> is required.');
  console.error('  Examples:');
  console.error('    npm run rollback -- --specGroup=480-round-v2');
  console.error('    npm run rollback -- --specGroup=all');
  console.error('    npm run rollback -- --id=my-watch-slug-001');
  console.error('    npm run rollback -- --specGroup=all --delete-bak');
  process.exit(1);
}

const [owner, repo] = GITHUB_REPO.split('/');
if (!owner || !repo) {
  console.error(`Error: GITHUB_REPO must be "owner/repo", got: "${GITHUB_REPO}"`);
  process.exit(1);
}

// ── GitHub helpers ──────────────────────────────────────────────────────────

const GH_HEADERS = {
  Authorization: `token ${GITHUB_TOKEN}`,
  Accept: 'application/vnd.github.v3+json',
  'Content-Type': 'application/json',
};

async function ghGet(path: string): Promise<{ content: string; sha: string }> {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${GITHUB_BRANCH}`,
    { headers: GH_HEADERS }
  );
  if (!res.ok) throw new Error(`GET ${path} failed: HTTP ${res.status}`);
  return res.json() as Promise<{ content: string; sha: string }>;
}

async function ghGetJSON<T>(path: string): Promise<T> {
  const data = await ghGet(path);
  const decoded = Buffer.from(data.content.replace(/\n/g, ''), 'base64').toString('utf-8');
  return JSON.parse(decoded) as T;
}

async function ghGetBinary(path: string): Promise<{ bytes: Buffer; sha: string }> {
  const data = await ghGet(path);
  const bytes = Buffer.from(data.content.replace(/\n/g, ''), 'base64');
  return { bytes, sha: data.sha };
}

async function ghGetSHA(path: string): Promise<string | undefined> {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${GITHUB_BRANCH}`,
    { headers: GH_HEADERS }
  );
  if (!res.ok) return undefined;
  const d = (await res.json()) as { sha: string };
  return d.sha;
}

async function ghPut(
  path: string,
  bytes: Buffer,
  message: string,
  sha?: string
): Promise<void> {
  const content = bytes.toString('base64');
  const body: Record<string, string> = { message, content, branch: GITHUB_BRANCH };
  if (sha) body['sha'] = sha;

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    { method: 'PUT', headers: GH_HEADERS, body: JSON.stringify(body) }
  );
  if (!res.ok) {
    const err = (await res.json().catch(() => ({ message: res.statusText }))) as { message: string };
    throw new Error(`PUT ${path} failed: ${err.message}`);
  }
}

async function ghDelete(path: string, sha: string, message: string): Promise<void> {
  const body = { message, sha, branch: GITHUB_BRANCH };
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    { method: 'DELETE', headers: GH_HEADERS, body: JSON.stringify(body) }
  );
  if (!res.ok) {
    const err = (await res.json().catch(() => ({ message: res.statusText }))) as { message: string };
    throw new Error(`DELETE ${path} failed: ${err.message}`);
  }
}

// ── Types ───────────────────────────────────────────────────────────────────

interface CatalogEntry { id: string; specGroup: string; [k: string]: unknown }

// ── Rollback a single entry ──────────────────────────────────────────────────

async function rollbackEntry(
  id: string
): Promise<{ status: 'ok' | 'no-bak' | 'error'; reason?: string }> {
  const zpkPath = `docs/zpk/${id}/face.zpk`;
  const bakPath = `docs/zpk/${id}/face.zpk.bak`;

  // 1. Fetch backup
  console.log(`  [${id}] Downloading face.zpk.bak…`);
  let bakBytes: Buffer;
  let bakSha: string;
  try {
    const { bytes, sha } = await ghGetBinary(bakPath);
    bakBytes = bytes;
    bakSha   = sha;
  } catch {
    return { status: 'no-bak', reason: 'face.zpk.bak not found' };
  }

  // Quick sanity-check: .bak should be a valid ZIP
  try {
    await JSZip.loadAsync(bakBytes);
  } catch {
    return { status: 'error', reason: 'face.zpk.bak is not a valid ZIP file' };
  }

  // 2. Get current zpk SHA (needed for PUT to overwrite)
  const existingZpkSha = await ghGetSHA(zpkPath);

  // 3. Restore
  console.log(`  [${id}] Restoring face.zpk from backup…`);
  try {
    await ghPut(
      zpkPath,
      bakBytes,
      `Rollback: restore face.zpk from backup for ${id}`,
      existingZpkSha
    );
  } catch (e) {
    return { status: 'error', reason: `Restore upload failed: ${(e as Error).message}` };
  }

  // 4. Verify restore
  console.log(`  [${id}] Verifying restore…`);
  try {
    const { bytes: verifyBytes } = await ghGetBinary(zpkPath);
    // Verify both files have same size (fast sanity check)
    if (verifyBytes.length !== bakBytes.length) {
      throw new Error(`Size mismatch: expected ${bakBytes.length}, got ${verifyBytes.length}`);
    }
    // Also verify it opens as valid ZIP
    await JSZip.loadAsync(verifyBytes);
    console.log(`  [${id}] Restore verified ✓`);
  } catch (e) {
    return { status: 'error', reason: `Verify failed: ${(e as Error).message}` };
  }

  // 5. Optionally delete the .bak file
  if (deleteBak) {
    console.log(`  [${id}] Deleting face.zpk.bak…`);
    try {
      await ghDelete(bakPath, bakSha, `Cleanup: remove face.zpk.bak for ${id} after rollback`);
    } catch (e) {
      // Non-fatal — log and continue
      console.warn(`  [${id}] Warning: could not delete .bak: ${(e as Error).message}`);
    }
  }

  return { status: 'ok' };
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('\nRollback ZPKs from backups');
  console.log(`Repo: ${owner}/${repo} (${GITHUB_BRANCH})`);
  console.log(`Mode: ${targetId ? `single id=${targetId}` : `specGroup=${targetSpecGroup}`}${deleteBak ? ' + delete-bak' : ''}\n`);

  // Build list of IDs to roll back
  let ids: string[];

  if (targetId) {
    ids = [targetId];
  } else {
    // Need catalog to resolve specGroup → ids
    console.log('Loading catalog.json…');
    const catalog = await ghGetJSON<CatalogEntry[]>('docs/catalog.json');

    if (targetSpecGroup === 'all') {
      ids = catalog.map((e) => e.id);
    } else {
      ids = catalog.filter((e) => e.specGroup === targetSpecGroup).map((e) => e.id);
    }

    if (ids.length === 0) {
      console.warn(`No catalog entries found for specGroup="${targetSpecGroup}".`);
      process.exit(0);
    }
    console.log(`Found ${ids.length} entries to roll back.\n`);
  }

  const results = { ok: [] as string[], noBak: [] as string[], error: [] as string[] };

  for (const id of ids) {
    const r = await rollbackEntry(id);
    if (r.status === 'ok') {
      results.ok.push(id);
    } else if (r.status === 'no-bak') {
      console.log(`  [${id}] Skipped: ${r.reason}`);
      results.noBak.push(id);
    } else {
      console.error(`  [${id}] ERROR: ${r.reason}`);
      results.error.push(id);
    }
    // Throttle to stay within GitHub API rate limits
    await new Promise((res) => setTimeout(res, 300));
  }

  // Summary
  console.log('\n── Summary ───────────────────────────────────────────');
  console.log(`Restored:   ${results.ok.length}`);
  console.log(`No backup:  ${results.noBak.length}`);
  console.log(`Errors:     ${results.error.length}`);
  if (results.error.length) {
    console.log(`Failed IDs: ${results.error.join(', ')}`);
  }
  console.log('─────────────────────────────────────────────────────\n');

  process.exit(results.error.length > 0 ? 1 : 0);
}

main().catch((err: unknown) => {
  console.error('rollback failed:', err);
  process.exit(1);
});
