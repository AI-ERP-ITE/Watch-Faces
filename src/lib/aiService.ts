// AI Vision Service — Gemini 2.0 Flash (primary) + GPT-4o (fallback)
// Analyzes watchface images and returns WatchFaceElement[] for the V2 generator

import { WATCHFACE_SYSTEM_PROMPT, WATCHFACE_USER_PROMPT, type WatchfaceAnalysisResult } from './watchfacePrompt';
import type { WatchFaceElement } from '../types';

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
      // Find last complete object (ends with })
      const lastCompleteObj = fixed.lastIndexOf('}');
      if (lastCompleteObj > 0) {
        fixed = fixed.slice(0, lastCompleteObj + 1);
        // Remove any trailing commas before we close brackets
        fixed = fixed.replace(/,\s*$/, '');
        // Count unclosed brackets and close them in correct order
        const stack: string[] = [];
        for (const ch of fixed) {
          if (ch === '{') stack.push('}');
          else if (ch === '[') stack.push(']');
          else if (ch === '}' || ch === ']') stack.pop();
        }
        // Close in reverse order (innermost first)
        fixed += stack.reverse().join('');
      }
      parsed = JSON.parse(fixed);
      console.warn('[AI] Recovered truncated JSON response, elements:', (parsed.elements as unknown[])?.length);
    } catch (e2) {
      throw new Error(`Failed to parse AI response as JSON. Recovery also failed: ${(e2 as Error).message}. Raw response: ${text.slice(0, 500)}`);
    }
  }

  if (!parsed.elements || !Array.isArray(parsed.elements)) {
    throw new Error('AI response missing "elements" array');
  }

  // Validate and fix elements
  const elements: WatchFaceElement[] = (parsed.elements as Record<string, unknown>[]).map((el, i) => 
    validateElement(el, i)
  );

  return {
    elements,
    designDescription: (parsed.designDescription as string) || 'Watchface design',
    dominantColors: (parsed.dominantColors as string[]) || ['#FFFFFF', '#000000'],
    hasAnalogHands: (parsed.hasAnalogHands as boolean) ?? false,
    hasDigitalTime: (parsed.hasDigitalTime as boolean) ?? false,
    detectedComplications: (parsed.detectedComplications as string[]) || [],
  };
}

// Validate a single element from AI output, fixing common issues
function validateElement(raw: Record<string, unknown>, index: number): WatchFaceElement {
  const validTypes = ['TIME_POINTER', 'IMG_LEVEL', 'TEXT', 'IMG', 'ARC_PROGRESS', 'CIRCLE', 'TEXT_IMG', 'BUTTON', 'IMG_STATUS'] as const;
  
  const type = validTypes.includes(raw.type as typeof validTypes[number]) 
    ? (raw.type as typeof validTypes[number])
    : 'IMG';
  
  const bounds = raw.bounds as { x?: number; y?: number; width?: number; height?: number } || {};

  const element: WatchFaceElement = {
    id: (raw.id as string) || `el_${index + 1}`,
    type,
    name: (raw.name as string) || `Element ${index + 1}`,
    bounds: {
      x: clamp(bounds.x ?? 0, 0, 480),
      y: clamp(bounds.y ?? 0, 0, 480),
      width: clamp(bounds.width ?? 50, 1, 480),
      height: clamp(bounds.height ?? 50, 1, 480),
    },
    visible: true,
    zIndex: (raw.zIndex as number) ?? index,
  };

  // Copy optional fields based on type
  if (raw.src) element.src = raw.src as string;
  if (raw.color) element.color = raw.color as string;
  if (raw.dataType) element.dataType = raw.dataType as string;
  if (raw.text !== undefined) element.text = raw.text as string;
  if (raw.fontSize) element.fontSize = raw.fontSize as number;

  // TIME_POINTER
  if (type === 'TIME_POINTER') {
    const center = raw.center as { x?: number; y?: number };
    element.center = { x: center?.x ?? 240, y: center?.y ?? 240 };
    element.hourHandSrc = (raw.hourHandSrc as string) || 'hour_hand.png';
    element.minuteHandSrc = (raw.minuteHandSrc as string) || 'minute_hand.png';
    element.secondHandSrc = (raw.secondHandSrc as string) || 'second_hand.png';
    element.coverSrc = (raw.coverSrc as string) || 'hand_cover.png';
    element.hourPos = asXY(raw.hourPos, 11, 70);
    element.minutePos = asXY(raw.minutePos, 8, 100);
    element.secondPos = asXY(raw.secondPos, 3, 120);
  }

  // ARC_PROGRESS
  if (type === 'ARC_PROGRESS') {
    const center = raw.center as { x?: number; y?: number };
    element.center = { x: center?.x ?? 240, y: center?.y ?? 240 };
    element.radius = (raw.radius as number) || 40;
    element.startAngle = (raw.startAngle as number) ?? -90;
    element.endAngle = (raw.endAngle as number) ?? 270;
    element.lineWidth = (raw.lineWidth as number) || 6;
  }

  // TEXT_IMG
  if (type === 'TEXT_IMG') {
    element.fontArray = (raw.fontArray as string[]) || [];
    element.hSpace = (raw.hSpace as number) ?? 1;
    element.alignH = (raw.alignH as string) || 'CENTER_H';
  }

  // BUTTON
  if (type === 'BUTTON') {
    element.normalSrc = (raw.normalSrc as string) || 'trasparente.png';
    element.pressSrc = (raw.pressSrc as string) || 'trasparente.png';
    element.clickAction = (raw.clickAction as string) || '';
  }

  // IMG_STATUS
  if (type === 'IMG_STATUS') {
    element.statusType = (raw.statusType as string) || 'DISCONNECT';
  }

  // CIRCLE
  if (type === 'CIRCLE') {
    const center = raw.center as { x?: number; y?: number };
    element.center = { x: center?.x ?? 240, y: center?.y ?? 240 };
    element.radius = (raw.radius as number) || 50;
  }

  // IMG_LEVEL
  if (type === 'IMG_LEVEL') {
    element.images = (raw.images as string[]) || [];
  }

  return element;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function asXY(val: unknown, defaultX: number, defaultY: number): { x: number; y: number } {
  const obj = val as { x?: number; y?: number } | undefined;
  return { x: obj?.x ?? defaultX, y: obj?.y ?? defaultY };
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
