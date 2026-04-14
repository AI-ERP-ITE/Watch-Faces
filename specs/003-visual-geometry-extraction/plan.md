# Plan — Visual Geometry Extraction Layer

## Summary

Add new stage:

```
AI Vision → Geometry Extraction → Validate → Normalize → Layout (conditional) → Geometry (pass-through)
```

---

## Architecture Change

### BEFORE

```
AI → Normalize → Layout → Geometry
```

### AFTER

```
AI → Geometry Extraction → Validate → Normalize → Layout (bypass if bounds exist) → Geometry (partial)
```

---

## New Module

```
src/pipeline/geometryExtractor.ts
```

### Responsibilities

- Extract bounding boxes
- Detect circular shapes
- Normalize coordinates to 480×480
- Attach geometry to `AIElement`

---

## Data Flow

**Input:**

```ts
AIElement[] // semantic only
```

**Output:**

```ts
AIElement[] // with geometry
```

---

## Core Algorithm

### Step 1 — Detect Regions

- Identify visual clusters
- Assign bounding boxes

### Step 2 — Detect Shapes

- If circular → compute:
  - `center`
  - `radius`
  - `angles`

### Step 3 — Normalize Coordinates

- Scale to 480×480

### Step 4 — Attach Geometry

- Merge into `AIElement`

---

## Integration Points

### In `pipelineAIService.ts`

Modify prompt:

> Return bounding boxes and geometry for each element

### In `pipeline/index.ts`

Insert:

```ts
const extracted = await extractGeometry(aiOutput)
validateGeometryExtraction(extracted)
```

### In `layoutEngine.ts`

```ts
if (element.bounds) return element // skip layout
```

### In `geometrySolver.ts`

```ts
if (element.radius) keep existing
```

---

## Risks

| Risk | Mitigation |
|------|------------|
| AI inaccurate geometry | clamp + normalize |
| Missing fields | fallback to existing pipeline |
| Overlapping elements | allow, do not auto-fix |

---

## Testing Strategy

- Compare overlay vs original image
- Validate arc alignment
- Validate text alignment
- Validate center consistency
