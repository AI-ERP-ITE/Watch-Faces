# Spec 024: Storefront & Publish System — PLAN

## Problem Statement

The app currently only serves the **creator** (watchface editor → ZPK generation). There is no customer-facing experience. End users cannot browse, search, filter, or download watchfaces. The app has no routing — everything lives on a single page with step-based state transitions.

## Goals

1. Build a **customer-facing storefront** where users browse, search, filter, and download watchfaces
2. Add a **publish flow** in the creator studio that auto-generates metadata (catalog entry) alongside the ZPK
3. Implement **spec-group-based matching** so watchfaces are model-agnostic but correctly surface for compatible watch models
4. Add **branded payment flow** via Stripe Payment Links for paid watchfaces
5. Add **Firebase download counter** to power "most downloaded" sorting
6. Prepare for **custom domain** (flowvault.com) and **GitHub username rename**
7. Build **batch regeneration system** with backup/verify/rollback for new model launches

## Architecture Decisions

### ZPK Storage: Flat, Model-Agnostic
- One folder per watchface: `docs/zpk/{id}/`
- ZPK binary knows nothing about the store (no metadata inside)
- source.json + assets/ stored alongside for future regeneration
- No duplication per model. Ever.

### Matching: Spec Groups, Not Model Tags
- Watchface metadata stores a `specGroup` (e.g., "480-round-v2")
- specGroup = resolution + shape + apiVersion
- models.json maps model slugs → specGroups
- When user visits /balance-2, system looks up specGroup → filters catalog
- New model same specGroup = instant compatibility (just add to models.json)

### Metadata: Separate Layer from ZPK
- catalog.json = all watchface entries (id, name, specGroup, hashtags, categories, price, paths)
- models.json = all watch models → specGroup mapping
- specGroups.json = spec group definitions (resolution, shape, apiVersion, deviceSources)
- All JSON files in docs/ served by GitHub Pages
- Client-side filtering/searching on catalog.json

### Naming: Single Field, Auto-Slug
- User types name ("Gothic Dark")
- System auto-generates slug/ID ("gothic-dark")
- Both stored in catalog entry
- Collision → append "-2"

### Routing: React Router (SPA)
- /studio → Creator studio (current app, unchanged)
- /* → Storefront (new pages)
- 404.html redirect trick for GitHub Pages SPA

### Payments: Stripe Payment Links (No Backend)
- Paid faces: /buy/{id} → branded page → redirect to Stripe
- Post-payment: Stripe redirects to /success/{id}
- Free faces: skip Stripe, go directly to download page
- User never sees raw Stripe URL

### Download Counting: Firebase Cloud Function
- Download button → hits Firebase function → increments counter → redirects to ZPK
- Counts synced back to catalog.json periodically
- Powers "most downloaded" sort

### Regeneration: Fresh Build from source.json
- Never patch ZPK files
- Backup face.zpk → face.zpk.bak before regeneration
- Read source.json → run same generator → fresh ZPK
- Verify → rollback on failure
- Git tag as nuclear rollback option

## What Does NOT Change
- ZPK generation code (V2/V3 generators)
- Canvas editor
- AI pipeline
- HTML parser
- Background editor
- Icon/font libraries
- Element property panel

## Phases Overview
1. Foundation (Router, data files, SPA redirect, specGroup detection)
2. Storefront UI (Home, model pages, category pages, product detail, search, filters)
3. Publish Flow (Form, slug generation, source.json, catalog append)
4. Payment & Download (Stripe pages, Firebase counter, download sync)
5. Regeneration System (Batch script, backup/verify/rollback)
6. Domain & Polish (Domain purchase, CNAME, username rename, QR regen)
