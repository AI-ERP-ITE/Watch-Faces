# PROJECT COMPLETE REPO FILE
# Zepp Watchface Maker - Full Source Code + Architecture
# Generated: 2026-04-14 18:09
# Target: Amazfit Balance 2 (480x480, round, Zepp OS V2)
# Stack: TypeScript 5.9, React 19, Vite 7, vitest 4
# GitHub: https://github.com/AI-ERP-ITE/Watch-Faces
# Live: https://ai-erp-ite.github.io/Watch-Faces/

---

## ARCHITECTURE OVERVIEW

14-stage deterministic pipeline that converts a watchface design image into
installable Zepp OS V2 code (.zpk) for Amazfit Balance 2.

### Pipeline Stages:
1. AI Vision Analysis (Gemini 2.5 Flash) → extracts visual elements from image
2. Validate → ensures elements have required fields, fills defaults
3. Representation Correction → maps element types to correct Zepp widget types
4. Normalize → canonicalizes colors, angles, coordinates to device space (480×480)
5. Sort by Priority → orders arcs/progress indicators by semantic importance
6. Layout Engine → distributes elements spatially, avoids overflow
7. Geometry Solver → computes exact px coordinates, respects round bezel
8. Asset Resolver → generates/maps asset file paths
9. Bridge → converts pipeline elements to WatchFaceConfig format
10. Code Generator V2 → emits watchface/index.js + app.json + app.js
11. Asset Image Generator → renders PNG assets via canvas
12. ZPK Builder → packages everything into installable .zpk

### Key Constraints:
- MAX_ARCS = 2 (Zepp OS limitation)
- All coordinates use px() wrapper
- TIME_POINTER = ONE widget with all 3 hands (hour/minute/second)
- Representation drives widget selection (not element type alone)
- configVersion: "v3", targets.default.module.watchface path structure

---


## CONFIG FILES

### FILE: `package.json`

```json
{
  "name": "my-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@hookform/resolvers": "^5.2.2",
    "@radix-ui/react-accordion": "^1.2.12",
    "@radix-ui/react-alert-dialog": "^1.1.15",
    "@radix-ui/react-aspect-ratio": "^1.1.8",
    "@radix-ui/react-avatar": "^1.1.11",
    "@radix-ui/react-checkbox": "^1.3.3",
    "@radix-ui/react-collapsible": "^1.1.12",
    "@radix-ui/react-context-menu": "^2.2.16",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-hover-card": "^1.1.15",
    "@radix-ui/react-label": "^2.1.8",
    "@radix-ui/react-menubar": "^1.1.16",
    "@radix-ui/react-navigation-menu": "^1.2.14",
    "@radix-ui/react-popover": "^1.1.15",
    "@radix-ui/react-progress": "^1.1.8",
    "@radix-ui/react-radio-group": "^1.3.8",
    "@radix-ui/react-scroll-area": "^1.2.10",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-separator": "^1.1.8",
    "@radix-ui/react-slider": "^1.3.6",
    "@radix-ui/react-slot": "^1.2.4",
    "@radix-ui/react-switch": "^1.2.6",
    "@radix-ui/react-tabs": "^1.1.13",
    "@radix-ui/react-toggle": "^1.1.10",
    "@radix-ui/react-toggle-group": "^1.1.11",
    "@radix-ui/react-tooltip": "^1.2.8",
    "@types/qrcode": "^1.5.6",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.1.1",
    "date-fns": "^4.1.0",
    "embla-carousel-react": "^8.6.0",
    "input-otp": "^1.4.2",
    "jszip": "^3.10.1",
    "lucide-react": "^0.562.0",
    "next-themes": "^0.4.6",
    "qrcode": "^1.5.4",
    "react": "^19.2.0",
    "react-day-picker": "^9.13.0",
    "react-dom": "^19.2.0",
    "react-hook-form": "^7.70.0",
    "react-resizable-panels": "^4.2.2",
    "recharts": "^2.15.4",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.4.0",
    "vaul": "^1.1.2",
    "zod": "^4.3.5"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.1",
    "@types/node": "^24.10.1",
    "@types/react": "^19.2.5",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^5.1.1",
    "autoprefixer": "^10.4.23",
    "eslint": "^9.39.1",
    "eslint-plugin-react-hooks": "^7.0.1",
    "eslint-plugin-react-refresh": "^0.4.24",
    "globals": "^16.5.0",
    "kimi-plugin-inspect-react": "^1.0.3",
    "postcss": "^8.5.6",
    "tailwindcss": "^3.4.19",
    "tailwindcss-animate": "^1.0.7",
    "tw-animate-css": "^1.4.0",
    "typescript": "~5.9.3",
    "typescript-eslint": "^8.46.4",
    "vite": "^7.2.4",
    "vitest": "^4.1.4"
  }
}

```

### FILE: `tsconfig.json`

```json
{
  "files": [],
  "references": [
    {
      "path": "./tsconfig.app.json"
    },
    {
      "path": "./tsconfig.node.json"
    }
  ],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### FILE: `tsconfig.app.json`

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "types": ["vite/client"],
    "skipLibCheck": true,

    "baseUrl": ".",
    "paths": {
      "@/*": [
        "./src/*"
      ]
    },
    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["src"]
}

```

### FILE: `tsconfig.node.json`

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "ES2023",
    "lib": ["ES2023"],
    "module": "ESNext",
    "types": ["node"],
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["vite.config.ts"]
}

```

### FILE: `vite.config.ts`

```typescript
import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [inspectAttr(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

```

### FILE: `tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

### FILE: `postcss.config.js`

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

```

### FILE: `eslint.config.js`

```javascript
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
])

```

### FILE: `components.json`

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "postcss.config.js",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "registries": {}
}

```

### FILE: `index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Watch Face Creator</title>
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='45' fill='%230d9488'/><circle cx='50' cy='50' r='40' fill='%2323c55e'/></svg>" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>

```


## TYPE DEFINITIONS (src/types/)

### FILE: `src/types/index.ts`

```typescript
// Watch Face Creator Types

export interface WatchFaceElement {
  id: string;
  type: 'TIME_POINTER' | 'IMG_LEVEL' | 'TEXT' | 'IMG' | 'ARC_PROGRESS' | 'CIRCLE' | 'TEXT_IMG' | 'BUTTON' | 'IMG_STATUS';
  subtype?: string;
  name: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  center?: {
    x: number;
    y: number;
  };
  color?: string;
  src?: string;
  dataType?: string;
  images?: string[];
  text?: string;
  fontSize?: number;
  font?: string;
  visible: boolean;
  zIndex: number;

  // ARC_PROGRESS specific
  radius?: number;
  startAngle?: number;
  endAngle?: number;
  lineWidth?: number;

  // TIME_POINTER specific
  hourHandSrc?: string;
  minuteHandSrc?: string;
  secondHandSrc?: string;
  coverSrc?: string;
  pointerCenter?: { x: number; y: number };
  hourPos?: { x: number; y: number };
  minutePos?: { x: number; y: number };
  secondPos?: { x: number; y: number };

  // BUTTON specific
  clickAction?: string;
  pressSrc?: string;
  normalSrc?: string;

  // IMG_STATUS specific
  statusType?: string;

  // TEXT_IMG specific
  fontArray?: string[];
  hSpace?: number;
  alignH?: string;
}

export interface WatchFaceConfig {
  name: string;
  resolution: {
    width: number;
    height: number;
  };
  background: {
    src: string;
    format: 'TGA-P' | 'TGA-RLP' | 'TGA-16' | 'TGA-32';
  };
  elements: WatchFaceElement[];
  watchModel: string;
}

export interface GeneratedCode {
  appJson: string;
  appJs: string;
  watchfaceIndexJs: string;
}

export interface KimiResponse {
  config: WatchFaceConfig;
  elements: ElementImage[];
  code: GeneratedCode;
  metadata: {
    resolution: string;
    estimatedFileSize: string;
    compatibility: string[];
  };
}

export interface ElementImage {
  name: string;
  dataUrl: string;
  file?: File;
  src?: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  type: string;
}

export interface GitHubUploadResult {
  success: boolean;
  url?: string;
  downloadUrl?: string;
  watchfaceId?: string;  // For folder-based organization
  qrUrl?: string;        // URL to access QR code from GitHub Pages
  error?: string;
}

export type AppStep = 'upload' | 'analyzing' | 'preview' | 'generating' | 'success';

export interface AppState {
  currentStep: AppStep;
  backgroundImage: string | null;
  backgroundFile: File | null;
  fullDesignImage: string | null;
  fullDesignFile: File | null;
  watchFaceConfig: WatchFaceConfig | null;
  elementImages: ElementImage[];
  generatedCode: GeneratedCode | null;
  zpkBlob: Blob | null;
  githubUrl: string | null;
  qrCodeDataUrl: string | null;
  isLoading: boolean;
  loadingMessage: string;
  error: string | null;
  githubToken: string;
  githubRepo: string;
}

```

### FILE: `src/types/pipeline.ts`

```typescript
// Pipeline Types â€” Strict contracts between every stage of the deterministic pipeline.
// AI outputs semantic + representation data. Spatial/geometry data is computed in code.

// â”€â”€â”€ Stage 0: AI Extraction Output â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/** @deprecated Use Group instead. Kept temporarily for backward compatibility during migration. */
export type Region = 'center' | 'top' | 'bottom' | 'left' | 'right';

/** How the element visually appears in the design. */
export type Representation = 'text' | 'arc' | 'icon' | 'text+icon' | 'text+arc' | 'number';

/** Spatial arrangement pattern for the element. */
export type LayoutMode = 'row' | 'arc' | 'standalone' | 'grid';

/** Which zone of the watch face the element belongs to (replaces Region). */
export type Group =
  | 'center'
  | 'top'
  | 'bottom'
  | 'left_panel'
  | 'right_panel'
  | 'top_left'
  | 'top_right'
  | 'bottom_left'
  | 'bottom_right';

export type AIElementType =
  | 'time'
  | 'date'
  | 'steps'
  | 'battery'
  | 'heart_rate'
  | 'arc'
  | 'text'
  | 'weather'
  | 'spo2'
  | 'calories'
  | 'distance'
  | 'weekday'
  | 'month';

export type AIStyle = 'analog' | 'digital' | 'minimal' | 'bold';

/** Output from AI vision model â€” semantic + representation, no coordinates or sizes. */
export interface AIElement {
  id: string;
  type: AIElementType;
  /** How this element visually appears (text, arc, icon, compound). */
  representation: Representation;
  /** Spatial arrangement pattern. */
  layout: LayoutMode;
  /** Which zone of the watch face. */
  group: Group;
  /** Visual weight hint. */
  importance?: 'primary' | 'secondary';
  style?: AIStyle;
  confidence?: number;
  /** @deprecated Use group instead. Kept for backward compat during migration. */
  region?: Region;
}

/** Wrapper for the full AI response payload. */
export interface AIExtractionResult {
  elements: AIElement[];
}

// â”€â”€â”€ Stage 1: Normalized Elements â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type ZeppWidget =
  | 'TIME_POINTER'
  | 'IMG_TIME'
  | 'IMG_DATE'
  | 'IMG_WEEK'
  | 'ARC_PROGRESS'
  | 'TEXT'
  | 'TEXT_IMG'
  | 'IMG'
  | 'IMG_STATUS'
  | 'IMG_LEVEL';

export interface NormalizedElement {
  id: string;
  widget: ZeppWidget;
  /** Which zone of the watch face. */
  group: Group;
  /** Spatial arrangement pattern. */
  layout: LayoutMode;
  /** Original AI type preserved for downstream logic */
  sourceType: AIElementType;
  /** Data binding type for the widget (e.g. BATTERY, STEP, HEART) */
  dataType?: string;
  /** For compound-expanded elements, points to the parent AIElement id. */
  parentId?: string;
  /** @deprecated Use group instead. Kept for backward compat during migration. */
  region?: Region;
}

// â”€â”€â”€ Stage 2: Layout â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface LayoutElement extends NormalizedElement {
  centerX: number;
  centerY: number;
}

// â”€â”€â”€ Stage 3: Geometry â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface GeometryElement extends LayoutElement {
  // TIME_POINTER
  posX?: number;
  posY?: number;
  hourPosX?: number;
  hourPosY?: number;
  minutePosX?: number;
  minutePosY?: number;
  secondPosX?: number;
  secondPosY?: number;

  // ARC_PROGRESS
  radius?: number;
  startAngle?: number;
  endAngle?: number;
  lineWidth?: number;

  // TEXT / TEXT_IMG / IMG
  x?: number;
  y?: number;
  w?: number;
  h?: number;
}

// â”€â”€â”€ Stage 4: Asset-Resolved (Final before code gen) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface ResolvedElement extends GeometryElement {
  assets: ResolvedAssets;
}

export interface ResolvedAssets {
  /** Primary image source (for IMG, IMG_STATUS, etc.) */
  src?: string;
  /** Digit image arrays (for IMG_TIME, IMG_DATE, TEXT_IMG) */
  fontArray?: string[];
  /** Clock hand sources (for TIME_POINTER) */
  hourHandSrc?: string;
  minuteHandSrc?: string;
  secondHandSrc?: string;
  coverSrc?: string;
  /** Week/month image arrays */
  weekArray?: string[];
  monthArray?: string[];
  /** IMG_LEVEL image array */
  imageArray?: string[];
}

// â”€â”€â”€ Validation Error â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export class PipelineValidationError extends Error {
  stage: string;
  violations: string[];

  constructor(stage: string, violations: string[]) {
    super(`[Pipeline:${stage}] Validation failed:\n${violations.map(v => `  - ${v}`).join('\n')}`);
    this.name = 'PipelineValidationError';
    this.stage = stage;
    this.violations = violations;
  }
}

```


## PIPELINE CORE (src/pipeline/)

### FILE: `src/pipeline/index.ts`

```typescript
// Pipeline Orchestrator â€” Multi-stage pipeline with AI + deterministic stages.
// Stage A (AI vision) â†’ Validate (representation/layout/group) â†’ Normalize (representation â†’ widget)
// â†’ Resolve ambiguities â†’ Priority sort â†’ Layout (group + mode) â†’ Geometry â†’ Assets â†’ V2 Bridge
// Normalizer branches on representation, not type. Code fallback if AI normalization fails.

import type { AIElement, NormalizedElement, ResolvedElement } from '@/types/pipeline';
import type { WatchFaceConfig, WatchFaceElement, GeneratedCode } from '@/types';

import { validateAIOutput, validateNormalized, validateLayout, validateGeometry } from './validators';
import { correctRepresentation } from './representationCorrector';
import { normalize } from './normalizer';
import { sortArcsByPriority } from './semanticPriority';
import { applyLayout } from './layoutEngine';
import { solveGeometry } from './geometrySolver';
import { resolveAssets } from './assetResolver';
import { generateWatchFaceCodeV2 } from '@/lib/jsCodeGeneratorV2';
import { normalizeWithAI, resolveAmbiguities, type PipelineAIConfig } from './pipelineAIService';

// â”€â”€â”€ Pipeline Orchestrator â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface PipelineOptions {
  watchfaceName?: string;
  watchModel?: string;
  backgroundSrc?: string;
  /** AI config for Stage B normalization + Call 3 ambiguity resolution */
  aiConfig?: PipelineAIConfig;
  /** Progress callback for UI status messages */
  onProgress?: (message: string) => void;
}

export interface PipelineResult {
  config: WatchFaceConfig;
  code: GeneratedCode;
  resolved: ResolvedElement[];
}

export async function runPipeline(
  aiOutput: AIElement[],
  options: PipelineOptions = {},
): Promise<PipelineResult> {
  const log = options.onProgress ?? (() => {});

  // â”€â”€â”€ Stage A: Validate AI output (representation, layout, group, type) â”€â”€â”€â”€
  validateAIOutput(aiOutput);
  console.log('[Pipeline] Stage A validated:', aiOutput.length, 'elements');

  // â”€â”€â”€ Representation Correction: Fix AI arc collapse â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const corrected = correctRepresentation(aiOutput);
  console.log('[Pipeline] Representation corrected:', corrected.length, 'elements');

  // â”€â”€â”€ Stage B: Normalize representation â†’ Zepp widgets (AI or code fallback) â”€
  let normalized: NormalizedElement[];

  if (options.aiConfig) {
    log('Stage B: Normalizing elements with AI...');
    try {
      normalized = await normalizeWithAI(options.aiConfig, corrected);
      console.log('[Pipeline] Stage B (AI) normalized:', normalized.length, 'elements');
    } catch (err) {
      console.warn('[Pipeline] Stage B AI failed, falling back to code normalizer:', err);
      log('Stage B: AI failed, using code fallback...');
      normalized = normalize(corrected);
      console.log('[Pipeline] Stage B (code fallback) normalized:', normalized.length, 'elements');
    }
  } else {
    normalized = normalize(corrected);
    console.log('[Pipeline] Stage B (code-only) normalized:', normalized.length, 'elements');
  }

  validateNormalized(normalized);

  // â”€â”€â”€ Call 3: Resolve remaining ambiguities (if any ARC missing dataType) â”€â”€
  const unresolvedArcs = normalized.filter(
    el => el.widget === 'ARC_PROGRESS' && !el.dataType,
  );

  if (unresolvedArcs.length > 0 && options.aiConfig) {
    log('Call 3: Resolving arc ambiguities with AI...');
    try {
      normalized = await resolveAmbiguities(options.aiConfig, normalized);
      console.log('[Pipeline] Call 3 resolved ambiguities');
    } catch (err) {
      console.warn('[Pipeline] Call 3 failed, assigning fallback data types:', err);
      // Code fallback: assign remaining metrics deterministically
      normalized = assignFallbackDataTypes(normalized);
    }
    validateNormalized(normalized);
  } else if (unresolvedArcs.length > 0) {
    // No AI config â€” assign fallbacks in code
    normalized = assignFallbackDataTypes(normalized);
    validateNormalized(normalized);
  }

  // â”€â”€â”€ Semantic Priority: Sort arcs by visual hierarchy â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  log('Applying semantic priority...');
  normalized = sortArcsByPriority(normalized);
  console.log('[Pipeline] Semantic priority applied â€” arcs sorted by data type');

  // â”€â”€â”€ Stage C: Layout (group zones + layout mode positioning) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  log('Stage C: Computing layout...');
  const layouted = applyLayout(normalized);
  validateLayout(layouted);
  console.log('[Pipeline] Stage C layout:', layouted.length, 'elements');

  // â”€â”€â”€ Stage D: Geometry (per-layout-mode: arc stacking / row bbox / standalone) â”€
  log('Stage D: Solving geometry...');
  const geometry = solveGeometry(layouted);
  validateGeometry(geometry);
  console.log('[Pipeline] Stage D geometry:', geometry.length, 'elements');

  // â”€â”€â”€ Stage E: Asset resolution â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  log('Stage E: Resolving assets...');
  const resolved = resolveAssets(geometry);
  console.log('[Pipeline] Stage E assets resolved');

  // â”€â”€â”€ Stage F: Bridge to V2 code generator â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  log('Stage F: Generating code...');
  const config = bridgeToWatchFaceConfig(resolved, options);
  const code = generateWatchFaceCodeV2(config);
  console.log('[Pipeline] Stage F code generated');

  return { config, code, resolved };
}

// â”€â”€â”€ Fallback: Assign dataTypes to unresolved ARC_PROGRESS elements â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const ARC_FALLBACK_PRIORITY = ['BATTERY', 'STEP', 'HEART', 'SPO2', 'CAL'];

function assignFallbackDataTypes(elements: NormalizedElement[]): NormalizedElement[] {
  const used = new Set(elements.map(e => e.dataType).filter(Boolean));

  return elements.map(el => {
    if (el.widget === 'ARC_PROGRESS' && !el.dataType) {
      const fallback = ARC_FALLBACK_PRIORITY.find(dt => !used.has(dt));
      if (fallback) {
        used.add(fallback);
        return { ...el, dataType: fallback };
      }
    }
    return el;
  });
}

// â”€â”€â”€ Bridge: ResolvedElement[] â†’ WatchFaceConfig â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Converts pipeline output into the WatchFaceConfig shape that jsCodeGeneratorV2 expects.

function bridgeToWatchFaceConfig(
  elements: ResolvedElement[],
  options: PipelineOptions,
): WatchFaceConfig {
  const watchElements: WatchFaceElement[] = elements.map((el, idx) =>
    resolvedToWatchFaceElement(el, idx),
  );

  return {
    name: options.watchfaceName || 'AI Watchface',
    resolution: { width: 480, height: 480 },
    background: {
      src: options.backgroundSrc || 'background.png',
      format: 'TGA-RLP',
    },
    elements: watchElements,
    watchModel: options.watchModel || 'Balance 2',
  };
}

function resolvedToWatchFaceElement(el: ResolvedElement, idx: number): WatchFaceElement {
  const base: WatchFaceElement = {
    id: el.id,
    type: mapWidgetToElementType(el.widget),
    name: mapWidgetToName(el.widget, el.sourceType, idx),
    bounds: { x: 0, y: 0, width: 480, height: 480 }, // overridden per widget below
    visible: true,
    zIndex: idx + 1,
  };

  // â”€â”€ Widget-specific coordinate assignment â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  // TIME_POINTER: center-based, bounds = full screen container
  if (el.widget === 'TIME_POINTER') {
    base.center = { x: el.centerX, y: el.centerY };
    base.bounds = { x: 0, y: 0, width: 480, height: 480 };
    base.hourHandSrc = el.assets.hourHandSrc;
    base.minuteHandSrc = el.assets.minuteHandSrc;
    base.secondHandSrc = el.assets.secondHandSrc;
    base.coverSrc = el.assets.coverSrc;
    base.hourPos = { x: el.hourPosX!, y: el.hourPosY! };
    base.minutePos = { x: el.minutePosX!, y: el.minutePosY! };
    base.secondPos = { x: el.secondPosX!, y: el.secondPosY! };
    base.pointerCenter = { x: el.centerX, y: el.centerY };
    return base;
  }

  // ARC_PROGRESS: center-based, bounds = full screen container
  if (el.widget === 'ARC_PROGRESS') {
    base.center = { x: el.centerX, y: el.centerY };
    base.bounds = { x: 0, y: 0, width: 480, height: 480 };
    base.radius = el.radius;
    base.startAngle = el.startAngle;
    base.endAngle = el.endAngle;
    base.lineWidth = el.lineWidth;
    base.dataType = el.dataType;
    base.color = ARC_COLORS[el.dataType || ''] || '0x00FF00';
    return base;
  }

  // IMG_TIME: bounds from computed geometry (no center)
  if (el.widget === 'IMG_TIME') {
    base.bounds = { x: el.x!, y: el.y!, width: el.w!, height: el.h! };
    base.images = el.assets.fontArray;
    return base;
  }

  // IMG_DATE: bounds from computed geometry
  if (el.widget === 'IMG_DATE') {
    base.bounds = { x: el.x!, y: el.y!, width: el.w!, height: el.h! };
    if (el.sourceType === 'month') {
      base.images = el.assets.monthArray;
    } else {
      base.images = el.assets.fontArray;
    }
    return base;
  }

  // IMG_WEEK: bounds from computed geometry
  if (el.widget === 'IMG_WEEK') {
    base.bounds = { x: el.x!, y: el.y!, width: el.w!, height: el.h! };
    base.images = el.assets.weekArray;
    return base;
  }

  // TEXT_IMG: bounds from computed geometry
  if (el.widget === 'TEXT_IMG') {
    base.bounds = { x: el.x!, y: el.y!, width: el.w!, height: el.h! };
    base.fontArray = el.assets.fontArray;
    base.dataType = el.dataType;
    return base;
  }

  // IMG_LEVEL: bounds from computed geometry
  if (el.widget === 'IMG_LEVEL') {
    base.bounds = { x: el.x!, y: el.y!, width: el.w!, height: el.h! };
    base.images = el.assets.imageArray;
    base.dataType = el.dataType;
    return base;
  }

  // IMG_STATUS: bounds from computed geometry
  if (el.widget === 'IMG_STATUS') {
    base.bounds = { x: el.x!, y: el.y!, width: el.w!, height: el.h! };
    base.src = el.assets.src;
    base.statusType = 'DISCONNECT';
    return base;
  }

  // IMG: bounds from computed geometry
  if (el.widget === 'IMG') {
    base.bounds = { x: el.x!, y: el.y!, width: el.w!, height: el.h! };
    base.src = el.assets.src;
    return base;
  }

  // TEXT: bounds from computed geometry
  if (el.widget === 'TEXT') {
    base.bounds = { x: el.x!, y: el.y!, width: el.w!, height: el.h! };
    base.text = '';
    base.fontSize = 20;
    base.color = '0xFFFFFFFF';
    return base;
  }

  // Fallback: use geometry x/y if available, else centerX/centerY
  base.bounds = {
    x: el.x ?? el.centerX,
    y: el.y ?? el.centerY,
    width: el.w ?? 100,
    height: el.h ?? 100,
  };
  return base;
}

// â”€â”€â”€ Per-data-type arc colors (hex for Zepp OS) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const ARC_COLORS: Record<string, string> = {
  BATTERY:  '0x00CC88',
  STEP:     '0xFFD93D',
  HEART:    '0xFF6B6B',
  SPO2:     '0xEE5A24',
  CAL:      '0xFF9F43',
  DISTANCE: '0x54A0FF',
};

// Map pipeline widget names back to WatchFaceElement.type
// V2 generator uses element.type in the switch/case in generateWidgetCodeV2
function mapWidgetToElementType(
  widget: string,
): WatchFaceElement['type'] {
  const map: Record<string, WatchFaceElement['type']> = {
    TIME_POINTER: 'TIME_POINTER',
    ARC_PROGRESS: 'ARC_PROGRESS',
    TEXT:         'TEXT',
    TEXT_IMG:     'TEXT_IMG',
    IMG:          'IMG',
    IMG_STATUS:   'IMG_STATUS',
    IMG_LEVEL:    'IMG_LEVEL',
    // IMG_TIME, IMG_DATE, IMG_WEEK are routed by NAME in V2 generator,
    // so their type doesn't matter for the switch/case. Set to IMG as fallback.
    IMG_TIME:     'IMG',
    IMG_DATE:     'IMG',
    IMG_WEEK:     'IMG',
  };
  return map[widget] || 'IMG';
}

// Map widget to a name the V2 generator's name-based routing expects.
// V2 generator checks: name.includes('time'), name.includes('date'),
// name.includes('week'), name.includes('month')
// TEXT_IMG names use descriptive format: "Steps Value 0", "Battery Value 1"
// IMPORTANT: TEXT_IMG/IMG names must NOT contain 'time','date','week','month'
// to avoid accidentally triggering V2 generator's name-based routing.

/** Capitalize first letter of source type for readable names. */
function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Map data source types to safe display names (avoid V2 routing keywords). */
const SOURCE_DISPLAY_NAME: Record<string, string> = {
  steps:      'Steps',
  battery:    'Battery',
  heart_rate: 'Heart Rate',
  spo2:       'SpO2',
  calories:   'Calories',
  distance:   'Distance',
  weather:    'Weather',
  arc:        'Arc',
  text:       'Text',
};

function mapWidgetToName(
  widget: string,
  sourceType: string,
  idx: number,
): string {
  const displayName = SOURCE_DISPLAY_NAME[sourceType] || capitalize(sourceType);

  switch (widget) {
    case 'TIME_POINTER': return `Clock Hands ${idx}`;
    case 'IMG_TIME':     return `Digital Time ${idx}`;
    case 'IMG_DATE':     return sourceType === 'month' ? `Month ${idx}` : `Date ${idx}`;
    case 'IMG_WEEK':     return `Weekday ${idx}`;
    case 'ARC_PROGRESS': return `Arc ${displayName} ${idx}`;
    case 'TEXT_IMG':     return `${displayName} Value ${idx}`;
    case 'TEXT':         return `${displayName} Label ${idx}`;
    case 'IMG':          return `${displayName} Icon ${idx}`;
    case 'IMG_STATUS':   return `Status ${idx}`;
    case 'IMG_LEVEL':    return `Level ${displayName} ${idx}`;
    default:             return `Element ${idx}`;
  }
}

// â”€â”€â”€ Re-exports for convenience â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export { validateAIOutput } from './validators';
export { normalize } from './normalizer';
export { sortArcsByPriority } from './semanticPriority';
export { applyLayout } from './layoutEngine';
export { solveGeometry } from './geometrySolver';
export { resolveAssets } from './assetResolver';
export type { AIElement, AIExtractionResult, ResolvedElement } from '@/types/pipeline';
export type { PipelineAIConfig } from './pipelineAIService';

```

### FILE: `src/pipeline/constants.ts`

```typescript
// Shared dimension constants â€” Single source of truth for asset sizes.
// Used by: assetImageGenerator, geometrySolver, layoutEngine, jsCodeGeneratorV2.
// When you change a digit size here, ALL pipeline stages pick up the change.

import type { Group } from '@/types/pipeline';

export const SCREEN = { W: 480, H: 480, CX: 240, CY: 240 } as const;

// â”€â”€â”€ Group Zones (replaces REGION_POSITIONS in layoutEngine) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Each group maps to a bounding rectangle on the 480Ã—480 screen.
// Layout modes position elements within these zones.

export const GROUP_ZONES: Record<Group, { x: number; y: number; w: number; h: number }> = {
  center:       { x: 140, y: 140, w: 200, h: 200 },
  top:          { x: 140, y: 20,  w: 200, h: 120 },
  bottom:       { x: 140, y: 340, w: 200, h: 120 },
  left_panel:   { x: 20,  y: 100, w: 200, h: 280 },
  right_panel:  { x: 260, y: 100, w: 200, h: 280 },
  top_left:     { x: 20,  y: 20,  w: 200, h: 200 },
  top_right:    { x: 260, y: 20,  w: 200, h: 200 },
  bottom_left:  { x: 20,  y: 260, w: 200, h: 200 },
  bottom_right: { x: 260, y: 260, w: 200, h: 200 },
} as const;

// â”€â”€â”€ Asset Dimensions (matches what assetImageGenerator produces) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const TIME_DIGIT   = { w: 60, h: 90 } as const;   // time_digit_N.png
export const DATE_DIGIT   = { w: 36, h: 54 } as const;   // date_digit_N.png
export const MONTH_LABEL  = { w: 100, h: 36 } as const;  // month_N.png
export const WEEK_LABEL   = { w: 100, h: 36 } as const;  // week_N.png
export const WEATHER_ICON = { w: 60, h: 60 } as const;   // weather_N.png
export const TEXT_IMG_DIGIT = { w: 28, h: 44 } as const;  // *_digit_N.png

// â”€â”€â”€ Derived: Content widths for multi-digit displays â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/** Hours = 2 digits side-by-side */
export const HOUR_CONTENT_W = TIME_DIGIT.w * 2;           // 120px
/** Minutes = 2 digits side-by-side */
export const MINUTE_CONTENT_W = TIME_DIGIT.w * 2;         // 120px
/** Gap between hour and minute groups */
export const TIME_COLON_GAP = 10;
/** Total time display width: HH + gap + MM */
export const TIME_TOTAL_W = HOUR_CONTENT_W + TIME_COLON_GAP + MINUTE_CONTENT_W; // 250px

/** Day = 2 digits */
export const DAY_CONTENT_W = DATE_DIGIT.w * 2;            // 72px
/** Gap between day and month */
export const DATE_MONTH_GAP = 10;

// â”€â”€â”€ Arc Configuration â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const ARC_BASE_RADIUS = 180;
export const ARC_SPACING = 25;
export const ARC_LINE_WIDTH = 12;       // base thickness for priority 0
export const ARC_LINE_WIDTH_STEP = 2;   // thickness decreases per priority level
export const ARC_START_ANGLE = 135;
export const ARC_MAX_SWEEP = 300;       // maximum sweep angle (data-driven)

```

### FILE: `src/pipeline/validators.ts`

```typescript
// Pipeline Validators â€” Gate-keepers between stages.
// Reject any data that violates the pipeline contract.

import type { AIElement, NormalizedElement, LayoutElement, GeometryElement, Representation, LayoutMode, Group } from '@/types/pipeline';
import { PipelineValidationError } from '@/types/pipeline';

// â”€â”€â”€ Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const VALID_AI_TYPES = new Set([
  'time', 'date', 'steps', 'battery', 'heart_rate', 'arc', 'text',
  'weather', 'spo2', 'calories', 'distance', 'weekday', 'month',
]);

const VALID_REPRESENTATIONS = new Set<Representation>([
  'text', 'arc', 'icon', 'text+icon', 'text+arc', 'number',
]);

const VALID_LAYOUT_MODES = new Set<LayoutMode>([
  'row', 'arc', 'standalone', 'grid',
]);

const VALID_GROUPS = new Set<Group>([
  'center', 'top', 'bottom', 'left_panel', 'right_panel',
  'top_left', 'top_right', 'bottom_left', 'bottom_right',
]);

const VALID_WIDGETS = new Set([
  'TIME_POINTER', 'IMG_TIME', 'IMG_DATE', 'IMG_WEEK', 'ARC_PROGRESS',
  'TEXT', 'TEXT_IMG', 'IMG', 'IMG_STATUS', 'IMG_LEVEL',
]);

const MAX_ELEMENTS = 20;

// â”€â”€â”€ Representation Validation Helper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/** Validate that a representation value is from the allowed set. */
export function validateRepresentation(value: unknown, prefix: string): string | null {
  if (!value || typeof value !== 'string') {
    return `${prefix}: missing 'representation'`;
  }
  if (!VALID_REPRESENTATIONS.has(value as Representation)) {
    return `${prefix}: invalid representation '${value}'`;
  }
  return null;
}

// â”€â”€â”€ Stage 0 Validator: AI Extraction Output â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function validateAIOutput(elements: AIElement[]): void {
  const violations: string[] = [];

  if (!Array.isArray(elements)) {
    throw new PipelineValidationError('AI', ['Input is not an array']);
  }

  if (elements.length === 0) {
    violations.push('Elements array is empty');
  }

  if (elements.length > MAX_ELEMENTS) {
    violations.push(`Too many elements: ${elements.length} (max ${MAX_ELEMENTS})`);
  }

  const seenIds = new Set<string>();

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    const prefix = `elements[${i}]`;

    // Type guard
    if (typeof el !== 'object' || el === null) {
      violations.push(`${prefix}: not an object`);
      continue;
    }

    // Required fields
    if (!el.id || typeof el.id !== 'string') {
      violations.push(`${prefix}: missing or invalid 'id'`);
    } else if (seenIds.has(el.id)) {
      violations.push(`${prefix}: duplicate id '${el.id}'`);
    } else {
      seenIds.add(el.id);
    }

    if (!VALID_AI_TYPES.has(el.type)) {
      violations.push(`${prefix}: unknown type '${el.type}'`);
    }

    // Representation (required)
    const repError = validateRepresentation(el.representation, prefix);
    if (repError) violations.push(repError);

    // Layout (required)
    if (!el.layout || !VALID_LAYOUT_MODES.has(el.layout)) {
      violations.push(`${prefix}: missing or invalid layout '${el.layout}'`);
    }

    // Group (required)
    if (!el.group || !VALID_GROUPS.has(el.group)) {
      violations.push(`${prefix}: missing or invalid group '${el.group}'`);
    }

    // Confidence clamp (optional field)
    if (el.confidence !== undefined) {
      if (typeof el.confidence !== 'number' || el.confidence < 0 || el.confidence > 1) {
        violations.push(`${prefix}: confidence must be a number between 0 and 1`);
      }
    }
  }

  if (violations.length > 0) {
    throw new PipelineValidationError('AI', violations);
  }
}

// â”€â”€â”€ Stage 1 Validator: Normalized Elements â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function validateNormalized(elements: NormalizedElement[]): void {
  const violations: string[] = [];

  if (!Array.isArray(elements) || elements.length === 0) {
    throw new PipelineValidationError('Normalizer', ['Empty or invalid normalized array']);
  }

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    const prefix = `elements[${i}]`;

    if (!el.id || typeof el.id !== 'string') {
      violations.push(`${prefix}: missing or invalid 'id'`);
    }

    if (!VALID_WIDGETS.has(el.widget)) {
      violations.push(`${prefix}: unknown widget '${el.widget}'`);
    }

    if (!el.group || !VALID_GROUPS.has(el.group)) {
      violations.push(`${prefix}: missing or invalid group '${el.group}'`);
    }

    if (!el.layout || !VALID_LAYOUT_MODES.has(el.layout)) {
      violations.push(`${prefix}: missing or invalid layout '${el.layout}'`);
    }
  }

  if (violations.length > 0) {
    throw new PipelineValidationError('Normalizer', violations);
  }
}

// â”€â”€â”€ Stage 2 Validator: Layout Elements â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function validateLayout(elements: LayoutElement[]): void {
  const violations: string[] = [];

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    const prefix = `elements[${i}]`;

    if (typeof el.centerX !== 'number' || typeof el.centerY !== 'number') {
      violations.push(`${prefix}: missing centerX/centerY`);
    }

    if (el.centerX < 0 || el.centerX > 480 || el.centerY < 0 || el.centerY > 480) {
      violations.push(`${prefix}: centerX/centerY out of bounds (0-480)`);
    }
  }

  if (violations.length > 0) {
    throw new PipelineValidationError('Layout', violations);
  }
}

// â”€â”€â”€ Stage 3 Validator: Geometry Elements â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function validateGeometry(elements: GeometryElement[]): void {
  const violations: string[] = [];

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    const prefix = `elements[${i}]`;

    switch (el.widget) {
      case 'TIME_POINTER':
        if (el.hourPosX === undefined || el.hourPosY === undefined) {
          violations.push(`${prefix}: TIME_POINTER missing hourPosX/hourPosY`);
        }
        if (el.minutePosX === undefined || el.minutePosY === undefined) {
          violations.push(`${prefix}: TIME_POINTER missing minutePosX/minutePosY`);
        }
        if (el.secondPosX === undefined || el.secondPosY === undefined) {
          violations.push(`${prefix}: TIME_POINTER missing secondPosX/secondPosY`);
        }
        break;

      case 'ARC_PROGRESS':
        if (el.radius === undefined || el.radius <= 0) {
          violations.push(`${prefix}: ARC_PROGRESS missing or invalid radius`);
        }
        if (el.startAngle === undefined || el.endAngle === undefined) {
          violations.push(`${prefix}: ARC_PROGRESS missing start/end angles`);
        }
        break;

      case 'TEXT':
      case 'TEXT_IMG':
      case 'IMG':
      case 'IMG_DATE':
      case 'IMG_WEEK':
      case 'IMG_TIME':
      case 'IMG_STATUS':
      case 'IMG_LEVEL':
        if (el.x === undefined || el.y === undefined) {
          violations.push(`${prefix}: ${el.widget} missing x/y`);
        }
        break;
    }
  }

  if (violations.length > 0) {
    throw new PipelineValidationError('Geometry', violations);
  }
}

```

### FILE: `src/pipeline/representationCorrector.ts`

```typescript
// Representation Correction Layer
// Inserts between validation and normalization to fix AI arc collapse.
// Deterministic, <5ms, no async operations.

import type { AIElement, AIElementType, Representation, LayoutMode, Group } from '@/types/pipeline';

// â”€â”€â”€ Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/** Maximum arcs allowed before downgrade kicks in. */
const MAX_ARCS = 2;

/** Layout feasibility threshold â€” if all elements are "arc" layout and count exceeds this, fix. */
const ARC_LAYOUT_THRESHOLD = 3;

/** Type-based default representations (override when AI says "arc" incorrectly). */
const TYPE_DEFAULT_REPRESENTATION: Partial<Record<AIElementType, Representation>> = {
  steps:      'text+icon',
  battery:    'text+icon',
  heart_rate: 'text+icon',
  spo2:       'text',
  calories:   'text',
};

/** Types that should stay in center even during group redistribution. */
const CENTER_TYPES: Set<AIElementType> = new Set(['time']);

/** Types that go to "top" during redistribution. */
const TOP_TYPES: Set<AIElementType> = new Set(['date', 'weekday', 'month']);

// â”€â”€â”€ Rule Functions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/** Rule 1: Arc Limit â€” max 2 arcs, downgrade extras to "text". */
function applyArcLimit(elements: AIElement[]): AIElement[] {
  const arcIndices: number[] = [];
  for (let i = 0; i < elements.length; i++) {
    if (elements[i].representation === 'arc') arcIndices.push(i);
  }

  if (arcIndices.length <= MAX_ARCS) return elements;

  // Keep first MAX_ARCS arcs (by order), downgrade the rest
  const toDowngrade = arcIndices.slice(MAX_ARCS);
  return elements.map((el, i) => {
    if (!toDowngrade.includes(i)) return el;
    return { ...el, representation: 'text' as Representation, layout: 'row' as LayoutMode };
  });
}

/** Rule 2: Layout Feasibility â€” if all layout:"arc" and count > threshold, convert non-primary to "row". */
function applyLayoutFix(elements: AIElement[]): AIElement[] {
  const arcLayoutCount = elements.filter(el => el.layout === 'arc').length;
  if (arcLayoutCount <= ARC_LAYOUT_THRESHOLD) return elements;

  // All arc-layout and too many â€” keep primary elements as arc, convert rest to row
  let arcKept = 0;
  return elements.map(el => {
    if (el.layout !== 'arc') return el;
    if (el.importance === 'primary' && arcKept < MAX_ARCS) {
      arcKept++;
      return el;
    }
    return { ...el, layout: 'row' as LayoutMode };
  });
}

/** Rule 3: Group Redistribution â€” if all group:"center", reassign by type. */
function applyGroupRedistribution(elements: AIElement[]): AIElement[] {
  const allCenter = elements.every(el => el.group === 'center');
  if (!allCenter) return elements;

  return elements.map(el => {
    if (CENTER_TYPES.has(el.type)) return el; // time stays center
    if (TOP_TYPES.has(el.type)) return { ...el, group: 'top' as Group };
    // All other data types â†’ right_panel
    return { ...el, group: 'right_panel' as Group };
  });
}

/** Rule 4: Type-Based Overrides â€” ensure known data types get their correct representation. */
function applyTypeOverrides(elements: AIElement[]): AIElement[] {
  return elements.map(el => {
    const defaultRep = TYPE_DEFAULT_REPRESENTATION[el.type];
    if (!defaultRep) return el; // no override for this type
    if (el.representation === defaultRep) return el; // already correct
    return {
      ...el,
      representation: defaultRep,
      layout: 'row' as LayoutMode,
    };
  });
}

/** Rule 5: Decorative Arc Detection â€” weak arcs (no dataType, small sweep) â†’ "icon"/"standalone". */
function applyDecorativeDetection(elements: AIElement[]): AIElement[] {
  // "arc" type with no real data binding is decorative
  const DATA_TYPES: Set<AIElementType> = new Set([
    'steps', 'battery', 'heart_rate', 'spo2', 'calories', 'distance',
  ]);

  return elements.map(el => {
    if (el.representation !== 'arc') return el;
    // If the type is a known data type, it's a real arc â€” keep it
    if (DATA_TYPES.has(el.type)) return el;
    // Generic "arc" or "text" type with arc representation = decorative
    return {
      ...el,
      representation: 'icon' as Representation,
      layout: 'standalone' as LayoutMode,
    };
  });
}

// â”€â”€â”€ Main Entry Point â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Correct AI-provided representations that collapse everything to arcs.
 * Applies 5 rules in order:
 *   1. Arc limit (max 2)
 *   2. Layout feasibility
 *   3. Group redistribution
 *   4. Type-based overrides
 *   5. Decorative arc detection
 *
 * Input:  AIElement[] (validated)
 * Output: AIElement[] (corrected â€” same shape, field overrides only)
 */
export function correctRepresentation(elements: AIElement[]): AIElement[] {
  // Deep copy to avoid mutating input
  let corrected: AIElement[] = elements.map(el => ({ ...el }));

  const before = elements.map(el => `${el.id}:${el.representation}/${el.layout}/${el.group}`);

  // Detect arc collapse: if original arc count exceeds MAX_ARCS, the design is collapsed.
  // Only apply aggressive rules (3-5) when collapse is detected.
  const originalArcCount = elements.filter(el => el.representation === 'arc').length;
  const isCollapsed = originalArcCount > MAX_ARCS;

  corrected = applyArcLimit(corrected);
  corrected = applyLayoutFix(corrected);

  // Rules 3-5 only apply when arc collapse is detected
  if (isCollapsed) {
    corrected = applyGroupRedistribution(corrected);
    corrected = applyTypeOverrides(corrected);
    corrected = applyDecorativeDetection(corrected);
  }

  // Log corrections
  const changes: string[] = [];
  for (let i = 0; i < corrected.length; i++) {
    const after = `${corrected[i].id}:${corrected[i].representation}/${corrected[i].layout}/${corrected[i].group}`;
    if (before[i] !== after) {
      changes.push(`  ${before[i]} â†’ ${after}`);
    }
  }
  if (changes.length > 0) {
    console.log(`[RepCorrector] ${changes.length} correction(s) applied:\n${changes.join('\n')}`);
  } else {
    console.log('[RepCorrector] No corrections needed');
  }

  return corrected;
}

```

### FILE: `src/pipeline/normalizer.ts`

```typescript
// Normalizer â€” Maps AI elements to Zepp widgets based on representation.
// Branches on representation (text, arc, icon, etc.) instead of hardcoded typeâ†’widget.
// IMPORTANT: Never drop element types. All types get mapped to a widget.

import type { AIElement, AIElementType, NormalizedElement, ZeppWidget, Representation } from '@/types/pipeline';

// â”€â”€â”€ Representation â†’ Widget Mapping â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Map an AI element type + representation to one or more Zepp OS widgets.
 * This is the core fix: representation drives widget selection, NOT type alone.
 */
function mapByRepresentation(type: AIElementType, representation: Representation): ZeppWidget | ZeppWidget[] {
  // Time is special â€” analog (arc) vs digital
  if (type === 'time') {
    return representation === 'arc' ? 'TIME_POINTER' : 'IMG_TIME';
  }

  // Date/weekday/month â€” always image-based regardless of representation
  if (type === 'date') return 'IMG_DATE';
  if (type === 'weekday') return 'IMG_WEEK';
  if (type === 'month') return 'IMG_DATE';

  // Data elements â€” BRANCH ON REPRESENTATION
  if (representation === 'arc') return 'ARC_PROGRESS';
  if (representation === 'text') return 'TEXT_IMG';
  if (representation === 'number') return 'TEXT_IMG';
  if (representation === 'icon') return 'IMG';
  if (representation === 'text+icon') return ['TEXT_IMG', 'IMG'];     // compound â†’ 2 widgets
  if (representation === 'text+arc') return ['ARC_PROGRESS', 'TEXT_IMG']; // compound â†’ 2 widgets

  return 'TEXT'; // fallback
}

// â”€â”€â”€ Type â†’ Data-binding Type â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const TYPE_TO_DATA_TYPE: Partial<Record<AIElementType, string>> = {
  steps:      'STEP',
  battery:    'BATTERY',
  heart_rate: 'HEART',
  spo2:       'SPO2',
  calories:   'CAL',
  distance:   'DISTANCE',
  weather:    'WEATHER_CURRENT',
};

// Fallback priority for assigning dataType to generic "arc" elements
const ARC_FALLBACK_PRIORITY = ['BATTERY', 'STEP', 'HEART', 'SPO2', 'CAL'];

// â”€â”€â”€ Compound Expansion Cap â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/** Maximum widgets produced from a single compound representation (text+icon, text+arc). */
const COMPOUND_CAP = 2;

// â”€â”€â”€ Normalizer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function normalize(elements: AIElement[]): NormalizedElement[] {
  // Track which dataTypes are already assigned to avoid duplicates
  const usedDataTypes = new Set<string>();

  // First pass: collect explicitly assigned data types
  for (const el of elements) {
    const dt = TYPE_TO_DATA_TYPE[el.type];
    if (dt) usedDataTypes.add(dt);
  }

  const result: NormalizedElement[] = [];

  for (const el of elements) {
    const widgetOrWidgets = mapByRepresentation(el.type, el.representation);
    const widgets = Array.isArray(widgetOrWidgets)
      ? widgetOrWidgets.slice(0, COMPOUND_CAP)
      : [widgetOrWidgets];
    const isCompound = widgets.length > 1;

    let primaryId: string | undefined;

    for (let i = 0; i < widgets.length; i++) {
      const widget = widgets[i];
      // Compound elements get suffixed IDs to stay unique (e.g. "steps_text_0", "steps_text_1")
      const id = isCompound ? `${el.id}_${i}` : el.id;

      const normalized: NormalizedElement = {
        id,
        widget,
        group: el.group,
        layout: el.layout,
        sourceType: el.type,
      };

      // Link second (and beyond) compound elements back to the first
      if (isCompound) {
        if (i === 0) {
          primaryId = id;
        } else {
          normalized.parentId = primaryId;
        }
      }

      // Explicit data type from known types
      const dataType = TYPE_TO_DATA_TYPE[el.type];
      if (dataType) {
        normalized.dataType = dataType;
      }
      // For generic "arc" type: assign next available metric from fallback priority
      else if (el.type === 'arc') {
        const fallback = ARC_FALLBACK_PRIORITY.find(dt => !usedDataTypes.has(dt));
        if (fallback) {
          normalized.dataType = fallback;
          usedDataTypes.add(fallback);
        }
      }

      result.push(normalized);
    }
  }

  return result;
}

```

### FILE: `src/pipeline/semanticPriority.ts`

```typescript
// Semantic Priority Engine â€” Maps data types to visual hierarchy.
// Deterministic. No AI.
//
// Sits between Normalizer output and Geometry Solver.
// Priority determines: arc ordering, radius, sweep angle, thickness.
// Priority 0 = outermost, thickest, longest sweep = most prominent.

import type { NormalizedElement } from '@/types/pipeline';

// â”€â”€â”€ Priority Map â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Lower number = higher visual priority = outermost ring, thicker line, longer sweep.

const PRIORITY_MAP: Record<string, number> = {
  STEP:     0,
  BATTERY:  1,
  HEART:    2,
  CAL:      3,
  SPO2:     4,
  DISTANCE: 5,
};

// â”€â”€â”€ Mock Data Values (0â€“1 range) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Used for sweep angle computation. Provides realistic visual fill at design time.

const MOCK_VALUES: Record<string, number> = {
  STEP:     0.70,
  BATTERY:  0.50,
  HEART:    0.65,
  CAL:      0.40,
  SPO2:     0.95,
  DISTANCE: 0.30,
};

const DEFAULT_PRIORITY = 5;
const DEFAULT_MOCK_VALUE = 0.50;

// â”€â”€â”€ Public API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/** Get visual priority for a data type (lower = more prominent). */
export function getPriority(dataType: string | undefined): number {
  return PRIORITY_MAP[dataType || ''] ?? DEFAULT_PRIORITY;
}

/** Get mock data value (0â€“1) for sweep computation. */
export function getMockValue(dataType: string | undefined): number {
  return MOCK_VALUES[dataType || ''] ?? DEFAULT_MOCK_VALUE;
}

/** Sort arc elements by semantic priority (highest priority first = lowest number).
 *  Non-arc elements remain in original order, appended after arcs. */
export function sortArcsByPriority<T extends NormalizedElement>(elements: T[]): T[] {
  const arcs: T[] = [];
  const rest: T[] = [];

  for (const el of elements) {
    if (el.widget === 'ARC_PROGRESS') {
      arcs.push(el);
    } else {
      rest.push(el);
    }
  }

  arcs.sort((a, b) => getPriority(a.dataType) - getPriority(b.dataType));

  return [...arcs, ...rest];
}

```

### FILE: `src/pipeline/layoutEngine.ts`

```typescript
// Layout Engine â€” Group + Layout Mode based positioning.
// Positions elements by group zone and layout mode.
// Arc elements center-lock at screen center. Row elements stack vertically in their zone.
// Standalone elements center within their zone.

import type { NormalizedElement, LayoutElement, Group } from '@/types/pipeline';
import { SCREEN, GROUP_ZONES } from './constants';

const { CX, CY } = SCREEN;

// Row layout: vertical stack spacing (TEXT_IMG digit height 44 + 4px gap)
const ROW_HEIGHT = 48;
const ROW_PADDING = 8;

// â”€â”€â”€ Layout Engine â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function applyLayout(elements: NormalizedElement[]): LayoutElement[] {
  const results: LayoutElement[] = [];

  // Group elements by their group field
  const byGroup: Partial<Record<Group, NormalizedElement[]>> = {};
  for (const el of elements) {
    (byGroup[el.group] ??= []).push(el);
  }

  for (const [group, els] of Object.entries(byGroup) as [Group, NormalizedElement[]][]) {
    const zone = GROUP_ZONES[group] ?? GROUP_ZONES.center;

    // Separate by layout mode within each group
    const arcEls: NormalizedElement[] = [];
    const rowEls: NormalizedElement[] = [];
    const standaloneEls: NormalizedElement[] = [];
    const gridEls: NormalizedElement[] = [];

    for (const el of els) {
      switch (el.layout) {
        case 'arc':        arcEls.push(el); break;
        case 'row':        rowEls.push(el); break;
        case 'standalone': standaloneEls.push(el); break;
        case 'grid':       gridEls.push(el); break;
        default:           standaloneEls.push(el); break;
      }
    }

    // Arc: center-lock at screen center (240, 240)
    for (const el of arcEls) {
      results.push({ ...el, centerX: CX, centerY: CY });
    }

    // Row: vertical stack within zone â€” compress spacing if too many elements
    const zoneCenterX = Math.round(zone.x + zone.w / 2);
    const availableH = zone.h - ROW_PADDING * 2;
    const idealTotal = rowEls.length * ROW_HEIGHT;
    const rowStep = idealTotal <= availableH
      ? ROW_HEIGHT
      : Math.max(20, Math.floor(availableH / rowEls.length));  // compress but min 20px
    for (let i = 0; i < rowEls.length; i++) {
      const rawY = zone.y + ROW_PADDING + i * rowStep + rowStep / 2;
      const clampedY = Math.min(Math.max(rawY, 0), SCREEN.H);
      results.push({
        ...rowEls[i],
        centerX: zoneCenterX,
        centerY: Math.round(clampedY),
      });
    }

    // Standalone: center within zone
    const standaloneZoneCX = Math.round(zone.x + zone.w / 2);
    const standaloneZoneCY = Math.round(zone.y + zone.h / 2);
    for (const el of standaloneEls) {
      results.push({ ...el, centerX: standaloneZoneCX, centerY: standaloneZoneCY });
    }

    // Grid: (future) â€” for now, treat as standalone
    const gridZoneCX = Math.round(zone.x + zone.w / 2);
    const gridZoneCY = Math.round(zone.y + zone.h / 2);
    for (const el of gridEls) {
      results.push({ ...el, centerX: gridZoneCX, centerY: gridZoneCY });
    }
  }

  return results;
}

```

### FILE: `src/pipeline/geometrySolver.ts`

```typescript
// Geometry Solver â€” THE layer that controls SIZE, SHAPE, and SPATIAL INTELLIGENCE.
// Deterministic. No AI. No randomness.
//
// OWNERSHIP (5-layer model):
//   Layout Engine â†’ WHERE (anchor point only)
//   Geometry Solver â†’ HOW (radius, sweep, thickness, offsets, visual weight)
//
// Steps:
//   A â€“ Extract arcs
//   B â€“ Assign semantic priority (via semanticPriority module)
//   C â€“ Radius from priority (NOT region)
//   D â€“ Arc sweep (data-driven, mock values)
//   E â€“ Thickness scaling
//   F â€“ Time offset (calibrated override, NOT Layout Engine)

import type { LayoutElement, GeometryElement } from '@/types/pipeline';
import {
  SCREEN, ARC_BASE_RADIUS, ARC_SPACING, ARC_LINE_WIDTH,
  ARC_LINE_WIDTH_STEP, ARC_START_ANGLE, ARC_MAX_SWEEP,
  TIME_DIGIT, HOUR_CONTENT_W, TIME_COLON_GAP,
  DATE_DIGIT, MONTH_LABEL, WEEK_LABEL, WEATHER_ICON,
} from './constants';
import { getPriority, getMockValue } from './semanticPriority';

const { CX, CY } = SCREEN;

// â”€â”€â”€ Clock hand dimensions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const HAND_DIMENSIONS = {
  hour:   { w: 22, h: 140 },
  minute: { w: 16, h: 200 },
  second: { w: 6,  h: 240 },
};

// â”€â”€â”€ Calibrated time offset (from real watchface analysis) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// TIME_POINTER and IMG_TIME anchor left of center for visual balance.

const TIME_CENTER_X = 140;
const TIME_CENTER_Y = CY;   // 240

// â”€â”€â”€ Rectangular widget bounding boxes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const DEFAULT_SIZES: Record<string, { w: number; h: number }> = {
  TEXT:       { w: 200, h: 40 },
  TEXT_IMG:   { w: 160, h: 50 },
  IMG:        { w: 60,  h: 60 },
  IMG_STATUS: { w: 30,  h: 30 },
};

// â”€â”€â”€ Geometry Solver â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function solveGeometry(elements: LayoutElement[]): GeometryElement[] {
  // â”€â”€ STEP A: Extract arcs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const arcElements: LayoutElement[] = [];
  const otherElements: LayoutElement[] = [];

  for (const el of elements) {
    if (el.widget === 'ARC_PROGRESS') {
      arcElements.push(el);
    } else {
      otherElements.push(el);
    }
  }

  const results: GeometryElement[] = [];

  // â”€â”€ STEPS B-E: Priority-based concentric arc stacking â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Elements arrive pre-sorted by semantic priority (sortArcsByPriority in orchestrator).
  // STEP B: Priority comes from semanticPriority module (getPriority).
  // STEP C: Radius = BASE_RADIUS - (priority * SPACING). NOT region-based.
  // STEP D: Sweep = mockValue * MAX_SWEEP. Data-driven, not fixed.
  // STEP E: Thickness = base lineWidth - (priority * step). Outer = thicker.
  for (const el of arcElements) {
    const priority = getPriority(el.dataType);       // Step B
    const mockValue = getMockValue(el.dataType);

    const radius = ARC_BASE_RADIUS - (priority * ARC_SPACING);      // Step C
    const sweep = mockValue * ARC_MAX_SWEEP;                         // Step D
    const lineWidth = Math.max(                                      // Step E
      ARC_LINE_WIDTH - (priority * ARC_LINE_WIDTH_STEP), 4,
    );

    results.push({
      ...el,
      centerX: CX,
      centerY: CY,
      radius: Math.max(radius, 40),
      startAngle: ARC_START_ANGLE,
      endAngle: ARC_START_ANGLE + sweep,
      lineWidth,
    });
  }

  // â”€â”€ STEP F + widget-specific solvers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  for (const el of otherElements) {
    switch (el.widget) {
      case 'TIME_POINTER':
        results.push(solveTimePointer(el));
        break;
      case 'IMG_TIME':
        results.push(solveImgTime(el));
        break;
      case 'IMG_DATE':
        results.push(solveImgDate(el));
        break;
      case 'IMG_WEEK':
        results.push(solveImgWeek(el));
        break;
      case 'IMG_LEVEL':
        results.push(solveImgLevel(el));
        break;
      default:
        results.push(solveRectangular(el));
        break;
    }
  }

  return results;
}

// â”€â”€â”€ TIME_POINTER (STEP F: calibrated offset) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Geometry Solver intentionally overrides Layout Engine's anchor.
// TIME_CENTER_X = 140 (calibrated from real watchface), not screen center.

function solveTimePointer(el: LayoutElement): GeometryElement {
  return {
    ...el,
    centerX: TIME_CENTER_X,   // Step F override
    centerY: TIME_CENTER_Y,
    hourPosX:   Math.round(HAND_DIMENSIONS.hour.w / 2),
    hourPosY:   Math.round(HAND_DIMENSIONS.hour.h / 2),
    minutePosX: Math.round(HAND_DIMENSIONS.minute.w / 2),
    minutePosY: Math.round(HAND_DIMENSIONS.minute.h / 2),
    secondPosX: Math.round(HAND_DIMENSIONS.second.w / 2),
    secondPosY: Math.round(HAND_DIMENSIONS.second.h / 2),
  };
}

// â”€â”€â”€ IMG_TIME (STEP F: calibrated offset) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Same calibrated offset as TIME_POINTER for visual alignment.

function solveImgTime(el: LayoutElement): GeometryElement {
  return {
    ...el,
    x: TIME_CENTER_X,        // Step F override â€” hour_startX
    y: TIME_CENTER_Y,        // hour_startY
    w: HOUR_CONTENT_W + TIME_COLON_GAP + HOUR_CONTENT_W,
    h: TIME_DIGIT.h,
  };
}

// â”€â”€â”€ IMG_DATE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function solveImgDate(el: LayoutElement): GeometryElement {
  const w = el.sourceType === 'month' ? MONTH_LABEL.w : DATE_DIGIT.w * 2;
  const h = el.sourceType === 'month' ? MONTH_LABEL.h : DATE_DIGIT.h;
  return {
    ...el,
    x: Math.round(el.centerX - w / 2),
    y: Math.round(el.centerY - h / 2),
    w,
    h,
  };
}

// â”€â”€â”€ IMG_WEEK â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function solveImgWeek(el: LayoutElement): GeometryElement {
  return {
    ...el,
    x: Math.round(el.centerX - WEEK_LABEL.w / 2),
    y: Math.round(el.centerY - WEEK_LABEL.h / 2),
    w: WEEK_LABEL.w,
    h: WEEK_LABEL.h,
  };
}

// â”€â”€â”€ IMG_LEVEL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function solveImgLevel(el: LayoutElement): GeometryElement {
  return {
    ...el,
    x: Math.round(el.centerX - WEATHER_ICON.w / 2),
    y: Math.round(el.centerY - WEATHER_ICON.h / 2),
    w: WEATHER_ICON.w,
    h: WEATHER_ICON.h,
  };
}

// â”€â”€â”€ Rectangular widgets â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function solveRectangular(el: LayoutElement): GeometryElement {
  const size = DEFAULT_SIZES[el.widget] || { w: 100, h: 40 };

  return {
    ...el,
    x: Math.round(el.centerX - size.w / 2),
    y: Math.round(el.centerY - size.h / 2),
    w: size.w,
    h: size.h,
  };
}

```

### FILE: `src/pipeline/assetResolver.ts`

```typescript
// Asset Resolver â€” Maps widget types to predefined asset paths.
// NO dynamic icon generation. Uses fixed, known assets.

import type { GeometryElement, ResolvedElement, ResolvedAssets, ZeppWidget } from '@/types/pipeline';

// â”€â”€â”€ Data-type â†’ digit prefix mapping â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const DATA_TYPE_DIGIT_PREFIX: Record<string, string> = {
  BATTERY:  'batt_digit',
  STEP:     'step_digit',
  HEART:    'heart_digit',
  SPO2:     'spo2_digit',
  CAL:      'cal_digit',
  DISTANCE: 'dist_digit',
};

// â”€â”€â”€ Asset Resolver â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function resolveAssets(elements: GeometryElement[]): ResolvedElement[] {
  return elements.map((el) => {
    const assets = resolveForWidget(el.widget, el.dataType, el.sourceType);
    return { ...el, assets };
  });
}

function resolveForWidget(
  widget: ZeppWidget,
  dataType?: string,
  sourceType?: string,
): ResolvedAssets {
  switch (widget) {
    case 'TIME_POINTER':
      return {
        hourHandSrc:   'hour_hand.png',
        minuteHandSrc: 'minute_hand.png',
        secondHandSrc: 'second_hand.png',
        coverSrc:      'hand_cover.png',
      };

    case 'IMG_TIME':
      return {
        fontArray: digitArray('time_digit'),
      };

    case 'IMG_DATE':
      if (sourceType === 'month') {
        return {
          monthArray: monthArray(),
        };
      }
      return {
        fontArray: digitArray('date_digit'),
      };

    case 'IMG_WEEK':
      return {
        weekArray: weekArray(),
      };

    case 'ARC_PROGRESS':
      return {}; // ARC_PROGRESS uses color, no image assets needed

    case 'TEXT_IMG': {
      const prefix = dataType ? DATA_TYPE_DIGIT_PREFIX[dataType] || 'digit' : 'digit';
      return {
        fontArray: digitArray(prefix),
      };
    }

    case 'IMG_LEVEL':
      if (sourceType === 'weather') {
        return {
          imageArray: weatherArray(),
        };
      }
      return {};

    case 'IMG_STATUS':
      return {
        src: 'bluetooth_5_b_30x30.png',
      };

    case 'IMG':
      return {};

    case 'TEXT':
      return {};

    default:
      return {};
  }
}

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function digitArray(prefix: string): string[] {
  return Array.from({ length: 10 }, (_, i) => `${prefix}_${i}.png`);
}

function weekArray(): string[] {
  return Array.from({ length: 7 }, (_, i) => `week_${i}.png`);
}

function monthArray(): string[] {
  return Array.from({ length: 12 }, (_, i) => `month_${i}.png`);
}

function weatherArray(): string[] {
  return Array.from({ length: 29 }, (_, i) => `weather_${i}.png`);
}

```

### FILE: `src/pipeline/pipelineAIService.ts`

```typescript
// Pipeline AI Service â€” Wraps the AI vision API to return AIElement[] using the pipeline prompt contract.
// This replaces the old analyzeWatchfaceImage + expandAnalysisToElements flow.

import type { AIElement, AIExtractionResult, NormalizedElement, Representation, LayoutMode, Group } from '@/types/pipeline';
import {
  AI_SYSTEM_PROMPT, AI_USER_PROMPT,
  STAGE_B_SYSTEM_PROMPT, STAGE_B_USER_PROMPT_TEMPLATE, STAGE_B_RESPONSE_SCHEMA,
  CALL_3_SYSTEM_PROMPT, CALL_3_USER_PROMPT_TEMPLATE,
} from './aiPrompt';

export type PipelineAIProvider = 'gemini' | 'openai';

export interface PipelineAIConfig {
  provider: PipelineAIProvider;
  apiKey: string;
}

// â”€â”€â”€ Retry Config for Transient Errors â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const MAX_RETRIES = 3;
const RETRY_BASE_MS = 1000;                    // 1s â†’ 2s â†’ 4s
const RETRYABLE_STATUS = new Set([429, 503]);  // Rate limit + Unavailable only

async function fetchWithRetry(
  url: string,
  init: RequestInit,
  label: string,
): Promise<Response> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const response = await fetch(url, init);

    if (response.ok) return response;

    // Non-retryable error â€” fail immediately
    if (!RETRYABLE_STATUS.has(response.status)) {
      const errorText = await response.text();
      throw new Error(`${label} (${response.status}): ${errorText}`);
    }

    // Last attempt â€” don't wait, just fail
    if (attempt === MAX_RETRIES) {
      const errorText = await response.text();
      throw new Error(`${label} (${response.status}) after ${MAX_RETRIES} retries: ${errorText}`);
    }

    // Exponential backoff: 1s, 2s, 4s
    const delay = RETRY_BASE_MS * Math.pow(2, attempt - 1);
    console.warn(`[${label}] ${response.status} â€” retrying (${attempt}/${MAX_RETRIES}) in ${delay}ms...`);
    await new Promise(r => setTimeout(r, delay));
  }

  // Unreachable, but TypeScript needs it
  throw new Error(`${label}: retry loop exhausted`);
}

/**
 * Send a watchface design image to the AI and get back semantic-only AIElement[].
 * Uses the strict pipeline prompt that forbids coordinates/sizes.
 */
export async function extractElementsFromImage(
  config: PipelineAIConfig,
  designFile: File,
): Promise<AIElement[]> {
  const mimeType = designFile.type || 'image/png';
  const base64Data = await fileToBase64(designFile);

  let rawJson: string;

  switch (config.provider) {
    case 'gemini':
      rawJson = await callGemini(config.apiKey, base64Data, mimeType);
      break;
    case 'openai':
      rawJson = await callOpenAI(config.apiKey, base64Data, mimeType);
      break;
    default:
      throw new Error(`Unknown AI provider: ${config.provider}`);
  }

  const parsed = parseResponse(rawJson);
  return parsed.elements;
}

// â”€â”€â”€ Gemini API Call â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function callGemini(
  apiKey: string,
  base64Data: string,
  mimeType: string,
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const response = await fetchWithRetry(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: AI_SYSTEM_PROMPT }] },
      contents: [
        {
          parts: [
            { text: AI_USER_PROMPT },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Data,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
        thinkingConfig: { thinkingBudget: 0 },
      },
    }),
  }, 'Gemini API error');

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Empty response from Gemini');
  }
  return text;
}

// â”€â”€â”€ OpenAI API Call â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function callOpenAI(
  apiKey: string,
  base64Data: string,
  mimeType: string,
): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: AI_SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            { type: 'text', text: AI_USER_PROMPT },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Data}`,
                detail: 'high',
              },
            },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 2048,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error('Empty response from OpenAI');
  }
  return text;
}

// â”€â”€â”€ Response Parser â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const VALID_REPRESENTATIONS = new Set<Representation>(['text', 'arc', 'icon', 'text+icon', 'text+arc', 'number']);
const VALID_LAYOUT_MODES = new Set<LayoutMode>(['row', 'arc', 'standalone', 'grid']);
const VALID_GROUPS = new Set<Group>([
  'center', 'top', 'bottom', 'left_panel', 'right_panel',
  'top_left', 'top_right', 'bottom_left', 'bottom_right',
]);

/** Map legacy region values to the closest Group for backward compat with older AI responses. */
const REGION_TO_GROUP: Record<string, Group> = {
  center: 'center',
  top: 'top',
  bottom: 'bottom',
  left: 'left_panel',
  right: 'right_panel',
};

function parseResponse(rawJson: string): AIExtractionResult {
  let cleaned = rawJson.trim();

  // Strip markdown fences if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`Failed to parse AI response as JSON: ${cleaned.slice(0, 200)}`);
  }

  if (typeof parsed !== 'object' || parsed === null || !('elements' in parsed)) {
    throw new Error('AI response missing "elements" array');
  }

  const result = parsed as { elements: Record<string, unknown>[] };

  if (!Array.isArray(result.elements)) {
    throw new Error('AI response "elements" is not an array');
  }

  // Validate and coerce each element to the new AIElement shape
  const elements: AIElement[] = result.elements.map((el) => {
    if (!el.id || !el.type) {
      throw new Error(`AI element missing required id or type: ${JSON.stringify(el).slice(0, 100)}`);
    }

    // Coerce legacy region â†’ group if group is missing
    let group = el.group as string | undefined;
    if (!group && el.region && typeof el.region === 'string') {
      group = REGION_TO_GROUP[el.region] ?? 'center';
    }
    if (!group || !VALID_GROUPS.has(group as Group)) {
      group = 'center'; // safe fallback
    }

    // Coerce representation â€” default to 'text' if missing (safest fallback)
    let representation = el.representation as string | undefined;
    if (!representation || !VALID_REPRESENTATIONS.has(representation as Representation)) {
      representation = 'text';
    }

    // Coerce layout â€” default to 'standalone' if missing
    let layout = el.layout as string | undefined;
    if (!layout || !VALID_LAYOUT_MODES.has(layout as LayoutMode)) {
      layout = 'standalone';
    }

    return {
      id: el.id as string,
      type: el.type as AIElement['type'],
      representation: representation as Representation,
      layout: layout as LayoutMode,
      group: group as Group,
      importance: el.importance as AIElement['importance'],
      style: el.style as AIElement['style'],
      confidence: typeof el.confidence === 'number' ? el.confidence : undefined,
      region: el.region as AIElement['region'],
    };
  });

  return { elements };
}

// â”€â”€â”€ Utility â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip data:...;base64, prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Stage B: AI Normalization â€” Text-only call (no image), uses cheaper model.
// Maps fuzzy AI types â†’ concrete Zepp OS widgets + resolves ambiguities.
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

/** Cheaper Gemini model for text-only normalization (no image tokens). */
const GEMINI_TEXT_MODEL = 'gemini-2.0-flash';

/**
 * Stage B AI call: Normalize AI elements â†’ Zepp OS widgets.
 * Text-only (no image sent). Uses cheaper model.
 */
export async function normalizeWithAI(
  config: PipelineAIConfig,
  elements: AIElement[],
): Promise<NormalizedElement[]> {
  const inputJson = JSON.stringify({ elements }, null, 2);
  const userPrompt = STAGE_B_USER_PROMPT_TEMPLATE(inputJson);

  let rawJson: string;

  switch (config.provider) {
    case 'gemini':
      rawJson = await callGeminiText(config.apiKey, STAGE_B_SYSTEM_PROMPT, userPrompt, STAGE_B_RESPONSE_SCHEMA);
      break;
    case 'openai':
      rawJson = await callOpenAIText(config.apiKey, STAGE_B_SYSTEM_PROMPT, userPrompt);
      break;
    default:
      throw new Error(`Unknown AI provider: ${config.provider}`);
  }

  return parseStageBResponse(rawJson);
}

/**
 * Call 3: Resolve ambiguities for ARC_PROGRESS elements missing dataType.
 * Only called when Stage B output still has unresolved arcs.
 */
export async function resolveAmbiguities(
  config: PipelineAIConfig,
  elements: NormalizedElement[],
): Promise<NormalizedElement[]> {
  const inputJson = JSON.stringify({ elements }, null, 2);
  const userPrompt = CALL_3_USER_PROMPT_TEMPLATE(inputJson);

  let rawJson: string;

  switch (config.provider) {
    case 'gemini':
      rawJson = await callGeminiText(config.apiKey, CALL_3_SYSTEM_PROMPT, userPrompt, STAGE_B_RESPONSE_SCHEMA);
      break;
    case 'openai':
      rawJson = await callOpenAIText(config.apiKey, CALL_3_SYSTEM_PROMPT, userPrompt);
      break;
    default:
      throw new Error(`Unknown AI provider: ${config.provider}`);
  }

  return parseStageBResponse(rawJson);
}

// â”€â”€â”€ Text-Only Gemini Call (Stage B / Call 3) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function callGeminiText(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  responseSchema?: object,
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_TEXT_MODEL}:generateContent?key=${apiKey}`;

  const generationConfig: Record<string, unknown> = {
    temperature: 0.1,
    maxOutputTokens: 4096,
    responseMimeType: 'application/json',
  };

  if (responseSchema) {
    generationConfig.responseSchema = responseSchema;
  }

  const response = await fetchWithRetry(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ parts: [{ text: userPrompt }] }],
      generationConfig,
    }),
  }, 'Gemini text API error');

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Empty response from Gemini (text call)');
  }
  return text;
}

// â”€â”€â”€ Text-Only OpenAI Call (Stage B / Call 3) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function callOpenAIText(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.1,
      max_tokens: 2048,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI text API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error('Empty response from OpenAI (text call)');
  }
  return text;
}

// â”€â”€â”€ Stage B Response Parser â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function parseStageBResponse(rawJson: string): NormalizedElement[] {
  let cleaned = rawJson.trim();

  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`Failed to parse Stage B response as JSON: ${cleaned.slice(0, 200)}`);
  }

  if (typeof parsed !== 'object' || parsed === null || !('elements' in parsed)) {
    throw new Error('Stage B response missing "elements" array');
  }

  const result = parsed as { elements: Record<string, unknown>[] };

  if (!Array.isArray(result.elements)) {
    throw new Error('Stage B "elements" is not an array');
  }

  // Coerce each element â€” Stage B may still return region instead of group until T006
  return result.elements.map((el): NormalizedElement => {
    let group = el.group as string | undefined;
    if (!group && el.region && typeof el.region === 'string') {
      group = REGION_TO_GROUP[el.region] ?? 'center';
    }
    if (!group || !VALID_GROUPS.has(group as Group)) {
      group = 'center';
    }

    let layout = el.layout as string | undefined;
    if (!layout || !VALID_LAYOUT_MODES.has(layout as LayoutMode)) {
      layout = 'standalone';
    }

    return {
      id: el.id as string,
      widget: el.widget as NormalizedElement['widget'],
      group: group as Group,
      layout: layout as LayoutMode,
      sourceType: el.sourceType as NormalizedElement['sourceType'],
      dataType: el.dataType as string | undefined,
      parentId: el.parentId as string | undefined,
      region: el.region as NormalizedElement['region'],
    };
  });
}

```

### FILE: `src/pipeline/aiPrompt.ts`

```typescript
// AI Prompt Contract â€” Defines the exact prompt and expected schema for the AI vision model.
// The AI is limited to semantic + representation extraction. NO coordinates, NO sizes, NO pixel data.

export const AI_SYSTEM_PROMPT = `You are a watchface design analyzer. You will receive an image of a smartwatch face design.

Your job is to identify WHAT elements exist, HOW each one is visually represented, and which ZONE of the watch face it belongs to.

You must return ONLY a JSON object following the exact schema below. No extra text, no markdown.

STRICT RULES:
- DO NOT include coordinates (x, y)
- DO NOT include sizes (width, height)
- DO NOT include image crops or pixel data
- DO NOT include angles, radius, or pivot points
- Describe HOW each element appears (representation) and WHERE on the face (group)

Schema:
{
  "elements": [
    {
      "id": "unique_string_id",
      "type": "time" | "date" | "steps" | "battery" | "heart_rate" | "spo2" | "calories" | "distance" | "weather" | "weekday" | "month" | "arc" | "text",
      "representation": "text" | "arc" | "icon" | "text+icon" | "text+arc" | "number",
      "layout": "row" | "arc" | "standalone" | "grid",
      "group": "center" | "top" | "bottom" | "left_panel" | "right_panel" | "top_left" | "top_right" | "bottom_left" | "bottom_right",
      "importance": "primary" | "secondary",
      "confidence": 0.0 to 1.0
    }
  ]
}

Field definitions:

"type" â€” what data the element shows:
- "time": Clock display (analog hands or digital numbers)
- "date": Day-of-month number display
- "month": Month name or number
- "weekday": Day-of-week name
- "steps": Step counter / pedometer
- "battery": Battery level indicator
- "heart_rate": Heart rate monitor
- "spo2": Blood oxygen level
- "calories": Calorie counter
- "distance": Distance traveled
- "weather": Weather icon or temperature
- "arc": Any circular progress indicator without clear metric
- "text": Any other text label

"representation" â€” HOW the element visually appears:
- "text": Shown as a numeric or text readout (e.g. "8,432" steps displayed as digits)
- "arc": Shown as a circular arc / progress ring
- "icon": Shown as a standalone icon image (no text)
- "text+icon": Shown as an icon next to a text/number value (e.g. heart icon + "72 bpm")
- "text+arc": Shown as a progress arc with a text readout in/near it
- "number": Shown as a pure number (digits only, no label or icon)

"layout" â€” spatial arrangement pattern:
- "row": Elements stacked vertically in a list/column
- "arc": Concentric arcs around the center
- "standalone": Single element placed independently
- "grid": Elements in a grid arrangement

"group" â€” which zone of the 480Ã—480 round watch face:
- "center": The middle area (typically time, central arcs)
- "top": Upper edge area
- "bottom": Lower edge area
- "left_panel": Left side panel
- "right_panel": Right side panel
- "top_left": Upper-left quadrant
- "top_right": Upper-right quadrant
- "bottom_left": Lower-left quadrant
- "bottom_right": Lower-right quadrant

"importance" â€” visual weight:
- "primary": Large, prominent element (usually time, main complication)
- "secondary": Smaller, supporting element

EXAMPLES:

Example 1 - Digital watch with text stats in right panel:
{
  "elements": [
    { "id": "time_digital", "type": "time", "representation": "number", "layout": "standalone", "group": "center", "importance": "primary", "confidence": 0.95 },
    { "id": "date_display", "type": "date", "representation": "text", "layout": "standalone", "group": "top", "importance": "secondary", "confidence": 0.90 },
    { "id": "steps_text", "type": "steps", "representation": "text", "layout": "row", "group": "right_panel", "importance": "secondary", "confidence": 0.85 },
    { "id": "battery_text", "type": "battery", "representation": "text", "layout": "row", "group": "right_panel", "importance": "secondary", "confidence": 0.85 },
    { "id": "heart_text", "type": "heart_rate", "representation": "text", "layout": "row", "group": "right_panel", "importance": "secondary", "confidence": 0.80 }
  ]
}

Example 2 - Analog watch with arc complications:
{
  "elements": [
    { "id": "time_analog", "type": "time", "representation": "arc", "layout": "standalone", "group": "center", "importance": "primary", "confidence": 0.95 },
    { "id": "battery_arc", "type": "battery", "representation": "arc", "layout": "arc", "group": "center", "importance": "secondary", "confidence": 0.88 },
    { "id": "steps_arc", "type": "steps", "representation": "arc", "layout": "arc", "group": "center", "importance": "secondary", "confidence": 0.85 },
    { "id": "heart_arc", "type": "heart_rate", "representation": "arc", "layout": "arc", "group": "center", "importance": "secondary", "confidence": 0.80 }
  ]
}

Example 3 - Mixed design (time center, arcs center, text panel right):
{
  "elements": [
    { "id": "time_digital", "type": "time", "representation": "number", "layout": "standalone", "group": "center", "importance": "primary", "confidence": 0.95 },
    { "id": "battery_arc", "type": "battery", "representation": "arc", "layout": "arc", "group": "center", "importance": "secondary", "confidence": 0.85 },
    { "id": "steps_arc", "type": "steps", "representation": "arc", "layout": "arc", "group": "center", "importance": "secondary", "confidence": 0.82 },
    { "id": "date_text", "type": "date", "representation": "text", "layout": "standalone", "group": "top", "importance": "secondary", "confidence": 0.88 },
    { "id": "weather_text", "type": "weather", "representation": "text+icon", "layout": "row", "group": "bottom_left", "importance": "secondary", "confidence": 0.78 },
    { "id": "calories_text", "type": "calories", "representation": "text", "layout": "row", "group": "right_panel", "importance": "secondary", "confidence": 0.75 }
  ]
}

Example 4 - Icon+text rows (health stats with icons):
{
  "elements": [
    { "id": "time_digital", "type": "time", "representation": "number", "layout": "standalone", "group": "center", "importance": "primary", "confidence": 0.95 },
    { "id": "steps_row", "type": "steps", "representation": "text+icon", "layout": "row", "group": "left_panel", "importance": "secondary", "confidence": 0.85 },
    { "id": "heart_row", "type": "heart_rate", "representation": "text+icon", "layout": "row", "group": "left_panel", "importance": "secondary", "confidence": 0.82 },
    { "id": "battery_row", "type": "battery", "representation": "text+icon", "layout": "row", "group": "right_panel", "importance": "secondary", "confidence": 0.83 },
    { "id": "calories_row", "type": "calories", "representation": "text+icon", "layout": "row", "group": "right_panel", "importance": "secondary", "confidence": 0.80 }
  ]
}

Example 5 - Minimal design (only time + date):
{
  "elements": [
    { "id": "time_digital", "type": "time", "representation": "number", "layout": "standalone", "group": "center", "importance": "primary", "confidence": 0.98 },
    { "id": "date_display", "type": "date", "representation": "text", "layout": "standalone", "group": "bottom", "importance": "secondary", "confidence": 0.90 }
  ]
}
`;

export const AI_USER_PROMPT = `Analyze this watchface design image for Amazfit Balance 2 (480Ã—480 round display).

Identify all visible UI elements. For each, classify its type, representation (how it visually appears), layout pattern, and group (zone on the watch face).

Return ONLY the JSON object. No explanation, no markdown fences.`;

/**
 * JSON Schema for validating AI response before it enters the pipeline.
 * Can be used with Gemini's response_schema parameter for structured output.
 */
export const AI_RESPONSE_SCHEMA = {
  type: 'object' as const,
  properties: {
    elements: {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        properties: {
          id:             { type: 'string' as const },
          type:           { type: 'string' as const, enum: ['time', 'date', 'steps', 'battery', 'heart_rate', 'spo2', 'calories', 'distance', 'weather', 'weekday', 'month', 'arc', 'text'] },
          representation: { type: 'string' as const, enum: ['text', 'arc', 'icon', 'text+icon', 'text+arc', 'number'] },
          layout:         { type: 'string' as const, enum: ['row', 'arc', 'standalone', 'grid'] },
          group:          { type: 'string' as const, enum: ['center', 'top', 'bottom', 'left_panel', 'right_panel', 'top_left', 'top_right', 'bottom_left', 'bottom_right'] },
          importance:     { type: 'string' as const, enum: ['primary', 'secondary'] },
          confidence:     { type: 'number' as const },
        },
        required: ['id', 'type', 'representation', 'layout', 'group'],
      },
    },
  },
  required: ['elements'],
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Stage B: AI Normalization â€” Maps fuzzy AI types â†’ concrete Zepp OS widgets.
// Text-only call (no image). Uses cheaper model.
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

export const STAGE_B_SYSTEM_PROMPT = `You are a Zepp OS watchface element normalizer. You receive a JSON array of semantic elements identified by a vision model and map each to a concrete Zepp OS widget with data bindings.

RULES:
- Map each element to the EXACT Zepp OS widget type
- Assign dataType for ALL data-bound widgets
- Preserve original id and region â€” do NOT change them
- DO NOT add coordinates, sizes, or pixel data
- Resolve ALL ambiguities: every "arc" MUST get a specific metric, every "text" MUST get a purpose

WIDGET MAPPING:
| AI type    | style   | widget        | dataType        |
|------------|---------|---------------|-----------------|
| time       | analog  | TIME_POINTER  | (none)          |
| time       | digital | IMG_TIME      | (none)          |
| date       | any     | IMG_DATE      | (none)          |
| month      | any     | IMG_DATE      | (none)          |
| weekday    | any     | IMG_WEEK      | (none)          |
| steps      | any     | ARC_PROGRESS  | STEP            |
| battery    | any     | ARC_PROGRESS  | BATTERY         |
| heart_rate | any     | ARC_PROGRESS  | HEART           |
| spo2       | any     | ARC_PROGRESS  | SPO2            |
| calories   | any     | ARC_PROGRESS  | CAL             |
| distance   | any     | TEXT_IMG      | DISTANCE        |
| weather    | any     | IMG_LEVEL     | WEATHER_CURRENT |

AMBIGUITY RESOLUTION for "arc" type:
- Look at ALL elements. Identify which metrics are ALREADY assigned.
- Assign the MISSING common metric. Priority order: BATTERY > STEP > HEART > SPO2 > CAL.
- Each ARC_PROGRESS MUST have a UNIQUE dataType. No duplicates allowed.

AMBIGUITY RESOLUTION for "text" type:
- If it appears near data metrics (steps, battery, etc.), use TEXT_IMG with the nearest metric's dataType.
- If it is a label, decoration, or data value, use TEXT with no dataType.

Return ONLY a JSON object. No explanation. No markdown fences.

{
  "elements": [
    {
      "id": "original_id_from_input",
      "widget": "WIDGET_NAME",
      "region": "original_region_from_input",
      "sourceType": "original_type_from_input",
      "dataType": "DATA_TYPE_OR_OMIT_IF_NONE"
    }
  ]
}`;

export const STAGE_B_USER_PROMPT_TEMPLATE = (inputJson: string): string =>
  `Normalize these watchface elements into Zepp OS widgets. Resolve ALL ambiguities.\n\n${inputJson}`;

export const STAGE_B_RESPONSE_SCHEMA = {
  type: 'object' as const,
  properties: {
    elements: {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        properties: {
          id:         { type: 'string' as const },
          widget:     { type: 'string' as const, enum: ['TIME_POINTER', 'IMG_TIME', 'IMG_DATE', 'IMG_WEEK', 'ARC_PROGRESS', 'TEXT', 'TEXT_IMG', 'IMG', 'IMG_STATUS', 'IMG_LEVEL'] },
          region:     { type: 'string' as const, enum: ['center', 'top', 'bottom', 'left', 'right'] },
          sourceType: { type: 'string' as const, enum: ['time', 'date', 'steps', 'battery', 'heart_rate', 'spo2', 'calories', 'distance', 'weather', 'weekday', 'month', 'arc', 'text'] },
          dataType:   { type: 'string' as const },
        },
        required: ['id', 'widget', 'region', 'sourceType'],
      },
    },
  },
  required: ['elements'],
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Call 3: Ambiguity Resolution â€” Resolves remaining unresolved ARC data types.
// Only invoked when Stage B output still has ARC_PROGRESS without dataType.
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

export const CALL_3_SYSTEM_PROMPT = `You are a watchface metric resolver. You receive normalized Zepp OS watchface elements where some ARC_PROGRESS widgets have no dataType assigned. Your job is to assign the correct metric to each unresolved arc.

RULES:
- ONLY modify elements that have widget "ARC_PROGRESS" and no dataType
- Assign from these values ONLY: BATTERY, STEP, HEART, SPO2, CAL
- Each dataType must be UNIQUE â€” no duplicates across the full list
- Common priority for unknown arcs: BATTERY > STEP > HEART
- Consider region hints: top often = battery, bottom often = steps, left/right = heart/spo2
- Do NOT modify elements that already have a dataType
- Do NOT add any fields beyond what's in the input

Return the COMPLETE elements array with ALL dataTypes resolved. Return ONLY JSON.`;

export const CALL_3_USER_PROMPT_TEMPLATE = (inputJson: string): string =>
  `Resolve the missing dataTypes for ARC_PROGRESS elements:\n\n${inputJson}`;

```

### FILE: `src/pipeline/assetImageGenerator.ts`

```typescript
// Pipeline Asset Generator â€” Creates Canvas-drawn PNG images for all widgets.
// Produces the same images that the V2 code generator references.
// No AI. Deterministic. Reuses drawing patterns from the legacy assetGenerator.

import type { ElementImage } from '@/types';
import type { ResolvedElement } from '@/types/pipeline';
import { TIME_DIGIT, DATE_DIGIT, MONTH_LABEL, WEEK_LABEL, WEATHER_ICON, TEXT_IMG_DIGIT } from './constants';

// â”€â”€â”€ Canvas Utility â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function createCanvasImage(
  width: number,
  height: number,
  drawFn: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, width, height);
  drawFn(ctx, width, height);
  return canvas.toDataURL('image/png');
}

// â”€â”€â”€ Digit Generator â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function generateDigitImages(
  prefix: string,
  width: number,
  height: number,
  color: string,
): ElementImage[] {
  const images: ElementImage[] = [];
  for (let i = 0; i < 10; i++) {
    const name = `${prefix}_${i}.png`;
    const dataUrl = createCanvasImage(width, height, (ctx, w, h) => {
      ctx.fillStyle = color;
      ctx.font = `bold ${Math.floor(h * 0.75)}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(i), w / 2, h / 2);
    });
    images.push({ name, dataUrl, bounds: { x: 0, y: 0, width, height }, type: 'IMG' });
  }
  return images;
}

// â”€â”€â”€ Text Label Generator â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function generateTextImages(
  prefix: string,
  labels: string[],
  width: number,
  height: number,
  color: string,
): ElementImage[] {
  return labels.map((label, i) => ({
    name: `${prefix}_${i}.png`,
    dataUrl: createCanvasImage(width, height, (ctx, w, h) => {
      ctx.fillStyle = color;
      ctx.font = `bold ${Math.floor(h * 0.6)}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, w / 2, h / 2);
    }),
    bounds: { x: 0, y: 0, width, height },
    type: 'IMG' as const,
  }));
}

// â”€â”€â”€ Clock Hand Generator â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function generateClockHands(): ElementImage[] {
  return [
    {
      name: 'hour_hand.png',
      dataUrl: createCanvasImage(22, 140, (ctx, w, h) => {
        ctx.fillStyle = '#CCCCCC';
        ctx.beginPath();
        ctx.moveTo(w / 2 - 4, h); ctx.lineTo(w / 2 - 1, 10);
        ctx.lineTo(w / 2, 0); ctx.lineTo(w / 2 + 1, 10);
        ctx.lineTo(w / 2 + 4, h); ctx.closePath(); ctx.fill();
      }),
      bounds: { x: 0, y: 0, width: 22, height: 140 }, type: 'TIME_POINTER',
    },
    {
      name: 'minute_hand.png',
      dataUrl: createCanvasImage(16, 200, (ctx, w, h) => {
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(w / 2 - 3, h); ctx.lineTo(w / 2 - 1, 10);
        ctx.lineTo(w / 2, 0); ctx.lineTo(w / 2 + 1, 10);
        ctx.lineTo(w / 2 + 3, h); ctx.closePath(); ctx.fill();
      }),
      bounds: { x: 0, y: 0, width: 16, height: 200 }, type: 'TIME_POINTER',
    },
    {
      name: 'second_hand.png',
      dataUrl: createCanvasImage(6, 240, (ctx, w, h) => {
        ctx.fillStyle = '#FF4444';
        ctx.fillRect(w / 2 - 1, 0, 2, h);
        ctx.beginPath(); ctx.arc(w / 2, 120, 3, 0, Math.PI * 2); ctx.fill();
      }),
      bounds: { x: 0, y: 0, width: 6, height: 240 }, type: 'TIME_POINTER',
    },
    {
      name: 'hand_cover.png',
      dataUrl: createCanvasImage(30, 30, (ctx, w, h) => {
        ctx.fillStyle = '#888888';
        ctx.beginPath(); ctx.arc(w / 2, h / 2, 12, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#AAAAAA'; ctx.lineWidth = 2; ctx.stroke();
      }),
      bounds: { x: 0, y: 0, width: 30, height: 30 }, type: 'TIME_POINTER',
    },
  ];
}

// â”€â”€â”€ Weather Icons â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function generateWeatherIcons(): ElementImage[] {
  const symbols = ['â˜€', 'â›…', 'â˜', 'ðŸŒ§', 'ðŸŒ©', 'â„', 'ðŸŒ«'];
  return Array.from({ length: 29 }, (_, i) => ({
    name: `weather_${i}.png`,
    dataUrl: createCanvasImage(WEATHER_ICON.w, WEATHER_ICON.h, (ctx, w, h) => {
      ctx.fillStyle = '#FFD700';
      ctx.font = `${Math.floor(h * 0.55)}px serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(symbols[i % symbols.length], w / 2, h / 2);
    }),
    bounds: { x: 0, y: 0, width: WEATHER_ICON.w, height: WEATHER_ICON.h },
    type: 'IMG_LEVEL' as const,
  }));
}

// â”€â”€â”€ Status Icons â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function generateStatusIcons(): ElementImage[] {
  return [
    {
      name: 'bluetooth_5_b_30x30.png',
      dataUrl: createCanvasImage(30, 30, (ctx, w) => {
        ctx.strokeStyle = '#4A9EFF'; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(w * 0.3, w * 0.25); ctx.lineTo(w * 0.65, w * 0.5);
        ctx.lineTo(w * 0.3, w * 0.75);
        ctx.moveTo(w * 0.65, w * 0.5); ctx.lineTo(w * 0.4, w * 0.7);
        ctx.lineTo(w * 0.6, w * 0.85); ctx.lineTo(w * 0.6, w * 0.15);
        ctx.lineTo(w * 0.4, w * 0.3); ctx.lineTo(w * 0.65, w * 0.5);
        ctx.stroke();
      }),
      bounds: { x: 0, y: 0, width: 30, height: 30 },
      type: 'IMG_STATUS',
    },
  ];
}

// â”€â”€â”€ Transparent Button Image â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function generateTransparentImage(): ElementImage {
  return {
    name: 'trasparente.png',
    dataUrl: createCanvasImage(1, 1, () => {}),
    bounds: { x: 0, y: 0, width: 1, height: 1 },
    type: 'BUTTON' as const,
  };
}

// â”€â”€â”€ Data Type â†’ Color â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const DATA_TYPE_COLORS: Record<string, string> = {
  BATTERY:  '#00CC88',
  HEART:    '#FF6B6B',
  STEP:     '#FFD93D',
  CAL:      '#FF9F43',
  DISTANCE: '#54A0FF',
  SPO2:     '#EE5A24',
  WEATHER_CURRENT: '#FFD700',
};

const DATA_TYPE_PREFIXES: Record<string, string> = {
  BATTERY:  'batt_digit',
  STEP:     'step_digit',
  HEART:    'heart_digit',
  SPO2:     'spo2_digit',
  CAL:      'cal_digit',
  DISTANCE: 'dist_digit',
};

// â”€â”€â”€ Main: Generate All Assets for Pipeline Elements â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function generatePipelineAssets(elements: ResolvedElement[]): ElementImage[] {
  const images: ElementImage[] = [];
  const generatedSets = new Set<string>();

  for (const el of elements) {
    switch (el.widget) {
      case 'TIME_POINTER': {
        if (!generatedSets.has('clock_hands')) {
          images.push(...generateClockHands());
          generatedSets.add('clock_hands');
        }
        break;
      }

      case 'IMG_TIME': {
        if (!generatedSets.has('time_digits')) {
          images.push(...generateDigitImages('time_digit', TIME_DIGIT.w, TIME_DIGIT.h, '#FFFFFF'));
          generatedSets.add('time_digits');
        }
        break;
      }

      case 'IMG_DATE': {
        if (el.sourceType === 'month') {
          if (!generatedSets.has('month_images')) {
            const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
                            'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
            images.push(...generateTextImages('month', months, MONTH_LABEL.w, MONTH_LABEL.h, '#AAAAAA'));
            generatedSets.add('month_images');
          }
        } else {
          if (!generatedSets.has('date_digits')) {
            images.push(...generateDigitImages('date_digit', DATE_DIGIT.w, DATE_DIGIT.h, '#AAAAAA'));
            generatedSets.add('date_digits');
          }
        }
        break;
      }

      case 'IMG_WEEK': {
        if (!generatedSets.has('week_images')) {
          const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
          images.push(...generateTextImages('week', days, WEEK_LABEL.w, WEEK_LABEL.h, '#AAAAAA'));
          generatedSets.add('week_images');
        }
        break;
      }

      case 'ARC_PROGRESS': {
        // ARC_PROGRESS uses color only â€” no image assets needed
        break;
      }

      case 'TEXT_IMG': {
        const prefix = el.dataType ? DATA_TYPE_PREFIXES[el.dataType] || 'digit' : 'digit';
        if (!generatedSets.has(`textimg_${prefix}`)) {
          const color = el.dataType ? DATA_TYPE_COLORS[el.dataType] || '#FFFFFF' : '#FFFFFF';
          images.push(...generateDigitImages(prefix, TEXT_IMG_DIGIT.w, TEXT_IMG_DIGIT.h, color));
          generatedSets.add(`textimg_${prefix}`);
        }
        break;
      }

      case 'IMG_LEVEL': {
        if (el.sourceType === 'weather') {
          if (!generatedSets.has('weather_icons')) {
            images.push(...generateWeatherIcons());
            generatedSets.add('weather_icons');
          }
        }
        break;
      }

      case 'IMG_STATUS': {
        if (!generatedSets.has('status_icons')) {
          images.push(...generateStatusIcons());
          generatedSets.add('status_icons');
        }
        break;
      }

      case 'TEXT':
      case 'IMG':
        // No image assets needed for plain text or generic IMG
        break;
    }
  }

  // Always include transparent image (used for buttons, backgrounds)
  if (!generatedSets.has('transparent')) {
    images.push(generateTransparentImage());
    generatedSets.add('transparent');
  }

  return images;
}

```


## PIPELINE TESTS (src/pipeline/__tests__/)

### FILE: `src/pipeline/__tests__/pipeline-arc-only.test.ts`

```typescript
// T016: Arc-only regression test
// Verify: all-arc input â†’ all ARC_PROGRESS widgets, correct geometry

import { describe, it, expect } from 'vitest';
import type { AIElement } from '@/types/pipeline';
import { normalize } from '../normalizer';
import { sortArcsByPriority } from '../semanticPriority';
import { applyLayout } from '../layoutEngine';
import { solveGeometry } from '../geometrySolver';
import { validateNormalized, validateLayout, validateGeometry } from '../validators';

const ARC_ONLY_INPUT: AIElement[] = [
  { id: 'battery_arc', type: 'battery', representation: 'arc', layout: 'arc', group: 'center', importance: 'secondary', confidence: 0.9 },
  { id: 'steps_arc', type: 'steps', representation: 'arc', layout: 'arc', group: 'center', importance: 'secondary', confidence: 0.85 },
  { id: 'heart_arc', type: 'heart_rate', representation: 'arc', layout: 'arc', group: 'center', importance: 'secondary', confidence: 0.8 },
  { id: 'spo2_arc', type: 'spo2', representation: 'arc', layout: 'arc', group: 'center', importance: 'secondary', confidence: 0.75 },
];

describe('T016: Arc-only design regression', () => {
  it('normalize â†’ all ARC_PROGRESS', () => {
    const normalized = normalize(ARC_ONLY_INPUT);

    expect(normalized).toHaveLength(4);
    for (const el of normalized) {
      expect(el.widget).toBe('ARC_PROGRESS');
      expect(el.group).toBe('center');
      expect(el.layout).toBe('arc');
    }

    // All dataTypes assigned
    const dataTypes = normalized.map(e => e.dataType);
    expect(dataTypes).toContain('BATTERY');
    expect(dataTypes).toContain('STEP');
    expect(dataTypes).toContain('HEART');
    expect(dataTypes).toContain('SPO2');
  });

  it('validation passes', () => {
    const normalized = normalize(ARC_ONLY_INPUT);
    expect(() => validateNormalized(normalized)).not.toThrow();
  });

  it('layout â†’ all center-locked at 240,240', () => {
    const normalized = sortArcsByPriority(normalize(ARC_ONLY_INPUT));
    const layouted = applyLayout(normalized);

    expect(() => validateLayout(layouted)).not.toThrow();

    for (const el of layouted) {
      expect(el.centerX).toBe(240);
      expect(el.centerY).toBe(240);
    }
  });

  it('geometry â†’ concentric arcs with decreasing radius', () => {
    const normalized = sortArcsByPriority(normalize(ARC_ONLY_INPUT));
    const layouted = applyLayout(normalized);
    const geometry = solveGeometry(layouted);

    expect(() => validateGeometry(geometry)).not.toThrow();

    // All arcs should have radius, startAngle, endAngle, lineWidth
    for (const el of geometry) {
      expect(el.radius).toBeGreaterThan(0);
      expect(el.startAngle).toBeDefined();
      expect(el.endAngle).toBeDefined();
      expect(el.lineWidth).toBeGreaterThan(0);
    }

    // Radii should decrease (concentric stacking)
    const radii = geometry.map(e => e.radius!);
    for (let i = 1; i < radii.length; i++) {
      expect(radii[i]).toBeLessThan(radii[i - 1]);
    }
  });
});

```

### FILE: `src/pipeline/__tests__/pipeline-corrector-arc-regression.test.ts`

```typescript
// T018: Regression â€” arc-only design remains arc after correction
// A legitimate 2-arc design should NOT be overcorrected

import { describe, it, expect } from 'vitest';
import type { AIElement } from '@/types/pipeline';
import { correctRepresentation } from '../representationCorrector';

const ARC_ONLY_INPUT: AIElement[] = [
  { id: 'battery_arc', type: 'battery', representation: 'arc', layout: 'arc', group: 'center', importance: 'primary', confidence: 0.95 },
  { id: 'steps_arc', type: 'steps', representation: 'arc', layout: 'arc', group: 'center', importance: 'primary', confidence: 0.9 },
];

describe('T018: Arc-only design (2 arcs) remains arc', () => {
  it('2 arcs stay as arcs (within MAX_ARCS limit)', () => {
    const corrected = correctRepresentation(ARC_ONLY_INPUT);
    const arcs = corrected.filter(e => e.representation === 'arc');
    expect(arcs).toHaveLength(2);
  });

  it('layout stays arc for both', () => {
    const corrected = correctRepresentation(ARC_ONLY_INPUT);
    for (const el of corrected) {
      expect(el.layout).toBe('arc');
    }
  });

  it('group stays center for both', () => {
    const corrected = correctRepresentation(ARC_ONLY_INPUT);
    for (const el of corrected) {
      expect(el.group).toBe('center');
    }
  });

  it('no corrections applied (design is legitimate)', () => {
    const corrected = correctRepresentation(ARC_ONLY_INPUT);
    expect(corrected).toEqual(ARC_ONLY_INPUT);
  });
});

```

### FILE: `src/pipeline/__tests__/pipeline-corrector-mixed-regression.test.ts`

```typescript
// T020: Regression â€” mixed design produces mixed widgets after correction

import { describe, it, expect } from 'vitest';
import type { AIElement } from '@/types/pipeline';
import { correctRepresentation } from '../representationCorrector';
import { normalize } from '../normalizer';

// Mixed design: 2 arcs + 3 text rows â€” already correct, should pass through
const MIXED_CORRECT_INPUT: AIElement[] = [
  { id: 'battery_arc', type: 'battery', representation: 'arc', layout: 'arc', group: 'center', importance: 'primary', confidence: 0.95 },
  { id: 'steps_arc', type: 'steps', representation: 'arc', layout: 'arc', group: 'center', importance: 'primary', confidence: 0.9 },
  { id: 'heart_text', type: 'heart_rate', representation: 'text', layout: 'row', group: 'right_panel', importance: 'secondary', confidence: 0.85 },
  { id: 'spo2_text', type: 'spo2', representation: 'text', layout: 'row', group: 'right_panel', importance: 'secondary', confidence: 0.8 },
  { id: 'calories_text', type: 'calories', representation: 'text', layout: 'row', group: 'right_panel', importance: 'secondary', confidence: 0.75 },
];

describe('T020: Mixed design produces mixed widgets', () => {
  it('no corrections applied (design is already mixed)', () => {
    const corrected = correctRepresentation(MIXED_CORRECT_INPUT);
    expect(corrected).toEqual(MIXED_CORRECT_INPUT);
  });

  it('after normalize: both ARC_PROGRESS and TEXT_IMG present', () => {
    const corrected = correctRepresentation(MIXED_CORRECT_INPUT);
    const normalized = normalize(corrected);
    const widgetTypes = new Set(normalized.map(e => e.widget));

    expect(widgetTypes.has('ARC_PROGRESS')).toBe(true);
    expect(widgetTypes.has('TEXT_IMG')).toBe(true);
  });

  it('exactly 2 ARC_PROGRESS + 3 TEXT_IMG', () => {
    const corrected = correctRepresentation(MIXED_CORRECT_INPUT);
    const normalized = normalize(corrected);

    const arcs = normalized.filter(e => e.widget === 'ARC_PROGRESS');
    const texts = normalized.filter(e => e.widget === 'TEXT_IMG');

    expect(arcs).toHaveLength(2);
    expect(texts).toHaveLength(3);
  });
});

```

### FILE: `src/pipeline/__tests__/pipeline-corrector-text-regression.test.ts`

```typescript
// T019: Regression â€” text-only design remains text after correction

import { describe, it, expect } from 'vitest';
import type { AIElement } from '@/types/pipeline';
import { correctRepresentation } from '../representationCorrector';

const TEXT_ONLY_INPUT: AIElement[] = [
  { id: 'steps_text', type: 'steps', representation: 'text', layout: 'row', group: 'right_panel', importance: 'secondary', confidence: 0.9 },
  { id: 'battery_text', type: 'battery', representation: 'text', layout: 'row', group: 'right_panel', importance: 'secondary', confidence: 0.85 },
  { id: 'heart_text', type: 'heart_rate', representation: 'text', layout: 'row', group: 'right_panel', importance: 'secondary', confidence: 0.8 },
];

describe('T019: Text-only design remains text', () => {
  it('no arcs before or after correction', () => {
    const corrected = correctRepresentation(TEXT_ONLY_INPUT);
    const arcs = corrected.filter(e => e.representation === 'arc');
    expect(arcs).toHaveLength(0);
  });

  it('no corrections applied (no collapse detected)', () => {
    const corrected = correctRepresentation(TEXT_ONLY_INPUT);
    expect(corrected).toEqual(TEXT_ONLY_INPUT);
  });

  it('layout and group unchanged', () => {
    const corrected = correctRepresentation(TEXT_ONLY_INPUT);
    for (const el of corrected) {
      expect(el.layout).toBe('row');
      expect(el.group).toBe('right_panel');
    }
  });
});

```

### FILE: `src/pipeline/__tests__/pipeline-corrector-zpk60.test.ts`

```typescript
// T016: Run pipeline with the failing design (ZPK 60 â€” all-arc collapse)
// Verify the representation corrector fixes it: not all arcs, mixed widget types

import { describe, it, expect } from 'vitest';
import type { AIElement } from '@/types/pipeline';
import { correctRepresentation } from '../representationCorrector';
import { normalize } from '../normalizer';

// This is what the AI produced for ZPK 60 â€” everything collapsed to arc/center
const ZPK60_AI_OUTPUT: AIElement[] = [
  { id: 'time_digital', type: 'time', representation: 'arc', layout: 'arc', group: 'center', confidence: 0.95 },
  { id: 'date_day', type: 'date', representation: 'arc', layout: 'arc', group: 'center', confidence: 0.9 },
  { id: 'weekday', type: 'weekday', representation: 'arc', layout: 'arc', group: 'center', confidence: 0.9 },
  { id: 'month', type: 'month', representation: 'arc', layout: 'arc', group: 'center', confidence: 0.9 },
  { id: 'steps_arc', type: 'steps', representation: 'arc', layout: 'arc', group: 'center', importance: 'secondary', confidence: 0.85 },
  { id: 'battery_arc', type: 'battery', representation: 'arc', layout: 'arc', group: 'center', importance: 'secondary', confidence: 0.8 },
  { id: 'heart_arc', type: 'heart_rate', representation: 'arc', layout: 'arc', group: 'center', importance: 'secondary', confidence: 0.8 },
  { id: 'weather', type: 'weather', representation: 'arc', layout: 'arc', group: 'center', confidence: 0.75 },
  { id: 'spo2_arc', type: 'spo2', representation: 'arc', layout: 'arc', group: 'center', importance: 'secondary', confidence: 0.7 },
  { id: 'calories_arc', type: 'calories', representation: 'arc', layout: 'arc', group: 'center', importance: 'secondary', confidence: 0.7 },
];

describe('T016: Failing design (ZPK 60 all-arc collapse) â†’ corrector fixes it', () => {
  it('before correction: all arcs', () => {
    const arcCount = ZPK60_AI_OUTPUT.filter(e => e.representation === 'arc').length;
    expect(arcCount).toBe(10); // everything collapsed
  });

  it('after correction: NOT all arcs', () => {
    const corrected = correctRepresentation(ZPK60_AI_OUTPUT);
    const arcCount = corrected.filter(e => e.representation === 'arc').length;
    expect(arcCount).toBeLessThanOrEqual(2); // max 2 arcs enforced
  });

  it('after correction: groups redistributed (not all center)', () => {
    const corrected = correctRepresentation(ZPK60_AI_OUTPUT);
    const groups = new Set(corrected.map(e => e.group));
    expect(groups.size).toBeGreaterThan(1); // not all center anymore
  });

  it('after correction: data types get text/text+icon representation', () => {
    const corrected = correctRepresentation(ZPK60_AI_OUTPUT);
    const steps = corrected.find(e => e.type === 'steps');
    const battery = corrected.find(e => e.type === 'battery');
    const heart = corrected.find(e => e.type === 'heart_rate');
    const spo2 = corrected.find(e => e.type === 'spo2');
    const calories = corrected.find(e => e.type === 'calories');

    expect(steps!.representation).toBe('text+icon');
    expect(battery!.representation).toBe('text+icon');
    expect(heart!.representation).toBe('text+icon');
    expect(spo2!.representation).toBe('text');
    expect(calories!.representation).toBe('text');
  });

  it('after correction + normalize: mixed widget types', () => {
    const corrected = correctRepresentation(ZPK60_AI_OUTPUT);
    const normalized = normalize(corrected);
    const widgetTypes = new Set(normalized.map(e => e.widget));

    expect(widgetTypes.size).toBeGreaterThanOrEqual(2); // SC-003
    expect(widgetTypes.has('ARC_PROGRESS')).toBe(false); // no arcs left after type overrides
    expect(widgetTypes.has('TEXT_IMG')).toBe(true);
  });

  it('corrector does not mutate input', () => {
    const copy = ZPK60_AI_OUTPUT.map(e => ({ ...e }));
    correctRepresentation(ZPK60_AI_OUTPUT);
    expect(ZPK60_AI_OUTPUT).toEqual(copy);
  });
});

```

### FILE: `src/pipeline/__tests__/pipeline-mixed.test.ts`

```typescript
// T018: Mixed design test
// Verify: 2 arcs + 3 text rows â†’ exactly 2 ARC_PROGRESS + 3 TEXT_IMG

import { describe, it, expect } from 'vitest';
import type { AIElement } from '@/types/pipeline';
import { normalize } from '../normalizer';
import { sortArcsByPriority } from '../semanticPriority';
import { applyLayout } from '../layoutEngine';
import { solveGeometry } from '../geometrySolver';
import { validateNormalized, validateLayout, validateGeometry } from '../validators';

const MIXED_INPUT: AIElement[] = [
  // 2 arc elements â€” center group
  { id: 'battery_arc', type: 'battery', representation: 'arc', layout: 'arc', group: 'center', importance: 'primary', confidence: 0.95 },
  { id: 'steps_arc', type: 'steps', representation: 'arc', layout: 'arc', group: 'center', importance: 'secondary', confidence: 0.9 },
  // 3 text elements â€” right_panel group
  { id: 'heart_text', type: 'heart_rate', representation: 'text', layout: 'row', group: 'right_panel', importance: 'secondary', confidence: 0.85 },
  { id: 'spo2_text', type: 'spo2', representation: 'text', layout: 'row', group: 'right_panel', importance: 'secondary', confidence: 0.8 },
  { id: 'calories_text', type: 'calories', representation: 'text', layout: 'row', group: 'right_panel', importance: 'secondary', confidence: 0.75 },
];

describe('T018: Mixed design â€” 2 arcs + 3 text rows', () => {
  it('normalize â†’ exactly 2 ARC_PROGRESS + 3 TEXT_IMG', () => {
    const normalized = normalize(MIXED_INPUT);

    expect(normalized).toHaveLength(5);

    const arcs = normalized.filter(e => e.widget === 'ARC_PROGRESS');
    const texts = normalized.filter(e => e.widget === 'TEXT_IMG');

    expect(arcs).toHaveLength(2);
    expect(texts).toHaveLength(3);

    // Arc elements in center group
    for (const el of arcs) {
      expect(el.group).toBe('center');
      expect(el.layout).toBe('arc');
    }

    // Text elements in right_panel group
    for (const el of texts) {
      expect(el.group).toBe('right_panel');
      expect(el.layout).toBe('row');
    }
  });

  it('dataTypes correctly assigned across both widget types', () => {
    const normalized = normalize(MIXED_INPUT);
    const dataTypes = normalized.map(e => e.dataType);

    expect(dataTypes).toContain('BATTERY');
    expect(dataTypes).toContain('STEP');
    expect(dataTypes).toContain('HEART');
    expect(dataTypes).toContain('SPO2');
    expect(dataTypes).toContain('CAL');
  });

  it('validation passes', () => {
    const normalized = normalize(MIXED_INPUT);
    expect(() => validateNormalized(normalized)).not.toThrow();
  });

  it('layout â†’ arcs center-locked, texts row-stacked', () => {
    const normalized = sortArcsByPriority(normalize(MIXED_INPUT));
    const layouted = applyLayout(normalized);

    expect(() => validateLayout(layouted)).not.toThrow();

    const arcs = layouted.filter(e => e.widget === 'ARC_PROGRESS');
    const texts = layouted.filter(e => e.widget === 'TEXT_IMG');

    // Arcs center-locked at (240, 240)
    for (const el of arcs) {
      expect(el.centerX).toBe(240);
      expect(el.centerY).toBe(240);
    }

    // Texts NOT at screen center, stacked vertically
    const textYs = texts.map(e => e.centerY);
    for (let i = 1; i < textYs.length; i++) {
      expect(textYs[i]).toBeGreaterThan(textYs[i - 1]);
    }
    for (const el of texts) {
      expect(el.centerX).not.toBe(240);
    }
  });

  it('geometry â†’ arcs get radius/angles, texts get bbox', () => {
    const normalized = sortArcsByPriority(normalize(MIXED_INPUT));
    const layouted = applyLayout(normalized);
    const geometry = solveGeometry(layouted);

    expect(() => validateGeometry(geometry)).not.toThrow();

    const arcs = geometry.filter(e => e.widget === 'ARC_PROGRESS');
    const texts = geometry.filter(e => e.widget === 'TEXT_IMG');

    // Arcs have arc-specific properties
    for (const el of arcs) {
      expect(el.radius).toBeGreaterThan(0);
      expect(el.startAngle).toBeDefined();
      expect(el.endAngle).toBeDefined();
      expect(el.lineWidth).toBeGreaterThan(0);
    }

    // Texts have rectangular bbox, NO arc properties
    for (const el of texts) {
      expect(el.x).toBeDefined();
      expect(el.y).toBeDefined();
      expect(el.w).toBeGreaterThan(0);
      expect(el.h).toBeGreaterThan(0);
      expect(el.radius).toBeUndefined();
      expect(el.startAngle).toBeUndefined();
      expect(el.endAngle).toBeUndefined();
      expect(el.lineWidth).toBeUndefined();
    }
  });
});

```

### FILE: `src/pipeline/__tests__/pipeline-text-only.test.ts`

```typescript
// T017: Text-only design test
// Verify: all-text input â†’ ZERO ARC_PROGRESS, all TEXT_IMG widgets, row layout geometry

import { describe, it, expect } from 'vitest';
import type { AIElement } from '@/types/pipeline';
import { normalize } from '../normalizer';
import { sortArcsByPriority } from '../semanticPriority';
import { applyLayout } from '../layoutEngine';
import { solveGeometry } from '../geometrySolver';
import { validateNormalized, validateLayout, validateGeometry } from '../validators';

const TEXT_ONLY_INPUT: AIElement[] = [
  { id: 'steps_text', type: 'steps', representation: 'text', layout: 'row', group: 'right_panel', importance: 'secondary', confidence: 0.9 },
  { id: 'battery_text', type: 'battery', representation: 'text', layout: 'row', group: 'right_panel', importance: 'secondary', confidence: 0.85 },
  { id: 'heart_text', type: 'heart_rate', representation: 'text', layout: 'row', group: 'right_panel', importance: 'secondary', confidence: 0.8 },
  { id: 'spo2_text', type: 'spo2', representation: 'text', layout: 'row', group: 'right_panel', importance: 'secondary', confidence: 0.75 },
  { id: 'calories_text', type: 'calories', representation: 'text', layout: 'row', group: 'right_panel', importance: 'secondary', confidence: 0.7 },
];

describe('T017: Text-only design â€” zero arcs', () => {
  it('normalize â†’ all TEXT_IMG, zero ARC_PROGRESS', () => {
    const normalized = normalize(TEXT_ONLY_INPUT);

    expect(normalized).toHaveLength(5);
    for (const el of normalized) {
      expect(el.widget).toBe('TEXT_IMG');
      expect(el.widget).not.toBe('ARC_PROGRESS');
      expect(el.group).toBe('right_panel');
      expect(el.layout).toBe('row');
    }

    // Correct dataTypes assigned
    const dataTypes = normalized.map(e => e.dataType);
    expect(dataTypes).toContain('STEP');
    expect(dataTypes).toContain('BATTERY');
    expect(dataTypes).toContain('HEART');
    expect(dataTypes).toContain('SPO2');
    expect(dataTypes).toContain('CAL');
  });

  it('validation passes', () => {
    const normalized = normalize(TEXT_ONLY_INPUT);
    expect(() => validateNormalized(normalized)).not.toThrow();
  });

  it('layout â†’ vertical row stack, NOT center-locked', () => {
    const normalized = sortArcsByPriority(normalize(TEXT_ONLY_INPUT));
    const layouted = applyLayout(normalized);

    expect(() => validateLayout(layouted)).not.toThrow();

    // Row elements should NOT be center-locked at (240, 240)
    // They should be stacked vertically in the right_panel zone
    const centerYValues = layouted.map(e => e.centerY);

    // Each subsequent element should be further down (increasing centerY)
    for (let i = 1; i < centerYValues.length; i++) {
      expect(centerYValues[i]).toBeGreaterThan(centerYValues[i - 1]);
    }

    // None should be at the screen center (240) â€” that's arc territory
    for (const el of layouted) {
      expect(el.centerX).not.toBe(240);
    }
  });

  it('geometry â†’ bbox (x, y, w, h), NO arc properties', () => {
    const normalized = sortArcsByPriority(normalize(TEXT_ONLY_INPUT));
    const layouted = applyLayout(normalized);
    const geometry = solveGeometry(layouted);

    expect(() => validateGeometry(geometry)).not.toThrow();

    for (const el of geometry) {
      // Must have rectangular bbox
      expect(el.x).toBeDefined();
      expect(el.y).toBeDefined();
      expect(el.w).toBeGreaterThan(0);
      expect(el.h).toBeGreaterThan(0);

      // Must NOT have arc-specific properties
      expect(el.radius).toBeUndefined();
      expect(el.startAngle).toBeUndefined();
      expect(el.endAngle).toBeUndefined();
      expect(el.lineWidth).toBeUndefined();
    }
  });
});

```

### FILE: `src/pipeline/__tests__/pipeline-zpk-reference.test.ts`

```typescript
// T020: ZPK extraction comparison against reference (extracted_reference/device/)
// The reference watchface "Brushed Steel Petroleum" is an icon+text design â€” ZERO arcs.
// This test verifies that a similar design fed through our pipeline produces the same
// widget type profile: TEXT_IMG for data values, IMG for icons, IMG_TIME for time,
// IMG_DATE for date/month, IMG_WEEK for weekday â€” and NO ARC_PROGRESS.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import type { AIElement } from '@/types/pipeline';
import { normalize } from '../normalizer';
import { sortArcsByPriority } from '../semanticPriority';
import { applyLayout } from '../layoutEngine';
import { solveGeometry } from '../geometrySolver';

// â”€â”€â”€ Parse reference watchface widget types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const REFERENCE_PATH = resolve(__dirname, '../../../../extracted_reference/device/watchface/index.js');

function extractWidgetTypes(source: string): string[] {
  // Match hmUI.widget.XXXX patterns
  const matches = source.match(/hmUI\.widget\.(\w+)/g) ?? [];
  return [...new Set(matches.map(m => m.replace('hmUI.widget.', '')))];
}

// â”€â”€â”€ Build AIElement[] that mirrors the reference design â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Reference "Brushed Steel Petroleum" has:
//   - IMG_TIME (digital time, left side)
//   - IMG_WEEK (weekday)
//   - IMG_DATE x2 (day + month)
//   - IMG x many (icons: battery, heart, steps, spo2, stress + label text)
//   - TEXT (city name)
//   - IMG_LEVEL (weather)
//   - IMG_STATUS (bluetooth)
//   - BUTTON (click areas)
// Key point: NO ARC_PROGRESS â€” all stats are icon+text, not arcs.

const REFERENCE_STYLE_INPUT: AIElement[] = [
  { id: 'time_digital', type: 'time', representation: 'text', layout: 'standalone', group: 'left_panel', confidence: 0.95 },
  { id: 'weekday', type: 'weekday', representation: 'text', layout: 'standalone', group: 'top_left', confidence: 0.9 },
  { id: 'date_day', type: 'date', representation: 'text', layout: 'standalone', group: 'top_left', confidence: 0.9 },
  { id: 'date_month', type: 'month', representation: 'text', layout: 'standalone', group: 'top_left', confidence: 0.9 },
  { id: 'battery_stat', type: 'battery', representation: 'text+icon', layout: 'row', group: 'right_panel', importance: 'secondary', confidence: 0.85 },
  { id: 'heart_stat', type: 'heart_rate', representation: 'text+icon', layout: 'row', group: 'right_panel', importance: 'secondary', confidence: 0.85 },
  { id: 'steps_stat', type: 'steps', representation: 'text+icon', layout: 'row', group: 'right_panel', importance: 'secondary', confidence: 0.8 },
  { id: 'spo2_stat', type: 'spo2', representation: 'text+icon', layout: 'row', group: 'right_panel', importance: 'secondary', confidence: 0.75 },
  { id: 'calories_stat', type: 'calories', representation: 'text+icon', layout: 'row', group: 'bottom_right', importance: 'secondary', confidence: 0.7 },
];

describe('T020: ZPK reference comparison â€” Brushed Steel Petroleum', () => {
  it('reference watchface contains ZERO ARC_PROGRESS', () => {
    const source = readFileSync(REFERENCE_PATH, 'utf-8');
    const widgetTypes = extractWidgetTypes(source);

    expect(widgetTypes).not.toContain('ARC_PROGRESS');
    expect(widgetTypes).toContain('IMG_TIME');
    expect(widgetTypes).toContain('IMG_DATE');
    expect(widgetTypes).toContain('IMG_WEEK');
    expect(widgetTypes).toContain('IMG');
    expect(widgetTypes).toContain('TEXT');
  });

  it('pipeline output for similar design â†’ ZERO ARC_PROGRESS', () => {
    const normalized = normalize(REFERENCE_STYLE_INPUT);
    const widgets = normalized.map(e => e.widget);

    expect(widgets).not.toContain('ARC_PROGRESS');
    // text+icon compounds expand to TEXT_IMG + IMG pairs
    expect(widgets.filter(w => w === 'TEXT_IMG').length).toBeGreaterThanOrEqual(5);
    expect(widgets.filter(w => w === 'IMG').length).toBeGreaterThanOrEqual(5);
  });

  it('pipeline widget types match reference widget profile', () => {
    const normalized = normalize(REFERENCE_STYLE_INPUT);
    const pipelineWidgets = new Set(normalized.map(e => e.widget));

    // Reference uses: IMG_TIME, IMG_DATE, IMG_WEEK, IMG, TEXT
    // Pipeline should produce: IMG_TIME, IMG_DATE, IMG_WEEK, TEXT_IMG, IMG
    // TEXT_IMG is our generator's equivalent of reference's IMG (for data display)
    expect(pipelineWidgets.has('IMG_TIME')).toBe(true);   // digital time
    expect(pipelineWidgets.has('IMG_DATE')).toBe(true);   // date + month
    expect(pipelineWidgets.has('IMG_WEEK')).toBe(true);   // weekday
    expect(pipelineWidgets.has('TEXT_IMG')).toBe(true);    // data values (replaces dead-static IMG labels)
    expect(pipelineWidgets.has('IMG')).toBe(true);         // icons from text+icon compounds
    expect(pipelineWidgets.has('ARC_PROGRESS')).toBe(false); // no arcs in a text+icon design
  });

  it('compound text+icon elements expand correctly', () => {
    const normalized = normalize(REFERENCE_STYLE_INPUT);

    // 5 text+icon elements should produce 10 normalized entries (5 TEXT_IMG + 5 IMG)
    // Plus 4 non-compound elements (time, weekday, day, month)
    const compoundSources = normalized.filter(
      e => e.sourceType === 'battery' || e.sourceType === 'heart_rate' ||
           e.sourceType === 'steps' || e.sourceType === 'spo2' || e.sourceType === 'calories'
    );
    expect(compoundSources).toHaveLength(10); // 5 types Ã— 2 widgets each

    // Each pair: one TEXT_IMG, one IMG
    for (const type of ['battery', 'heart_rate', 'steps', 'spo2', 'calories']) {
      const pair = compoundSources.filter(e => e.sourceType === type);
      expect(pair).toHaveLength(2);
      expect(pair.map(e => e.widget).sort()).toEqual(['IMG', 'TEXT_IMG']);
    }

    // Second elements have parentId linking to first
    for (const type of ['battery', 'heart_rate', 'steps', 'spo2', 'calories']) {
      const pair = compoundSources.filter(e => e.sourceType === type);
      const primary = pair.find(e => !e.parentId);
      const secondary = pair.find(e => e.parentId);
      expect(primary).toBeDefined();
      expect(secondary).toBeDefined();
      expect(secondary!.parentId).toBe(primary!.id);
    }
  });

  it('full pipeline produces valid geometry for text+icon design', () => {
    const normalized = sortArcsByPriority(normalize(REFERENCE_STYLE_INPUT));
    const layouted = applyLayout(normalized);
    const geometry = solveGeometry(layouted);

    // No element should have arc geometry
    for (const el of geometry) {
      expect(el.radius).toBeUndefined();
      expect(el.startAngle).toBeUndefined();
      expect(el.endAngle).toBeUndefined();
    }

    // Row elements in right_panel should be vertically stacked
    const rightPanelRows = geometry.filter(e => e.group === 'right_panel');
    expect(rightPanelRows.length).toBeGreaterThan(0);

    // All geometry elements should have valid coords
    for (const el of geometry) {
      if (el.widget === 'IMG_TIME') continue; // IMG_TIME uses startX/startY pattern
      expect(el.x).toBeDefined();
      expect(el.y).toBeDefined();
    }
  });
});

```


## LIB MODULES (src/lib/)

### FILE: `src/lib/jsCodeGeneratorV2.ts`

```typescript
// V2 Code Generator for ZeppOS Watch Faces (Balance 2 & Legacy Devices)
// Generates v2 manifest structure with flat organization
// Compatible with Amazfit Balance 2, Balance, Active Max (older Zepp OS)

import type { WatchFaceConfig, WatchFaceElement, GeneratedCode } from '@/types';
import { HOUR_CONTENT_W, TIME_COLON_GAP } from '@/pipeline/constants';

export function generateWatchFaceCodeV2(config: WatchFaceConfig): GeneratedCode {
  console.log('[JSGenV2] Starting v2 code generation for:', config.name);
  try {
    const appJson = generateAppJsonV2(config);
    console.log('[JSGenV2] app.json v2 generated, length:', appJson.length);
    
    const appJs = generateAppJsV2(config);
    console.log('[JSGenV2] app.js v2 generated, length:', appJs.length);
    
    const watchfaceIndexJs = generateWatchfaceIndexJsV2(config);
    console.log('[JSGenV2] watchface/index.js v2 generated, length:', watchfaceIndexJs.length);
    
    return { appJson, appJs, watchfaceIndexJs };
  } catch (error) {
    console.error('[JSGenV2] Error generating code:', error);
    throw error;
  }
}

// Generate app.json - V2 format (EXACTLY matching reference structure)
function generateAppJsonV2(config: WatchFaceConfig): string {
  const appId = generateAppId();
  const deviceSources = getDeviceSourcesV2(config.watchModel);
  const versionCode = Math.floor(Date.now() / 1000);
  
  // Build JSON as plain object with exact structure from reference
  const json: any = {
    configVersion: 'v2',
    app: {
      appIdType: 0,
      appId: appId,
      appName: config.name,
      appType: 'watchface',
      version: {
        code: versionCode,
        name: '1.0.1',
      },
      vender: 'zepp',
      description: '',
      icon: 'anteprima.png',
      cover: ['anteprima.png'],
      extraInfo: {
        madeBy: 1,
        fromZoom: false,
      },
    },
    permissions: ['gps'],
    runtime: {
      apiVersion: {
        compatible: '1.0.0',
        target: '1.0.1',
        minVersion: '1.0.0',
      },
    },
    i18n: {
      enUS: {
        icon: 'anteprima.png',
        appName: config.name,
      },
    },
    defaultLanguage: 'en-US',
    debug: false,
    module: {
      watchface: {
        path: 'watchface/index',
        main: 1,
        editable: 0,
        lockscreen: 1,
        hightCost: 0,
      },
    },
    platforms: deviceSources.map((source) => ({
      name: 'Amazfit Balance',  // EXACT name from reference
      deviceSource: source,
    })),
    designWidth: config.resolution.width,
    packageInfo: {
      mode: 'production',
      timeStamp: versionCode,
      expiredTime: 172800,
      zpm: '2.8.2',
    },
  };

  return JSON.stringify(json, null, 2);
}

// Get device sources for v2 (Balance 2 & related models)
function getDeviceSourcesV2(watchModel: string): number[] {
  const sources: Record<string, number[]> = {
    'Balance 2': [8519936, 8519937, 8519939],
    'Balance': [8519936, 8519937, 8519939],
    'Active Max': [8519936, 8519937, 8519939],
  };
  
  return sources[watchModel] || [8519936, 8519937, 8519939];
}

// Generate app.js - V2 format (EXACT copy of working reference app.js)
function generateAppJsV2(config: WatchFaceConfig): string {
  return `try {
    (() => {
        const __$$app$$__ = __$$hmAppManager$$__.currentApp;
        function getApp() {
            return __$$app$$__.app;
        }
        function getCurrentPage() {
            return __$$app$$__.current && __$$app$$__.current.module;
        }
        __$$app$$__.__globals__ = {
            lang: new DeviceRuntimeCore.HmUtils.Lang(DeviceRuntimeCore.HmUtils.getLanguage()),
            px: DeviceRuntimeCore.HmUtils.getPx(${config.resolution.width})
        };
        const {px} = __$$app$$__.__globals__;
        const languageTable = {};
        __$$app$$__.__globals__.gettext = DeviceRuntimeCore.HmUtils.gettextFactory(languageTable, __$$app$$__.__globals__.lang, 'en-US');
        function getGlobal() {
            if (typeof self !== 'undefined') {
                return self;
            }
            if (typeof window !== 'undefined') {
                return window;
            }
            if (typeof global !== 'undefined') {
                return global;
            }
            if (typeof globalThis !== 'undefined') {
                return globalThis;
            }
            throw new Error('unable to locate global object');
        }
        let globalNS$2 = getGlobal();
        if (!globalNS$2.Logger) {
            if (typeof DeviceRuntimeCore !== 'undefined') {
                globalNS$2.Logger = DeviceRuntimeCore.HmLogger;
            }
        }
        let globalNS$1 = getGlobal();
        if (!globalNS$1.Buffer) {
            if (typeof Buffer !== 'undefined') {
                globalNS$1.Buffer = Buffer;
            } else {
                globalNS$1.Buffer = DeviceRuntimeCore.Buffer;
            }
        }
        function isHmTimerDefined() {
            return typeof timer !== 'undefined';
        }
        let globalNS = getGlobal();
        if (typeof setTimeout === 'undefined' && isHmTimerDefined()) {
            globalNS.clearTimeout = function clearTimeout(timerRef) {
                timerRef && timer.stopTimer(timerRef);
            };
            globalNS.setTimeout = function setTimeout2(func, ns) {
                const timer1 = timer.createTimer(ns || 1, Number.MAX_SAFE_INTEGER, function () {
                    globalNS.clearTimeout(timer1);
                    func && func();
                }, {});
                return timer1;
            };
            globalNS.clearImmediate = function clearImmediate(timerRef) {
                timerRef && timer.stopTimer(timerRef);
            };
            globalNS.setImmediate = function setImmediate(func) {
                const timer1 = timer.createTimer(1, Number.MAX_SAFE_INTEGER, function () {
                    globalNS.clearImmediate(timer1);
                    func && func();
                }, {});
                return timer1;
            };
            globalNS.clearInterval = function clearInterval(timerRef) {
                timerRef && timer.stopTimer(timerRef);
            };
            globalNS.setInterval = function setInterval(func, ms) {
                const timer1 = timer.createTimer(1, ms, function () {
                    func && func();
                }, {});
                return timer1;
            };
        }
        __$$app$$__.app = DeviceRuntimeCore.App({
            globalData: {},
            onCreate(options) {
            },
            onDestroy(options) {
            },
            onError(error) {
            },
            onPageNotFound(obj) {
            },
            onUnhandledRejection(obj) {
            }
        });
        ;
    })();
} catch (e) {
    console.log('Mini Program Error', e);
    e && e.stack && e.stack.split(/\\n/).forEach(i => console.log('error stack', i));
    ;
}`;
}

// Generate watchface/index.js - V2 format with IMG_TIME, IMG_DATE, IMG_WEEK, and AOD mode
function generateWatchfaceIndexJsV2(config: WatchFaceConfig): string {
  const elements = config.elements.filter((el) => el.visible);
  
  console.log('[JSGenV2] Total elements in config:', config.elements.length);
  console.log('[JSGenV2] Visible elements after filter:', elements.length);
  
  const backgroundSrc = config.background?.src || 'background.png';
  
  // Generate NORMAL mode widgets
  let normalWidgetsCode = '';
  let normalWidgetCounter = 2;
  const timeElement = elements.find(e => e.name.toLowerCase().includes('time'));
  const dateElement = elements.find(e => e.name.toLowerCase().includes('date') && !e.name.toLowerCase().includes('month'));
  const monthElement = elements.find(e => e.name.toLowerCase().includes('month'));
  const weekElement = elements.find(e => e.name.toLowerCase().includes('week'));
  
  // Add IMG_TIME widget if time element exists
  if (timeElement) {
    normalWidgetsCode += generateIMGTimeWidget(timeElement, normalWidgetCounter++, 'ONLY_NORMAL');
  }
  
  // Add IMG_DATE widget if date element exists
  if (dateElement) {
    normalWidgetsCode += generateIMGDateWidget(dateElement, normalWidgetCounter++, 'ONLY_NORMAL');
  }

  // Add IMG_DATE (month) widget if month element exists
  if (monthElement) {
    normalWidgetsCode += generateIMGMonthWidget(monthElement, normalWidgetCounter++, 'ONLY_NORMAL');
  }
  
  // Add IMG_WEEK widget if week element exists
  if (weekElement) {
    normalWidgetsCode += generateIMGWeekWidget(weekElement, normalWidgetCounter++, 'ONLY_NORMAL');
  }
  
  // Add other static elements for NORMAL mode
  for (const element of elements) {
    if (element.name.toLowerCase().includes('time') || element.name.toLowerCase().includes('date') || element.name.toLowerCase().includes('week') || element.name.toLowerCase().includes('month')) {
      continue; // Skip, already handled above
    }
    const code = generateWidgetCodeV2(element, normalWidgetCounter);
    if (code) {
      normalWidgetsCode += code;
      normalWidgetCounter++;
    }
  }
  
  // Generate AOD mode widgets (complete duplicate for always-on display)
  let aodWidgetsCode = '';
  let aodWidgetCounter = 100;
  
  if (timeElement) {
    aodWidgetsCode += generateIMGTimeWidget(timeElement, aodWidgetCounter++, 'ONLY_AOD');
  }
  
  if (dateElement) {
    aodWidgetsCode += generateIMGDateWidget(dateElement, aodWidgetCounter++, 'ONLY_AOD');
  }

  if (monthElement) {
    aodWidgetsCode += generateIMGMonthWidget(monthElement, aodWidgetCounter++, 'ONLY_AOD');
  }
  
  if (weekElement) {
    aodWidgetsCode += generateIMGWeekWidget(weekElement, aodWidgetCounter++, 'ONLY_AOD');
  }
  
  // Add other static elements for AOD mode
  for (const element of elements) {
    if (element.name.toLowerCase().includes('time') || element.name.toLowerCase().includes('date') || element.name.toLowerCase().includes('week') || element.name.toLowerCase().includes('month')) {
      continue;
    }
    // Skip BUTTON in AOD mode - no touch interaction on AOD screen
    if (element.type === 'BUTTON') {
      continue;
    }
    const code = generateWidgetCodeV2(element, aodWidgetCounter, true);
    if (code) {
      aodWidgetsCode += code;
      aodWidgetCounter++;
    }
  }
  
  const finalCode = `// Zepp OS Watchface generated by AI WatchFace Creator (V2 Format)
// V2 Manifest: Full A OD support with dynamic widgets
// Compatible with Amazfit Balance 2, Balance, Active Max
try {
    (() => {
        const __$$app$$__ = __$$hmAppManager$$__.currentApp;
        function getApp() {
            return __$$app$$__.app;
        }
        function getCurrentPage() {
            return __$$app$$__.current && __$$app$$__.current.module;
        }
        const __$$module$$__ = __$$app$$__.current;
        const h = new DeviceRuntimeCore.WidgetFactory(new DeviceRuntimeCore.HmDomApi(__$$app$$__, __$$module$$__));
        const {px} = __$$app$$__.__globals__;
        const logger = Logger.getLogger('WatchFaceEditor');
        
        // Sensor for weather and system info
        let weatherSensor = null;

        __$$module$$__.module = DeviceRuntimeCore.WatchFace({
            init_view() {
                // Initialize sensors
                try {
                    weatherSensor = hmSensor.createSensor(hmSensor.id.WEATHER);
                } catch (e) {
                    logger.log('Weather sensor init failed:', e);
                }
                
                // ========== NORMAL MODE BACKGROUND ==========
                let widget_1 = hmUI.createWidget(hmUI.widget.IMG, {
                    x: 0,
                    y: 0,
                    w: ${config.resolution.width},
                    h: ${config.resolution.height},
                    src: '${backgroundSrc}',
                    alpha: 255,
                    show_level: hmUI.show_level.ONLY_NORMAL
                });
                
                // ========== NORMAL MODE WIDGETS ==========
${normalWidgetsCode}
                
                // ========== AOD MODE BACKGROUND ==========
                let widget_aod_bg = hmUI.createWidget(hmUI.widget.IMG, {
                    x: 0,
                    y: 0,
                    w: ${config.resolution.width},
                    h: ${config.resolution.height},
                    src: '${backgroundSrc}',
                    alpha: 255,
                    show_level: hmUI.show_level.ONLY_AOD
                });
                
                // ========== AOD MODE WIDGETS ==========
${aodWidgetsCode}

                // Widget delegate for lifecycle management (matches working reference)
                const widgetDelegate = hmUI.createWidget(hmUI.widget.WIDGET_DELEGATE, {
                    resume_call() {
                        console.log('resume_call()');
                        let tipoSchermo = hmSetting.getScreenType();
                        if (tipoSchermo === hmSetting.screen_type.WATCHFACE) {
                            // NORMAL MODE updates
                        } else if (tipoSchermo === hmSetting.screen_type.AOD) {
                            // AOD MODE updates
                        }
                    },
                    pause_call() {
                        console.log('pause_call()');
                    }
                });
            },
            onInit() {
                logger.log('index page.js on init invoke');
            },
            build() {
                this.init_view();
                logger.log('index page.js on ready invoke');
            },
            onDestroy() {
                logger.log('index page.js on destroy invoke');
            }
        });
        ;
    })();
} catch (e) {
    console.log('Mini Program Error', e);
    e && e.stack && e.stack.split(/\\n/).forEach(i => console.log('error stack', i));
    ;
}`;
  
  return finalCode;
}

// Generate IMG_TIME widget with hour and minute arrays
function generateIMGTimeWidget(element: WatchFaceElement, widgetIndex: number, showLevel: string): string {
  const x = element.bounds.x || 25;
  const y = element.bounds.y || 220;
  
  // Use time_digit_N.png naming â€” must match what mockKimiAnalysis generates
  const digitArray = [];
  for (let i = 0; i < 10; i++) {
    digitArray.push(`'time_digit_${i}.png'`);
  }
  const digitArrayStr = `[${digitArray.join(', ')}]`;
  
  return `
                // ${element.name} - IMG_TIME Widget
                let widget_${widgetIndex} = hmUI.createWidget(hmUI.widget.IMG_TIME, {
                    hour_zero: 1,
                    hour_startX: ${x},
                    hour_startY: ${y},
                    hour_array: ${digitArrayStr},
                    hour_space: 0,
                    hour_align: hmUI.align.LEFT,
                    minute_zero: 1,
                    minute_startX: ${x + HOUR_CONTENT_W + TIME_COLON_GAP},
                    minute_startY: ${y},
                    minute_array: ${digitArrayStr},
                    minute_space: 0,
                    minute_align: hmUI.align.LEFT,
                    minute_follow: 0,
                    show_level: hmUI.show_level.${showLevel}
                });`;
}

// Generate IMG_DATE widget with day arrays
function generateIMGDateWidget(element: WatchFaceElement, widgetIndex: number, showLevel: string): string {
  const x = element.bounds.x || 92;
  const y = element.bounds.y || 198;
  
  // Use date_digit_N.png naming â€” must match what mockKimiAnalysis generates
  const digitArray = [];
  for (let i = 0; i < 10; i++) {
    digitArray.push(`'date_digit_${i}.png'`);
  }
  const digitArrayStr = `[${digitArray.join(', ')}]`;
  
  return `
                // ${element.name} - IMG_DATE Widget
                let widget_${widgetIndex} = hmUI.createWidget(hmUI.widget.IMG_DATE, {
                    day_startX: ${x},
                    day_startY: ${y},
                    day_sc_array: ${digitArrayStr},
                    day_tc_array: ${digitArrayStr},
                    day_en_array: ${digitArrayStr},
                    day_zero: 1,
                    day_space: 0,
                    day_align: hmUI.align.LEFT,
                    day_is_character: false,
                    show_level: hmUI.show_level.${showLevel}
                });`;
}

// Generate IMG_DATE (month) widget with month arrays (12 images)
// Pattern from working Brushed Steel reference: month_startX/Y, month_sc/tc/en_array, month_is_character
function generateIMGMonthWidget(element: WatchFaceElement, widgetIndex: number, showLevel: string): string {
  const x = element.bounds.x || 105;
  const y = element.bounds.y || 198;
  
  // Use month_N.png naming â€” 12 images for Jan-Dec (0-indexed)
  const monthArray = [];
  for (let i = 0; i < 12; i++) {
    monthArray.push(`'month_${i}.png'`);
  }
  const monthArrayStr = `[${monthArray.join(', ')}]`;
  
  return `
                // ${element.name} - IMG_DATE Month Widget
                let widget_${widgetIndex} = hmUI.createWidget(hmUI.widget.IMG_DATE, {
                    month_startX: ${x},
                    month_startY: ${y},
                    month_sc_array: ${monthArrayStr},
                    month_tc_array: ${monthArrayStr},
                    month_en_array: ${monthArrayStr},
                    month_zero: 0,
                    month_space: 0,
                    month_is_character: true,
                    month_align: hmUI.align.LEFT,
                    show_level: hmUI.show_level.${showLevel}
                });`;
}

// Generate IMG_WEEK widget with weekday arrays
function generateIMGWeekWidget(element: WatchFaceElement, widgetIndex: number, showLevel: string): string {
  const x = element.bounds.x || 33;
  const y = element.bounds.y || 198;
  
  // Use week_N.png naming â€” must match what mockKimiAnalysis generates
  const weekArray = [];
  for (let i = 0; i < 7; i++) {
    weekArray.push(`'week_${i}.png'`);
  }
  const weekArrayStr = `[${weekArray.join(', ')}]`;
  
  return `
                // ${element.name} - IMG_WEEK Widget
                let widget_${widgetIndex} = hmUI.createWidget(hmUI.widget.IMG_WEEK, {
                    x: ${x},
                    y: ${y},
                    week_en: ${weekArrayStr},
                    week_sc: ${weekArrayStr},
                    week_tc: ${weekArrayStr},
                    show_level: hmUI.show_level.${showLevel}
                });`;
}

// Generate widget code for each element (V2 format)
function generateWidgetCodeV2(element: WatchFaceElement, widgetIndex: number, isAod: boolean = false): string {
  console.log(`[JSGenV2] generateWidgetCodeV2: element=${element.name}, type=${element.type}, src=${element.src}`);
  
  // Skip background element - already handled
  if (element.name === 'Background' || element.type === 'IMG' && element.bounds.x === 0 && element.bounds.y === 0 && element.bounds.width === 480 && element.bounds.height === 480) {
    return '';
  }
  
  // Skip dynamic widget types - they're handled separately
  if (element.name.toLowerCase().includes('time') || element.name.toLowerCase().includes('date') || element.name.toLowerCase().includes('week')) {
    return '';
  }
  
  const showLevel = isAod ? 'ONLY_AOD' : 'ONLY_NORMAL';
  
  // Dispatch by element type
  switch (element.type) {
    case 'ARC_PROGRESS':
      return generateArcProgressWidget(element, widgetIndex, showLevel);
    case 'TEXT_IMG':
      return generateTextImgWidget(element, widgetIndex, showLevel);
    case 'TIME_POINTER':
      return generateTimePointerWidget(element, widgetIndex, showLevel);
    case 'TEXT':
      return generateTextWidget(element, widgetIndex, showLevel);
    case 'BUTTON':
      return generateButtonWidget(element, widgetIndex, showLevel);
    case 'IMG_STATUS':
      return generateImgStatusWidget(element, widgetIndex, showLevel);
    case 'CIRCLE':
      return generateCircleWidget(element, widgetIndex, showLevel);
    case 'IMG_LEVEL':
      return generateImgLevelWidget(element, widgetIndex, showLevel);
    case 'IMG':
    default:
      break;
  }
  
  // Handle IMG elements (static images)
  if (element.type === 'IMG' && element.src) {
    const w = element.bounds.width || 50;
    const h = element.bounds.height || 50;
    
    // Regular IMG elements (icons, indicators) - raw coordinates matching reference
    return `
                // ${element.name}
                let widget_${widgetIndex} = hmUI.createWidget(hmUI.widget.IMG, {
                    x: ${element.bounds.x},
                    y: ${element.bounds.y},
                    w: ${w},
                    h: ${h},
                    src: '${element.src}',
                    alpha: 255,
                    show_level: hmUI.show_level.${showLevel}
                });`;
  }
  
  console.log(`[JSGenV2] No widget code generated for ${element.name} (type: ${element.type})`);
  return ''; // Skip unsupported types
}

// ============================================================
// ARC_PROGRESS - Arc progress indicator (battery, steps, etc.)
// Pattern from Zepp OS v1.0 docs + ZeppPlayer engine
// ============================================================
function generateArcProgressWidget(element: WatchFaceElement, widgetIndex: number, showLevel: string): string {
  const centerX = element.center?.x ?? (element.bounds.x + (element.bounds.width || 100) / 2);
  const centerY = element.center?.y ?? (element.bounds.y + (element.bounds.height || 100) / 2);
  const radius = element.radius ?? Math.min(element.bounds.width || 100, element.bounds.height || 100) / 2;
  const startAngle = element.startAngle ?? -90;
  const endAngle = element.endAngle ?? 270;
  const lineWidth = element.lineWidth ?? 8;
  const color = element.color ?? '0x00FF00';
  const colorValue = color.startsWith('0x') ? color : `0x${color.replace('#', '')}`;

  // If dataType is specified, use type for auto-binding
  const typeParam = element.dataType
    ? `\n                    type: hmUI.data_type.${element.dataType},`
    : '';

  return `
                // ${element.name} - ARC_PROGRESS Widget
                let widget_${widgetIndex} = hmUI.createWidget(hmUI.widget.ARC_PROGRESS, {
                    center_x: ${centerX},
                    center_y: ${centerY},
                    radius: ${radius},
                    start_angle: ${startAngle},
                    end_angle: ${endAngle},
                    color: ${colorValue},
                    line_width: ${lineWidth},${typeParam}
                    show_level: hmUI.show_level.${showLevel}
                });`;
}

// ============================================================
// TEXT_IMG - Number display using image font arrays
// Pattern from Zepp OS v1.0 docs + ZeppPlayer engine
// ============================================================
function generateTextImgWidget(element: WatchFaceElement, widgetIndex: number, showLevel: string): string {
  // Build font_array from element.fontArray or element.images
  const fontImages = element.fontArray || element.images || [];
  let fontArrayStr: string;

  if (fontImages.length > 0) {
    fontArrayStr = `[${fontImages.map(f => `'${f}'`).join(', ')}]`;
  } else {
    // Default: generate 0-9 digit array using element name as prefix
    const prefix = element.name.toLowerCase().replace(/\s+/g, '_');
    const arr = [];
    for (let i = 0; i < 10; i++) {
      arr.push(`'${prefix}_${i}.png'`);
    }
    fontArrayStr = `[${arr.join(', ')}]`;
  }

  // If dataType is specified, use type for auto-binding (e.g., BATTERY, STEP, HEART)
  const typeParam = element.dataType
    ? `\n                    type: hmUI.data_type.${element.dataType},`
    : '';

  const hSpace = element.hSpace ?? 1;
  const alignH = element.alignH ?? 'LEFT';

  return `
                // ${element.name} - TEXT_IMG Widget
                let widget_${widgetIndex} = hmUI.createWidget(hmUI.widget.TEXT_IMG, {
                    x: ${element.bounds.x},
                    y: ${element.bounds.y},
                    w: ${element.bounds.width || 100},
                    h: ${element.bounds.height || 40},
                    font_array: ${fontArrayStr},${typeParam}
                    h_space: ${hSpace},
                    align_h: hmUI.align.${alignH},
                    show_level: hmUI.show_level.${showLevel}
                });`;
}

// ============================================================
// TIME_POINTER - Analog clock hands (hour/minute/second in ONE widget)
// Pattern from Zepp OS watchface docs + reference watchfaces
// ============================================================
function generateTimePointerWidget(element: WatchFaceElement, widgetIndex: number, showLevel: string): string {
  const centerX = element.center?.x ?? 240;
  const centerY = element.center?.y ?? 240;
  const hourPosX = element.hourPos?.x ?? 11;
  const hourPosY = element.hourPos?.y ?? 70;
  const minutePosX = element.minutePos?.x ?? 8;
  const minutePosY = element.minutePos?.y ?? 100;
  const secondPosX = element.secondPos?.x ?? 3;
  const secondPosY = element.secondPos?.y ?? 120;
  const hourSrc = element.hourHandSrc || 'hour_hand.png';
  const minuteSrc = element.minuteHandSrc || 'minute_hand.png';
  const secondSrc = element.secondHandSrc || 'second_hand.png';
  const coverSrc = element.coverSrc;

  let coverParams = '';
  if (coverSrc) {
    coverParams = `
                    hour_cover_path: '${coverSrc}',
                    hour_cover_x: ${centerX - 15},
                    hour_cover_y: ${centerY - 15},`;
  }

  return `
                // ${element.name} - TIME_POINTER Widget (Analog Clock)
                let widget_${widgetIndex} = hmUI.createWidget(hmUI.widget.TIME_POINTER, {
                    hour_centerX: ${centerX},
                    hour_centerY: ${centerY},
                    hour_posX: ${hourPosX},
                    hour_posY: ${hourPosY},
                    hour_path: '${hourSrc}',${coverParams}
                    minute_centerX: ${centerX},
                    minute_centerY: ${centerY},
                    minute_posX: ${minutePosX},
                    minute_posY: ${minutePosY},
                    minute_path: '${minuteSrc}',
                    second_centerX: ${centerX},
                    second_centerY: ${centerY},
                    second_posX: ${secondPosX},
                    second_posY: ${secondPosY},
                    second_path: '${secondSrc}',
                    show_level: hmUI.show_level.${showLevel}
                });`;
}

// ============================================================
// TEXT - Dynamic text display (e.g., city name, sensor values)
// Pattern from working Brushed Steel reference
// ============================================================
function generateTextWidget(element: WatchFaceElement, widgetIndex: number, showLevel: string): string {
  const textSize = element.fontSize ?? 20;
  const colorHex = element.color ?? '0xFFFFFFFF';
  const colorValue = colorHex.startsWith('0x') ? colorHex : `0x${colorHex.replace('#', '')}`;
  const textContent = element.text ?? '';

  return `
                // ${element.name} - TEXT Widget
                let widget_${widgetIndex} = hmUI.createWidget(hmUI.widget.TEXT, {
                    x: ${element.bounds.x},
                    y: ${element.bounds.y},
                    w: ${element.bounds.width || 100},
                    h: ${element.bounds.height || 40},
                    text_size: ${textSize},
                    char_space: 0,
                    color: ${colorValue},
                    line_space: 0,
                    align_v: hmUI.align.CENTER_V,
                    text_style: hmUI.text_style.ELLIPSIS,
                    align_h: hmUI.align.CENTER_H,
                    text: '${textContent}',
                    show_level: hmUI.show_level.${showLevel}
                });`;
}

// ============================================================
// BUTTON - Clickable shortcut button (launches app)
// Pattern from working Brushed Steel reference
// ============================================================
function generateButtonWidget(element: WatchFaceElement, widgetIndex: number, showLevel: string): string {
  const normalSrc = element.normalSrc || element.src || 'trasparente.png';
  const pressSrc = element.pressSrc || normalSrc;
  const clickAction = element.clickAction || '';

  // Build click_func - either launch a native app or empty
  let clickFunc: string;
  if (clickAction) {
    clickFunc = `() => {
                hmApp.startApp({ url: '${clickAction}', native: true })
                              }`;
  } else {
    clickFunc = `() => {}`;
  }

  return `
                // ${element.name} - BUTTON Widget
                let widget_${widgetIndex} = hmUI.createWidget(hmUI.widget.BUTTON, {
                    x: ${element.bounds.x},
                    y: ${element.bounds.y},
                    w: ${element.bounds.width || 100},
                    h: ${element.bounds.height || 35},
                    text: '',
                    press_src: '${pressSrc}',
                    normal_src: '${normalSrc}',
                    click_func: ${clickFunc},
                    show_level: hmUI.show_level.${showLevel}
                });`;
}

// ============================================================
// IMG_STATUS - System status indicators (bluetooth, DND, lock)
// Pattern from working Brushed Steel reference
// ============================================================
function generateImgStatusWidget(element: WatchFaceElement, widgetIndex: number, showLevel: string): string {
  const statusType = element.statusType || 'DISCONNECT';
  const src = element.src || 'bluetooth_5_b_30x30.png';

  return `
                // ${element.name} - IMG_STATUS Widget
                let widget_${widgetIndex} = hmUI.createWidget(hmUI.widget.IMG_STATUS, {
                    x: ${element.bounds.x},
                    y: ${element.bounds.y},
                    src: '${src}',
                    type: hmUI.system_status.${statusType},
                    show_level: hmUI.show_level.${showLevel}
                });`;
}

// ============================================================
// CIRCLE - Simple filled/stroked circle
// Pattern from Zepp OS v1.0 docs
// ============================================================
function generateCircleWidget(element: WatchFaceElement, widgetIndex: number, showLevel: string): string {
  const centerX = element.center?.x ?? (element.bounds.x + (element.bounds.width || 50) / 2);
  const centerY = element.center?.y ?? (element.bounds.y + (element.bounds.height || 50) / 2);
  const radius = element.radius ?? Math.min(element.bounds.width || 50, element.bounds.height || 50) / 2;
  const colorHex = element.color ?? '0xFFFFFF';
  const colorValue = colorHex.startsWith('0x') ? colorHex : `0x${colorHex.replace('#', '')}`;

  return `
                // ${element.name} - CIRCLE Widget
                let widget_${widgetIndex} = hmUI.createWidget(hmUI.widget.CIRCLE, {
                    center_x: ${centerX},
                    center_y: ${centerY},
                    radius: ${radius},
                    color: ${colorValue},
                    show_level: hmUI.show_level.${showLevel}
                });`;
}

// ============================================================
// IMG_LEVEL - Level-based image display (weather icons, etc.)
// Pattern from working Brushed Steel reference (with data_type)
// ============================================================
function generateImgLevelWidget(element: WatchFaceElement, widgetIndex: number, showLevel: string): string {
  // Build image_array from element.images or single element.src
  const images = element.images || (element.src ? [element.src] : []);
  const imageArrayStr = `[${images.map(img => `"${img}"`).join(', ')}]`;

  // If dataType is specified, use type for auto-binding
  const typeParam = element.dataType
    ? `\n                    type: hmUI.data_type.${element.dataType},`
    : '';

  return `
                // ${element.name} - IMG_LEVEL Widget
                let widget_${widgetIndex} = hmUI.createWidget(hmUI.widget.IMG_LEVEL, {
                    x: ${element.bounds.x},
                    y: ${element.bounds.y},
                    image_array: ${imageArrayStr},
                    image_length: ${images.length},${typeParam}
                    show_level: hmUI.show_level.${showLevel}
                });`;
}

// Generate unique app ID
function generateAppId(): number {
  return Math.floor(Math.random() * (9999999 - 1000000 + 1)) + 1000000;
}

```

### FILE: `src/lib/jsCodeGenerator.ts`

```typescript
// JavaScript Code Generator for ZeppOS Watch Faces
// Supports both V2 (legacy/Balance 2) and V3 (newer models) formats
// Routes based on device model selection

import type { WatchFaceConfig, WatchFaceElement, GeneratedCode } from '@/types';
import { generateWatchFaceCodeV2 } from './jsCodeGeneratorV2';

// Device models using V2 format (Balance 2, Balance, Active Max, etc.)
const V2_DEVICE_MODELS = [
  'Balance 2',
  'Balance',
  'Active Max',
  'Active 3 Premium',
];

// Device models using V3 format (GTR 4, GTS 4, newer Zepp OS models)
const V3_DEVICE_MODELS = [
  'GTR 4',
  'GTS 4',
  'Active 2 Round',
  'Active 2 Square',
  'Active',
];

export function generateWatchFaceCode(config: WatchFaceConfig): GeneratedCode {
  console.log('[JSGen] Starting code generation for:', config.name, 'Model:', config.watchModel);
  
  // Route to appropriate generator based on device model
  if (V2_DEVICE_MODELS.includes(config.watchModel)) {
    console.log('[JSGen] Using V2 generator (legacy format) for model:', config.watchModel);
    return generateWatchFaceCodeV2(config);
  } else if (V3_DEVICE_MODELS.includes(config.watchModel)) {
    console.log('[JSGen] Using V3 generator (modern format) for model:', config.watchModel);
    return generateWatchFaceCodeV3(config);
  } else {
    console.log('[JSGen] Unknown model, defaulting to V2 for safety:', config.watchModel);
    return generateWatchFaceCodeV2(config);
  }
}

// V3 Generator (for newer devices)
function generateWatchFaceCodeV3(config: WatchFaceConfig): GeneratedCode {
  console.log('[JSGenV3] Starting v3 code generation for:', config.name);
  try {
    const appJson = generateAppJson(config);
    console.log('[JSGenV3] app.json generated, length:', appJson.length);
    
    const appJs = generateAppJs(config);
    console.log('[JSGenV3] app.js generated, length:', appJs.length);
    
    const watchfaceIndexJs = generateWatchfaceIndexJs(config);
    console.log('[JSGenV3] watchface/index.js generated, length:', watchfaceIndexJs.length);
    
    return { appJson, appJs, watchfaceIndexJs };
  } catch (error) {
    console.error('[JSGenV3] Error generating code:', error);
    throw error;
  }
}

// Generate app.json - Matching working ZPK structure exactly (v3 with proper targets structure)
function generateAppJson(config: WatchFaceConfig): string {
  const appId = generateAppId();
  
  // Get device source for the watch model
  const deviceSources = getDeviceSources(config.watchModel);
  
  // Increment version code based on timestamp (ensures each build has higher code)
  const versionCode = Math.floor(Date.now() / 1000);
  
  const json = {
    configVersion: 'v3',
    app: {
      appIdType: 0,
      appId: appId,
      appName: config.name,
      appType: 'watchface',
      version: {
        code: versionCode,
        name: '1.0.0',
      },
      vender: 'AI-WatchFace-Creator',
      description: `Custom watch face - ${config.name}`,
      icon: 'icon.png',
      cover: ['icon.png'],
    },
    permissions: [],
    runtime: {
      apiVersion: {
        compatible: '1.0.0',
        target: '1.0.1',
        minVersion: '1.0.0',
      },
    },
    i18n: {
      'en-US': {
        icon: 'icon.png',
        appName: config.name,
      },
    },
    defaultLanguage: 'en-US',
    debug: false,
    targets: {
      default: {
        module: {
          watchface: {
            path: 'watchface/index.js',
            main: 1,
            editable: 0,
            lockscreen: 0,
            hightCost: 0,
          },
        },
        platforms: deviceSources.map((source) => ({
          name: config.watchModel,
          deviceSource: source,
        })),
        designWidth: config.resolution.width,
      },
    },
    packageInfo: {
      mode: 'production',
      timeStamp: Math.floor(Date.now() / 1000),
      expiredTime: 172800,
      zpm: '2.8.2',
    },
  };

  return JSON.stringify(json, null, 2);
}

// Get device sources for different watch models
function getDeviceSources(watchModel: string): number[] {
  const sources: Record<string, number[]> = {
    'Balance 2': [8519936, 8519937, 8519939],
    'Balance': [8519936, 8519937, 8519939],
    'Active Max': [8519936, 8519937, 8519939],
    'Active 3 Premium': [8388608, 8388609],
    'Active 2 Round': [8388608, 8388609],
    'Active 2 Square': [8388610, 8388611],
    'Active': [8388608, 8388609],
    'Pop 3S (PIB)': [8388608, 8388609],
    'GTR4': [8388608, 8388609],
    'GTS4': [8388610, 8388611],
    'Cheetah Pro': [8388608, 8388609],
    'T-Rex 2': [8388608, 8388609],
    'Falcon': [8388608, 8388609],
  };
  
  return sources[watchModel] || [8519936, 8519937, 8519939];
}

// Generate app.js - Matching working ZPK structure (comes from Brushed_Steel_Petroleum)
function generateAppJs(config: WatchFaceConfig): string {
  return `try {
    (() => {
        const __$$app$$__ = __$$hmAppManager$$__.currentApp;
        function getApp() {
            return __$$app$$__.app;
        }
        function getCurrentPage() {
            return __$$app$$__.current && __$$app$$__.current.module;
        }
        __$$app$$__.__globals__ = {
            lang: new DeviceRuntimeCore.HmUtils.Lang(DeviceRuntimeCore.HmUtils.getLanguage()),
            px: DeviceRuntimeCore.HmUtils.getPx(${config.resolution.width})
        };
        const {px} = __$$app$$__.__globals__;
        const languageTable = {};
        __$$app$$__.__globals__.gettext = DeviceRuntimeCore.HmUtils.gettextFactory(languageTable, __$$app$$__.__globals__.lang, 'en-US');
        function getGlobal() {
            if (typeof self !== 'undefined') {
                return self;
            }
            if (typeof window !== 'undefined') {
                return window;
            }
            if (typeof global !== 'undefined') {
                return global;
            }
            if (typeof globalThis !== 'undefined') {
                return globalThis;
            }
            throw new Error('unable to locate global object');
        }
        let globalNS$2 = getGlobal();
        if (!globalNS$2.Logger) {
            if (typeof DeviceRuntimeCore !== 'undefined') {
                globalNS$2.Logger = DeviceRuntimeCore.HmLogger;
            }
        }
        let globalNS$1 = getGlobal();
        if (!globalNS$1.Buffer) {
            if (typeof Buffer !== 'undefined') {
                globalNS$1.Buffer = Buffer;
            } else {
                globalNS$1.Buffer = DeviceRuntimeCore.Buffer;
            }
        }
        function isHmTimerDefined() {
            return typeof timer !== 'undefined';
        }
        let globalNS = getGlobal();
        if (typeof setTimeout === 'undefined' && isHmTimerDefined()) {
            globalNS.setTimeout = timer.setTimeout;
        }
        if (typeof setInterval === 'undefined' && isHmTimerDefined()) {
            globalNS.setInterval = timer.setInterval;
        }
        if (typeof clearTimeout === 'undefined' && isHmTimerDefined()) {
            globalNS.clearTimeout = timer.clearTimeout;
        }
        if (typeof clearInterval === 'undefined' && isHmTimerDefined()) {
            globalNS.clearInterval = timer.clearInterval;
        }
        let __$$module$$__ = __$$app$$__.current;
    })();
} catch (e) {
    console.log(e);
}`;
}

// Generate watchface/index.js - Matching working ZPK structure with proper lifecycle
function generateWatchfaceIndexJs(config: WatchFaceConfig): string {
  const elements = config.elements.filter((el) => el.visible);
  
  let widgetsCode = '';
  
  for (const element of elements) {
    const code = generateWidgetCode(element);
    widgetsCode += code;
    console.log('[JSGen] Widget code for', element.name, ':\n', code);
  }
  
  const finalCode = `// Zepp OS Watchface generated by AI WatchFace Creator
// Fixed structure: v3 manifest, complete TIME_POINTER, proper data binding, AOD support
try {
    (() => {
        const __$$app$$__ = __$$hmAppManager$$__.currentApp;
        function getApp() {
            return __$$app$$__.app;
        }
        function getCurrentPage() {
            return __$$app$$__.current && __$$app$$__.current.module;
        }
        const __$$module$$__ = __$$app$$__.current;
        const h = new DeviceRuntimeCore.WidgetFactory(new DeviceRuntimeCore.HmDomApi(__$$app$$__, __$$module$$__));
        const {px} = __$$app$$__.__globals__;
        const logger = Logger.getLogger('WatchFaceEditor');

        __$$module$$__.module = DeviceRuntimeCore.WatchFace({
            init_view() {
                // Background image - Fill entire screen with proper asset path
                hmUI.createWidget(hmUI.widget.IMG, {
                    x: px(0),
                    y: px(0),
                    w: px(${config.resolution.width}),
                    h: px(${config.resolution.height}),
                    src: 'assets/bg.png',
                    alpha: 255,
                    show_level: hmUI.show_level.ONLY_NORMAL
                });
                
                // Widgets
${widgetsCode}
                
                // Widget delegate for lifecycle management
                const widgetDelegate = hmUI.createWidget(hmUI.widget.WIDGET_DELEGATE, {
                    resume_call() {
                        logger.log('watchface resumed');
                    },
                    pause_call() {
                        logger.log('watchface paused');
                    }
                });
            },
            onInit() {
                logger.log('Watchface initialized');
            },
            build() {
                this.init_view();
                logger.log('Watchface built and displayed');
            },
            onDestroy() {
                logger.log('Watchface destroyed, cleaning up');
            }
        });
    })();
} catch (e) {
    console.log('Watchface Error', e);
    e && e.stack && e.stack.split(/\\n/).forEach(i => console.log('error stack', i));
}`;
  
  console.log('[JSGen] Complete watchface/index.js:\n', finalCode);
  return finalCode;
}

// Generate widget code for each element
function generateWidgetCode(element: WatchFaceElement): string {
  // Skip minute/second hands - they're combined with hour hand in TIME_POINTER
  if (element.type === 'TIME_POINTER' && element.subtype && element.subtype !== 'hour') {
    return ''; // Skip - will be included in hour hand widget
  }
  
  switch (element.type) {
    case 'TIME_POINTER':
      return generateTimePointerWidget(element);
    case 'IMG_LEVEL':
      return generateImgLevelWidget(element);
    case 'TEXT':
      return generateTextWidget(element);
    case 'IMG':
      return generateImgWidget(element);
    default:
      return generateImgWidget(element);
  }
}

// TIME_POINTER - Generate complete hour/minute/second hands (fixes black screen)
function generateTimePointerWidget(element: WatchFaceElement): string {
  // For TIME_POINTER, we need to generate the hand object structure
  // The element represents the hour hand; we'll create minute and second from derived info
  
  const centerX = element.center?.x || (element.bounds.x + Math.floor(element.bounds.width / 2));
  const centerY = element.center?.y || (element.bounds.y + Math.floor(element.bounds.height / 2));
  
  // Hour hand
  const hourImagePath = element.src || 'hour_hand.png';
  const hourPosX = element.bounds.x;
  const hourPosY = element.bounds.y;
  
  // Minute hand - typically longer than hour hand
  const minuteImagePath = element.name?.toLowerCase().includes('minute') ? element.src : 'minute_hand.png';
  const minuteLength = Math.floor((element.bounds.height * 120) / 100); // 20% longer
  const minutePosY = centerY - Math.floor(minuteLength / 2);
  const minutePosX = centerX - Math.floor(20 / 2);
  
  // Second hand - thin and long
  const secondImagePath = element.name?.toLowerCase().includes('second') ? element.src : 'second_hand.png';
  const secondLength = Math.floor((element.bounds.height * 130) / 100); // 30% longer
  const secondPosY = centerY - Math.floor(secondLength / 2);
  const secondPosX = centerX - Math.floor(10 / 2);

  return `
                // ${element.name} - Time Pointer (Hour/Minute/Second)
                hmUI.createWidget(hmUI.widget.TIME_POINTER, {
                    hour_path: 'assets/${hourImagePath}',
                    hour_centerX: px(${centerX}),
                    hour_centerY: px(${centerY}),
                    hour_posX: px(${hourPosX}),
                    hour_posY: px(${hourPosY}),
                    minute_path: 'assets/${minuteImagePath}',
                    minute_centerX: px(${centerX}),
                    minute_centerY: px(${centerY}),
                    minute_posX: px(${minutePosX}),
                    minute_posY: px(${minutePosY}),
                    second_path: 'assets/${secondImagePath}',
                    second_centerX: px(${centerX}),
                    second_centerY: px(${centerY}),
                    second_posX: px(${secondPosX}),
                    second_posY: px(${secondPosY}),
                    show_level: hmUI.show_level.ONLY_NORMAL
                });`;
}

// IMG_LEVEL - Battery/Steps/Level indicators using ARC_PROGRESS for proper data binding
function generateImgLevelWidget(element: WatchFaceElement): string {
  const dataType = getDataTypeConstant(element.dataType || 'BATTERY');

  return `
                // ${element.name} - Level Indicator (${element.dataType || 'BATTERY'})
                hmUI.createWidget(hmUI.widget.ARC_PROGRESS, {
                    x: px(${element.bounds.x}),
                    y: px(${element.bounds.y}),
                    w: px(${element.bounds.width}),
                    h: px(${element.bounds.height}),
                    start_angle: 0,
                    end_angle: 360,
                    color: ${element.color ? `0x${element.color.replace('#', '')}FF` : '0x00FF00FF'},
                    radius: px(${Math.floor(element.bounds.width / 2)}),
                    stroke_width: px(4),
                    type: ${dataType},
                    show_level: hmUI.show_level.ONLY_NORMAL
                });`;
}

// TEXT - Text display (simplified, no scope issues)
function generateTextWidget(element: WatchFaceElement): string {
  return `
                // ${element.name} - Text Display
                hmUI.createWidget(hmUI.widget.TEXT, {
                    x: px(${element.bounds.x}),
                    y: px(${element.bounds.y}),
                    w: px(${element.bounds.width}),
                    h: px(${element.bounds.height}),
                    color: ${element.color ? `0x${element.color.replace('#', '')}FF` : '0xFFFFFFFF'},
                    text_size: px(${element.fontSize || 20}),
                    text: '-',
                    align_h: hmUI.align.CENTER_H,
                    align_v: hmUI.align.CENTER_V,
                    show_level: hmUI.show_level.ONLY_NORMAL
                });`;
}

// IMG - Static image with proper asset paths
function generateImgWidget(element: WatchFaceElement): string {
  const src = element.src || element.images?.[0] || 'bg.png';
  // Ensure assets/ prefix for proper path resolution
  const srcPath = src.startsWith('assets/') ? src : `assets/${src}`;
  
  return `
                // ${element.name}
                hmUI.createWidget(hmUI.widget.IMG, {
                    x: px(${element.bounds.x}),
                    y: px(${element.bounds.y}),
                    w: px(${element.bounds.width}),
                    h: px(${element.bounds.height}),
                    src: '${srcPath}',
                    alpha: 255,
                    show_level: hmUI.show_level.ONLY_NORMAL
                });`;
}

// Map data type strings to ZeppOS constants
function getDataTypeConstant(dataType: string): string {
  const typeMap: Record<string, string> = {
    BATTERY: 'hmUI.data_type.BATTERY',
    STEP: 'hmUI.data_type.STEP',
    STEP_TARGET: 'hmUI.data_type.STEP_TARGET',
    CALORIE: 'hmUI.data_type.CALORIE',
    CALORIE_TARGET: 'hmUI.data_type.CALORIE_TARGET',
    HEART: 'hmUI.data_type.HEART',
    PAI: 'hmUI.data_type.PAI',
    STAND: 'hmUI.data_type.STAND',
    STAND_TARGET: 'hmUI.data_type.STAND_TARGET',
    FAT_BURN: 'hmUI.data_type.FAT_BURN',
    WEATHER: 'hmUI.data_type.WEATHER',
    UVI: 'hmUI.data_type.UVI',
    AQI: 'hmUI.data_type.AQI',
    HUMIDITY: 'hmUI.data_type.HUMIDITY',
    SUN_RISE: 'hmUI.data_type.SUN_RISE',
    SUN_SET: 'hmUI.data_type.SUN_SET',
    WIND: 'hmUI.data_type.WIND',
    WIND_DIRECTION: 'hmUI.data_type.WIND_DIRECTION',
    ALARM: 'hmUI.data_type.ALARM',
    SLEEP: 'hmUI.data_type.SLEEP',
    SPO2: 'hmUI.data_type.SPO2',
    STRESS: 'hmUI.data_type.STRESS',
    NOTIFICATION: 'hmUI.data_type.NOTIFICATION',
    DISTANCE: 'hmUI.data_type.DISTANCE',
    DATE: 'hmUI.data_type.DATE',
    WEEK: 'hmUI.data_type.WEEK',
    MOON: 'hmUI.data_type.MOON',
  };

  return typeMap[dataType] || 'hmUI.data_type.BATTERY';
}

// Generate unique app ID
function generateAppId(): number {
  return Math.floor(1000000 + Math.random() * 9000000);
}

```

### FILE: `src/lib/zpkBuilder.ts`

```typescript
// ZPK File Builder for ZeppOS Watch Faces
import JSZip from 'jszip';
import type { WatchFaceConfig } from '@/types';
import { generateWatchFaceCode } from './jsCodeGenerator';

export interface ZPKBuildOptions {
  config: WatchFaceConfig;
  backgroundFile: File;
  elementFiles: { src: string; file: File }[];
}

export interface ZPKBuildResult {
  blob: Blob;
  filename: string;
  size: number;
}

export async function buildZPK(options: ZPKBuildOptions): Promise<ZPKBuildResult> {
  console.log('[ZPK] Starting...');
  const { config, backgroundFile } = options;
  
  try {
    // Build a set of asset filenames from elementFiles for restoring data URLs
    const assetFilenames = new Set(options.elementFiles.map(ef => ef.src));
    
    // Elements may have data URLs (from preview rendering) instead of filenames.
    // Restore original filenames by matching element names to asset files.
    const fixedElements = config.elements.map(el => {
      if (el.src && el.src.startsWith('data:')) {
        // Find the matching asset file by element name pattern
        const name = el.name.toLowerCase();
        for (const filename of assetFilenames) {
          const fn = filename.toLowerCase();
          if (name.includes('battery') && fn.includes('batt')) return { ...el, src: filename };
          if (name.includes('heart') && fn.includes('heart')) return { ...el, src: filename };
          if (name.includes('steps') && fn.includes('step')) return { ...el, src: filename };
          if (name.includes('arc') && fn.includes('arc')) return { ...el, src: filename };
          if (name.includes('background') && fn.includes('background')) return { ...el, src: filename };
        }
        console.warn('[ZPK] Could not restore filename for element:', el.name);
      }
      return el;
    });
    
    const fixedConfig = { ...config, elements: fixedElements };
    
    console.log('[ZPK] Step 1: Generating JS code...');
    const code = generateWatchFaceCode(fixedConfig);
    console.log('[ZPK] Step 2: JS code generated, app.json length:', code.appJson.length);
    
    // Create device.zip
    console.log('[ZPK] Step 3: Creating device.zip...');
    const deviceZip = new JSZip();
    
    console.log('[ZPK] Step 4: Adding app.json...');
    deviceZip.file('app.json', code.appJson);
    
    console.log('[ZPK] Step 5: Adding app.js...');
    deviceZip.file('app.js', code.appJs);
    
    console.log('[ZPK] Step 6: Adding watchface/index.js...');
    deviceZip.file('watchface/index.js', code.watchfaceIndexJs);
    
    // Add assets folder with images
    console.log('[ZPK] Step 7: Creating assets folder...');
    const assets = deviceZip.folder('assets');
    if (assets) {
      // Add background image directly from uploaded file (no conversion)
      console.log('[ZPK] Step 8: Adding background image...');
      assets.file('background.png', backgroundFile);
      console.log('[ZPK] Step 9: Background image added, size:', backgroundFile.size);
      
      // Add element images (skip background.png since we already added it directly)
      const filteredElements = options.elementFiles.filter(ef => ef.src !== 'background.png');
      console.log('[ZPK] Step 9b: Adding element images, count:', filteredElements.length);
      if (filteredElements.length === 0) {
        console.error('[ZPK] ERROR: No element files to add!');
      }
      
      for (const elementFile of filteredElements) {
        console.log('[ZPK] Adding element file:', elementFile.src, 'size:', elementFile.file.size);
        if (elementFile.file.size === 0) {
          console.error('[ZPK] ERROR: Element file is EMPTY:', elementFile.src);
        }
        assets.file(elementFile.src, elementFile.file);
      }
      console.log('[ZPK] Element images added, total:', options.elementFiles.length);
    } else {
      console.error('[ZPK] ERROR: Failed to create assets folder!');
    }
    
    console.log('[ZPK] Step 10: Generating device.zip blob (no compression)...');
    const deviceBlob = await deviceZip.generateAsync({ 
      type: 'blob',
      compression: 'STORE' // No compression to avoid memory issues
    });
    console.log('[ZPK] Step 11: device.zip generated, size:', deviceBlob.size);
    
    // Create app-side.zip - Matching working ZPK structure
    console.log('[ZPK] Step 12: Creating app-side.zip...');
    const appSideZip = new JSZip();
    const appSideJson = JSON.stringify({
      configVersion: 'v2',
      app: {
        appId: Math.floor(1000000 + Math.random() * 9000000),
        appName: config.name,
        appType: 'watchface',
        version: { code: 1, name: '1.0.0' },
        vender: 'AI-WatchFace-Creator',
        description: `Custom watch face - ${config.name}`,
        icon: 'assets/bg.png',
      },
      permissions: [],
    }, null, 2);
    appSideZip.file('app.json', appSideJson);
    
    console.log('[ZPK] Step 13: Generating app-side.zip blob...');
    const appSideBlob = await appSideZip.generateAsync({ 
      type: 'blob',
      compression: 'STORE'
    });
    console.log('[ZPK] Step 14: app-side.zip generated, size:', appSideBlob.size);
    
    // Create final ZPK
    console.log('[ZPK] Step 15: Creating final ZPK...');
    const zpkZip = new JSZip();
    zpkZip.file('device.zip', deviceBlob);
    zpkZip.file('app-side.zip', appSideBlob);
    
    console.log('[ZPK] Step 16: Generating final ZPK blob...');
    const zpkBlob = await zpkZip.generateAsync({ 
      type: 'blob',
      compression: 'STORE'
    });
    console.log('[ZPK] Complete! Size:', zpkBlob.size);
    
    return {
      blob: zpkBlob,
      filename: `${config.name.replace(/\s+/g, '_')}.zpk`,
      size: zpkBlob.size,
    };
  } catch (error) {
    console.error('[ZPK] Error in buildZPK:', error);
    throw error;
  }
}

```

### FILE: `src/lib/assetGenerator.ts`

```typescript
// Asset Generation Service
// Generates PNG image assets for the watchface using Canvas drawing only
// NO image extraction from design â€” all assets are Canvas-drawn vectors

import type { ElementImage } from '../types';
import type { WatchFaceElement } from '../types';
import type { WatchfaceAnalysisResult } from './watchfacePrompt';

// ==================== CANVAS DRAWING HELPERS ====================

function createCanvasImage(
  width: number,
  height: number,
  drawFn: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, width, height);
  drawFn(ctx, width, height);
  return canvas.toDataURL('image/png');
}

// ==================== DIGIT IMAGE GENERATORS ====================

function generateDigitImages(
  prefix: string,
  width: number,
  height: number,
  color: string,
): ElementImage[] {
  const images: ElementImage[] = [];
  for (let i = 0; i < 10; i++) {
    const name = `${prefix}_${i}.png`;
    const dataUrl = createCanvasImage(width, height, (ctx, w, h) => {
      ctx.fillStyle = color;
      ctx.font = `bold ${Math.floor(h * 0.75)}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(i), w / 2, h / 2);
    });
    images.push({ name, dataUrl, bounds: { x: 0, y: 0, width, height }, type: 'IMG' });
  }
  return images;
}

function generateTextImages(
  prefix: string,
  labels: string[],
  width: number,
  height: number,
  color: string,
): ElementImage[] {
  return labels.map((label, i) => ({
    name: `${prefix}_${i}.png`,
    dataUrl: createCanvasImage(width, height, (ctx, w, h) => {
      ctx.fillStyle = color;
      ctx.font = `bold ${Math.floor(h * 0.6)}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, w / 2, h / 2);
    }),
    bounds: { x: 0, y: 0, width, height },
    type: 'IMG' as const,
  }));
}

// ==================== COMPLICATION ICON DRAWERS ====================

const ICON_DRAWERS: Record<string, (ctx: CanvasRenderingContext2D, w: number, h: number, color: string) => void> = {
  BATTERY: (ctx, w, h, color) => {
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.fillStyle = color;
    ctx.strokeRect(w * 0.15, h * 0.25, w * 0.6, h * 0.5);
    ctx.fillRect(w * 0.75, h * 0.35, w * 0.1, h * 0.3);
    ctx.fillRect(w * 0.2, h * 0.3, w * 0.35, h * 0.4);
  },
  HEART: (ctx, w, h, color) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    const cx = w / 2, top = h * 0.3, bot = h * 0.8;
    ctx.moveTo(cx, bot);
    ctx.bezierCurveTo(cx - w * 0.45, h * 0.55, cx - w * 0.4, top - h * 0.05, cx, top + h * 0.12);
    ctx.bezierCurveTo(cx + w * 0.4, top - h * 0.05, cx + w * 0.45, h * 0.55, cx, bot);
    ctx.fill();
  },
  STEP: (ctx, w, h, color) => {
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(w * 0.35, h * 0.35, w * 0.1, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(w * 0.55, h * 0.25, w * 0.08, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(w * 0.68, h * 0.35, w * 0.07, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath();
    ctx.ellipse(w * 0.45, h * 0.6, w * 0.2, h * 0.2, -0.2, 0, Math.PI * 2);
    ctx.fill();
  },
  CAL: (ctx, w, h, color) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(w * 0.5, h * 0.15);
    ctx.quadraticCurveTo(w * 0.75, h * 0.4, w * 0.65, h * 0.65);
    ctx.quadraticCurveTo(w * 0.5, h * 0.9, w * 0.35, h * 0.65);
    ctx.quadraticCurveTo(w * 0.25, h * 0.4, w * 0.5, h * 0.15);
    ctx.fill();
  },
  STRESS: (ctx, w, h, color) => {
    ctx.strokeStyle = color; ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(w * 0.15, h * 0.5);
    ctx.bezierCurveTo(w * 0.3, h * 0.2, w * 0.4, h * 0.8, w * 0.55, h * 0.4);
    ctx.bezierCurveTo(w * 0.65, h * 0.15, w * 0.75, h * 0.7, w * 0.85, h * 0.5);
    ctx.stroke();
  },
  SPO2: (ctx, w, h, color) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(w * 0.5, h * 0.1);
    ctx.quadraticCurveTo(w * 0.8, h * 0.5, w * 0.5, h * 0.85);
    ctx.quadraticCurveTo(w * 0.2, h * 0.5, w * 0.5, h * 0.1);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.font = `bold ${Math.floor(h * 0.2)}px Arial`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('Oâ‚‚', w * 0.5, h * 0.55);
  },
  WEATHER_CURRENT: (ctx, w, h, color) => {
    ctx.fillStyle = color; ctx.strokeStyle = color; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(w * 0.45, h * 0.4, w * 0.18, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(w * 0.45 + Math.cos(angle) * w * 0.22, h * 0.4 + Math.sin(angle) * w * 0.22);
      ctx.lineTo(w * 0.45 + Math.cos(angle) * w * 0.3, h * 0.4 + Math.sin(angle) * w * 0.3);
      ctx.stroke();
    }
  },
  DISTANCE: (ctx, w, h, color) => {
    ctx.strokeStyle = color; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.35, w * 0.2, Math.PI, 0);
    ctx.lineTo(w * 0.5, h * 0.8);
    ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.arc(w * 0.5, h * 0.35, w * 0.08, 0, Math.PI * 2); ctx.stroke();
  },
  PAI_DAILY: (ctx, w, h, color) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(w * 0.55, h * 0.1);
    ctx.lineTo(w * 0.3, h * 0.5); ctx.lineTo(w * 0.5, h * 0.5);
    ctx.lineTo(w * 0.45, h * 0.9); ctx.lineTo(w * 0.7, h * 0.4);
    ctx.lineTo(w * 0.5, h * 0.4);
    ctx.closePath(); ctx.fill();
  },
  HUMIDITY: (ctx, w, h, color) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(w * 0.5, h * 0.1);
    ctx.quadraticCurveTo(w * 0.85, h * 0.55, w * 0.5, h * 0.85);
    ctx.quadraticCurveTo(w * 0.15, h * 0.55, w * 0.5, h * 0.1);
    ctx.fill();
  },
  UVI: (ctx, w, h, color) => {
    ctx.fillStyle = color; ctx.strokeStyle = color; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(w * 0.5, h * 0.4, w * 0.18, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      ctx.beginPath();
      ctx.moveTo(w * 0.5 + Math.cos(angle) * w * 0.22, h * 0.4 + Math.sin(angle) * h * 0.22);
      ctx.lineTo(w * 0.5 + Math.cos(angle) * w * 0.32, h * 0.4 + Math.sin(angle) * h * 0.32);
      ctx.stroke();
    }
  },
  STAND: (ctx, w, h, color) => {
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(w * 0.5, h * 0.2, w * 0.1, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(w * 0.45, h * 0.32, w * 0.1, h * 0.3);
    ctx.fillRect(w * 0.3, h * 0.35, w * 0.4, h * 0.06);
    ctx.fillRect(w * 0.42, h * 0.62, w * 0.06, h * 0.25);
    ctx.fillRect(w * 0.52, h * 0.62, w * 0.06, h * 0.25);
  },
  SLEEP: (ctx, w, h, color) => {
    ctx.fillStyle = color;
    ctx.font = `bold ${Math.floor(h * 0.3)}px Arial`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('Z', w * 0.35, h * 0.3);
    ctx.font = `bold ${Math.floor(h * 0.4)}px Arial`;
    ctx.fillText('Z', w * 0.55, h * 0.55);
  },
};

function drawDefaultIcon(ctx: CanvasRenderingContext2D, w: number, h: number, color: string) {
  ctx.strokeStyle = color; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(w / 2, h / 2, Math.min(w, h) * 0.35, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(w / 2, h / 2, Math.min(w, h) * 0.1, 0, Math.PI * 2); ctx.fill();
}

function generateComplicationIcon(dataType: string, size: number, color: string): ElementImage {
  const name = `icon_${dataType.toLowerCase()}.png`;
  const drawer = ICON_DRAWERS[dataType] || ICON_DRAWERS[dataType.split('_')[0]] || drawDefaultIcon;
  const dataUrl = createCanvasImage(size, size, (ctx, w, h) => {
    drawer(ctx, w, h, color);
  });
  return { name, dataUrl, bounds: { x: 0, y: 0, width: size, height: size }, type: 'IMG' };
}

// ==================== CLOCK HAND GENERATORS ====================

function generateClockHands(hourColor: string, minuteColor: string, secondColor: string): ElementImage[] {
  return [
    {
      name: 'hour_hand.png',
      dataUrl: createCanvasImage(22, 140, (ctx, w, h) => {
        ctx.fillStyle = hourColor;
        ctx.beginPath();
        ctx.moveTo(w / 2 - 4, h); ctx.lineTo(w / 2 - 1, 10);
        ctx.lineTo(w / 2, 0); ctx.lineTo(w / 2 + 1, 10);
        ctx.lineTo(w / 2 + 4, h); ctx.closePath(); ctx.fill();
      }),
      bounds: { x: 0, y: 0, width: 22, height: 140 }, type: 'TIME_POINTER',
    },
    {
      name: 'minute_hand.png',
      dataUrl: createCanvasImage(16, 200, (ctx, w, h) => {
        ctx.fillStyle = minuteColor;
        ctx.beginPath();
        ctx.moveTo(w / 2 - 3, h); ctx.lineTo(w / 2 - 1, 10);
        ctx.lineTo(w / 2, 0); ctx.lineTo(w / 2 + 1, 10);
        ctx.lineTo(w / 2 + 3, h); ctx.closePath(); ctx.fill();
      }),
      bounds: { x: 0, y: 0, width: 16, height: 200 }, type: 'TIME_POINTER',
    },
    {
      name: 'second_hand.png',
      dataUrl: createCanvasImage(6, 240, (ctx, w, h) => {
        ctx.fillStyle = secondColor;
        ctx.fillRect(w / 2 - 1, 0, 2, h);
        ctx.beginPath(); ctx.arc(w / 2, 120, 3, 0, Math.PI * 2); ctx.fill();
      }),
      bounds: { x: 0, y: 0, width: 6, height: 240 }, type: 'TIME_POINTER',
    },
    {
      name: 'hand_cover.png',
      dataUrl: createCanvasImage(30, 30, (ctx, w, h) => {
        ctx.fillStyle = '#888888';
        ctx.beginPath(); ctx.arc(w / 2, h / 2, 12, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#AAAAAA'; ctx.lineWidth = 2; ctx.stroke();
      }),
      bounds: { x: 0, y: 0, width: 30, height: 30 }, type: 'TIME_POINTER',
    },
  ];
}

// ==================== STATUS ICON GENERATORS ====================

function generateStatusIcon(name: string, color: string, drawFn: (ctx: CanvasRenderingContext2D, w: number) => void): ElementImage {
  const size = 30;
  return {
    name,
    dataUrl: createCanvasImage(size, size, (ctx, w) => {
      ctx.strokeStyle = color; ctx.lineWidth = 2;
      drawFn(ctx, w);
    }),
    bounds: { x: 0, y: 0, width: size, height: size },
    type: 'IMG_STATUS',
  };
}

// ==================== WEATHER ICONS ====================

function generateWeatherIcons(count: number = 29): ElementImage[] {
  const symbols = ['â˜€', 'â›…', 'â˜', 'ðŸŒ§', 'ðŸŒ©', 'â„', 'ðŸŒ«'];
  return Array.from({ length: count }, (_, i) => ({
    name: `weather_${i}.png`,
    dataUrl: createCanvasImage(40, 40, (ctx, w, h) => {
      ctx.fillStyle = '#FFD700';
      ctx.font = `${Math.floor(h * 0.6)}px serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(symbols[i % symbols.length], w / 2, h / 2);
    }),
    bounds: { x: 0, y: 0, width: 40, height: 40 },
    type: 'IMG_LEVEL' as const,
  }));
}

// ==================== DATA TYPE CONFIGS ====================

const DATA_TYPE_CONFIG: Record<string, { prefix: string; defaultColor: string; clickAction: string }> = {
  BATTERY:         { prefix: 'batt',   defaultColor: '#00CC88', clickAction: 'Settings_batteryManagerScreen' },
  HEART:           { prefix: 'heart',  defaultColor: '#FF6B6B', clickAction: 'heart_app_Screen' },
  STEP:            { prefix: 'step',   defaultColor: '#FFD93D', clickAction: 'activityAppScreen' },
  CAL:             { prefix: 'cal',    defaultColor: '#FF9F43', clickAction: 'activityAppScreen' },
  DISTANCE:        { prefix: 'dist',   defaultColor: '#54A0FF', clickAction: 'activityAppScreen' },
  PAI_DAILY:       { prefix: 'pai',    defaultColor: '#5F27CD', clickAction: 'BioChargeHomeScreen' },
  PAI_WEEKLY:      { prefix: 'pai',    defaultColor: '#5F27CD', clickAction: 'BioChargeHomeScreen' },
  SPO2:            { prefix: 'spo2',   defaultColor: '#EE5A24', clickAction: '' },
  HUMIDITY:        { prefix: 'hum',    defaultColor: '#0ABDE3', clickAction: 'WeatherScreen' },
  UVI:             { prefix: 'uvi',    defaultColor: '#FFC312', clickAction: 'WeatherScreen' },
  STRESS:          { prefix: 'stress', defaultColor: '#FF9FF3', clickAction: 'StressHomeScreen' },
  WEATHER_CURRENT: { prefix: 'temp',   defaultColor: '#FFD700', clickAction: 'WeatherScreen' },
  WEATHER_HIGH:    { prefix: 'temp',   defaultColor: '#FFD700', clickAction: 'WeatherScreen' },
  WEATHER_LOW:     { prefix: 'temp',   defaultColor: '#87CEEB', clickAction: 'WeatherScreen' },
  STAND:           { prefix: 'stand',  defaultColor: '#2ECC71', clickAction: 'activityAppScreen' },
  SLEEP:           { prefix: 'sleep',  defaultColor: '#9B59B6', clickAction: '' },
  FAT_BURNING:     { prefix: 'fat',    defaultColor: '#E74C3C', clickAction: 'activityAppScreen' },
};

// ==================== MAIN: CONVERT AI ANALYSIS â†’ ELEMENTS + ASSETS ====================

export interface ExpandedResult {
  elements: WatchFaceElement[];
  images: ElementImage[];
}

export function expandAnalysisToElements(analysis: WatchfaceAnalysisResult): ExpandedResult {
  const elements: WatchFaceElement[] = [];
  const images: ElementImage[] = [];
  let idCounter = 1;
  const generatedDigitPrefixes = new Set<string>();
  const generatedIcons = new Set<string>();
  const ICON_SIZE = 28;
  const VALUE_W = 60;
  const VALUE_H = 25;

  // ---- TIME ----
  if (analysis.time.exists) {
    if (analysis.time.type === 'digital' || analysis.time.type === 'both') {
      const dt = analysis.time.digital;
      if (dt) {
        elements.push({
          id: `el_${idCounter++}`, type: 'IMG', name: 'Time Display', visible: true, zIndex: 5,
          bounds: { x: dt.x, y: dt.y, width: dt.width, height: dt.height },
          color: dt.color,
        });
        const digitW = Math.max(20, Math.floor(dt.height * 0.6));
        const digitH = dt.height;
        images.push(...generateDigitImages('time_digit', digitW, digitH, dt.color));
      }
    }
    if (analysis.time.type === 'analog' || analysis.time.type === 'both') {
      const an = analysis.time.analog;
      if (an) {
        elements.push({
          id: `el_${idCounter++}`, type: 'TIME_POINTER', name: 'Clock Hands', visible: true, zIndex: 15,
          bounds: { x: (an.centerX || 240) - 120, y: (an.centerY || 240) - 120, width: 240, height: 240 },
          center: { x: an.centerX || 240, y: an.centerY || 240 },
          hourHandSrc: 'hour_hand.png', minuteHandSrc: 'minute_hand.png',
          secondHandSrc: an.hasSecondHand ? 'second_hand.png' : undefined,
          coverSrc: 'hand_cover.png',
          hourPos: { x: 11, y: 70 }, minutePos: { x: 8, y: 100 },
          secondPos: an.hasSecondHand ? { x: 3, y: 120 } : undefined,
        });
        images.push(...generateClockHands(
          an.hourColor || '#CCCCCC',
          an.minuteColor || '#FFFFFF',
          an.secondColor || '#FF3333',
        ));
      }
    }
  }

  // ---- DATE ----
  if (analysis.date?.exists) {
    const d = analysis.date;
    elements.push({
      id: `el_${idCounter++}`, type: 'IMG', name: 'Date Display', visible: true, zIndex: 5,
      bounds: { x: d.x, y: d.y, width: d.width, height: d.height },
      color: d.color,
    });
    images.push(...generateDigitImages('date_digit', Math.max(12, Math.floor(d.height * 0.6)), d.height, d.color || '#CCCCCC'));
  }

  // ---- MONTH ----
  if (analysis.month?.exists) {
    const m = analysis.month;
    elements.push({
      id: `el_${idCounter++}`, type: 'IMG', name: 'Month Display', visible: true, zIndex: 5,
      bounds: { x: m.x, y: m.y, width: m.width, height: m.height },
      color: m.color,
    });
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    images.push(...generateTextImages('month', monthNames, Math.floor(m.width), Math.floor(m.height), m.color || '#AAAAAA'));
  }

  // ---- WEEKDAY ----
  if (analysis.weekday?.exists) {
    const w = analysis.weekday;
    elements.push({
      id: `el_${idCounter++}`, type: 'IMG', name: 'Weekday Display', visible: true, zIndex: 5,
      bounds: { x: w.x, y: w.y, width: w.width, height: w.height },
      color: w.color,
    });
    const weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    images.push(...generateTextImages('week', weekDays, Math.floor(w.width), Math.floor(w.height), w.color || '#FFD700'));
  }

  // ---- COMPLICATIONS ----
  for (const comp of analysis.complications) {
    const cfg = DATA_TYPE_CONFIG[comp.dataType];
    if (!cfg) {
      console.warn(`[AssetGen] Unknown dataType: ${comp.dataType}, skipping`);
      continue;
    }

    const cx = comp.centerX;
    const cy = comp.centerY;
    const arcR = comp.arcRadius || 45;
    const arcColor = comp.arcColor || cfg.defaultColor;
    const valColor = comp.valueColor || cfg.defaultColor;
    const iconColor = comp.iconColor || cfg.defaultColor;
    const labelColor = comp.labelColor || '#888888';

    // 1. ARC_PROGRESS (if present)
    if (comp.hasArc) {
      // Decorative background ring
      elements.push({
        id: `el_${idCounter++}`, type: 'CIRCLE', name: `${comp.dataType} Ring`, visible: true,
        zIndex: 1,
        bounds: { x: cx - arcR, y: cy - arcR, width: arcR * 2, height: arcR * 2 },
        center: { x: cx, y: cy },
        radius: arcR,
        color: '0x333333',
      });

      elements.push({
        id: `el_${idCounter++}`, type: 'ARC_PROGRESS', name: `${comp.dataType} Arc`, visible: true,
        zIndex: 2,
        bounds: { x: cx - arcR, y: cy - arcR, width: arcR * 2, height: arcR * 2 },
        center: { x: cx, y: cy },
        radius: arcR,
        startAngle: comp.arcStartAngle ?? -90,
        endAngle: comp.arcEndAngle ?? 270,
        lineWidth: comp.arcLineWidth ?? 6,
        color: arcColor.startsWith('#') ? `0x${arcColor.slice(1)}` : arcColor,
        dataType: comp.dataType,
      });
    }

    // 2. Icon (Canvas-drawn, positioned above center)
    const iconX = cx - ICON_SIZE / 2;
    const iconY = cy - ICON_SIZE - 2;
    const iconKey = comp.dataType;
    if (!generatedIcons.has(iconKey)) {
      generatedIcons.add(iconKey);
      images.push(generateComplicationIcon(comp.dataType, ICON_SIZE, iconColor));
    }
    elements.push({
      id: `el_${idCounter++}`, type: 'IMG', name: `${comp.dataType} Icon`, visible: true,
      zIndex: 5,
      bounds: { x: Math.round(iconX), y: Math.round(iconY), width: ICON_SIZE, height: ICON_SIZE },
      src: `icon_${comp.dataType.toLowerCase()}.png`,
      color: iconColor,
    });

    // 3. Value (TEXT_IMG digits)
    const valX = cx - VALUE_W / 2;
    const valY = cy + 2;

    if (!generatedDigitPrefixes.has(cfg.prefix)) {
      generatedDigitPrefixes.add(cfg.prefix);
      images.push(...generateDigitImages(`${cfg.prefix}_digit`, 14, VALUE_H, valColor));
    }
    const fontArray = Array.from({ length: 10 }, (_, i) => `${cfg.prefix}_digit_${i}.png`);

    elements.push({
      id: `el_${idCounter++}`, type: 'TEXT_IMG', name: `${comp.dataType} Value`, visible: true,
      zIndex: 5,
      bounds: { x: Math.round(valX), y: Math.round(valY), width: VALUE_W, height: VALUE_H },
      fontArray,
      dataType: comp.dataType,
      hSpace: 1,
      alignH: 'CENTER_H',
    });

    // 4. Label
    if (comp.label) {
      const labelY = valY + VALUE_H + 2;
      elements.push({
        id: `el_${idCounter++}`, type: 'TEXT', name: `${comp.dataType} Label`, visible: true,
        zIndex: 5,
        bounds: { x: Math.round(cx - 40), y: Math.round(labelY), width: 80, height: 16 },
        text: comp.label,
        fontSize: 14,
        color: labelColor.startsWith('#') ? `0x${labelColor.slice(1)}FF` : labelColor,
      });
    }

    // 5. BUTTON â€” exact same area covering icon + value + label
    const btnTop = Math.round(iconY);
    const btnBottom = Math.round(valY + VALUE_H + (comp.label ? 20 : 0));
    const btnLeft = Math.round(Math.min(iconX, valX));
    const btnRight = Math.round(Math.max(iconX + ICON_SIZE, valX + VALUE_W));
    if (cfg.clickAction) {
      elements.push({
        id: `el_${idCounter++}`, type: 'BUTTON', name: `${comp.dataType} Button`, visible: true,
        zIndex: 10,
        bounds: { x: btnLeft, y: btnTop, width: btnRight - btnLeft, height: btnBottom - btnTop },
        normalSrc: 'trasparente.png',
        pressSrc: 'trasparente.png',
        clickAction: cfg.clickAction,
      });
    }

    // 6. IMG_LEVEL for weather
    if (comp.dataType === 'WEATHER_CURRENT') {
      const weatherImgs = Array.from({ length: 29 }, (_, i) => `weather_${i}.png`);
      elements.push({
        id: `el_${idCounter++}`, type: 'IMG_LEVEL', name: 'Weather Icons', visible: true,
        zIndex: 5,
        bounds: { x: Math.round(iconX), y: Math.round(iconY), width: ICON_SIZE, height: ICON_SIZE },
        images: weatherImgs,
        dataType: 'WEATHER_CURRENT',
      });
      images.push(...generateWeatherIcons(29));
    }
  }

  // ---- STATUS ICONS ----
  if (analysis.statusIcons) {
    for (const si of analysis.statusIcons) {
      const statusSize = 30;
      elements.push({
        id: `el_${idCounter++}`, type: 'IMG_STATUS', name: `${si.type} Status`, visible: true,
        zIndex: 5,
        bounds: { x: si.x, y: si.y, width: statusSize, height: statusSize },
        statusType: si.type,
        src: si.type === 'DISCONNECT' ? 'bluetooth_30x30.png' : si.type === 'DISTURB' ? 'dnd_30x30.png' : 'alarm_30x30.png',
      });

      if (si.type === 'DISCONNECT') {
        images.push(generateStatusIcon('bluetooth_30x30.png', '#4488FF', (ctx, w) => {
          ctx.beginPath();
          ctx.moveTo(w * 0.35, w * 0.2); ctx.lineTo(w * 0.65, w * 0.4);
          ctx.lineTo(w * 0.5, w * 0.5); ctx.lineTo(w * 0.65, w * 0.6);
          ctx.lineTo(w * 0.35, w * 0.8);
          ctx.moveTo(w * 0.5, w * 0.2); ctx.lineTo(w * 0.5, w * 0.8);
          ctx.stroke();
        }));
      } else if (si.type === 'DISTURB') {
        images.push(generateStatusIcon('dnd_30x30.png', '#FF6B6B', (ctx, w) => {
          ctx.beginPath(); ctx.arc(w / 2, w / 2, w * 0.35, 0, Math.PI * 2); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(w * 0.25, w / 2); ctx.lineTo(w * 0.75, w / 2); ctx.stroke();
        }));
      } else if (si.type === 'CLOCK') {
        images.push(generateStatusIcon('alarm_30x30.png', '#FFD93D', (ctx, w) => {
          ctx.beginPath(); ctx.arc(w / 2, w * 0.55, w * 0.3, 0, Math.PI * 2); ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(w * 0.35, w * 0.25); ctx.lineTo(w / 2, w * 0.1); ctx.lineTo(w * 0.65, w * 0.25);
          ctx.stroke();
        }));
      }
    }
  }

  // ---- TRANSPARENT BUTTON IMAGE ----
  images.push({
    name: 'trasparente.png',
    dataUrl: createCanvasImage(1, 1, () => {}),
    bounds: { x: 0, y: 0, width: 1, height: 1 },
    type: 'BUTTON',
  });

  console.log(`[AssetGen] Expanded ${analysis.complications.length} complications â†’ ${elements.length} elements, ${images.length} images`);
  return { elements, images };
}

```

### FILE: `src/lib/aiService.ts`

```typescript
// AI Vision Service â€” Gemini 2.0 Flash (primary) + GPT-4o (fallback)
// Analyzes watchface images and returns WatchFaceElement[] for the V2 generator

import { WATCHFACE_SYSTEM_PROMPT, WATCHFACE_USER_PROMPT, type WatchfaceAnalysisResult } from './watchfacePrompt';

export type AIProvider = 'gemini' | 'openai';

export interface AIServiceConfig {
  provider: AIProvider;
  apiKey: string;
}

// ==================== GEMINI 2.0 FLASH ====================

async function analyzeWithGemini(
  apiKey: string,
  designImageBase64: string,
  designMimeType: string,
): Promise<WatchfaceAnalysisResult> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        parts: [
          { text: WATCHFACE_SYSTEM_PROMPT },
          {
            inline_data: {
              mime_type: designMimeType,
              data: designImageBase64,
            },
          },
          { text: WATCHFACE_USER_PROMPT },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      topP: 0.8,
      maxOutputTokens: 65536,
      responseMimeType: 'application/json',
      thinkingConfig: {
        thinkingBudget: 0,
      },
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  
  // Check for truncation
  const finishReason = data.candidates?.[0]?.finishReason;
  if (finishReason === 'MAX_TOKENS') {
    console.warn('[Gemini] Response truncated due to MAX_TOKENS');
  }
  
  // Gemini 2.5 may return thinking + text parts â€” get the last text part
  const parts = data.candidates?.[0]?.content?.parts || [];
  const textPart = parts.filter((p: Record<string, unknown>) => p.text).pop();
  const text = textPart?.text;
  if (!text) {
    throw new Error('Gemini returned empty response. finishReason: ' + finishReason);
  }

  return parseAIResponse(text);
}

// ==================== OPENAI GPT-4o ====================

async function analyzeWithOpenAI(
  apiKey: string,
  designImageBase64: string,
  designMimeType: string,
): Promise<WatchfaceAnalysisResult> {
  const url = 'https://api.openai.com/v1/chat/completions';

  const requestBody = {
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: WATCHFACE_SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: `data:${designMimeType};base64,${designImageBase64}`,
              detail: 'high',
            },
          },
          {
            type: 'text',
            text: WATCHFACE_USER_PROMPT,
          },
        ],
      },
    ],
    max_tokens: 8192,
    temperature: 0.1,
    response_format: { type: 'json_object' },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error('OpenAI returned empty response');
  }

  return parseAIResponse(text);
}

// ==================== RESPONSE PARSING ====================

function parseAIResponse(rawText: string): WatchfaceAnalysisResult {
  // Strip markdown fences if present
  let text = rawText.trim();
  if (text.startsWith('```json')) {
    text = text.slice(7);
  } else if (text.startsWith('```')) {
    text = text.slice(3);
  }
  if (text.endsWith('```')) {
    text = text.slice(0, -3);
  }
  text = text.trim();

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(text);
  } catch {
    // Try to recover truncated JSON by closing open arrays/objects
    let fixed = text;
    try {
      const lastCompleteObj = fixed.lastIndexOf('}');
      if (lastCompleteObj > 0) {
        fixed = fixed.slice(0, lastCompleteObj + 1);
        fixed = fixed.replace(/,\s*$/, '');
        const stack: string[] = [];
        for (const ch of fixed) {
          if (ch === '{') stack.push('}');
          else if (ch === '[') stack.push(']');
          else if (ch === '}' || ch === ']') stack.pop();
        }
        fixed += stack.reverse().join('');
      }
      parsed = JSON.parse(fixed);
      console.warn('[AI] Recovered truncated JSON response');
    } catch (e2) {
      throw new Error(`Failed to parse AI response as JSON. Recovery also failed: ${(e2 as Error).message}. Raw response: ${text.slice(0, 500)}`);
    }
  }

  // Validate required fields for the simplified analysis format
  if (!parsed.time || typeof parsed.time !== 'object') {
    throw new Error('AI response missing "time" object');
  }

  const complications = Array.isArray(parsed.complications) ? parsed.complications : [];

  return {
    designDescription: (parsed.designDescription as string) || 'Watchface design',
    dominantColors: Array.isArray(parsed.dominantColors) ? (parsed.dominantColors as string[]) : ['#FFFFFF', '#000000'],
    time: parsed.time as WatchfaceAnalysisResult['time'],
    date: parsed.date as WatchfaceAnalysisResult['date'],
    month: parsed.month as WatchfaceAnalysisResult['month'],
    weekday: parsed.weekday as WatchfaceAnalysisResult['weekday'],
    complications: complications as WatchfaceAnalysisResult['complications'],
    statusIcons: Array.isArray(parsed.statusIcons) ? (parsed.statusIcons as WatchfaceAnalysisResult['statusIcons']) : undefined,
  };
}

// ==================== PUBLIC API ====================

// Convert a File to base64 string
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      // Strip the data:mime;base64, prefix
      const base64 = dataUrl.split(',')[1];
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export async function analyzeWatchfaceImage(
  config: AIServiceConfig,
  designFile: File,
): Promise<WatchfaceAnalysisResult> {
  const mimeType = designFile.type || 'image/png';
  const base64Data = await fileToBase64(designFile);

  switch (config.provider) {
    case 'gemini':
      return analyzeWithGemini(config.apiKey, base64Data, mimeType);
    case 'openai':
      return analyzeWithOpenAI(config.apiKey, base64Data, mimeType);
    default:
      throw new Error(`Unknown AI provider: ${config.provider}`);
  }
}

// Test if an API key is valid by making a minimal request
export async function testApiKey(config: AIServiceConfig): Promise<boolean> {
  try {
    if (config.provider === 'gemini') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${config.apiKey}`;
      const response = await fetch(url);
      return response.ok;
    } else if (config.provider === 'openai') {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: { 'Authorization': `Bearer ${config.apiKey}` },
      });
      return response.ok;
    }
    return false;
  } catch {
    return false;
  }
}

```

### FILE: `src/lib/githubApi.ts`

```typescript
// GitHub API Integration for uploading ZPK files

import type { GitHubUploadResult } from '@/types';

export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
  branch?: string;
}

const MAX_FILE_SIZE = 6 * 1024 * 1024; // 6MB limit for GitHub API

// Convert ArrayBuffer to base64 in chunks to avoid stack overflow
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000; // 32KB chunks
  let binary = '';
  
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  
  return btoa(binary);
}

// Upload file to GitHub repository
export async function uploadToGitHub(
  config: GitHubConfig,
  filename: string,
  content: Blob | string,
  message?: string
): Promise<GitHubUploadResult> {
  const { token, owner, repo, branch = 'master' } = config;
  
  try {
    // Validate parameters
    if (!token || !token.trim()) {
      throw new Error('GitHub token is missing');
    }
    if (!owner || !owner.trim()) {
      throw new Error('GitHub owner is missing');
    }
    if (!repo || !repo.trim()) {
      throw new Error('GitHub repo is missing');
    }

    console.log('[GitHub] Starting upload...');
    console.log('[GitHub] Config:', { owner, repo, branch, filename });
    
    // Skip repo verification for now - go directly to upload
    console.log('[GitHub] Proceeding with file upload to:', `${owner}/${repo}`);
    
    // Upload to docs/zpk/ folder so it's accessible via GitHub Pages
    const filepath = `docs/zpk/${filename}`;
    console.log('[GitHub] Upload path:', filepath);
    
    let base64Content: string;
    let contentSize: number;
    
    if (content instanceof Blob) {
      contentSize = content.size;
      console.log('[GitHub] File size:', contentSize, 'bytes');
      
      if (contentSize > MAX_FILE_SIZE) {
        console.warn(`[GitHub] File size (${contentSize}) exceeds single upload limit (${MAX_FILE_SIZE}). File may need to be split.`);
      }
      
      console.log('[GitHub] Converting blob to base64...');
      const arrayBuffer = await content.arrayBuffer();
      base64Content = arrayBufferToBase64(arrayBuffer);
      console.log('[GitHub] Base64 conversion complete, length:', base64Content.length);
    } else {
      contentSize = content.length;
      base64Content = btoa(content);
    }
    
    // Check if file already exists (to get SHA for update)
    console.log('[GitHub] Checking if file exists...');
    const existingFile = await getFileSha(config, filepath);
    if (existingFile) {
      console.log('[GitHub] File exists, will update (SHA:', existingFile.sha.substring(0, 8), '...')
    } else {
      console.log('[GitHub] File does not exist, will create new');
    }
    
    // Prepare request body
    const body: Record<string, string> = {
      message: message || `Upload watch face: ${filename}`,
      content: base64Content,
      branch,
    };
    
    if (existingFile) {
      body.sha = existingFile.sha;
    }
    
    // Upload file
    console.log('[GitHub] Uploading to GitHub API...');
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filepath}`;
    console.log('[GitHub] API URL:', apiUrl);
    
    const response = await fetch(
      apiUrl,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );
    
    if (!response.ok) {
      console.error('[GitHub] Upload failed with status:', response.status);
      let errorMsg = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMsg = errorData.message || errorMsg;
      } catch {
        // Response body empty or not JSON â€” use status text
      }
      
      if (response.status === 413) {
        throw new Error(`File too large (${contentSize} bytes). Max: ${MAX_FILE_SIZE} bytes. Consider splitting the upload.`);
      }
      if (response.status === 422) {
        throw new Error(`Invalid file upload: ${errorMsg}. The file may be corrupted or in wrong format.`);
      }
      if (response.status === 401) {
        throw new Error('GitHub token is invalid or expired.');
      }
      
      throw new Error(`Upload failed: ${errorMsg}`);
    }
    
    // Parse response â€” guard against empty body (can happen on large uploads)
    let data: Record<string, unknown> | null = null;
    try {
      const text = await response.text();
      if (text) {
        data = JSON.parse(text);
      }
    } catch {
      console.warn('[GitHub] Could not parse response body, proceeding with URL construction');
    }
    console.log('[GitHub] Upload successful!');
    
    // Construct GitHub Pages URL
    // GitHub Pages serves docs/ folder at root: https://owner.github.io/repo/
    // So docs/zpk/watchface1/face.zpk is accessible at: https://owner.github.io/repo/zpk/watchface1/face.zpk
    const pagesUrl = `https://${owner}.github.io/${repo}/zpk/${filename}`;
    console.log('[GitHub] File uploaded to:', filepath);
    console.log('[GitHub] Accessible at:', pagesUrl);
    
    // Extract folder name for watchface ID (e.g., from "watchface1/face.zpk" extract "watchface1")
    const folderMatch = filename.match(/^([^\/]+)\//);
    const watchfaceId = folderMatch ? folderMatch[1] : filename.replace('.zpk', '').replace('-qr.png', '');
    
    console.log('[GitHub] Watchface ID:', watchfaceId);
    
    return {
      success: true,
      url: (data as Record<string, Record<string, string>> | null)?.content?.html_url || pagesUrl,
      downloadUrl: pagesUrl,
      watchfaceId: watchfaceId,
    };
  } catch (error) {
    console.error('[GitHub] Upload failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Verify file is accessible on GitHub Pages (non-blocking, runs in background)
// Get file SHA (for updating existing files)
async function getFileSha(
  config: GitHubConfig,
  filename: string
): Promise<{ sha: string } | null> {
  const { token, owner, repo, branch = 'master' } = config;
  
  try {
    if (!owner || !repo) {
      console.warn('[GitHub] Invalid owner or repo for getFileSha, skipping SHA check');
      return null;
    }

    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filename}?ref=${branch}`;
    console.log('[GitHub] Checking file SHA at:', apiUrl);
    
    const response = await fetch(
      apiUrl,
      {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );
    
    console.log('[GitHub] File check response status:', response.status);
    
    if (response.status === 404) {
      console.log('[GitHub] File does not exist (404), will create new');
      return null; // File doesn't exist
    }
    
    if (!response.ok) {
      console.warn(`[GitHub] File check failed with status ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    console.log('[GitHub] Existing file found, SHA:', data.sha);
    return { sha: data.sha };
  } catch (error) {
    console.error('[GitHub] Error checking file SHA:', error);
    return null;
  }
}

// Test GitHub connection
export async function testGitHubConnection(config: GitHubConfig): Promise<boolean> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${config.owner}/${config.repo}`,
      {
        headers: {
          'Authorization': `token ${config.token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );
    
    return response.ok;
  } catch {
    return false;
  }
}

// Get repository info
export async function getRepoInfo(config: GitHubConfig): Promise<{
  name: string;
  description: string;
  html_url: string;
  has_pages: boolean;
} | null> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${config.owner}/${config.repo}`,
      {
        headers: {
          'Authorization': `token ${config.token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );
    
    if (!response.ok) return null;
    
    return await response.json();
  } catch {
    return null;
  }
}

// List files in repository
export async function listFiles(
  config: GitHubConfig,
  path: string = ''
): Promise<string[]> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}`,
      {
        headers: {
          'Authorization': `token ${config.token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );
    
    if (!response.ok) return [];
    
    const data = await response.json();
    return data
      .filter((item: { type: string }) => item.type === 'file')
      .map((item: { name: string }) => item.name);
  } catch {
    return [];
  }
}

// Complete upload flow: Upload ZPK + QR code to same folder, verify, and return both URLs
export async function uploadZPKWithQR(
  config: GitHubConfig,
  watchfaceId: string,
  zpkBlob: Blob,
  qrDataUrl: string,
  watchfaceName: string
): Promise<GitHubUploadResult> {
  try {
    console.log('[GitHub] Starting folder-based ZPK+QR upload flow...');
    console.log('[GitHub] Watchface ID:', watchfaceId);
    
    // Step 1: Upload ZPK to docs/zpk/{watchfaceId}/face.zpk
    console.log('[GitHub] Step 1: Uploading ZPK file...');
    const zpkPath = `${watchfaceId}/face.zpk`;
    const zpkResult = await uploadToGitHub(
      config,
      zpkPath,
      zpkBlob,
      `Upload watch face ZPK: ${watchfaceName}`
    );
    
    if (!zpkResult.success) {
      throw new Error(`ZPK upload failed: ${zpkResult.error}`);
    }
    
    console.log('[GitHub] ZPK uploaded successfully to:', zpkResult.downloadUrl);
    
    // Step 2: Convert QR data URL to Blob
    console.log('[GitHub] Step 2: Converting QR code to blob...');
    const qrBlob = await fetch(qrDataUrl).then(r => r.blob());
    console.log('[GitHub] QR blob created, size:', qrBlob.size);
    
    // Step 3: Upload QR code to docs/zpk/{watchfaceId}/qr.png
    console.log('[GitHub] Step 3: Uploading QR code...');
    const qrPath = `${watchfaceId}/qr.png`;
    const qrResult = await uploadToGitHub(
      config,
      qrPath,
      qrBlob,
      `Upload QR code for: ${watchfaceName}`
    );
    
    if (!qrResult.success) {
      throw new Error(`QR code upload failed: ${qrResult.error}`);
    }
    
    console.log('[GitHub] QR code uploaded successfully to:', qrResult.downloadUrl);
    
    // Note: Files may take 30-60 seconds to appear on GitHub Pages, but upload is successful
    console.log('[GitHub] Upload complete! Files will be accessible on GitHub Pages shortly.');
    
    console.log('[GitHub] Upload flow complete!');
    return {
      success: true,
      url: zpkResult.url,
      downloadUrl: zpkResult.downloadUrl,
      qrUrl: qrResult.downloadUrl,
      watchfaceId: watchfaceId,
    };
  } catch (error) {
    console.error('[GitHub] Upload flow failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}


```

### FILE: `src/lib/qrGenerator.ts`

```typescript
// QR Code Generator for ZeppOS Watch Face Installation

import QRCode from 'qrcode';

// Generate QR code for ZPK installation
export async function generateQRCode(zpkUrl: string): Promise<string> {
  // ZeppOS uses zpkd1:// protocol for watch face installation
  // Remove https:// if present, then wrap with zpkd1://
  const cleanUrl = zpkUrl.replace(/^https:\/\//, '').replace(/^http:\/\//, '');
  const zpkd1Url = `zpkd1://${cleanUrl}`;
  
  try {
    const dataUrl = await QRCode.toDataURL(zpkd1Url, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    });
    
    return dataUrl;
  } catch (error) {
    throw new Error('Failed to generate QR code: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

// Generate QR code with custom options
export async function generateQRCodeCustom(
  zpkUrl: string,
  options: {
    width?: number;
    darkColor?: string;
    lightColor?: string;
  } = {}
): Promise<string> {
  const { width = 400, darkColor = '#000000', lightColor = '#FFFFFF' } = options;
  const cleanUrl = zpkUrl.replace(/^https:\/\//, '').replace(/^http:\/\//, '');
  const zpkd1Url = `zpkd1://${cleanUrl}`;
  
  try {
    const dataUrl = await QRCode.toDataURL(zpkd1Url, {
      width,
      margin: 2,
      color: {
        dark: darkColor,
        light: lightColor,
      },
      errorCorrectionLevel: 'H',
    });
    
    return dataUrl;
  } catch (error) {
    throw new Error('Failed to generate QR code: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

// Download QR code as image
export function downloadQRCode(dataUrl: string, filename: string = 'watchface-qr.png') {
  try {
    console.log('[Download] Starting QR code download:', { filename });
    
    if (!dataUrl || dataUrl.length === 0) {
      throw new Error('QR code data URL is empty or invalid');
    }

    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    
    document.body.appendChild(a);
    console.log('[Download] QR code anchor element added to DOM');
    
    a.click();
    console.log('[Download] QR code download triggered');
    
    // Add small delay before cleanup to ensure download initiates
    setTimeout(() => {
      document.body.removeChild(a);
      console.log('[Download] QR code download cleanup complete');
    }, 100);
  } catch (error) {
    console.error('[Download] QR code download failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`QR code download failed: ${errorMessage}`);
  }
}

```

### FILE: `src/lib/tgaConverter.ts`

```typescript
// TGA Image Converter for ZeppOS
// Converts PNG/JPEG images to TGA format variants

export type TGAFormat = 'TGA-P' | 'TGA-RLP' | 'TGA-16' | 'TGA-32';

interface TGAOptions {
  format: TGAFormat;
  width: number;
  height: number;
}

// Load image from data URL
function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}

// Convert data URL to TGA format
export async function convertToTGA(
  dataUrl: string,
  options: TGAOptions
): Promise<Uint8Array> {
  const img = await loadImage(dataUrl);
  const canvas = document.createElement('canvas');
  canvas.width = options.width;
  canvas.height = options.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // Draw image to canvas
  ctx.drawImage(img, 0, 0, options.width, options.height);
  const imageData = ctx.getImageData(0, 0, options.width, options.height);

  // Always use TGA-32 for simplicity and reliability
  return convertToTGA32(imageData);
}

// TGA-32: 32-bit RGBA (full color with alpha) - Most compatible
function convertToTGA32(imageData: ImageData): Uint8Array {
  const { width, height, data } = imageData;
  
  // Standard TGA header (18 bytes)
  const header = new Uint8Array(18);
  header[0] = 0; // ID length
  header[1] = 0; // Color map type (0 = no palette)
  header[2] = 2; // Image type (2 = uncompressed true-color)
  
  const view = new DataView(header.buffer);
  view.setUint16(12, width, true);  // Width
  view.setUint16(14, height, true); // Height
  header[16] = 32; // Pixel depth (32 bits)
  header[17] = 8;  // Image descriptor (8 bits alpha + origin)

  // Pixel data in BGRA order (TGA format)
  const pixelData = new Uint8Array(width * height * 4);
  let pixelIndex = 0;
  
  // Process pixels in reverse row order (TGA stores bottom-to-top by default)
  for (let y = height - 1; y >= 0; y--) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      // BGRA order for TGA
      pixelData[pixelIndex++] = data[i + 2]; // B
      pixelData[pixelIndex++] = data[i + 1]; // G
      pixelData[pixelIndex++] = data[i];     // R
      pixelData[pixelIndex++] = data[i + 3]; // A
    }
  }

  // Combine header + pixel data
  const tgaData = new Uint8Array(18 + pixelData.length);
  tgaData.set(header, 0);
  tgaData.set(pixelData, 18);

  return tgaData;
}

// Determine best TGA format for image type
export function getBestTGAFormat(_imageType: string): TGAFormat {
  // Always use TGA-32 for maximum compatibility
  return 'TGA-32';
}

```

### FILE: `src/lib/utils.ts`

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Create object URL for file preview (much more efficient than data URL)
export function fileToObjectUrl(file: File): string {
  return URL.createObjectURL(file);
}

// Generate unique ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Get image dimensions from object URL
export function getImageDimensions(objectUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = reject;
    img.src = objectUrl;
  });
}

// Download blob as file
export function downloadBlob(blob: Blob, filename: string) {
  try {
    console.log('[Download] Starting blob download:', { filename, size: blob.size, type: blob.type });
    
    if (!blob || blob.size === 0) {
      throw new Error('Blob is empty or invalid');
    }

    const url = URL.createObjectURL(blob);
    console.log('[Download] Object URL created:', url);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    
    // Set content type header
    if (!blob.type) {
      console.warn('[Download] No MIME type detected, defaulting to application/octet-stream');
    }
    
    document.body.appendChild(a);
    console.log('[Download] Anchor element added to DOM');
    
    a.click();
    console.log('[Download] Download triggered');
    
    // Add small delay before cleanup to ensure download initiates
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log('[Download] Object URL revoked and cleanup complete');
    }, 100);
  } catch (error) {
    console.error('[Download] Download failed with error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Download failed: ${errorMessage}`);
  }
}

```

### FILE: `src/lib/watchfacePrompt.ts`

```typescript
// Watchface Vision Analysis Prompt
// Designed for Gemini 2.5 Flash / GPT-4o vision API
// Outputs a simplified analysis that App.tsx expands into WatchFaceElement[]

export const WATCHFACE_SYSTEM_PROMPT = `You are an expert watchface layout analyzer. Given an image of a smartwatch face design (480Ã—480 round display), you identify what elements are shown and their EXACT pixel positions.

## CRITICAL: POSITION ACCURACY
- The image is 480Ã—480 pixels. Origin (0,0) = top-left. Center = (240,240).
- The circular bezel clips at ~230px radius from center.
- You MUST report positions that match WHERE elements actually appear in the image.
- If elements follow a curve (like an arc along the right edge), their positions must follow that same curve â€” do NOT flatten them into a vertical column.

## WHAT TO IDENTIFY

### 1. Time Display
If large digital numbers showing hours:minutes are visible, report:
- Position (x, y of top-left of the time digits)
- Size (width, height of the entire time display area)
- Text color (as hex #RRGGBB)
- Font size estimate (pixels)

### 2. Date/Month/Weekday
If visible, report each one's position and color.

### 3. Complications (data displays)
For each complication (battery, heart rate, steps, weather, stress, SpO2, calories, distance, PAI, etc.):
- **dataType**: which data it shows (BATTERY, HEART, STEP, CAL, STRESS, SPO2, WEATHER_CURRENT, DISTANCE, PAI_DAILY, HUMIDITY, UVI, STAND, SLEEP, FAT_BURNING)
- **position**: x, y of the CENTER of this complication group
- **hasArc**: if there's a circular arc/ring around this complication
- **arcRadius**: radius of the arc if present  
- **arcColor**: color of the arc as hex
- **valueColor**: color of the numeric value text
- **label**: any text label shown (e.g. "Battery", "Steps", "HR")
- **labelColor**: color of the label text
- **iconColor**: dominant color of the small icon (for Canvas drawing)

### 4. Analog Hands
If clock hands are visible, report:
- Whether hour/minute/second hands exist
- Hand colors
- Center point (usually 240,240)

### 5. Status Icons
If small status indicators (Bluetooth, DND, alarm) are visible, report their position and which type.

## POSITION ESTIMATION METHOD
1. Look at the image carefully
2. For each element, identify its visual center point as (x, y) in the 480Ã—480 coordinate space
3. Consider: top of screen = yâ‰ˆ10, bottom = yâ‰ˆ470, left = xâ‰ˆ10, right = xâ‰ˆ470
4. If complications are arranged along a curve, report positions that follow that curve
5. If complications are in a column, report the actual vertical spacing you see

## OUTPUT FORMAT
Return a JSON object:
\`\`\`json
{
  "designDescription": "brief style description",
  "dominantColors": ["#hex1", "#hex2", "#hex3"],
  
  "time": {
    "exists": true/false,
    "type": "digital" | "analog" | "both",
    "digital": {
      "x": number, "y": number, "width": number, "height": number,
      "color": "#hex", "fontSize": number
    },
    "analog": {
      "centerX": 240, "centerY": 240,
      "hourColor": "#hex", "minuteColor": "#hex", "secondColor": "#hex",
      "hasSecondHand": true/false
    }
  },
  
  "date": {
    "exists": true/false,
    "x": number, "y": number, "width": number, "height": number,
    "color": "#hex"
  },
  
  "month": {
    "exists": true/false,
    "x": number, "y": number, "width": number, "height": number,
    "color": "#hex"
  },
  
  "weekday": {
    "exists": true/false,
    "x": number, "y": number, "width": number, "height": number,
    "color": "#hex"
  },
  
  "complications": [
    {
      "dataType": "BATTERY",
      "centerX": number,
      "centerY": number,
      "hasArc": true/false,
      "arcRadius": number,
      "arcStartAngle": number,
      "arcEndAngle": number,
      "arcLineWidth": number,
      "arcColor": "#hex",
      "valueColor": "#hex",
      "label": "Battery",
      "labelColor": "#hex",
      "iconColor": "#hex"
    }
  ],
  
  "statusIcons": [
    { "type": "DISCONNECT" | "DISTURB" | "CLOCK" | "LOCK", "x": number, "y": number }
  ]
}
\`\`\`

## RULES
- Report ONLY elements you actually SEE in the image
- Positions must be pixel-accurate for the 480Ã—480 grid
- Colors must be hex format (#RRGGBB)
- For arc angles: 0Â° = 3 o'clock direction, goes clockwise. Common: startAngle=-90 (12 o'clock), endAngle=270 (full circle)
- Do NOT invent elements that aren't visible
- Keep it concise â€” only what's visible`;

export const WATCHFACE_USER_PROMPT = `Analyze this watchface design image. It's for an Amazfit Balance 2 (480Ã—480 round display).

Look carefully at:
1. WHERE each element is positioned (follow curves if elements are arranged along an arc)
2. WHAT data each complication shows (battery %, heart rate BPM, step count, etc.)
3. The COLORS of text, arcs/rings, icons, and labels
4. Whether time is shown as digital numbers, analog hands, or both
5. Any date/month/weekday displays and their positions

Report exact pixel positions. If elements follow a curved path (e.g., along the right side of a circular bezel), their coordinates should follow that same curve â€” NOT a straight vertical line.

Return the JSON as specified in your instructions.`;

// Type for the simplified AI analysis response
export interface WatchfaceAnalysisResult {
  designDescription: string;
  dominantColors: string[];
  time: {
    exists: boolean;
    type: 'digital' | 'analog' | 'both';
    digital?: {
      x: number; y: number; width: number; height: number;
      color: string; fontSize: number;
    };
    analog?: {
      centerX: number; centerY: number;
      hourColor: string; minuteColor: string; secondColor: string;
      hasSecondHand: boolean;
    };
  };
  date?: {
    exists: boolean;
    x: number; y: number; width: number; height: number;
    color: string;
  };
  month?: {
    exists: boolean;
    x: number; y: number; width: number; height: number;
    color: string;
  };
  weekday?: {
    exists: boolean;
    x: number; y: number; width: number; height: number;
    color: string;
  };
  complications: Array<{
    dataType: string;
    centerX: number;
    centerY: number;
    hasArc: boolean;
    arcRadius?: number;
    arcStartAngle?: number;
    arcEndAngle?: number;
    arcLineWidth?: number;
    arcColor?: string;
    valueColor?: string;
    label?: string;
    labelColor?: string;
    iconColor?: string;
  }>;
  statusIcons?: Array<{
    type: string;
    x: number;
    y: number;
  }>;
}

```


## REACT APP CORE (src/)

### FILE: `src/main.tsx`

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';
import { AppProvider } from '@/context/AppContext';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <App />
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: '#1A1A1A',
            border: '1px solid #27272A',
            color: '#FFFFFF',
          },
        }}
      />
    </AppProvider>
  </StrictMode>
);

```

### FILE: `src/App.tsx`

```tsx
import { useState, useCallback } from 'react';
import { ArrowRight, RefreshCw, Sparkles, Wand2, Settings, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

import { Header } from '@/components/Header';
import { UploadZone } from '@/components/UploadZone';
import { WatchPreview } from '@/components/WatchPreview';
import { CanvasWatchPreview } from '@/components/CanvasWatchPreview';
import { QRDisplay } from '@/components/QRDisplay';
import { StepIndicator } from '@/components/StepIndicator';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { ElementList } from '@/components/ElementList';

import { useApp, actions } from '@/context/AppContext';
import { buildZPK } from '@/lib/zpkBuilder';
import { uploadZPKWithQR } from '@/lib/githubApi';
import { generateQRCode } from '@/lib/qrGenerator';
import { analyzeWatchfaceImage, testApiKey, type AIProvider, type AIServiceConfig } from '@/lib/aiService';
import { expandAnalysisToElements } from '@/lib/assetGenerator';
import { runPipeline } from '@/pipeline';
import { extractElementsFromImage, type PipelineAIProvider } from '@/pipeline/pipelineAIService';
import { generatePipelineAssets } from '@/pipeline/assetImageGenerator';
import type { WatchFaceConfig, WatchFaceElement, ElementImage } from '@/types';
import { generateId } from '@/lib/utils';

// Mock Kimi analysis - simulates AI analysis
async function mockKimiAnalysis(
  _backgroundImage: string,
  _fullDesignImage: string,
  watchModel: string
): Promise<{ config: WatchFaceConfig; elementImages: ElementImage[] }> {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Parse watch model for resolution
  const resolutions: Record<string, { width: number; height: number }> = {
    // User's main goal
    'Balance 2': { width: 480, height: 480 },
    // Other requested models
    'Balance': { width: 480, height: 480 },
    'Active Max': { width: 480, height: 480 },
    'Active 3 Premium': { width: 466, height: 466 },
    'Active 2 Round': { width: 466, height: 466 },
    'Active 2 Square': { width: 390, height: 450 },
    'Active': { width: 390, height: 450 },
    'Pop 3S (PIB)': { width: 410, height: 502 },
    // Original models
    'GTR4': { width: 466, height: 466 },
    'GTS4': { width: 390, height: 450 },
    'Cheetah Pro': { width: 466, height: 466 },
    'T-Rex 2': { width: 454, height: 454 },
    'Falcon': { width: 416, height: 416 },
  };

  const resolution = resolutions[watchModel] || { width: 466, height: 466 };

  // Generate mock elements - ALL widget types for Balance 2 V2 format
  // Covers every generator code path + all proven data_types from Zepp OS v1.0
  const cx = Math.floor(resolution.width / 2);
  const cy = Math.floor(resolution.height / 2);
  const elements: WatchFaceElement[] = [
    // ===== BACKGROUND =====
    {
      id: generateId(),
      type: 'IMG',
      name: 'Background',
      bounds: { x: 0, y: 0, width: resolution.width, height: resolution.height },
      src: 'background_ed15585c.png',
      visible: true,
      zIndex: 0,
    },
    // ===== TIME (IMG_TIME - name-matched) =====
    {
      id: generateId(),
      type: 'IMG',
      name: 'Time Display',
      bounds: { x: 25, y: 220, width: 150, height: 60 },
      src: 'time_digit_0.png',
      visible: true,
      zIndex: 5,
    },
    // ===== DATE (IMG_DATE day - name-matched) =====
    {
      id: generateId(),
      type: 'IMG',
      name: 'Date',
      bounds: { x: 92, y: 198, width: 40, height: 30 },
      src: 'date_digit_0.png',
      visible: true,
      zIndex: 5,
    },
    // ===== MONTH (IMG_DATE month - name-matched) =====
    {
      id: generateId(),
      type: 'IMG',
      name: 'Month',
      bounds: { x: 130, y: 198, width: 40, height: 30 },
      src: 'month_0.png',
      visible: true,
      zIndex: 5,
    },
    // ===== WEEKDAY (IMG_WEEK - name-matched) =====
    {
      id: generateId(),
      type: 'IMG',
      name: 'Weekday',
      bounds: { x: 33, y: 198, width: 20, height: 30 },
      src: 'week_0.png',
      visible: true,
      zIndex: 5,
    },
    // ===== ANALOG CLOCK HANDS (TIME_POINTER) =====
    {
      id: generateId(),
      type: 'TIME_POINTER',
      name: 'Analog Clock Hands',
      bounds: { x: cx - 40, y: cy - 40, width: 80, height: 80 },
      center: { x: cx, y: cy },
      hourHandSrc: 'hour_hand.png',
      minuteHandSrc: 'minute_hand.png',
      secondHandSrc: 'second_hand.png',
      coverSrc: 'hand_cover.png',
      hourPos: { x: 11, y: 70 },
      minutePos: { x: 8, y: 100 },
      secondPos: { x: 3, y: 120 },
      visible: true,
      zIndex: 15,
    },
    // ===== BATTERY ARC (ARC_PROGRESS) =====
    {
      id: generateId(),
      type: 'ARC_PROGRESS',
      name: 'Battery Arc',
      bounds: { x: cx - 80, y: 50, width: 160, height: 160 },
      center: { x: cx, y: 130 },
      radius: 70,
      startAngle: -90,
      endAngle: 270,
      lineWidth: 8,
      color: '0x00CC88',
      dataType: 'BATTERY',
      visible: true,
      zIndex: 5,
    },
    // ===== BATTERY VALUE (TEXT_IMG) =====
    {
      id: generateId(),
      type: 'TEXT_IMG',
      name: 'Battery Value',
      bounds: { x: cx - 25, y: 118, width: 50, height: 25 },
      fontArray: Array.from({length: 10}, (_, i) => `batt_digit_${i}.png`),
      dataType: 'BATTERY',
      hSpace: 1,
      alignH: 'CENTER_H',
      visible: true,
      zIndex: 6,
    },
    // ===== HEART RATE ARC (ARC_PROGRESS) =====
    {
      id: generateId(),
      type: 'ARC_PROGRESS',
      name: 'Heart Rate Arc',
      bounds: { x: 30, y: cy - 50, width: 100, height: 100 },
      center: { x: 80, y: cy },
      radius: 40,
      startAngle: -90,
      endAngle: 270,
      lineWidth: 6,
      color: '0xFF6B6B',
      dataType: 'HEART',
      visible: true,
      zIndex: 5,
    },
    // ===== HEART RATE VALUE (TEXT_IMG) =====
    {
      id: generateId(),
      type: 'TEXT_IMG',
      name: 'Heart Rate Value',
      bounds: { x: 55, y: cy - 12, width: 50, height: 25 },
      fontArray: Array.from({length: 10}, (_, i) => `heart_digit_${i}.png`),
      dataType: 'HEART',
      hSpace: 1,
      alignH: 'CENTER_H',
      visible: true,
      zIndex: 6,
    },
    // ===== STEPS ARC (ARC_PROGRESS) =====
    {
      id: generateId(),
      type: 'ARC_PROGRESS',
      name: 'Steps Arc',
      bounds: { x: resolution.width - 130, y: cy - 50, width: 100, height: 100 },
      center: { x: resolution.width - 80, y: cy },
      radius: 40,
      startAngle: -90,
      endAngle: 270,
      lineWidth: 6,
      color: '0xFFD93D',
      dataType: 'STEP',
      visible: true,
      zIndex: 5,
    },
    // ===== STEPS VALUE (TEXT_IMG) =====
    {
      id: generateId(),
      type: 'TEXT_IMG',
      name: 'Steps Value',
      bounds: { x: resolution.width - 105, y: cy - 12, width: 50, height: 25 },
      fontArray: Array.from({length: 10}, (_, i) => `step_digit_${i}.png`),
      dataType: 'STEP',
      hSpace: 1,
      alignH: 'CENTER_H',
      visible: true,
      zIndex: 6,
    },
    // ===== CALORIES VALUE (TEXT_IMG) =====
    {
      id: generateId(),
      type: 'TEXT_IMG',
      name: 'Calories Value',
      bounds: { x: 55, y: cy + 60, width: 60, height: 25 },
      fontArray: Array.from({length: 10}, (_, i) => `cal_digit_${i}.png`),
      dataType: 'CAL',
      hSpace: 1,
      alignH: 'CENTER_H',
      visible: true,
      zIndex: 6,
    },
    // ===== DISTANCE VALUE (TEXT_IMG) =====
    {
      id: generateId(),
      type: 'TEXT_IMG',
      name: 'Distance Value',
      bounds: { x: resolution.width - 115, y: cy + 60, width: 60, height: 25 },
      fontArray: Array.from({length: 10}, (_, i) => `dist_digit_${i}.png`),
      dataType: 'DIST',
      hSpace: 1,
      alignH: 'CENTER_H',
      visible: true,
      zIndex: 6,
    },
    // ===== PAI/BIO CHARGE VALUE (TEXT_IMG) =====
    {
      id: generateId(),
      type: 'TEXT_IMG',
      name: 'PAI Value',
      bounds: { x: cx - 30, y: resolution.height - 80, width: 60, height: 25 },
      fontArray: Array.from({length: 10}, (_, i) => `pai_digit_${i}.png`),
      dataType: 'PAI_DAILY',
      hSpace: 1,
      alignH: 'CENTER_H',
      visible: true,
      zIndex: 6,
    },
    // ===== SPO2 VALUE (TEXT_IMG) =====
    {
      id: generateId(),
      type: 'TEXT_IMG',
      name: 'SpO2 Value',
      bounds: { x: cx - 30, y: 50, width: 60, height: 25 },
      fontArray: Array.from({length: 10}, (_, i) => `spo2_digit_${i}.png`),
      dataType: 'SPO2',
      hSpace: 1,
      alignH: 'CENTER_H',
      visible: true,
      zIndex: 6,
    },
    // ===== HUMIDITY VALUE (TEXT_IMG) =====
    {
      id: generateId(),
      type: 'TEXT_IMG',
      name: 'Humidity Value',
      bounds: { x: 30, y: resolution.height - 55, width: 50, height: 25 },
      fontArray: Array.from({length: 10}, (_, i) => `hum_digit_${i}.png`),
      dataType: 'HUMIDITY',
      hSpace: 1,
      alignH: 'CENTER_H',
      visible: true,
      zIndex: 6,
    },
    // ===== UVI VALUE (TEXT_IMG) =====
    {
      id: generateId(),
      type: 'TEXT_IMG',
      name: 'UV Index Value',
      bounds: { x: resolution.width - 80, y: resolution.height - 55, width: 50, height: 25 },
      fontArray: Array.from({length: 10}, (_, i) => `uvi_digit_${i}.png`),
      dataType: 'UVI',
      hSpace: 1,
      alignH: 'CENTER_H',
      visible: true,
      zIndex: 6,
    },
    // ===== ACTIVITY ARC (ARC_PROGRESS) =====
    {
      id: generateId(),
      type: 'ARC_PROGRESS',
      name: 'Activity Arc',
      bounds: { x: cx - 55, y: resolution.height - 120, width: 110, height: 110 },
      center: { x: cx, y: resolution.height - 65 },
      radius: 50,
      startAngle: -120,
      endAngle: 120,
      lineWidth: 6,
      color: '0x6BCB77',
      dataType: 'STEP',
      visible: true,
      zIndex: 5,
    },
    // ===== WEATHER ICON (IMG_LEVEL) =====
    {
      id: generateId(),
      type: 'IMG_LEVEL',
      name: 'Weather Icon',
      bounds: { x: 60, y: resolution.height - 60, width: 40, height: 40 },
      images: Array.from({length: 29}, (_, i) => `weather_${i}.png`),
      dataType: 'WEATHER_CURRENT',
      visible: true,
      zIndex: 6,
    },
    // ===== BLUETOOTH STATUS (IMG_STATUS) =====
    {
      id: generateId(),
      type: 'IMG_STATUS',
      name: 'Bluetooth Status',
      bounds: { x: cx - 15, y: resolution.height - 60, width: 30, height: 30 },
      src: 'bluetooth_30x30.png',
      statusType: 'DISCONNECT',
      visible: true,
      zIndex: 6,
    },
    // ===== DND STATUS (IMG_STATUS) =====
    {
      id: generateId(),
      type: 'IMG_STATUS',
      name: 'DND Status',
      bounds: { x: cx + 20, y: resolution.height - 60, width: 30, height: 30 },
      src: 'dnd_30x30.png',
      statusType: 'DISTURB',
      visible: true,
      zIndex: 6,
    },
    // ===== ALARM STATUS (IMG_STATUS) =====
    {
      id: generateId(),
      type: 'IMG_STATUS',
      name: 'Alarm Status',
      bounds: { x: cx + 55, y: resolution.height - 60, width: 30, height: 30 },
      src: 'alarm_30x30.png',
      statusType: 'CLOCK',
      visible: true,
      zIndex: 6,
    },
    // ===== CITY NAME (TEXT) =====
    {
      id: generateId(),
      type: 'TEXT',
      name: 'City Name',
      bounds: { x: cx - 70, y: resolution.height - 35, width: 140, height: 25 },
      text: '',
      fontSize: 18,
      color: '0xCCCCCCFF',
      visible: true,
      zIndex: 6,
    },
    // ===== BATTERY DECORATION (CIRCLE) =====
    {
      id: generateId(),
      type: 'CIRCLE',
      name: 'Battery Ring Decor',
      bounds: { x: cx - 80, y: 48, width: 160, height: 160 },
      center: { x: cx, y: 130 },
      radius: 78,
      color: '0x333333',
      visible: true,
      zIndex: 4,
    },
    // ===== HEART DECORATION (CIRCLE) =====
    {
      id: generateId(),
      type: 'CIRCLE',
      name: 'Heart Ring Decor',
      bounds: { x: 28, y: cy - 52, width: 104, height: 104 },
      center: { x: 80, y: cy },
      radius: 48,
      color: '0x333333',
      visible: true,
      zIndex: 4,
    },
    // ===== STEPS DECORATION (CIRCLE) =====
    {
      id: generateId(),
      type: 'CIRCLE',
      name: 'Steps Ring Decor',
      bounds: { x: resolution.width - 132, y: cy - 52, width: 104, height: 104 },
      center: { x: resolution.width - 80, y: cy },
      radius: 48,
      color: '0x333333',
      visible: true,
      zIndex: 4,
    },
    // ===== HEART ICON (static IMG) =====
    {
      id: generateId(),
      type: 'IMG',
      name: 'Heart Icon',
      bounds: { x: 68, y: cy - 35, width: 24, height: 20 },
      src: 'icon_heart_24x20.png',
      visible: true,
      zIndex: 7,
    },
    // ===== STEPS ICON (static IMG) =====
    {
      id: generateId(),
      type: 'IMG',
      name: 'Steps Icon',
      bounds: { x: resolution.width - 92, y: cy - 35, width: 24, height: 24 },
      src: 'icon_steps_24x24.png',
      visible: true,
      zIndex: 7,
    },
    // ===== BATTERY ICON (static IMG) =====
    {
      id: generateId(),
      type: 'IMG',
      name: 'Battery Icon Label',
      bounds: { x: cx - 12, y: 96, width: 24, height: 14 },
      src: 'icon_batt_24x14.png',
      visible: true,
      zIndex: 7,
    },
    // ===== BUTTON: Battery Shortcut =====
    {
      id: generateId(),
      type: 'BUTTON',
      name: 'Battery Shortcut',
      bounds: { x: cx - 50, y: 60, width: 100, height: 100 },
      normalSrc: 'trasparente.png',
      pressSrc: 'trasparente.png',
      clickAction: 'Settings_batteryManagerScreen',
      visible: true,
      zIndex: 10,
    },
    // ===== BUTTON: Heart Shortcut =====
    {
      id: generateId(),
      type: 'BUTTON',
      name: 'Heart Shortcut',
      bounds: { x: 30, y: cy - 50, width: 100, height: 100 },
      normalSrc: 'trasparente.png',
      pressSrc: 'trasparente.png',
      clickAction: 'heart_app_Screen',
      visible: true,
      zIndex: 10,
    },
    // ===== BUTTON: Steps/Activity Shortcut =====
    {
      id: generateId(),
      type: 'BUTTON',
      name: 'Activity Shortcut',
      bounds: { x: resolution.width - 130, y: cy - 50, width: 100, height: 100 },
      normalSrc: 'trasparente.png',
      pressSrc: 'trasparente.png',
      clickAction: 'activityAppScreen',
      visible: true,
      zIndex: 10,
    },
    // ===== BUTTON: Weather Shortcut =====
    {
      id: generateId(),
      type: 'BUTTON',
      name: 'Weather Shortcut',
      bounds: { x: 30, y: resolution.height - 100, width: 90, height: 90 },
      normalSrc: 'trasparente.png',
      pressSrc: 'trasparente.png',
      clickAction: 'WeatherScreen',
      visible: true,
      zIndex: 10,
    },
    // ===== BUTTON: Stress Shortcut =====
    {
      id: generateId(),
      type: 'BUTTON',
      name: 'Stress Shortcut',
      bounds: { x: resolution.width - 120, y: resolution.height - 100, width: 90, height: 90 },
      normalSrc: 'trasparente.png',
      pressSrc: 'trasparente.png',
      clickAction: 'StressHomeScreen',
      visible: true,
      zIndex: 10,
    },
    // ===== BUTTON: PAI/Bio Charge Shortcut =====
    {
      id: generateId(),
      type: 'BUTTON',
      name: 'PAI Shortcut',
      bounds: { x: cx - 45, y: resolution.height - 100, width: 90, height: 90 },
      normalSrc: 'trasparente.png',
      pressSrc: 'trasparente.png',
      clickAction: 'BioChargeHomeScreen',
      visible: true,
      zIndex: 10,
    },
  ];

  // Generate mock element images - create proper watch hand/element graphics
  console.log('[Mock] Starting element image generation for', elements.length, 'elements');
  const elementImages: ElementImage[] = [];
  
  // Helper: create a canvas image and return as dataUrl
  function createCanvasImage(width: number, height: number, drawFn: (ctx: CanvasRenderingContext2D, w: number, h: number) => void): string {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, width, height);
      drawFn(ctx, width, height);
    }
    return canvas.toDataURL('image/png');
  }
  
  // Helper: draw a digit on canvas
  function drawDigit(ctx: CanvasRenderingContext2D, w: number, h: number, digit: string, color: string) {
    ctx.fillStyle = color;
    ctx.font = `bold ${Math.floor(h * 0.7)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(digit, w / 2, h / 2);
  }
  
  // Generate TIME digit images (0-9) - used by IMG_TIME for hours and minutes
  const timeDigitSize = { w: 30, h: 50 };
  for (let i = 0; i < 10; i++) {
    const filename = `time_digit_${i}.png`;
    const dataUrl = createCanvasImage(timeDigitSize.w, timeDigitSize.h, (ctx, w, h) => {
      drawDigit(ctx, w, h, String(i), '#FFFFFF');
    });
    elementImages.push({
      name: filename,
      dataUrl,
      bounds: { x: 0, y: 0, width: timeDigitSize.w, height: timeDigitSize.h },
      type: 'IMG',
    });
  }
  
  // Generate DATE digit images (0-9) - used by IMG_DATE for day numbers
  const dateDigitSize = { w: 20, h: 30 };
  for (let i = 0; i < 10; i++) {
    const filename = `date_digit_${i}.png`;
    const dataUrl = createCanvasImage(dateDigitSize.w, dateDigitSize.h, (ctx, w, h) => {
      drawDigit(ctx, w, h, String(i), '#CCCCCC');
    });
    elementImages.push({
      name: filename,
      dataUrl,
      bounds: { x: 0, y: 0, width: dateDigitSize.w, height: dateDigitSize.h },
      type: 'IMG',
    });
  }
  
  // Generate WEEK images (7 days) - used by IMG_WEEK
  const weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const weekSize = { w: 40, h: 20 };
  for (let i = 0; i < 7; i++) {
    const filename = `week_${i}.png`;
    const dataUrl = createCanvasImage(weekSize.w, weekSize.h, (ctx, w, h) => {
      ctx.fillStyle = '#FFD700';
      ctx.font = `bold ${Math.floor(h * 0.6)}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(weekDays[i], w / 2, h / 2);
    });
    elementImages.push({
      name: filename,
      dataUrl,
      bounds: { x: 0, y: 0, width: weekSize.w, height: weekSize.h },
      type: 'IMG',
    });
  }
  
  // Generate BATTERY digit images (0-9) - used by TEXT_IMG for battery %
  const battDigitSize = { w: 16, h: 25 };
  for (let i = 0; i < 10; i++) {
    const filename = `batt_digit_${i}.png`;
    const dataUrl = createCanvasImage(battDigitSize.w, battDigitSize.h, (ctx, w, h) => {
      drawDigit(ctx, w, h, String(i), '#00CC88');
    });
    elementImages.push({
      name: filename,
      dataUrl,
      bounds: { x: 0, y: 0, width: battDigitSize.w, height: battDigitSize.h },
      type: 'TEXT_IMG',
    });
  }

  // Generate HEART RATE digit images (0-9) - used by TEXT_IMG
  const heartDigitSize = { w: 18, h: 30 };
  for (let i = 0; i < 10; i++) {
    const filename = `heart_digit_${i}.png`;
    const dataUrl = createCanvasImage(heartDigitSize.w, heartDigitSize.h, (ctx, w, h) => {
      drawDigit(ctx, w, h, String(i), '#FF6B6B');
    });
    elementImages.push({
      name: filename,
      dataUrl,
      bounds: { x: 0, y: 0, width: heartDigitSize.w, height: heartDigitSize.h },
      type: 'TEXT_IMG',
    });
  }

  // Generate STEPS digit images (0-9) - used by TEXT_IMG
  const stepDigitSize = { w: 18, h: 30 };
  for (let i = 0; i < 10; i++) {
    const filename = `step_digit_${i}.png`;
    const dataUrl = createCanvasImage(stepDigitSize.w, stepDigitSize.h, (ctx, w, h) => {
      drawDigit(ctx, w, h, String(i), '#FFD93D');
    });
    elementImages.push({
      name: filename,
      dataUrl,
      bounds: { x: 0, y: 0, width: stepDigitSize.w, height: stepDigitSize.h },
      type: 'TEXT_IMG',
    });
  }

  // Generate CALORIES digit images (0-9) - used by TEXT_IMG CAL
  const calDigitSize = { w: 16, h: 25 };
  for (let i = 0; i < 10; i++) {
    const filename = `cal_digit_${i}.png`;
    const dataUrl = createCanvasImage(calDigitSize.w, calDigitSize.h, (ctx, w, h) => {
      drawDigit(ctx, w, h, String(i), '#FF9F43');
    });
    elementImages.push({ name: filename, dataUrl, bounds: { x: 0, y: 0, width: calDigitSize.w, height: calDigitSize.h }, type: 'TEXT_IMG' });
  }

  // Generate DISTANCE digit images (0-9) - used by TEXT_IMG DIST
  const distDigitSize = { w: 16, h: 25 };
  for (let i = 0; i < 10; i++) {
    const filename = `dist_digit_${i}.png`;
    const dataUrl = createCanvasImage(distDigitSize.w, distDigitSize.h, (ctx, w, h) => {
      drawDigit(ctx, w, h, String(i), '#54A0FF');
    });
    elementImages.push({ name: filename, dataUrl, bounds: { x: 0, y: 0, width: distDigitSize.w, height: distDigitSize.h }, type: 'TEXT_IMG' });
  }

  // Generate PAI digit images (0-9) - used by TEXT_IMG PAI_DAILY
  const paiDigitSize = { w: 16, h: 25 };
  for (let i = 0; i < 10; i++) {
    const filename = `pai_digit_${i}.png`;
    const dataUrl = createCanvasImage(paiDigitSize.w, paiDigitSize.h, (ctx, w, h) => {
      drawDigit(ctx, w, h, String(i), '#5F27CD');
    });
    elementImages.push({ name: filename, dataUrl, bounds: { x: 0, y: 0, width: paiDigitSize.w, height: paiDigitSize.h }, type: 'TEXT_IMG' });
  }

  // Generate SPO2 digit images (0-9) - used by TEXT_IMG SPO2
  const spo2DigitSize = { w: 16, h: 25 };
  for (let i = 0; i < 10; i++) {
    const filename = `spo2_digit_${i}.png`;
    const dataUrl = createCanvasImage(spo2DigitSize.w, spo2DigitSize.h, (ctx, w, h) => {
      drawDigit(ctx, w, h, String(i), '#EE5A24');
    });
    elementImages.push({ name: filename, dataUrl, bounds: { x: 0, y: 0, width: spo2DigitSize.w, height: spo2DigitSize.h }, type: 'TEXT_IMG' });
  }

  // Generate HUMIDITY digit images (0-9) - used by TEXT_IMG HUMIDITY
  const humDigitSize = { w: 16, h: 25 };
  for (let i = 0; i < 10; i++) {
    const filename = `hum_digit_${i}.png`;
    const dataUrl = createCanvasImage(humDigitSize.w, humDigitSize.h, (ctx, w, h) => {
      drawDigit(ctx, w, h, String(i), '#0ABDE3');
    });
    elementImages.push({ name: filename, dataUrl, bounds: { x: 0, y: 0, width: humDigitSize.w, height: humDigitSize.h }, type: 'TEXT_IMG' });
  }

  // Generate UVI digit images (0-9) - used by TEXT_IMG UVI
  const uviDigitSize = { w: 16, h: 25 };
  for (let i = 0; i < 10; i++) {
    const filename = `uvi_digit_${i}.png`;
    const dataUrl = createCanvasImage(uviDigitSize.w, uviDigitSize.h, (ctx, w, h) => {
      drawDigit(ctx, w, h, String(i), '#FFC312');
    });
    elementImages.push({ name: filename, dataUrl, bounds: { x: 0, y: 0, width: uviDigitSize.w, height: uviDigitSize.h }, type: 'TEXT_IMG' });
  }

  // Generate MONTH images (0-11) - used by IMG_DATE month (12-image array)
  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const monthSize = { w: 40, h: 20 };
  for (let i = 0; i < 12; i++) {
    const filename = `month_${i}.png`;
    const dataUrl = createCanvasImage(monthSize.w, monthSize.h, (ctx, w, h) => {
      ctx.fillStyle = '#AAAAAA';
      ctx.font = `bold ${Math.floor(h * 0.6)}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(monthNames[i], w / 2, h / 2);
    });
    elementImages.push({ name: filename, dataUrl, bounds: { x: 0, y: 0, width: monthSize.w, height: monthSize.h }, type: 'IMG' });
  }

  // Generate DND icon for IMG_STATUS (DISTURB)
  const dndSize = 30;
  const dndDataUrl = createCanvasImage(dndSize, dndSize, (ctx, w) => {
    ctx.strokeStyle = '#FF6B6B';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(w / 2, w / 2, w * 0.35, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(w * 0.25, w / 2);
    ctx.lineTo(w * 0.75, w / 2);
    ctx.stroke();
  });
  elementImages.push({ name: 'dnd_30x30.png', dataUrl: dndDataUrl, bounds: { x: 0, y: 0, width: dndSize, height: dndSize }, type: 'IMG_STATUS' });

  // Generate Alarm icon for IMG_STATUS (CLOCK)
  const alarmSize = 30;
  const alarmDataUrl = createCanvasImage(alarmSize, alarmSize, (ctx, w) => {
    ctx.strokeStyle = '#FFD93D';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(w / 2, w * 0.55, w * 0.3, 0, Math.PI * 2);
    ctx.stroke();
    // Bell top
    ctx.beginPath();
    ctx.moveTo(w * 0.35, w * 0.25);
    ctx.lineTo(w / 2, w * 0.1);
    ctx.lineTo(w * 0.65, w * 0.25);
    ctx.stroke();
  });
  elementImages.push({ name: 'alarm_30x30.png', dataUrl: alarmDataUrl, bounds: { x: 0, y: 0, width: alarmSize, height: alarmSize }, type: 'IMG_STATUS' });

  // Generate static label icons for decorative IMG elements
  // Heart icon (24x20)
  const heartIconDataUrl = createCanvasImage(24, 20, (ctx, w, h) => {
    ctx.fillStyle = '#FF6B6B';
    ctx.font = `${Math.floor(h * 0.9)}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('\u2665', w / 2, h / 2);
  });
  elementImages.push({ name: 'icon_heart_24x20.png', dataUrl: heartIconDataUrl, bounds: { x: 0, y: 0, width: 24, height: 20 }, type: 'IMG' });

  // Steps icon (24x24) - shoe/footprint
  const stepsIconDataUrl = createCanvasImage(24, 24, (ctx, w, h) => {
    ctx.fillStyle = '#FFD93D';
    ctx.font = `${Math.floor(h * 0.7)}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('\u{1F463}', w / 2, h / 2);
  });
  elementImages.push({ name: 'icon_steps_24x24.png', dataUrl: stepsIconDataUrl, bounds: { x: 0, y: 0, width: 24, height: 24 }, type: 'IMG' });

  // Battery icon (24x14) - simple battery shape
  const battIconDataUrl = createCanvasImage(24, 14, (ctx, w, h) => {
    ctx.strokeStyle = '#00CC88';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(1, 2, w - 5, h - 4);
    ctx.fillStyle = '#00CC88';
    ctx.fillRect(w - 4, h * 0.3, 3, h * 0.4);
  });
  elementImages.push({ name: 'icon_batt_24x14.png', dataUrl: battIconDataUrl, bounds: { x: 0, y: 0, width: 24, height: 14 }, type: 'IMG' });

  // Generate bluetooth icon for IMG_STATUS
  const btSize = 30;
  const btDataUrl = createCanvasImage(btSize, btSize, (ctx, w) => {
    ctx.strokeStyle = '#4488FF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w * 0.35, w * 0.2);
    ctx.lineTo(w * 0.65, w * 0.4);
    ctx.lineTo(w * 0.5, w * 0.5);
    ctx.lineTo(w * 0.65, w * 0.6);
    ctx.lineTo(w * 0.35, w * 0.8);
    ctx.moveTo(w * 0.5, w * 0.2);
    ctx.lineTo(w * 0.5, w * 0.8);
    ctx.stroke();
  });
  elementImages.push({
    name: 'bluetooth_30x30.png',
    dataUrl: btDataUrl,
    bounds: { x: 0, y: 0, width: btSize, height: btSize },
    type: 'IMG_STATUS',
  });

  // Generate transparent button image (1x1 transparent PNG)
  const transpDataUrl = createCanvasImage(1, 1, () => {
    // Transparent - no drawing needed
  });
  elementImages.push({
    name: 'trasparente.png',
    dataUrl: transpDataUrl,
    bounds: { x: 0, y: 0, width: 1, height: 1 },
    type: 'BUTTON',
  });

  // Generate clock hand images for TIME_POINTER
  // Hour hand: shorter, wider (22x140, pivot at bottom-center: posX=11, posY=70)
  const hourHandDataUrl = createCanvasImage(22, 140, (ctx, w, h) => {
    ctx.fillStyle = '#CCCCCC';
    // Tapered hand shape
    ctx.beginPath();
    ctx.moveTo(w / 2 - 4, h);        // bottom-left
    ctx.lineTo(w / 2 - 1, 10);       // top-left narrow
    ctx.lineTo(w / 2, 0);            // tip
    ctx.lineTo(w / 2 + 1, 10);       // top-right narrow
    ctx.lineTo(w / 2 + 4, h);        // bottom-right
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#999999';
    ctx.lineWidth = 1;
    ctx.stroke();
  });
  elementImages.push({
    name: 'hour_hand.png',
    dataUrl: hourHandDataUrl,
    bounds: { x: 0, y: 0, width: 22, height: 140 },
    type: 'TIME_POINTER',
  });

  // Minute hand: longer, thinner (16x200, pivot at bottom-center: posX=8, posY=100)
  const minuteHandDataUrl = createCanvasImage(16, 200, (ctx, w, h) => {
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(w / 2 - 3, h);
    ctx.lineTo(w / 2 - 1, 10);
    ctx.lineTo(w / 2, 0);
    ctx.lineTo(w / 2 + 1, 10);
    ctx.lineTo(w / 2 + 3, h);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#AAAAAA';
    ctx.lineWidth = 1;
    ctx.stroke();
  });
  elementImages.push({
    name: 'minute_hand.png',
    dataUrl: minuteHandDataUrl,
    bounds: { x: 0, y: 0, width: 16, height: 200 },
    type: 'TIME_POINTER',
  });

  // Second hand: longest, thinnest, red (6x240, pivot at bottom-center: posX=3, posY=120)
  const secondHandDataUrl = createCanvasImage(6, 240, (ctx, w, h) => {
    ctx.fillStyle = '#FF3333';
    ctx.fillRect(w / 2 - 1, 0, 2, h);
    // Small circle at pivot
    ctx.beginPath();
    ctx.arc(w / 2, 120, 3, 0, Math.PI * 2);
    ctx.fill();
  });
  elementImages.push({
    name: 'second_hand.png',
    dataUrl: secondHandDataUrl,
    bounds: { x: 0, y: 0, width: 6, height: 240 },
    type: 'TIME_POINTER',
  });

  // Cover (center cap over hands) - small circle 30x30
  const coverDataUrl = createCanvasImage(30, 30, (ctx, w, h) => {
    ctx.fillStyle = '#888888';
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#AAAAAA';
    ctx.lineWidth = 2;
    ctx.stroke();
  });
  elementImages.push({
    name: 'hand_cover.png',
    dataUrl: coverDataUrl,
    bounds: { x: 0, y: 0, width: 30, height: 30 },
    type: 'TIME_POINTER',
  });

  // Generate 29 weather level icons for IMG_LEVEL (matches Brushed Steel reference count)
  const weatherSize = 40;
  const weatherSymbols = [
    '\u2600', '\u26C5', '\u2601', '\u{1F327}', '\u{1F329}', '\u2744', '\u{1F32B}', // sun, part-cloud, cloud, rain, thunder, snow, fog
    '\u2600', '\u26C5', '\u2601', '\u{1F327}', '\u{1F329}', '\u2744', '\u{1F32B}', // repeat
    '\u2600', '\u26C5', '\u2601', '\u{1F327}', '\u{1F329}', '\u2744', '\u{1F32B}', // repeat
    '\u2600', '\u26C5', '\u2601', '\u{1F327}', '\u{1F329}', '\u2744', '\u{1F32B}', // repeat
    '\u2600',  // one more to reach 29
  ];
  for (let i = 0; i < 29; i++) {
    const filename = `weather_${i}.png`;
    const symbol = weatherSymbols[i] || '\u2600';
    const dataUrl = createCanvasImage(weatherSize, weatherSize, (ctx, w, h) => {
      ctx.fillStyle = '#FFD700';
      ctx.font = `${Math.floor(h * 0.6)}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(symbol, w / 2, h / 2);
    });
    elementImages.push({
      name: filename,
      dataUrl,
      bounds: { x: 0, y: 0, width: weatherSize, height: weatherSize },
      type: 'IMG_LEVEL',
    });
  }

  // Generate background image for Background element
  const bgDataUrl = createCanvasImage(480, 480, (ctx, w, h) => {
    ctx.fillStyle = '#333333';
    ctx.fillRect(0, 0, w, h);
  });
  elementImages.push({
    name: 'background_ed15585c.png',
    dataUrl: bgDataUrl,
    bounds: { x: 0, y: 0, width: 480, height: 480 },
    type: 'IMG',
  });
  // Update Background element src for preview rendering
  const bgElement = elements.find(el => el.name === 'Background');
  if (bgElement) bgElement.src = bgDataUrl;

  // Generate static images for any remaining IMG-type elements with src
  elements
    .filter((el) => el.type === 'IMG' && el.src && el.name !== 'Background' && !el.name.toLowerCase().includes('time') && !el.name.toLowerCase().includes('weekday') && !el.name.toLowerCase().includes('date') && !el.name.toLowerCase().includes('month') && !el.name.toLowerCase().includes('icon'))
    .forEach((el) => {
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(el.bounds.width || 100, 200);
      canvas.height = Math.max(el.bounds.height || 100, 200);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = el.color || '#555555';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      const dataUrl = canvas.toDataURL('image/png');
      elementImages.push({
        name: el.src!,
        dataUrl,
        bounds: el.bounds,
        type: el.type,
      });
      el.src = dataUrl;
    });
  
  console.log('[Mock] Element images generated, total:', elementImages.length, 'images');

  const config: WatchFaceConfig = {
    name: `AI_WatchFace_${Date.now()}`,
    resolution,
    background: {
      src: 'bg.png',
      format: 'TGA-P',
    },
    elements,
    watchModel,
  };

  return { config, elementImages: elementImages };
}

function App() {
  const { state, dispatch } = useApp();
  const [watchModel, setWatchModel] = useState('Balance 2');
  const [watchFaceName, setWatchFaceName] = useState('');

  // AI Provider settings (persisted in localStorage)
  const [aiProvider, setAiProvider] = useState<AIProvider>(
    () => (localStorage.getItem('ai_provider') as AIProvider) || 'gemini'
  );
  const [aiApiKey, setAiApiKey] = useState(
    () => localStorage.getItem('ai_api_key') || ''
  );
  const [showApiKey, setShowApiKey] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [useMockAnalysis, setUseMockAnalysis] = useState(false);
  const [usePipeline, setUsePipeline] = useState(
    () => localStorage.getItem('use_pipeline') === 'true'
  );

  // Persist AI settings
  const handleSetAiProvider = (provider: AIProvider) => {
    setAiProvider(provider);
    localStorage.setItem('ai_provider', provider);
  };
  const handleSetApiKey = (key: string) => {
    setAiApiKey(key);
    localStorage.setItem('ai_api_key', key);
  };

  // Handle continue to analysis
  const handleAnalyze = useCallback(async () => {
    if (!state.backgroundImage || !state.fullDesignImage) {
      toast.error('Please upload both images');
      return;
    }

    dispatch(actions.setLoading(true));
    dispatch(actions.setLoadingMessage('Analyzing images with AI...'));
    dispatch(actions.setStep('analyzing'));

    try {
      let config: WatchFaceConfig;
      let elementImages: ElementImage[];

      if (useMockAnalysis || !aiApiKey) {
        // Fallback to mock analysis
        if (!aiApiKey && !useMockAnalysis) {
          toast.info('No API key set â€” using mock analysis. Open Settings to add your key.');
        }
        const result = await mockKimiAnalysis(
          state.backgroundImage,
          state.fullDesignImage,
          watchModel
        );
        config = result.config;
        elementImages = result.elementImages;
      } else if (usePipeline) {
        // â”€â”€â”€ Deterministic Pipeline Path â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        // AI extracts semantic data ONLY â†’ pipeline computes all geometry
        dispatch(actions.setLoadingMessage('Extracting elements with AI (pipeline mode)...'));
        const aiElements = await extractElementsFromImage(
          { provider: aiProvider as PipelineAIProvider, apiKey: aiApiKey },
          state.fullDesignFile!,
        );
        console.log('[App] Pipeline AI elements:', aiElements.length);

        dispatch(actions.setLoadingMessage('Running deterministic pipeline...'));
        const pipelineResult = await runPipeline(aiElements, {
          watchfaceName: watchFaceName?.trim() || `AI_WatchFace_${Date.now()}`,
          watchModel,
          backgroundSrc: 'background.png',
          aiConfig: { provider: aiProvider as PipelineAIProvider, apiKey: aiApiKey },
          onProgress: (msg) => dispatch(actions.setLoadingMessage(msg)),
        });

        // Pipeline returns both the WatchFaceConfig (with elements) and generated code
        config = pipelineResult.config;
        elementImages = generatePipelineAssets(pipelineResult.resolved);
        console.log('[App] Pipeline produced', config.elements.length, 'elements,', elementImages.length, 'asset images');
      } else {
        // â”€â”€â”€ Legacy AI Path (coordinates from AI) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        dispatch(actions.setLoadingMessage('Sending image to AI for analysis...'));
        const aiConfig: AIServiceConfig = { provider: aiProvider, apiKey: aiApiKey };
        const analysis = await analyzeWatchfaceImage(aiConfig, state.fullDesignFile!);
        
        console.log('[App] AI analysis result:', analysis.designDescription);
        console.log('[App] Complications:', analysis.complications.length);

        // Expand simplified AI analysis into full elements + Canvas-drawn assets
        dispatch(actions.setLoadingMessage('Generating elements and assets...'));
        const expanded = expandAnalysisToElements(analysis);
        elementImages = expanded.images;

        // Parse resolution from watch model
        const resolutions: Record<string, { width: number; height: number }> = {
          'Balance 2': { width: 480, height: 480 },
          'Balance': { width: 480, height: 480 },
          'Active Max': { width: 480, height: 480 },
          'Active 3 Premium': { width: 466, height: 466 },
          'Active 2 Round': { width: 466, height: 466 },
          'Active 2 Square': { width: 390, height: 450 },
          'Active': { width: 390, height: 450 },
          'Pop 3S (PIB)': { width: 410, height: 502 },
          'GTR4': { width: 466, height: 466 },
          'GTS4': { width: 390, height: 450 },
          'Cheetah Pro': { width: 466, height: 466 },
          'T-Rex 2': { width: 454, height: 454 },
          'Falcon': { width: 416, height: 416 },
        };
        const resolution = resolutions[watchModel] || { width: 480, height: 480 };

        config = {
          name: `AI_WatchFace_${Date.now()}`,
          resolution,
          background: { src: 'background.png', format: 'TGA-P' },
          elements: expanded.elements,
          watchModel,
        };
      }

      // Update state with results
      if (watchFaceName?.trim()) {
        config.name = watchFaceName.trim();
      }

      dispatch(actions.setWatchFaceConfig(config));
      dispatch(actions.setElementImages(elementImages));
      dispatch(actions.setStep('preview'));
      toast.success('Analysis complete!');
    } catch (error) {
      toast.error('Analysis failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
      dispatch(actions.setStep('upload'));
    } finally {
      dispatch(actions.setLoading(false));
    }
  }, [state.backgroundImage, state.fullDesignImage, watchModel, watchFaceName, usePipeline, aiProvider, aiApiKey, useMockAnalysis, dispatch]);

  // Handle generate ZPK
  const handleGenerate = useCallback(async () => {
    console.log('[App] handleGenerate called');
    
    if (!state.watchFaceConfig) {
      console.log('[App] ERROR: Missing watchFaceConfig');
      toast.error('Missing configuration');
      return;
    }
    
    if (!state.backgroundFile) {
      console.log('[App] ERROR: Missing backgroundFile');
      toast.error('Missing background file');
      return;
    }

    if (!state.githubToken) {
      console.log('[App] ERROR: Missing githubToken');
      toast.error('Please set your GitHub token in settings');
      return;
    }

    console.log('[App] All checks passed, starting generation...');
    console.log('[App] Background file:', state.backgroundFile.name, 'size:', state.backgroundFile.size);

    dispatch(actions.setLoading(true));
    dispatch(actions.setLoadingMessage('Generating ZPK file...'));
    dispatch(actions.setStep('generating'));

    try {
      // Build ZPK using File objects
      console.log('[App] Calling buildZPK...');
      
      // Convert elementImages from dataUrl to File objects
      const elementFiles = state.elementImages.map((img) => {
        console.log('[App] Converting element image to file:', img.name);
        
        // Parse data URL properly
        const parts = img.dataUrl.split(',');
        const mimeType = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
        const bstr = atob(parts[1]);
        const n = bstr.length;
        const u8arr = new Uint8Array(n);
        for (let i = 0; i < n; i++) {
          u8arr[i] = bstr.charCodeAt(i);
        }
        const blob = new Blob([u8arr], { type: mimeType });
        
        console.log('[App] Converted', img.name, 'size:', blob.size);
        return {
          src: img.name,
          file: new File([blob], img.name, { type: mimeType }),
        };
      });
      
      console.log('[App] Element files prepared:', { count: elementFiles.length, files: elementFiles.map(f => f.src) });
      
      if (elementFiles.length === 0) {
        console.warn('[App] WARNING: No element files were prepared!');
      }
      
      const zpkResult = await buildZPK({
        config: state.watchFaceConfig,
        backgroundFile: state.backgroundFile,
        elementFiles,
      });
      console.log('[App] ZPK built successfully, size:', zpkResult.size);

      dispatch(actions.setZpkBlob(zpkResult.blob));

      // Upload to GitHub with folder-based structure
      dispatch(actions.setLoadingMessage('Uploading to GitHub...'));

      const repoParts = state.githubRepo.split('/');
      const owner = repoParts[0];
      const repo = repoParts[1];
      
      console.log('[App] GitHub repo split:', { original: state.githubRepo, owner, repo, parts: repoParts });
      
      if (!owner || !repo || repoParts.length !== 2) {
        throw new Error(`Invalid GitHub repository format: "${state.githubRepo}". Expected format: "owner/repo"`);
      }

      // Step 1: Generate QR code with the expected GitHub Pages URL
      //  We use the watchface ID (timestamp-based) to create a predictable URL
      const watchfaceId = state.watchFaceConfig.name.replace(/\s+/g, '_');
      const expectedZpkUrl = `https://${owner}.github.io/${repo}/zpk/${watchfaceId}/face.zpk`;
      
      dispatch(actions.setLoadingMessage('Generating QR code...'));
      console.log('[App] Generating QR with expected URL:', expectedZpkUrl);
      const qrDataUrl = await generateQRCode(expectedZpkUrl);
      console.log('[App] QR code generated');

      // Step 2: Upload both ZPK and QR code to the same folder on GitHub
      console.log('[App] Starting folder-based upload (ZPK + QR)...');
      const uploadResult = await uploadZPKWithQR(
        {
          token: state.githubToken,
          owner,
          repo,
        },
        watchfaceId,
        zpkResult.blob,
        qrDataUrl,
        state.watchFaceConfig.name
      );

      if (!uploadResult.success) {
        console.error('[App] Upload error:', uploadResult.error);
        throw new Error(`GitHub upload failed: ${uploadResult.error || 'Unknown error'}`);
      }
      
      console.log('[App] Upload successful!');
      console.log('[App] ZPK URL:', uploadResult.downloadUrl);
      console.log('[App] QR URL:', uploadResult.qrUrl);

      dispatch(actions.setGithubUrl(uploadResult.downloadUrl || ''));
      dispatch(actions.setQrCode(qrDataUrl));

      dispatch(actions.setStep('success'));
      toast.success('Watch face created successfully!');
    } catch (error) {
      console.error('[App] Generation failed with error:', error);
      if (error instanceof Error) {
        console.error('[App] Error stack:', error.stack);
      }
      toast.error('Generation failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
      dispatch(actions.setStep('preview'));
    } finally {
      dispatch(actions.setLoading(false));
    }
  }, [state.watchFaceConfig, state.backgroundFile, state.githubToken, state.githubRepo, dispatch]);

  // Handle reset
  const handleReset = useCallback(() => {
    dispatch(actions.reset());
    setWatchFaceName('');
    toast.info('Started new watch face');
  }, [dispatch]);

  // Toggle element visibility
  const handleToggleElement = useCallback(
    (id: string) => {
      if (!state.watchFaceConfig) return;

      const updatedElements = state.watchFaceConfig.elements.map((el) =>
        el.id === id ? { ...el, visible: !el.visible } : el
      );

      dispatch(
        actions.setWatchFaceConfig({
          ...state.watchFaceConfig,
          elements: updatedElements,
        })
      );
    },
    [state.watchFaceConfig, dispatch]
  );

  // Render different steps
  const renderContent = () => {
    switch (state.currentStep) {
      case 'upload':
        return (
          <div className="space-y-6">
            {/* Watch Model & Name */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm text-zinc-300">Watch Model</Label>
                <select
                  value={watchModel}
                  onChange={(e) => setWatchModel(e.target.value)}
                  className="w-full h-10 px-3 rounded-md bg-[#0F0F0F] border border-zinc-700 text-white text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20"
                >
                  {/* User's requested models - Balance 2 as default */}
                  <option value="Balance 2">â­ Amazfit Balance 2 (480Ã—480)</option>
                  <option value="Balance">Amazfit Balance (480Ã—480)</option>
                  <option value="Active Max">Amazfit Active Max (480Ã—480)</option>
                  <option value="Active 3 Premium">Amazfit Active 3 Premium (466Ã—466)</option>
                  <option value="Active 2 Round">Amazfit Active 2 Round (466Ã—466)</option>
                  <option value="Active 2 Square">Amazfit Active 2 Square (390Ã—450)</option>
                  <option value="Active">Amazfit Active (390Ã—450)</option>
                  <option value="Pop 3S (PIB)">Amazfit Pop 3S / PIB (410Ã—502)</option>
                  {/* Original models */}
                  <option value="GTR4">Amazfit GTR 4 (466Ã—466)</option>
                  <option value="GTS4">Amazfit GTS 4 (390Ã—450)</option>
                  <option value="Cheetah Pro">Amazfit Cheetah Pro (466Ã—466)</option>
                  <option value="T-Rex 2">Amazfit T-Rex 2 (454Ã—454)</option>
                  <option value="Falcon">Amazfit Falcon (416Ã—416)</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-zinc-300">Watch Face Name (optional)</Label>
                <Input
                  value={watchFaceName}
                  onChange={(e) => setWatchFaceName(e.target.value.trim())}
                  placeholder="My Custom Watch Face"
                  className="bg-[#0F0F0F] border-zinc-700 text-white placeholder:text-zinc-600"
                />
              </div>
            </div>

            {/* AI Settings Panel */}
            <div className="border border-zinc-700 rounded-lg overflow-hidden">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="w-full flex items-center justify-between px-4 py-3 bg-[#141414] hover:bg-[#1A1A1A] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-zinc-400" />
                  <span className="text-sm font-medium text-zinc-300">AI Settings</span>
                  {aiApiKey ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-900/50 text-green-400">
                      {aiProvider === 'gemini' ? 'Gemini' : 'GPT-4o'} configured
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-900/50 text-yellow-400">
                      Mock mode
                    </span>
                  )}
                </div>
                <span className="text-zinc-500 text-xs">{showSettings ? 'â–²' : 'â–¼'}</span>
              </button>

              {showSettings && (
                <div className="px-4 py-4 space-y-4 border-t border-zinc-800">
                  {/* Provider selector */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-sm text-zinc-300">AI Provider</Label>
                      <select
                        value={aiProvider}
                        onChange={(e) => handleSetAiProvider(e.target.value as AIProvider)}
                        className="w-full h-10 px-3 rounded-md bg-[#0F0F0F] border border-zinc-700 text-white text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20"
                      >
                        <option value="gemini">Google Gemini 2.0 Flash (cheapest)</option>
                        <option value="openai">OpenAI GPT-4o (most reliable)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-zinc-300">API Key</Label>
                      <div className="relative">
                        <Input
                          type={showApiKey ? 'text' : 'password'}
                          value={aiApiKey}
                          onChange={(e) => handleSetApiKey(e.target.value)}
                          placeholder={aiProvider === 'gemini' ? 'AIza...' : 'sk-...'}
                          className="bg-[#0F0F0F] border-zinc-700 text-white placeholder:text-zinc-600 pr-20"
                        />
                        <div className="absolute right-1 top-1 flex gap-1">
                          <button
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="p-1.5 text-zinc-500 hover:text-zinc-300"
                          >
                            {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={async () => {
                              if (!aiApiKey) return;
                              const valid = await testApiKey({ provider: aiProvider, apiKey: aiApiKey });
                              toast[valid ? 'success' : 'error'](valid ? 'API key is valid!' : 'API key is invalid');
                            }}
                            className="px-2 py-1 text-xs rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                          >
                            Test
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mock mode toggle */}
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useMockAnalysis}
                        onChange={(e) => setUseMockAnalysis(e.target.checked)}
                        className="rounded border-zinc-600 bg-zinc-800 text-cyan-500 focus:ring-cyan-500/20"
                      />
                      <span className="text-sm text-zinc-400">Use mock analysis (no API call, demo data)</span>
                    </label>
                  </div>

                  {/* Pipeline mode toggle */}
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={usePipeline}
                        onChange={(e) => {
                          setUsePipeline(e.target.checked);
                          localStorage.setItem('use_pipeline', String(e.target.checked));
                        }}
                        className="rounded border-zinc-600 bg-zinc-800 text-emerald-500 focus:ring-emerald-500/20"
                      />
                      <span className="text-sm text-zinc-400">Use deterministic pipeline (AI for semantics only, no coordinates from AI)</span>
                    </label>
                  </div>

                  <p className="text-xs text-zinc-600">
                    {aiProvider === 'gemini'
                      ? 'Get your API key from Google AI Studio: aistudio.google.com/apikey'
                      : 'Get your API key from OpenAI: platform.openai.com/api-keys'}
                  </p>
                </div>
              )}
            </div>

            {/* Upload zones */}
            <div className="grid gap-4 sm:grid-cols-2">
              <UploadZone
                label="Background Image"
                sublabel="Clean 480Ã—480 background"
                value={state.backgroundImage}
                onChange={(img) => dispatch(actions.setBackgroundImage(img))}
                onFileChange={(file) => dispatch(actions.setBackgroundFile(file))}
                expectedWidth={480}
                expectedHeight={480}
              />
              <UploadZone
                label="Full Design"
                sublabel="Complete design with elements"
                value={state.fullDesignImage}
                onChange={(img) => dispatch(actions.setFullDesignImage(img))}
                onFileChange={(file) => dispatch(actions.setFullDesignFile(file))}
              />
            </div>

            {/* Continue button */}
            <Button
              onClick={handleAnalyze}
              disabled={!state.backgroundImage || !state.fullDesignImage}
              className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold disabled:opacity-50"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Analyze with AI
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        );

      case 'analyzing':
        return (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative mb-6">
              <div className="h-16 w-16 rounded-full border-4 border-zinc-800 border-t-cyan-500 animate-spin" />
              <Wand2 className="absolute inset-0 m-auto h-6 w-6 text-cyan-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Analyzing your design...</h3>
            <p className="text-zinc-500 text-center max-w-md">
              Our AI is detecting watch face elements, calculating positions, and preparing the configuration.
            </p>
          </div>
        );

      case 'preview':
        return (
          <div className="space-y-6">
            {state.backgroundImage && state.watchFaceConfig && (
              <>
                {/* Side-by-side: original design vs generated layout */}
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Original design preview (div-based) */}
                  <div className="flex flex-col items-center">
                    <h4 className="text-sm font-medium text-zinc-400 mb-4">Design Preview</h4>
                    <WatchPreview
                      backgroundImage={state.backgroundImage}
                      elements={state.watchFaceConfig.elements}
                      showBoundingBoxes={true}
                      className="w-full max-w-sm"
                    />
                  </div>

                  {/* Canvas-rendered geometry preview (what ZPK will produce) */}
                  <div className="flex flex-col items-center">
                    <h4 className="text-sm font-medium text-zinc-400 mb-4">Generated Layout</h4>
                    <CanvasWatchPreview
                      backgroundImage={state.backgroundImage}
                      elements={state.watchFaceConfig.elements}
                      className="w-full max-w-sm"
                    />
                    <p className="text-xs text-zinc-500 mt-2">Pixel-accurate widget positions</p>
                  </div>
                </div>

                {/* Elements list */}
                <div>
                  <h4 className="text-sm font-medium text-zinc-400 mb-4">Detected Elements</h4>
                  <ElementList
                    elements={state.watchFaceConfig.elements}
                    onToggleVisibility={handleToggleElement}
                  />
                </div>
              </>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 pt-4">
              <Button
                onClick={handleGenerate}
                className="flex-1 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Generate ZPK & Upload
              </Button>
              <Button
                onClick={() => dispatch(actions.setStep('upload'))}
                variant="outline"
                className="h-12 border-zinc-700 text-white hover:bg-zinc-800"
              >
                Back
              </Button>
            </div>
          </div>
        );

      case 'generating':
        return (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative mb-6">
              <div className="h-16 w-16 rounded-full border-4 border-zinc-800 border-t-green-500 animate-spin" />
              <RefreshCw className="absolute inset-0 m-auto h-6 w-6 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Building your watch face...</h3>
            <div className="w-full max-w-md mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                Converting images to TGA format
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                Generating JavaScript code
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <div className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
                Packaging ZPK file
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <div className="h-2 w-2 rounded-full bg-zinc-700" />
                Uploading to GitHub
              </div>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="space-y-6">
            {state.qrCodeDataUrl && state.githubUrl && (
              <QRDisplay
                qrCodeDataUrl={state.qrCodeDataUrl}
                githubUrl={state.githubUrl}
                zpkBlob={state.zpkBlob}
                filename={state.watchFaceConfig?.name + '.zpk'}
              />
            )}

            <Button
              onClick={handleReset}
              className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Create Another Watch Face
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      <Header />

      <main className="container mx-auto max-w-4xl px-4 py-6">
        {/* Step indicator */}
        <div className="mb-8">
          <StepIndicator currentStep={state.currentStep} />
        </div>

        {/* Main content card */}
        <div className="bg-[#1A1A1A] rounded-2xl border border-zinc-800 p-6">
          {renderContent()}
        </div>

        {/* Tips */}
        {state.currentStep === 'upload' && (
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="p-4 bg-[#1A1A1A] rounded-xl border border-zinc-800">
              <div className="text-2xl mb-2">ðŸŽ¨</div>
              <h4 className="text-sm font-medium text-white mb-1">Design in Gemini</h4>
              <p className="text-xs text-zinc-500">
                Create your watch face design using Gemini AI with detailed prompts.
              </p>
            </div>
            <div className="p-4 bg-[#1A1A1A] rounded-xl border border-zinc-800">
              <div className="text-2xl mb-2">ðŸ“¤</div>
              <h4 className="text-sm font-medium text-white mb-1">Upload Images</h4>
              <p className="text-xs text-zinc-500">
                Upload clean background and full design images for AI analysis.
              </p>
            </div>
            <div className="p-4 bg-[#1A1A1A] rounded-xl border border-zinc-800">
              <div className="text-2xl mb-2">âŒš</div>
              <h4 className="text-sm font-medium text-white mb-1">Install on Watch</h4>
              <p className="text-xs text-zinc-500">
                Scan the QR code with Zepp app to install your custom watch face.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Loading overlay */}
      <LoadingOverlay
        isVisible={state.isLoading}
        title={state.loadingMessage || 'Processing...'}
      />
    </div>
  );
}

export default App;

```

### FILE: `src/App.css`

```css
#root {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.react:hover {
  filter: drop-shadow(0 0 2em #61dafbaa);
}

@keyframes logo-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: no-preference) {
  a:nth-of-type(2) .logo {
    animation: logo-spin infinite 20s linear;
  }
}

.card {
  padding: 2em;
}

.read-the-docs {
  color: #888;
}

```

### FILE: `src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 6%;
    --foreground: 0 0% 100%;
    --card: 0 0% 10%;
    --card-foreground: 0 0% 100%;
    --popover: 0 0% 10%;
    --popover-foreground: 0 0% 100%;
    --primary: 190 100% 50%;
    --primary-foreground: 0 0% 0%;
    --secondary: 0 0% 14%;
    --secondary-foreground: 0 0% 100%;
    --muted: 0 0% 14%;
    --muted-foreground: 0 0% 63%;
    --accent: 190 100% 50%;
    --accent-foreground: 0 0% 0%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;
    --border: 0 0% 16%;
    --input: 0 0% 16%;
    --ring: 190 100% 50%;
    --radius: 0.75rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  
  html {
    scroll-behavior: smooth;
  }
  
  body {
    @apply bg-[#0F0F0F] text-white antialiased;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
  }
}

@layer utilities {
  /* Custom scrollbar */
  .scrollbar-thin::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  
  .scrollbar-thin::-webkit-scrollbar-track {
    background: #1A1A1A;
    border-radius: 3px;
  }
  
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background: #3A3A3A;
    border-radius: 3px;
  }
  
  .scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background: #4A4A4A;
  }

  /* Gradient text */
  .gradient-text {
    @apply bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent;
  }

  /* Glass effect */
  .glass {
    @apply bg-white/5 backdrop-blur-md border border-white/10;
  }

  /* Glow effects */
  .glow-cyan {
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
  }

  .glow-cyan-subtle {
    box-shadow: 0 0 30px rgba(0, 212, 255, 0.1);
  }

  /* Animation utilities */
  .animate-fade-in {
    animation: fadeIn 0.4s ease-out;
  }

  .animate-slide-up {
    animation: slideUp 0.4s ease-out;
  }

  .animate-pulse-slow {
    animation: pulse 3s ease-in-out infinite;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Selection styling */
::selection {
  background: rgba(0, 212, 255, 0.3);
  color: white;
}

/* Focus styling */
:focus-visible {
  outline: 2px solid #00D4FF;
  outline-offset: 2px;
}

/* Input autofill styling */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus {
  -webkit-text-fill-color: white;
  -webkit-box-shadow: 0 0 0px 1000px #0F0F0F inset;
  transition: background-color 5000s ease-in-out 0s;
}

```

### FILE: `src/context/AppContext.tsx`

```tsx
// Global App State Context

import React, { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { AppState, AppStep, WatchFaceConfig, GeneratedCode, ElementImage } from '@/types';

// Initial state
const initialState: AppState = {
  currentStep: 'upload',
  backgroundImage: null,
  backgroundFile: null,
  fullDesignImage: null,
  fullDesignFile: null,
  watchFaceConfig: null,
  elementImages: [],
  generatedCode: null,
  zpkBlob: null,
  githubUrl: null,
  qrCodeDataUrl: null,
  isLoading: false,
  loadingMessage: '',
  error: null,
  githubToken: localStorage.getItem('githubToken') || '',
  githubRepo: localStorage.getItem('githubRepo') || 'AI-ERP-ITE/Watch-Faces',
};

// Action types
type Action =
  | { type: 'SET_STEP'; payload: AppStep }
  | { type: 'SET_BACKGROUND_IMAGE'; payload: string | null }
  | { type: 'SET_BACKGROUND_FILE'; payload: File | null }
  | { type: 'SET_FULL_DESIGN_IMAGE'; payload: string | null }
  | { type: 'SET_FULL_DESIGN_FILE'; payload: File | null }
  | { type: 'SET_WATCH_FACE_CONFIG'; payload: WatchFaceConfig | null }
  | { type: 'SET_ELEMENT_IMAGES'; payload: ElementImage[] }
  | { type: 'SET_GENERATED_CODE'; payload: GeneratedCode | null }
  | { type: 'SET_ZPK_BLOB'; payload: Blob | null }
  | { type: 'SET_GITHUB_URL'; payload: string | null }
  | { type: 'SET_QR_CODE'; payload: string | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_LOADING_MESSAGE'; payload: string }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_GITHUB_TOKEN'; payload: string }
  | { type: 'SET_GITHUB_REPO'; payload: string }
  | { type: 'RESET' };

// Reducer
function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    case 'SET_BACKGROUND_IMAGE':
      return { ...state, backgroundImage: action.payload };
    case 'SET_BACKGROUND_FILE':
      return { ...state, backgroundFile: action.payload };
    case 'SET_FULL_DESIGN_IMAGE':
      return { ...state, fullDesignImage: action.payload };
    case 'SET_FULL_DESIGN_FILE':
      return { ...state, fullDesignFile: action.payload };
    case 'SET_WATCH_FACE_CONFIG':
      return { ...state, watchFaceConfig: action.payload };
    case 'SET_ELEMENT_IMAGES':
      return { ...state, elementImages: action.payload };
    case 'SET_GENERATED_CODE':
      return { ...state, generatedCode: action.payload };
    case 'SET_ZPK_BLOB':
      return { ...state, zpkBlob: action.payload };
    case 'SET_GITHUB_URL':
      return { ...state, githubUrl: action.payload };
    case 'SET_QR_CODE':
      return { ...state, qrCodeDataUrl: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_LOADING_MESSAGE':
      return { ...state, loadingMessage: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_GITHUB_TOKEN':
      localStorage.setItem('githubToken', action.payload);
      return { ...state, githubToken: action.payload };
    case 'SET_GITHUB_REPO':
      localStorage.setItem('githubRepo', action.payload);
      return { ...state, githubRepo: action.payload };
    case 'RESET':
      return {
        ...initialState,
        githubToken: state.githubToken,
        githubRepo: state.githubRepo,
      };
    default:
      return state;
  }
}

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// Hook
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// Action helpers
export const actions = {
  setStep: (step: AppStep) => ({ type: 'SET_STEP' as const, payload: step }),
  setBackgroundImage: (image: string | null) => ({ type: 'SET_BACKGROUND_IMAGE' as const, payload: image }),
  setBackgroundFile: (file: File | null) => ({ type: 'SET_BACKGROUND_FILE' as const, payload: file }),
  setFullDesignImage: (image: string | null) => ({ type: 'SET_FULL_DESIGN_IMAGE' as const, payload: image }),
  setFullDesignFile: (file: File | null) => ({ type: 'SET_FULL_DESIGN_FILE' as const, payload: file }),
  setWatchFaceConfig: (config: WatchFaceConfig | null) => ({ type: 'SET_WATCH_FACE_CONFIG' as const, payload: config }),
  setElementImages: (images: ElementImage[]) => ({ type: 'SET_ELEMENT_IMAGES' as const, payload: images }),
  setGeneratedCode: (code: GeneratedCode | null) => ({ type: 'SET_GENERATED_CODE' as const, payload: code }),
  setZpkBlob: (blob: Blob | null) => ({ type: 'SET_ZPK_BLOB' as const, payload: blob }),
  setGithubUrl: (url: string | null) => ({ type: 'SET_GITHUB_URL' as const, payload: url }),
  setQrCode: (dataUrl: string | null) => ({ type: 'SET_QR_CODE' as const, payload: dataUrl }),
  setLoading: (loading: boolean) => ({ type: 'SET_LOADING' as const, payload: loading }),
  setLoadingMessage: (message: string) => ({ type: 'SET_LOADING_MESSAGE' as const, payload: message }),
  setError: (error: string | null) => ({ type: 'SET_ERROR' as const, payload: error }),
  setGithubToken: (token: string) => ({ type: 'SET_GITHUB_TOKEN' as const, payload: token }),
  setGithubRepo: (repo: string) => ({ type: 'SET_GITHUB_REPO' as const, payload: repo }),
  reset: () => ({ type: 'RESET' as const }),
};

```

### FILE: `src/hooks/use-mobile.ts`

```typescript
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

```


## REACT COMPONENTS (src/components/)

### FILE: `src/components/CanvasWatchPreview.tsx`

```tsx
import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { WatchFaceElement } from '@/types';

const CANVAS_SIZE = 480;
const CX = 240;
const CY = 240;

// Mock time: 10:10:30 â€” visually balanced, classic watchface demo pose
const MOCK_HOUR = 10;
const MOCK_MINUTE = 10;
const MOCK_SECOND = 30;

interface CanvasWatchPreviewProps {
  backgroundImage?: string;
  elements: WatchFaceElement[];
  className?: string;
}

export function CanvasWatchPreview({
  backgroundImage,
  elements,
  className,
}: CanvasWatchPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // If we have a background image, load it first then draw elements on top
    if (backgroundImage) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        drawBackground(ctx, img);
        drawElements(ctx, elements);
      };
      img.src = backgroundImage;
    } else {
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      drawBlackCircle(ctx);
      drawElements(ctx, elements);
    }
  }, [backgroundImage, elements]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_SIZE}
      height={CANVAS_SIZE}
      className={cn('rounded-full shadow-2xl', className)}
      style={{
        maxWidth: '100%',
        height: 'auto',
        boxShadow: '0 0 60px rgba(0, 212, 255, 0.15), inset 0 0 30px rgba(0, 0, 0, 0.5)',
      }}
    />
  );
}

// â”€â”€â”€ Background â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function drawBlackCircle(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(CX, CY, CX, 0, Math.PI * 2);
  ctx.fillStyle = '#111111';
  ctx.fill();
  ctx.restore();
}

function drawBackground(ctx: CanvasRenderingContext2D, img: HTMLImageElement) {
  // Clip to circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(CX, CY, CX, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
  ctx.restore();
}

// â”€â”€â”€ Element Dispatcher â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function drawElements(ctx: CanvasRenderingContext2D, elements: WatchFaceElement[]) {
  // Sort by zIndex for correct layering
  const sorted = [...elements].filter(e => e.visible).sort((a, b) => a.zIndex - b.zIndex);

  for (const el of sorted) {
    switch (el.type) {
      case 'ARC_PROGRESS':
        drawArc(ctx, el);
        break;
      case 'TIME_POINTER':
        drawTimePointer(ctx, el);
        break;
      default:
        // IMG_TIME, IMG_DATE, IMG_WEEK, TEXT, TEXT_IMG, IMG, IMG_STATUS, IMG_LEVEL
        drawPlaceholder(ctx, el);
        break;
    }
  }
}

// â”€â”€â”€ ARC_PROGRESS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function drawArc(ctx: CanvasRenderingContext2D, el: WatchFaceElement) {
  const cx = el.center?.x ?? CX;
  const cy = el.center?.y ?? CY;
  const radius = el.radius ?? 100;
  const startDeg = el.startAngle ?? 135;
  const endDeg = el.endAngle ?? 345;
  const lineWidth = el.lineWidth ?? 8;
  const color = parseZeppColor(el.color ?? '0x00FF00');

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, degToRad(startDeg), degToRad(endDeg));
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Draw data type label at arc midpoint
  if (el.dataType) {
    const midDeg = (startDeg + endDeg) / 2;
    const labelR = radius + 16;
    const lx = cx + labelR * Math.cos(degToRad(midDeg));
    const ly = cy + labelR * Math.sin(degToRad(midDeg));

    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(el.dataType, lx, ly);
  }
  ctx.restore();
}

// â”€â”€â”€ TIME_POINTER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function drawTimePointer(ctx: CanvasRenderingContext2D, el: WatchFaceElement) {
  const cx = el.pointerCenter?.x ?? el.center?.x ?? CX;
  const cy = el.pointerCenter?.y ?? el.center?.y ?? CY;

  // Angular positions for mock time 10:10:30
  const hourAngle = ((MOCK_HOUR % 12) + MOCK_MINUTE / 60) * 30 - 90;   // degrees
  const minuteAngle = MOCK_MINUTE * 6 - 90;
  const secondAngle = MOCK_SECOND * 6 - 90;

  // Hand lengths (proportional to real hardware assets)
  drawHand(ctx, cx, cy, 65, 10, hourAngle, '#CCCCCC');    // hour: short + thick
  drawHand(ctx, cx, cy, 95, 7, minuteAngle, '#FFFFFF');    // minute: long + medium
  drawHand(ctx, cx, cy, 115, 2, secondAngle, '#FF4444');   // second: longest + thin

  // Center cap
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.restore();
}

function drawHand(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  length: number, width: number,
  angleDeg: number,
  color: string,
) {
  const rad = degToRad(angleDeg);
  const tipX = cx + length * Math.cos(rad);
  const tipY = cy + length * Math.sin(rad);
  const tailX = cx - (length * 0.2) * Math.cos(rad);
  const tailY = cy - (length * 0.2) * Math.sin(rad);

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(tailX, tailY);
  ctx.lineTo(tipX, tipY);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.restore();
}

// â”€â”€â”€ Placeholder (rectangles for IMG_TIME, TEXT, etc.) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function drawPlaceholder(ctx: CanvasRenderingContext2D, el: WatchFaceElement) {
  const { x, y, width, height } = el.bounds;

  ctx.save();

  // Semi-transparent box
  ctx.fillStyle = 'rgba(0, 200, 255, 0.08)';
  ctx.strokeStyle = 'rgba(0, 200, 255, 0.3)';
  ctx.lineWidth = 1;
  ctx.fillRect(x, y, width, height);
  ctx.strokeRect(x, y, width, height);

  // Label
  const label = formatLabel(el);
  ctx.font = '10px monospace';
  ctx.fillStyle = 'rgba(0, 200, 255, 0.7)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + width / 2, y + height / 2, width - 4);

  ctx.restore();
}

function formatLabel(el: WatchFaceElement): string {
  // Show meaningful label based on widget name
  const name = el.name.toLowerCase();
  if (name.includes('time')) return '10:10';
  if (name.includes('date')) return '08';
  if (name.includes('month')) return 'APR';
  if (name.includes('week')) return 'TUE';
  if (name.includes('weather')) return 'â˜€ 24Â°';
  if (el.dataType) return el.dataType;
  return el.name;
}

// â”€â”€â”€ Utilities â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Convert Zepp hex color '0xRRGGBB' to CSS '#RRGGBB' */
function parseZeppColor(zeppHex: string): string {
  if (zeppHex.startsWith('0x') || zeppHex.startsWith('0X')) {
    return '#' + zeppHex.slice(2).padStart(6, '0');
  }
  return zeppHex;
}

```

### FILE: `src/components/ElementList.tsx`

```tsx
import { cn } from '@/lib/utils';
import type { WatchFaceElement } from '@/types';
import { Eye, EyeOff, GripVertical } from 'lucide-react';

interface ElementListProps {
  elements: WatchFaceElement[];
  onToggleVisibility?: (id: string) => void;
  onReorder?: (elements: WatchFaceElement[]) => void;
  className?: string;
}

export function ElementList({
  elements,
  onToggleVisibility,
  onReorder,
  className,
}: ElementListProps) {
  const getElementIcon = (type: string) => {
    switch (type) {
      case 'TIME_POINTER':
        return 'ðŸ•';
      case 'IMG_LEVEL':
        return 'ðŸ“Š';
      case 'TEXT':
        return 'ðŸ“';
      case 'IMG':
        return 'ðŸ–¼ï¸';
      case 'ARC_PROGRESS':
        return 'â­•';
      default:
        return 'âš™ï¸';
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <h4 className="text-sm font-medium text-zinc-400 mb-3">
        Detected Elements ({elements.length})
      </h4>
      
      <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
        {elements.map((element) => (
          <div
            key={element.id}
            className={cn(
              'group flex items-center gap-3 p-2.5 rounded-lg bg-[#1A1A1A] border border-zinc-800',
              'hover:border-zinc-700 transition-all'
            )}
          >
            {/* Drag handle */}
            {onReorder && (
              <button className="text-zinc-600 hover:text-zinc-400 cursor-grab active:cursor-grabbing">
                <GripVertical className="h-4 w-4" />
              </button>
            )}

            {/* Element icon */}
            <span className="text-lg">{getElementIcon(element.type)}</span>

            {/* Element info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {element.name}
              </p>
              <p className="text-xs text-zinc-500">
                {element.type}
                {element.subtype && ` â€¢ ${element.subtype}`}
              </p>
            </div>

            {/* Position info */}
            <div className="text-xs text-zinc-600 hidden sm:block">
              {element.bounds.x}, {element.bounds.y}
            </div>

            {/* Visibility toggle */}
            {onToggleVisibility && (
              <button
                onClick={() => onToggleVisibility(element.id)}
                className={cn(
                  'p-1.5 rounded-md transition-colors',
                  element.visible
                    ? 'text-cyan-500 hover:bg-cyan-500/10'
                    : 'text-zinc-600 hover:bg-zinc-800'
                )}
              >
                {element.visible ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
        ))}
      </div>

      {elements.length === 0 && (
        <div className="text-center py-8 text-zinc-500">
          <p className="text-sm">No elements detected yet</p>
          <p className="text-xs mt-1">Upload images to analyze</p>
        </div>
      )}
    </div>
  );
}

```

### FILE: `src/components/Header.tsx`

```tsx
import { useState } from 'react';
import { Watch, Settings, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp, actions } from '@/context/AppContext';
import { testGitHubConnection } from '@/lib/githubApi';
import { toast } from 'sonner';

export function Header() {
  const { state, dispatch } = useApp();
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<boolean | null>(null);

  const handleTestConnection = async () => {
    if (!state.githubToken) {
      toast.error('Please enter your GitHub token first');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const [owner, repo] = state.githubRepo.split('/');
    const success = await testGitHubConnection({
      token: state.githubToken,
      owner,
      repo,
    });

    setTestResult(success);
    setIsTesting(false);

    if (success) {
      toast.success('GitHub connection successful!');
    } else {
      toast.error('GitHub connection failed. Check your token and repo name.');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-[#0F0F0F]/80 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
            <Watch className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold text-white leading-tight">
              Watch Face Creator
            </span>
            <span className="text-xs text-zinc-500 hidden sm:block">
              AI-Powered ZeppOS Designer
            </span>
          </div>
        </div>

        {/* Settings */}
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#1A1A1A] border-zinc-800 text-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">GitHub Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              {/* Token */}
              <div className="space-y-2">
                <Label htmlFor="token" className="text-sm text-zinc-300">
                  GitHub Token
                </Label>
                <Input
                  id="token"
                  type="password"
                  value={state.githubToken}
                  onChange={(e) => {
                    dispatch(actions.setGithubToken(e.target.value));
                    setTestResult(null);
                  }}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  className="bg-[#0F0F0F] border-zinc-700 text-white placeholder:text-zinc-600 focus:border-cyan-500 focus:ring-cyan-500/20"
                />
                <p className="text-xs text-zinc-500">
                  Create a token with 'repo' scope at{' '}
                  <a
                    href="https://github.com/settings/tokens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-500 hover:underline"
                  >
                    github.com/settings/tokens
                  </a>
                </p>
              </div>

              {/* Repo */}
              <div className="space-y-2">
                <Label htmlFor="repo" className="text-sm text-zinc-300">
                  Repository
                </Label>
                <Input
                  id="repo"
                  value={state.githubRepo}
                  onChange={(e) => {
                    dispatch(actions.setGithubRepo(e.target.value));
                    setTestResult(null);
                  }}
                  placeholder="username/repo-name"
                  className="bg-[#0F0F0F] border-zinc-700 text-white placeholder:text-zinc-600 focus:border-cyan-500 focus:ring-cyan-500/20"
                />
                <p className="text-xs text-zinc-500">
                  Format: owner/repo-name (e.g., AI-ERP-ITE/Watch-Faces)
                </p>
              </div>

              {/* Test Connection Button */}
              <Button
                onClick={handleTestConnection}
                disabled={isTesting || !state.githubToken}
                variant="outline"
                className="w-full border-zinc-700 text-white hover:bg-zinc-800"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : testResult === true ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    Connected!
                  </>
                ) : testResult === false ? (
                  <>
                    <XCircle className="h-4 w-4 mr-2 text-red-500" />
                    Connection Failed
                  </>
                ) : (
                  'Test Connection'
                )}
              </Button>

              {/* Instructions */}
              <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                <p className="text-xs text-zinc-400">
                  <strong className="text-zinc-300">Your ZPK files will be uploaded to:</strong>
                  <br />
                  https://{state.githubRepo.split('/')[0]}.github.io/
                  {state.githubRepo.split('/')[1]}/
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}

```

### FILE: `src/components/LoadingOverlay.tsx`

```tsx
import { cn } from '@/lib/utils';
import { Loader2, CheckCircle, Circle } from 'lucide-react';

interface LoadingTask {
  label: string;
  status: 'pending' | 'in-progress' | 'completed';
}

interface LoadingOverlayProps {
  isVisible: boolean;
  title: string;
  message?: string;
  progress?: number;
  tasks?: LoadingTask[];
  className?: string;
}

export function LoadingOverlay({
  isVisible,
  title,
  message,
  progress,
  tasks,
  className,
}: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm',
        className
      )}
    >
      <div className="w-full max-w-md mx-4 p-6 bg-[#1A1A1A] rounded-2xl border border-zinc-800">
        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative">
            <Loader2 className="h-6 w-6 text-cyan-500 animate-spin" />
          </div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>

        {/* Progress bar */}
        {progress !== undefined && (
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-zinc-400">Progress</span>
              <span className="text-cyan-500 font-medium">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Message */}
        {message && (
          <p className="text-sm text-zinc-400 mb-4">{message}</p>
        )}

        {/* Tasks list */}
        {tasks && tasks.length > 0 && (
          <div className="space-y-2">
            {tasks.map((task, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-center gap-3 p-2.5 rounded-lg transition-all',
                  task.status === 'in-progress' && 'bg-cyan-500/10',
                  task.status === 'completed' && 'bg-green-500/10'
                )}
              >
                {task.status === 'completed' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : task.status === 'in-progress' ? (
                  <Loader2 className="h-4 w-4 text-cyan-500 animate-spin" />
                ) : (
                  <Circle className="h-4 w-4 text-zinc-600" />
                )}
                <span
                  className={cn(
                    'text-sm',
                    task.status === 'completed' && 'text-green-400',
                    task.status === 'in-progress' && 'text-cyan-400',
                    task.status === 'pending' && 'text-zinc-500'
                  )}
                >
                  {task.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

```

### FILE: `src/components/QRDisplay.tsx`

```tsx
import { Download, Share2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, downloadBlob } from '@/lib/utils';
import { downloadQRCode } from '@/lib/qrGenerator';
import { toast } from 'sonner';

interface QRDisplayProps {
  qrCodeDataUrl: string;
  githubUrl: string;
  zpkBlob?: Blob | null;
  filename?: string;
  className?: string;
}

export function QRDisplay({
  qrCodeDataUrl,
  githubUrl,
  zpkBlob,
  filename = 'watchface.zpk',
  className,
}: QRDisplayProps) {
  const handleDownloadQR = () => {
    try {
      console.log('[QRDisplay] Starting QR code download');
      downloadQRCode(qrCodeDataUrl, filename.replace('.zpk', '-qr.png'));
      toast.success('QR code saved successfully!');
    } catch (error) {
      console.error('[QRDisplay] QR download error:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to download QR code: ${message}`);
    }
  };

  const handleDownloadZPK = () => {
    try {
      if (!zpkBlob) {
        throw new Error('ZPK file is not available');
      }
      console.log('[QRDisplay] Starting ZPK download', { filename, size: zpkBlob.size });
      downloadBlob(zpkBlob, filename);
      toast.success('Watch face saved successfully!');
    } catch (error) {
      console.error('[QRDisplay] ZPK download error:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to download watch face: ${message}`);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Custom Watch Face',
          text: 'Check out this custom watch face I created!',
          url: githubUrl,
        });
      } catch (error) {
        // User cancelled or share failed
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(githubUrl);
    }
  };

  return (
    <div className={cn('flex flex-col items-center gap-6', className)}>
      {/* Success indicator */}
      <div className="flex items-center gap-2 text-green-500">
        <CheckCircle className="h-5 w-5" />
        <span className="text-sm font-medium">Watch face created successfully!</span>
      </div>

      {/* QR Code */}
      <div className="relative">
        <div
          className="p-4 bg-white rounded-2xl shadow-xl"
          style={{
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          }}
        >
          <img
            src={qrCodeDataUrl}
            alt="QR Code for watch face installation"
            className="w-64 h-64"
          />
        </div>
        
        {/* Decorative ring */}
        <div
          className="absolute -inset-3 rounded-3xl border-2 border-cyan-500/20 pointer-events-none"
        />
      </div>

      {/* Instructions */}
      <div className="text-center space-y-1">
        <p className="text-white font-medium">Scan with Zepp app</p>
        <p className="text-zinc-500 text-sm">
          Open Zepp app â†’ Profile â†’ My Devices â†’ Watch Faces â†’ Scan QR
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap justify-center gap-3">
        <Button
          onClick={handleDownloadQR}
          variant="outline"
          className="border-zinc-700 text-white hover:bg-zinc-800 hover:border-cyan-500"
        >
          <Download className="h-4 w-4 mr-2" />
          Save QR
        </Button>
        
        {zpkBlob && (
          <Button
            onClick={handleDownloadZPK}
            variant="outline"
            className="border-zinc-700 text-white hover:bg-zinc-800 hover:border-cyan-500"
          >
            <Download className="h-4 w-4 mr-2" />
            Download ZPK
          </Button>
        )}
        
        <Button
          onClick={handleShare}
          variant="outline"
          className="border-zinc-700 text-white hover:bg-zinc-800 hover:border-cyan-500"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </div>

      {/* URL display */}
      <div className="w-full max-w-md">
        <p className="text-xs text-zinc-500 mb-1.5">Installation URL</p>
        <div className="flex items-center gap-2 p-3 bg-[#1A1A1A] rounded-lg border border-zinc-800">
          <code className="flex-1 text-xs text-zinc-400 truncate">
            {githubUrl}
          </code>
          <button
            onClick={() => navigator.clipboard.writeText(githubUrl)}
            className="text-xs text-cyan-500 hover:text-cyan-400 transition-colors"
          >
            Copy
          </button>
        </div>
      </div>
    </div>
  );
}

```

### FILE: `src/components/StepIndicator.tsx`

```tsx
import { cn } from '@/lib/utils';
import type { AppStep } from '@/types';
import { Upload, Sparkles, Eye, CheckCircle, Loader2 } from 'lucide-react';

interface Step {
  id: AppStep;
  label: string;
  icon: React.ElementType;
}

const steps: Step[] = [
  { id: 'upload', label: 'Upload', icon: Upload },
  { id: 'analyzing', label: 'Analyze', icon: Sparkles },
  { id: 'preview', label: 'Preview', icon: Eye },
  { id: 'generating', label: 'Generate', icon: Loader2 },
  { id: 'success', label: 'Success', icon: CheckCircle },
];

interface StepIndicatorProps {
  currentStep: AppStep;
  className?: string;
}

export function StepIndicator({ currentStep, className }: StepIndicatorProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className={cn('w-full', className)}>
      {/* Desktop: Horizontal steps */}
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300',
                    isCompleted && 'bg-green-500 border-green-500 text-black',
                    isCurrent && 'border-cyan-500 text-cyan-500 shadow-lg shadow-cyan-500/20',
                    !isCompleted && !isCurrent && 'border-zinc-700 text-zinc-600'
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Icon className={cn('h-5 w-5', isCurrent && 'animate-pulse')} />
                  )}
                </div>
                <span
                  className={cn(
                    'mt-2 text-xs font-medium transition-colors',
                    isCompleted && 'text-green-500',
                    isCurrent && 'text-cyan-500',
                    !isCompleted && !isCurrent && 'text-zinc-600'
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'w-12 h-0.5 mx-2 transition-colors',
                    index < currentIndex ? 'bg-green-500' : 'bg-zinc-800'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: Simple progress */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-zinc-400">
            Step {currentIndex + 1} of {steps.length}
          </span>
          <span className="text-sm font-medium text-cyan-500">
            {steps[currentIndex]?.label}
          </span>
        </div>
        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
            style={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

```

### FILE: `src/components/UploadZone.tsx`

```tsx
import { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { cn, fileToObjectUrl } from '@/lib/utils';

interface UploadZoneProps {
  label: string;
  sublabel: string;
  value: string | null;
  onChange: (objectUrl: string | null) => void;
  onFileChange?: (file: File | null) => void;
  expectedWidth?: number;
  expectedHeight?: number;
  className?: string;
}

export function UploadZone({
  label,
  sublabel,
  value,
  onChange,
  onFileChange,
  expectedWidth,
  expectedHeight,
  className,
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        return;
      }

      try {
        // Use object URL instead of data URL (much more efficient for large images)
        const objectUrl = fileToObjectUrl(file);
        onChange(objectUrl);
        onFileChange?.(file);

        // Get image dimensions
        const img = new Image();
        img.onload = () => {
          setDimensions({ width: img.width, height: img.height });
        };
        img.src = objectUrl;
      } catch (error) {
        console.error('Failed to load image:', error);
      }
    },
    [onChange, onFileChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleClear = useCallback(() => {
    // Revoke object URL to free memory
    if (value) {
      URL.revokeObjectURL(value);
    }
    onChange(null);
    onFileChange?.(null);
    setDimensions(null);
  }, [onChange, onFileChange, value]);

  const showDimensionWarning =
    dimensions &&
    expectedWidth &&
    expectedHeight &&
    (dimensions.width !== expectedWidth || dimensions.height !== expectedHeight);

  if (value) {
    return (
      <div className={cn('relative group', className)}>
        <div className="relative aspect-square overflow-hidden rounded-xl border border-zinc-700 bg-[#1A1A1A]">
          <img
            src={value}
            alt={label}
            className="h-full w-full object-contain"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleInputChange}
                className="hidden"
              />
              <span className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm text-white transition-colors">
                Replace
              </span>
            </label>
            <button
              onClick={handleClear}
              className="px-4 py-2 bg-red-600/80 hover:bg-red-600 rounded-lg text-sm text-white transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white">{label}</p>
            {dimensions && (
              <p className="text-xs text-zinc-500">
                {dimensions.width} Ã— {dimensions.height}px
              </p>
            )}
          </div>
          {showDimensionWarning && (
            <span className="text-xs text-amber-500">
              Expected {expectedWidth}Ã—{expectedHeight}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <label
      className={cn(
        'relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 transition-all cursor-pointer',
        isDragging
          ? 'border-cyan-500 bg-cyan-500/5 scale-[1.02]'
          : 'border-zinc-700 bg-[#1A1A1A] hover:border-zinc-600 hover:bg-zinc-800/50',
        className
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800">
        {isDragging ? (
          <ImageIcon className="h-6 w-6 text-cyan-500" />
        ) : (
          <Upload className="h-6 w-6 text-zinc-400" />
        )}
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-zinc-500 mt-0.5">{sublabel}</p>
        {expectedWidth && expectedHeight && (
          <p className="text-xs text-zinc-600 mt-1">
            Recommended: {expectedWidth}Ã—{expectedHeight}px
          </p>
        )}
      </div>
    </label>
  );
}

```

### FILE: `src/components/WatchPreview.tsx`

```tsx
import { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import type { WatchFaceElement } from '@/types';

interface WatchPreviewProps {
  backgroundImage: string;
  elements: WatchFaceElement[];
  className?: string;
  showBoundingBoxes?: boolean;
  onElementClick?: (element: WatchFaceElement) => void;
}

export function WatchPreview({
  backgroundImage,
  elements,
  className,
  showBoundingBoxes = false,
  onElementClick,
}: WatchPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Calculate scale to fit container
  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      const containerSize = Math.min(container.clientWidth, container.clientHeight);
      setScale(containerSize / 480);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative flex items-center justify-center overflow-hidden',
        className
      )}
    >
      {/* Watch face container */}
      <div
        className="relative rounded-full overflow-hidden shadow-2xl"
        style={{
          width: 480 * scale,
          height: 480 * scale,
          boxShadow: '0 0 60px rgba(0, 212, 255, 0.15), inset 0 0 30px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Background image */}
        <img
          src={backgroundImage}
          alt="Watch face background"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Elements overlay */}
        {elements
          .filter((el) => el.visible)
          .map((element) => (
            <div
              key={element.id}
              className={cn(
                'absolute cursor-pointer transition-all',
                showBoundingBoxes && 'ring-2 ring-cyan-500/50 hover:ring-cyan-400'
              )}
              style={{
                left: element.bounds.x * scale,
                top: element.bounds.y * scale,
                width: element.bounds.width * scale,
                height: element.bounds.height * scale,
                zIndex: element.zIndex,
              }}
              onClick={() => onElementClick?.(element)}
            >
              {element.src && (
                <img
                  src={element.src}
                  alt={element.name}
                  className="w-full h-full object-contain"
                  style={{
                    transformOrigin: `${(element.center?.x || 0) - element.bounds.x}px ${(element.center?.y || 0) - element.bounds.y}px`,
                  }}
                />
              )}
              {showBoundingBoxes && (
                <div className="absolute -top-5 left-0 bg-cyan-500 text-black text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap">
                  {element.name}
                </div>
              )}
            </div>
          ))}

        {/* Watch bezel overlay */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.3)',
            border: '3px solid rgba(255, 255, 255, 0.1)',
          }}
        />
      </div>
    </div>
  );
}

// Simplified preview for small displays
interface MiniWatchPreviewProps {
  backgroundImage: string;
  className?: string;
}

export function MiniWatchPreview({ backgroundImage, className }: MiniWatchPreviewProps) {
  return (
    <div
      className={cn(
        'relative rounded-full overflow-hidden border-2 border-zinc-700',
        className
      )}
    >
      <img
        src={backgroundImage}
        alt="Watch face"
        className="w-full h-full object-cover"
      />
      <div
        className="absolute inset-0 rounded-full"
        style={{
          boxShadow: 'inset 0 0 15px rgba(0, 0, 0, 0.4)',
        }}
      />
    </div>
  );
}

```


## UI COMPONENTS - shadcn/ui (src/components/ui/)

### FILE: `src/components/ui/accordion.tsx`

```tsx
import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Accordion({
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b last:border-b-0", className)}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm"
      {...props}
    >
      <div className={cn("pt-0 pb-4", className)}>{children}</div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }

```

### FILE: `src/components/ui/alert.tsx`

```tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive:
          "text-destructive bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
        className
      )}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription }

```

### FILE: `src/components/ui/alert-dialog.tsx`

```tsx
import * as React from "react"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

function AlertDialog({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />
}

function AlertDialogTrigger({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return (
    <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
  )
}

function AlertDialogPortal({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  return (
    <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
  )
}

function AlertDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogContent({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Content>) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
          className
        )}
        {...props}
      />
    </AlertDialogPortal>
  )
}

function AlertDialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  )
}

function AlertDialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn("text-lg font-semibold", className)}
      {...props}
    />
  )
}

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function AlertDialogAction({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action>) {
  return (
    <AlertDialogPrimitive.Action
      className={cn(buttonVariants(), className)}
      {...props}
    />
  )
}

function AlertDialogCancel({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel>) {
  return (
    <AlertDialogPrimitive.Cancel
      className={cn(buttonVariants({ variant: "outline" }), className)}
      {...props}
    />
  )
}

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}

```

### FILE: `src/components/ui/aspect-ratio.tsx`

```tsx
"use client"

import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio"

function AspectRatio({
  ...props
}: React.ComponentProps<typeof AspectRatioPrimitive.Root>) {
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />
}

export { AspectRatio }

```

### FILE: `src/components/ui/avatar.tsx`

```tsx
import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  )
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }

```

### FILE: `src/components/ui/badge.tsx`

```tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }

```

### FILE: `src/components/ui/breadcrumb.tsx`

```tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"

function Breadcrumb({ ...props }: React.ComponentProps<"nav">) {
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        "text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5",
        className
      )}
      {...props}
    />
  )
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center gap-1.5", className)}
      {...props}
    />
  )
}

function BreadcrumbLink({
  asChild,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean
}) {
  const Comp = asChild ? Slot : "a"

  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn("hover:text-foreground transition-colors", className)}
      {...props}
    />
  )
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("text-foreground font-normal", className)}
      {...props}
    />
  )
}

function BreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("[&>svg]:size-3.5", className)}
      {...props}
    >
      {children ?? <ChevronRight />}
    </li>
  )
}

function BreadcrumbEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontal className="size-4" />
      <span className="sr-only">More</span>
    </span>
  )
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
}

```

### FILE: `src/components/ui/button.tsx`

```tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }

```

### FILE: `src/components/ui/button-group.tsx`

```tsx
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

const buttonGroupVariants = cva(
  "flex w-fit items-stretch [&>*]:focus-visible:z-10 [&>*]:focus-visible:relative [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1 has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-md has-[>[data-slot=button-group]]:gap-2",
  {
    variants: {
      orientation: {
        horizontal:
          "[&>*:not(:first-child)]:rounded-l-none [&>*:not(:first-child)]:border-l-0 [&>*:not(:last-child)]:rounded-r-none",
        vertical:
          "flex-col [&>*:not(:first-child)]:rounded-t-none [&>*:not(:first-child)]:border-t-0 [&>*:not(:last-child)]:rounded-b-none",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  }
)

function ButtonGroup({
  className,
  orientation,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof buttonGroupVariants>) {
  return (
    <div
      role="group"
      data-slot="button-group"
      data-orientation={orientation}
      className={cn(buttonGroupVariants({ orientation }), className)}
      {...props}
    />
  )
}

function ButtonGroupText({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & {
  asChild?: boolean
}) {
  const Comp = asChild ? Slot : "div"

  return (
    <Comp
      className={cn(
        "bg-muted flex items-center gap-2 rounded-md border px-4 text-sm font-medium shadow-xs [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function ButtonGroupSeparator({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="button-group-separator"
      orientation={orientation}
      className={cn(
        "bg-input relative !m-0 self-stretch data-[orientation=vertical]:h-auto",
        className
      )}
      {...props}
    />
  )
}

export {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
  buttonGroupVariants,
}

```

### FILE: `src/components/ui/calendar.tsx`

```tsx
"use client"

import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import {
  DayPicker,
  getDefaultClassNames,
  type DayButton,
} from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "bg-background group/calendar p-3 [--cell-size:--spacing(8)] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "flex gap-4 flex-col md:flex-row relative",
          defaultClassNames.months
        ),
        month: cn("flex flex-col w-full gap-4", defaultClassNames.month),
        nav: cn(
          "flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex items-center justify-center h-(--cell-size) w-full px-(--cell-size)",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "w-full flex items-center text-sm font-medium justify-center h-(--cell-size) gap-1.5",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "relative has-focus:border-ring border border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] rounded-md",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "absolute bg-popover inset-0 opacity-0",
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          "select-none font-medium",
          captionLayout === "label"
            ? "text-sm"
            : "rounded-md pl-2 pr-1 flex items-center gap-1 text-sm h-8 [&>svg]:text-muted-foreground [&>svg]:size-3.5",
          defaultClassNames.caption_label
        ),
        table: "w-full border-collapse",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem] select-none",
          defaultClassNames.weekday
        ),
        week: cn("flex w-full mt-2", defaultClassNames.week),
        week_number_header: cn(
          "select-none w-(--cell-size)",
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          "text-[0.8rem] select-none text-muted-foreground",
          defaultClassNames.week_number
        ),
        day: cn(
          "relative w-full h-full p-0 text-center [&:last-child[data-selected=true]_button]:rounded-r-md group/day aspect-square select-none",
          props.showWeekNumber
            ? "[&:nth-child(2)[data-selected=true]_button]:rounded-l-md"
            : "[&:first-child[data-selected=true]_button]:rounded-l-md",
          defaultClassNames.day
        ),
        range_start: cn(
          "rounded-l-md bg-accent",
          defaultClassNames.range_start
        ),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_end: cn("rounded-r-md bg-accent", defaultClassNames.range_end),
        today: cn(
          "bg-accent text-accent-foreground rounded-md data-[selected=true]:rounded-none",
          defaultClassNames.today
        ),
        outside: cn(
          "text-muted-foreground aria-selected:text-muted-foreground",
          defaultClassNames.outside
        ),
        disabled: cn(
          "text-muted-foreground opacity-50",
          defaultClassNames.disabled
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          )
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon className={cn("size-4", className)} {...props} />
            )
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon
                className={cn("size-4", className)}
                {...props}
              />
            )
          }

          return (
            <ChevronDownIcon className={cn("size-4", className)} {...props} />
          )
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">
                {children}
              </div>
            </td>
          )
        },
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 dark:hover:text-accent-foreground flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md [&>span]:text-xs [&>span]:opacity-70",
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }

```

### FILE: `src/components/ui/card.tsx`

```tsx
import * as React from "react"

import { cn } from "@/lib/utils"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}

```

### FILE: `src/components/ui/carousel.tsx`

```tsx
import * as React from "react"
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type CarouselApi = UseEmblaCarouselType[1]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]

type CarouselProps = {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  orientation?: "horizontal" | "vertical"
  setApi?: (api: CarouselApi) => void
}

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: ReturnType<typeof useEmblaCarousel>[1]
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
} & CarouselProps

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }

  return context
}

function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & CarouselProps) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
    },
    plugins
  )
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)

  const onSelect = React.useCallback((api: CarouselApi) => {
    if (!api) return
    setCanScrollPrev(api.canScrollPrev())
    setCanScrollNext(api.canScrollNext())
  }, [])

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev()
  }, [api])

  const scrollNext = React.useCallback(() => {
    api?.scrollNext()
  }, [api])

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault()
        scrollPrev()
      } else if (event.key === "ArrowRight") {
        event.preventDefault()
        scrollNext()
      }
    },
    [scrollPrev, scrollNext]
  )

  React.useEffect(() => {
    if (!api || !setApi) return
    setApi(api)
  }, [api, setApi])

  React.useEffect(() => {
    if (!api) return
    onSelect(api)
    api.on("reInit", onSelect)
    api.on("select", onSelect)

    return () => {
      api?.off("select", onSelect)
    }
  }, [api, onSelect])

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api: api,
        opts,
        orientation:
          orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}
    >
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn("relative", className)}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  )
}

function CarouselContent({ className, ...props }: React.ComponentProps<"div">) {
  const { carouselRef, orientation } = useCarousel()

  return (
    <div
      ref={carouselRef}
      className="overflow-hidden"
      data-slot="carousel-content"
    >
      <div
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className
        )}
        {...props}
      />
    </div>
  )
}

function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
  const { orientation } = useCarousel()

  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className
      )}
      {...props}
    />
  )
}

function CarouselPrevious({
  className,
  variant = "outline",
  size = "icon",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel()

  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={cn(
        "absolute size-8 rounded-full",
        orientation === "horizontal"
          ? "top-1/2 -left-12 -translate-y-1/2"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ArrowLeft />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
}

function CarouselNext({
  className,
  variant = "outline",
  size = "icon",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollNext, canScrollNext } = useCarousel()

  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      className={cn(
        "absolute size-8 rounded-full",
        orientation === "horizontal"
          ? "top-1/2 -right-12 -translate-y-1/2"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ArrowRight />
      <span className="sr-only">Next slide</span>
    </Button>
  )
}

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
}

```

### FILE: `src/components/ui/chart.tsx`

```tsx
"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >["children"]
}) {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border flex aspect-video justify-center text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, config]) => config.theme || config.color
  )

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color
    return color ? `  --color-${key}: ${color};` : null
  })
  .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}: React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
  React.ComponentProps<"div"> & {
    hideLabel?: boolean
    hideIndicator?: boolean
    indicator?: "line" | "dot" | "dashed"
    nameKey?: string
    labelKey?: string
  }) {
  const { config } = useChart()

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) {
      return null
    }

    const [item] = payload
    const key = `${labelKey || item?.dataKey || item?.name || "value"}`
    const itemConfig = getPayloadConfigFromPayload(config, item, key)
    const value =
      !labelKey && typeof label === "string"
        ? config[label as keyof typeof config]?.label || label
        : itemConfig?.label

    if (labelFormatter) {
      return (
        <div className={cn("font-medium", labelClassName)}>
          {labelFormatter(value, payload)}
        </div>
      )
    }

    if (!value) {
      return null
    }

    return <div className={cn("font-medium", labelClassName)}>{value}</div>
  }, [
    label,
    labelFormatter,
    payload,
    hideLabel,
    labelClassName,
    config,
    labelKey,
  ])

  if (!active || !payload?.length) {
    return null
  }

  const nestLabel = payload.length === 1 && indicator !== "dot"

  return (
    <div
      className={cn(
        "border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl",
        className
      )}
    >
      {!nestLabel ? tooltipLabel : null}
      <div className="grid gap-1.5">
        {payload
          .filter((item) => item.type !== "none")
          .map((item, index) => {
            const key = `${nameKey || item.name || item.dataKey || "value"}`
            const itemConfig = getPayloadConfigFromPayload(config, item, key)
            const indicatorColor = color || item.payload.fill || item.color

            return (
              <div
                key={item.dataKey}
                className={cn(
                  "[&>svg]:text-muted-foreground flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5",
                  indicator === "dot" && "items-center"
                )}
              >
                {formatter && item?.value !== undefined && item.name ? (
                  formatter(item.value, item.name, item, index, item.payload)
                ) : (
                  <>
                    {itemConfig?.icon ? (
                      <itemConfig.icon />
                    ) : (
                      !hideIndicator && (
                        <div
                          className={cn(
                            "shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)",
                            {
                              "h-2.5 w-2.5": indicator === "dot",
                              "w-1": indicator === "line",
                              "w-0 border-[1.5px] border-dashed bg-transparent":
                                indicator === "dashed",
                              "my-0.5": nestLabel && indicator === "dashed",
                            }
                          )}
                          style={
                            {
                              "--color-bg": indicatorColor,
                              "--color-border": indicatorColor,
                            } as React.CSSProperties
                          }
                        />
                      )
                    )}
                    <div
                      className={cn(
                        "flex flex-1 justify-between leading-none",
                        nestLabel ? "items-end" : "items-center"
                      )}
                    >
                      <div className="grid gap-1.5">
                        {nestLabel ? tooltipLabel : null}
                        <span className="text-muted-foreground">
                          {itemConfig?.label || item.name}
                        </span>
                      </div>
                      {item.value && (
                        <span className="text-foreground font-mono font-medium tabular-nums">
                          {item.value.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
      </div>
    </div>
  )
}

const ChartLegend = RechartsPrimitive.Legend

function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = "bottom",
  nameKey,
}: React.ComponentProps<"div"> &
  Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> & {
    hideIcon?: boolean
    nameKey?: string
  }) {
  const { config } = useChart()

  if (!payload?.length) {
    return null
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className
      )}
    >
      {payload
        .filter((item) => item.type !== "none")
        .map((item) => {
          const key = `${nameKey || item.dataKey || "value"}`
          const itemConfig = getPayloadConfigFromPayload(config, item, key)

          return (
            <div
              key={item.value}
              className={cn(
                "[&>svg]:text-muted-foreground flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3"
              )}
            >
              {itemConfig?.icon && !hideIcon ? (
                <itemConfig.icon />
              ) : (
                <div
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{
                    backgroundColor: item.color,
                  }}
                />
              )}
              {itemConfig?.label}
            </div>
          )
        })}
    </div>
  )
}

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string
) {
  if (typeof payload !== "object" || payload === null) {
    return undefined
  }

  const payloadPayload =
    "payload" in payload &&
    typeof payload.payload === "object" &&
    payload.payload !== null
      ? payload.payload
      : undefined

  let configLabelKey: string = key

  if (
    key in payload &&
    typeof payload[key as keyof typeof payload] === "string"
  ) {
    configLabelKey = payload[key as keyof typeof payload] as string
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
  ) {
    configLabelKey = payloadPayload[
      key as keyof typeof payloadPayload
    ] as string
  }

  return configLabelKey in config
    ? config[configLabelKey]
    : config[key as keyof typeof config]
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
}

```

### FILE: `src/components/ui/checkbox.tsx`

```tsx
"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer border-input dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }

```

### FILE: `src/components/ui/collapsible.tsx`

```tsx
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"

function Collapsible({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
}

function CollapsibleTrigger({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) {
  return (
    <CollapsiblePrimitive.CollapsibleTrigger
      data-slot="collapsible-trigger"
      {...props}
    />
  )
}

function CollapsibleContent({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) {
  return (
    <CollapsiblePrimitive.CollapsibleContent
      data-slot="collapsible-content"
      {...props}
    />
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }

```

### FILE: `src/components/ui/command.tsx`

```tsx
import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import { SearchIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        "bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md",
        className
      )}
      {...props}
    />
  )
}

function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  className,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string
  description?: string
  className?: string
  showCloseButton?: boolean
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent
        className={cn("overflow-hidden p-0", className)}
        showCloseButton={showCloseButton}
      >
        <Command className="[&_[cmdk-group-heading]]:text-muted-foreground **:data-[slot=command-input-wrapper]:h-12 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  )
}

function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div
      data-slot="command-input-wrapper"
      className="flex h-9 items-center gap-2 border-b px-3"
    >
      <SearchIcon className="size-4 shrink-0 opacity-50" />
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          "placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    </div>
  )
}

function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(
        "max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto",
        className
      )}
      {...props}
    />
  )
}

function CommandEmpty({
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className="py-6 text-center text-sm"
      {...props}
    />
  )
}

function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        "text-foreground [&_[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium",
        className
      )}
      {...props}
    />
  )
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn("bg-border -mx-1 h-px", className)}
      {...props}
    />
  )
}

function CommandItem({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className
      )}
      {...props}
    />
  )
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}

```

### FILE: `src/components/ui/context-menu.tsx`

```tsx
"use client"

import * as React from "react"
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu"
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function ContextMenu({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Root>) {
  return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />
}

function ContextMenuTrigger({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Trigger>) {
  return (
    <ContextMenuPrimitive.Trigger data-slot="context-menu-trigger" {...props} />
  )
}

function ContextMenuGroup({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Group>) {
  return (
    <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />
  )
}

function ContextMenuPortal({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Portal>) {
  return (
    <ContextMenuPrimitive.Portal data-slot="context-menu-portal" {...props} />
  )
}

function ContextMenuSub({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Sub>) {
  return <ContextMenuPrimitive.Sub data-slot="context-menu-sub" {...props} />
}

function ContextMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.RadioGroup>) {
  return (
    <ContextMenuPrimitive.RadioGroup
      data-slot="context-menu-radio-group"
      {...props}
    />
  )
}

function ContextMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.SubTrigger> & {
  inset?: boolean
}) {
  return (
    <ContextMenuPrimitive.SubTrigger
      data-slot="context-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto" />
    </ContextMenuPrimitive.SubTrigger>
  )
}

function ContextMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.SubContent>) {
  return (
    <ContextMenuPrimitive.SubContent
      data-slot="context-menu-sub-content"
      className={cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-context-menu-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg",
        className
      )}
      {...props}
    />
  )
}

function ContextMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Content>) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content
        data-slot="context-menu-content"
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-context-menu-content-available-height) min-w-[8rem] origin-(--radix-context-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md",
          className
        )}
        {...props}
      />
    </ContextMenuPrimitive.Portal>
  )
}

function ContextMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Item> & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  return (
    <ContextMenuPrimitive.Item
      data-slot="context-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function ContextMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.CheckboxItem>) {
  return (
    <ContextMenuPrimitive.CheckboxItem
      data-slot="context-menu-checkbox-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.CheckboxItem>
  )
}

function ContextMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.RadioItem>) {
  return (
    <ContextMenuPrimitive.RadioItem
      data-slot="context-menu-radio-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  )
}

function ContextMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Label> & {
  inset?: boolean
}) {
  return (
    <ContextMenuPrimitive.Label
      data-slot="context-menu-label"
      data-inset={inset}
      className={cn(
        "text-foreground px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
        className
      )}
      {...props}
    />
  )
}

function ContextMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Separator>) {
  return (
    <ContextMenuPrimitive.Separator
      data-slot="context-menu-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

function ContextMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="context-menu-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className
      )}
      {...props}
    />
  )
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
}

```

### FILE: `src/components/ui/dialog.tsx`

```tsx
import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
}) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 outline-none sm:max-w-lg",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}

```

### FILE: `src/components/ui/drawer.tsx`

```tsx
"use client"

import * as React from "react"
import { Drawer as DrawerPrimitive } from "vaul"

import { cn } from "@/lib/utils"

function Drawer({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) {
  return <DrawerPrimitive.Root data-slot="drawer" {...props} />
}

function DrawerTrigger({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />
}

function DrawerPortal({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />
}

function DrawerClose({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Close>) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />
}

function DrawerOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
  return (
    <DrawerPrimitive.Overlay
      data-slot="drawer-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props}
    />
  )
}

function DrawerContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Content>) {
  return (
    <DrawerPortal data-slot="drawer-portal">
      <DrawerOverlay />
      <DrawerPrimitive.Content
        data-slot="drawer-content"
        className={cn(
          "group/drawer-content bg-background fixed z-50 flex h-auto flex-col",
          "data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-b-lg data-[vaul-drawer-direction=top]:border-b",
          "data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=bottom]:rounded-t-lg data-[vaul-drawer-direction=bottom]:border-t",
          "data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=right]:sm:max-w-sm",
          "data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=left]:sm:max-w-sm",
          className
        )}
        {...props}
      >
        <div className="bg-muted mx-auto mt-4 hidden h-2 w-[100px] shrink-0 rounded-full group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  )
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={cn(
        "flex flex-col gap-0.5 p-4 group-data-[vaul-drawer-direction=bottom]/drawer-content:text-center group-data-[vaul-drawer-direction=top]/drawer-content:text-center md:gap-1.5 md:text-left",
        className
      )}
      {...props}
    />
  )
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

function DrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  )
}

function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}

```

### FILE: `src/components/ui/dropdown-menu.tsx`

```tsx
import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function DropdownMenu({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

function DropdownMenuPortal({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return (
    <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
  )
}

function DropdownMenuTrigger({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      {...props}
    />
  )
}

function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md",
          className
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

function DropdownMenuGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return (
    <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
  )
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  )
}

function DropdownMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  return (
    <DropdownMenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  )
}

function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  )
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        "px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSub({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </DropdownMenuPrimitive.SubTrigger>
  )
}

function DropdownMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPrimitive.SubContent
      data-slot="dropdown-menu-sub-content"
      className={cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg",
        className
      )}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}

```

### FILE: `src/components/ui/empty.tsx`

```tsx
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

function Empty({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty"
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center justify-center gap-6 rounded-lg border-dashed p-6 text-center text-balance md:p-12",
        className
      )}
      {...props}
    />
  )
}

function EmptyHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-header"
      className={cn(
        "flex max-w-sm flex-col items-center gap-2 text-center",
        className
      )}
      {...props}
    />
  )
}

const emptyMediaVariants = cva(
  "flex shrink-0 items-center justify-center mb-2 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "bg-muted text-foreground flex size-10 shrink-0 items-center justify-center rounded-lg [&_svg:not([class*='size-'])]:size-6",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function EmptyMedia({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof emptyMediaVariants>) {
  return (
    <div
      data-slot="empty-icon"
      data-variant={variant}
      className={cn(emptyMediaVariants({ variant, className }))}
      {...props}
    />
  )
}

function EmptyTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-title"
      className={cn("text-lg font-medium tracking-tight", className)}
      {...props}
    />
  )
}

function EmptyDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <div
      data-slot="empty-description"
      className={cn(
        "text-muted-foreground [&>a:hover]:text-primary text-sm/relaxed [&>a]:underline [&>a]:underline-offset-4",
        className
      )}
      {...props}
    />
  )
}

function EmptyContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-content"
      className={cn(
        "flex w-full max-w-sm min-w-0 flex-col items-center gap-4 text-sm text-balance",
        className
      )}
      {...props}
    />
  )
}

export {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
}

```

### FILE: `src/components/ui/field.tsx`

```tsx
import { useMemo } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

function FieldSet({ className, ...props }: React.ComponentProps<"fieldset">) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn(
        "flex flex-col gap-6",
        "has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3",
        className
      )}
      {...props}
    />
  )
}

function FieldLegend({
  className,
  variant = "legend",
  ...props
}: React.ComponentProps<"legend"> & { variant?: "legend" | "label" }) {
  return (
    <legend
      data-slot="field-legend"
      data-variant={variant}
      className={cn(
        "mb-3 font-medium",
        "data-[variant=legend]:text-base",
        "data-[variant=label]:text-sm",
        className
      )}
      {...props}
    />
  )
}

function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      className={cn(
        "group/field-group @container/field-group flex w-full flex-col gap-7 data-[slot=checkbox-group]:gap-3 [&>[data-slot=field-group]]:gap-4",
        className
      )}
      {...props}
    />
  )
}

const fieldVariants = cva(
  "group/field flex w-full gap-3 data-[invalid=true]:text-destructive",
  {
    variants: {
      orientation: {
        vertical: ["flex-col [&>*]:w-full [&>.sr-only]:w-auto"],
        horizontal: [
          "flex-row items-center",
          "[&>[data-slot=field-label]]:flex-auto",
          "has-[>[data-slot=field-content]]:items-start has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
        ],
        responsive: [
          "flex-col [&>*]:w-full [&>.sr-only]:w-auto @md/field-group:flex-row @md/field-group:items-center @md/field-group:[&>*]:w-auto",
          "@md/field-group:[&>[data-slot=field-label]]:flex-auto",
          "@md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
        ],
      },
    },
    defaultVariants: {
      orientation: "vertical",
    },
  }
)

function Field({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof fieldVariants>) {
  return (
    <div
      role="group"
      data-slot="field"
      data-orientation={orientation}
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  )
}

function FieldContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-content"
      className={cn(
        "group/field-content flex flex-1 flex-col gap-1.5 leading-snug",
        className
      )}
      {...props}
    />
  )
}

function FieldLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  return (
    <Label
      data-slot="field-label"
      className={cn(
        "group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50",
        "has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col has-[>[data-slot=field]]:rounded-md has-[>[data-slot=field]]:border [&>*]:data-[slot=field]:p-4",
        "has-data-[state=checked]:bg-primary/5 has-data-[state=checked]:border-primary dark:has-data-[state=checked]:bg-primary/10",
        className
      )}
      {...props}
    />
  )
}

function FieldTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-label"
      className={cn(
        "flex w-fit items-center gap-2 text-sm leading-snug font-medium group-data-[disabled=true]/field:opacity-50",
        className
      )}
      {...props}
    />
  )
}

function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={cn(
        "text-muted-foreground text-sm leading-normal font-normal group-has-[[data-orientation=horizontal]]/field:text-balance",
        "last:mt-0 nth-last-2:-mt-1 [[data-variant=legend]+&]:-mt-1.5",
        "[&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4",
        className
      )}
      {...props}
    />
  )
}

function FieldSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  children?: React.ReactNode
}) {
  return (
    <div
      data-slot="field-separator"
      data-content={!!children}
      className={cn(
        "relative -my-2 h-5 text-sm group-data-[variant=outline]/field-group:-mb-2",
        className
      )}
      {...props}
    >
      <Separator className="absolute inset-0 top-1/2" />
      {children && (
        <span
          className="bg-background text-muted-foreground relative mx-auto block w-fit px-2"
          data-slot="field-separator-content"
        >
          {children}
        </span>
      )}
    </div>
  )
}

function FieldError({
  className,
  children,
  errors,
  ...props
}: React.ComponentProps<"div"> & {
  errors?: Array<{ message?: string } | undefined>
}) {
  const content = useMemo(() => {
    if (children) {
      return children
    }

    if (!errors?.length) {
      return null
    }

    const uniqueErrors = [
      ...new Map(errors.map((error) => [error?.message, error])).values(),
    ]

    if (uniqueErrors?.length == 1) {
      return uniqueErrors[0]?.message
    }

    return (
      <ul className="ml-4 flex list-disc flex-col gap-1">
        {uniqueErrors.map(
          (error, index) =>
            error?.message && <li key={index}>{error.message}</li>
        )}
      </ul>
    )
  }, [children, errors])

  if (!content) {
    return null
  }

  return (
    <div
      role="alert"
      data-slot="field-error"
      className={cn("text-destructive text-sm font-normal", className)}
      {...props}
    >
      {content}
    </div>
  )
}

export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldContent,
  FieldTitle,
}

```

### FILE: `src/components/ui/form.tsx`

```tsx
"use client"

import * as React from "react"
import type * as LabelPrimitive from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

const Form = FormProvider

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
)

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState } = useFormContext()
  const formState = useFormState({ name: fieldContext.name })
  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
)

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        data-slot="form-item"
        className={cn("grid gap-2", className)}
        {...props}
      />
    </FormItemContext.Provider>
  )
}

function FormLabel({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  const { error, formItemId } = useFormField()

  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={cn("data-[error=true]:text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  )
}

function FormControl({ ...props }: React.ComponentProps<typeof Slot>) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    <Slot
      data-slot="form-control"
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  )
}

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { formDescriptionId } = useFormField()

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function FormMessage({ className, ...props }: React.ComponentProps<"p">) {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message ?? "") : props.children

  if (!body) {
    return null
  }

  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className={cn("text-destructive text-sm", className)}
      {...props}
    >
      {body}
    </p>
  )
}

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
}

```

### FILE: `src/components/ui/hover-card.tsx`

```tsx
"use client"

import * as React from "react"
import * as HoverCardPrimitive from "@radix-ui/react-hover-card"

import { cn } from "@/lib/utils"

function HoverCard({
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Root>) {
  return <HoverCardPrimitive.Root data-slot="hover-card" {...props} />
}

function HoverCardTrigger({
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Trigger>) {
  return (
    <HoverCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />
  )
}

function HoverCardContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Content>) {
  return (
    <HoverCardPrimitive.Portal data-slot="hover-card-portal">
      <HoverCardPrimitive.Content
        data-slot="hover-card-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-64 origin-(--radix-hover-card-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden",
          className
        )}
        {...props}
      />
    </HoverCardPrimitive.Portal>
  )
}

export { HoverCard, HoverCardTrigger, HoverCardContent }

```

### FILE: `src/components/ui/input.tsx`

```tsx
import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }

```

### FILE: `src/components/ui/input-group.tsx`

```tsx
"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        "group/input-group border-input dark:bg-input/30 relative flex w-full items-center rounded-md border shadow-xs transition-[color,box-shadow] outline-none",
        "h-9 min-w-0 has-[>textarea]:h-auto",

        // Variants based on alignment.
        "has-[>[data-align=inline-start]]:[&>input]:pl-2",
        "has-[>[data-align=inline-end]]:[&>input]:pr-2",
        "has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-start]]:[&>input]:pb-3",
        "has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-end]]:[&>input]:pt-3",

        // Focus state.
        "has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot=input-group-control]:focus-visible]:ring-ring/50 has-[[data-slot=input-group-control]:focus-visible]:ring-[3px]",

        // Error state.
        "has-[[data-slot][aria-invalid=true]]:ring-destructive/20 has-[[data-slot][aria-invalid=true]]:border-destructive dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40",

        className
      )}
      {...props}
    />
  )
}

const inputGroupAddonVariants = cva(
  "text-muted-foreground flex h-auto cursor-text items-center justify-center gap-2 py-1.5 text-sm font-medium select-none [&>svg:not([class*='size-'])]:size-4 [&>kbd]:rounded-[calc(var(--radius)-5px)] group-data-[disabled=true]/input-group:opacity-50",
  {
    variants: {
      align: {
        "inline-start":
          "order-first pl-3 has-[>button]:ml-[-0.45rem] has-[>kbd]:ml-[-0.35rem]",
        "inline-end":
          "order-last pr-3 has-[>button]:mr-[-0.45rem] has-[>kbd]:mr-[-0.35rem]",
        "block-start":
          "order-first w-full justify-start px-3 pt-3 [.border-b]:pb-3 group-has-[>input]/input-group:pt-2.5",
        "block-end":
          "order-last w-full justify-start px-3 pb-3 [.border-t]:pt-3 group-has-[>input]/input-group:pb-2.5",
      },
    },
    defaultVariants: {
      align: "inline-start",
    },
  }
)

function InputGroupAddon({
  className,
  align = "inline-start",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button")) {
          return
        }
        e.currentTarget.parentElement?.querySelector("input")?.focus()
      }}
      {...props}
    />
  )
}

const inputGroupButtonVariants = cva(
  "text-sm shadow-none flex gap-2 items-center",
  {
    variants: {
      size: {
        xs: "h-6 gap-1 px-2 rounded-[calc(var(--radius)-5px)] [&>svg:not([class*='size-'])]:size-3.5 has-[>svg]:px-2",
        sm: "h-8 px-2.5 gap-1.5 rounded-md has-[>svg]:px-2.5",
        "icon-xs":
          "size-6 rounded-[calc(var(--radius)-5px)] p-0 has-[>svg]:p-0",
        "icon-sm": "size-8 p-0 has-[>svg]:p-0",
      },
    },
    defaultVariants: {
      size: "xs",
    },
  }
)

function InputGroupButton({
  className,
  type = "button",
  variant = "ghost",
  size = "xs",
  ...props
}: Omit<React.ComponentProps<typeof Button>, "size"> &
  VariantProps<typeof inputGroupButtonVariants>) {
  return (
    <Button
      type={type}
      data-size={size}
      variant={variant}
      className={cn(inputGroupButtonVariants({ size }), className)}
      {...props}
    />
  )
}

function InputGroupText({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "text-muted-foreground flex items-center gap-2 text-sm [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function InputGroupInput({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <Input
      data-slot="input-group-control"
      className={cn(
        "flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent",
        className
      )}
      {...props}
    />
  )
}

function InputGroupTextarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <Textarea
      data-slot="input-group-control"
      className={cn(
        "flex-1 resize-none rounded-none border-0 bg-transparent py-3 shadow-none focus-visible:ring-0 dark:bg-transparent",
        className
      )}
      {...props}
    />
  )
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
}

```

### FILE: `src/components/ui/input-otp.tsx`

```tsx
import * as React from "react"
import { OTPInput, OTPInputContext } from "input-otp"
import { MinusIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string
}) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        "flex items-center gap-2 has-disabled:opacity-50",
        containerClassName
      )}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  )
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn("flex items-center", className)}
      {...props}
    />
  )
}

function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  index: number
}) {
  const inputOTPContext = React.useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {}

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        "data-[active=true]:border-ring data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:ring-destructive/20 dark:data-[active=true]:aria-invalid:ring-destructive/40 aria-invalid:border-destructive data-[active=true]:aria-invalid:border-destructive dark:bg-input/30 border-input relative flex h-9 w-9 items-center justify-center border-y border-r text-sm shadow-xs transition-all outline-none first:rounded-l-md first:border-l last:rounded-r-md data-[active=true]:z-10 data-[active=true]:ring-[3px]",
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink bg-foreground h-4 w-px duration-1000" />
        </div>
      )}
    </div>
  )
}

function InputOTPSeparator({ ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="input-otp-separator" role="separator" {...props}>
      <MinusIcon />
    </div>
  )
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }

```

### FILE: `src/components/ui/item.tsx`

```tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

function ItemGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="list"
      data-slot="item-group"
      className={cn("group/item-group flex flex-col", className)}
      {...props}
    />
  )
}

function ItemSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="item-separator"
      orientation="horizontal"
      className={cn("my-0", className)}
      {...props}
    />
  )
}

const itemVariants = cva(
  "group/item flex items-center border border-transparent text-sm rounded-md transition-colors [a]:hover:bg-accent/50 [a]:transition-colors duration-100 flex-wrap outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border-border",
        muted: "bg-muted/50",
      },
      size: {
        default: "p-4 gap-4 ",
        sm: "py-3 px-4 gap-2.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Item({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof itemVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "div"
  return (
    <Comp
      data-slot="item"
      data-variant={variant}
      data-size={size}
      className={cn(itemVariants({ variant, size, className }))}
      {...props}
    />
  )
}

const itemMediaVariants = cva(
  "flex shrink-0 items-center justify-center gap-2 group-has-[[data-slot=item-description]]/item:self-start [&_svg]:pointer-events-none group-has-[[data-slot=item-description]]/item:translate-y-0.5",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "size-8 border rounded-sm bg-muted [&_svg:not([class*='size-'])]:size-4",
        image:
          "size-10 rounded-sm overflow-hidden [&_img]:size-full [&_img]:object-cover",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function ItemMedia({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof itemMediaVariants>) {
  return (
    <div
      data-slot="item-media"
      data-variant={variant}
      className={cn(itemMediaVariants({ variant, className }))}
      {...props}
    />
  )
}

function ItemContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-content"
      className={cn(
        "flex flex-1 flex-col gap-1 [&+[data-slot=item-content]]:flex-none",
        className
      )}
      {...props}
    />
  )
}

function ItemTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-title"
      className={cn(
        "flex w-fit items-center gap-2 text-sm leading-snug font-medium",
        className
      )}
      {...props}
    />
  )
}

function ItemDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="item-description"
      className={cn(
        "text-muted-foreground line-clamp-2 text-sm leading-normal font-normal text-balance",
        "[&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4",
        className
      )}
      {...props}
    />
  )
}

function ItemActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-actions"
      className={cn("flex items-center gap-2", className)}
      {...props}
    />
  )
}

function ItemHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-header"
      className={cn(
        "flex basis-full items-center justify-between gap-2",
        className
      )}
      {...props}
    />
  )
}

function ItemFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-footer"
      className={cn(
        "flex basis-full items-center justify-between gap-2",
        className
      )}
      {...props}
    />
  )
}

export {
  Item,
  ItemMedia,
  ItemContent,
  ItemActions,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
  ItemDescription,
  ItemHeader,
  ItemFooter,
}

```

### FILE: `src/components/ui/kbd.tsx`

```tsx
import { cn } from "@/lib/utils"

function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "bg-muted text-muted-foreground pointer-events-none inline-flex h-5 w-fit min-w-5 items-center justify-center gap-1 rounded-sm px-1 font-sans text-xs font-medium select-none",
        "[&_svg:not([class*='size-'])]:size-3",
        "[[data-slot=tooltip-content]_&]:bg-background/20 [[data-slot=tooltip-content]_&]:text-background dark:[[data-slot=tooltip-content]_&]:bg-background/10",
        className
      )}
      {...props}
    />
  )
}

function KbdGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <kbd
      data-slot="kbd-group"
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    />
  )
}

export { Kbd, KbdGroup }

```

### FILE: `src/components/ui/label.tsx`

```tsx
"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"

import { cn } from "@/lib/utils"

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }

```

### FILE: `src/components/ui/menubar.tsx`

```tsx
import * as React from "react"
import * as MenubarPrimitive from "@radix-ui/react-menubar"
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Menubar({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Root>) {
  return (
    <MenubarPrimitive.Root
      data-slot="menubar"
      className={cn(
        "bg-background flex h-9 items-center gap-1 rounded-md border p-1 shadow-xs",
        className
      )}
      {...props}
    />
  )
}

function MenubarMenu({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Menu>) {
  return <MenubarPrimitive.Menu data-slot="menubar-menu" {...props} />
}

function MenubarGroup({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Group>) {
  return <MenubarPrimitive.Group data-slot="menubar-group" {...props} />
}

function MenubarPortal({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Portal>) {
  return <MenubarPrimitive.Portal data-slot="menubar-portal" {...props} />
}

function MenubarRadioGroup({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.RadioGroup>) {
  return (
    <MenubarPrimitive.RadioGroup data-slot="menubar-radio-group" {...props} />
  )
}

function MenubarTrigger({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Trigger>) {
  return (
    <MenubarPrimitive.Trigger
      data-slot="menubar-trigger"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex items-center rounded-sm px-2 py-1 text-sm font-medium outline-hidden select-none",
        className
      )}
      {...props}
    />
  )
}

function MenubarContent({
  className,
  align = "start",
  alignOffset = -4,
  sideOffset = 8,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Content>) {
  return (
    <MenubarPortal>
      <MenubarPrimitive.Content
        data-slot="menubar-content"
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[12rem] origin-(--radix-menubar-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-md",
          className
        )}
        {...props}
      />
    </MenubarPortal>
  )
}

function MenubarItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Item> & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  return (
    <MenubarPrimitive.Item
      data-slot="menubar-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function MenubarCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.CheckboxItem>) {
  return (
    <MenubarPrimitive.CheckboxItem
      data-slot="menubar-checkbox-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-xs py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <MenubarPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.CheckboxItem>
  )
}

function MenubarRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.RadioItem>) {
  return (
    <MenubarPrimitive.RadioItem
      data-slot="menubar-radio-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-xs py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <MenubarPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.RadioItem>
  )
}

function MenubarLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Label> & {
  inset?: boolean
}) {
  return (
    <MenubarPrimitive.Label
      data-slot="menubar-label"
      data-inset={inset}
      className={cn(
        "px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
        className
      )}
      {...props}
    />
  )
}

function MenubarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Separator>) {
  return (
    <MenubarPrimitive.Separator
      data-slot="menubar-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

function MenubarShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="menubar-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className
      )}
      {...props}
    />
  )
}

function MenubarSub({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Sub>) {
  return <MenubarPrimitive.Sub data-slot="menubar-sub" {...props} />
}

function MenubarSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.SubTrigger> & {
  inset?: boolean
}) {
  return (
    <MenubarPrimitive.SubTrigger
      data-slot="menubar-sub-trigger"
      data-inset={inset}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none data-[inset]:pl-8",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto h-4 w-4" />
    </MenubarPrimitive.SubTrigger>
  )
}

function MenubarSubContent({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.SubContent>) {
  return (
    <MenubarPrimitive.SubContent
      data-slot="menubar-sub-content"
      className={cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-menubar-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg",
        className
      )}
      {...props}
    />
  )
}

export {
  Menubar,
  MenubarPortal,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarGroup,
  MenubarSeparator,
  MenubarLabel,
  MenubarItem,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
}

```

### FILE: `src/components/ui/navigation-menu.tsx`

```tsx
import * as React from "react"
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu"
import { cva } from "class-variance-authority"
import { ChevronDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function NavigationMenu({
  className,
  children,
  viewport = true,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Root> & {
  viewport?: boolean
}) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      data-viewport={viewport}
      className={cn(
        "group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
        className
      )}
      {...props}
    >
      {children}
      {viewport && <NavigationMenuViewport />}
    </NavigationMenuPrimitive.Root>
  )
}

function NavigationMenuList({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn(
        "group flex flex-1 list-none items-center justify-center gap-1",
        className
      )}
      {...props}
    />
  )
}

function NavigationMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) {
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      className={cn("relative", className)}
      {...props}
    />
  )
}

const navigationMenuTriggerStyle = cva(
  "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=open]:hover:bg-accent data-[state=open]:text-accent-foreground data-[state=open]:focus:bg-accent data-[state=open]:bg-accent/50 focus-visible:ring-ring/50 outline-none transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1"
)

function NavigationMenuTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      className={cn(navigationMenuTriggerStyle(), "group", className)}
      {...props}
    >
      {children}{" "}
      <ChevronDownIcon
        className="relative top-[1px] ml-1 size-3 transition duration-300 group-data-[state=open]:rotate-180"
        aria-hidden="true"
      />
    </NavigationMenuPrimitive.Trigger>
  )
}

function NavigationMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Content>) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        "data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 top-0 left-0 w-full p-2 pr-2.5 md:absolute md:w-auto",
        "group-data-[viewport=false]/navigation-menu:bg-popover group-data-[viewport=false]/navigation-menu:text-popover-foreground group-data-[viewport=false]/navigation-menu:data-[state=open]:animate-in group-data-[viewport=false]/navigation-menu:data-[state=closed]:animate-out group-data-[viewport=false]/navigation-menu:data-[state=closed]:zoom-out-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:zoom-in-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:fade-in-0 group-data-[viewport=false]/navigation-menu:data-[state=closed]:fade-out-0 group-data-[viewport=false]/navigation-menu:top-full group-data-[viewport=false]/navigation-menu:mt-1.5 group-data-[viewport=false]/navigation-menu:overflow-hidden group-data-[viewport=false]/navigation-menu:rounded-md group-data-[viewport=false]/navigation-menu:border group-data-[viewport=false]/navigation-menu:shadow group-data-[viewport=false]/navigation-menu:duration-200 **:data-[slot=navigation-menu-link]:focus:ring-0 **:data-[slot=navigation-menu-link]:focus:outline-none",
        className
      )}
      {...props}
    />
  )
}

function NavigationMenuViewport({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Viewport>) {
  return (
    <div
      className={cn(
        "absolute top-full left-0 isolate z-50 flex justify-center"
      )}
    >
      <NavigationMenuPrimitive.Viewport
        data-slot="navigation-menu-viewport"
        className={cn(
          "origin-top-center bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border shadow md:w-[var(--radix-navigation-menu-viewport-width)]",
          className
        )}
        {...props}
      />
    </div>
  )
}

function NavigationMenuLink({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Link>) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(
        "data-[active=true]:focus:bg-accent data-[active=true]:hover:bg-accent data-[active=true]:bg-accent/50 data-[active=true]:text-accent-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-ring/50 [&_svg:not([class*='text-'])]:text-muted-foreground flex flex-col gap-1 rounded-sm p-2 text-sm transition-all outline-none focus-visible:ring-[3px] focus-visible:outline-1 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function NavigationMenuIndicator({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Indicator>) {
  return (
    <NavigationMenuPrimitive.Indicator
      data-slot="navigation-menu-indicator"
      className={cn(
        "data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden",
        className
      )}
      {...props}
    >
      <div className="bg-border relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm shadow-md" />
    </NavigationMenuPrimitive.Indicator>
  )
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
}

```

### FILE: `src/components/ui/pagination.tsx`

```tsx
import * as React from "react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants, type Button } from "@/components/ui/button"

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  )
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  )
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<"a">

function PaginationLink({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          size,
        }),
        className
      )}
      {...props}
    />
  )
}

function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn("gap-1 px-2.5 sm:pl-2.5", className)}
      {...props}
    >
      <ChevronLeftIcon />
      <span className="hidden sm:block">Previous</span>
    </PaginationLink>
  )
}

function PaginationNext({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn("gap-1 px-2.5 sm:pr-2.5", className)}
      {...props}
    >
      <span className="hidden sm:block">Next</span>
      <ChevronRightIcon />
    </PaginationLink>
  )
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
}

```

### FILE: `src/components/ui/popover.tsx`

```tsx
"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@/lib/utils"

function Popover({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden",
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
}

function PopoverAnchor({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }

```

### FILE: `src/components/ui/progress.tsx`

```tsx
import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="bg-primary h-full w-full flex-1 transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }

```

### FILE: `src/components/ui/radio-group.tsx`

```tsx
"use client"

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { CircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid gap-3", className)}
      {...props}
    />
  )
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="relative flex items-center justify-center"
      >
        <CircleIcon className="fill-primary absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroup, RadioGroupItem }

```

### FILE: `src/components/ui/resizable.tsx`

```tsx
import * as React from "react"
import { GripVerticalIcon } from "lucide-react"
import * as ResizablePrimitive from "react-resizable-panels"

import { cn } from "@/lib/utils"

function ResizablePanelGroup({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.Group>) {
  return (
    <ResizablePrimitive.Group
      data-slot="resizable-panel-group"
      className={cn(
        "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
        className
      )}
      {...props}
    />
  )
}

function ResizablePanel({
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.Panel>) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.Separator> & {
  withHandle?: boolean
}) {
  return (
    <ResizablePrimitive.Separator
      data-slot="resizable-handle"
      className={cn(
        "bg-border focus-visible:ring-ring relative flex w-px items-center justify-center after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-hidden data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:translate-x-0 data-[panel-group-direction=vertical]:after:-translate-y-1/2 [&[data-panel-group-direction=vertical]>div]:rotate-90",
        className
      )}
      {...props}
    >
      {withHandle && (
        <div className="bg-border z-10 flex h-4 w-3 items-center justify-center rounded-xs border">
          <GripVerticalIcon className="size-2.5" />
        </div>
      )}
    </ResizablePrimitive.Separator>
  )
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }

```

### FILE: `src/components/ui/scroll-area.tsx`

```tsx
"use client"

import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

import { cn } from "@/lib/utils"

function ScrollArea({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root>) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn("relative", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        className="focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        "flex touch-none p-px transition-colors select-none",
        orientation === "vertical" &&
          "h-full w-2.5 border-l border-l-transparent",
        orientation === "horizontal" &&
          "h-2.5 flex-col border-t border-t-transparent",
        className
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className="bg-border relative flex-1 rounded-full"
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  )
}

export { ScrollArea, ScrollBar }

```

### FILE: `src/components/ui/select.tsx`

```tsx
import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default"
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  position = "item-aligned",
  align = "center",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        align={align}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("text-muted-foreground px-2 py-1.5 text-xs", className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      )}
      {...props}
    >
      <span
        data-slot="select-item-indicator"
        className="absolute right-2 flex size-3.5 items-center justify-center"
      >
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}

```

### FILE: `src/components/ui/separator.tsx`

```tsx
"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className
      )}
      {...props}
    />
  )
}

export { Separator }

```

### FILE: `src/components/ui/sheet.tsx`

```tsx
import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props}
    />
  )
}

function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left"
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
          side === "right" &&
            "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
          side === "left" &&
            "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
          side === "top" &&
            "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b",
          side === "bottom" &&
            "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t",
          className
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none">
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}

```

### FILE: `src/components/ui/sidebar.tsx`

```tsx
"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { PanelLeftIcon } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "3rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarContextProps = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContextProps | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }

  return context
}

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const isMobile = useIsMobile()
  const [openMobile, setOpenMobile] = React.useState(false)

  // This is the internal state of the sidebar.
  // We use openProp and setOpenProp for control from outside the component.
  const [_open, _setOpen] = React.useState(defaultOpen)
  const open = openProp ?? _open
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value
      if (setOpenProp) {
        setOpenProp(openState)
      } else {
        _setOpen(openState)
      }

      // This sets the cookie to keep the sidebar state.
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
    },
    [setOpenProp, open]
  )

  // Helper to toggle the sidebar.
  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open)
  }, [isMobile, setOpen, setOpenMobile])

  // Adds a keyboard shortcut to toggle the sidebar.
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault()
        toggleSidebar()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleSidebar])

  // We add a state so that we can do data-state="expanded" or "collapsed".
  // This makes it easier to style the sidebar with Tailwind classes.
  const state = open ? "expanded" : "collapsed"

  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
  )

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          data-slot="sidebar-wrapper"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH,
              "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          className={cn(
            "group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  )
}

function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  side?: "left" | "right"
  variant?: "sidebar" | "floating" | "inset"
  collapsible?: "offcanvas" | "icon" | "none"
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

  if (collapsible === "none") {
    return (
      <div
        data-slot="sidebar"
        className={cn(
          "bg-sidebar text-sidebar-foreground flex h-full w-(--sidebar-width) flex-col",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent
          data-sidebar="sidebar"
          data-slot="sidebar"
          data-mobile="true"
          className="bg-sidebar text-sidebar-foreground w-(--sidebar-width) p-0 [&>button]:hidden"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
            } as React.CSSProperties
          }
          side={side}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Displays the mobile sidebar.</SheetDescription>
          </SheetHeader>
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div
      className="group peer text-sidebar-foreground hidden md:block"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}
      data-slot="sidebar"
    >
      {/* This is what handles the sidebar gap on desktop */}
      <div
        data-slot="sidebar-gap"
        className={cn(
          "relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear",
          "group-data-[collapsible=offcanvas]:w-0",
          "group-data-[side=right]:rotate-180",
          variant === "floating" || variant === "inset"
            ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)"
        )}
      />
      <div
        data-slot="sidebar-container"
        className={cn(
          "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex",
          side === "left"
            ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
            : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
          // Adjust the padding for floating and inset variants.
          variant === "floating" || variant === "inset"
            ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
          className
        )}
        {...props}
      >
        <div
          data-sidebar="sidebar"
          data-slot="sidebar-inner"
          className="bg-sidebar group-data-[variant=floating]:border-sidebar-border flex h-full w-full flex-col group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:shadow-sm"
        >
          {children}
        </div>
      </div>
    </div>
  )
}

function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon"
      className={cn("size-7", className)}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      <PanelLeftIcon />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
}

function SidebarRail({ className, ...props }: React.ComponentProps<"button">) {
  const { toggleSidebar } = useSidebar()

  return (
    <button
      data-sidebar="rail"
      data-slot="sidebar-rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={cn(
        "hover:after:bg-sidebar-border absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] sm:flex",
        "in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "hover:group-data-[collapsible=offcanvas]:bg-sidebar group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full",
        "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
        "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        className
      )}
      {...props}
    />
  )
}

function SidebarInset({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        "bg-background relative flex w-full flex-1 flex-col",
        "md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2",
        className
      )}
      {...props}
    />
  )
}

function SidebarInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      data-slot="sidebar-input"
      data-sidebar="input"
      className={cn("bg-background h-8 w-full shadow-none", className)}
      {...props}
    />
  )
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  )
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      data-sidebar="footer"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  )
}

function SidebarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="sidebar-separator"
      data-sidebar="separator"
      className={cn("bg-sidebar-border mx-2 w-auto", className)}
      {...props}
    />
  )
}

function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      data-sidebar="content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        className
      )}
      {...props}
    />
  )
}

function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group"
      data-sidebar="group"
      className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
      {...props}
    />
  )
}

function SidebarGroupLabel({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "div"

  return (
    <Comp
      data-slot="sidebar-group-label"
      data-sidebar="group-label"
      className={cn(
        "text-sidebar-foreground/70 ring-sidebar-ring flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium outline-hidden transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
        className
      )}
      {...props}
    />
  )
}

function SidebarGroupAction({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="sidebar-group-action"
      data-sidebar="group-action"
      className={cn(
        "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 md:after:hidden",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

function SidebarGroupContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group-content"
      data-sidebar="group-content"
      className={cn("w-full text-sm", className)}
      {...props}
    />
  )
}

function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu"
      data-sidebar="menu"
      className={cn("flex w-full min-w-0 flex-col gap-1", className)}
      {...props}
    />
  )
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      className={cn("group/menu-item relative", className)}
      {...props}
    />
  )
}

const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline:
          "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:p-0!",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function SidebarMenuButton({
  asChild = false,
  isActive = false,
  variant = "default",
  size = "default",
  tooltip,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean
  isActive?: boolean
  tooltip?: string | React.ComponentProps<typeof TooltipContent>
} & VariantProps<typeof sidebarMenuButtonVariants>) {
  const Comp = asChild ? Slot : "button"
  const { isMobile, state } = useSidebar()

  const button = (
    <Comp
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      data-size={size}
      data-active={isActive}
      className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
      {...props}
    />
  )

  if (!tooltip) {
    return button
  }

  if (typeof tooltip === "string") {
    tooltip = {
      children: tooltip,
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        side="right"
        align="center"
        hidden={state !== "collapsed" || isMobile}
        {...tooltip}
      />
    </Tooltip>
  )
}

function SidebarMenuAction({
  className,
  asChild = false,
  showOnHover = false,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean
  showOnHover?: boolean
}) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="sidebar-menu-action"
      data-sidebar="menu-action"
      className={cn(
        "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground peer-hover/menu-button:text-sidebar-accent-foreground absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 md:after:hidden",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        showOnHover &&
          "peer-data-[active=true]/menu-button:text-sidebar-accent-foreground group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 md:opacity-0",
        className
      )}
      {...props}
    />
  )
}

function SidebarMenuBadge({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-menu-badge"
      data-sidebar="menu-badge"
      className={cn(
        "text-sidebar-foreground pointer-events-none absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums select-none",
        "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

function SidebarMenuSkeleton({
  className,
  showIcon = false,
  ...props
}: React.ComponentProps<"div"> & {
  showIcon?: boolean
}) {
  // Random width between 50 to 90%.
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`
  }, [])

  return (
    <div
      data-slot="sidebar-menu-skeleton"
      data-sidebar="menu-skeleton"
      className={cn("flex h-8 items-center gap-2 rounded-md px-2", className)}
      {...props}
    >
      {showIcon && (
        <Skeleton
          className="size-4 rounded-md"
          data-sidebar="menu-skeleton-icon"
        />
      )}
      <Skeleton
        className="h-4 max-w-(--skeleton-width) flex-1"
        data-sidebar="menu-skeleton-text"
        style={
          {
            "--skeleton-width": width,
          } as React.CSSProperties
        }
      />
    </div>
  )
}

function SidebarMenuSub({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu-sub"
      data-sidebar="menu-sub"
      className={cn(
        "border-sidebar-border mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l px-2.5 py-0.5",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

function SidebarMenuSubItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-sub-item"
      data-sidebar="menu-sub-item"
      className={cn("group/menu-sub-item relative", className)}
      {...props}
    />
  )
}

function SidebarMenuSubButton({
  asChild = false,
  size = "md",
  isActive = false,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean
  size?: "sm" | "md"
  isActive?: boolean
}) {
  const Comp = asChild ? Slot : "a"

  return (
    <Comp
      data-slot="sidebar-menu-sub-button"
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground [&>svg]:text-sidebar-accent-foreground flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 outline-hidden focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
        "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
}

```

### FILE: `src/components/ui/skeleton.tsx`

```tsx
import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  )
}

export { Skeleton }

```

### FILE: `src/components/ui/slider.tsx`

```tsx
"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max]
  )

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          "bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"
        )}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            "bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
          )}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className="border-primary ring-ring/50 block size-4 shrink-0 rounded-full border bg-white shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
        />
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }

```

### FILE: `src/components/ui/sonner.tsx`

```tsx
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }

```

### FILE: `src/components/ui/spinner.tsx`

```tsx
import { Loader2Icon } from "lucide-react"

import { cn } from "@/lib/utils"

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  )
}

export { Spinner }

```

### FILE: `src/components/ui/switch.tsx`

```tsx
"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }

```

### FILE: `src/components/ui/table.tsx`

```tsx
import * as React from "react"

import { cn } from "@/lib/utils"

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}

```

### FILE: `src/components/ui/tabs.tsx`

```tsx
"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }

```

### FILE: `src/components/ui/textarea.tsx`

```tsx
import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }

```

### FILE: `src/components/ui/toggle.tsx`

```tsx
import * as React from "react"
import * as TogglePrimitive from "@radix-ui/react-toggle"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium hover:bg-muted hover:text-muted-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-input bg-transparent shadow-xs hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-9 px-2 min-w-9",
        sm: "h-8 px-1.5 min-w-8",
        lg: "h-10 px-2.5 min-w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Toggle({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }

```

### FILE: `src/components/ui/toggle-group.tsx`

```tsx
import * as React from "react"
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group"
import { type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { toggleVariants } from "@/components/ui/toggle"

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants> & {
    spacing?: number
  }
>({
  size: "default",
  variant: "default",
  spacing: 0,
})

function ToggleGroup({
  className,
  variant,
  size,
  spacing = 0,
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleVariants> & {
    spacing?: number
  }) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      style={{ "--gap": spacing } as React.CSSProperties}
      className={cn(
        "group/toggle-group flex w-fit items-center gap-[--spacing(var(--gap))] rounded-md data-[spacing=default]:data-[variant=outline]:shadow-xs",
        className
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size, spacing }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  )
}

function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> &
  VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext)

  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={context.variant || variant}
      data-size={context.size || size}
      data-spacing={context.spacing}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        "w-auto min-w-0 shrink-0 px-3 focus:z-10 focus-visible:z-10",
        "data-[spacing=0]:rounded-none data-[spacing=0]:shadow-none data-[spacing=0]:first:rounded-l-md data-[spacing=0]:last:rounded-r-md data-[spacing=0]:data-[variant=outline]:border-l-0 data-[spacing=0]:data-[variant=outline]:first:border-l",
        className
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  )
}

export { ToggleGroup, ToggleGroupItem }

```

### FILE: `src/components/ui/tooltip.tsx`

```tsx
"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  )
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  )
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-foreground text-background animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance",
          className
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="bg-foreground fill-foreground z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }

```


## DOCUMENTATION

### FILE: `README.md`

```markdown
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

```

### FILE: `PIPELINE_FULL_SPEC.md`

```markdown
# Zepp Watchface Generator â€” Complete Pipeline Specification

> **Purpose:** Self-contained document to reproduce the ENTIRE pipeline from scratch using any AI agent.
> **Target:** Amazfit Balance 2 (480Ã—480 round screen, Zepp OS V2)
> **Stack:** TypeScript 5.x, React, Vite, vitest

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Type System](#2-type-system)
3. [Pipeline Stages](#3-pipeline-stages)
4. [Stage 0: AI Vision Extraction](#4-stage-0-ai-vision-extraction)
5. [Stage 0.5: Representation Corrector](#5-stage-05-representation-corrector)
6. [Stage 1: Normalizer](#6-stage-1-normalizer)
7. [Stage 1.5: Semantic Priority](#7-stage-15-semantic-priority)
8. [Stage 2: Layout Engine](#8-stage-2-layout-engine)
9. [Stage 3: Geometry Solver](#9-stage-3-geometry-solver)
10. [Stage 4: Asset Resolver](#10-stage-4-asset-resolver)
11. [Stage 5: V2 Bridge & Code Generation](#11-stage-5-v2-bridge--code-generation)
12. [Validators](#12-validators)
13. [Constants (Single Source of Truth)](#13-constants-single-source-of-truth)
14. [Pipeline Orchestrator](#14-pipeline-orchestrator)
15. [ZPK Packaging](#15-zpk-packaging)
16. [Test Patterns](#16-test-patterns)
17. [Known Pitfalls](#17-known-pitfalls)

---

## 1. Architecture Overview

```
User uploads watchface design image
         â†“
Stage 0: AI Vision API â†’ AIElement[] (semantic + representation, NO coordinates)
         â†“
Stage 0.5: correctRepresentation() â€” fix AI arc collapse (deterministic, <5ms)
         â†“
Validate: validateAIOutput()
         â†“
Stage 1: normalize() â€” representation â†’ ZeppWidget mapping (code) or normalizeWithAI()
         â†“
Validate: validateNormalized()
         â†“
Stage 1.5: sortArcsByPriority() â€” semantic visual hierarchy
         â†“
Stage 2: applyLayout() â€” group zones + layout mode â†’ anchor points (centerX, centerY)
         â†“
Validate: validateLayout()
         â†“
Stage 3: solveGeometry() â€” SIZE, SHAPE, SPATIAL INTELLIGENCE (radius, sweep, bbox)
         â†“
Validate: validateGeometry()
         â†“
Stage 4: resolveAssets() â€” widget â†’ asset file paths
         â†“
Stage 5: bridgeToWatchFaceConfig() â†’ generateWatchFaceCodeV2() â†’ {app.json, app.js, watchface/index.js}
         â†“
buildZPK() â†’ downloadable .zpk file
```

**Key Design Principles:**
- Each stage validates input before passing downstream
- AI is optional: code fallbacks always available
- No stage combines two responsibilities
- Coordinates are NEVER in AI output â€” only computed in Layout + Geometry
- **Representation drives widget selection**, not type alone
- Maximum 2 ARC_PROGRESS widgets (hardware/layout constraint)

---

## 2. Type System

File: `src/types/pipeline.ts`

### Enums/Unions

```typescript
type Representation = 'text' | 'arc' | 'icon' | 'text+icon' | 'text+arc' | 'number';

type LayoutMode = 'row' | 'arc' | 'standalone' | 'grid';

type Group =
  | 'center' | 'top' | 'bottom'
  | 'left_panel' | 'right_panel'
  | 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right';

type AIElementType =
  | 'time' | 'date' | 'steps' | 'battery' | 'heart_rate'
  | 'arc' | 'text' | 'weather' | 'spo2' | 'calories' | 'distance'
  | 'weekday' | 'month';

type ZeppWidget =
  | 'TIME_POINTER' | 'IMG_TIME' | 'IMG_DATE' | 'IMG_WEEK'
  | 'ARC_PROGRESS' | 'TEXT' | 'TEXT_IMG' | 'IMG' | 'IMG_STATUS' | 'IMG_LEVEL';
```

### Stage Interfaces (Progressive Enhancement)

```typescript
// Stage 0: AI output â€” semantic only, NO coordinates
interface AIElement {
  id: string;
  type: AIElementType;
  representation: Representation;
  layout: LayoutMode;
  group: Group;
  importance?: 'primary' | 'secondary';
  confidence?: number;
}

// Stage 1: Widget type assigned
interface NormalizedElement {
  id: string;
  widget: ZeppWidget;
  group: Group;
  layout: LayoutMode;
  sourceType: AIElementType;
  dataType?: string;          // e.g. 'BATTERY', 'STEP', 'HEART'
  parentId?: string;          // for compound-expanded elements
}

// Stage 2: Anchor point computed
interface LayoutElement extends NormalizedElement {
  centerX: number;
  centerY: number;
}

// Stage 3: Full spatial data
interface GeometryElement extends LayoutElement {
  // TIME_POINTER
  posX?: number; posY?: number;
  hourPosX?: number; hourPosY?: number;
  minutePosX?: number; minutePosY?: number;
  secondPosX?: number; secondPosY?: number;
  // ARC_PROGRESS
  radius?: number; startAngle?: number; endAngle?: number; lineWidth?: number;
  // Rectangular widgets
  x?: number; y?: number; w?: number; h?: number;
}

// Stage 4: Asset paths added
interface ResolvedElement extends GeometryElement {
  assets: ResolvedAssets;
}

interface ResolvedAssets {
  src?: string;
  fontArray?: string[];
  hourHandSrc?: string; minuteHandSrc?: string; secondHandSrc?: string; coverSrc?: string;
  weekArray?: string[];
  monthArray?: string[];
  imageArray?: string[];
}
```

### Validation Error

```typescript
class PipelineValidationError extends Error {
  stage: string;
  violations: string[];
  constructor(stage: string, violations: string[]) {
    super(`[Pipeline:${stage}] Validation failed:\n${violations.map(v => `  - ${v}`).join('\n')}`);
    this.name = 'PipelineValidationError';
    this.stage = stage;
    this.violations = violations;
  }
}
```

---

## 3. Pipeline Stages

| Stage | Function | Input | Output | Deterministic? |
|-------|----------|-------|--------|----------------|
| 0 | `extractElementsFromImage()` | Image + API key | `AIElement[]` | No (AI) |
| 0.5 | `correctRepresentation()` | `AIElement[]` | `AIElement[]` | Yes |
| Validate | `validateAIOutput()` | `AIElement[]` | throws or void | Yes |
| 1 | `normalize()` or `normalizeWithAI()` | `AIElement[]` | `NormalizedElement[]` | Yes (code) / No (AI) |
| Validate | `validateNormalized()` | `NormalizedElement[]` | throws or void | Yes |
| 1.5 | `sortArcsByPriority()` | `NormalizedElement[]` | `NormalizedElement[]` | Yes |
| 2 | `applyLayout()` | `NormalizedElement[]` | `LayoutElement[]` | Yes |
| Validate | `validateLayout()` | `LayoutElement[]` | throws or void | Yes |
| 3 | `solveGeometry()` | `LayoutElement[]` | `GeometryElement[]` | Yes |
| Validate | `validateGeometry()` | `GeometryElement[]` | throws or void | Yes |
| 4 | `resolveAssets()` | `GeometryElement[]` | `ResolvedElement[]` | Yes |
| 5 | `bridgeToWatchFaceConfig()` + `generateWatchFaceCodeV2()` | `ResolvedElement[]` | Code files | Yes |

---

## 4. Stage 0: AI Vision Extraction

File: `src/pipeline/pipelineAIService.ts`

**What it does:** Sends watchface design image to Gemini/OpenAI vision API. Returns semantic element list.

**Key contract:** AI outputs `{id, type, representation, layout, group, importance, confidence}` â€” **NO coordinates, NO sizes**.

**Retry logic:**
- `MAX_RETRIES = 3`
- `RETRY_BASE_MS = 1000` (1s â†’ 2s â†’ 4s exponential backoff)
- `RETRYABLE_STATUS = [429, 503]` (rate limit + unavailable)

**API call:** `POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`

**Functions:**
- `extractElementsFromImage(provider, apiKey, image)` â†’ `AIElement[]`
- `normalizeWithAI(config, elements)` â†’ `NormalizedElement[]` (optional Stage 1 AI path)
- `resolveAmbiguities(config, elements)` â†’ assigns `dataType` to unresolved arcs

---

## 5. Stage 0.5: Representation Corrector

File: `src/pipeline/representationCorrector.ts`

**Problem solved:** AI frequently collapses ALL elements to `representation: 'arc'`, producing 10 ARC_PROGRESS widgets (unusable on 480px screen).

**Constants:**
```typescript
MAX_ARCS = 2;                    // Hardware/layout constraint
ARC_LAYOUT_THRESHOLD = 3;        // Layout fix trigger

TYPE_DEFAULT_REPRESENTATION = {
  steps:      'text+icon',
  battery:    'text+icon',
  heart_rate: 'text+icon',
  spo2:       'text',
  calories:   'text',
};

CENTER_TYPES = Set(['time']);
TOP_TYPES = Set(['date', 'weekday', 'month']);
```

**5 Rules (applied in order):**

| Rule | Name | Always? | Logic |
|------|------|---------|-------|
| 1 | Arc Limit | âœ… Yes | Count arcs. Keep first 2, downgrade rest to `text`/`row` |
| 2 | Layout Feasibility | âœ… Yes | If arc-layout count > 3, keep up to 2 primary as arc, convert rest to `row` |
| 3 | Group Redistribution | Only if collapsed | If all `center`, reassign: timeâ†’center, date/weekday/monthâ†’top, dataâ†’right_panel |
| 4 | Type Overrides | Only if collapsed | Known data types get correct representation from `TYPE_DEFAULT_REPRESENTATION` |
| 5 | Decorative Detection | Only if collapsed | Non-data-type arcs â†’ `icon`/`standalone` |

**"Collapsed" detection:** `isCollapsed = originalArcCount > MAX_ARCS`

Rules 1-2 always run. Rules 3-5 only run when collapse is detected (prevents over-correcting legitimate designs).

**Complete implementation:**

```typescript
export function correctRepresentation(elements: AIElement[]): AIElement[] {
  let corrected = elements.map(el => ({ ...el }));   // deep copy

  const originalArcCount = elements.filter(el => el.representation === 'arc').length;
  const isCollapsed = originalArcCount > MAX_ARCS;

  corrected = applyArcLimit(corrected);            // Rule 1: always
  corrected = applyLayoutFix(corrected);           // Rule 2: always

  if (isCollapsed) {
    corrected = applyGroupRedistribution(corrected); // Rule 3
    corrected = applyTypeOverrides(corrected);       // Rule 4
    corrected = applyDecorativeDetection(corrected); // Rule 5
  }

  return corrected;
}
```

---

## 6. Stage 1: Normalizer

File: `src/pipeline/normalizer.ts`

**Key rule: Representation drives widget selection, NOT type alone.**

### Core Mapping Function

```typescript
function mapByRepresentation(type: AIElementType, representation: Representation): ZeppWidget | ZeppWidget[] {
  // Time: analog vs digital
  if (type === 'time') return representation === 'arc' ? 'TIME_POINTER' : 'IMG_TIME';

  // Date/weekday/month: always image-based
  if (type === 'date') return 'IMG_DATE';
  if (type === 'weekday') return 'IMG_WEEK';
  if (type === 'month') return 'IMG_DATE';

  // Data elements: BRANCH ON REPRESENTATION
  if (representation === 'arc') return 'ARC_PROGRESS';
  if (representation === 'text') return 'TEXT_IMG';
  if (representation === 'number') return 'TEXT_IMG';
  if (representation === 'icon') return 'IMG';
  if (representation === 'text+icon') return ['TEXT_IMG', 'IMG'];       // compound â†’ 2 widgets
  if (representation === 'text+arc') return ['ARC_PROGRESS', 'TEXT_IMG']; // compound â†’ 2 widgets

  return 'TEXT'; // fallback
}
```

### Data Type Binding

```typescript
const TYPE_TO_DATA_TYPE = {
  steps:      'STEP',
  battery:    'BATTERY',
  heart_rate: 'HEART',
  spo2:       'SPO2',
  calories:   'CAL',
  distance:   'DISTANCE',
  weather:    'WEATHER_CURRENT',
};
```

### Compound Expansion
- `text+icon` â†’ produces 2 elements: `[TEXT_IMG, IMG]`
- `text+arc` â†’ produces 2 elements: `[ARC_PROGRESS, TEXT_IMG]`
- Second element gets `parentId` pointing to first
- IDs: `{originalId}_0`, `{originalId}_1`
- Cap: `COMPOUND_CAP = 2`

### Arc Fallback
Generic `type: 'arc'` elements get dataType from: `['BATTERY', 'STEP', 'HEART', 'SPO2', 'CAL']` (first unused).

---

## 7. Stage 1.5: Semantic Priority

File: `src/pipeline/semanticPriority.ts`

**Purpose:** Controls visual hierarchy for concentric arc stacking.

```typescript
// Lower number = more prominent (outermost, thickest, longest sweep)
PRIORITY_MAP = {
  STEP: 0, BATTERY: 1, HEART: 2, CAL: 3, SPO2: 4, DISTANCE: 5
};

// Mock fill values (0â€“1) for design-time sweep
MOCK_VALUES = {
  STEP: 0.70, BATTERY: 0.50, HEART: 0.65, CAL: 0.40, SPO2: 0.95, DISTANCE: 0.30
};
```

`sortArcsByPriority()` moves ARC_PROGRESS elements to front, sorted by priority. Non-arc elements keep original order, appended after.

---

## 8. Stage 2: Layout Engine

File: `src/pipeline/layoutEngine.ts`

**Purpose:** Assigns `centerX` and `centerY` based on group zone + layout mode.

### Group Zones (480Ã—480 screen)

```typescript
GROUP_ZONES = {
  center:       { x: 140, y: 140, w: 200, h: 200 },
  top:          { x: 140, y: 20,  w: 200, h: 120 },
  bottom:       { x: 140, y: 340, w: 200, h: 120 },
  left_panel:   { x: 20,  y: 100, w: 200, h: 280 },
  right_panel:  { x: 260, y: 100, w: 200, h: 280 },
  top_left:     { x: 20,  y: 20,  w: 200, h: 200 },
  top_right:    { x: 260, y: 20,  w: 200, h: 200 },
  bottom_left:  { x: 20,  y: 260, w: 200, h: 200 },
  bottom_right: { x: 260, y: 260, w: 200, h: 200 },
};
```

### Layout Rules by Mode

| Mode | Positioning |
|------|-------------|
| `arc` | Center-lock at screen center (240, 240) |
| `row` | Vertical stack within zone. Auto-compresses spacing when too many elements. Clamps to [0, 480]. |
| `standalone` | Center of zone |
| `grid` | (Future) Treated as standalone |

### Row Layout â€” Overflow Protection

```typescript
const ROW_HEIGHT = 48;
const ROW_PADDING = 8;

// Compress spacing if elements overflow zone
const availableH = zone.h - ROW_PADDING * 2;
const idealTotal = rowEls.length * ROW_HEIGHT;
const rowStep = idealTotal <= availableH
  ? ROW_HEIGHT
  : Math.max(20, Math.floor(availableH / rowEls.length));

// Clamp Y to screen bounds
const clampedY = Math.min(Math.max(rawY, 0), 480);
```

---

## 9. Stage 3: Geometry Solver

File: `src/pipeline/geometrySolver.ts`

**Ownership:** Controls SIZE, SHAPE, and SPATIAL INTELLIGENCE. Layout Engine only controls WHERE (anchor).

### Arc Stacking (Concentric Rings)

Elements arrive pre-sorted by semantic priority.

```typescript
// Per-arc:
const priority = getPriority(el.dataType);       // 0=outermost
const mockValue = getMockValue(el.dataType);      // 0â€“1 fill

const radius = ARC_BASE_RADIUS - (priority * ARC_SPACING);    // 180 - (p * 25)
const sweep = mockValue * ARC_MAX_SWEEP;                       // fill * 300Â°
const lineWidth = max(ARC_LINE_WIDTH - (priority * ARC_LINE_WIDTH_STEP), 4); // 12 - (p * 2)
const startAngle = 135;
```

### Constants

```typescript
ARC_BASE_RADIUS = 180;
ARC_SPACING = 25;           // px between rings
ARC_LINE_WIDTH = 12;        // base thickness (priority 0)
ARC_LINE_WIDTH_STEP = 2;    // decrease per priority level
ARC_START_ANGLE = 135;      // degrees
ARC_MAX_SWEEP = 300;        // max sweep angle
```

### TIME_POINTER / IMG_TIME â€” Calibrated Offset

```typescript
TIME_CENTER_X = 140;   // NOT screen center â€” calibrated from real watchfaces
TIME_CENTER_Y = 240;

HAND_DIMENSIONS = {
  hour:   { w: 22, h: 140 },
  minute: { w: 16, h: 200 },
  second: { w: 6,  h: 240 },
};
```

### Widget-Specific Solvers

| Widget | Solver | Key Logic |
|--------|--------|-----------|
| `ARC_PROGRESS` | Priority stacking | radius/sweep/thickness from priority |
| `TIME_POINTER` | Calibrated override | centerX=140, hand pivot from dimensions |
| `IMG_TIME` | Calibrated override | x=140, w=250 (HH:gap:MM) |
| `IMG_DATE` | Center in zone | w=72 (2 digits) or 100 (month label) |
| `IMG_WEEK` | Center in zone | w=100, h=36 |
| `IMG_LEVEL` | Center in zone | w=60, h=60 (weather icon) |
| `TEXT_IMG` | Rectangular | w=160, h=50 |
| `TEXT` | Rectangular | w=200, h=40 |
| `IMG` | Rectangular | w=60, h=60 |

### Asset Dimensions (from constants.ts)

```typescript
TIME_DIGIT     = { w: 60, h: 90 };    // time_digit_N.png
DATE_DIGIT     = { w: 36, h: 54 };    // date_digit_N.png
MONTH_LABEL    = { w: 100, h: 36 };   // month_N.png
WEEK_LABEL     = { w: 100, h: 36 };   // week_N.png
WEATHER_ICON   = { w: 60, h: 60 };    // weather_N.png
TEXT_IMG_DIGIT  = { w: 28, h: 44 };   // *_digit_N.png
```

---

## 10. Stage 4: Asset Resolver

File: `src/pipeline/assetResolver.ts`

Maps widget types to file path arrays. NO dynamic generation â€” fixed, known assets.

### Asset Mapping

| Widget | Assets |
|--------|--------|
| `TIME_POINTER` | `hour_hand.png`, `minute_hand.png`, `second_hand.png`, `hand_cover.png` |
| `IMG_TIME` | `time_digit_0.png` â€¦ `time_digit_9.png` |
| `IMG_DATE` | `date_digit_0.png` â€¦ `date_digit_9.png` |
| `IMG_DATE` (month) | `month_0.png` â€¦ `month_11.png` |
| `IMG_WEEK` | `week_0.png` â€¦ `week_6.png` |
| `TEXT_IMG` | `{prefix}_digit_0.png` â€¦ `{prefix}_digit_9.png` |
| `IMG_LEVEL` (weather) | `weather_0.png` â€¦ `weather_28.png` |
| `ARC_PROGRESS` | No image assets (uses color) |

### Data Type â†’ Digit Prefix

```typescript
DATA_TYPE_DIGIT_PREFIX = {
  BATTERY: 'batt_digit', STEP: 'step_digit', HEART: 'heart_digit',
  SPO2: 'spo2_digit', CAL: 'cal_digit', DISTANCE: 'dist_digit'
};
```

---

## 11. Stage 5: V2 Bridge & Code Generation

### Bridge: ResolvedElement[] â†’ WatchFaceConfig

File: `src/pipeline/index.ts` (bridgeToWatchFaceConfig function)

Converts pipeline output to `WatchFaceConfig` shape expected by V2 code generator.

**Key mappings:**
- `TIME_POINTER` â†’ center-based, full-screen bounds, hand sources + pivot points
- `ARC_PROGRESS` â†’ center-based, full-screen bounds, radius/angles/lineWidth/color
- `IMG_TIME/IMG_DATE/IMG_WEEK` â†’ bbox from geometry, font/image arrays
- `TEXT_IMG` â†’ bbox from geometry, font array + dataType
- `IMG/IMG_STATUS/IMG_LEVEL` â†’ bbox from geometry, src or image array

**Arc Colors:**
```typescript
ARC_COLORS = {
  BATTERY: '0x00CC88', STEP: '0xFFD93D', HEART: '0xFF6B6B',
  SPO2: '0xEE5A24', CAL: '0xFF9F43', DISTANCE: '0x54A0FF'
};
```

**Name routing:** V2 generator uses `name.includes('time')`, `name.includes('date')`, etc. Names MUST contain these keywords for routing but TEXT_IMG/IMG names must NOT contain them.

### V2 Code Generator

File: `src/lib/jsCodeGeneratorV2.ts`

Generates 3 files:
1. **app.json** â€” V2 manifest (`configVersion: "v3"`, `targets.default.module.watchface.path`)
2. **app.js** â€” Boilerplate runtime
3. **watchface/index.js** â€” Widget instantiation with NORMAL and AOD modes

**Output format:** Zepp OS V2 for Amazfit Balance 2 (480Ã—480 round).

All coordinates wrapped in `px()` function. `show_level: hmUI.show_level.ALL` for AOD support.

---

## 12. Validators

File: `src/pipeline/validators.ts`

### Allowed Values

```typescript
VALID_AI_TYPES = ['time','date','steps','battery','heart_rate','arc','text','weather','spo2','calories','distance','weekday','month'];
VALID_REPRESENTATIONS = ['text','arc','icon','text+icon','text+arc','number'];
VALID_LAYOUT_MODES = ['row','arc','standalone','grid'];
VALID_GROUPS = ['center','top','bottom','left_panel','right_panel','top_left','top_right','bottom_left','bottom_right'];
VALID_WIDGETS = ['TIME_POINTER','IMG_TIME','IMG_DATE','IMG_WEEK','ARC_PROGRESS','TEXT','TEXT_IMG','IMG','IMG_STATUS','IMG_LEVEL'];
MAX_ELEMENTS = 20;
```

### Stage Validators

| Validator | Checks |
|-----------|--------|
| `validateAIOutput()` | Array not empty, â‰¤20 elements, unique IDs, valid type/representation/layout/group, confidence 0â€“1 |
| `validateNormalized()` | Valid widget, valid group, valid layout |
| `validateLayout()` | centerX/centerY are numbers, within [0, 480] |
| `validateGeometry()` | TIME_POINTER has all 3 hand positions, ARC has radius+angles, rect widgets have x/y |

---

## 13. Constants (Single Source of Truth)

File: `src/pipeline/constants.ts`

```typescript
export const SCREEN = { W: 480, H: 480, CX: 240, CY: 240 };

// Group Zones â€” 9 regions on 480Ã—480 screen
export const GROUP_ZONES = {
  center:       { x: 140, y: 140, w: 200, h: 200 },
  top:          { x: 140, y: 20,  w: 200, h: 120 },
  bottom:       { x: 140, y: 340, w: 200, h: 120 },
  left_panel:   { x: 20,  y: 100, w: 200, h: 280 },
  right_panel:  { x: 260, y: 100, w: 200, h: 280 },
  top_left:     { x: 20,  y: 20,  w: 200, h: 200 },
  top_right:    { x: 260, y: 20,  w: 200, h: 200 },
  bottom_left:  { x: 20,  y: 260, w: 200, h: 200 },
  bottom_right: { x: 260, y: 260, w: 200, h: 200 },
};

// Asset dimensions
export const TIME_DIGIT     = { w: 60, h: 90 };
export const DATE_DIGIT     = { w: 36, h: 54 };
export const MONTH_LABEL    = { w: 100, h: 36 };
export const WEEK_LABEL     = { w: 100, h: 36 };
export const WEATHER_ICON   = { w: 60, h: 60 };
export const TEXT_IMG_DIGIT  = { w: 28, h: 44 };

// Derived
export const HOUR_CONTENT_W   = 120;   // TIME_DIGIT.w * 2
export const MINUTE_CONTENT_W = 120;
export const TIME_COLON_GAP   = 10;
export const TIME_TOTAL_W     = 250;   // 120 + 10 + 120
export const DAY_CONTENT_W    = 72;    // DATE_DIGIT.w * 2
export const DATE_MONTH_GAP   = 10;

// Arc config
export const ARC_BASE_RADIUS     = 180;
export const ARC_SPACING         = 25;
export const ARC_LINE_WIDTH      = 12;
export const ARC_LINE_WIDTH_STEP = 2;
export const ARC_START_ANGLE     = 135;
export const ARC_MAX_SWEEP       = 300;
```

---

## 14. Pipeline Orchestrator

File: `src/pipeline/index.ts`

```typescript
async function runPipeline(aiOutput: AIElement[], options: PipelineOptions): Promise<PipelineResult> {
  // Stage A: Validate
  validateAIOutput(aiOutput);

  // Stage 0.5: Fix arc collapse
  const corrected = correctRepresentation(aiOutput);

  // Stage 1: Normalize (AI or code fallback)
  let normalized: NormalizedElement[];
  if (options.aiConfig) {
    try { normalized = await normalizeWithAI(options.aiConfig, corrected); }
    catch { normalized = normalize(corrected); }
  } else {
    normalized = normalize(corrected);
  }
  validateNormalized(normalized);

  // Call 3: Resolve unresolved arc dataTypes
  // ... (same pattern: AI attempt â†’ code fallback)

  // Stage 1.5: Sort arcs by priority
  normalized = sortArcsByPriority(normalized);

  // Stage 2: Layout
  const layouted = applyLayout(normalized);
  validateLayout(layouted);

  // Stage 3: Geometry
  const geometry = solveGeometry(layouted);
  validateGeometry(geometry);

  // Stage 4: Assets
  const resolved = resolveAssets(geometry);

  // Stage 5: Bridge + Code Gen
  const config = bridgeToWatchFaceConfig(resolved, options);
  const code = generateWatchFaceCodeV2(config);

  return { config, code, resolved };
}
```

**Pipeline Options:**
```typescript
interface PipelineOptions {
  watchfaceName?: string;      // default: 'AI Watchface'
  watchModel?: string;         // default: 'Balance 2'
  backgroundSrc?: string;      // default: 'background.png'
  aiConfig?: { provider: 'gemini' | 'openai'; apiKey: string };
  onProgress?: (message: string) => void;
}
```

---

## 15. ZPK Packaging

File: `src/lib/zpkBuilder.ts`

Packages code + assets into `.zpk` (Zepp Package Kit):
- Creates `device.zip` containing: `app.js`, `app.json`, `watchface/index.js`, `assets/*`
- Creates `app-side.zip` with companion app
- Nests both in outer `.zpk` file
- Uses JSZip library

---

## 16. Test Patterns

All tests use `vitest`. File location: `src/pipeline/__tests__/`

### Test Suites

| Test File | Elements | What it verifies |
|-----------|----------|------------------|
| `pipeline-corrector-zpk60.test.ts` | 10 all-arc elements | Corrector fixes collapse: not all arcs, groups redistributed, mixed widgets |
| `pipeline-corrector-arc-regression.test.ts` | 2 arcs (legitimate) | No corrections applied, arcs stay as arcs |
| `pipeline-corrector-text-regression.test.ts` | 3 text elements | No corrections applied, layout/group unchanged |
| `pipeline-corrector-mixed-regression.test.ts` | 2 arcs + 3 texts | No corrections, produces 2 ARC_PROGRESS + 3 TEXT_IMG |
| `pipeline-arc-only.test.ts` | 2 arc elements | Full pipeline: ARC_PROGRESS with correct priority stacking |
| `pipeline-text-only.test.ts` | 3 text elements | Full pipeline: TEXT_IMG with row layout |
| `pipeline-mixed.test.ts` | Mix of types | Full pipeline: produces correct mixed widget types |
| `pipeline-zpk-reference.test.ts` | Real ZPK reference data | Full pipeline matches reference output |

### Test Pattern

```typescript
import { describe, it, expect } from 'vitest';
import type { AIElement } from '@/types/pipeline';
import { correctRepresentation } from '../representationCorrector';
import { normalize } from '../normalizer';

const TEST_INPUT: AIElement[] = [
  { id: 'battery_arc', type: 'battery', representation: 'arc', layout: 'arc', group: 'center', importance: 'primary', confidence: 0.95 },
  // ... more elements
];

describe('Test name', () => {
  it('specific assertion', () => {
    const corrected = correctRepresentation(TEST_INPUT);
    const normalized = normalize(corrected);
    expect(normalized.some(e => e.widget === 'ARC_PROGRESS')).toBe(true);
  });
});
```

---

## 17. Known Pitfalls

### Critical Bugs Fixed

| Bug | Root Cause | Fix |
|-----|-----------|------|
| AI collapses all to arcs | AI model bias toward arc representation | Representation Corrector (5 rules) |
| Row overflow (centerY > 480) | Fixed 48px spacing Ã— 8+ elements | Auto-compress spacing + clamp to screen |
| Rule 4 too aggressive | `applyTypeOverrides` fired on legitimate designs | `isCollapsed` guard (Rules 3-5 conditional) |
| TIME_POINTER split to 3 widgets | Implemented as separate hour/minute/second | ONE widget handles all 3 hands |

### Design Decisions

1. **MAX_ARCS = 2** â€” More than 2 concentric arcs become illegible on 480px
2. **Representation > Type** â€” `type: 'battery'` can be arc OR text+icon depending on design
3. **Calibrated time offset** â€” TIME_CENTER_X=140, not screen center (matches real watchfaces)
4. **Compound expansion cap = 2** â€” `text+icon` â†’ max 2 widgets, prevents explosion
5. **Code fallback always available** â€” Every AI stage has deterministic fallback

### File Structure

```
src/
  types/
    pipeline.ts          # All type definitions
    index.ts             # WatchFaceConfig, WatchFaceElement, etc.
  pipeline/
    index.ts             # Orchestrator (runPipeline)
    constants.ts         # Screen/zone/dimension constants
    validators.ts        # Stage gate-keepers
    representationCorrector.ts  # Fix AI arc collapse
    normalizer.ts        # Representation â†’ widget mapping
    semanticPriority.ts  # Arc visual hierarchy
    layoutEngine.ts      # Group zone positioning
    geometrySolver.ts    # Size/shape/spatial intelligence
    assetResolver.ts     # Widget â†’ asset file paths
    pipelineAIService.ts # AI API integration
    aiPrompt.ts          # AI prompt schemas
    assetImageGenerator.ts # Canvas-drawn PNG assets
    __tests__/           # All test files
  lib/
    jsCodeGeneratorV2.ts # Zepp OS V2 code generation
    jsCodeGenerator.ts   # V2/V3 router
    zpkBuilder.ts        # ZPK packaging
    assetGenerator.ts    # Legacy asset generator
    aiService.ts         # Legacy AI wrapper
```

---

## How to Reproduce This Pipeline

1. **Create type system first** (`types/pipeline.ts`) â€” all interfaces, unions, error class
2. **Create constants** (`pipeline/constants.ts`) â€” single source of truth
3. **Create validators** (`pipeline/validators.ts`) â€” stage contracts
4. **Create normalizer** (`pipeline/normalizer.ts`) â€” `mapByRepresentation()` function
5. **Create representation corrector** (`pipeline/representationCorrector.ts`) â€” 5 rules
6. **Create semantic priority** (`pipeline/semanticPriority.ts`) â€” priority map + sort
7. **Create layout engine** (`pipeline/layoutEngine.ts`) â€” group zones + layout modes
8. **Create geometry solver** (`pipeline/geometrySolver.ts`) â€” arc stacking + widget solvers
9. **Create asset resolver** (`pipeline/assetResolver.ts`) â€” widget â†’ file paths
10. **Create pipeline orchestrator** (`pipeline/index.ts`) â€” chains all stages
11. **Create V2 code generator** (`lib/jsCodeGeneratorV2.ts`) â€” Zepp OS output
12. **Create ZPK builder** (`lib/zpkBuilder.ts`) â€” package for download
13. **Write tests** â€” one per stage, plus regression tests

Each step depends only on previous steps. Build bottom-up: types â†’ constants â†’ validators â†’ individual stages â†’ orchestrator â†’ code gen â†’ packaging.

```


## REFERENCE CODE FILES


---

## FILE INDEX (Table of Contents)

| Section | Files |
|---------|-------|
| Config | package.json, tsconfig.json, vite.config.ts, tailwind.config.js, etc. |
| Types | src/types/index.ts, src/types/pipeline.ts |
| Pipeline Core | 12 files in src/pipeline/ |
| Pipeline Tests | 8 test suites in src/pipeline/__tests__/ |
| Lib Modules | 10 files in src/lib/ (code gen, zpk builder, AI service, etc.) |
| React App | src/main.tsx, src/App.tsx, src/WatchFaceContext.tsx, etc. |
| Components | 8 custom components in src/components/ |
| UI Components | 50+ shadcn/ui components in src/components/ui/ |
| Docs | README, DEPLOYMENT_PROTOCOL, PIPELINE_FULL_SPEC, API_REFERENCE |
| Reference | working_ref.js, current_gen.js |

## HOW TO RECREATE THIS PROJECT

1. Create new Vite + React + TypeScript project
2. Install dependencies from package.json
3. Copy all source files maintaining the directory structure
4. Run `npm run dev` for development
5. Run `npm run build` to build
6. Copy `dist/` to `docs/` for GitHub Pages deployment
7. Push to GitHub with Pages enabled on `/docs` folder

## END OF PROJECT COMPLETE REPO FILE
