// Representation Correction Layer
// Inserts between validation and normalization to fix AI arc collapse.
// Deterministic, <5ms, no async operations.

import type { AIElement, AIElementType, Representation, LayoutMode, Group } from '@/types/pipeline';

// ─── Constants ──────────────────────────────────────────────────────────────────

/** Maximum arcs allowed before downgrade kicks in. */
const MAX_ARCS = 2;

/** Layout feasibility threshold — if all elements are "arc" layout and count exceeds this, fix. */
const ARC_LAYOUT_THRESHOLD = 3;

/** Type-based default representations (override when AI says "arc" incorrectly). */
const TYPE_DEFAULT_REPRESENTATION: Partial<Record<AIElementType, Representation>> = {
  steps:      'text+icon',
  battery:    'text+icon',
  heart_rate: 'text+icon',
  spo2:       'text',
  calories:   'text',
};

/** Types that should stay in center even during group redistribution. */
const CENTER_TYPES: Set<AIElementType> = new Set(['time']);

/** Types that go to "top" during redistribution. */
const TOP_TYPES: Set<AIElementType> = new Set(['date', 'weekday', 'month']);

// ─── Rule Functions ─────────────────────────────────────────────────────────────

/** Rule 1: Arc Limit — max 2 arcs, downgrade extras to "text". */
function applyArcLimit(elements: AIElement[]): AIElement[] {
  const arcIndices: number[] = [];
  for (let i = 0; i < elements.length; i++) {
    if (elements[i].representation === 'arc') arcIndices.push(i);
  }

  if (arcIndices.length <= MAX_ARCS) return elements;

  // Keep first MAX_ARCS arcs (by order), downgrade the rest
  const toDowngrade = arcIndices.slice(MAX_ARCS);
  return elements.map((el, i) => {
    if (!toDowngrade.includes(i)) return el;
    return { ...el, representation: 'text' as Representation, layout: 'row' as LayoutMode };
  });
}

/** Rule 2: Layout Feasibility — if all layout:"arc" and count > threshold, convert non-primary to "row". */
function applyLayoutFix(elements: AIElement[]): AIElement[] {
  const arcLayoutCount = elements.filter(el => el.layout === 'arc').length;
  if (arcLayoutCount <= ARC_LAYOUT_THRESHOLD) return elements;

  // All arc-layout and too many — keep primary elements as arc, convert rest to row
  let arcKept = 0;
  return elements.map(el => {
    if (el.layout !== 'arc') return el;
    if (el.importance === 'primary' && arcKept < MAX_ARCS) {
      arcKept++;
      return el;
    }
    return { ...el, layout: 'row' as LayoutMode };
  });
}

/** Rule 3: Group Redistribution — if all group:"center", reassign by type. */
function applyGroupRedistribution(elements: AIElement[]): AIElement[] {
  const allCenter = elements.every(el => el.group === 'center');
  if (!allCenter) return elements;

  return elements.map(el => {
    if (CENTER_TYPES.has(el.type)) return el; // time stays center
    if (TOP_TYPES.has(el.type)) return { ...el, group: 'top' as Group };
    // All other data types → right_panel
    return { ...el, group: 'right_panel' as Group };
  });
}

/** Rule 4: Type-Based Overrides — ensure known data types get their correct representation. */
function applyTypeOverrides(elements: AIElement[]): AIElement[] {
  return elements.map(el => {
    const defaultRep = TYPE_DEFAULT_REPRESENTATION[el.type];
    if (!defaultRep) return el; // no override for this type
    if (el.representation === defaultRep) return el; // already correct
    return {
      ...el,
      representation: defaultRep,
      layout: 'row' as LayoutMode,
    };
  });
}

/** Rule 5: Decorative Arc Detection — weak arcs (no dataType, small sweep) → "icon"/"standalone". */
function applyDecorativeDetection(elements: AIElement[]): AIElement[] {
  // "arc" type with no real data binding is decorative
  const DATA_TYPES: Set<AIElementType> = new Set([
    'steps', 'battery', 'heart_rate', 'spo2', 'calories', 'distance',
  ]);

  return elements.map(el => {
    if (el.representation !== 'arc') return el;
    // If the type is a known data type, it's a real arc — keep it
    if (DATA_TYPES.has(el.type)) return el;
    // Generic "arc" or "text" type with arc representation = decorative
    return {
      ...el,
      representation: 'icon' as Representation,
      layout: 'standalone' as LayoutMode,
    };
  });
}

// ─── Main Entry Point ───────────────────────────────────────────────────────────

/**
 * Correct AI-provided representations that collapse everything to arcs.
 * Applies 5 rules in order:
 *   1. Arc limit (max 2)
 *   2. Layout feasibility
 *   3. Group redistribution
 *   4. Type-based overrides
 *   5. Decorative arc detection
 *
 * Input:  AIElement[] (validated)
 * Output: AIElement[] (corrected — same shape, field overrides only)
 */
export function correctRepresentation(elements: AIElement[]): AIElement[] {
  // Deep copy to avoid mutating input
  let corrected: AIElement[] = elements.map(el => ({ ...el }));

  const before = elements.map(el => `${el.id}:${el.representation}/${el.layout}/${el.group}`);

  // Detect arc collapse: if original arc count exceeds MAX_ARCS, the design is collapsed.
  // Only apply aggressive rules (3-5) when collapse is detected.
  const originalArcCount = elements.filter(el => el.representation === 'arc').length;
  const isCollapsed = originalArcCount > MAX_ARCS;

  corrected = applyArcLimit(corrected);
  corrected = applyLayoutFix(corrected);

  // Rules 3-5 only apply when arc collapse is detected
  if (isCollapsed) {
    corrected = applyGroupRedistribution(corrected);
    corrected = applyTypeOverrides(corrected);
    corrected = applyDecorativeDetection(corrected);
  }

  // Log corrections
  const changes: string[] = [];
  for (let i = 0; i < corrected.length; i++) {
    const after = `${corrected[i].id}:${corrected[i].representation}/${corrected[i].layout}/${corrected[i].group}`;
    if (before[i] !== after) {
      changes.push(`  ${before[i]} → ${after}`);
    }
  }
  if (changes.length > 0) {
    console.log(`[RepCorrector] ${changes.length} correction(s) applied:\n${changes.join('\n')}`);
  } else {
    console.log('[RepCorrector] No corrections needed');
  }

  return corrected;
}
