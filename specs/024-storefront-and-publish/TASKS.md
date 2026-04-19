# Spec 024: Storefront & Publish System — TASKS

---

## Phase 1: Foundation

### Task 1.1: Install React Router
- `npm install react-router-dom`
- Add to package.json dependencies

### Task 1.2: Create Data Files
- Create `docs/catalog.json` (empty array `[]`)
- Create `docs/models.json` (all Amazfit models with specGroup mappings)
- Create `docs/specGroups.json` (all spec group definitions with deviceSources)

### Task 1.3: Set Up React Router
- Update `vite.config.ts`: change base from `'./'` to `'/Watch-Faces/'`
- Refactor `src/main.tsx` to wrap app in BrowserRouter
- Create `src/App.tsx` route structure:
  - `/studio` → current App component (renamed to StudioApp)
  - `/*` → StorefrontLayout (new)
- Move current App.tsx content to `src/components/StudioApp.tsx`

### Task 1.4: GitHub Pages SPA Fix
- Create `docs/404.html` with redirect script
- Ensure all routes resolve to index.html

### Task 1.5: Create CatalogProvider Context
- New file: `src/context/CatalogContext.tsx`
- Fetches catalog.json, models.json, specGroups.json on mount
- Provides: catalog, models, specGroups, loading state
- Filter/sort helper functions

---

## Phase 2: Storefront UI

### Task 2.1: StorefrontLayout
- New file: `src/components/storefront/StorefrontLayout.tsx`
- Header with Flowvault branding + persistent SearchBar
- Outlet for child routes
- Footer

### Task 2.2: SearchBar Component
- New file: `src/components/storefront/SearchBar.tsx`
- Text input with search icon
- On submit → navigate to /search?q={query}
- Appears in StorefrontLayout header on all pages

### Task 2.3: WatchfaceCard Component
- New file: `src/components/storefront/WatchfaceCard.tsx`
- Preview image thumbnail
- Name, price badge (FREE / $X.XX)
- Click → navigate to /face/{id}

### Task 2.4: WatchfaceGrid Component
- New file: `src/components/storefront/WatchfaceGrid.tsx`
- Responsive CSS grid of WatchfaceCard components
- Accepts filtered catalog array as prop
- Load More pagination (client-side)

### Task 2.5: FilterSidebar Component
- New file: `src/components/storefront/FilterSidebar.tsx`
- Brand dropdown (from models.json unique brands)
- Model dropdown (filtered by brand)
- Price filter: Free / Paid / All
- All filters update URL query params

### Task 2.6: SortControls Component
- New file: `src/components/storefront/SortControls.tsx`
- Dropdown: Latest, Most Downloaded, Price ↑, Price ↓, Free Only, Paid Only

### Task 2.7: HomePage
- New file: `src/components/storefront/HomePage.tsx`
- Model chips row (horizontal scrollable badges for each watch model)
- Category cards grid
- FilterSidebar + SortControls
- WatchfaceGrid showing all faces
- Search bar (from layout)

### Task 2.8: ModelPage
- New file: `src/components/storefront/ModelPage.tsx`
- Read :modelSlug param
- Lookup in models.json → get specGroup
- Filter catalog by specGroup
- Same FilterSidebar + SortControls + WatchfaceGrid
- Header shows model name

### Task 2.9: CategoryPage
- New file: `src/components/storefront/CategoryPage.tsx`
- Read :category param
- Filter catalog where categories includes param
- Sub-category cards if hierarchical
- Same filter/sort/grid UI

### Task 2.10: ProductPage
- New file: `src/components/storefront/ProductPage.tsx`
- Read :id param → find in catalog
- Large preview image
- Name, price, compatible models (reverse lookup specGroup → models)
- Buy / Download Free button
- QR code display
- Hashtag chips
- Category badges
- Download count
- Created date

### Task 2.11: SearchPage
- New file: `src/components/storefront/SearchPage.tsx`
- Read ?q= from URL
- Filter catalog by hashtags + name match
- Same grid/sort/filter UI

---

## Phase 3: Publish Flow

### Task 3.1: Slugify Utility
- New file: `src/lib/slugify.ts`
- slugify(name) → lowercase, hyphenated, no special chars
- checkCollision(slug, catalog) → append -2 if exists

### Task 3.2: specGroup Auto-Detection
- New file: `src/lib/specGroupDetector.ts`
- detectSpecGroup(resolution, shape, apiVersion) → specGroup key
- Reads specGroups.json data (from CatalogProvider or direct fetch)

### Task 3.3: Catalog API Utility
- New file: `src/lib/catalogApi.ts`
- fetchCatalog(): read current catalog.json from GitHub
- appendToCatalog(entry): fetch → append → upload updated catalog.json
- Uses existing GitHub API functions

### Task 3.4: source.json Generation
- Add to existing ZPK generation flow
- Serialize WatchFaceConfig elements + metadata
- Upload alongside ZPK

### Task 3.5: PublishForm Component
- New file: `src/components/PublishForm.tsx`
- Fields: Name, Price (toggle free/paid), Stripe Link, Categories (multi-select), Hashtags (textarea)
- Auto-display: slug preview, specGroup, compatible models
- "Publish to Store" button

### Task 3.6: Integrate Publish into App Flow
- Add "Publish" step after successful ZPK generation (Step 5)
- Wire PublishForm to:
  1. Generate slug
  2. Check collision
  3. Detect specGroup
  4. Upload source.json + assets
  5. Append catalog entry
  6. Show success with link to /face/{id}

### Task 3.7: Regenerate QR Button (Single Watchface)
- New function in `src/lib/githubApi.ts`: `regenerateSingleQR(config, watchfaceId, baseUrl)`
  - Constructs ZPK URL: `https://{owner}.github.io/{repo}/zpk/{watchfaceId}/face.zpk`
  - Calls `generateQRCode(zpkUrl)` → blob
  - Uploads to `docs/zpk/{watchfaceId}/qr.png` (overwrite)
  - Returns new QR data URL
- Add "Regenerate QR" button to StudioApp upload-success screen
  - Shows current watchfaceId in state
  - On click: calls `regenerateSingleQR`, updates displayed QR, shows toast

### Task 3.8: Batch QR Regeneration Panel in Studio
- New function in `src/lib/githubApi.ts`: `batchRegenerateQRCodes(config, catalog, baseUrl, onProgress)`
  - Iterates all catalog entries
  - For each: calls `regenerateSingleQR` (with delay between requests to avoid rate limiting)
  - Calls `onProgress(done, total, currentId)` callback after each
  - Returns `{ success: string[], failed: string[] }`
- Add "Admin" section to StudioApp (collapsible panel at bottom, only visible when GitHub token is set)
  - "Batch Regenerate All QR Codes" button
  - Progress bar: "X / N done"
  - Log of succeeded/failed IDs
  - Base URL field (prefilled from GitHub config, editable for domain change scenario)
- This replaces the need for a separate Node.js script (runs in-browser via Studio)
- Note: rate-limit safe — adds 500ms delay between each upload

---

## Phase 4: Payment & Download

### Task 4.1: BuyPage
- New file: `src/components/storefront/BuyPage.tsx`
- Read :id param → find in catalog
- Show: "You're purchasing {name} — ${price}"
- Preview image
- "Continue to Checkout" button → window.location = stripeLink

### Task 4.2: SuccessPage
- New file: `src/components/storefront/SuccessPage.tsx`
- Read :id param → find in catalog
- "Your watchface is ready!" message
- Preview image
- Download button (links to Firebase function or direct ZPK)
- QR code
- "Browse more" link

### Task 4.3: Firebase Project Setup
- Create Firebase project: flowvault
- Enable Firestore
- Create "downloads" collection
- Deploy Cloud Function: trackDownload
  - Increment counter
  - Redirect to ZPK file

### Task 4.4: Download Count Sync Script
- New file: `scripts/syncDownloads.ts`
- Fetch Firestore downloads → update catalog.json downloads fields
- Can run manually or via GitHub Actions cron

---

## Phase 5: Regeneration System

### Task 5.1: Regeneration Script
- New file: `scripts/regenerate.ts`
- Input: specGroup name
- For each matching watchface:
  1. Backup face.zpk → face.zpk.bak
  2. Read source.json
  3. Run code generator with updated specGroup deviceSources
  4. Write new face.zpk
  5. Verify (unzip, check app.json, check assets, check size)
  6. Rollback on failure

### Task 5.2: Rollback Script
- New file: `scripts/rollback.ts`
- Input: specGroup name (or "all")
- Restore face.zpk.bak → face.zpk for matching faces
- Verify restoration

---

## Phase 6: Domain & Polish

### Task 6.1: Domain Configuration
- Create `docs/CNAME` file
- Update vite.config.ts base path for custom domain
- Document DNS setup steps for user

### Task 6.2: GitHub Username Update
- Update default repo in AppContext.tsx
- Update any remaining references

### Task 6.3: QR Code Regeneration (Domain Change)
- Uses the Batch QR Regeneration Panel built in Task 3.8
- Update the base URL field in Studio's admin panel to point to the new domain
- Click "Batch Regenerate All QR Codes" — runs in-browser, no script needed
- No separate script required (3.8 covers this)

---

## Execution Order

```
Task 1.1 → 1.2 → 1.3 → 1.4 → 1.5
  → Task 2.1 → 2.2 → 2.3 → 2.4 → 2.5 → 2.6 → 2.7 → 2.8 → 2.9 → 2.10 → 2.11
  → Task 3.1 → 3.2 → 3.3 → 3.4 → 3.5 → 3.6 → 3.7 → 3.8
  → Task 4.1 → 4.2 → 4.3 → 4.4
  → Task 5.1 → 5.2
  → Task 6.1 → 6.2 → 6.3
```

Each task is independently testable. Stop after each for verification.
