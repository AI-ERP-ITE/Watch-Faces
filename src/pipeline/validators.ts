// Pipeline Validators — Gate-keepers between stages.
// Reject any data that violates the pipeline contract.

import type { AIElement, NormalizedElement, LayoutElement, GeometryElement, Representation, LayoutMode, Group } from '@/types/pipeline';
import { PipelineValidationError } from '@/types/pipeline';

// ─── Constants ──────────────────────────────────────────────────────────────────

const VALID_AI_TYPES = new Set([
  'time', 'date', 'steps', 'battery', 'heart_rate', 'arc', 'text',
  'weather', 'spo2', 'calories', 'distance', 'weekday', 'month',
]);

const VALID_REPRESENTATIONS = new Set<Representation>([
  'text', 'arc', 'icon', 'text+icon', 'text+arc', 'number',
]);

const VALID_LAYOUT_MODES = new Set<LayoutMode>([
  'row', 'arc', 'standalone', 'grid',
]);

const VALID_GROUPS = new Set<Group>([
  'center', 'top', 'bottom', 'left_panel', 'right_panel',
  'top_left', 'top_right', 'bottom_left', 'bottom_right',
]);

const VALID_WIDGETS = new Set([
  'TIME_POINTER', 'IMG_TIME', 'IMG_DATE', 'IMG_WEEK', 'ARC_PROGRESS',
  'TEXT', 'TEXT_IMG', 'IMG', 'IMG_STATUS', 'IMG_LEVEL',
]);

const MAX_ELEMENTS = 20;

// ─── Representation Validation Helper ───────────────────────────────────────────

/** Validate that a representation value is from the allowed set. */
export function validateRepresentation(value: unknown, prefix: string): string | null {
  if (!value || typeof value !== 'string') {
    return `${prefix}: missing 'representation'`;
  }
  if (!VALID_REPRESENTATIONS.has(value as Representation)) {
    return `${prefix}: invalid representation '${value}'`;
  }
  return null;
}

// ─── Stage 0 Validator: AI Extraction Output ────────────────────────────────────

export function validateAIOutput(elements: AIElement[]): void {
  const violations: string[] = [];

  if (!Array.isArray(elements)) {
    throw new PipelineValidationError('AI', ['Input is not an array']);
  }

  if (elements.length === 0) {
    violations.push('Elements array is empty');
  }

  if (elements.length > MAX_ELEMENTS) {
    violations.push(`Too many elements: ${elements.length} (max ${MAX_ELEMENTS})`);
  }

  const seenIds = new Set<string>();

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    const prefix = `elements[${i}]`;

    // Type guard
    if (typeof el !== 'object' || el === null) {
      violations.push(`${prefix}: not an object`);
      continue;
    }

    // Required fields
    if (!el.id || typeof el.id !== 'string') {
      violations.push(`${prefix}: missing or invalid 'id'`);
    } else if (seenIds.has(el.id)) {
      violations.push(`${prefix}: duplicate id '${el.id}'`);
    } else {
      seenIds.add(el.id);
    }

    if (!VALID_AI_TYPES.has(el.type)) {
      violations.push(`${prefix}: unknown type '${el.type}'`);
    }

    // Representation (required)
    const repError = validateRepresentation(el.representation, prefix);
    if (repError) violations.push(repError);

    // Layout (required)
    if (!el.layout || !VALID_LAYOUT_MODES.has(el.layout)) {
      violations.push(`${prefix}: missing or invalid layout '${el.layout}'`);
    }

    // Group (required)
    if (!el.group || !VALID_GROUPS.has(el.group)) {
      violations.push(`${prefix}: missing or invalid group '${el.group}'`);
    }

    // Confidence clamp (optional field)
    if (el.confidence !== undefined) {
      if (typeof el.confidence !== 'number' || el.confidence < 0 || el.confidence > 1) {
        violations.push(`${prefix}: confidence must be a number between 0 and 1`);
      }
    }
  }

  if (violations.length > 0) {
    throw new PipelineValidationError('AI', violations);
  }
}

// ─── Stage 1 Validator: Normalized Elements ─────────────────────────────────────

export function validateNormalized(elements: NormalizedElement[]): void {
  const violations: string[] = [];

  if (!Array.isArray(elements) || elements.length === 0) {
    throw new PipelineValidationError('Normalizer', ['Empty or invalid normalized array']);
  }

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    const prefix = `elements[${i}]`;

    if (!el.id || typeof el.id !== 'string') {
      violations.push(`${prefix}: missing or invalid 'id'`);
    }

    if (!VALID_WIDGETS.has(el.widget)) {
      violations.push(`${prefix}: unknown widget '${el.widget}'`);
    }

    if (!el.group || !VALID_GROUPS.has(el.group)) {
      violations.push(`${prefix}: missing or invalid group '${el.group}'`);
    }

    if (!el.layout || !VALID_LAYOUT_MODES.has(el.layout)) {
      violations.push(`${prefix}: missing or invalid layout '${el.layout}'`);
    }
  }

  if (violations.length > 0) {
    throw new PipelineValidationError('Normalizer', violations);
  }
}

// ─── Stage 2 Validator: Layout Elements ─────────────────────────────────────────

export function validateLayout(elements: LayoutElement[]): void {
  const violations: string[] = [];

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    const prefix = `elements[${i}]`;

    if (typeof el.centerX !== 'number' || typeof el.centerY !== 'number') {
      violations.push(`${prefix}: missing centerX/centerY`);
    }

    if (el.centerX < 0 || el.centerX > 480 || el.centerY < 0 || el.centerY > 480) {
      violations.push(`${prefix}: centerX/centerY out of bounds (0-480)`);
    }
  }

  if (violations.length > 0) {
    throw new PipelineValidationError('Layout', violations);
  }
}

// ─── Stage 3 Validator: Geometry Elements ───────────────────────────────────────

export function validateGeometry(elements: GeometryElement[]): void {
  const violations: string[] = [];

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    const prefix = `elements[${i}]`;

    switch (el.widget) {
      case 'TIME_POINTER':
        if (el.hourPosX === undefined || el.hourPosY === undefined) {
          violations.push(`${prefix}: TIME_POINTER missing hourPosX/hourPosY`);
        }
        if (el.minutePosX === undefined || el.minutePosY === undefined) {
          violations.push(`${prefix}: TIME_POINTER missing minutePosX/minutePosY`);
        }
        if (el.secondPosX === undefined || el.secondPosY === undefined) {
          violations.push(`${prefix}: TIME_POINTER missing secondPosX/secondPosY`);
        }
        break;

      case 'ARC_PROGRESS':
        if (el.radius === undefined || el.radius <= 0) {
          violations.push(`${prefix}: ARC_PROGRESS missing or invalid radius`);
        }
        if (el.startAngle === undefined || el.endAngle === undefined) {
          violations.push(`${prefix}: ARC_PROGRESS missing start/end angles`);
        }
        break;

      case 'TEXT':
      case 'TEXT_IMG':
      case 'IMG':
      case 'IMG_DATE':
      case 'IMG_WEEK':
      case 'IMG_TIME':
      case 'IMG_STATUS':
      case 'IMG_LEVEL':
        if (el.x === undefined || el.y === undefined) {
          violations.push(`${prefix}: ${el.widget} missing x/y`);
        }
        break;
    }
  }

  if (violations.length > 0) {
    throw new PipelineValidationError('Geometry', violations);
  }
}
