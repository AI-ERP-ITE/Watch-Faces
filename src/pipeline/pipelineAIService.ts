// Pipeline AI Service — Wraps the AI vision API to return AIElement[] using the pipeline prompt contract.
// This replaces the old analyzeWatchfaceImage + expandAnalysisToElements flow.

import type { AIElement, AIExtractionResult, AIBounds, AICenter, NormalizedElement, Representation, LayoutMode, Group } from '@/types/pipeline';
import {
  AI_SYSTEM_PROMPT, AI_USER_PROMPT,
  STAGE_B_SYSTEM_PROMPT, STAGE_B_USER_PROMPT_TEMPLATE, STAGE_B_RESPONSE_SCHEMA,
  CALL_3_SYSTEM_PROMPT, CALL_3_USER_PROMPT_TEMPLATE,
} from './aiPrompt';

export type PipelineAIProvider = 'gemini' | 'openai';

export interface PipelineAIConfig {
  provider: PipelineAIProvider;
  apiKey: string;
}

// ─── Retry Config for Transient Errors ──────────────────────────────────────────

const MAX_RETRIES = 3;
const RETRY_BASE_MS = 1000;                    // 1s → 2s → 4s
const RETRYABLE_STATUS = new Set([429, 503]);  // Rate limit + Unavailable only

async function fetchWithRetry(
  url: string,
  init: RequestInit,
  label: string,
): Promise<Response> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const response = await fetch(url, init);

    if (response.ok) return response;

    // Non-retryable error — fail immediately
    if (!RETRYABLE_STATUS.has(response.status)) {
      const errorText = await response.text();
      throw new Error(`${label} (${response.status}): ${errorText}`);
    }

    // Last attempt — don't wait, just fail
    if (attempt === MAX_RETRIES) {
      const errorText = await response.text();
      throw new Error(`${label} (${response.status}) after ${MAX_RETRIES} retries: ${errorText}`);
    }

    // Exponential backoff: 1s, 2s, 4s
    const delay = RETRY_BASE_MS * Math.pow(2, attempt - 1);
    console.warn(`[${label}] ${response.status} — retrying (${attempt}/${MAX_RETRIES}) in ${delay}ms...`);
    await new Promise(r => setTimeout(r, delay));
  }

  // Unreachable, but TypeScript needs it
  throw new Error(`${label}: retry loop exhausted`);
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
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const response = await fetchWithRetry(url, {
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
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
        thinkingConfig: { thinkingBudget: 0 },
      },
    }),
  }, 'Gemini API error');

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

const VALID_REPRESENTATIONS = new Set<Representation>(['text', 'arc', 'icon', 'text+icon', 'text+arc', 'number']);
const VALID_LAYOUT_MODES = new Set<LayoutMode>(['row', 'arc', 'standalone', 'grid']);
const VALID_GROUPS = new Set<Group>([
  'center', 'top', 'bottom', 'left_panel', 'right_panel',
  'top_left', 'top_right', 'bottom_left', 'bottom_right',
]);

/** Map legacy region values to the closest Group for backward compat with older AI responses. */
const REGION_TO_GROUP: Record<string, Group> = {
  center: 'center',
  top: 'top',
  bottom: 'bottom',
  left: 'left_panel',
  right: 'right_panel',
};

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

  const result = parsed as { elements: Record<string, unknown>[] };

  if (!Array.isArray(result.elements)) {
    throw new Error('AI response "elements" is not an array');
  }

  // Validate and coerce each element to the new AIElement shape
  const elements: AIElement[] = result.elements.map((el) => {
    if (!el.id || !el.type) {
      throw new Error(`AI element missing required id or type: ${JSON.stringify(el).slice(0, 100)}`);
    }

    // Coerce legacy region → group if group is missing
    let group = el.group as string | undefined;
    if (!group && el.region && typeof el.region === 'string') {
      group = REGION_TO_GROUP[el.region] ?? 'center';
    }
    if (!group || !VALID_GROUPS.has(group as Group)) {
      group = 'center'; // safe fallback
    }

    // Coerce representation — default to 'text' if missing (safest fallback)
    let representation = el.representation as string | undefined;
    if (!representation || !VALID_REPRESENTATIONS.has(representation as Representation)) {
      representation = 'text';
    }

    // Coerce layout — default to 'standalone' if missing
    let layout = el.layout as string | undefined;
    if (!layout || !VALID_LAYOUT_MODES.has(layout as LayoutMode)) {
      layout = 'standalone';
    }

    return {
      id: el.id as string,
      type: el.type as AIElement['type'],
      representation: representation as Representation,
      layout: layout as LayoutMode,
      group: group as Group,
      importance: el.importance as AIElement['importance'],
      style: el.style as AIElement['style'],
      confidence: typeof el.confidence === 'number' ? el.confidence : undefined,
      region: el.region as AIElement['region'],
      // ── Geometry fields ──────────────────────────────────────────────────
      bounds: parseBounds(el.bounds),
      center: parseCenter(el.center),
      radius: typeof el.radius === 'number' ? el.radius : undefined,
      startAngle: typeof el.startAngle === 'number' ? el.startAngle : undefined,
      endAngle: typeof el.endAngle === 'number' ? el.endAngle : undefined,
    };
  });

  return { elements };
}

/** Parse and validate bounds object from AI response. */
function parseBounds(raw: unknown): AIBounds | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const b = raw as Record<string, unknown>;
  if (typeof b.x !== 'number' || typeof b.y !== 'number' ||
      typeof b.w !== 'number' || typeof b.h !== 'number') {
    return undefined;
  }
  return { x: b.x, y: b.y, w: b.w, h: b.h };
}

/** Parse and validate center object from AI response. */
function parseCenter(raw: unknown): AICenter | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const c = raw as Record<string, unknown>;
  if (typeof c.x !== 'number' || typeof c.y !== 'number') return undefined;
  return { x: c.x, y: c.y };
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

// ═══════════════════════════════════════════════════════════════════════════════
// Stage B: AI Normalization — Text-only call (no image), uses cheaper model.
// Maps fuzzy AI types → concrete Zepp OS widgets + resolves ambiguities.
// ═══════════════════════════════════════════════════════════════════════════════

/** Cheaper Gemini model for text-only normalization (no image tokens). */
const GEMINI_TEXT_MODEL = 'gemini-2.0-flash';

/**
 * Stage B AI call: Normalize AI elements → Zepp OS widgets.
 * Text-only (no image sent). Uses cheaper model.
 */
export async function normalizeWithAI(
  config: PipelineAIConfig,
  elements: AIElement[],
): Promise<NormalizedElement[]> {
  const inputJson = JSON.stringify({ elements }, null, 2);
  const userPrompt = STAGE_B_USER_PROMPT_TEMPLATE(inputJson);

  let rawJson: string;

  switch (config.provider) {
    case 'gemini':
      rawJson = await callGeminiText(config.apiKey, STAGE_B_SYSTEM_PROMPT, userPrompt, STAGE_B_RESPONSE_SCHEMA);
      break;
    case 'openai':
      rawJson = await callOpenAIText(config.apiKey, STAGE_B_SYSTEM_PROMPT, userPrompt);
      break;
    default:
      throw new Error(`Unknown AI provider: ${config.provider}`);
  }

  return parseStageBResponse(rawJson);
}

/**
 * Call 3: Resolve ambiguities for ARC_PROGRESS elements missing dataType.
 * Only called when Stage B output still has unresolved arcs.
 */
export async function resolveAmbiguities(
  config: PipelineAIConfig,
  elements: NormalizedElement[],
): Promise<NormalizedElement[]> {
  const inputJson = JSON.stringify({ elements }, null, 2);
  const userPrompt = CALL_3_USER_PROMPT_TEMPLATE(inputJson);

  let rawJson: string;

  switch (config.provider) {
    case 'gemini':
      rawJson = await callGeminiText(config.apiKey, CALL_3_SYSTEM_PROMPT, userPrompt, STAGE_B_RESPONSE_SCHEMA);
      break;
    case 'openai':
      rawJson = await callOpenAIText(config.apiKey, CALL_3_SYSTEM_PROMPT, userPrompt);
      break;
    default:
      throw new Error(`Unknown AI provider: ${config.provider}`);
  }

  return parseStageBResponse(rawJson);
}

// ─── Text-Only Gemini Call (Stage B / Call 3) ───────────────────────────────────

async function callGeminiText(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  responseSchema?: object,
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_TEXT_MODEL}:generateContent?key=${apiKey}`;

  const generationConfig: Record<string, unknown> = {
    temperature: 0.1,
    maxOutputTokens: 4096,
    responseMimeType: 'application/json',
  };

  if (responseSchema) {
    generationConfig.responseSchema = responseSchema;
  }

  const response = await fetchWithRetry(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ parts: [{ text: userPrompt }] }],
      generationConfig,
    }),
  }, 'Gemini text API error');

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Empty response from Gemini (text call)');
  }
  return text;
}

// ─── Text-Only OpenAI Call (Stage B / Call 3) ───────────────────────────────────

async function callOpenAIText(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.1,
      max_tokens: 2048,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI text API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error('Empty response from OpenAI (text call)');
  }
  return text;
}

// ─── Stage B Response Parser ────────────────────────────────────────────────────

function parseStageBResponse(rawJson: string): NormalizedElement[] {
  let cleaned = rawJson.trim();

  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`Failed to parse Stage B response as JSON: ${cleaned.slice(0, 200)}`);
  }

  if (typeof parsed !== 'object' || parsed === null || !('elements' in parsed)) {
    throw new Error('Stage B response missing "elements" array');
  }

  const result = parsed as { elements: Record<string, unknown>[] };

  if (!Array.isArray(result.elements)) {
    throw new Error('Stage B "elements" is not an array');
  }

  // Coerce each element — Stage B may still return region instead of group until T006
  return result.elements.map((el): NormalizedElement => {
    let group = el.group as string | undefined;
    if (!group && el.region && typeof el.region === 'string') {
      group = REGION_TO_GROUP[el.region] ?? 'center';
    }
    if (!group || !VALID_GROUPS.has(group as Group)) {
      group = 'center';
    }

    let layout = el.layout as string | undefined;
    if (!layout || !VALID_LAYOUT_MODES.has(layout as LayoutMode)) {
      layout = 'standalone';
    }

    return {
      id: el.id as string,
      widget: el.widget as NormalizedElement['widget'],
      group: group as Group,
      layout: layout as LayoutMode,
      sourceType: el.sourceType as NormalizedElement['sourceType'],
      dataType: el.dataType as string | undefined,
      parentId: el.parentId as string | undefined,
      region: el.region as NormalizedElement['region'],
    };
  });
}
