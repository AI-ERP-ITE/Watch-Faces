# Spec 012 — Unified Design Input (Image or HTML)

## Problem
The sidebar currently has a top-level "AI Pipeline / HTML Layout" mode toggle and two separate upload zones in AI mode ("Background Image" + "Full Design"). This is confusing:
- The "Full Design" zone is never replaced by an HTML paste area
- Users must switch modes to use HTML input
- The two workflows feel disconnected

## Goal
Remove the mode toggle. Collapse everything into a single, unified input panel:
- **Background Image** — always an UploadZone (with crop tool, already in Spec 011)
- **Design Input** — a two-tab widget: `[↑ Image]` | `[</> HTML]`
  - **Image tab**: existing UploadZone for full design image → feeds AI pipeline
  - **HTML tab**: textarea to paste HTML → feeds HTML pipeline (parseDom + mapDomToElements)

The pipeline is selected automatically based on which input is active when "Analyze / Load" is clicked.

## UI Changes
- Remove `<div>` mode toggle ("✦ AI Pipeline" | "</> HTML Layout")
- Remove `inputMode` state (or repurpose it to the design-input tab)
- Replace Full Design UploadZone + HTML textarea + Live Preview panel with a unified `<DesignInput>` component
- Single action button: label = "Analyze with AI" when Image tab active, "Load Layout" when HTML tab active

## DesignInput Component (`src/components/DesignInput.tsx`)
Props:
```ts
interface DesignInputProps {
  imageValue: string | null;
  htmlValue: string;
  activeTab: 'image' | 'html';
  onTabChange: (tab: 'image' | 'html') => void;
  onImageChange: (img: string) => void;
  onImageFileChange: (file: File | null) => void;
  onHtmlChange: (html: string) => void;
  bgImage: string | null; // for live preview
}
```

## Pipeline Routing (App.tsx)
- `activeTab === 'image'` → call existing `handleAnalyze()` (AI pipeline)
- `activeTab === 'html'` → call existing `handleLoadLayout()` (HTML pipeline)
- Action button is disabled when:
  - Image tab: `!state.backgroundImage || !state.fullDesignImage`
  - HTML tab: `!htmlInput.trim()`
