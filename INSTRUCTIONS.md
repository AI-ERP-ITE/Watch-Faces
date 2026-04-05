# Zepp Watchface Generator — Verification & Deployment Instructions

## GOLDEN RULE: Always Refer to the Working ZPK
The **working reference ZPK** (Brushed Steel Petroleum) at `extracted_reference/device/` is the **ONLY** source of truth.
Every generated file MUST be compared against this reference. If there is ANY difference in structure, patterns, or API usage — the generated code is WRONG.

**Reference files (NEVER modify these):**
- `extracted_reference/device/app.js` — The exact app.js to replicate
- `extracted_reference/device/app.json` — The exact manifest structure
- `extracted_reference/device/watchface/index.js` — The exact widget patterns, lifecycle, WIDGET_DELEGATE

---

## 3 Mandatory Rules (NEVER SKIP)

### Rule 1: Suggest Before Executing
- Before making ANY code change, **describe what will change and why**
- Show the diff or explain the specific lines affected
- Wait for user approval before applying changes
- No silent fixes, no surprise refactors

### Rule 2: Verify Generated ZPK Against Working Reference
After every code change, verify the generated output matches the reference:

| File | Check Against | What to Compare |
|------|--------------|-----------------|
| `app.js` | `extracted_reference/device/app.js` | Timer shims, App lifecycle, error handling |
| `app.json` | `extracted_reference/device/app.json` | v2 config, flat module structure, platforms |
| `watchface/index.js` | `extracted_reference/device/watchface/index.js` | Widget types, show_level, WIDGET_DELEGATE, sensor init |

**Verification checklist (run after every change):**
- [ ] `app.js` has `DeviceRuntimeCore.App({...})` with all lifecycle hooks
- [ ] `app.js` has proper `timer.createTimer()` wrappers (NOT direct `timer.setTimeout`)
- [ ] `app.json` uses `configVersion: "v2"` with flat `module.watchface`
- [ ] `watchface/index.js` uses IMG_TIME, IMG_DATE, IMG_WEEK (not TIME_POINTER)
- [ ] `watchface/index.js` has NORMAL + AOD widget sets with correct show_level
- [ ] `watchface/index.js` has WIDGET_DELEGATE with resume_call/pause_call
- [ ] All coordinates are RAW numbers (no px() wrapping)
- [ ] Asset filenames in code match actual files in ZPK assets/

### Rule 3: Deploy Properly to GitHub
Every deployment MUST follow this exact sequence:

```powershell
# 1. Build
npm run build

# 2. Verify build succeeded and new hash exists
Get-ChildItem dist/assets/index-*.js

# 3. Copy to GitHub Pages folder
Copy-Item dist/* docs/ -Recurse -Force

# 4. Commit and push
git add docs/
git commit -m "Deploy: [describe change]"
git push
```

**Post-deploy verification:**
- [ ] `npm run build` exit code 0
- [ ] New `dist/assets/index-*.js` file created
- [ ] `docs/` updated with new files
- [ ] `git push` succeeded
- [ ] Hard refresh (Ctrl+F5) the live site
- [ ] Generate a test watchface
- [ ] Extract the .zpk and compare against reference

---

## Known Critical Differences (Current State — April 5, 2026)

These are the bugs found in the generator that need fixing:

### BUG 1: `app.js` generator is broken (BLOCKER)
- **Missing:** `DeviceRuntimeCore.App({...})` lifecycle registration
- **Wrong:** Timer shims use `timer.setTimeout` directly instead of `timer.createTimer()` wrappers
- **Missing:** Error stack trace logging
- **Fix:** Copy the exact pattern from `extracted_reference/device/app.js`

### BUG 2: `WIDGET_DELEGATE` is empty
- **Current:** Just logs a string, does nothing
- **Reference:** Updates city name widgets, checks screen type via `hmSetting.getScreenType()`
- **Fix:** Add proper resume_call logic

---

## Project Structure (Clean)

```
app/
  src/lib/
    jsCodeGenerator.ts      ← Router (V2 vs V3)
    jsCodeGeneratorV2.ts    ← V2 generator (Balance 2) — FIX THIS
    zpkBuilder.ts           ← ZPK packager
  extracted_reference/      ← SINGLE SOURCE OF TRUTH
    brushed_steel/
  docs/                     ← GitHub Pages deployment
  dist/                     ← Build output
extracted_reference/        ← Working reference device code
  device/
    app.js                  ← Reference app.js
    app.json                ← Reference app.json
    watchface/index.js      ← Reference watchface code
    assets/                 ← Reference image assets
```
