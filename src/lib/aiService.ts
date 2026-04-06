// AI Vision Service — Gemini 2.0 Flash (primary) + GPT-4o (fallback)
// Analyzes watchface images and returns WatchFaceElement[] for the V2 generator

import { WATCHFACE_SYSTEM_PROMPT, WATCHFACE_USER_PROMPT, type WatchfaceAnalysisResult } from './watchfacePrompt';

export type AIProvider = 'gemini' | 'openai';

export interface AIServiceConfig {
  provider: AIProvider;
  apiKey: string;
}

// ==================== GEMINI 2.0 FLASH ====================

async function analyzeWithGemini(
  apiKey: string,
  designImageBase64: string,
  designMimeType: string,
): Promise<WatchfaceAnalysisResult> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        parts: [
          { text: WATCHFACE_SYSTEM_PROMPT },
          {
            inline_data: {
              mime_type: designMimeType,
              data: designImageBase64,
            },
          },
          { text: WATCHFACE_USER_PROMPT },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      topP: 0.8,
      maxOutputTokens: 65536,
      responseMimeType: 'application/json',
      thinkingConfig: {
        thinkingBudget: 0,
      },
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  
  // Check for truncation
  const finishReason = data.candidates?.[0]?.finishReason;
  if (finishReason === 'MAX_TOKENS') {
    console.warn('[Gemini] Response truncated due to MAX_TOKENS');
  }
  
  // Gemini 2.5 may return thinking + text parts — get the last text part
  const parts = data.candidates?.[0]?.content?.parts || [];
  const textPart = parts.filter((p: Record<string, unknown>) => p.text).pop();
  const text = textPart?.text;
  if (!text) {
    throw new Error('Gemini returned empty response. finishReason: ' + finishReason);
  }

  return parseAIResponse(text);
}

// ==================== OPENAI GPT-4o ====================

async function analyzeWithOpenAI(
  apiKey: string,
  designImageBase64: string,
  designMimeType: string,
): Promise<WatchfaceAnalysisResult> {
  const url = 'https://api.openai.com/v1/chat/completions';

  const requestBody = {
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: WATCHFACE_SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: `data:${designMimeType};base64,${designImageBase64}`,
              detail: 'high',
            },
          },
          {
            type: 'text',
            text: WATCHFACE_USER_PROMPT,
          },
        ],
      },
    ],
    max_tokens: 8192,
    temperature: 0.1,
    response_format: { type: 'json_object' },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error('OpenAI returned empty response');
  }

  return parseAIResponse(text);
}

// ==================== RESPONSE PARSING ====================

function parseAIResponse(rawText: string): WatchfaceAnalysisResult {
  // Strip markdown fences if present
  let text = rawText.trim();
  if (text.startsWith('```json')) {
    text = text.slice(7);
  } else if (text.startsWith('```')) {
    text = text.slice(3);
  }
  if (text.endsWith('```')) {
    text = text.slice(0, -3);
  }
  text = text.trim();

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(text);
  } catch {
    // Try to recover truncated JSON by closing open arrays/objects
    let fixed = text;
    try {
      const lastCompleteObj = fixed.lastIndexOf('}');
      if (lastCompleteObj > 0) {
        fixed = fixed.slice(0, lastCompleteObj + 1);
        fixed = fixed.replace(/,\s*$/, '');
        const stack: string[] = [];
        for (const ch of fixed) {
          if (ch === '{') stack.push('}');
          else if (ch === '[') stack.push(']');
          else if (ch === '}' || ch === ']') stack.pop();
        }
        fixed += stack.reverse().join('');
      }
      parsed = JSON.parse(fixed);
      console.warn('[AI] Recovered truncated JSON response');
    } catch (e2) {
      throw new Error(`Failed to parse AI response as JSON. Recovery also failed: ${(e2 as Error).message}. Raw response: ${text.slice(0, 500)}`);
    }
  }

  // Validate required fields for the simplified analysis format
  if (!parsed.time || typeof parsed.time !== 'object') {
    throw new Error('AI response missing "time" object');
  }

  const complications = Array.isArray(parsed.complications) ? parsed.complications : [];

  return {
    designDescription: (parsed.designDescription as string) || 'Watchface design',
    dominantColors: Array.isArray(parsed.dominantColors) ? (parsed.dominantColors as string[]) : ['#FFFFFF', '#000000'],
    time: parsed.time as WatchfaceAnalysisResult['time'],
    date: parsed.date as WatchfaceAnalysisResult['date'],
    month: parsed.month as WatchfaceAnalysisResult['month'],
    weekday: parsed.weekday as WatchfaceAnalysisResult['weekday'],
    complications: complications as WatchfaceAnalysisResult['complications'],
    statusIcons: Array.isArray(parsed.statusIcons) ? (parsed.statusIcons as WatchfaceAnalysisResult['statusIcons']) : undefined,
  };
}

// ==================== PUBLIC API ====================

// Convert a File to base64 string
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      // Strip the data:mime;base64, prefix
      const base64 = dataUrl.split(',')[1];
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export async function analyzeWatchfaceImage(
  config: AIServiceConfig,
  designFile: File,
): Promise<WatchfaceAnalysisResult> {
  const mimeType = designFile.type || 'image/png';
  const base64Data = await fileToBase64(designFile);

  switch (config.provider) {
    case 'gemini':
      return analyzeWithGemini(config.apiKey, base64Data, mimeType);
    case 'openai':
      return analyzeWithOpenAI(config.apiKey, base64Data, mimeType);
    default:
      throw new Error(`Unknown AI provider: ${config.provider}`);
  }
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
