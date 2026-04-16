# Plan — Spec 012 Unified Design Input

## Approach
1. Create `DesignInput.tsx` — tabbed Image/HTML widget
2. Modify `App.tsx`:
   - Remove top-level mode toggle (`inputMode === 'ai' | 'html'` and its JSX block)
   - Add `designTab` state (`'image' | 'html'`)
   - Replace Full Design UploadZone + HTML textarea sections with `<DesignInput>`
   - Wire action button label + disabled condition + onClick to `designTab`
   - Keep `htmlBgImage`, `htmlInput`, `handleLoadLayout`, live preview inside DesignInput

## Files Changed
- `src/components/DesignInput.tsx` — NEW
- `src/App.tsx` — remove mode toggle, add designTab, wire DesignInput

## Risk
Low — purely UI reorganization; underlying pipeline functions are unchanged.
