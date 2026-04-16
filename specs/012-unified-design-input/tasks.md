# Tasks — Spec 012 Unified Design Input

## T001 — Create DesignInput.tsx component
- [ ] Tab bar: Image | HTML, styled with active state
- [ ] Image tab: renders UploadZone for full design image
- [ ] HTML tab: renders textarea (monospace, h-48, resizable)
- [ ] HTML tab: renders live preview (bg + HTML overlay + circular mask at 240px) when content exists

## T002 — App.tsx: add designTab state
- [ ] Replace `inputMode` ('ai'|'html') with `designTab` ('image'|'html')
- [ ] Remove the top-level mode toggle JSX block

## T003 — App.tsx: wire DesignInput
- [ ] Remove the `inputMode === 'ai' ? ... : ...` block
- [ ] Insert `<DesignInput>` with all props wired
- [ ] Keep background UploadZone above DesignInput (unchanged)

## T004 — App.tsx: action button
- [ ] Label: "Analyze with AI" when designTab==='image', "Load Layout" when 'html'
- [ ] onClick: `designTab === 'image' ? handleAnalyze() : handleLoadLayout()`
- [ ] disabled: image tab → `!state.backgroundImage || !state.fullDesignImage`; html tab → `!htmlInput.trim()`

## T005 — Build + deploy
