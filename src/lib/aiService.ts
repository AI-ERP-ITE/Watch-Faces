// AI Service — Shared types and API key validation utility

export type AIProvider = 'gemini' | 'openai';

export interface AIServiceConfig {
  provider: AIProvider;
  apiKey: string;
}

// Test if an API key is valid by making a minimal request
export async function testApiKey(config: AIServiceConfig): Promise<boolean> {
  try {
    if (config.provider === 'gemini') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${config.apiKey}`;
      const response = await fetch(url);
      return response.ok;
    } else if (config.provider === 'openai') {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: { 'Authorization': `Bearer ${config.apiKey}` },
      });
      return response.ok;
    }
    return false;
  } catch {
    return false;
  }
}
