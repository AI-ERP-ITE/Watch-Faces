# Spec 025: Premium Empty-State + Layout Restructure — TASKS

---

## Task 1: Typography + Color System Setup

- Edit: `tailwind.config.js` — add fontFamily (sans: Inter, mono: Roboto Mono) + extend colors (obsidian, slate-card, gold, text-primary, text-secondary)
- Edit: `index.html` — add Inter (300,400,500,600) to Google Fonts link (keep Roboto Mono, it's already there)
- Edit: `src/index.css` — update body font-family to `'Inter', system-ui, sans-serif`

**Test:** Dev server text renders in Inter. Tailwind classes `font-sans`, `font-mono`, `bg-obsidian`, `text-gold` all work.

---

## Task 2: Create EmptyState Component

- New file: `src/components/storefront/EmptyState.tsx`
- Centered flex container, min-h to fill
- Title: "Coming Soon" (`font-sans font-light text-2xl text-[#D9DBE0]`)
- Subtitle: "Curated watchfaces are being prepared." (`font-mono text-sm text-[#8E9196]`)
- Optional "Clear All Filters" ghost button (gold border) — shown via prop
- Background: `bg-[#181A1F]` rounded container with subtle border

**Test:** Import and render standalone — looks intentional, not broken.

---

## Task 3: Conditional Rendering in HomePage

- Edit: `src/components/storefront/HomePage.tsx`
- Add guard: `const hasFaces = results && results.length > 0`
- When `hasFaces`: show model chips, category cards, FilterSidebar, SortControls, WatchfaceGrid
- When `!hasFaces` (and not loading/error): show Hero + EmptyState only
- Hide: model chips, category cards, FilterSidebar, SortControls, WatchfaceGrid

**Test:** Empty catalog.json → only Hero + "Coming Soon" visible.

---

## Task 4: Remove Old Empty State from WatchfaceGrid

- Edit: `src/components/storefront/WatchfaceGrid.tsx`
- Remove the emoji + "No watchfaces found" fallback block
- Grid only renders when entries exist (caller responsibility from Task 3)

**Test:** WatchfaceGrid no longer has internal empty state.

---

## Task 5: Enhance Hero Section

- Edit: `src/components/storefront/HomePage.tsx`
- Title: "Flowvault" (`font-sans font-light text-4xl tracking-tight text-[#D9DBE0]`)
- Subtitle: "Premium Watchfaces for Amazfit" (`font-sans text-lg text-[#8E9196]`)
- Description: "Designed for clarity, performance, and style." (`font-mono text-sm text-[#8E9196]`)
- Background: radial gradient `#181A1F` center → `#101115` edges
- Generous padding (py-20)

**Test:** Hero looks premium with or without data.

---

## Task 6: Category Chip Restyling

- Edit: `src/components/storefront/HomePage.tsx`
- Ghost style: transparent bg + `border-[#181A1F]`
- Hover: border → gold
- Active: gold text + gold border
- All emoji/icons monochrome (no orange lightning etc.)
- Equal padding, balanced grid
- Labels: `font-sans` (unified with hero)

**Test:** Categories feel like secondary nav, not primary feature. No clashing colors.

---

## Task 7: Filter Sidebar Restyling

- Edit: `src/components/storefront/FilterSidebar.tsx`
- Section titles: `font-mono text-xs uppercase tracking-widest text-[#8E9196]`
- Items: indented, `font-sans text-sm text-[#D9DBE0]`
- Each block in padded container (`bg-[#181A1F]` rounded, p-4)
- Spacing between blocks: `space-y-4`
- Selected items: gold text or gold left border
- "Clear" button: gold text, ghost style

**Test:** Sidebar has clear hierarchy, breathable spacing, gold accents.

---

## Task 8: Hide Studio From Navbar

- Edit: `src/components/storefront/StorefrontLayout.tsx`
- Remove the "Studio" link/button from the header
- Do NOT remove the `/studio` route from App.tsx
- Route remains accessible via direct URL

**Test:** Storefront navbar has no Studio link. `/studio` direct nav still works.

---

## Task 9: Navbar + Layout Color Overhaul

- Edit: `src/components/storefront/StorefrontLayout.tsx`
- "Flowvault" logo: larger, `font-sans font-light tracking-tight`
- Nav items: `font-sans text-sm text-[#8E9196]`
- Active nav: `text-[#D9DBE0] font-medium` + gold underline
- Increase gap between items
- Background: `bg-[#101115]` + subtle bottom border `border-[#181A1F]`
- Footer: same obsidian palette

**Test:** Navbar feels spacious, polished, gold active indicator visible.

---

## Task 10: Lazy-Load Editor Fonts

- Edit: `index.html` — remove the massive 30-family Google Fonts `<link>`, keep only Inter + Roboto Mono
- Edit: `src/StudioApp.tsx` — on mount, dynamically create + inject the editor Google Fonts `<link>` element
- Storefront loads only ~2 fonts; Studio loads all 30+ on demand

**Test:** Storefront network tab shows only Inter + Roboto Mono. Studio still renders all fonts after mount.

---

## Task 11: Apply EmptyState to CategoryPage + ModelPage

- Edit: `src/components/storefront/CategoryPage.tsx`
- Edit: `src/components/storefront/ModelPage.tsx`
- When filtered results empty: hide grid/sidebar/sort, show EmptyState
- Category: "No {category} watchfaces yet — coming soon."
- Model: "No watchfaces for {model} yet — coming soon."

**Test:** Category/model pages with no matching faces show EmptyState.

---

## Task 12: Global Background + Text Color Pass

- Edit: `src/components/storefront/StorefrontLayout.tsx` — outer wrapper `bg-[#101115]`
- Edit: all storefront pages — replace `text-white` with `text-[#D9DBE0]`, `text-zinc-500` with `text-[#8E9196]`
- Edit: all card components — `bg-[#181A1F]` instead of `bg-zinc-900`
- Ensure no pure black or pure white remains in storefront

**Test:** Entire storefront uses obsidian palette. No stark contrasts.

---

## Execution Order

```
Task 1 → Task 2 → Task 3 → Task 4 → Task 5 → Task 6 → Task 7
→ Task 8 → Task 9 → Task 10 → Task 11 → Task 12
```

Each task is independently testable. Stop after each for verification.
