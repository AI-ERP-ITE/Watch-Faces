// GitHub API Integration for uploading ZPK files

import type { GitHubUploadResult } from '@/types';

export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
  branch?: string;
}

// Convert ArrayBuffer to base64 in chunks to avoid stack overflow
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000; // 32KB chunks
  let binary = '';
  
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  
  return btoa(binary);
}

// Upload file to GitHub repository
export async function uploadToGitHub(
  config: GitHubConfig,
  filename: string,
  content: Blob | string,
  message?: string
): Promise<GitHubUploadResult> {
  const { token, owner, repo, branch = 'master' } = config;
  
  try {
    // Validate parameters
    if (!token || !token.trim()) {
      throw new Error('GitHub token is missing');
    }
    if (!owner || !owner.trim()) {
      throw new Error('GitHub owner is missing');
    }
    if (!repo || !repo.trim()) {
      throw new Error('GitHub repo is missing');
    }

    console.log('[GitHub] Starting upload...');
    console.log('[GitHub] Config:', { owner, repo, branch, filename });
    
    // Upload to docs/zpk/ folder so it's accessible via GitHub Pages
    const filepath = `docs/zpk/${filename}`;
    console.log('[GitHub] Upload path:', filepath);
    let base64Content: string;
    if (content instanceof Blob) {
      console.log('[GitHub] Converting blob to base64, size:', content.size);
      const arrayBuffer = await content.arrayBuffer();
      base64Content = arrayBufferToBase64(arrayBuffer);
      console.log('[GitHub] Base64 conversion complete, length:', base64Content.length);
    } else {
      base64Content = btoa(content);
    }
    
    // Check if file already exists (to get SHA for update)
    console.log('[GitHub] Checking if file exists...');
    const existingFile = await getFileSha(config, filepath);
    
    // Prepare request body
    const body: Record<string, string> = {
      message: message || `Upload watch face: ${filename}`,
      content: base64Content,
      branch,
    };
    
    if (existingFile) {
      body.sha = existingFile.sha;
    }
    
    // Upload file
    console.log('[GitHub] Uploading to GitHub API...');
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filepath}`;
    console.log('[GitHub] API URL:', apiUrl);
    
    const response = await fetch(
      apiUrl,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    
    const data = await response.json();
    console.log('[GitHub] Upload successful!');
    
    // Construct GitHub Pages URL
    // GitHub Pages serves docs/ folder at root: https://owner.github.io/repo/
    // So docs/zpk/file.zpk is accessible at: https://owner.github.io/repo/zpk/file.zpk
    const pagesUrl = `https://${owner}.github.io/${repo}/zpk/${filename}`;
    console.log('[GitHub] File uploaded to:', filepath);
    console.log('[GitHub] Accessible at:', pagesUrl);
    
    return {
      success: true,
      url: data.content.html_url,
      downloadUrl: pagesUrl,
    };
  } catch (error) {
    console.error('[GitHub] Upload failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Get file SHA (for updating existing files)
async function getFileSha(
  config: GitHubConfig,
  filename: string
): Promise<{ sha: string } | null> {
  const { token, owner, repo, branch = 'master' } = config;
  
  try {
    if (!owner || !repo) {
      console.warn('[GitHub] Invalid owner or repo for getFileSha, skipping SHA check');
      return null;
    }

    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filename}?ref=${branch}`;
    console.log('[GitHub] Checking file SHA at:', apiUrl);
    
    const response = await fetch(
      apiUrl,
      {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );
    
    console.log('[GitHub] File check response status:', response.status);
    
    if (response.status === 404) {
      console.log('[GitHub] File does not exist (404), will create new');
      return null; // File doesn't exist
    }
    
    if (!response.ok) {
      console.warn(`[GitHub] File check failed with status ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    console.log('[GitHub] Existing file found, SHA:', data.sha);
    return { sha: data.sha };
  } catch (error) {
    console.error('[GitHub] Error checking file SHA:', error);
    return null;
  }
}

// Test GitHub connection
export async function testGitHubConnection(config: GitHubConfig): Promise<boolean> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${config.owner}/${config.repo}`,
      {
        headers: {
          'Authorization': `token ${config.token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );
    
    return response.ok;
  } catch {
    return false;
  }
}

// Get repository info
export async function getRepoInfo(config: GitHubConfig): Promise<{
  name: string;
  description: string;
  html_url: string;
  has_pages: boolean;
} | null> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${config.owner}/${config.repo}`,
      {
        headers: {
          'Authorization': `token ${config.token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );
    
    if (!response.ok) return null;
    
    return await response.json();
  } catch {
    return null;
  }
}

// List files in repository
export async function listFiles(
  config: GitHubConfig,
  path: string = ''
): Promise<string[]> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}`,
      {
        headers: {
          'Authorization': `token ${config.token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );
    
    if (!response.ok) return [];
    
    const data = await response.json();
    return data
      .filter((item: { type: string }) => item.type === 'file')
      .map((item: { name: string }) => item.name);
  } catch {
    return [];
  }
}
