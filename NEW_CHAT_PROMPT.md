# AI Vision Integration - New Chat Prompt

Copy this prompt to start a new chat for AI implementation:

---

## Context

You are continuing work on a **Zepp OS watchface generator** web app. The app lets users upload an image of a watchface design, then AI Vision analyzes it and generates a working `.zpk` watchface file for Amazfit Balance 2.

### What's Already Built & Working
- **V2 Code Generator** (`src/lib/jsCodeGeneratorV2.ts`) — AUDITED against official docs, hardware-verified
  - Generates `app.json`, `app.js`, `watchface/index.js` from `WatchFaceElement[]`
  - Supports: IMG, IMG_TIME, IMG_DATE (day+month), IMG_WEEK, ARC_PROGRESS, TEXT_IMG, TIME_POINTER, TEXT, BUTTON, IMG_STATUS, CIRCLE, IMG_LEVEL
  - Produces `.zpk` files that run correctly on Amazfit Balance 2
- **Web UI** (React + Vite + Tailwind) with mock data showing 35+ elements
- **Mock pipeline** working end-to-end: mock analysis → element array → V2 generator → .zpk download

### Target Device
- **Amazfit Balance 2**: 480×480 Round, ZeppOS 4.2
- deviceSource: [8519936, 8519937, 8519939]
- configVersion: "v2"

### THE Reference Document
**READ `ZEPP_WATCHFACE_API_REFERENCE.md` FIRST** — this is the authoritative Zepp OS widget API reference extracted from official documentation. ALL code generation must match the patterns documented there. Do NOT deviate from it.

### Key Files
| File | Purpose |
|------|---------|
| `ZEPP_WATCHFACE_API_REFERENCE.md` | **Official API reference — READ FIRST** |
| `src/lib/jsCodeGeneratorV2.ts` | V2 code generator (audited, do not break) |
| `src/App.tsx` | Main app with mock data (35+ elements) |
| `src/types/` | TypeScript type definitions |
| `src/context/` | React context (WatchfaceContext) |
| `src/components/` | UI components |
| `extracted_reference/device/watchface/index.js` | Working Brushed Steel reference |
| `zepp_reference_extracted.txt` | Raw official docs text (52K chars) |

### What Needs to Be Built
1. **AI Vision Integration** — Replace mock analysis with real Kimi API (or other vision AI) calls
   - User uploads watchface image → AI analyzes it → extracts `WatchFaceElement[]`
   - AI must identify: widget types, positions, sizes, colors, data bindings
   - Must generate proper asset descriptions for image generation
   
2. **Image Asset Generation** — Generate actual PNG assets from the design
   - Clock hands, digit fonts, icons, backgrounds, progress indicators
   - Must match the uploaded design's style/colors

3. **Prompt Engineering** — Design the vision prompt to extract accurate watchface structure
   - Must output the exact `WatchFaceElement` structure the V2 generator expects
   - Must identify all data_types correctly (battery, steps, heart, etc.)

### Critical Rules
1. **ALWAYS validate against `ZEPP_WATCHFACE_API_REFERENCE.md`** — it's the spec
2. Don't modify `jsCodeGeneratorV2.ts` unless a bug is found — it's audited and working
3. Follow the deployment protocol: build → copy dist to docs → push
4. Raw coordinates (no px() wrapper) — confirmed working on hardware
5. ONE TIME_POINTER widget for ALL 3 hands
6. When ARC_PROGRESS has `type` bound, don't set `level`

---
