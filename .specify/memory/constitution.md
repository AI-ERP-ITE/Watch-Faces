# Zepp Watchface Generator Constitution

## Core Principles

### I. Reference-First (NON-NEGOTIABLE)
The working reference ZPK (Brushed Steel Petroleum) at `extracted_reference/device/` is the **SINGLE SOURCE OF TRUTH**. Every generated file MUST be compared against this reference. If there is ANY difference in structure, patterns, or API usage — the generated code is WRONG. Never modify reference files.

### II. Spec-Driven Code Generation
All generated watchface code MUST follow the Zepp OS V2 Widget API exactly as documented in `ZEPP_WATCHFACE_API_REFERENCE.md` and `WIDGET_REFERENCE_NOTES.md`. No invented improvements, no deviation from proven patterns. Generated output must match the spec — not be "similar", but EXACT.

### III. Suggest Before Executing
Before making ANY code change: describe what will change and why, show the diff or explain the specific lines affected, and wait for user approval. No silent fixes, no surprise refactors.

### IV. Verify Against Reference
After every code change, verify generated output matches the reference:
- `app.js` → `DeviceRuntimeCore.App({...})`, proper `timer.createTimer()` wrappers
- `app.json` → `configVersion: "v2"`, flat `module.watchface`, correct `deviceSource`
- `watchface/index.js` → IMG_TIME, IMG_DATE, IMG_WEEK widgets, WIDGET_DELEGATE with resume_call/pause_call, correct show_level, raw coordinates (no px() wrapping)

### V. Deploy Completely or Not At All
Every deployment follows the 5-phase protocol: Build → Verify build → Copy dist to docs → Git push → Test generated watchface. Skipping any phase is forbidden. See `DEPLOYMENT_PROTOCOL.md`.

### VI. Simplicity Over Cleverness
Start simple, follow YAGNI. Don't add error handling for impossible scenarios. Don't create abstractions for one-time operations. Don't add features, refactor code, or make "improvements" beyond what was asked.

## Technology Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | React + TypeScript + Vite 7 | Web-based watchface designer |
| UI | Tailwind CSS v3.4 + shadcn/ui | 40+ components available |
| Code Generation | TypeScript (`src/lib/jsCodeGeneratorV2.ts`) | Generates Zepp OS V2 watchface code |
| Packaging | `zpkBuilder.ts` | Builds .zpk files for device deployment |
| Target Device | Amazfit Balance 2 | deviceSources: `[8519936, 8519937, 8519939]` |
| Target API | Zepp OS V2 | `configVersion: "v2"`, `DeviceRuntimeCore` |
| Deployment | GitHub Pages | `docs/` folder, site: ai-erp-ite.github.io/Watch-Faces/ |

## Zepp OS V2 Widget Rules

- All widgets use `hmUI.createWidget(hmUI.widget.TYPE, {...})` with declarative config objects
- Widget creation order = z-order (first call = bottom layer)
- Lifecycle: `DeviceRuntimeCore.WatchFace({ init_view(), onInit(), build(), onDestroy() })`
- `build()` calls `this.init_view()` where ALL widgets are created
- Show levels: `ONLY_NORMAL` (active), `ONLY_AOD` (always-on), `ALL` (both)
- Coordinates are RAW numbers — never wrap in `px()`
- Asset paths are bare filenames (e.g., `'background.png'`), files live in `assets/`
- TIME_POINTER handles all 3 clock hands in ONE widget call
- IMG_TIME for image-based digit time display (hours/minutes/seconds)
- WIDGET_DELEGATE required for proper AOD resume_call/pause_call behavior

## Development Workflow

1. **Identify** the change needed
2. **Read specs** — check ZEPP_WATCHFACE_API_REFERENCE.md and reference files
3. **Compare** proposed change against spec examples
4. **Implement** in TypeScript source (`src/lib/`)
5. **Build** — `npm run build`, verify exit code 0
6. **Verify** — check compiled JS contains the fix
7. **Deploy** — copy dist→docs, git commit, git push
8. **Test** — generate watchface, extract .zpk, compare against reference
9. **Document** — commit test results with verification details

## Governance

This constitution supersedes all other development practices for this project. All changes must verify compliance with these principles. The working reference ZPK is the ultimate authority on correctness. When in doubt, match the reference exactly.

**Version**: 1.0.0 | **Ratified**: 2026-04-09 | **Last Amended**: 2026-04-09
