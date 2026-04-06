// Pipeline AI Service — Wraps the AI vision API to return AIElement[] using the pipeline prompt contract.
// This replaces the old analyzeWatchfaceImage + expandAnalysisToElements flow.

import type { AIElement, AIExtractionResult } from '@/types/pipeline';
import { AI_SYSTEM_PROMPT, AI_USER_PROMPT } from './aiPrompt';

export type PipelineAIProvider = 'gemini' | 'openai';

export interface PipelineAIConfig {
  provider: PipelineAIProvider;
  apiKey: string;
}

/**
 * Send a watchface design image to the AI and get back semantic-only AIElement[].
 * Uses the strict pipeline prompt that forbids coordinates/sizes.
 */
export async function extractElementsFromImage(
  config: PipelineAIConfig,
  designFile: File,
): Promise<AIElement[]> {
  const mimeType = designFile.type || 'image/png';
  const base64Data = await fileToBase64(designFile);

  let rawJson: string;

  switch (config.provider) {
    case 'gemini':
      rawJson = await callGemini(config.apiKey, base64Data, mimeType);
      break;
    case 'openai':
      rawJson = await callOpenAI(config.apiKey, base64Data, mimeType);
      break;
    default:
      throw new Error(`Unknown AI provider: ${config.provider}`);
  }

  const parsed = parseResponse(rawJson);
  return parsed.elements;
}

// ─── Gemini API Call ────────────────────────────────────────────────────────────

async function callGemini(
  apiKey: string,
  base64Data: string,
  mimeType: string,
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: AI_SYSTEM_PROMPT }] },
      contents: [
        {
          parts: [
            { text: AI_USER_PROMPT },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Data,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Empty response from Gemini');
  }
  return text;
}

// ─── OpenAI API Call ────────────────────────────────────────────────────────────

async function callOpenAI(
  apiKey: string,
  base64Data: string,
  mimeType: string,
): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: AI_SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            { type: 'text', text: AI_USER_PROMPT },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Data}`,
                detail: 'high',
              },
            },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 2048,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error('Empty response from OpenAI');
  }
  return text;
}

// ─── Response Parser ────────────────────────────────────────────────────────────

function parseResponse(rawJson: string): AIExtractionResult {
  let cleaned = rawJson.trim();

  // Strip markdown fences if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`Failed to parse AI response as JSON: ${cleaned.slice(0, 200)}`);
  }

  if (typeof parsed !== 'object' || parsed === null || !('elements' in parsed)) {
    throw new Error('AI response missing "elements" array');
  }

  const result = parsed as AIExtractionResult;

  if (!Array.isArray(result.elements)) {
    throw new Error('AI response "elements" is not an array');
  }

  return result;
}

// ─── Utility ────────────────────────────────────────────────────────────────────

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip data:...;base64, prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
