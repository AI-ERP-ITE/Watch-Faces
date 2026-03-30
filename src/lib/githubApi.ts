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
  const { token, owner, repo, branch = 'main' } = config;
  
  try {
    console.log('[GitHub] Starting upload...');
    
    // Convert content to base64
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
    const existingFile = await getFileSha(config, filename);
    
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
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${filename}`,
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
    const pagesUrl = `https://${owner}.github.io/${repo}/${filename}`;
    
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
  const { token, owner, repo, branch = 'main' } = config;
  
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${filename}?ref=${branch}`,
      {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );
    
    if (response.status === 404) {
      return null; // File doesn't exist
    }
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    return { sha: data.sha };
  } catch {
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
