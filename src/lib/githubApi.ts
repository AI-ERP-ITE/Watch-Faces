// GitHub API Integration for uploading ZPK files

import type { GitHubUploadResult } from '@/types';

export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
  branch?: string;
}

const MAX_FILE_SIZE = 6 * 1024 * 1024; // 6MB limit for GitHub API

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
    
    // Skip repo verification for now - go directly to upload
    console.log('[GitHub] Proceeding with file upload to:', `${owner}/${repo}`);
    
    // Upload to docs/zpk/ folder so it's accessible via GitHub Pages
    const filepath = `docs/zpk/${filename}`;
    console.log('[GitHub] Upload path:', filepath);
    
    let base64Content: string;
    let contentSize: number;
    
    if (content instanceof Blob) {
      contentSize = content.size;
      console.log('[GitHub] File size:', contentSize, 'bytes');
      
      if (contentSize > MAX_FILE_SIZE) {
        console.warn(`[GitHub] File size (${contentSize}) exceeds single upload limit (${MAX_FILE_SIZE}). File may need to be split.`);
      }
      
      console.log('[GitHub] Converting blob to base64...');
      const arrayBuffer = await content.arrayBuffer();
      base64Content = arrayBufferToBase64(arrayBuffer);
      console.log('[GitHub] Base64 conversion complete, length:', base64Content.length);
    } else {
      contentSize = content.length;
      base64Content = btoa(content);
    }
    
    // Check if file already exists (to get SHA for update)
    console.log('[GitHub] Checking if file exists...');
    const existingFile = await getFileSha(config, filepath);
    if (existingFile) {
      console.log('[GitHub] File exists, will update (SHA:', existingFile.sha.substring(0, 8), '...')
    } else {
      console.log('[GitHub] File does not exist, will create new');
    }
    
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
      console.error('[GitHub] Upload failed with status:', response.status);
      const errorData = await response.json();
      const errorMsg = errorData.message || `HTTP ${response.status}: ${response.statusText}`;
      
      if (response.status === 413) {
        throw new Error(`File too large (${contentSize} bytes). Max: ${MAX_FILE_SIZE} bytes. Consider splitting the upload.`);
      }
      if (response.status === 422) {
        throw new Error(`Invalid file upload: ${errorMsg}. The file may be corrupted or in wrong format.`);
      }
      if (response.status === 401) {
        throw new Error('GitHub token is invalid or expired.');
      }
      
      throw new Error(`Upload failed: ${errorMsg}`);
    }
    
    const data = await response.json();
    console.log('[GitHub] Upload successful!');
    
    // Construct GitHub Pages URL
    // GitHub Pages serves docs/ folder at root: https://owner.github.io/repo/
    // So docs/zpk/file.zpk is accessible at: https://owner.github.io/repo/zpk/file.zpk
    const pagesUrl = `https://${owner}.github.io/${repo}/zpk/${filename}`;
    console.log('[GitHub] File uploaded to:', filepath);
    console.log('[GitHub] Accessible at:', pagesUrl);
    
    // Verify the file is accessible on GitHub Pages with retry logic
    // GitHub Pages can take 1-2 minutes to deploy new files
    console.log('[GitHub] Verifying file on GitHub Pages (waiting up to 2 minutes)...');
    const maxRetries = 8;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Wait before checking
        if (attempt > 1) {
          const waitTime = 15000; // 15 seconds between retries
          console.log(`[GitHub] Attempt ${attempt}/${maxRetries} - waiting ${waitTime/1000}s before checking...`);
          await new Promise(r => setTimeout(r, waitTime));
        }
        
        const verifyResponse = await fetch(pagesUrl, { method: 'HEAD', redirect: 'follow' });
        const status = verifyResponse.status;
        console.log(`[GitHub] [${attempt}/${maxRetries}] GitHub Pages status: ${status}`);
        
        if (verifyResponse.ok) {
          console.log('[GitHub] ✓ File successfully accessible at GitHub Pages URL');
          break; // Success, exit loop
        } else if (attempt === maxRetries) {
          console.warn('[GitHub] ⚠ File verification incomplete after 2 minutes. GitHub Pages may need more time.');
          console.warn('[GitHub] The file has been uploaded. It should be accessible within a few minutes.');
        }
      } catch (verifyError) {
        console.warn(`[GitHub] [${attempt}/${maxRetries}] Error checking file:`, verifyError);
        if (attempt === maxRetries) {
          console.warn('[GitHub] Could not verify GitHub Pages access. File may still be deploying.');
        }
      }
    }
    
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
