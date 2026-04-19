# Spec 024: Storefront & Publish System — SPECS

---

## S1. Data Architecture

### S1.1 catalog.json

Location: `docs/catalog.json`

```json
[
  {
    "id": "gothic-dark",
    "name": "Gothic Dark",
    "specGroup": "480-round-v2",
    "categories": ["premium"],
    "hashtags": ["gothic", "dark", "elegant", "black", "minimalist"],
    "price": 0,
    "stripeLink": null,
    "createdAt": "2026-04-19",
    "downloads": 0,
    "zpkPath": "zpk/gothic-dark/face.zpk",
    "previewPath": "zpk/gothic-dark/preview.png",
    "qrPath": "zpk/gothic-dark/qr.png"
  }
]
```

Rules:
- `id`: auto-slugified from `name`. Lowercase, hyphens, no special chars.
- `id` collision: append `-2`, `-3`, etc.
- `price`: 0 = free. >0 = paid (in USD).
- `stripeLink`: Stripe Payment Link URL. null if free.
- `downloads`: integer, updated by sync script from Firebase.
- Paths are relative to docs/ root.

### S1.2 models.json

Location: `docs/models.json`

```json
{
  "balance-2":        { "name": "Amazfit Balance 2",        "brand": "amazfit", "specGroup": "480-round-v2" },
  "balance":          { "name": "Amazfit Balance",          "brand": "amazfit", "specGroup": "480-round-v2" },
  "active-max":       { "name": "Amazfit Active Max",       "brand": "amazfit", "specGroup": "480-round-v2" },
  "active-3-premium": { "name": "Amazfit Active 3 Premium", "brand": "amazfit", "specGroup": "480-round-v2-b" },
  "gtr-4":            { "name": "Amazfit GTR 4",            "brand": "amazfit", "specGroup": "round-v3-a" },
  "gts-4":            { "name": "Amazfit GTS 4",            "brand": "amazfit", "specGroup": "square-v3-a" },
  "active-2-round":   { "name": "Amazfit Active 2 Round",   "brand": "amazfit", "specGroup": "round-v3-a" },
  "active-2-square":  { "name": "Amazfit Active 2 Square",  "brand": "amazfit", "specGroup": "square-v3-a" },
  "active":           { "name": "Amazfit Active",           "brand": "amazfit", "specGroup": "round-v3-a" },
  "pop-3s":           { "name": "Amazfit Pop 3S",           "brand": "amazfit", "specGroup": "round-v3-a" },
  "cheetah-pro":      { "name": "Amazfit Cheetah Pro",      "brand": "amazfit", "specGroup": "round-v3-a" },
  "t-rex-2":          { "name": "Amazfit T-Rex 2",          "brand": "amazfit", "specGroup": "round-v3-a" },
  "falcon":           { "name": "Amazfit Falcon",           "brand": "amazfit", "specGroup": "round-v3-a" }
}
```

### S1.3 specGroups.json

Location: `docs/specGroups.json`

```json
{
  "480-round-v2": {
    "resolution": "480x480",
    "shape": "round",
    "apiVersion": "v2",
    "deviceSources": [8519936, 8519937, 8519939]
  },
  "480-round-v2-b": {
    "resolution": "480x480",
    "shape": "round",
    "apiVersion": "v2",
    "deviceSources": [8388608, 8388609]
  },
  "round-v3-a": {
    "resolution": "466x466",
    "shape": "round",
    "apiVersion": "v3",
    "deviceSources": [8388608, 8388609]
  },
  "square-v3-a": {
    "resolution": "390x450",
    "shape": "square",
    "apiVersion": "v3",
    "deviceSources": [8388610, 8388611]
  }
}
```

### S1.4 Per-Watchface Storage

```
docs/zpk/{id}/
  face.zpk          ← live product (served to customers)
  face.zpk.bak      ← backup (created before regeneration)
  preview.png        ← storefront thumbnail (480x480 or canvas screenshot)
  qr.png             ← QR code (zpkd1:// protocol)
  source.json        ← full editor state for regeneration
  assets/            ← original images used in watchface
```

source.json structure:
```json
{
  "name": "Gothic Dark",
  "specGroup": "480-round-v2",
  "resolution": "480x480",
  "shape": "round",
  "watchModel": "Amazfit Balance 2",
  "elements": [ "...full WatchFaceConfig.elements array..." ],
  "background": "assets/background.png",
  "generatorVersion": "v2"
}
```

---

## S2. Routing

### S2.1 React Router Structure

```
<BrowserRouter basename="/Watch-Faces">
  <Routes>
    {/* Storefront */}
    <Route path="/" element={<StorefrontLayout />}>
      <Route index element={<HomePage />} />
      <Route path=":modelSlug" element={<ModelPage />} />
      <Route path="category/:category" element={<CategoryPage />} />
      <Route path="category/:category/:sub" element={<SubCategoryPage />} />
      <Route path="face/:id" element={<ProductPage />} />
      <Route path="buy/:id" element={<BuyPage />} />
      <Route path="success/:id" element={<SuccessPage />} />
      <Route path="search" element={<SearchPage />} />
    </Route>

    {/* Creator Studio */}
    <Route path="/studio" element={<StudioApp />} />
  </Routes>
</BrowserRouter>
```

### S2.2 GitHub Pages SPA Fix

File: `docs/404.html`

Redirects all paths to index.html preserving the path as a query parameter. Standard GitHub Pages SPA technique.

### S2.3 Vite Config

```typescript
base: '/Watch-Faces/'  // change from './' to absolute for router compatibility
```

---

## S3. Storefront Pages

### S3.1 StorefrontLayout

Wraps all storefront pages. Contains:
- Header with Flowvault branding
- Persistent search bar (hashtag + name search)
- Footer

### S3.2 HomePage

- Hero banner (featured watchface or rotating showcase)
- Model chips row: horizontal scroll of watch model badges
- Category cards: grid of style categories
- Filter sidebar: Brand, Model, Price range
- Sort controls: Latest, Most Downloaded, Paid, Free, Price ↑, Price ↓
- Watchface grid: responsive card grid with lazy-load
- Load More button (paginate catalog.json client-side)

### S3.3 ModelPage (/:modelSlug)

- Lookup modelSlug in models.json → get specGroup
- Filter catalog.json where entry.specGroup === specGroup
- Same filter/sort/search UI as HomePage
- Header shows model name and image

### S3.4 CategoryPage (/category/:cat)

- Filter catalog.json where entry.categories includes cat
- Hierarchical: if sub-categories exist, show sub-category cards
- Same filter/sort/search UI

### S3.5 ProductPage (/face/:id)

- Large preview image
- Watchface name
- Compatible watch models (derive from specGroup → models.json reverse lookup)
- Price badge (FREE or $X.XX)
- Buy/Download button
- QR code (scan to install)
- Hashtag chips
- Category badges
- Created date
- Download count (from catalog.json)

### S3.6 BuyPage (/buy/:id)

- Branded pre-checkout page
- Shows: "You're purchasing {name} — ${price}"
- Preview image
- "Continue to Checkout" button → window.location = stripeLink
- User feels they're still on Flowvault

### S3.7 SuccessPage (/success/:id)

- "Your watchface is ready!"
- Preview image
- Download Watchface button (triggers Firebase count + download)
- QR code for direct watch install
- "Browse more watchfaces" link

### S3.8 SearchPage (/search?q=...)

- Read q from query params
- Filter catalog.json: match against hashtags array + name (case-insensitive)
- Same grid/sort/filter UI

---

## S4. Search & Filter System

### S4.1 Persistent Search Bar

Component: `<SearchBar />`
- Rendered in StorefrontLayout header (visible on ALL storefront pages)
- Input field with search icon
- On submit → navigate to /search?q={query}
- Supports space-separated terms (AND logic)

### S4.2 Filter Sidebar

Component: `<FilterSidebar />`
- Brand dropdown (populated from models.json unique brands)
- Model dropdown (populated from models.json, filtered by selected brand)
- Price range: Free / Paid / Custom range slider
- All filters intersect (AND logic)
- URL query params preserved: ?brand=amazfit&price=free&sort=latest

### S4.3 Sort Controls

Component: `<SortControls />`
- Latest (createdAt descending)
- Most Downloaded (downloads descending)
- Price: Low → High
- Price: High → Low
- Free Only (price === 0)
- Paid Only (price > 0)

### S4.4 Catalog Data Provider

Context: `<CatalogProvider>`
- Fetches catalog.json, models.json, specGroups.json once on app load
- Caches in React state
- Provides filtered/sorted results to all pages
- Re-filters instantly on filter/sort/search change (no network calls)

---

## S5. Publish Flow (Creator Studio)

### S5.1 Publish Form Component

New component: `<PublishForm />`
Appears as Step 5 after successful ZPK generation.

Fields:
- Name (text input) → auto-shows generated slug below
- Price toggle: Free / Paid
- Price amount (number input, shown if Paid)
- Stripe Payment Link (URL input, shown if Paid)
- Categories (multi-select dropdown from predefined list)
- Hashtags (text area, comma or space separated, minimum 10 recommended)

Auto-detected (read-only display):
- Spec Group (from canvas resolution + shape + generator version)
- Compatible Watch Models (reverse lookup from specGroup → models.json)

### S5.2 Slug Generation

```typescript
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
```

Collision check: fetch catalog.json → if id exists → append `-2`, `-3`, etc.

### S5.3 specGroup Auto-Detection

```typescript
function detectSpecGroup(
  resolution: string,    // "480x480" from canvas
  shape: string,         // "round" from canvas
  apiVersion: string     // "v2" or "v3" from generator selection
): string {
  // Match against specGroups.json entries
  // Return matching specGroup key or "unknown"
}
```

### S5.4 source.json Generation

Serialize current WatchFaceConfig state:
```typescript
const sourceData = {
  name: config.name,
  specGroup: detectedSpecGroup,
  resolution: `${config.screenWidth}x${config.screenHeight}`,
  shape: config.shape,
  watchModel: config.watchModel,
  elements: config.elements,
  background: 'assets/background.png',
  generatorVersion: config.apiVersion === 'v2' ? 'v2' : 'v3'
};
```

### S5.5 Publish Action

On "Publish to Store" click:
1. Generate slug from name
2. Check collision against catalog.json
3. Detect specGroup
4. Upload to GitHub (extends existing uploadZPKWithQR):
   - docs/zpk/{id}/face.zpk (already generated)
   - docs/zpk/{id}/preview.png (already generated)
   - docs/zpk/{id}/qr.png (already generated)
   - docs/zpk/{id}/source.json (new)
   - docs/zpk/{id}/assets/* (new: background + element images)
5. Fetch current catalog.json from GitHub
6. Append new entry
7. Upload updated catalog.json
8. Show success with link to /face/{id}

---

## S6. Payment & Download Flow

### S6.1 Free Download Flow

```
/face/{id} → "Download Free" button
  → navigate to /success/{id}
  → show download button
  → click download → Firebase trackDownload → redirect to ZPK
```

### S6.2 Paid Download Flow

```
/face/{id} → "Buy ${price}" button
  → navigate to /buy/{id}
  → branded checkout page
  → "Continue to Checkout" → redirect to Stripe Payment Link
  → user pays on Stripe
  → Stripe success_url = flowvault.com/Watch-Faces/success/{id}
  → /success/{id} shows download button
  → click download → Firebase trackDownload → redirect to ZPK
```

### S6.3 Firebase Cloud Function: trackDownload

```typescript
// Firebase Cloud Function
exports.trackDownload = functions.https.onRequest(async (req, res) => {
  const id = req.query.id;
  if (!id) return res.status(400).send('Missing id');

  // Increment counter
  const ref = firestore.collection('downloads').doc(id);
  await ref.set(
    { count: admin.firestore.FieldValue.increment(1) },
    { merge: true }
  );

  // Redirect to actual file
  const baseUrl = 'https://flowvault.com/Watch-Faces';
  res.redirect(302, `${baseUrl}/zpk/${id}/face.zpk`);
});
```

### S6.4 Download Count Sync

Script (manual or cron):
1. Fetch all documents from Firestore downloads collection
2. Read catalog.json
3. Update downloads field per entry
4. Commit updated catalog.json to GitHub

---

## S7. Regeneration System

### S7.1 Regeneration Script

Node.js script: `scripts/regenerate.ts`

Input: specGroup name (e.g., "480-round-v2")

```
1. git tag pre-regen-{specGroup}-{date}
2. Read specGroups.json → get updated deviceSources
3. Read catalog.json → filter entries where specGroup matches
4. For each matching watchface:
   a. Copy docs/zpk/{id}/face.zpk → face.zpk.bak
   b. Read docs/zpk/{id}/source.json
   c. Run code generator with current specGroup deviceSources
   d. Write new docs/zpk/{id}/face.zpk
   e. Verify:
      - Unzip → app.json contains new deviceSources ✓
      - Asset count matches source.json elements ✓
      - ZPK size > 10KB ✓
   f. On verify fail:
      - Restore face.zpk.bak → face.zpk
      - Log error
      - Continue to next face
5. Print summary: X succeeded, Y failed
6. If all pass → git add + commit + push
```

### S7.2 Rollback Commands

```bash
# Per-file rollback (fast)
Copy-Item docs/zpk/{id}/face.zpk.bak docs/zpk/{id}/face.zpk -Force

# Batch rollback (all .bak files)
Get-ChildItem docs/zpk/*/face.zpk.bak -Recurse | ForEach-Object {
    Copy-Item $_ ($_.FullName -replace '\.bak$','') -Force
}

# Nuclear rollback (git tag)
git checkout pre-regen-{tag} -- docs/zpk/
```

---

## S8. UI Component List

### New Storefront Components
| Component | Location | Purpose |
|-----------|----------|---------|
| StorefrontLayout | src/components/storefront/StorefrontLayout.tsx | Wrapper: header + search + footer |
| HomePage | src/components/storefront/HomePage.tsx | Main browse page |
| ModelPage | src/components/storefront/ModelPage.tsx | Filtered by watch model |
| CategoryPage | src/components/storefront/CategoryPage.tsx | Filtered by style category |
| ProductPage | src/components/storefront/ProductPage.tsx | Single watchface detail |
| BuyPage | src/components/storefront/BuyPage.tsx | Pre-checkout branded page |
| SuccessPage | src/components/storefront/SuccessPage.tsx | Post-payment download page |
| SearchPage | src/components/storefront/SearchPage.tsx | Search results |
| SearchBar | src/components/storefront/SearchBar.tsx | Persistent search input |
| FilterSidebar | src/components/storefront/FilterSidebar.tsx | Brand/model/price filters |
| SortControls | src/components/storefront/SortControls.tsx | Sort dropdown |
| WatchfaceCard | src/components/storefront/WatchfaceCard.tsx | Grid card for one face |
| WatchfaceGrid | src/components/storefront/WatchfaceGrid.tsx | Responsive grid of cards |
| ModelChips | src/components/storefront/ModelChips.tsx | Horizontal scroll of model badges |
| CategoryCards | src/components/storefront/CategoryCards.tsx | Grid of category tiles |

### New Creator Components
| Component | Location | Purpose |
|-----------|----------|---------|
| PublishForm | src/components/PublishForm.tsx | Step 5 publish form |

### New Context/Hooks
| Item | Location | Purpose |
|------|----------|---------|
| CatalogProvider | src/context/CatalogContext.tsx | Fetch + cache + filter catalog data |
| useCatalog | src/hooks/useCatalog.ts | Hook for accessing catalog context |
| useFilters | src/hooks/useFilters.ts | Filter/sort state management |

### New Lib/Utils
| Item | Location | Purpose |
|------|----------|---------|
| slugify | src/lib/slugify.ts | Name → slug conversion |
| specGroupDetector | src/lib/specGroupDetector.ts | Canvas → specGroup mapping |
| catalogApi | src/lib/catalogApi.ts | Read/write catalog.json via GitHub API |

---

## S9. Domain & Deployment

### S9.1 Custom Domain Setup

1. Buy flowvault.com from registrar
2. DNS: A records → GitHub Pages IPs (185.199.108-111.153)
3. DNS: CNAME www → flowvault.github.io
4. File: docs/CNAME containing `flowvault.com`
5. GitHub Settings → Pages → Custom domain → flowvault.com → Enforce HTTPS

### S9.2 GitHub Username Rename

1. GitHub Settings → Change username → "Flowvault"
2. Local: `git remote set-url origin https://github.com/Flowvault/Watch-Faces.git`
3. Update AppContext.tsx default: `'Flowvault/Watch-Faces'`
4. Regenerate all QR codes with new domain

### S9.3 Vite Base Path

Change from `'./'` to `'/Watch-Faces/'` for React Router compatibility.
When custom domain active, change to `'/'`.
