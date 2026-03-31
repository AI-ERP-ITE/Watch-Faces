// Watch Face Creator Types

export interface WatchFaceElement {
  id: string;
  type: 'TIME_POINTER' | 'IMG_LEVEL' | 'TEXT' | 'IMG' | 'ARC_PROGRESS' | 'CIRCLE';
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
