# Zepp Watch Face Generator - Deployment Protocol

## CRITICAL: Complete Verification Checklist

Every code change MUST follow this exact protocol. No shortcuts. No assumptions.

---

## Phase 1: CODE MODIFICATION

- [ ] Identify what needs to be fixed
- [ ] Locate the source file (src/lib/*.ts)
- [ ] Make changes to TypeScript source
- [ ] Verify syntax is correct

**Location:** `src/lib/jsCodeGenerator.ts` (main code generator)

---

## Phase 2: BUILD & COMPILE

### Step 1: Build TypeScript
```bash
npm run build
```
- **Verify:** No errors in console
- **Verify:** New files created in `dist/assets/`
- **Compare:** Check if new dist hash differs from old (e.g., index-B1aWWejl.js vs old hash)

### Step 2: Verify the Build Contains Your Changes
```bash
grep -r "YOUR_CHANGE_STRING" dist/assets/index-*.js
```
- **Must find:** The fix in the compiled JavaScript

**Critical Check:** Search for a unique string from your change:
- For TIME_POINTER fix: Search for "hmUI.widget.TIME_POINTER"
- Confirm it's in dist/assets/index-*.js

---

## Phase 3: FRONTEND DEPLOYMENT (GitHub Pages)

### Step 1: Copy dist to docs
```bash
Copy-Item dist/* docs/ -Recurse -Force
```
- **Verify:** docs/assets/ now contains NEW index-*.js file
- **Verify:** Old hash files are still there (they'll be replaced)

### Step 2: Git Commit & Push
```bash
git add docs/
git commit -m "Deploy: [SPECIFIC CHANGE DESCRIPTION]"
git push origin master
```
- **Verify:** Push succeeds (exit code 0)
- **Verify:** Commit message is descriptive

### Step 3: Verify on GitHub
```bash
git log --oneline -5
```
- **Verify:** Latest commit shows the deployment
- **Verify:** Commit includes docs/ changes

---

## Phase 4: FRONTEND VERIFICATION

### Step 1: Check GitHub Pages Build
- Wait 10-15 seconds after push
- Go to: https://github.com/AI-ERP-ITE/Watch-Faces/settings/pages
- **Verify:** "Your site is published at https://ai-erp-ite.github.io/Watch-Faces/"

### Step 2: Verify Files Online
- Open browser DevTools (F12)
- Go to: https://ai-erp-ite.github.io/Watch-Faces/
- **Check:** Network tab shows index-*.js loading
- **Verify:** It's the NEW hash (not old)
- Clear browser cache: Ctrl+F5

### Step 3: Search for the Fix in Live Code
Open browser console and run:
```javascript
// Check if the fix is loaded
if (window.location.href.includes('watch-faces')) {
  console.log('Site loaded. Check Network tab for latest index-*.js');
}
```

---

## Phase 5: BACKEND GENERATION TEST

### Step 1: Generate Test Watchface
1. Hard refresh: **Ctrl+F5** (or Cmd+Shift+R)
2. Go to: https://ai-erp-ite.github.io/Watch-Faces/
3. Upload any background image
4. Add 1-2 widgets (e.g., TIME, BATTERY)
5. Click "Generate & Download"
6. Save the .zpk file

**Naming:** Use `test_YYYYMMDD_HH.zpk` pattern

### Step 2: Extract and Analyze Generated Code
```bash
Copy-Item test_YYYYMMDD_HH.zpk test_YYYYMMDD_HH.zip
Expand-Archive test_YYYYMMDD_HH.zip -DestinationPath extracted_test
Expand-Archive extracted_test/device.zip -DestinationPath extracted_test_device
```

### Step 3: Verify Fix is in Generated Code
```bash
Get-Content extracted_test_device/watchface/index.js | Select-String "TIME_POINTER|ARC"
```

**Expected Results:**
- TIME_POINTER fix: Should show `hmUI.widget.TIME_POINTER`
- ARC fix: Should show `hmUI.widget.ARC`
- Should NOT show: `IMG_TIME` or `IMG_LEVEL`

---

## Phase 6: COMMIT TEST RESULTS

```bash
git add extracted_test_device/
git commit -m "Verification: Generated test watchface - CONFIRMS fix is working"
git push
```

---

## FINAL CHECKLIST

### Before declaring "DONE":

- [ ] Code change made to src/lib/jsCodeGenerator.ts
- [ ] npm run build executed successfully
- [ ] dist/assets/ contains NEW index-*.js file
- [ ] dist/ copied to docs/
- [ ] git push succeeded
- [ ] GitHub pages shows new files
- [ ] Test watchface generated
- [ ] Test watchface contains the fix (TIME_POINTER/ARC, no IMG_TIME/IMG_LEVEL)
- [ ] Test watchface committed and pushed

---

## COMMON MISTAKES TO AVOID

❌ **WRONG:** Making code changes but not building
❌ **WRONG:** Building but not copying dist to docs
❌ **WRONG:** Pushing without verifying GitHub Pages updated
❌ **WRONG:** Not hard-refreshing browser before testing
❌ **WRONG:** Assuming the fix is working without generating a test watchface
❌ **WRONG:** Not checking if generated code actually contains the fix

✅ **RIGHT:** Follow ALL phases in order
✅ **RIGHT:** Generate test watchface to confirm
✅ **RIGHT:** Extract and verify the generated code
✅ **RIGHT:** Only declare success after verification complete

---

## Emergency Rollback

If test watchface FAILS (still has old code):

```bash
git revert HEAD
git push
# Or use git reset to undo
```

---

## Documentation

After each deployment, describe:
1. What was changed (source files)
2. Why it was changed (the problem)
3. How to verify it works (test steps)
4. Verification result (PASS/FAIL)

See: `DEPLOYMENT_LOG.md`

