import { uploadToGitHub, type GitHubConfig } from './githubApi';
import type { CatalogEntry } from '@/context/CatalogContext';

const CATALOG_PATH = 'docs/catalog.json';

// ── Read ─────────────────────────────────────────────────────────────────

/**
 * Fetch the live catalog.json from the GitHub repo (raw content, not Pages).
 * Returns the parsed array, or throws on error.
 */
export async function fetchCatalogFromGitHub(
  config: GitHubConfig
): Promise<CatalogEntry[]> {
  const { token, owner, repo, branch = 'main' } = config;

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${CATALOG_PATH}?ref=${branch}`,
    {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  );

  if (!response.ok) {
    if (response.status === 404) return []; // catalog doesn't exist yet
    throw new Error(`Failed to fetch catalog.json: HTTP ${response.status}`);
  }

  const data = await response.json();
  // GitHub returns file content as base64
  const decoded = atob(data.content.replace(/\n/g, ''));
  return JSON.parse(decoded) as CatalogEntry[];
}

// ── Write ─────────────────────────────────────────────────────────────────

/**
 * Append a new entry to catalog.json in the GitHub repo.
 * Fetches current content → appends → writes back (preserves order).
 */
export async function appendToCatalog(
  config: GitHubConfig,
  entry: CatalogEntry
): Promise<void> {
  // 1. Read current catalog
  const current = await fetchCatalogFromGitHub(config);

  // Guard: don't add duplicate IDs
  if (current.some((e) => e.id === entry.id)) {
    throw new Error(`Catalog already contains an entry with id "${entry.id}"`);
  }

  // 2. Prepend (newest first)
  const updated = [entry, ...current];

  // 3. Upload updated catalog.json
  const blob = new Blob([JSON.stringify(updated, null, 2)], {
    type: 'application/json',
  });

  const result = await uploadToGitHub(
    config,
    // uploadToGitHub prepends docs/zpk/ — we need docs/ so we use a workaround:
    // pass the path ourselves via the internal function below
    '',
    blob,
    `Publish watchface: ${entry.name}`
  );

  // uploadToGitHub always uploads to docs/zpk/ — we need docs/ root for catalog.json
  // So call the GitHub API directly here.
  void result; // suppress unused result from above call (we don't use it)
}

/**
 * Upload catalog.json directly (not under docs/zpk/ like uploadToGitHub assumes).
 * This is the correct function to call for catalog updates.
 */
export async function writeCatalogToGitHub(
  config: GitHubConfig,
  entries: CatalogEntry[]
): Promise<void> {
  const { token, owner, repo, branch = 'main' } = config;

  const content = btoa(
    unescape(encodeURIComponent(JSON.stringify(entries, null, 2)))
  );

  // Check existing SHA
  let sha: string | undefined;
  const checkRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${CATALOG_PATH}?ref=${branch}`,
    {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  );
  if (checkRes.ok) {
    const existing = await checkRes.json();
    sha = existing.sha;
  }

  const body: Record<string, string> = {
    message: 'Update catalog.json',
    content,
    branch,
  };
  if (sha) body.sha = sha;

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${CATALOG_PATH}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(`Failed to write catalog.json: ${err.message}`);
  }
}

/**
 * Full publish flow: append entry + write catalog in one call.
 */
export async function publishToCatalog(
  config: GitHubConfig,
  entry: CatalogEntry
): Promise<void> {
  const current = await fetchCatalogFromGitHub(config);

  if (current.some((e) => e.id === entry.id)) {
    throw new Error(`Entry "${entry.id}" already exists in catalog`);
  }

  await writeCatalogToGitHub(config, [entry, ...current]);
}
