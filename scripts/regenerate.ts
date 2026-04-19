#!/usr/bin/env tsx
/**
 * regenerate.ts — patch deviceSources in app.json for all watchfaces in a specGroup
 *
 * When Zepp adds new device IDs to a watch model, this script:
 *   1. Reads specGroups.json from GitHub to get the latest deviceSources
 *   2. Downloads every face.zpk whose catalog entry matches the specGroup
 *   3. Backs it up as face.zpk.bak
 *   4. Unzips, patches app.json with new deviceSources, re-zips
 *   5. Uploads the new face.zpk
 *   6. Verifies the uploaded ZPK has the correct deviceSources
 *   7. Auto-rolls back on any failure
 *
 * Usage:
 *   GITHUB_TOKEN=ghp_... GITHUB_REPO=owner/repo npm run regenerate -- --specGroup=480-round-v2
 *
 * Or regenerate ALL spec groups:
 *   npm run regenerate -- --specGroup=all
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

if (!targetSpecGroup) {
  console.error('Error: --specGroup=<key|all> argument is required.');
  console.error('  Example: npm run regenerate -- --specGroup=480-round-v2');
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
  if (!res.ok) {
    throw new Error(`GET ${path} failed: HTTP ${res.status}`);
  }
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

async function ghGetSHA(path: string): Promise<string | undefined> {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${GITHUB_BRANCH}`,
    { headers: GH_HEADERS }
  );
  if (!res.ok) return undefined;
  const d = (await res.json()) as { sha: string };
  return d.sha;
}

// ── Types ───────────────────────────────────────────────────────────────────

interface CatalogEntry { id: string; specGroup: string; [k: string]: unknown }
interface SpecGroup { deviceSources: number[]; [k: string]: unknown }

// ── Patch a single ZPK ──────────────────────────────────────────────────────

async function processEntry(
  id: string,
  newDeviceSources: number[]
): Promise<{ status: 'ok' | 'skipped' | 'error'; reason?: string }> {
  const zpkPath  = `docs/zpk/${id}/face.zpk`;
  const bakPath  = `docs/zpk/${id}/face.zpk.bak`;

  console.log(`\n  [${id}] Downloading face.zpk…`);
  let zpkBytes: Buffer;
  let zpkSha: string;
  try {
    const { bytes, sha } = await ghGetBinary(zpkPath);
    zpkBytes = bytes;
    zpkSha   = sha;
  } catch {
    return { status: 'error', reason: 'Could not download face.zpk' };
  }

  // ── 1. Backup ─────────────────────────────────────────────────────────────
  console.log(`  [${id}] Backing up → face.zpk.bak…`);
  const existingBakSha = await ghGetSHA(bakPath);
  try {
    await ghPut(
      bakPath,
      zpkBytes,
      `Backup face.zpk before regeneration: ${id}`,
      existingBakSha
    );
  } catch (e) {
    return { status: 'error', reason: `Backup failed: ${(e as Error).message}` };
  }

  // ── 2. Patch app.json inside ZIP ──────────────────────────────────────────
  console.log(`  [${id}] Patching app.json…`);
  let newZpkBytes: Buffer;
  try {
    const zip = await JSZip.loadAsync(zpkBytes);

    const appJsonFile = zip.file('app.json');
    if (!appJsonFile) {
      return { status: 'error', reason: 'app.json not found inside ZPK' };
    }
    const appJsonText = await appJsonFile.async('string');
    const appJson = JSON.parse(appJsonText) as Record<string, unknown>;

    // Patch deviceSources inside targets.default (v3 format)
    let patched = false;
    const targets = appJson['targets'] as Record<string, unknown> | undefined;
    if (targets) {
      for (const targetKey of Object.keys(targets)) {
        const target = targets[targetKey] as Record<string, unknown> | undefined;
        if (target && Array.isArray(target['deviceSources'])) {
          target['deviceSources'] = newDeviceSources;
          patched = true;
        }
      }
    }

    if (!patched) {
      return { status: 'skipped', reason: 'No deviceSources field found in app.json' };
    }

    zip.file('app.json', JSON.stringify(appJson, null, 2));
    const updated = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
    newZpkBytes = Buffer.from(updated);
  } catch (e) {
    return { status: 'error', reason: `Patch failed: ${(e as Error).message}` };
  }

  // ── 3. Upload new ZPK ─────────────────────────────────────────────────────
  console.log(`  [${id}] Uploading new face.zpk…`);
  try {
    await ghPut(
      zpkPath,
      newZpkBytes,
      `Regenerate face.zpk for ${id} (updated deviceSources)`,
      zpkSha
    );
  } catch (e) {
    // Upload failed — attempt restore from backup
    console.warn(`  [${id}] Upload failed — restoring from backup…`);
    try {
      await ghPut(zpkPath, zpkBytes, `Restore face.zpk for ${id} after failed regen`, zpkSha);
    } catch {
      console.error(`  [${id}] RESTORE ALSO FAILED — manual intervention needed`);
    }
    return { status: 'error', reason: `Upload failed: ${(e as Error).message}` };
  }

  // ── 4. Verify ─────────────────────────────────────────────────────────────
  console.log(`  [${id}] Verifying…`);
  try {
    const { bytes: verifyBytes } = await ghGetBinary(zpkPath);
    const verifyZip = await JSZip.loadAsync(verifyBytes);
    const verifyJson = await verifyZip.file('app.json')?.async('string');
    if (!verifyJson) throw new Error('app.json missing after upload');
    const verifyApp = JSON.parse(verifyJson) as Record<string, unknown>;
    const verifyTargets = verifyApp['targets'] as Record<string, unknown> | undefined;
    let verified = false;
    if (verifyTargets) {
      for (const targetKey of Object.keys(verifyTargets)) {
        const t = verifyTargets[targetKey] as Record<string, unknown> | undefined;
        if (t && Array.isArray(t['deviceSources'])) {
          // Check that at least the first deviceSource matches
          if (t['deviceSources'][0] === newDeviceSources[0]) verified = true;
        }
      }
    }
    if (!verified) throw new Error('deviceSources mismatch after upload');
    console.log(`  [${id}] Verification passed ✓`);
  } catch (e) {
    console.warn(`  [${id}] Verification failed — rolling back…`);
    try {
      await ghPut(zpkPath, zpkBytes, `Rollback face.zpk for ${id} after failed verify`, zpkSha);
    } catch {
      console.error(`  [${id}] ROLLBACK ALSO FAILED — manual intervention needed`);
    }
    return { status: 'error', reason: `Verify failed: ${(e as Error).message}` };
  }

  return { status: 'ok' };
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log(`\nRegenerate ZPKs — specGroup: ${targetSpecGroup}`);
  console.log(`Repo: ${owner}/${repo} (${GITHUB_BRANCH})\n`);

  // Fetch specGroups.json
  console.log('Loading specGroups.json…');
  const specGroups = await ghGetJSON<Record<string, SpecGroup>>('docs/specGroups.json');
  const specGroupKeys = targetSpecGroup === 'all'
    ? Object.keys(specGroups)
    : [targetSpecGroup];

  // Validate requested keys
  for (const key of specGroupKeys) {
    if (!specGroups[key]) {
      console.error(`Error: specGroup "${key}" not found in specGroups.json.`);
      console.error(`Valid keys: ${Object.keys(specGroups).join(', ')}`);
      process.exit(1);
    }
  }

  // Fetch catalog
  console.log('Loading catalog.json…');
  const catalog = await ghGetJSON<CatalogEntry[]>('docs/catalog.json');
  console.log(`Found ${catalog.length} catalog entries.`);

  const results: Record<string, { ok: string[]; skipped: string[]; error: string[] }> = {};

  for (const sgKey of specGroupKeys) {
    const sg = specGroups[sgKey]!;
    const matching = catalog.filter((e) => e.specGroup === sgKey);
    console.log(`\n── specGroup: ${sgKey} (${matching.length} watchfaces, deviceSources: [${sg.deviceSources.join(', ')}])`);

    results[sgKey] = { ok: [], skipped: [], error: [] };

    for (const entry of matching) {
      const r = await processEntry(entry.id, sg.deviceSources);
      if (r.status === 'ok') {
        results[sgKey]!.ok.push(entry.id);
      } else if (r.status === 'skipped') {
        console.log(`  [${entry.id}] Skipped: ${r.reason}`);
        results[sgKey]!.skipped.push(entry.id);
      } else {
        console.error(`  [${entry.id}] ERROR: ${r.reason}`);
        results[sgKey]!.error.push(entry.id);
      }
      // Throttle to avoid GitHub API rate limits
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  // Summary
  console.log('\n── Summary ───────────────────────────────────────────');
  let totalErrors = 0;
  for (const [key, r] of Object.entries(results)) {
    console.log(`${key}: ${r.ok.length} ok · ${r.skipped.length} skipped · ${r.error.length} error`);
    if (r.error.length) { console.log(`  Failed: ${r.error.join(', ')}`); totalErrors += r.error.length; }
  }
  console.log('─────────────────────────────────────────────────────\n');

  process.exit(totalErrors > 0 ? 1 : 0);
}

main().catch((err: unknown) => {
  console.error('regenerate failed:', err);
  process.exit(1);
});
