// Pipeline Validators — Gate-keepers between stages.
// Reject any data that violates the pipeline contract.

import type { AIElement, NormalizedElement, GeometryElement } from '@/types/pipeline';
import { PipelineValidationError } from '@/types/pipeline';

// ─── Constants ──────────────────────────────────────────────────────────────────

const VALID_AI_TYPES = new Set([
  'time', 'date', 'steps', 'battery', 'heart_rate', 'arc', 'text',
  'weather', 'spo2', 'calories', 'distance', 'weekday', 'month',
]);

const VALID_SHAPES = new Set(['text', 'arc', 'icon', 'number']);

const VALID_WIDGETS = new Set([
  'TIME_POINTER', 'IMG_TIME', 'IMG_DATE', 'IMG_WEEK', 'ARC_PROGRESS',
  'TEXT', 'TEXT_IMG', 'IMG', 'IMG_STATUS', 'IMG_LEVEL',
]);

const MAX_ELEMENTS = 20;

// ─── Stage 0 Validator: AI Geometry Extraction Output ───────────────────────────
// MUST have geometry (bbox or center+radius). MUST NOT have region-based placement.

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

    if (!el.shape || !VALID_SHAPES.has(el.shape)) {
      violations.push(`${prefix}: missing or invalid shape '${el.shape}'`);
    }

    // GEOMETRY REQUIRED: must have bbox OR center
    const hasBbox = Array.isArray(el.bbox) && el.bbox.length === 4;
    const hasCenter = Array.isArray(el.center) && el.center.length === 2;

    if (!hasBbox && !hasCenter) {
      violations.push(
        `${prefix}: MISSING geometry — must include bbox [x,y,w,h] or center [cx,cy]. ` +
        `Elements without geometry cannot be placed.`,
      );
    }

    // Validate bbox values are in screen range
    if (hasBbox) {
      const [bx, by, bw, bh] = el.bbox!;
      if (bx < 0 || by < 0 || bw <= 0 || bh <= 0 || bx + bw > 520 || by + bh > 520) {
        violations.push(`${prefix}: bbox values out of range [${el.bbox}] (screen is 480×480, margin 520)`);
      }
    }

    // Validate center values
    if (hasCenter) {
      const [cx, cy] = el.center!;
      if (cx < 0 || cy < 0 || cx > 480 || cy > 480) {
        violations.push(`${prefix}: center out of range [${el.center}]`);
      }
    }

    // Arc elements should have arc geometry
    if (el.shape === 'arc') {
      if (!hasCenter) {
        violations.push(`${prefix}: arc element must include center`);
      }
      if (el.radius === undefined || el.radius <= 0) {
        violations.push(`${prefix}: arc element must include positive radius`);
      }
    }

    // Reject region-based placement (old pipeline)
    if ('region' in el) {
      violations.push(`${prefix}: FORBIDDEN field 'region' — geometry pipeline does not use regions`);
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

// ─── Stage 1 Validator: Normalized Elements (0–1 space) ─────────────────────────

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

    // Check normalized values are in [0, 1] range (with small margin for rounding)
    const normalizedFields: [string, number | undefined][] = [
      ['nx', el.nx], ['ny', el.ny], ['nw', el.nw], ['nh', el.nh],
      ['ncx', el.ncx], ['ncy', el.ncy], ['nr', el.nr], ['nt', el.nt],
    ];

    for (const [name, value] of normalizedFields) {
      if (value !== undefined && (value < -0.05 || value > 1.1)) {
        violations.push(`${prefix}: ${name}=${value} out of normalized range [0, 1]`);
      }
    }
  }

  if (violations.length > 0) {
    throw new PipelineValidationError('Normalizer', violations);
  }
}

// ─── Stage 2 Validator: Geometry Elements (absolute pixels) ─────────────────────

export function validateGeometry(elements: GeometryElement[]): void {
  const violations: string[] = [];

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    const prefix = `elements[${i}]`;

    if (typeof el.centerX !== 'number' || typeof el.centerY !== 'number') {
      violations.push(`${prefix}: missing centerX/centerY`);
    }

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
