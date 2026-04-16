# specs/010-html-driven-pipeline/plan.md

## Summary

Replace AI pipeline entry with:

```text
HTML + background → DOM → elements → generator
```

---

## Architecture Change

### BEFORE

```text
Image → AI → AIElement → normalize → layout → geometry → generator
```

### AFTER

```text
HTML + background
   ↓
sanitize
   ↓
render
   ↓
parse DOM
   ↓
map → elements
   ↓
generator
```

---

## Modules to Modify / Add

```text
ADD:
src/html/sanitizeHtml.ts
src/html/parseDom.ts
src/html/mapDomToElements.ts

MODIFY:
pipeline/index.ts
App.tsx (input UI)
```

---

## Removed Responsibilities

```text
❌ pipelineAIService.ts (API usage)
❌ vision extraction
❌ ambiguity resolution
```

---

## Preserved Components

```text
✔ normalizer (optional reuse)
✔ mapping logic
✔ V2 generator
✔ asset generator
```

---

## Data Flow

```text
User:
  upload background
  paste HTML

→ sanitizeHtml()
→ render preview
→ parseDom()
→ mapDomToElements()
→ existing generator
→ ZPK
```

---

## Risks

| Risk                 | Mitigation                    |
| -------------------- | ----------------------------- |
| malformed HTML       | sanitize + fallback container |
| overlapping elements | user-controlled               |
| incorrect mapping    | refine deterministic rules    |

---

## Testing Strategy

* test simple HTML (time only)
* test full layout
* test malformed HTML
* test preview vs ZPK match
