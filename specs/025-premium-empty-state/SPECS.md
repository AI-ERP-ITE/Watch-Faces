# SPEC 025 — Premium Empty-State + Layout Restructure

## Objective

Transform the storefront from a filter-first tool UI into a premium product-first experience:

- No hardcoded/mock watchfaces
- No placeholder images
- Empty sections hidden cleanly
- "Coming Soon" messaging where needed
- Clean, minimal, premium feel
- Studio hidden from public navigation
- Refined typography, color palette, and component styling

## Core Principle

```
IF no data → DO NOT show emptiness
IF no data → DO NOT fake content
IF no data → SHOW controlled, intentional UI
```

---

## 1. Typography System — Font Hierarchy

### Primary Font (Headings / Display): **Inter**
- Load Inter via Google Fonts (weights 300, 400, 500, 600)
- Use for: hero title "Flowvault", headings, card names, empty-state title
- Default weight 300 (light) for refined look, 500/600 for emphasis sparingly

### Secondary Font (Labels / Filters): **Roboto Mono**
- Already loaded in index.html for the editor
- Use for: filter titles (BRAND, WATCH MODEL), price badges, sort labels, model chip text
- Monospaced = "digital display" aesthetic, fits watchface theme

### Tailwind Config:
```js
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  mono: ['Roboto Mono', 'monospace'],
}
```

### Application:
- `font-sans` on body (Inter base)
- `font-mono` on filter labels, model chips, price badges
- Hero title: `font-sans font-light text-4xl tracking-tight`
- Category chip labels: `font-sans` (unified with hero — no clashing script fonts)

---

## 2. Color Palette — "Obsidian with Deep Gold"

Replace stark black with depth and warmth:

| Role | Current | New | Hex |
|------|---------|-----|-----|
| Primary background | `#000000` (black) | Obsidian | `#101115` |
| Card / container bg | `zinc-900` | Dark slate | `#181A1F` |
| Primary text | `white` | Off-white | `#D9DBE0` |
| Secondary text | `zinc-500` | Mid-tone gray | `#8E9196` |
| Accent | mixed (orange, blue) | Deep gold | `#C0A678` |

### Accent color usage:
- Active nav indicator line
- Selected filter border/highlight
- Active category chip text
- Price badge for paid items
- Hero subtitle or description accent word

### Tailwind Config — extend colors:
```js
colors: {
  obsidian: '#101115',
  slate: { card: '#181A1F' },
  gold: { DEFAULT: '#C0A678', light: '#D4BC96' },
  text: { primary: '#D9DBE0', secondary: '#8E9196' },
}
```

---

## 3. Create EmptyState Component

**File:** `src/components/storefront/EmptyState.tsx`

Renders when `faces.length === 0`:

- **Title:** "Coming Soon" (font-sans font-light text-2xl, text-primary)
- **Subtitle:** "Curated watchfaces are being prepared." (font-mono text-sm, text-secondary)
- Centered vertically + horizontally
- Obsidian background container with subtle border
- Optional: "Clear All Filters" button if any filters are active (ghost style, gold border)
- No fake content, no illustrations

---

## 4. Hide Product Grid When Empty

**File:** `src/components/storefront/WatchfaceGrid.tsx` (caller side)

When `faces.length === 0`:
- Do NOT render WatchfaceGrid at all
- No skeletons, no placeholders, no fake cards
- Remove existing emoji + "No watchfaces found" empty state from WatchfaceGrid internals

---

## 5. Enhance Hero Section

**File:** `src/components/storefront/HomePage.tsx`

Always render hero, even with no data:

- **Title:** "Flowvault" (`font-sans font-light text-4xl tracking-tight`)
- **Subtitle:** "Premium Watchfaces for Amazfit" (`font-sans font-normal text-lg text-secondary`)
- **Description:** "Designed for clarity, performance, and style." (`font-mono text-sm text-secondary`)
- Background: radial gradient from `#181A1F` center → `#101115` edges
- Centered layout, generous vertical padding (py-16 → py-20)
- No images, no fake watchfaces

---

## 6. Conditional Section Rendering

**File:** `src/components/storefront/HomePage.tsx`

```tsx
const hasFaces = results && results.length > 0;

{hasFaces && <WatchfaceGrid />}
{!hasFaces && <EmptyState />}
{hasFaces && <FilterSidebar />}
{hasFaces && <SortControls />}
```

When empty:
- Hide FilterSidebar completely
- Hide SortControls (no "0 results")
- Hide category cards grid
- Hide model chips row
- Show only: Hero + EmptyState

---

## 7. Category Chip Styling Refinement

**File:** `src/components/storefront/HomePage.tsx`

When faces exist:
- Ghost style: transparent bg + subtle `#181A1F` border
- Hover: border transitions to gold
- Active/selected: gold text + gold border
- Unify all icon/emoji to monochrome (no orange lightning bolt etc.)
- Equal padding on all chips (balanced grid)
- Labels use `font-sans` (unified with hero — no clashing fonts)
- Purpose: secondary navigation, not main feature

---

## 8. Filter Sidebar Styling

**File:** `src/components/storefront/FilterSidebar.tsx`

- Section titles (BRAND, WATCH MODEL): `font-mono text-xs uppercase tracking-widest text-secondary`
- Items below: indented, `font-sans text-sm text-primary`
- Each filter block in its own padded container (`bg-[#181A1F]` rounded, p-4)
- Generous spacing between blocks (space-y-4)
- Selected filter items: gold text or gold left border
- "Clear" button: gold text, ghost style

---

## 9. Hide Studio From Public Navigation

**File:** `src/components/storefront/StorefrontLayout.tsx`

- Remove "Studio" link/button from the storefront header navbar
- The `/studio` route stays functional (accessible via direct URL)
- Studio requires GitHub token anyway — no auth gate needed
- Admin navigates directly to `/Watch-Faces/studio`

---

## 10. Navbar Styling

**File:** `src/components/storefront/StorefrontLayout.tsx`

- "Flowvault" logo: slightly larger, `font-sans font-light tracking-tight`
- Nav items: `font-sans text-sm font-normal text-secondary`
- Active nav: `text-primary font-medium` + gold underline indicator
- Increase gap between items (gap-3+)
- Increase spacing between logo and nav
- Background: `bg-obsidian` with subtle bottom border `border-[#181A1F]`

---

## 11. Lazy-Load Editor Fonts

**File:** `index.html` + `src/StudioApp.tsx`

Currently: 30 Google Fonts loaded in `<link>` for ALL pages (including storefront).
Change:
- Remove the massive Google Fonts `<link>` from `index.html`
- Dynamically inject it in `StudioApp.tsx` on mount (only `/studio` needs them)
- Keep only Inter (+ Roboto Mono if not already loaded) in `index.html` for storefront
- Saves ~500KB on storefront page loads

---

## 12. Apply EmptyState to CategoryPage + ModelPage

- Edit: `src/components/storefront/CategoryPage.tsx`
- Edit: `src/components/storefront/ModelPage.tsx`
- When filtered results are empty:
  - Hide grid, sidebar, sort controls
  - Show EmptyState with contextual subtitle
  - CategoryPage: "No {category} watchfaces yet — coming soon."
  - ModelPage: "No watchfaces for {model} yet — coming soon."

---

## Acceptance Criteria

- [ ] Inter loads as primary font, Roboto Mono as secondary
- [ ] Background is obsidian `#101115`, not pure black
- [ ] Cards use `#181A1F` background
- [ ] Text uses off-white `#D9DBE0` primary, `#8E9196` secondary
- [ ] Gold accent `#C0A678` on active nav, selected filters, hover states
- [ ] No "No results" or "0 results" text visible anywhere
- [ ] No empty grids rendered
- [ ] No placeholder cards
- [ ] Hero section always visible with refined typography
- [ ] Sidebar + SortControls hidden when empty
- [ ] Category chips ghost-style, monochrome, equal padding
- [ ] Filter sidebar: mono titles, padded blocks, gold selections
- [ ] Studio link removed from public navbar
- [ ] `/studio` route still works via direct URL
- [ ] Editor fonts only load on `/studio`
- [ ] EmptyState on Category/Model pages too
- [ ] Page feels complete even with zero data

## Do NOT

- Add mock data or placeholder images
- Simulate watchfaces or add random UI fillers
- Use orange or other random accent colors (gold only)
- Break existing functionality when data IS present
- Change Studio/editor styling (only storefront)

## Result

User perception: **"This is a premium platform preparing content"**
Not: **"This is an empty unfinished tool"**
