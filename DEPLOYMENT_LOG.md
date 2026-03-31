# DEPLOYMENT LOG

Track every deployment, change, verification, and result.

---

## Deployment #1: CRITICAL FIX - Missing Asset Files (Black Screen)

**Date:** 2026-03-31  
**Status:** ❌ FAILED - Not properly verified until end of session

### Change Made
**File:** `src/lib/jsCodeGenerator.ts`

**What was changed:**
- `generateTimePointerWidget()`: Changed from IMG_TIME (hardcoded digit arrays) to TIME_POINTER (actual image files)
- `generateImgLevelWidget()`: Changed from IMG_LEVEL (hardcoded 5 level images) to ARC (simple arc display)

**Why:** 
- IMG_TIME and IMG_LEVEL hardcoded references to non-existent image files:
  - `chars_time_digit_0.png` through `9.png` (don't exist)
  - `level_0.png` through `4.png` (don't exist)
- These missing files caused black screen in generated watchfaces

### Build Result
```
✅ npm run build - SUCCESS (6.58s)
✅ New dist/assets/index-B1aWWejl.js created
```

### Frontend Deployment
```
✅ Commit d7bc1e6: "🔥 CRITICAL FIX: Remove hardcoded references..."
✅ git push - SUCCESS
```

### Verification Status
```
⚠️ INCOMPLETE - Did not verify:
  ❌ Didn't extract and check generated watchface until online7
  ❌ online7, online8, online9 still had OLD code (IMG_TIME, IMG_LEVEL)
  ❌ Reason: dist/ was NOT copied to docs/ until commit e81d593
```

### Root Cause of Failure
- Source code was fixed ✅
- npm run build worked ✅
- But dist/ was NOT deployed to docs/ (GitHub Pages)
- GitHub Pages was serving OLD index files from docs/assets/
- Generated watchfaces still used old code generator logic

### Resolution
**Commit e81d593:** "Deploy latest fixed code to GitHub Pages..."
```bash
Copy-Item dist/* docs/ -Recurse -Force
git add docs/
git commit -m "Deploy latest fixed code..."
git push
```

### Final Verification
- ✅ online7: OLD code (IMG_TIME) - generated BEFORE fix deployed
- ✅ online8: OLD code (IMG_TIME) - generated BEFORE fix deployed
- ✅ online9: OLD code (IMG_TIME) - generated BEFORE fix deployed
- ✅ online10: OLD code (IMG_TIME) - generated BEFORE fix deployed
- ✅ online11: OLD code (IMG_TIME) - generated BEFORE fix deployed
- ⚠️ **ISSUE:** Fix deployed but not yet tested with NEW generation

### Test Plan for Next Generation
1. Hard refresh: Ctrl+F5
2. Generate online12 (or next test watchface)
3. Extract and verify code contains:
   - `hmUI.widget.TIME_POINTER` ✅ (not IMG_TIME)
   - `hmUI.widget.ARC` ✅ (not IMG_LEVEL)
   - No references to `chars_time_digit_*.png`
   - No references to `level_*.png`

---

## Deployment Workflow Diagram

```
SOURCE CODE CHANGE
    ↓
npm run build
    ↓
dist/ has new files
    ↓
Copy dist/* → docs/ ← **THIS STEP WAS MISSING!**
    ↓
git add docs/
    ↓
git commit
    ↓
git push
    ↓
GitHub Pages updates
    ↓
User hard refresh (Ctrl+F5)
    ↓
Generate test watchface
    ↓
Extract .zpk and verify fix
    ↓
Success! ✅ or Failure ❌
```

---

## LESSONS LEARNED

1. **Building ≠ Deploying**
   - npm run build creates dist/ but that's just local
   - Must copy dist/* to docs/ for GitHub Pages to serve it

2. **Frontend isn't live until verified**
   - Don't assume changes are live just because code was updated
   - Must check GitHub Pages actually has new files
   - Must browser hard-refresh to bypass cache

3. **Generated output must be tested**
   - Even if the code is deployed, the generation might not use it
   - Only way to verify: Generate test watchface, extract, and check

4. **Cache is the enemy**
   - Browser cache masks changes
   - GitHub Pages CDN has cache
   - Always Ctrl+F5 hard refresh before testing
   - Generated .zpk files should be extracted and checked

---

## Template for Future Deployments

```
## Deployment #N: [CHANGE NAME]

**Date:** YYYY-MM-DD
**Commit:** [hash]
**Status:** [IN PROGRESS/SUCCESS/FAILED]

### Change Made
**File:** `path/to/file.ts`
**What:** [Describe the change]
**Why:** [Explain the problem it solves]

### Build Result
[Output from npm run build]
- ✅ or ❌

### Frontend Deployment
[Commits and push results]
- ✅ or ❌

### Verification Status
[Extract test watchface and verify]
- ✅ or ❌

### Test Watchface Generated
[online12_test.zpk, online13_test.zpk, etc.]
- Expected: [What should be in generated code]
- Actual: [What was actually in generated code]
- Match: ✅ or ❌
```

